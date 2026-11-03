'use strict';
/*
 * Lokalny certyfikat https dla iPada (decyzja Michała 3.11.2026: powiadomienia w tle = https + jednorazowy certyfikat).
 * Komputer tworzy własny urząd certyfikacji „MS Konsylium (lokalny)” (10 lat) i nim podpisuje certyfikat serwera
 * dla swoich adresów w sieci domowej (nazwa.local i numery IP, 397 dni). iPad instaluje i zaufa urzędowi RAZ;
 * nowy certyfikat serwera (inny adres IP, koniec ważności) powstaje sam i iPad już mu ufa.
 * Bez zewnętrznych bibliotek: X.509 składamy w DER ręcznie, podpis i klucze daje node:crypto.
 * Klucz urzędu nie opuszcza komputera (folder danych aplikacji); urząd nie podpisuje nic poza tym serwerem.
 */
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

// ── minimalny koder DER ──
function dlugosc(n) {
  if (n < 0x80) return Buffer.from([n]);
  const b = []; while (n > 0) { b.unshift(n & 0xff); n >>= 8; }
  return Buffer.from([0x80 | b.length, ...b]);
}
const tlv = (tag, tresc) => Buffer.concat([Buffer.from([tag]), dlugosc(tresc.length), tresc]);
const seq = (...e) => tlv(0x30, Buffer.concat(e));
const set = (...e) => tlv(0x31, Buffer.concat(e));
const jawny = (n, tresc) => tlv(0xa0 + n, tresc);
function liczba(buf) { if (buf[0] & 0x80) buf = Buffer.concat([Buffer.from([0]), buf]); return tlv(0x02, buf); }
function oid(tekst) {
  const c = tekst.split('.').map(Number), out = [40 * c[0] + c[1]];
  for (const v of c.slice(2)) { const b = [v & 0x7f]; let x = v >> 7; while (x > 0) { b.unshift(0x80 | (x & 0x7f)); x >>= 7; } out.push(...b); }
  return tlv(0x06, Buffer.from(out));
}
const utf8 = (s) => tlv(0x0c, Buffer.from(s, 'utf8'));
const oktety = (b) => tlv(0x04, b);
const bity = (b, wolne = 0) => tlv(0x03, Buffer.concat([Buffer.from([wolne]), b]));
const PRAWDA = Buffer.from([0x01, 0x01, 0xff]);
function czas(d) {
  const p = (n) => String(n).padStart(2, '0');
  const t = `${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}${p(d.getUTCHours())}${p(d.getUTCMinutes())}${p(d.getUTCSeconds())}Z`;
  const r = d.getUTCFullYear();
  return r < 2050 ? tlv(0x17, Buffer.from(p(r % 100) + t)) : tlv(0x18, Buffer.from(r + t));
}
const nazwa = (cn) => seq(set(seq(oid('2.5.4.10'), utf8('MS'))), set(seq(oid('2.5.4.3'), utf8(cn))));
const SHA256_RSA = seq(oid('1.2.840.113549.1.1.11'), Buffer.from([0x05, 0x00]));
const rozszerzenie = (id, krytyczne, wartosc) => seq(oid(id), ...(krytyczne ? [PRAWDA] : []), oktety(wartosc));
function idKlucza(spkiDer) {
  // SHA-1 z klucza publicznego (BIT STRING z SubjectPublicKeyInfo), metoda 1 z RFC 5280 4.2.1.2
  const k = spkiDer.subarray(spkiDer.length - kluczBity(spkiDer));
  return crypto.createHash('sha1').update(k).digest();
}
function kluczBity(spki) {
  // długość treści ostatniego BIT STRING (bez bajtu „wolne bity”)
  let i = 0; const czytajDl = () => { let n = spki[i++]; if (n & 0x80) { let k = n & 0x7f; n = 0; while (k--) n = (n << 8) | spki[i++]; } return n; };
  i = 1; czytajDl();                       // SEQUENCE
  i++; const alg = czytajDl(); i += alg;   // AlgorithmIdentifier (najpierw długość, potem przeskok)
  i++; const n = czytajDl();               // BIT STRING
  return n - 1;
}

function podpisz(tbs, kluczPrywatny) {
  const podpis = crypto.sign('sha256', tbs, kluczPrywatny);
  const der = seq(tbs, SHA256_RSA, bity(podpis));
  return '-----BEGIN CERTIFICATE-----\n' + der.toString('base64').match(/.{1,64}/g).join('\n') + '\n-----END CERTIFICATE-----\n';
}
function numerSeryjny() { const b = crypto.randomBytes(16); b[0] &= 0x7f; b[0] |= 0x10; return b; }

/** Urząd certyfikacji: { kluczPem, certPem }. */
function nowyUrzad(teraz = new Date()) {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
  const spki = publicKey.export({ type: 'spki', format: 'der' });
  const kid = idKlucza(spki);
  const od = new Date(teraz.getTime() - 3600e3), doDaty = new Date(teraz.getTime() + 3650 * 864e5);
  const n = nazwa('MS Konsylium (lokalny)');
  const tbs = seq(jawny(0, liczba(Buffer.from([2]))), liczba(numerSeryjny()), SHA256_RSA, n, seq(czas(od), czas(doDaty)), n, spki,
    jawny(3, seq(
      rozszerzenie('2.5.29.19', true, seq(PRAWDA, liczba(Buffer.from([0])))),          // CA, pathLen 0
      rozszerzenie('2.5.29.15', true, bity(Buffer.from([0x06]), 1)),                    // keyCertSign, cRLSign
      rozszerzenie('2.5.29.14', false, oktety(kid))
    )));
  return { kluczPem: privateKey.export({ type: 'pkcs8', format: 'pem' }), certPem: podpisz(tbs, privateKey) };
}

/** Certyfikat serwera dla podanych nazw i adresów IP, podpisany urzędem. */
function nowyCertSerwera(urzad, hosty, teraz = new Date()) {
  const kluczCA = crypto.createPrivateKey(urzad.kluczPem);
  const certCA = new crypto.X509Certificate(urzad.certPem);
  const spkiCA = certCA.publicKey.export({ type: 'spki', format: 'der' });
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
  const spki = publicKey.export({ type: 'spki', format: 'der' });
  const od = new Date(teraz.getTime() - 3600e3), doDaty = new Date(teraz.getTime() + 397 * 864e5);   // iPadOS: ≤ 825 dni, Safari: ≤ 398
  const san = hosty.map((h) => {
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(h)) return tlv(0x87, Buffer.from(h.split('.').map(Number)));
    return tlv(0x82, Buffer.from(h, 'ascii'));
  });
  const cn = hosty.find((h) => !/^\d/.test(h)) || hosty[0] || 'localhost';
  const tbs = seq(jawny(0, liczba(Buffer.from([2]))), liczba(numerSeryjny()), SHA256_RSA, nazwa('MS Konsylium (lokalny)'), seq(czas(od), czas(doDaty)), nazwa(cn), spki,
    jawny(3, seq(
      rozszerzenie('2.5.29.19', true, seq()),
      rozszerzenie('2.5.29.15', true, bity(Buffer.from([0xa0]), 5)),                    // digitalSignature, keyEncipherment
      rozszerzenie('2.5.29.37', false, seq(oid('1.3.6.1.5.5.7.3.1'))),                 // serverAuth
      rozszerzenie('2.5.29.17', false, seq(...san)),
      rozszerzenie('2.5.29.14', false, oktety(idKlucza(spki))),
      rozszerzenie('2.5.29.35', false, seq(tlv(0x80, idKlucza(spkiCA))))
    )));
  return { kluczPem: privateKey.export({ type: 'pkcs8', format: 'pem' }), certPem: podpisz(tbs, kluczCA), hosty: hosty.slice() };
}

/**
 * Zwraca { key, cert, ca } dla https.createServer i PEM urzędu do pobrania przez iPada.
 * Urząd powstaje raz; certyfikat serwera – gdy zmieniły się adresy albo zostało < 30 dni ważności.
 */
function zapewnijCertyfikaty(katalog, hosty, teraz = new Date()) {
  fs.mkdirSync(katalog, { recursive: true });
  const pUrzad = path.join(katalog, 'urzad.json'), pSerwer = path.join(katalog, 'serwer.json');
  const czytaj = (p) => { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; } };
  const zapisz = (p, o) => { fs.writeFileSync(p + '.tmp', JSON.stringify(o), { mode: 0o600 }); fs.renameSync(p + '.tmp', p); };
  let urzad = czytaj(pUrzad), nowyCA = false;
  const wazny = (pem, zapas) => { try { const c = new crypto.X509Certificate(pem); return new Date(c.validTo).getTime() - teraz.getTime() > zapas; } catch { return false; } };
  if (!urzad || !wazny(urzad.certPem, 365 * 864e5)) { urzad = nowyUrzad(teraz); zapisz(pUrzad, urzad); nowyCA = true; }
  const lista = [...new Set(hosty.filter(Boolean).map((h) => String(h).toLowerCase()))].sort();
  let serwer = czytaj(pSerwer);
  const pasuje = serwer && !nowyCA && JSON.stringify(serwer.hosty) === JSON.stringify(lista) && wazny(serwer.certPem, 30 * 864e5) &&
    (() => { try { return new crypto.X509Certificate(serwer.certPem).verify(new crypto.X509Certificate(urzad.certPem).publicKey); } catch { return false; } })();
  if (!pasuje) { serwer = nowyCertSerwera(urzad, lista, teraz); zapisz(pSerwer, serwer); }
  return { key: serwer.kluczPem, cert: serwer.certPem + urzad.certPem, ca: urzad.certPem, nowyUrzad: nowyCA, odcisk: new crypto.X509Certificate(urzad.certPem).fingerprint256 };
}

module.exports = { zapewnijCertyfikaty, nowyUrzad, nowyCertSerwera };
