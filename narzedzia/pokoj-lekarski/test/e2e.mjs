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
assert.equal(await p.locator('.postac').count(), 14, '12 stałych postaci + 2 rezydentów');
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
assert.equal(await p.locator('.postac').count(), 15, 'w sprawie 01 było 3 rezydentów');
assert.deepEqual(siec, [], 'zero żądań sieciowych');
assert.deepEqual(bledy, [], 'bez błędów strony');
await b.close();
console.log('e2e OK');
