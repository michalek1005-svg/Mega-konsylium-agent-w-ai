// Składa wywiad w jeden samodzielny plik HTML działający offline (do aplikacji Windows).
// Użycie: node narzedzia/wywiad/zbuduj.mjs  →  narzedzia/wywiad/dist/WYWIAD-PACJENTA-<wersja>.html
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const WERSJA = '0.1.0';
const tu = dirname(fileURLToPath(import.meta.url));
let html = readFileSync(join(tu, 'index.html'), 'utf8');

// 1. Skrypty wklejone do środka
html = html.replace(/<script src="([\w.-]+\.js)"><\/script>/g, (_, plik) =>
  '<script>\n' + readFileSync(join(tu, plik), 'utf8').replace(/<\/script/gi, '<\\/script') + '\n</script>');

// 2. Bez fontów z sieci: aplikacja ma działać bez internetu (Windows ma Segoe UI)
html = html.replace(/<link rel="(preconnect|stylesheet)" href="https:\/\/fonts\.[^"]+"[^>]*>\n?/g, '');
if (/https?:\/\//.test(html.replace(/<!--[\s\S]*?-->/g, '').replace(/"https:\/\/claude\.ai[^"]*"/g, ''))) {
  // linki tekstowe są dopuszczalne, ale ostrzegamy, gdyby coś próbowało się ładować
  console.warn('Uwaga: w pliku są adresy http(s); sprawdź, czy nic nie ładuje się z sieci.');
}

// 3. Pełny dokument z blokadą sieci (CSP)
const csp = "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: blob:; font-src data:; connect-src 'none'";
const doc = `<!doctype html>
<html lang="pl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="${csp}">
<script>window.MS_WERSJA_WYWIADU = '${WERSJA}';</script>
${html}
</html>
`;
mkdirSync(join(tu, 'dist'), { recursive: true });
const cel = join(tu, 'dist', `WYWIAD-PACJENTA-${WERSJA}.html`);
writeFileSync(cel, doc);
console.log('Zapisano', cel, (doc.length / 1024).toFixed(0) + ' KB');
