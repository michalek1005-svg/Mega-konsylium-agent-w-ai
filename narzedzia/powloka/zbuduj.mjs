// Buduje aplikację Windows (przenośna, bez instalatora).
// Użycie (w narzedzia/powloka):  npm ci && node zbuduj.mjs [--bez-paczki]
//  1. składa moduł wywiadu w jeden plik HTML,
//  2. dołącza anonimizator, jeśli jest zbudowany (narzedzia/anonimizator/ANONIMIZATOR-WYNIKOW-*.html),
//  3. składa powłokę dla Windows (index.html) i dla iPada (ipad.html, serwer-ipad.js),
//  4. pakuje Electron dla Windows x64 do out/ i robi z tego zip.
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, rmSync, readdirSync, existsSync, copyFileSync, cpSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const tu = dirname(fileURLToPath(import.meta.url));
const narzedzia = join(tu, '..');
const pkg = JSON.parse(readFileSync(join(tu, 'package.json'), 'utf8'));
const build = join(tu, 'build');
rmSync(build, { recursive: true, force: true });
mkdirSync(join(build, 'app', 'moduly'), { recursive: true });

// 1. Wywiad
execFileSync(process.execPath, [join(narzedzia, 'wywiad', 'zbuduj.mjs')], { stdio: 'inherit' });
const distW = join(narzedzia, 'wywiad', 'dist');
const plikW = readdirSync(distW).filter((f) => /^WYWIAD-PACJENTA-.*\.html$/.test(f))
  .sort((a, b) => a.localeCompare(b, 'en', { numeric: true })).pop();
copyFileSync(join(distW, plikW), join(build, 'app', 'moduly', 'wywiad.html'));

// 2. Anonimizator (osobny moduł, budowany w swoim katalogu)
const katA = join(narzedzia, 'anonimizator');
let plikA = null;
for (const kat of [katA, join(katA, 'dist')]) {
  if (!existsSync(kat)) continue;
  const f = readdirSync(kat).filter((x) => /^ANONIMIZATOR-.*\.html$/.test(x)).sort().pop();
  if (f) { plikA = join(kat, f); break; }
}
if (plikA) copyFileSync(plikA, join(build, 'app', 'moduly', 'anonimizator.html'));
else console.warn('Anonimizator nie jest zbudowany: moduł pokaże komunikat „nie dołączono”.');

// 2b. Pokój psychologiczny (widok konsylium na żywo; brat psychologiczny)
const katP = join(narzedzia, 'pokoj-psychologiczny');
const plikP = existsSync(katP) ? readdirSync(katP).filter((x) => /^POKOJ-PSYCHOLOGICZNY-.*\.html$/.test(x))
  .sort((a, b) => a.localeCompare(b, 'en', { numeric: true })).pop() : null;
if (plikP) copyFileSync(join(katP, plikP), join(build, 'app', 'moduly', 'pokoj.html'));
else console.warn('Pokój psychologiczny nie jest zbudowany (cd narzedzia/pokoj-psychologiczny && npm ci && node build.mjs).');

// 3. Powłoka z konfiguracją wklejoną do HTML
const tokeny = readFileSync(join(narzedzia, 'wspolne', 'ms-tokeny.css'), 'utf8');
const wywiadHtml = readFileSync(join(build, 'app', 'moduly', 'wywiad.html'), 'utf8');
const fontCss = (wywiadHtml.match(/@font-face\{[^}]+\}/g) || []).join('');

// 2c. Rozmowa (okno komunikatora z jednym terapeutą AI, narzedzia/rozmowa): jeden plik, sieć zablokowana, krój wbudowany
{
  const CSP_MOD = "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; font-src data:; connect-src 'none'; base-uri 'none'; form-action 'none'";
  let r = readFileSync(join(narzedzia, 'rozmowa', 'index.html'), 'utf8')
    .replace(/<link rel="stylesheet" href="\.\.\/wspolne\/ms-tokeny\.css">\n?/, '')
    .replace('/*@@MS-TOKENY@@*/', () => tokeny).replace('/*@@FONT@@*/', () => fontCss)
    .replace('<script src="../wspolne/ms-most.js"></script>', () => '<script>\n' + readFileSync(join(narzedzia, 'wspolne', 'ms-most.js'), 'utf8') + '\n</script>')
    .replace('<meta charset="utf-8">', () => `<meta charset="utf-8">\n<meta http-equiv="Content-Security-Policy" content="${CSP_MOD}">\n<meta name="referrer" content="no-referrer">`);
  const adresyR = r.replace(/data:[^)'"]+/g, '').match(/(src|href)=["']https?:\/\/[^"']+/g);
  if (adresyR) throw new Error('Rozmowa: adresy sieciowe w module: ' + adresyR.join(', '));
  writeFileSync(join(build, 'app', 'moduly', 'rozmowa.html'), r);
}
const konf = `<script>window.MS_WERSJA = ${JSON.stringify(pkg.version)}; window.MS_MODULY = ${JSON.stringify({ rozmowa: true, wywiad: true, anonimizator: !!plikA, pokoj: !!plikP })};</script>`;
// Prezent „Dla Halusi” (Michał 1.11.2026): TYLKO w pierwszej wersji (0.1.*); od 0.2.0 znika sam
const prezent = /^0\.1\./.test(pkg.version) ? readFileSync(join(tu, 'zasoby', 'prezent-halusia.html'), 'utf8') : '';
const powloka = readFileSync(join(tu, 'app', 'index.html'), 'utf8')
  .replace('<!--KONFIGURACJA-->', () => konf).replace('<!--PREZENT-->', () => prezent).replace('/*@@MS-TOKENY@@*/', () => tokeny).replace('/*@@FONT@@*/', () => fontCss);
writeFileSync(join(build, 'app', 'index.html'), powloka.replace('<!--IPAD-GLOWA-->\n', ''));

// 3b. Ta sama powłoka dla iPada (Safari w sieci lokalnej, serwer-ipad.js): most przez HTTP zamiast preload.js,
//     CSP pozwala tylko na własny adres (komputer), ekran główny i tryb pełnoekranowy iPadOS.
const CSP_WIN = `default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; font-src data:; frame-src file:`;
const CSP_IPAD = `default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src 'self' data:; font-src data:; frame-src 'self'; connect-src 'self'; manifest-src 'self'; base-uri 'none'; form-action 'none'`;
if (!powloka.includes(CSP_WIN)) throw new Error('Zmieniono CSP powłoki: popraw CSP_WIN w zbuduj.mjs.');
const glowaIpad = [
  '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">',
  '<meta name="apple-mobile-web-app-capable" content="yes">',
  '<meta name="mobile-web-app-capable" content="yes">',
  '<meta name="apple-mobile-web-app-title" content="MS Psycho">',
  '<meta name="apple-mobile-web-app-status-bar-style" content="default">',
  '<meta name="theme-color" content="#E6EBEE">',
  '<meta name="format-detection" content="telephone=no">',
  '<link rel="manifest" href="manifest.webmanifest">',
  '<link rel="apple-touch-icon" href="apple-touch-icon.png">',
  '<script>' + readFileSync(join(tu, 'app', 'ipad-most.js'), 'utf8').replace(/<\/script/gi, '<\\/script') + '</script>'
].join('\n');
writeFileSync(join(build, 'app', 'ipad.html'), powloka.replace(CSP_WIN, () => CSP_IPAD).replace('<!--IPAD-GLOWA-->', () => glowaIpad));
copyFileSync(join(tu, 'serwer-ipad.js'), join(build, 'serwer-ipad.js'));
copyFileSync(join(tu, 'node_modules', 'qrcode-generator', 'dist', 'qrcode.js'), join(build, 'qrcode.js'));
copyFileSync(join(tu, 'main.js'), join(build, 'main.js'));
copyFileSync(join(tu, 'preload.js'), join(build, 'preload.js'));
copyFileSync(join(tu, 'zasoby', 'ikona.png'), join(build, 'ikona.png'));
writeFileSync(join(build, 'package.json'), JSON.stringify({ name: pkg.name, productName: pkg.productName, version: pkg.version, main: 'main.js' }, null, 2));
console.log('Złożono aplikację w', build, plikA ? '(z anonimizatorem)' : '(bez anonimizatora)', plikP ? '(z pokojem psychologicznym)' : '(bez pokoju)', prezent ? '(z prezentem startowym)' : '');
// 3c. Kopia gotowych plików w repo (gotowe/): komputer Michała nie ma node ani gita, operator pobiera archiwum commitu
//     z GitHuba i podmienia zawartość resources\app zainstalowanej aplikacji (patrz gotowe/README.md).
const gotowe = join(tu, 'gotowe');
rmSync(gotowe, { recursive: true, force: true });
cpSync(build, gotowe, { recursive: true });
writeFileSync(join(gotowe, 'README.md'), [
  '# Gotowe pliki aplikacji MS Konsylium Psychologiczne (bez budowania)',
  '',
  'Ten katalog to wynik `node zbuduj.mjs` (zawartość `resources\\app` w zainstalowanej aplikacji Windows). Generowany automatycznie — nie edytować ręcznie.',
  '',
  'Wdrożenie na komputerze bez node i gita: pobierz archiwum commitu z GitHuba, zamknij MS Konsylium,',
  'podmień całą zawartość `MS-Konsylium\\resources\\app` (albo folderu wskazanego w skrócie) na zawartość tego katalogu i uruchom aplikację ponownie.',
  'Electron (MS-Konsylium.exe i reszta `resources`) zostaje bez zmian, dopóki nie zmieni się numer wersji Electrona w package.json.',
  'Do folderu Konsylium (kopia repo) trzeba osobno skopiować `skrypty/` z tego samego commitu.',
  ''
].join('\n'));
console.log('Skopiowano gotowe pliki do', gotowe);

if (process.argv.includes('--bez-paczki')) process.exit(0);

// 4. Paczka Windows x64
const { packager } = await import('@electron/packager');
const out = join(tu, 'out');
rmSync(out, { recursive: true, force: true });
const [katalog] = await packager({
  dir: build, out, platform: 'win32', arch: 'x64', overwrite: true,
  name: 'MS-Konsylium-Psychologiczne', executableName: 'MS Konsylium Psychologiczne', icon: join(tu, 'zasoby', 'ikona.ico'),
  appCopyright: 'Marka MS', win32metadata: { ProductName: 'MS Konsylium Psychologiczne', FileDescription: 'MS Konsylium Psychologiczne (test)', CompanyName: 'MS' },
  electronVersion: pkg.devDependencies.electron, asar: true, prune: false
});
const zip = join(out, `MS-Konsylium-Psychologiczne-${pkg.version}-win-x64.zip`);
execFileSync('zip', ['-qr9', zip, '.'], { cwd: katalog });
console.log('Gotowe:', zip);
