// Składa wywiad w samodzielne pliki HTML działające offline.
// Użycie: node narzedzia/wywiad/zbuduj.mjs
//   dist/WYWIAD-PACJENTA-<wersja>.html  — moduł do aplikacji Windows (pełny dokument, CSP bez sieci, krój wbudowany)
//   dist/podglad-artefakt.html          — ta sama strona do podglądu w Claude (bez CSP, krój z Google Fonts)
//   dist/wykrywanie.js                  — reguły anonimizatora jako zwykły skrypt (window.WykrywanieDanych)
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const WERSJA = '0.5.1';
const tu = dirname(fileURLToPath(import.meta.url));
const dist = join(tu, 'dist');
mkdirSync(dist, { recursive: true });

// 1. Reguły anonimizatora (moduł ES) → zwykły skrypt z globalnym obiektem
const wykrywanieZrodlo = readFileSync(join(tu, '../anonimizator/src/wykrywanie.js'), 'utf8');
if (/^\s*import\s/m.test(wykrywanieZrodlo)) throw new Error('wykrywanie.js ma importy — trzeba go zbundlować');
const nazwy = [...wykrywanieZrodlo.matchAll(/^export (?:const|function) (\w+)/gm)].map((m) => m[1]);
const wykrywanie = '(function () {\n' + wykrywanieZrodlo.replace(/^export /gm, '') +
  `\nwindow.WykrywanieDanych = { ${nazwy.join(', ')} };\n})();\n`;
writeFileSync(join(dist, 'wykrywanie.js'), wykrywanie);

// 2. Krój Plus Jakarta Sans (jak w Nawigatorze), jeśli jest zainstalowany w powłoce albo w anonimizatorze
let fontCss = '';
for (const nm of ['../powloka/node_modules', '../anonimizator/node_modules']) {
  const kat = join(tu, nm, '@fontsource-variable/plus-jakarta-sans/files');
  if (!existsSync(kat)) continue;
  const b64 = (f) => readFileSync(join(kat, f)).toString('base64');
  fontCss =
    `@font-face{font-family:'Plus Jakarta Sans Variable';font-style:normal;font-weight:200 800;font-display:swap;src:url(data:font/woff2;base64,${b64('plus-jakarta-sans-latin-wght-normal.woff2')}) format('woff2');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}` +
    `@font-face{font-family:'Plus Jakarta Sans Variable';font-style:normal;font-weight:200 800;font-display:swap;src:url(data:font/woff2;base64,${b64('plus-jakarta-sans-latin-ext-wght-normal.woff2')}) format('woff2');unicode-range:U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF}`;
  break;
}
if (!fontCss) console.warn('Brak kroju Plus Jakarta Sans w node_modules: aplikacja użyje Segoe UI.');

// 3. Wspólne składanie
const tokeny = readFileSync(join(tu, '../wspolne/ms-tokeny.css'), 'utf8');
function zloz({ font, fontLink, naPoczatku }) {
  let html = readFileSync(join(tu, 'index.html'), 'utf8');
  html = html.replace(/<link rel="stylesheet" href="\.\.\/wspolne\/ms-tokeny\.css">\n?/, '');
  html = html.replace('/*@@MS-TOKENY@@*/', () => tokeny).replace('/*@@FONT@@*/', () => font).replace('<!--@@FONT-LINK@@-->', () => fontLink);
  html = html.replace(/<script src="((?:\.\.\/wspolne\/)?[\w.-]+\.js)"><\/script>/g, (_, plik) => {
    const src = plik === 'wykrywanie.js' ? wykrywanie : readFileSync(join(tu, plik), 'utf8');
    return '<script>\n' + src.replace(/<\/script/gi, '<\\/script') + '\n</script>';
  });
  return naPoczatku + html;
}

// 3a. Aplikacja Windows: pełny dokument, sieć zablokowana
const csp = "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: blob:; font-src data:; connect-src 'none'; base-uri 'none'; form-action 'none'";
const aplikacja = `<!doctype html>
<html lang="pl" data-motyw="jasny">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="${csp}">
<meta name="referrer" content="no-referrer">
<script>window.MS_WERSJA_WYWIADU = '${WERSJA}';</script>
` + zloz({ font: fontCss, fontLink: '', naPoczatku: '' }) + '\n</html>\n';
const adresy = aplikacja.replace(/data:[^)'"]+/g, '').match(/(src|href)=["']https?:\/\/[^"']+/g);
if (adresy) throw new Error('Moduł offline odwołuje się do sieci: ' + adresy.join(', '));
const celA = join(dist, `WYWIAD-PACJENTA-${WERSJA}.html`);
writeFileSync(celA, aplikacja);

// 3b. Podgląd w Claude (artefakt): bez szkieletu dokumentu, motyw z ustawień systemu
const podglad = zloz({
  font: '',
  fontLink: '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400..800&display=swap">',
  naPoczatku: `<script>window.MS_MOTYW_Z_SYSTEMU = true; window.MS_WERSJA_WYWIADU = '${WERSJA}';</script>\n`
});
writeFileSync(join(dist, 'podglad-artefakt.html'), podglad);

console.log('Zapisano', celA, (aplikacja.length / 1024).toFixed(0) + ' KB', fontCss ? '(z krojem)' : '(bez kroju)');
