// e2e (Chromium): innowacje Pokoju z ankiety 2.11 – Mapa sporu na ścianie wideo, odznaka źródła przy dymku, Karta sprawy na koniec.
// Uruchomienie: CHROMIUM_PATH=/sciezka/chromium node test/e2e-innowacje.mjs (po node build.mjs)
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import assert from 'node:assert/strict';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const tu = dirname(fileURLToPath(import.meta.url));
let html = readFileSync(join(tu, '..', 'POKOJ-LEKARSKI-0.3.0.html'), 'utf8');
// dane sporu wstrzyknięte do osadzonej sprawy (kontrakt: scen.tablica.spor)
const spor = [{ si: 4, pytanie: 'Kulka = tabletka widmo czy kamień?', za: ['hipotezujacy', 'bayes'], przeciw: ['najgorszy_scenariusz'], przesuniecia: [{ si: 5, kto: 'najgorszy_scenariusz', fakt: 'matryca Siofor XR' }], otwarte: false }];
assert.ok(html.includes('"tablica":{'), 'osadzona sprawa ma tablicę');
html = html.replace('"tablica":{', '"tablica":{"spor":' + JSON.stringify(spor) + ',');

const b = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const p = await b.newPage({ viewport: { width: 1400, height: 820 } });
const bledy = []; p.on('pageerror', (e) => bledy.push(e.message));
await p.setContent(html, { waitUntil: 'load' });
await p.evaluate(() => { document.documentElement.setAttribute('data-motyw', 'jasny'); });
await p.waitForSelector('.wpis');
const wpisy = await p.locator('.wpis').all();
// 1) Mapa sporu: w rundzie konsylium pierwsza kolumna to Mapa sporu z awatarami stron
let runda = -1;
for (let k = 0; k < wpisy.length; k++) { const t = await wpisy[k].innerText(); if (/Pragmatyk|Bayesowski/.test(t) && k > 10) { runda = k; break; } }
assert.ok(runda > 0, 'jest wpis z rundy konsylium');
await wpisy[runda].click(); await p.waitForTimeout(900);
assert.equal(await p.locator('#tablica .kol-spor').count(), 1, 'kolumna Mapa sporu na ścianie wideo');
assert.ok((await p.locator('#tablica .punkt .aw').count()) >= 3, 'awatary stron sporu');
assert.match(await p.locator('#tablica .kol-spor').innerText(), /Kulka = tabletka widmo/, 'pytanie sporne');
assert.equal(await p.locator('#tablica .kol-spor').innerText().then((t) => /%/.test(t)), false, 'bez procentów');
// 2) odznaka źródła: wypowiedź z PMID w pełnym tekście dostaje odznaki; klik = cytat + wpis w protokole
let zPmid = -1;
for (let k = 0; k < wpisy.length; k++) { await wpisy[k].click(); await p.waitForTimeout(250); if (await p.locator('.dymek:not(.stary) .odz').count()) { zPmid = k; break; } }
assert.ok(zPmid >= 0, 'któraś wypowiedź ma odznakę źródła (PMID w opinii)');
await p.waitForTimeout(400);
const odz = p.locator('.dymek:not(.stary) .odz').first();
const et = await odz.innerText(); assert.match(et, /PMID \d+|DOI|Rejestr|RPL|ChPL|wytyczn|PT\w+/i, 'etykieta odznaki: ' + et);
await odz.click(); await p.waitForTimeout(300);
assert.equal(await p.locator('.dymek:not(.stary) .cytat').isVisible(), true, 'cytat po kliknięciu');
assert.equal(await p.locator('#szczegol').isVisible(), true, 'pełny wpis w protokole otwarty');
// 3) Karta sprawy na koniec
await wpisy[wpisy.length - 1].click(); await p.waitForTimeout(1200);
assert.equal(await p.locator('#karta-sprawy').isVisible(), true, 'Karta sprawy na ekranie po werdykcie');
assert.match(await p.locator('#karta-sprawy').innerText(), /Zalecenie[\s\S]*Kiedy wrócić/i, 'pola karty');
await p.locator('#karta-zamknij').click(); await p.waitForTimeout(200);
assert.equal(await p.locator('#karta-sprawy').isVisible(), false, 'karta znika po Zamknij');
await wpisy[runda].click(); await p.waitForTimeout(500);
assert.equal(await p.locator('#karta-sprawy').isVisible(), false, 'karta nie wraca w trakcie dyskusji');
assert.deepEqual(bledy, [], 'bez błędów strony');
await b.close();
console.log('e2e-innowacje OK');
