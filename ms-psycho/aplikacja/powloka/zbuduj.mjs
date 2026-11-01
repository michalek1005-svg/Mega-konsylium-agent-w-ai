// Buduje aplikację Windows „MS Konsylium Psychologiczne” (przenośna, bez instalatora).
// Użycie (w ms-psycho/aplikacja/powloka):  npm ci && node zbuduj.mjs [--bez-paczki]
//  1. wywiad: moduł z MS Konsylium (narzedzia/wywiad), z napisami dla psychologii,
//  2. Rozmowa: ../rozmowa/rozmowa.html (komunikator z jednym terapeutą AI),
//  3. Pokój psychologiczny: ../pokoj-psychologiczny (zbudowany POKOJ-PSYCHOLOGICZNY-*.html),
//  4. powłoka (index.html, ipad.html) z paletą „Lawenda” i ekranem prezentu (tylko wersja 1),
//  5. paczka Electron dla Windows x64 i zip.
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, rmSync, readdirSync, existsSync, copyFileSync, symlinkSync, unlinkSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Ekran „Dla Halusi ❤” – TYLKO w wersji 1 (Michał 1.11.2026). W wersji 2: false.
const PREZENT = true;

const tu = dirname(fileURLToPath(import.meta.url));
const aplikacja = join(tu, '..');
const psycho = join(aplikacja, '..');
const repo = join(psycho, '..');
const pkg = JSON.parse(readFileSync(join(tu, 'package.json'), 'utf8'));
const build = join(tu, 'build');
rmSync(build, { recursive: true, force: true });
mkdirSync(join(build, 'app', 'moduly'), { recursive: true });

const tokeny = readFileSync(join(aplikacja, 'wspolne', 'ms-tokeny.css'), 'utf8') + '\n' + readFileSync(join(aplikacja, 'wspolne', 'ms-tokeny-psycho.css'), 'utf8');
const most = readFileSync(join(aplikacja, 'wspolne', 'ms-most.js'), 'utf8');

// 1. Wywiad (wspólny z MS Konsylium; budowany w swoim katalogu, napisy podmieniane tu)
// krój Plus Jakarta Sans: zbuduj.mjs wywiadu szuka go w narzedzia/powloka/node_modules – na czas budowy wskazujemy nasz
const nmMed = join(repo, 'narzedzia', 'powloka', 'node_modules');
const tymczasowy = !existsSync(nmMed) && existsSync(join(tu, 'node_modules'));
if (tymczasowy) symlinkSync(join(tu, 'node_modules'), nmMed, 'junction');
try { execFileSync(process.execPath, [join(repo, 'narzedzia', 'wywiad', 'zbuduj.mjs')], { stdio: 'inherit' }); }
finally { if (tymczasowy) unlinkSync(nmMed); }
const distW = join(repo, 'narzedzia', 'wywiad', 'dist');
const plikW = readdirSync(distW).filter((f) => /^WYWIAD-PACJENTA-.*\.html$/.test(f))
  .sort((a, b) => a.localeCompare(b, 'en', { numeric: true })).pop();
let wywiad = readFileSync(join(distW, plikW), 'utf8');
const NAPISY_WYWIADU = [
  ['Wywiad z pacjentem', 'Wywiad'], ['Pokój lekarski', 'Pokój psychologiczny'], ['opisuje dolegliwości własnymi słowami', 'opisuje własnymi słowami, z czym przychodzi'],
  ['opis dolegliwości', 'opis tego, z czym przychodzisz'], ['Opisz krótko własnymi słowami, co Ci dolega', 'Opisz krótko własnymi słowami, z czym przychodzisz'],
  ['Przekaż teraz komputer lekarzowi albo osobie z rejestracji.', 'Przekaż teraz komputer terapeucie.'], ['Przekaż teraz komputer lekarzowi.', 'Przekaż teraz komputer terapeucie.'],
  ['Lekarz przygotuje teraz pytania dopasowane do Ciebie.', 'Terapeuta przygotuje teraz pytania dopasowane do Ciebie.'],
  ['Dla lekarza', 'Dla terapeuty'], ['dla tego pacjenta', 'dla tej osoby'], ['Pacjent zaczyna pisać', 'Osoba zaczyna pisać'],
  ['Podsumowanie dla lekarza', 'Podsumowanie dla terapeuty'], ['podsumowanie dla lekarza', 'podsumowanie dla terapeuty'],
  ['Pacjent opisuje dolegliwości, a Claude', 'Osoba opisuje własnymi słowami, z czym przychodzi, a Claude'], ['Pacjent opisuje własnymi słowami', 'Osoba opisuje własnymi słowami'],
  ['Opis pacjenta dla AI', 'Opis dla AI'], ['Pacjent odpowiada na pytania', 'Osoba odpowiada na pytania'], ['Lekarz: sprawdź', 'Sprawdź'],
  ['Jeśli objawy wyraźnie się nasilą, nie czekaj: zadzwoń', 'Jeśli poczujesz się wyraźnie gorzej albo pojawią się myśli o zrobieniu sobie krzywdy, nie czekaj: 800 70 2222 (całodobowo) albo'],
];
for (const [a, b] of NAPISY_WYWIADU) wywiad = wywiad.split(a).join(b);
// paleta „Lawenda” i bez anonimizatora (psychologia nie dołącza wyników badań laboratoryjnych)
wywiad = wywiad.replace('</style>', () => readFileSync(join(aplikacja, 'wspolne', 'ms-tokeny-psycho.css'), 'utf8') + '\nbutton[title^="Otwiera anonimizator"]{display:none!important}\n</style>');
writeFileSync(join(build, 'app', 'moduly', 'wywiad.html'), wywiad);
const fontCss = (wywiad.match(/@font-face\{[^}]+\}/g) || []).join('');

// 2. Rozmowa
const pomoc = readFileSync(join(psycho, 'config', 'pomoc-pl.json'), 'utf8');
const frazy = readFileSync(join(psycho, 'config', 'frazy-ryzyka.json'), 'utf8');
const rozmowa = readFileSync(join(aplikacja, 'rozmowa', 'rozmowa.html'), 'utf8')
  .replace('/*@@FONT@@*/', () => fontCss).replace('/*@@MS-TOKENY@@*/', () => tokeny).replace('/*@@MS-MOST@@*/', () => most)
  .replace('/*@@POMOC@@*/null', () => JSON.stringify(JSON.parse(pomoc))).replace('/*@@FRAZY@@*/null', () => JSON.stringify(JSON.parse(frazy)));
if (/https?:\/\//.test(rozmowa.replace(fontCss, ''))) throw new Error('Rozmowa: adres sieciowy w module (zasada offline).');
writeFileSync(join(build, 'app', 'moduly', 'rozmowa.html'), rozmowa);

// 3. Pokój psychologiczny
const katP = join(aplikacja, 'pokoj-psychologiczny');
execFileSync(process.execPath, [join(katP, 'build.mjs')], { stdio: 'inherit', cwd: katP });
const plikP = readdirSync(katP).filter((x) => /^POKOJ-PSYCHOLOGICZNY-.*\.html$/.test(x)).sort((a, b) => a.localeCompare(b, 'en', { numeric: true })).pop();
copyFileSync(join(katP, plikP), join(build, 'app', 'moduly', 'pokoj.html'));

// 4. Powłoka
const konf = `<script>window.MS_WERSJA = ${JSON.stringify(pkg.version)}; window.MS_MODULY = ${JSON.stringify({ rozmowa: true, wywiad: true, pokoj: true })};</script>`;
let prezentCss = '', prezentHtml = '';
if (PREZENT) {
  // .podpis koliduje z globalną etykietą paska w powłoce (blur, tło, top:50%) – w prezencie zawsze .prezent-podpis
  const p = readFileSync(join(aplikacja, 'prezent', 'prezent-start.html'), 'utf8').replace(/\bpodpis\b/g, 'prezent-podpis');
  prezentCss = p.match(/<style>([\s\S]*?)<\/style>/)[1]
    .replace(/^html,body\{[^}]*\}\s*$/m, '').replace(/^\.app\{[^}]*\}\s*$/m, '')
    // klasy prezentu (.podpis, .tafla…) nie mogą dotknąć powłoki: każda reguła tylko wewnątrz #prezent
    .replace(/^\.([a-z])/gm, '#prezent .$1');
  let scena = p.match(/<div id="prezent">[\s\S]*?\n<\/div>\n(?=<script>)/)[0];
  const skrypt = p.match(/<script>([\s\S]*?)<\/script>/)[1];
  // zrzuty tej aplikacji do kolażu (prezent/zrzuty/*.jpg), jeśli są
  const kz = join(aplikacja, 'prezent', 'zrzuty');
  const zrzuty = existsSync(kz) ? readdirSync(kz).filter((f) => /\.jpe?g$/i.test(f)).sort() : [];
  if (zrzuty.length) {
    let i = 0;
    // każdy zrzut dostaje podpis z nazwy pliku („5-Pokój psychologiczny.jpg” → „Pokój psychologiczny”)
    scena = scena.replace(/<img src="data:image\/jpeg;base64,[^"]+"( alt="")?><i>[^<]*<\/i>/g, () => {
      const f = zrzuty[i++ % zrzuty.length];
      return `<img src="data:image/jpeg;base64,${readFileSync(join(kz, f)).toString('base64')}" alt=""><i>${f.replace(/^\d+-/, '').replace(/\.jpe?g$/i, '')}</i>`;
    });
    if (!i) throw new Error('Prezent: nie znaleziono zrzutów do podmiany w prezent-start.html');
  }
  const zgoda = `<div id="zgoda" hidden role="dialog" aria-modal="true" aria-labelledby="zgoda-t"><div class="zgoda-karta">
<h2 id="zgoda-t">To nie jest terapia</h2>
<p>MS Konsylium Psychologiczne to narzędzie testowe. Nie jest psychoterapią, poradą psychologiczną ani diagnozą i nie zastępuje kontaktu z psychologiem, psychoterapeutą lub lekarzem. Rozmowy zostają na tym komputerze, w wybranym folderze.</p>
<p class="zgoda-nr">Jeśli ktoś jest w kryzysie: <b>112</b> · <b>800 70 2222</b> (całodobowo) · <b>116 123</b></p>
<button type="button" id="zgoda-ok">Rozumiem</button></div></div>`;
  prezentCss += `
#zgoda{position:fixed;inset:0;z-index:9998;display:grid;place-items:center;background:rgba(40,30,60,.28);backdrop-filter:blur(6px)}
#zgoda .zgoda-karta{max-width:520px;margin:20px;padding:28px 30px;border-radius:28px;background:var(--panel,#fff);background-color:#fbf9fe;color:#2D2A3A;box-shadow:0 40px 80px -30px rgba(60,40,90,.6);animation:zgodaW .5s cubic-bezier(.2,1.3,.4,1)}
html[data-motyw="ciemny"] #zgoda .zgoda-karta{background-color:#231e33;color:#ECE8F4}
@keyframes zgodaW{from{opacity:0;transform:translateY(16px) scale(.96)}}
#zgoda h2{margin:0 0 10px;font-size:22px}#zgoda p{margin:0 0 12px;line-height:1.55}.zgoda-nr{font-size:13.5px}
#zgoda button{border:0;border-radius:999px;padding:12px 24px;font:750 14px inherit;font-family:inherit;background:#5B4A8A;color:#fff;cursor:pointer}
#prezent .pomin{position:absolute;right:40px;bottom:36px;z-index:3;border:0;background:rgba(255,255,255,.55);color:#5b4a8a;border-radius:999px;padding:8px 14px;font:650 12px inherit;font-family:inherit;cursor:pointer;opacity:.7}
`;
  scena = scena.replace('<div id="prezent">', '<div id="prezent"><button class="pomin" type="button" id="prezent-pomin" title="Pomiń animację">Pomiń ›</button>');
  prezentHtml = scena + zgoda + `<script>(function(){
var z=document.getElementById('zgoda');function pokazZgode(){z.hidden=false;document.getElementById('zgoda-ok').focus();}
document.getElementById('zgoda-ok').addEventListener('click',function(){z.hidden=true;});
var p=document.getElementById('prezent');
document.getElementById('prezent-pomin').addEventListener('click',function(e){e.stopPropagation();p.remove();pokazZgode();});
new MutationObserver(function(){if(!document.getElementById('prezent')&&z.hidden&&!z.dataset.bylo){z.dataset.bylo=1;pokazZgode();}}).observe(document.body,{childList:true});
})();</script>\n<script>${skrypt}</script>`;
}
const powloka = readFileSync(join(tu, 'app', 'index.html'), 'utf8')
  .replace('<!--KONFIGURACJA-->', () => konf).replace('/*@@MS-TOKENY@@*/', () => tokeny).replace('/*@@FONT@@*/', () => fontCss)
  .replace('/*@@PREZENT-CSS@@*/', () => prezentCss).replace('<!--@@PREZENT@@-->', () => prezentHtml);
writeFileSync(join(build, 'app', 'index.html'), powloka.replace('<!--IPAD-GLOWA-->\n', ''));

const CSP_WIN = `default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; font-src data:; frame-src file:`;
const CSP_IPAD = `default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src 'self' data:; font-src data:; frame-src 'self'; connect-src 'self'; manifest-src 'self'; base-uri 'none'; form-action 'none'`;
if (!powloka.includes(CSP_WIN)) throw new Error('Zmieniono CSP powłoki: popraw CSP_WIN w zbuduj.mjs.');
const glowaIpad = [
  '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">',
  '<meta name="apple-mobile-web-app-capable" content="yes">', '<meta name="mobile-web-app-capable" content="yes">',
  '<meta name="apple-mobile-web-app-title" content="MS Psycho">', '<meta name="apple-mobile-web-app-status-bar-style" content="default">',
  '<meta name="theme-color" content="#EEEAF3">', '<meta name="format-detection" content="telephone=no">',
  '<link rel="manifest" href="manifest.webmanifest">', '<link rel="apple-touch-icon" href="apple-touch-icon.png">',
  '<script>' + readFileSync(join(tu, 'app', 'ipad-most.js'), 'utf8').replace(/<\/script/gi, '<\\/script') + '</script>'
].join('\n');
writeFileSync(join(build, 'app', 'ipad.html'), powloka.replace(CSP_WIN, () => CSP_IPAD).replace('<!--IPAD-GLOWA-->', () => glowaIpad));
copyFileSync(join(tu, 'serwer-ipad.js'), join(build, 'serwer-ipad.js'));
copyFileSync(join(tu, 'node_modules', 'qrcode-generator', 'dist', 'qrcode.js'), join(build, 'qrcode.js'));
copyFileSync(join(tu, 'main.js'), join(build, 'main.js'));
copyFileSync(join(tu, 'preload.js'), join(build, 'preload.js'));
copyFileSync(join(tu, 'zasoby', 'ikona.png'), join(build, 'ikona.png'));
writeFileSync(join(build, 'package.json'), JSON.stringify({ name: pkg.name, productName: pkg.productName, version: pkg.version, main: 'main.js' }, null, 2));
console.log('Złożono aplikację w', build, PREZENT ? '(z ekranem prezentu – wersja 1)' : '');

if (process.argv.includes('--bez-paczki')) process.exit(0);

// 5. Paczka Windows x64
const { packager } = await import('@electron/packager');
const out = join(tu, 'out');
rmSync(out, { recursive: true, force: true });
const [katalog] = await packager({
  dir: build, out, platform: 'win32', arch: 'x64', overwrite: true,
  name: 'MS-Konsylium-Psychologiczne', executableName: 'MS Konsylium Psychologiczne', icon: join(tu, 'zasoby', 'ikona.ico'),
  appCopyright: 'Marka MS', win32metadata: { ProductName: 'MS Konsylium Psychologiczne', FileDescription: 'MS Konsylium Psychologiczne', CompanyName: 'MS' },
  electronVersion: pkg.devDependencies.electron, asar: true, prune: false
});
const zip = join(out, `MS-Konsylium-Psychologiczne-${pkg.version}-win-x64.zip`);
execFileSync('zip', ['-qr9', zip, '.'], { cwd: katalog });
console.log('Gotowe:', zip);
