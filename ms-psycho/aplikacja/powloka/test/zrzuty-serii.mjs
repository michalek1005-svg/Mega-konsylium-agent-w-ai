// Zrzuty serii kilku wiadomości Psychoterapii AI (pisanie na żywo po kolei). Dawny nagłówek testu:
// Test całej ścieżki MS Konsylium Psychologiczne w prawdziwym Electronie (Linux + Xvfb):
// prezent „Dla Halusi” → „To nie jest terapia” → Rozmowa (wiadomość → uzytkownik.json → filtr ryzyka)
// → „Claude” (skrypty/rozmowa.py pracuje/odpowiedz) → odpowiedź w oknie → reakcja emotikonem
// → Zwołaj konsylium → sprawa w sprawy/ → Pokój psychologiczny → dymek (skrypty/dymek.py) na scenie.
// Użycie: node zbuduj.mjs --bez-paczki && xvfb-run -a node test/e2e-psycho.mjs [katalog-na-zrzuty]
import { createRequire } from 'node:module';
const { _electron: electron } = createRequire(import.meta.url)('playwright');
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, readdirSync, cpSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const tu = dirname(fileURLToPath(import.meta.url));
const psycho = join(tu, '..', '..', '..');
const zrzuty = process.argv[2] || null;
if (zrzuty) mkdirSync(zrzuty, { recursive: true });
const folder = mkdtempSync(join(tmpdir(), 'ms-psycho-'));
for (const k of ['CLAUDE.md', 'config', 'skrypty']) cpSync(join(psycho, k), join(folder, k), { recursive: true });
const py = (...a) => execFileSync('python3', [join(folder, 'skrypty', a[0]), ...a.slice(1)], { cwd: folder, encoding: 'utf8' });
const czekaj = async (fn, ms = 15000, opis = '') => {
  const t = Date.now();
  for (;;) { const w = await fn().catch(() => null); if (w) return w; if (Date.now() - t > ms) throw new Error('Nie doczekano się: ' + opis); await new Promise((r) => setTimeout(r, 250)); }
};

const app = await electron.launch({
  executablePath: join(tu, '..', 'node_modules', 'electron', 'dist', 'electron'),
  args: ['--no-sandbox', join(tu, '..', 'build', 'main.js')],
  env: { ...process.env, MS_FOLDER_KONSYLIUM: folder, MS_DANE_APLIKACJI: mkdtempSync(join(tmpdir(), 'ms-dane-')), ELECTRON_DISABLE_SECURITY_WARNINGS: '1' }
});
const sieci = [];
const okno = await app.firstWindow();
await okno.setViewportSize?.({ width: 1440, height: 900 }).catch(() => {});
okno.on('request', (r) => { if (!/^(file|data|blob|devtools):/.test(r.url())) sieci.push(r.url()); });
okno.on('console', (m) => { if (m.type() === 'error') console.log('[konsola]', m.text()); });
okno.on('pageerror', (e) => console.log('[błąd strony]', e.message));
await okno.waitForLoadState('domcontentloaded');
const zrzut = async (n) => { if (zrzuty) await okno.screenshot({ path: join(zrzuty, n + '.png') }); };
const ramka = (m) => czekaj(async () => okno.frames().find((f) => f.url().includes('moduly/' + m + '.html')), 15000, 'ramka ' + m);

try {
  await okno.waitForSelector('#prezent .pud', { state: 'visible' });
  await okno.click('#prezent .pud', { force: true });
  await okno.waitForSelector('#zgoda:not([hidden])', { timeout: 20000 });
  await okno.click('#zgoda-ok');
  const r = await ramka('rozmowa');
  await r.waitForSelector('.msg.zespol');
  await czekaj(async () => readdirSync(join(folder, 'rozmowy')).length === 1, 8000, 'katalog rozmowy');
  const id = readdirSync(join(folder, 'rozmowy'))[0];
  await r.type('#tekst', 'Od miesiąca nie mogę się zebrać, żeby odpisać przyjaciółce, która urodziła dziecko. Im dłużej zwlekam, tym bardziej mi wstyd i tym trudniej napisać. Nie wiem, czy w ogóle jeszcze warto.');
  await r.press('#tekst', 'Enter');
  await czekaj(async () => JSON.parse(readFileSync(join(folder, 'rozmowy', id, 'uzytkownik.json'), 'utf8')).wiadomosci.length, 8000, 'uzytkownik.json');
  py('rozmowa.py', 'pracuje', '--rozmowa', id, '--panel', 'straznik_ryzyka,terapeuta_cbt,terapeuta_humanistyczny,terapeuta_act,prowadzacy', '--etap', 'zespół się naradza');
  await r.waitForSelector('.pracuje:not(.spi) .aw'); await zrzut('10-zespol-sie-naradza');
  writeFileSync(join(folder, 'odp.json'), JSON.stringify({
    wiadomosci: [
      'Ten mechanizm zna wiele osób: im dłuższa cisza, tym większy wstyd, a im większy wstyd, tym trudniej ją przerwać. To nie świadczy o tym, że przyjaciółka mało dla Ciebie znaczy – raczej o tym, że znaczy dużo.',
      'Wiele osób w pierwszych tygodniach po porodzie w ogóle nie liczy dni bez wiadomości. Częściej cieszą się, że ktoś o nich pamięta.',
      'Może wystarczy jedno zdanie, bez tłumaczenia się: „Myślę o Tobie i małej, przepraszam, że tak długo – jak się macie?”. Co by się stało, gdybyś wysłała je dziś wieczorem? 🤍'
    ],
    ryzyko: 0, reakcja: '🤍', tempo: 'normalnie',
    glosy: [{ rola: 'straznik_ryzyka', skrot: 'Poziom 0.' }, { rola: 'terapeuta_cbt', skrot: 'Błędne koło unikania i wstydu – mały krok dziś.' }, { rola: 'terapeuta_humanistyczny', skrot: 'Najpierw uznać wstyd, potem krok.' }, { rola: 'terapeuta_act', skrot: 'Wartość: bliskość; działanie mimo wstydu.' }]
  }));
  console.log(py('rozmowa.py', 'odpowiedz', '--rozmowa', id, '--plik', join(folder, 'odp.json')).trim());
  await r.waitForSelector('.msg.zespol.na-zywo', { timeout: 8000 });
  await okno.waitForTimeout(1500); await zrzut('11-seria-pisze-pierwsza');
  await r.waitForSelector('.msg.zespol[data-n="3"]:not(.na-zywo)', { timeout: 40000 });
  await okno.waitForTimeout(800); await zrzut('12-seria-trzy-wiadomosci');
  assert.equal(await r.locator('.msg.zespol[data-n]').count() >= 3, true);
  console.log('OK: seria trzech wiadomości wypisana po kolei.');
} finally { await app.close(); }
