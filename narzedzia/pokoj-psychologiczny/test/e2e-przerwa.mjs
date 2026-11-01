// Test w przeglądarce: przerwa w Pokoju, gdy AI pracuje (Michał 1.11): po dojściu do ostatniej wypowiedzi bez werdyktu
// lekarze wychodzą z pokoju, tablica liczy czas narady, chip „AI pracuje” jest widoczny; nowa wypowiedź sprowadza ich z powrotem.
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
// sprawa jeszcze bez werdyktu: konsylium „pracuje”
delete pliki['sprawy/2026-10-31-02/09-FINAL.md']; delete pliki['sprawy/2026-10-31-02/10-followup.md'];
// tablica ustaleń (Michał 1.11): lekarze zapisują najważniejsze rzeczy, odrzucone skreślają
pliki['sprawy/2026-10-31-02/_log.jsonl'] = (pliki['sprawy/2026-10-31-02/_log.jsonl'] || '')
  + JSON.stringify({ ts: '2026-10-31T10:20:00+00:00', zdarzenie: 'tablica', rola: 'ordynator', faza: 'Konsylium runda 1', tekst: 'Lider: pozostałość tabletki XR (p 0,22)' }) + '\n'
  + JSON.stringify({ ts: '2026-10-31T10:21:00+00:00', zdarzenie: 'tablica', rola: 'najgorszy_scenariusz', faza: 'Konsylium runda 1', tekst: 'Krwawienie z przewodu pokarmowego', skreslone: true }) + '\n';

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1400, height: 900 } });
const siec = []; const bledy = [];
p.on('request', (r) => { if (!r.url().startsWith('file:') && !r.url().startsWith('data:') && !r.url().startsWith('about:')) siec.push(r.url()); });
p.on('pageerror', (e) => bledy.push(e.message));
// powłoka: strona nadrzędna z ramką i mostem (jak narzedzia/powloka/app/index.html)
// pusta strona-powłoka w tym samym katalogu (file://), żeby ramka file:// mogła się załadować
import('node:fs').then(({ writeFileSync }) => writeFileSync(join(tu, '..', '_powloka-test2.html'), '<!doctype html><meta charset="utf-8"><title>powłoka test</title>'));
await p.goto('file://' + join(tu, '..', '_powloka-test2.html'));
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
assert.match(await r.locator('#opis-sprawy').innerText(), /na żywo/);
assert.equal(await r.locator('.postac[data-kto="ordynator"] .herbata').count(), 1, 'prowadzący ma kubek herbaty (bez fajki)');
// skok na koniec dyskusji (jak kliknięcie ostatniego wpisu w protokole)
await r.locator('#protokol-btn').click();
await r.locator('.wpis').last().click();
await p.waitForTimeout(300);
// tablica: stan prac (etapy) zamiast paska na dole, ustalenia z odrzuconym skreślonym
assert.equal(await r.locator('#os').count(), 0, 'pasek etapów na dole usunięty');
assert.ok(await r.locator('#tablica .etap').count() >= 5, 'etapy konsylium na tablicy');
assert.equal(await r.locator('#tablica .etap.biezacy').count(), 1, 'jeden etap bieżący');
assert.equal(await r.locator('#tablica .ustalenia li').count(), 2, 'dwa ustalenia na tablicy');
assert.match(await r.locator('#tablica .ustalenia li.skreslone s').innerText(), /Krwawienie/, 'odrzucona hipoteza skreślona');
// mały wykres prognoz dla lekarza prowadzącego: procenty tylko tu, nie w dymkach
assert.equal(await r.locator('#prognoza').isVisible(), false, 'wykres prognoz domyślnie ukryty');
await r.locator('#prognoza-btn').click();
assert.equal(await r.locator('#prognoza').isVisible(), true, 'wykres prognoz po kliknięciu');
assert.match(await r.locator('#prognoza').innerText(), /Mapa zgody[\s\S]*\d+%/i, "mapa zgody w procentach");
await p.screenshot({ path: join(tu, '..', '_zrzut-tablica.png') });
// sygnał „AI pracuje” z powłoki
await p.evaluate(() => document.getElementById('ramka').contentWindow.postMessage({ typ: 'ms-ai', aktywne: true, od: Date.now() - 30000 }, '*'));
await p.waitForTimeout(400);
assert.match(await r.locator('#chip-ai').innerText(), /AI pracuje · 0:3\d/i, 'chip z czasem pracy AI');
await r.locator('body').evaluate(() => { window.__progWyjscia = 40000; }); // AI pracuje od 30 s → próg liczony od początku pracy AI mija 10 s po sygnale
await p.waitForTimeout(5000);
// etap 1 (Michał 1.11 04:05): lekarze zostają przy stole i piszą opinie na laptopach
assert.equal(await r.locator('.pokoj.pisza').count(), 1, 'lekarze piszą opinie przy stole');
assert.equal(await r.locator('.pokoj.przerwa').count(), 0, 'jeszcze nie wyszli');
assert.match(await r.locator('#tablica').innerText(), /piszą notatki/i, "tablica: terapeuci piszą");
assert.ok(await r.locator('.laptop').count() >= 6, 'laptopy na stole');
await p.screenshot({ path: join(tu, '..', '_zrzut-pisza.png') });
// etap 2: namysł dłuższy niż próg (w aplikacji 90 s od początku pracy AI, w teście 40 s) → wychodzą z pokoju
await p.waitForTimeout(6500);
assert.equal(await r.locator('.pokoj.pisza').count(), 0, 'koniec etapu pisania');
assert.equal(await r.locator('.pokoj.przerwa').count(), 1, 'lekarze wyszli: pokój w przerwie');
assert.match(await r.locator('#tablica').innerText(), /Konsylium pracuje/i, 'tablica pokazuje naradę');
await p.waitForTimeout(3200); // lekarze idą do drzwi
const op = await r.locator('.postac[data-kto="bayes"]').evaluate((el) => getComputedStyle(el).opacity);
assert.ok(+op < .5, 'lekarz zniknął za drzwiami: ' + op);
assert.equal(await r.locator('.postac[data-kto="lekarz_prowadzacy"]').evaluate((el) => getComputedStyle(el).opacity), '1', 'lekarz prowadzący zostaje');
// nowa wypowiedź w _log.jsonl → lekarze wracają i mówią
await p.evaluate(() => { window.__pliki['sprawy/2026-10-31-02/_log.jsonl'] += JSON.stringify({ ts: new Date().toISOString(), zdarzenie: 'wypowiedz', rola: 'bayes', faza: 'Follow-up', skrot: 'Po przerwie: podtrzymuję ranking, pilność 4.' }) + '\n'; });
await p.waitForTimeout(3600);
assert.equal(await r.locator('.pokoj.przerwa').count(), 0, 'przerwa zakończona');
await p.waitForTimeout(6500);
assert.match(await r.locator('.dymek:not(.stary)').innerText(), /Po przerwie/, 'nowa wypowiedź w dymku po powrocie');
assert.deepEqual(siec, [], 'zero żądań sieciowych');
assert.deepEqual(bledy, [], 'bez błędów strony');
await b.close();
(await import('node:fs')).unlinkSync(join(tu, '..', '_powloka-test2.html'));
console.log('e2e-przerwa OK');
