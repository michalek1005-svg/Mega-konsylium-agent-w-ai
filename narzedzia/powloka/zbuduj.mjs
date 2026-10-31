// Buduje aplikację Windows (przenośna, bez instalatora).
// Użycie (w narzedzia/powloka):  npm ci && node zbuduj.mjs [--bez-paczki]
//  1. składa moduł wywiadu w jeden plik HTML,
//  2. dołącza anonimizator, jeśli jest zbudowany (narzedzia/anonimizator/ANONIMIZATOR-WYNIKOW-*.html),
//  3. pakuje Electron dla Windows x64 do out/ i robi z tego zip.
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, rmSync, readdirSync, existsSync, copyFileSync } from 'node:fs';
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
const plikW = readdirSync(distW).filter((f) => /^WYWIAD-PACJENTA-.*\.html$/.test(f)).sort().pop();
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

// 3. Powłoka z konfiguracją wklejoną do HTML
const konf = `<script>window.MS_WERSJA = ${JSON.stringify(pkg.version)}; window.MS_MODULY = ${JSON.stringify({ wywiad: true, anonimizator: !!plikA })};</script>`;
writeFileSync(join(build, 'app', 'index.html'), readFileSync(join(tu, 'app', 'index.html'), 'utf8').replace('<!--KONFIGURACJA-->', konf));
copyFileSync(join(tu, 'main.js'), join(build, 'main.js'));
writeFileSync(join(build, 'package.json'), JSON.stringify({ name: pkg.name, productName: pkg.productName, version: pkg.version, main: 'main.js' }, null, 2));
console.log('Złożono aplikację w', build, plikA ? '(z anonimizatorem)' : '(bez anonimizatora)');

if (process.argv.includes('--bez-paczki')) process.exit(0);

// 4. Paczka Windows x64
const { packager } = await import('@electron/packager');
const out = join(tu, 'out');
rmSync(out, { recursive: true, force: true });
const [katalog] = await packager({
  dir: build, out, platform: 'win32', arch: 'x64', overwrite: true,
  name: 'MS-Konsylium-Narzedzia', executableName: 'MS Konsylium Narzedzia',
  electronVersion: pkg.devDependencies.electron, asar: true, prune: false
});
const zip = join(out, `MS-Konsylium-Narzedzia-${pkg.version}-win-x64.zip`);
execFileSync('zip', ['-qr9', zip, '.'], { cwd: katalog });
console.log('Gotowe:', zip);
