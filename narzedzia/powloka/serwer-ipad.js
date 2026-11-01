// MS Konsylium na iPadzie: serwer w sieci lokalnej, uruchamiany przyciskiem w aplikacji Windows.
// iPad otwiera w Safari te same ekrany (app/ipad.html + moduły), a wszystkie operacje na plikach
// idą przez /api do tych samych funkcji, z których korzysta okno Windows (folder Konsylium).
// Zasady: domyślnie wyłączony; odpowiada tylko adresom z sieci lokalnej; dane tylko z kluczem
// parowania (kod QR); nic nie wychodzi do internetu (serwer niczego sam nie pobiera).
'use strict';
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const crypto = require('node:crypto');
const os = require('node:os');

const OPERACJE = ['folder', 'czytaj', 'zapisz', 'lista', 'czytajFolder'];
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
    if (!OPERACJE.includes(op)) return json(req, res, 404, { blad: 'Nieznana operacja.' });
    const kawalki = []; let dl = 0;
    for await (const k of req) { dl += k.length; if (dl > MAX_ZADANIE) return json(req, res, 413, { blad: 'Za duże żądanie.' }); kawalki.push(k); }
    let args = [];
    try { const b = JSON.parse(Buffer.concat(kawalki).toString('utf8') || '{}'); args = Array.isArray(b.args) ? b.args : []; }
    catch { return json(req, res, 400, { blad: 'Złe żądanie.' }); }
    const zdalny = String(req.socket.remoteAddress || '').replace(/^::ffff:/, '');
    if (!widziane.has(zdalny)) { widziane.add(zdalny); if (o.naZdarzenie) o.naZdarzenie({ typ: 'polaczenie', adres: zdalny }); }
    try {
      const a = args.map((x) => (x == null ? '' : String(x)));
      const wynik = await o.pliki[op](...a);
      json(req, res, 200, { wynik: wynik === undefined ? null : wynik });
    } catch (err) {
      json(req, res, 200, { blad: String((err && err.message) || err) });
    }
  }

  const serwer = http.createServer((req, res) => {
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
  });
  serwer.keepAliveTimeout = 5000;
  serwer.headersTimeout = 15000;
  serwer.requestTimeout = 60000;
  return serwer;
}

module.exports = { utworzSerwer, adresySieci, adresLokalny };
