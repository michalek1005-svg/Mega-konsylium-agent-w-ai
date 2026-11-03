'use strict';
/*
 * Web Push z komputera do iPada (powiadomienia w tle, decyzja Michała 3.11.2026).
 * iPad (ikona na ekranie początkowym, https) zapisuje subskrypcję; komputer wysyła krótką wiadomość
 * do usługi powiadomień Apple, a ta budzi iPada. Treść jest szyfrowana end-to-end (RFC 8291, aes128gcm):
 * Apple widzi tylko, że wysłano powiadomienie, nie jego treść. Uwierzytelnienie nadawcy: VAPID (RFC 8292, ES256).
 * Tylko node:crypto i node:https, bez zewnętrznych bibliotek.
 */
const crypto = require('node:crypto');
const https = require('node:https');

const b64u = (b) => Buffer.from(b).toString('base64url');
const zB64u = (s) => Buffer.from(String(s || ''), 'base64url');

// Dozwolone usługi powiadomień (bez tego subskrypcja mogłaby kazać komputerowi łączyć się dokądkolwiek)
const USLUGI = [/^web\.push\.apple\.com$/, /(^|\.)push\.apple\.com$/, /^fcm\.googleapis\.com$/, /^updates\.push\.services\.mozilla\.com$/, /\.notify\.windows\.com$/];
function dozwolonyAdres(endpoint, dodatkowe = []) {
  let u; try { u = new URL(endpoint); } catch { return false; }
  if (u.protocol !== 'https:' || u.username || u.password) return false;
  return [...USLUGI, ...dodatkowe].some((r) => r.test(u.hostname));
}

/** Para kluczy VAPID: { publiczny (base64url, 65 B), prywatnyPem }. */
function noweKluczeVapid() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', { namedCurve: 'prime256v1' });
  const j = publicKey.export({ format: 'jwk' });
  return { publiczny: b64u(Buffer.concat([Buffer.from([4]), zB64u(j.x), zB64u(j.y)])), prywatnyPem: privateKey.export({ type: 'pkcs8', format: 'pem' }) };
}

function naglowekVapid(endpoint, vapid, kontakt, teraz = Date.now()) {
  const aud = new URL(endpoint).origin;
  const glowa = b64u(JSON.stringify({ typ: 'JWT', alg: 'ES256' }));
  const tresc = b64u(JSON.stringify({ aud, exp: Math.floor(teraz / 1000) + 12 * 3600, sub: kontakt }));
  const podpis = crypto.sign('sha256', Buffer.from(glowa + '.' + tresc), { key: vapid.prywatnyPem, dsaEncoding: 'ieee-p1363' });
  return `vapid t=${glowa}.${tresc}.${b64u(podpis)}, k=${vapid.publiczny}`;
}

const hmac = (klucz, dane) => crypto.createHmac('sha256', klucz).update(dane).digest();

/**
 * Szyfrowanie treści wg RFC 8291 (Message Encryption for Web Push) + RFC 8188 (aes128gcm), jeden rekord.
 * @param {Buffer} tekst  @param {string} p256dh klucz iPada (base64url)  @param {string} auth sekret iPada (base64url)
 * @param {{sol?: Buffer, nadawca?: crypto.ECDH}} [test] stałe wartości do testu z RFC 8291 dodatek A
 */
function zaszyfruj(tekst, p256dh, auth, test = {}) {
  const uaPub = zB64u(p256dh), sekret = zB64u(auth);
  if (uaPub.length !== 65 || uaPub[0] !== 4 || sekret.length !== 16) throw new Error('Zła subskrypcja (klucze).');
  const ecdh = test.nadawca || crypto.createECDH('prime256v1');
  if (!test.nadawca) ecdh.generateKeys();
  const asPub = ecdh.getPublicKey();
  const wspolny = ecdh.computeSecret(uaPub);
  const prkKey = hmac(sekret, wspolny);
  const ikm = hmac(prkKey, Buffer.concat([Buffer.from('WebPush: info\0'), uaPub, asPub, Buffer.from([1])]));
  const sol = test.sol || crypto.randomBytes(16);
  const prk = hmac(sol, ikm);
  const cek = hmac(prk, Buffer.from('Content-Encoding: aes128gcm\0\x01')).subarray(0, 16);
  const nonce = hmac(prk, Buffer.from('Content-Encoding: nonce\0\x01')).subarray(0, 12);
  const szyfr = crypto.createCipheriv('aes-128-gcm', cek, nonce);
  const zaszyfrowane = Buffer.concat([szyfr.update(Buffer.concat([tekst, Buffer.from([2])])), szyfr.final(), szyfr.getAuthTag()]);
  const rs = Buffer.alloc(4); rs.writeUInt32BE(4096);
  return Buffer.concat([sol, rs, Buffer.from([asPub.length]), asPub, zaszyfrowane]);
}

/**
 * Wysyła jedno powiadomienie. Wynik: { ok, status, wygasla } – wygasla=true (404/410) → usuń subskrypcję.
 * @param {{endpoint: string, keys: {p256dh: string, auth: string}}} sub
 * @param {object} dane  np. { tytul, tekst, tag }
 */
function wyslij(sub, dane, vapid, o = {}) {
  return new Promise((ok) => {
    if (!sub || !dozwolonyAdres(sub.endpoint, o.dodatkoweUslugi)) return ok({ ok: false, status: 0, blad: 'Niedozwolony adres usługi powiadomień.' });
    let cialo;
    try { cialo = zaszyfruj(Buffer.from(JSON.stringify(dane), 'utf8'), sub.keys && sub.keys.p256dh, sub.keys && sub.keys.auth); } catch (e) { return ok({ ok: false, status: 0, blad: e.message, wygasla: true }); }
    const u = new URL(sub.endpoint);
    const temat = dane.tag ? String(dane.tag).replace(/[^\w-]/g, '').slice(0, 32) : '';
    const req = https.request({
      method: 'POST', hostname: u.hostname, port: u.port || 443, path: u.pathname + u.search, agent: o.agent, ca: o.ca, timeout: 15000,
      headers: {
        'Content-Type': 'application/octet-stream', 'Content-Encoding': 'aes128gcm', 'Content-Length': cialo.length,
        TTL: String(o.ttl || 3600), Urgency: 'high', ...(temat ? { Topic: temat } : {}),
        Authorization: naglowekVapid(sub.endpoint, vapid, o.kontakt || 'mailto:konsylium@example.com')
      }
    }, (res) => {
      res.resume();
      res.on('end', () => ok({ ok: res.statusCode >= 200 && res.statusCode < 300, status: res.statusCode, wygasla: res.statusCode === 404 || res.statusCode === 410 }));
    });
    req.on('timeout', () => req.destroy(new Error('Przekroczony czas.')));
    req.on('error', (e) => ok({ ok: false, status: 0, blad: e.message }));
    req.end(cialo);
  });
}

module.exports = { noweKluczeVapid, zaszyfruj, wyslij, naglowekVapid, dozwolonyAdres };
