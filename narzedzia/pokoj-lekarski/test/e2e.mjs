// Test w prawdziwej przeglądarce (Playwright, file://): pokój się rysuje, dymek pojawia się nad mówiącym,
// wczytanie folderu sprawy działa, a strona nie wykonuje żadnych żądań sieciowych.
import { createRequire } from 'node:module';
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const tu = dirname(fileURLToPath(import.meta.url));
const wersja = JSON.parse(readFileSync(join(tu, '../package.json'), 'utf8')).version;
const plik = join(tu, '..', `POKOJ-LEKARSKI-${wersja}.html`);

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1400, height: 900 } });
const siec = []; const bledy = [];
p.on('request', (r) => { if (!r.url().startsWith('file:') && !r.url().startsWith('data:')) siec.push(r.url()); });
p.on('pageerror', (e) => bledy.push(e.message));
await p.goto('file://' + plik);
assert.equal(await p.locator('.postac').count(), 15, '12 stałych postaci + lekarz prowadzący + 2 rezydentów');
await p.click('#dalej'); await p.waitForTimeout(1000);
const kto = await p.locator('.postac.aktywna').getAttribute('data-kto');
assert.ok(kto, 'ktoś mówi');
const dymek = await p.locator('.dymek:not(.stary)').boundingBox();
const postac = await p.locator('.postac.aktywna').boundingBox();
assert.ok(dymek.y + dymek.height <= postac.y + 12, 'dymek jest nad głową mówiącego');
assert.match(await p.locator('#tablica').innerText(), /TERAZ/i);
// wczytanie innej sprawy (folder)
const katalog = join(tu, 'fixtura/2026-10-31-01');
const pliki = [];
const chodz = (d, rel) => { for (const e of readdirSync(d, { withFileTypes: true })) { if (e.isDirectory()) chodz(join(d, e.name), rel + e.name + '/'); else pliki.push({ name: e.name, rel: rel + e.name, text: readFileSync(join(d, e.name), 'utf8') }); } };
chodz(katalog, '2026-10-31-01/');
await p.evaluate((pl) => {
  const dt = new DataTransfer();
  for (const f of pl) { const x = new File([f.text], f.name); Object.defineProperty(x, 'webkitRelativePath', { value: f.rel }); dt.items.add(x); }
  const inp = document.getElementById('folder'); Object.defineProperty(inp, 'files', { value: dt.files }); inp.dispatchEvent(new Event('change'));
}, pliki);
await p.waitForTimeout(500);
assert.match(await p.locator('#opis-sprawy').innerText(), /2026-10-31-01/);
assert.equal(await p.locator('.postac').count(), 16, 'w sprawie 01 było 3 rezydentów');

// tryb na żywo: udawany folder (File System Access API), do którego „ordynator” dopisuje dymek
const p2 = await b.newPage({ viewport: { width: 1400, height: 900 } });
p2.on('pageerror', (e) => bledy.push(e.message));
p2.on('request', (r) => { if (!r.url().startsWith('file:') && !r.url().startsWith('data:')) siec.push(r.url()); });
const pl02 = {};
const chodz2 = (d, rel) => { for (const e of readdirSync(d, { withFileTypes: true })) { if (e.isDirectory()) chodz2(join(d, e.name), rel + e.name + '/'); else pl02[rel + e.name] = readFileSync(join(d, e.name), 'utf8'); } };
chodz2(join(tu, 'fixtura/2026-10-31-02'), '');
await p2.addInitScript((pliki) => {
  window.__pliki = pliki;
  const katalog = (prefiks) => ({ kind: 'directory', name: prefiks ? prefiks.slice(0, -1).split('/').pop() : 'sprawa-na-zywo',
    async *entries() {
      const dzieci = new Set();
      for (const k of Object.keys(window.__pliki)) {
        if (!k.startsWith(prefiks)) continue;
        const reszta = k.slice(prefiks.length); const i = reszta.indexOf('/');
        if (i < 0) yield [reszta, { kind: 'file', getFile: async () => new File([window.__pliki[k]], reszta) }];
        else if (!dzieci.has(reszta.slice(0, i))) { dzieci.add(reszta.slice(0, i)); yield [reszta.slice(0, i), katalog(prefiks + reszta.slice(0, i) + '/')]; }
      }
    } });
  window.showDirectoryPicker = async () => katalog('');
}, pl02);
await p2.goto('file://' + plik);
assert.equal(await p2.locator('#zywo').isVisible(), true, 'przycisk Na żywo widoczny');
await p2.click('#zywo');
await p2.waitForTimeout(400);
assert.match(await p2.locator('#opis-sprawy').innerText(), /na żywo/);
const ileWpisow = await p2.locator('.wpis').count();
await p2.evaluate(() => { window.__pliki['_log.jsonl'] += '\n' + JSON.stringify({ ts: '2026-10-31T12:45:00Z', zdarzenie: 'wypowiedz', rola: 'bayes', faza: 'Konsylium · runda 2', skrot: 'Nowy dymek z trwającej sprawy.' }); });
await p2.waitForTimeout(3600);
assert.equal(await p2.locator('.wpis').count(), ileWpisow + 1, 'dymek dociągnięty bez przeładowania');
assert.match(await p2.locator('#lista').innerText(), /Nowy dymek z trwającej sprawy/);

assert.deepEqual(siec, [], 'zero żądań sieciowych');
assert.deepEqual(bledy, [], 'bez błędów strony');
await b.close();
console.log('e2e OK');
