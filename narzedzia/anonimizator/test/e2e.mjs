// Test w prawdziwej przeglądarce (Playwright + Chromium):
//   node test/e2e.mjs
// 1) z fikcyjnego wyniku (test/przyklad-synevo.html) robi PDF z warstwą tekstu i zdjęcie PNG,
// 2) otwiera ANONIMIZATOR-WYNIKOW-*.html z dysku (file://) i sprawdza, że NIE MA żadnego żądania sieciowego,
// 3) sprawdza propozycje, ręczne zaznaczenie, zapis PDF (bez tekstu, tylko obraz) i tekstu.
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright'); // Playwright zainstalowany globalnie albo w projekcie
import { readdirSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';

const tu = join(dirname(fileURLToPath(import.meta.url)), '..');
const wyj = join(tu, 'test', 'wyniki');
mkdirSync(wyj, { recursive: true });
const aplikacja = readdirSync(tu).find((f) => /^ANONIMIZATOR-WYNIKOW-.*\.html$/.test(f));
assert.ok(aplikacja, 'najpierw: node build.mjs');

const przegladarka = await chromium.launch();
// fikcyjny wynik → PDF i PNG
{
  const s = await przegladarka.newPage({ viewport: { width: 794, height: 1123 } });
  await s.goto(pathToFileURL(join(tu, 'test/przyklad-synevo.html')).href);
  await s.pdf({ path: join(wyj, 'przyklad.pdf'), format: 'A4', printBackground: true });
  await s.screenshot({ path: join(wyj, 'przyklad.png'), fullPage: true });
  await s.close();
}

const kontekst = await przegladarka.newContext({ acceptDownloads: true, viewport: { width: 1400, height: 1000 } });
const zadania = [];
kontekst.on('request', (r) => { if (!/^(file|blob|data):/.test(r.url())) zadania.push(r.url()); });
const strona = await kontekst.newPage();
const bledy = [];
strona.on('pageerror', (e) => bledy.push(e.message));
strona.on('console', (m) => { if (m.type() === 'error') bledy.push(m.text()); });
await strona.goto(pathToFileURL(join(tu, aplikacja)).href);

async function sprawdz(plik, etykieta) {
  await strona.setInputFiles('#plik', join(wyj, plik));
  await strona.waitForFunction(() => /^(Gotowe|Błąd)/.test(document.querySelector('#status').textContent), null, { timeout: 180000 });
  const st = await strona.textContent('#status');
  assert.match(st, /^Gotowe/, st);
  const ramki = await strona.evaluate(() => window.__anonimizator.aktywne().map((r) => ({ k: r.kategoria, t: r.tekst })));
  const txt = await strona.evaluate(() => window.__anonimizator.tekst());
  console.log(`\n── ${etykieta}: ${st}`);
  for (const r of ramki) console.log(`   [${r.k}] ${r.t}`);
  await strona.screenshot({ path: join(wyj, `ekran-${etykieta}.png`), fullPage: false });
  return { ramki, txt };
}

// ── PDF z warstwą tekstu ──
const a = await sprawdz('przyklad.pdf', 'pdf');
const kat = (k) => a.ramki.filter((r) => r.k === k).map((r) => r.t).join(' | ');
assert.match(kat('pacjent'), /KOWALSKI JAN/);
assert.match(kat('pesel'), /85010112345/);
assert.match(kat('urodzenie'), /01\.01\.1985/);
assert.match(kat('adres'), /Długa/);
assert.match(kat('adres'), /600/);
assert.match(kat('zlecenie'), /7712345678/);
assert.match(kat('zlecenie'), /AB12CD/);
assert.match(kat('lekarz'), /Nowak/);
assert.match(kat('personel'), /Wiśniewski/);
assert.ok(a.ramki.some((r) => r.k === 'kod'), 'kod kreskowy');
for (const zakazane of ['KOWALSKI', '85010112345', '01.01.1985', 'Długa', 'Nowak', 'Wiśniewski', '7712345678', 'AB12CD', '600 700'])
  assert.ok(!a.txt.includes(zakazane), 'w tekście zostało: ' + zakazane);
for (const zostaje of ['Hemoglobina', '14,2', '13,5 - 17,5', 'TSH', '1,234', 'Płeć: M', '12.10.2026'])
  assert.ok(a.txt.includes(zostaje), 'z tekstu zniknęło: ' + zostaje);

// ręczne zaznaczenie: przeciągnięcie po słowie „Morfologia”
const ile0 = await strona.evaluate(() => window.__anonimizator.aktywne().length);
const b = await strona.locator('.strona .warstwa').first().boundingBox();
await strona.mouse.move(b.x + b.width * 0.05, b.y + b.height * 0.2);
await strona.mouse.down();
await strona.mouse.move(b.x + b.width * 0.3, b.y + b.height * 0.24, { steps: 5 });
await strona.mouse.up();
assert.equal(await strona.evaluate(() => window.__anonimizator.aktywne().length), ile0 + 1, 'ręczna ramka');
// wyłączenie propozycji kliknięciem i cofnięcie
await strona.locator('.r.on').first().click();
assert.equal(await strona.evaluate(() => window.__anonimizator.aktywne().length), ile0);
await strona.keyboard.press('Control+z');
assert.equal(await strona.evaluate(() => window.__anonimizator.aktywne().length), ile0 + 1);

await strona.click('#b-podglad');
await strona.screenshot({ path: join(wyj, 'ekran-podglad.png') });
await strona.click('#b-podglad');

const [pobr] = await Promise.all([strona.waitForEvent('download'), strona.click('#b-pdf')]);
assert.match(pobr.suggestedFilename(), /^wynik-zanonimizowany-\d{4}-\d{2}-\d{2}\.pdf$/);
const sciezka = join(wyj, 'zanonimizowany.pdf');
await pobr.saveAs(sciezka);
// wynikowy PDF: same obrazy, bez warstwy tekstu, bez śladu danych
const surowy = readFileSync(sciezka).toString('latin1');
assert.ok(!/KOWALSKI|85010112345/.test(surowy));
const pdfjs = await import(pathToFileURL(join(tu, 'node_modules/pdfjs-dist/legacy/build/pdf.mjs')).href);
const dok = await pdfjs.getDocument({ data: new Uint8Array(readFileSync(sciezka)) }).promise;
assert.equal(dok.numPages, 1);
assert.equal((await (await dok.getPage(1)).getTextContent()).items.length, 0, 'PDF nie może mieć tekstu');
const meta = await dok.getMetadata();
console.log('   metadane wyniku:', JSON.stringify(meta.info.Title), JSON.stringify(meta.info.Producer));

// ── zdjęcie (OCR) ──
const c = await sprawdz('przyklad.png', 'zdjecie-ocr');
const katc = (k) => c.ramki.filter((r) => r.k === k).map((r) => r.t).join(' | ');
assert.match(katc('pacjent'), /KOWALSKI/);
assert.match(katc('pesel'), /85010112345/);
for (const zakazane of ['KOWALSKI', '85010112345', '01.01.1985'])
  assert.ok(!c.txt.includes(zakazane), 'OCR: w tekście zostało: ' + zakazane);
writeFileSync(join(wyj, 'tekst-ocr.txt'), c.txt);
writeFileSync(join(wyj, 'tekst-pdf.txt'), a.txt);

assert.deepEqual(zadania, [], 'żądania sieciowe: ' + zadania.join(', '));
assert.deepEqual(bledy.filter((e) => !/Warning/i.test(e)), [], 'błędy w konsoli');
console.log('\nOK — zero żądań sieciowych, wszystkie sprawdzenia przeszły.');
await przegladarka.close();
