// Buduje jeden plik HTML „Pokój lekarski” (offline, bez zasobów z sieci).
// Użycie:
//   node build.mjs                          → POKOJ-LEKARSKI-<wersja>.html z demonstracyjną sprawą test/fixtura/2026-10-31-02
//   node build.mjs --sprawa ../../sprawy/X  → osadza inną sprawę jako startową
//   node build.mjs --artefakt plik.html     → dodatkowo wersja bez <head> (do podglądu jako Artifact w Claude)
import { readFileSync, writeFileSync } from 'node:fs';
import { join, basename, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { zbudujScenariusz } from './src/scenariusz.mjs';
import { wczytajSprawe } from './test/pomoc.mjs';

const tu = dirname(fileURLToPath(import.meta.url));
const arg = (n) => { const k = process.argv.indexOf(n); return k > 0 ? process.argv[k + 1] : null; };
const wersja = JSON.parse(readFileSync(join(tu, 'package.json'), 'utf8')).version;
const czytaj = (p) => readFileSync(join(tu, p), 'utf8');

// krój Plus Jakarta Sans osadzony jak w Anonimizatorze (jeśli zainstalowany przez npm install)
let fontCss = '';
try {
  const req = createRequire(import.meta.url);
  const nm = (p) => req.resolve(p);
  const b64 = (p) => readFileSync(nm(p)).toString('base64');
  fontCss =
    `@font-face{font-family:'Plus Jakarta Sans Variable';font-style:normal;font-weight:200 800;font-display:swap;src:url(data:font/woff2;base64,${b64('@fontsource-variable/plus-jakarta-sans/files/plus-jakarta-sans-latin-wght-normal.woff2')}) format('woff2');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}` +
    `@font-face{font-family:'Plus Jakarta Sans Variable';font-style:normal;font-weight:200 800;font-display:swap;src:url(data:font/woff2;base64,${b64('@fontsource-variable/plus-jakarta-sans/files/plus-jakarta-sans-latin-ext-wght-normal.woff2')}) format('woff2');unicode-range:U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF}`;
} catch {
  console.warn('Brak @fontsource-variable/plus-jakarta-sans (npm install) — krój systemowy.');
}

const katalogSprawy = arg('--sprawa') || join(tu, 'test/fixtura/2026-10-31-02');
const demo = zbudujScenariusz(wczytajSprawe(katalogSprawy), basename(katalogSprawy));

const parser = czytaj('src/scenariusz.mjs').replace(/^export /gm, '');
const js = `${parser}\nconst DEMO = ${JSON.stringify(demo).replace(/</g, '\\u003c')};\n${czytaj('../wspolne/ms-most.js')}\n${czytaj('src/plakat.js').replace('/*@@PLAKAT@@*/', () => readFileSync(join(tu, 'zasoby/plakat.jpg')).toString('base64'))}\n${czytaj('src/pokoj.js')}`;
const css = czytaj('src/pokoj.css').replace('/*@@FONT@@*/', () => fontCss);

// strażnik: żadnych adresów sieciowych w kodzie i stylach (poza krojem w data:)
const adresy = (css.replace(fontCss, '') + js).match(/https?:\/\/[^\s'"`)]+/g) || [];
if (adresy.length) { console.error('Znaleziono adresy sieciowe:', adresy); process.exit(1); }

const tytul = `<title>Pokój lekarski</title>`;
const csp = `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; font-src data:; img-src data:">`;
const cialo = czytaj('src/szablon.html').replace('/*@@JS@@*/', () => js);

const pelny = `<!doctype html>
<html lang="pl" data-motyw="ciemny" data-theme="dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
${csp}
${tytul}
<style>${css}</style>
</head>
<body>
${cialo.replace('<!--@@HEAD@@-->', '')}
</body>
</html>
`;
const plik = join(tu, `POKOJ-LEKARSKI-${wersja}.html`);
writeFileSync(plik, pelny);
console.log(`Zbudowano ${basename(plik)} (${(pelny.length / 1024).toFixed(0)} KB), sprawa startowa: ${demo.sprawa}, scen: ${demo.sceny.length}, wypowiedzi: ${demo.sceny.reduce((a, s) => a + s.wypowiedzi.length, 0)}`);

const art = arg('--artefakt');
if (art) {
  const head = `${tytul}\n<meta name="claude:viewport-fit-sides" content="cover">\n<style>${css}</style>`;
  writeFileSync(art, cialo.replace('<!--@@HEAD@@-->', head));
  console.log('Artefakt:', art);
}
