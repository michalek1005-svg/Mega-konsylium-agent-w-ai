// MS Konsylium na iPadzie: serwer w sieci lokalnej, uruchamiany przyciskiem w aplikacji Windows.
// iPad otwiera w Safari te same ekrany (app/ipad.html + moduły), a wszystkie operacje na plikach
// idą przez /api do tych samych funkcji, z których korzysta okno Windows (folder Konsylium).
// Zasady: domyślnie wyłączony; odpowiada tylko adresom z sieci lokalnej; dane tylko z kluczem
// parowania (kod QR); serwer niczego sam nie pobiera. Drugi serwer (https, lokalny certyfikat z tls-lokalny.js)
// daje iPadowi powiadomienia w tle (web-push.js); certyfikat urzędu do zainstalowania: /certyfikat.crt.
'use strict';
const http = require('node:http');
const https = require('node:https');
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const crypto = require('node:crypto');
const os = require('node:os');

const OPERACJE = ['folder', 'czytaj', 'zapisz', 'zapiszObraz', 'lista', 'czytajFolder'];
const MAX_ZADANIE = 5 * 1024 * 1024;

// 127/8, ::1, 10/8, 172.16/12, 192.168/16, 169.254/16, fc00::/7, fe80::/10 (także jako ::ffff:a.b.c.d)
function adresLokalny(a) {
  if (!a) return false;
  a = String(a).toLowerCase().replace(/^::ffff:/, '');
  if (a === '::1') return true;
  const m = a.match(/^(\d+)\.(\d+)\.\d+\.\d+$/);
  if (m) {
    const x = +m[1], y = +m[2];
    return x === 127 || x === 10 || (x === 172 && y >= 16 && y <= 31) || (x === 192 && y === 168) || (x === 169 && y === 254);
  }
  return /^f[cd]/.test(a) || /^fe[89ab]/.test(a);
}

// adresy IPv4 tego komputera w sieci lokalnej, najpierw typowe domowe 192.168.*
function adresySieci() {
  const out = [];
  for (const [nazwa, lista] of Object.entries(os.networkInterfaces())) {
    for (const i of lista || []) {
      if (i.internal || (i.family !== 'IPv4' && i.family !== 4) || !adresLokalny(i.address) || i.address.startsWith('169.254.')) continue;
      // wirtualne karty (WSL, Hyper-V, VirtualBox, VMware) iPad i tak nie widzi
      const wirtualna = /vethernet|wsl|hyper-v|virtualbox|vmware|docker|vbox/i.test(nazwa);
      out.push({ adres: i.address, nazwa, wirtualna });
    }
  }
  const waga = (x) => (x.wirtualna ? 10 : 0) + (x.adres.startsWith('192.168.') ? 0 : x.adres.startsWith('10.') ? 1 : 2);
  return out.sort((a, b) => waga(a) - waga(b));
}

function rowneKlucze(a, b) {
  const x = Buffer.from(String(a || '')), y = Buffer.from(String(b || ''));
  return x.length === y.length && x.length > 0 && crypto.timingSafeEqual(x, y);
}

/**
 * @param {object} o
 * @param {string} o.katalogApp  katalog z ipad.html, moduly/ i ikona.png (build/app)
 * @param {string} o.ikona       ścieżka do ikona.png
 * @param {object} o.pliki       { folder, czytaj, zapisz, lista, czytajFolder } (jak w oknie Windows)
 * @param {() => string} o.klucz aktualny klucz parowania
 * @param {(zd: object) => void} [o.naZdarzenie] np. { typ: 'polaczenie', adres }
 * @param {{key, cert}} [o.tls]  https zamiast http (powiadomienia w tle)
 * @param {() => string|null} [o.certyfikatUrzedu]  PEM do pobrania przez iPada (/certyfikat.crt)
 * @param {(k: string) => string|null} [o.adresHttps]  pełny adres wersji https (strona /tls)
 * @param {object} [o.dodatkowe]  operacje /api poza plikami, np. { pushKlucz, pushZapisz, pushTest }
 */
function utworzSerwer(o) {
  const pamiecGzip = new Map();
  const STATYCZNE = {
    '/': [path.join(o.katalogApp, 'ipad.html'), 'text/html; charset=utf-8'],
    '/index.html': [path.join(o.katalogApp, 'ipad.html'), 'text/html; charset=utf-8'],
    '/moduly/wywiad.html': [path.join(o.katalogApp, 'moduly', 'wywiad.html'), 'text/html; charset=utf-8'],
    '/moduly/anonimizator.html': [path.join(o.katalogApp, 'moduly', 'anonimizator.html'), 'text/html; charset=utf-8'],
    '/moduly/pokoj.html': [path.join(o.katalogApp, 'moduly', 'pokoj.html'), 'text/html; charset=utf-8'],
    '/ikona.png': [o.ikona, 'image/png'],
    '/apple-touch-icon.png': [o.ikona, 'image/png']
  };
  const widziane = new Set();
  // Stałe połączenie (Michał 1.11: „koniecznie popraw iPada na stałe połączenie”): iPad trzyma otwarty strumień
  // zdarzeń GET /zdarzenia (Server-Sent Events, Safari wznawia go sam po zerwaniu), komputer co 5 s wysyła ping,
  // więc obie strony wiedzą na bieżąco, czy są połączone; komputer może też pchać zdarzenia (rozglos).
  const strumienie = new Set();
  function strumien(req, res, kluczOk) {
    if (!kluczOk) { naglowki(res, 'text/plain; charset=utf-8', { 'Cache-Control': 'no-store' }); return wyslij(req, res, 403, 'text/plain', 'Ten iPad nie jest sparowany z komputerem.'); }
    const zdalny = String(req.socket.remoteAddress || '').replace(/^::ffff:/, '');
    try { req.socket.setTimeout(0); req.socket.setNoDelay(true); req.socket.setKeepAlive(true, 10000); } catch {}
    naglowki(res, 'text/event-stream; charset=utf-8', { 'Cache-Control': 'no-store', 'Connection': 'keep-alive', 'X-Accel-Buffering': 'no' });
    res.writeHead(200);
    const kl = { res, adres: zdalny, od: Date.now() };
    const pisz = (s) => { try { res.write(s); } catch {} };
    pisz('retry: 2000\n\n');
    pisz('event: stan\ndata: ' + JSON.stringify({ polaczono: true, czas: Date.now() }) + '\n\n');
    strumienie.add(kl);
    if (o.naZdarzenie) o.naZdarzenie({ typ: 'polaczenie', adres: zdalny, stale: true });
    const ping = setInterval(() => pisz(': ping ' + Date.now() + '\n\n'), 5000);
    const koniec = () => {
      if (!strumienie.has(kl)) return;
      clearInterval(ping); strumienie.delete(kl);
      if (o.naZdarzenie) o.naZdarzenie({ typ: 'rozlaczenie', adres: zdalny });
    };
    req.on('close', koniec); res.on('close', koniec); req.on('error', koniec);
  }

  function naglowki(res, typ, extra) {
    res.setHeader('Content-Type', typ);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Cache-Control', 'no-cache');
    for (const [k, v] of Object.entries(extra || {})) res.setHeader(k, v);
  }
  function wyslij(req, res, status, typ, tresc, kluczPamieci) {
    let dane = Buffer.isBuffer(tresc) ? tresc : Buffer.from(String(tresc), 'utf8');
    const gzip = /\bgzip\b/.test(req.headers['accept-encoding'] || '') && !typ.startsWith('image/') && dane.length > 1024;
    if (gzip) {
      if (kluczPamieci && pamiecGzip.has(kluczPamieci)) dane = pamiecGzip.get(kluczPamieci);
      else { dane = zlib.gzipSync(dane, { level: 6 }); if (kluczPamieci) pamiecGzip.set(kluczPamieci, dane); }
      res.setHeader('Content-Encoding', 'gzip');
    }
    res.setHeader('Vary', 'Accept-Encoding');
    res.setHeader('Content-Length', dane.length);
    res.writeHead(status);
    res.end(req.method === 'HEAD' ? undefined : dane);
  }
  function json(req, res, status, obj) {
    naglowki(res, 'application/json; charset=utf-8', { 'Cache-Control': 'no-store' });
    wyslij(req, res, status, 'application/json', JSON.stringify(obj));
  }

  async function api(req, res, op) {
    if (req.method !== 'POST') return json(req, res, 405, { blad: 'Tylko POST.' });
    if (!rowneKlucze(req.headers['x-ms-klucz'], o.klucz())) return json(req, res, 403, { blad: 'Ten iPad nie jest sparowany z komputerem.' });
    const dod = o.dodatkowe && Object.prototype.hasOwnProperty.call(o.dodatkowe, op) ? o.dodatkowe[op] : null;
    if (!OPERACJE.includes(op) && !dod) return json(req, res, 404, { blad: 'Nieznana operacja.' });
    const kawalki = []; let dl = 0;
    for await (const k of req) { dl += k.length; if (dl > MAX_ZADANIE) return json(req, res, 413, { blad: 'Za duże żądanie.' }); kawalki.push(k); }
    let args = [];
    try { const b = JSON.parse(Buffer.concat(kawalki).toString('utf8') || '{}'); args = Array.isArray(b.args) ? b.args : []; }
    catch { return json(req, res, 400, { blad: 'Złe żądanie.' }); }
    const zdalny = String(req.socket.remoteAddress || '').replace(/^::ffff:/, '');
    if (!widziane.has(zdalny)) { widziane.add(zdalny); if (o.naZdarzenie) o.naZdarzenie({ typ: 'polaczenie', adres: zdalny }); }
    try {
      const a = args.map((x) => (x == null ? '' : String(x)));
      const wynik = await (dod || o.pliki[op])(...a);
      json(req, res, 200, { wynik: wynik === undefined ? null : wynik });
    } catch (err) {
      json(req, res, 200, { blad: String((err && err.message) || err) });
    }
  }

  const obsluga = (req, res) => {
    if (!adresLokalny(req.socket.remoteAddress)) { res.writeHead(403); res.end(); req.destroy(); return; }
    let u;
    try { u = new URL(req.url, 'http://ipad.local'); } catch { res.writeHead(400); res.end(); return; }
    const p = u.pathname;
    if (p.startsWith('/api/')) {
      api(req, res, p.slice(5)).catch(() => { try { res.writeHead(500); res.end(); } catch {} });
      return;
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405); res.end(); return; }
    const k = u.searchParams.get('k');
    const kluczOk = rowneKlucze(k, o.klucz());
    if (p === '/zdarzenia') return strumien(req, res, kluczOk);
    if (p === '/certyfikat.crt' && o.certyfikatUrzedu) {
      // publiczny certyfikat urzędu „MS Konsylium (lokalny)”: Safari proponuje instalację profilu
      const pem = o.certyfikatUrzedu();
      if (!pem) { naglowki(res, 'text/plain; charset=utf-8'); return wyslij(req, res, 404, 'text/plain', 'Brak certyfikatu.'); }
      naglowki(res, 'application/x-x509-ca-cert', { 'Content-Disposition': 'attachment; filename="MS-Konsylium-lokalny.crt"', 'Cache-Control': 'no-store' });
      return wyslij(req, res, 200, 'application/x-x509-ca-cert', pem);
    }
    if (p === '/tls') {
      naglowki(res, 'text/html; charset=utf-8', { 'Cache-Control': 'no-store', 'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; img-src data:" });
      return wyslij(req, res, 200, 'text/html', stronaTls(kluczOk && o.adresHttps ? o.adresHttps(k) : null, !!o.certyfikatUrzedu));
    }
    if (p === '/sw.js') {
      naglowki(res, 'text/javascript; charset=utf-8', { 'Cache-Control': 'no-store', 'Service-Worker-Allowed': '/' });
      return wyslij(req, res, 200, 'text/javascript', SW);
    }
    if (p === '/manifest.webmanifest') {
      // start_url z kluczem: ikona na ekranie głównym iPada ma osobne ciasteczka i pamięć niż Safari
      const m = {
        name: 'MS Konsylium', short_name: 'Konsylium', lang: 'pl', display: 'standalone', orientation: 'any',
        start_url: kluczOk ? './?k=' + encodeURIComponent(k) : './', scope: './',
        background_color: '#E6EBEE', theme_color: '#E6EBEE',
        icons: [{ src: 'ikona.png', sizes: '512x512', type: 'image/png', purpose: 'any' }]
      };
      naglowki(res, 'application/manifest+json; charset=utf-8', { 'Cache-Control': 'no-store' });
      return wyslij(req, res, 200, 'application/manifest+json', JSON.stringify(m));
    }
    const plik = STATYCZNE[p];
    if (!plik) { naglowki(res, 'text/plain; charset=utf-8'); return wyslij(req, res, 404, 'text/plain', 'Nie ma takiej strony.'); }
    let dane;
    try { dane = fs.readFileSync(plik[0]); } catch { naglowki(res, 'text/plain; charset=utf-8'); return wyslij(req, res, 404, 'text/plain', 'Ten moduł nie jest dołączony.'); }
    naglowki(res, plik[1]);
    if (p === '/' || p === '/index.html') {
      let html = dane.toString('utf8');
      if (kluczOk) html = html.replace('href="manifest.webmanifest"', 'href="manifest.webmanifest?k=' + encodeURIComponent(k) + '"');
      return wyslij(req, res, 200, plik[1], html);
    }
    let st = 0; try { st = fs.statSync(plik[0]).mtimeMs; } catch {}
    wyslij(req, res, 200, plik[1], dane, p + ':' + st);
  };
  const serwer = o.tls ? https.createServer({ key: o.tls.key, cert: o.tls.cert }, obsluga) : http.createServer(obsluga);
  serwer.keepAliveTimeout = 5000;
  serwer.headersTimeout = 15000;
  serwer.requestTimeout = 60000;
  // kto jest teraz połączony na stałe; rozgłoszenie zdarzenia do wszystkich iPadów
  serwer.polaczeni = () => [...strumienie].map((k) => ({ adres: k.adres, od: k.od }));
  serwer.rozglos = (nazwa, dane) => { const s = 'event: ' + String(nazwa).replace(/[^\w-]/g, '') + '\ndata: ' + JSON.stringify(dane == null ? null : dane) + '\n\n'; for (const k of strumienie) { try { k.res.write(s); } catch {} } };
  serwer.on('close', () => { for (const k of strumienie) { try { k.res.end(); } catch {} } strumienie.clear(); });
  return serwer;
}

// Service worker iPada: tylko powiadomienia (bez pamięci podręcznej stron – dane zawsze z komputera).
const SW = `'use strict';
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });
self.addEventListener('push', function (e) {
  var d = {}; try { d = e.data ? e.data.json() : {}; } catch (x) { d = { tekst: e.data ? e.data.text() : '' }; }
  e.waitUntil(self.registration.showNotification(d.tytul || 'MS Konsylium', { body: d.tekst || '', tag: d.tag || 'ms-konsylium', data: { modul: d.modul || 'pokoj' } }));
});
self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (l) {
    for (var i = 0; i < l.length; i++) { if ('focus' in l[i]) { l[i].postMessage({ typ: 'ms-push-klik', modul: e.notification.data && e.notification.data.modul }); return l[i].focus(); } }
    return self.clients.openWindow('./');
  }));
});
`;

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
// Strona z instrukcją dla iPada (otwierana z drugiego kodu QR): certyfikat raz, potem wersja https na ekran początkowy.
function stronaTls(adresHttps, jestCert) {
  return `<!doctype html><html lang="pl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>MS Konsylium – powiadomienia w tle</title><style>
:root{--petrol:#0F5E58;--ink:#14302D;--mut:#5C7570}
body{margin:0;font:16px/1.55 -apple-system,'Segoe UI',system-ui,sans-serif;color:var(--ink);background:linear-gradient(160deg,#E9EFEC,#CFDCD8);min-height:100vh}
main{max-width:560px;margin:0 auto;padding:28px 18px 40px}
h1{font-size:21px;margin:0 0 6px}p{margin:6px 0;color:var(--mut)}ol{padding-left:22px}li{margin:12px 0}
a.btn{display:inline-block;margin-top:6px;padding:11px 16px;border-radius:22px;background:var(--petrol);color:#fff;text-decoration:none;font-weight:650}
.box{background:rgba(255,255,255,.7);border-radius:18px;padding:14px 18px;margin-top:14px}
b{color:var(--ink)}</style></head><body><main>
<h1>Powiadomienia w tle na iPadzie</h1>
<p>Jednorazowo. Potem iPad pokaże powiadomienie, gdy konsylium zapyta Ciebie, przy alarmie 112 i gdy Wnioski są gotowe, nawet gdy aplikacja jest zamknięta.</p>
<div class="box"><ol>
<li><b>Pobierz certyfikat komputera.</b>${jestCert ? '<br><a class="btn" href="certyfikat.crt">Pobierz certyfikat</a>' : ' (niedostępny – włącz udostępnianie na komputerze)'}<br>Safari zapyta o pobranie profilu konfiguracji: stuknij <b>Zezwól</b>.</li>
<li>Otwórz <b>Ustawienia → Pobrany profil</b> (na górze listy) → <b>Instaluj</b>. Profil nazywa się „MS Konsylium (lokalny)”.</li>
<li><b>Ustawienia → Ogólne → To urządzenie → Ustawienia zaufania certyfikatów</b> → włącz „MS Konsylium (lokalny)”.</li>
<li>${adresHttps ? `<a class="btn" href="${esc(adresHttps)}">Otwórz bezpieczną wersję</a><br>` : 'Zeskanuj ten kod QR jeszcze raz z aplikacji na komputerze. '}W Safari stuknij <b>Udostępnij → Do ekranu początkowego</b>. Starą ikonę Konsylium możesz usunąć.</li>
<li>Otwórz Konsylium <b>z nowej ikony</b> i stuknij <b>Włącz powiadomienia w tle</b> → <b>Pozwól</b>.</li>
</ol></div>
<p>Certyfikat działa tylko w Twojej sieci domowej, dla tego komputera. Treść powiadomień jest zaszyfrowana; usługa powiadomień Apple widzi tylko, że coś wysłano.</p>
<p style="font-size:13px">Narzędzie testowe i edukacyjne marki MS. Nie służy do podejmowania decyzji u realnych pacjentów.</p>
</main></body></html>`;
}

module.exports = { utworzSerwer, adresySieci, adresLokalny };
