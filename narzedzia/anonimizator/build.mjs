// Składa całą aplikację w jeden plik HTML działający offline:
//   node build.mjs  →  ANONIMIZATOR-WYNIKOW-<wersja>.html (+ SHA256.txt)
// Biblioteki (pdf.js, Tesseract z językiem polskim, pdf-lib, krój Plus Jakarta Sans) są wbudowane w base64.
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const tu = dirname(fileURLToPath(import.meta.url));
const nm = (p) => join(tu, 'node_modules', p);
const czytaj = (p) => readFileSync(p);
const wersja = JSON.parse(readFileSync(join(tu, 'package.json'), 'utf8')).version;

const zasoby = {
  'z-pdfjs': nm('pdfjs-dist/build/pdf.min.mjs'),
  'z-pdfjs-worker': nm('pdfjs-dist/build/pdf.worker.min.mjs'),
  'z-tesseract': nm('tesseract.js/dist/tesseract.min.js'),
  'z-tesseract-worker': nm('tesseract.js/dist/worker.min.js'),
  'z-tesseract-core': nm('tesseract.js-core/tesseract-core-simd-lstm.wasm.js'),
  'z-pol': nm('@tesseract.js-data/pol/4.0.0_best_int/pol.traineddata.gz'),
  'z-pdflib': nm('pdf-lib/dist/pdf-lib.min.js'),
};

const font = czytaj(nm('@fontsource-variable/plus-jakarta-sans/files/plus-jakarta-sans-latin-ext-wght-normal.woff2')).toString('base64');
const fontLat = czytaj(nm('@fontsource-variable/plus-jakarta-sans/files/plus-jakarta-sans-latin-wght-normal.woff2')).toString('base64');
const fontCss =
  `@font-face{font-family:'Plus Jakarta Sans Variable';font-style:normal;font-weight:200 800;font-display:swap;src:url(data:font/woff2;base64,${fontLat}) format('woff2');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}` +
  `@font-face{font-family:'Plus Jakarta Sans Variable';font-style:normal;font-weight:200 800;font-display:swap;src:url(data:font/woff2;base64,${font}) format('woff2');unicode-range:U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF}`;

const tokeny = readFileSync(join(tu, '../wspolne/ms-tokeny.css'), 'utf8');
const css = readFileSync(join(tu, 'src/style.css'), 'utf8').replace('/*@@FONT@@*/', () => fontCss).replace('/*@@MS-TOKENY@@*/', () => tokeny);
const wykrywanie = readFileSync(join(tu, 'src/wykrywanie.js'), 'utf8').replace(/^export /gm, '');
const aplikacja = readFileSync(join(tu, 'src/aplikacja.js'), 'utf8');
const js = `${wykrywanie}\n// ───── aplikacja ─────\n${aplikacja}`.replace(/<\/script/gi, '<\\/script');

const blokiZasobow = Object.entries(zasoby)
  .map(([id, p]) => `<script type="text/plain" id="${id}">${czytaj(p).toString('base64')}</script>`)
  .join('\n');

let html = readFileSync(join(tu, 'src/szablon.html'), 'utf8');
html = html
  .replace('/*@@CSS@@*/', () => css)
  .replace('<!--@@ZASOBY@@-->', () => blokiZasobow)
  .replace('/*@@JS@@*/', () => js)
  .replace('<title>Anonimizator wyników · Konsylium AI</title>', `<title>Anonimizator wyników ${wersja} · Konsylium AI</title>`);

// Strażnik prywatności: w kodzie aplikacji (poza bibliotekami) nie może być adresów sieciowych.
const adresy = (css.replace(fontCss, '') + js).match(/https?:\/\/[^\s'"`)]+/g) || [];
if (adresy.length) {
  console.error('Strażnik prywatności: w kodzie aplikacji są adresy sieciowe:', adresy);
  process.exit(1);
}

const nazwa = `ANONIMIZATOR-WYNIKOW-${wersja}.html`;
writeFileSync(join(tu, nazwa), html);
const sha = createHash('sha256').update(html).digest('hex');
writeFileSync(join(tu, 'SHA256.txt'), `${sha}  ${nazwa}\n`);
console.log(`${nazwa}: ${(Buffer.byteLength(html) / 1048576).toFixed(1)} MB, SHA-256 ${sha}`);
