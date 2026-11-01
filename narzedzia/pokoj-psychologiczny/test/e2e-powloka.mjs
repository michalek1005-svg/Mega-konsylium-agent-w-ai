// Test w przeglądarce: Pokój osadzony jak w aplikacji MS Konsylium (ramka + most postMessage).
// Sprawdza: tryb na żywo z folderu Konsylium, pole „Lekarz prowadzący” zapisuje do sprawy/<ID>/uwagi-terapeuty.jsonl,
// wpis pojawia się jako dymek i w protokole, dym ordynatora się rysuje, bez żądań sieciowych.
import { createRequire } from 'node:module';
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const tu = dirname(fileURLToPath(import.meta.url));
const wersja = JSON.parse(readFileSync(join(tu, '../package.json'), 'utf8')).version;
const plik = join(tu, '..', `POKOJ-PSYCHOLOGICZNY-${wersja}.html`);

// pliki sprawy do pamięci „folderu Konsylium”
const pliki = {};
const chodz = (d, rel) => { for (const e of readdirSync(d, { withFileTypes: true })) { if (e.isDirectory()) chodz(join(d, e.name), rel + e.name + '/'); else pliki[rel + e.name] = readFileSync(join(d, e.name), 'utf8'); } };
chodz(join(tu, 'fixtura/2026-10-31-02'), 'sprawy/2026-10-31-02/');

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1400, height: 900 } });
const siec = []; const bledy = [];
p.on('request', (r) => { if (!r.url().startsWith('file:') && !r.url().startsWith('data:') && !r.url().startsWith('about:')) siec.push(r.url()); });
p.on('pageerror', (e) => bledy.push(e.message));
// powłoka: strona nadrzędna z ramką i mostem (jak narzedzia/powloka/app/index.html)
// pusta strona-powłoka w tym samym katalogu (file://), żeby ramka file:// mogła się załadować
import('node:fs').then(({ writeFileSync }) => writeFileSync(join(tu, '..', '_powloka-test.html'), '<!doctype html><meta charset="utf-8"><title>powłoka test</title>'));
await p.goto('file://' + join(tu, '..', '_powloka-test.html'));
await p.evaluate(([src, pl]) => {
  window.__pliki = pl;
  const teraz = Date.now();
  const OP = {
    ping: () => 'ms-powloka-1', folder: () => 'C:/Konsylium',
    czytaj: ([s]) => { if (!(s in window.__pliki)) throw new Error('Nie ma pliku ' + s); return window.__pliki[s]; },
    zapisz: ([s, t]) => { window.__pliki[s] = t; return true; },
    lista: ([s]) => { const pre = s ? s + '/' : ''; const m = new Map(); for (const k of Object.keys(window.__pliki)) { if (!k.startsWith(pre)) continue; const r = k.slice(pre.length).split('/'); const n = r[0]; if (!m.has(n)) m.set(n, { nazwa: n, katalog: r.length > 1, zmiana: teraz }); } return [...m.values()]; },
    czytajFolder: ([s]) => { const pre = s + '/'; return Object.keys(window.__pliki).filter((k) => k.startsWith(pre)).map((k) => ({ sciezka: k.slice(pre.length), tekst: window.__pliki[k] })); },
  };
  window.addEventListener('message', (e) => {
    const d = e.data; if (!d || d.typ !== 'ms-most') return;
    try { const w = OP[d.op](d.args || []); e.source.postMessage({ typ: 'ms-most-odp', id: d.id, wynik: w }, '*'); }
    catch (err) { e.source.postMessage({ typ: 'ms-most-odp', id: d.id, wynik: null, blad: String(err.message || err) }, '*'); }
  });
  const f = document.createElement('iframe'); f.id = 'ramka'; f.src = src; f.style.cssText = 'width:1300px;height:820px;border:0'; document.body.appendChild(f);
}, ['file://' + plik, pliki]);
const r = p.frameLocator('#ramka');
await p.waitForTimeout(1500);
assert.match(await r.locator('#opis-sprawy').innerText(), /2026-10-31-02 · na żywo/, 'najnowsza sprawa z folderu Konsylium');
assert.equal(await r.locator('html.osadzony').count(), 1, 'tryb osadzony');
assert.equal(await r.locator('#glos').isVisible(), true, 'pole lekarza prowadzącego widoczne na żywo');
assert.equal(await r.locator('.postac[data-kto="lekarz_prowadzacy"]').count(), 1, 'lekarz prowadzący stoi w pokoju');
assert.equal(await r.locator('.postac[data-kto="ordynator"] .herbata').count(), 1, 'prowadzący ma kubek herbaty');
const wpisow = await r.locator('.wpis').count();
await r.locator('#glos-tekst').fill('Proszę rozważyć krztusiec: pacjentka pracuje na oddziale, kaszel napadowy od 10 dni.');
await r.locator('#glos-tekst').press('Enter');
await p.waitForTimeout(800);
const zapis = await p.evaluate(() => window.__pliki['sprawy/2026-10-31-02/uwagi-terapeuty.jsonl']);
assert.ok(zapis, 'wpis zapisany do uwagi-terapeuty.jsonl');
const u = JSON.parse(zapis.trim().split('\n').pop());
assert.equal(u.rola, 'lekarz_prowadzacy'); assert.match(u.pelny, /krztusiec/); assert.ok(u.faza, 'faza wpisu');
assert.match(await r.locator('.dymek:not(.stary)').innerText(), /Terapeuta prowadzący[\s\S]*krztusiec/i, 'dymek lekarza od razu na scenie');
assert.equal(await r.locator('#glos-tekst').inputValue(), '', 'pole wyczyszczone');
await p.waitForTimeout(3600);
assert.equal(await r.locator('.wpis').count(), wpisow + 1, 'wpis lekarza dociągnięty do protokołu');
assert.match(await r.locator("#lista").innerText(), /Terapeuta prowadzący/);
// drugi wpis dopisuje się, nie nadpisuje
await r.locator('#glos-tekst').fill('Druga uwaga.');
await r.locator('#glos-wyslij').click();
await p.waitForTimeout(500);
assert.equal((await p.evaluate(() => window.__pliki['sprawy/2026-10-31-02/uwagi-terapeuty.jsonl'])).trim().split('\n').length, 2, 'dwa wpisy w pliku');
assert.equal(await r.locator('#plakat').count(), 1, 'plakat z serduszkiem na ścianie');
assert.equal(await r.locator('#dym').count(), 1, 'warstwa dymu');
assert.deepEqual(siec, [], 'zero żądań sieciowych');
assert.deepEqual(bledy, [], 'bez błędów strony');
await b.close();
(await import('node:fs')).unlinkSync(join(tu, '..', '_powloka-test.html'));
console.log('e2e-powloka OK');
