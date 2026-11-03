// Testy powiadomień w tle bez Electrona: certyfikat lokalny, szyfrowanie (wektor RFC 8291), wysyłka i strażnik sprawy.
// Użycie: node test/test-push.mjs
import { createRequire } from 'node:module';
import { mkdtempSync, mkdirSync, writeFileSync, appendFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import https from 'node:https';
const req = createRequire(import.meta.url);
const tls = req('../tls-lokalny.js'), wp = req('../web-push.js'), st = req('../straznik-sprawy.js');
let n = 0; const ok = (m) => { n++; console.log('ok', n, m); };

// 1. certyfikat: urząd + serwer z nazwą .local i IP, zaufany tylko przez nasz urząd
const kat = mkdtempSync(join(tmpdir(), 'ms-tls-'));
const c = tls.zapewnijCertyfikaty(kat, ['127.0.0.1', 'komputer.local']);
const ca = new crypto.X509Certificate(c.ca), srv = new crypto.X509Certificate(c.cert);
assert.equal(ca.ca, true); assert.equal(srv.ca, false);
assert.ok(srv.verify(ca.publicKey)); assert.equal(srv.checkIP('127.0.0.1'), '127.0.0.1'); assert.equal(srv.checkHost('komputer.local'), 'komputer.local');
assert.ok((new Date(srv.validTo) - Date.now()) / 864e5 <= 398, 'ważność ≤ 398 dni (Safari)');
assert.equal(tls.zapewnijCertyfikaty(kat, ['komputer.local', '127.0.0.1']).cert, c.cert, 'te same adresy → ten sam certyfikat');
const c3 = tls.zapewnijCertyfikaty(kat, ['192.168.1.20', 'komputer.local']);
assert.notEqual(c3.cert, c.cert); assert.equal(c3.ca, c.ca, 'nowy adres IP → nowy certyfikat serwera, ten sam urząd');
ok('certyfikat lokalny');

// 2. szyfrowanie zgodne z RFC 8291, dodatek A
const e = crypto.createECDH('prime256v1'); e.setPrivateKey(Buffer.from('yfWPiYE-n46HLnH0KqZOF1fJJU3MYrct3AELtAQ-oRw', 'base64url'));
const wynikRfc = wp.zaszyfruj(Buffer.from('When I grow up, I want to be a watermelon'), 'BCVxsr7N_eNgVRqvHtD0zTZsEc6-VV-JvLexhqUzORcxaOzi6-AYWXvTBHm4bjyPjs7Vd8pZGH6SRpkNtoIAiw4', 'BTBZMqHH6r4Tts7J_aSIgg', { nadawca: e, sol: Buffer.from('DGv6ra1nlYgDCS1FRnbzlw', 'base64url') });
assert.equal(wynikRfc.toString('base64url'), 'DGv6ra1nlYgDCS1FRnbzlwAAEABBBP4z9KsN6nGRTbVYI_c7VJSPQTBtkgcy27mlmlMoZIIgDll6e3vCYLocInmYWAmS6TlzAC8wEqKK6PBru3jl7A_yl95bQpu6cVPTpK4Mqgkf1CXztLVBSt2Ks3oZwbuwXPXLWyouBWLVWGNWQexSgSxsj_Qulcy4a-fN');
ok('szyfrowanie = wektor RFC 8291');

// 3. tylko znane usługi powiadomień
assert.ok(wp.dozwolonyAdres('https://web.push.apple.com/QGx'));
assert.ok(!wp.dozwolonyAdres('https://192.168.1.1/x')); assert.ok(!wp.dozwolonyAdres('http://web.push.apple.com/x')); assert.ok(!wp.dozwolonyAdres('https://web.push.apple.com.zly.pl/x'));
ok('lista usług powiadomień');

// 4. wysyłka do udawanej usługi: nagłówki VAPID i treść do odszyfrowania kluczem iPada
const ua = crypto.createECDH('prime256v1'); ua.generateKeys();
const auth = crypto.randomBytes(16);
const vapid = wp.noweKluczeVapid();
const odebrane = await new Promise((gotowe) => {
  const s = https.createServer({ key: c.key, cert: c.cert }, (q, r) => {
    const k = []; q.on('data', (d) => k.push(d)); q.on('end', () => { r.writeHead(201); r.end(); s.close(); gotowe({ h: q.headers, b: Buffer.concat(k) }); });
  }).listen(0, '127.0.0.1', async () => {
    const w = await wp.wyslij({ endpoint: `https://127.0.0.1:${s.address().port}/push/abc`, keys: { p256dh: ua.getPublicKey().toString('base64url'), auth: auth.toString('base64url') } },
      { tytul: 'Konsylium pyta Ciebie', tekst: 'Czy ból promieniuje?', tag: 'pytanie-X' }, vapid, { ca: c.ca, dodatkoweUslugi: [/^127\.0\.0\.1$/] });
    assert.equal(w.ok, true);
  });
});
assert.equal(odebrane.h['content-encoding'], 'aes128gcm'); assert.equal(odebrane.h.urgency, 'high');
const [, jwt, kpub] = odebrane.h.authorization.match(/^vapid t=([^,]+), k=(.+)$/);
assert.equal(kpub, vapid.publiczny);
const [g, t, pod] = jwt.split('.');
const jwk = { kty: 'EC', crv: 'P-256', x: Buffer.from(kpub, 'base64url').subarray(1, 33).toString('base64url'), y: Buffer.from(kpub, 'base64url').subarray(33).toString('base64url') };
assert.ok(crypto.verify('sha256', Buffer.from(g + '.' + t), { key: crypto.createPublicKey({ key: jwk, format: 'jwk' }), dsaEncoding: 'ieee-p1363' }, Buffer.from(pod, 'base64url')), 'podpis VAPID');
assert.match(JSON.parse(Buffer.from(t, 'base64url')).aud, /^https:\/\/127\.0\.0\.1:\d+$/);
// odszyfrowanie po stronie „iPada” (RFC 8291 od drugiej strony)
const b = odebrane.b, sol = b.subarray(0, 16), idl = b[20], asPub = b.subarray(21, 21 + idl), szyfr = b.subarray(21 + idl);
const hm = (k, d) => crypto.createHmac('sha256', k).update(d).digest();
const ikm = hm(hm(auth, ua.computeSecret(asPub)), Buffer.concat([Buffer.from('WebPush: info\0'), ua.getPublicKey(), asPub, Buffer.from([1])]));
const prk = hm(sol, ikm);
const d = crypto.createDecipheriv('aes-128-gcm', hm(prk, Buffer.from('Content-Encoding: aes128gcm\0\x01')).subarray(0, 16), hm(prk, Buffer.from('Content-Encoding: nonce\0\x01')).subarray(0, 12));
d.setAuthTag(szyfr.subarray(szyfr.length - 16));
const jawne = Buffer.concat([d.update(szyfr.subarray(0, szyfr.length - 16)), d.final()]);
assert.equal(jawne[jawne.length - 1], 2);
assert.deepEqual(JSON.parse(jawne.subarray(0, -1)), { tytul: 'Konsylium pyta Ciebie', tekst: 'Czy ból promieniuje?', tag: 'pytanie-X' });
ok('wysyłka: VAPID + treść odszyfrowana kluczem iPada');

// 5. strażnik: stare zdarzenia milczą, nowe pytanie / alarm / wnioski są zgłaszane raz
const korzen = mkdtempSync(join(tmpdir(), 'ms-straz-'));
const sp = join(korzen, 'sprawy', '2026-11-03-01'); mkdirSync(sp, { recursive: true });
writeFileSync(join(sp, '_log.jsonl'), JSON.stringify({ zdarzenie: 'pytanie', id: 'P0', tekst: 'stare pytanie' }) + '\n');
const zgl = [];
const s = st.utworzStraznika({ korzen: () => korzen, zglos: (z) => zgl.push(z), co: 60000 });
s.sprawdz(); assert.equal(zgl.length, 0, 'bez starych zdarzeń');
appendFileSync(join(sp, '_log.jsonl'), JSON.stringify({ zdarzenie: 'pytanie', id: 'P1', tekst: 'Czy była gorączka?', opcje: ['tak', 'nie'] }) + '\n' + JSON.stringify({ zdarzenie: 'alarm', tekst: 'Podejrzenie OZW – rozważ 112 teraz' }) + '\n');
s.sprawdz(); s.sprawdz();
assert.deepEqual(zgl.map((z) => z.tytul), ['Alarm 112', 'Konsylium pyta Ciebie']);
writeFileSync(join(sp, '09-FINAL.md'), 'REKOMENDACJA: Zrób EKG dziś.\nPILNOŚĆ: 2 dziś\n');
s.sprawdz();
assert.equal(zgl[2].tytul, 'Wnioski konsylium gotowe'); assert.equal(zgl[2].tekst, 'Zrób EKG dziś.');
s.stop();
ok('strażnik sprawy');
console.log(`test-push: ${n} OK`);
