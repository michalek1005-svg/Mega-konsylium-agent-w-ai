// Test wersji na iPada: aplikacja Windows (Electron) udostępnia się w sieci lokalnej, a „iPad”
// (Chromium z ekranem iPada Air 820×1180, dotyk) przechodzi wywiad na żywo i ogląda Pokój lekarski.
// Użycie: node zbuduj.mjs --bez-paczki && xvfb-run -a node test/e2e-ipad.mjs
// Zrzuty: $TMPDIR/ms-ipad-*.png
import { createRequire } from 'node:module';
const req = createRequire(import.meta.url);
const { _electron: electron, chromium } = req('playwright');
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const tu = dirname(fileURLToPath(import.meta.url));
const repo = join(tu, '..', '..', '..');
const folder = mkdtempSync(join(tmpdir(), 'ms-konsylium-ipad-'));
const dane = mkdtempSync(join(tmpdir(), 'ms-dane-ipad-'));
const PORT = 18765;
writeFileSync(join(folder, 'CLAUDE.md'), '# test\n');
const py = (...a) => execFileSync('python3', [join(repo, 'skrypty', a[0]), ...a.slice(1)], { cwd: folder, encoding: 'utf8' });
const czekaj = async (fn, ms = 15000, opis = '') => {
  const t = Date.now();
  for (;;) { const w = await fn(); if (w) return w; if (Date.now() - t > ms) throw new Error('Nie doczekano się: ' + opis); await new Promise((r) => setTimeout(r, 200)); }
};
const zrzut = (s, n) => s.screenshot({ path: join(tmpdir(), 'ms-ipad-' + n + '.png') });

// 0. Bez udostępnienia serwer nie działa (domyślnie wyłączone)
{
  const app0 = await electron.launch({
    executablePath: join(tu, '..', 'node_modules', 'electron', 'dist', 'electron'),
    args: ['--no-sandbox', join(tu, '..', 'build', 'main.js')],
    env: { ...process.env, MS_FOLDER_KONSYLIUM: folder, MS_DANE_APLIKACJI: mkdtempSync(join(tmpdir(), 'ms-dane-0-')), MS_IPAD_PORT: String(PORT), ELECTRON_DISABLE_SECURITY_WARNINGS: '1' }
  });
  const o0 = await app0.firstWindow();
  await o0.waitForLoadState('domcontentloaded');
  await new Promise((r) => setTimeout(r, 800));
  await assert.rejects(fetch(`http://127.0.0.1:${PORT}/`), 'serwer iPada nie może działać, dopóki go nie włączysz');
  assert.equal((await o0.textContent('.stan .offline')).trim(), 'Offline');
  await app0.close();
}

const app = await electron.launch({
  executablePath: join(tu, '..', 'node_modules', 'electron', 'dist', 'electron'),
  args: ['--no-sandbox', join(tu, '..', 'build', 'main.js')],
  env: { ...process.env, MS_FOLDER_KONSYLIUM: folder, MS_DANE_APLIKACJI: dane, MS_IPAD_PORT: String(PORT), MS_IPAD_ADRES: '127.0.0.1', ELECTRON_DISABLE_SECURITY_WARNINGS: '1' }
});
const pc = await app.firstWindow();
const sieciPc = [];
pc.on('request', (r) => { if (!/^(file|data|blob|devtools):/.test(r.url())) sieciPc.push(r.url()); });
await pc.waitForLoadState('domcontentloaded');
const przegladarka = await chromium.launch();
try {
  // 1. Na komputerze: ikona iPada → „Udostępnij na iPadzie” → kod QR i adres
  await pc.click('#ipad-przycisk');
  await pc.click('#ipad-wlacz');
  await pc.waitForSelector('#ipad-wylacz:not([hidden])', { timeout: 5000 });
  const blad = (await pc.textContent('#ipad-info')).trim();
  const adres = (await pc.textContent('#ipad-adres')).trim();
  assert.equal(blad, 'Czekam na iPada.');
  assert.match(adres, new RegExp(`^http://127\\.0\\.0\\.1:${PORT}/\\?k=[\\w-]{20,}$`));
  await pc.waitForSelector('#ipad-qr[src^="data:image/svg+xml"]');
  assert.equal((await pc.textContent('.stan .offline')).trim(), 'Sieć lokalna');
  await zrzut(pc, 'pc-panel');
  const klucz = JSON.parse(readFileSync(join(dane, 'ustawienia.json'), 'utf8')).ipadKlucz;
  assert.ok(klucz && klucz.length >= 20);
  assert.equal(JSON.parse(readFileSync(join(dane, 'ustawienia.json'), 'utf8')).ipad, true, 'wybór zapamiętany');

  // 2. Bez klucza: strona się otwiera, ale dane nie (403), a iPad prosi o zeskanowanie kodu
  const baza = `http://127.0.0.1:${PORT}/`;
  assert.ok(adres.startsWith(baza));
  const r403 = await fetch(baza + 'api/lista', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{"args":[""]}' });
  assert.equal(r403.status, 403);
  const rZly = await fetch(baza + 'api/lista', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-MS-Klucz': klucz.slice(0, -1) + 'x' }, body: '{"args":[""]}' });
  assert.equal(rZly.status, 403);
  const rPoza = await fetch(baza + 'api/czytaj', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-MS-Klucz': klucz }, body: JSON.stringify({ args: ['../../etc/passwd.txt'] }) });
  assert.match((await rPoza.json()).blad, /poza folderem/);
  const man = await (await fetch(baza + 'manifest.webmanifest?k=' + klucz)).json();
  assert.equal(man.start_url, './?k=' + klucz);
  assert.equal(man.display, 'standalone');

  const iPadAir = {
    viewport: { width: 820, height: 1180 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true,
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'
  };
  {
    const k0 = await przegladarka.newContext(iPadAir);
    const s0 = await k0.newPage();
    await s0.goto(baza);
    await s0.waitForSelector('#rozlaczony:not([hidden])', { timeout: 5000 });
    assert.match(await s0.textContent('#rozlaczony'), /zeskanuj kod QR/);
    await zrzut(s0, 'bez-kodu');
    await k0.close();
  }

  // 3. iPad z kodem z QR
  const kontekst = await przegladarka.newContext(iPadAir);
  const ipad = await kontekst.newPage();
  const sieciIpad = [];
  ipad.on('request', (r) => { if (!r.url().startsWith(baza) && !/^(data|blob|about):/.test(r.url())) sieciIpad.push(r.url()); });
  ipad.on('console', (m) => { if (m.type() === 'error') console.log('[iPad]', m.text()); });
  ipad.on('pageerror', (e) => console.log('[iPad błąd]', e.message));
  await ipad.goto(baza + '?k=' + klucz);
  assert.ok(await ipad.evaluate(() => document.documentElement.classList.contains('ipad')));
  assert.equal(await ipad.getAttribute('link[rel="manifest"]', 'href'), 'manifest.webmanifest?k=' + klucz);
  const ramka = (m) => czekaj(() => ipad.frames().find((f) => f.url().includes('moduly/' + m + '.html')), 15000, 'ramka ' + m);
  await czekaj(async () => (await ipad.textContent('#folder-sciezka')).includes(folder), 8000, 'folder z komputera na iPadzie');
  assert.ok(await ipad.$eval('#folder-wybierz', (b) => b.hidden), 'na iPadzie folder wybiera się na komputerze');
  assert.equal((await ipad.textContent('.stan .offline')).trim(), 'Komputer');
  // stałe połączenie: strumień zdarzeń otwarty, komputer widzi iPada od razu, znak „działa” po obu stronach
  await czekaj(() => ipad.evaluate(() => window.msIpad && window.msIpad.polaczony()), 8000, 'strumień zdarzeń z komputera');
  await czekaj(async () => /iPad połączony/.test(await pc.textContent('#ipad-info')), 8000, 'komputer widzi połączony iPad');
  assert.equal((await pc.textContent('.stan .offline')).trim(), 'iPad ✓');
  await czekaj(async () => (await pc.textContent('#dziala')).trim() === 'Działa', 8000, 'znak „Działa” na komputerze');
  await czekaj(async () => (await ipad.textContent('#dziala')).trim() === 'Działa', 8000, 'znak „Działa” na iPadzie');
  await pc.click('#dziala');
  assert.match(await pc.textContent('#dziala-lista'), /Folder Konsylium[\s\S]*iPad połączony na stałe/);
  await pc.click('#dziala');
  const r403s = await fetch(baza + 'zdarzenia?k=zly');
  assert.equal(r403s.status, 403, 'strumień tylko z kluczem');
  // cele dotyku co najmniej 44 pt (wytyczne Apple)
  for (const b of await ipad.$$('nav.pasek button:not([hidden])')) { const r = await b.boundingBox(); assert.ok(r.width >= 44 && r.height >= 44, 'przycisk paska ≥ 44 pt'); }

  // 4. Wywiad na żywo z iPada: zapis idzie do folderu na komputerze
  const w = await ramka('wywiad');
  await w.waitForSelector('[data-tryb="zywo"]:not([disabled])', { timeout: 8000 });
  await zrzut(ipad, 'wywiad-pion');
  await w.tap('[data-tryb="zywo"]');
  await w.fill('#pole-opis', 'Nazywam się Jan Kowalski, PESEL 85010112345. Od wczoraj boli mnie brzuch pod prawymi żebrami, gorzej po tłustym.');
  await w.tap('#dalej');
  await w.waitForSelector('text=Dobieram kolejne pytania', { timeout: 8000 });
  const kod = await czekaj(() => existsSync(join(folder, 'wywiad-na-zywo')) && readdirSync(join(folder, 'wywiad-na-zywo'))[0], 5000, 'katalog wywiadu');
  const kat = join(folder, 'wywiad-na-zywo', kod);
  const s1 = readFileSync(join(kat, 'stan.json'), 'utf8');
  assert.ok(!s1.includes('85010112345') && !s1.includes('Kowalski'), 'dane osobowe nie wychodzą z iPada');
  assert.match(py('wywiad_na_zywo.py', 'czekaj', '--limit', '5'), /PACJENT CZEKA NA PYTANIA/);
  writeFileSync(join(folder, 'p1.json'), JSON.stringify([
    { id: 'zoltaczka', typ: 'jeden', tekst: 'Czy zauważyłaś/zauważyłeś zażółcenie białek oczu?', krotko: 'Żółtaczka', opcje: [{ w: 'tak', t: 'Tak' }, { w: 'nie', t: 'Nie' }] }
  ]));
  py('wywiad_na_zywo.py', 'dodaj', '--kod', kod, '--pytania', 'p1.json', '--koniec');
  await w.waitForSelector('text=zażółcenie białek oczu', { timeout: 8000 });
  await zrzut(ipad, 'wywiad-pytanie');
  await w.tap('.opcja[data-w="nie"]');
  await w.waitForSelector('[data-akcja="zywo-wyslij"]', { timeout: 8000 });
  await w.tap('[data-akcja="zywo-wyslij"]');
  const md = await czekaj(() => existsSync(join(kat, '01-wywiad.md')) && readFileSync(join(kat, '01-wywiad.md'), 'utf8'), 5000, '01-wywiad.md');
  assert.match(md, /zażółcenie białek oczu.*O: Nie/);
  assert.ok(!/85010112345|Kowalski/.test(md));

  // 5. Pokój lekarski na iPadzie: dymki na żywo i Wnioski
  const sprawa = join(folder, 'sprawy', '2026-10-31-98');
  mkdirSync(sprawa, { recursive: true });
  writeFileSync(join(sprawa, '01-wywiad.md'), md);
  py('dymek.py', sprawa, '--rola', 'ordynator', '--faza', 'Wywiad', '--temat', 'Ból w prawym podżebrzu po tłustym posiłku', '--skrot', 'Zaczynamy.',
    '--tresc', 'Pacjent z bólem w prawym podżebrzu nasilającym się po posiłku tłustym, bez żółtaczki i gorączki. Zaczynamy od triage.');
  await ipad.tap('button.modul[data-modul="pokoj"]');
  const pk = await ramka('pokoj');
  await pk.waitForSelector('text=na żywo z folderu Konsylium', { timeout: 10000 });
  assert.ok(await ipad.evaluate(() => document.body.classList.contains('pelny')), 'Pokój na cały ekran');
  py('dymek.py', sprawa, '--rola', 'bayes', '--faza', 'Ślepa tura', '--skrot', 'Kolka żółciowa 0,55.',
    '--tresc', 'Najbardziej prawdopodobna jest kolka żółciowa (p≈0,55) w przebiegu kamicy pęcherzyka żółciowego. Brak gorączki i żółtaczki obniża prawdopodobieństwo zapalenia dróg żółciowych.',
    '--info', 'p=0,55 · Tokio 2018: kryteria niespełnione');
  await pk.waitForSelector('.dymek.pelny >> text=kamicy pęcherzyka żółciowego', { timeout: 15000 });
  await zrzut(ipad, 'pokoj-pion');
  await ipad.setViewportSize({ width: 1180, height: 820 });
  await new Promise((r) => setTimeout(r, 600));
  await zrzut(ipad, 'pokoj-poziom');
  writeFileSync(join(sprawa, '09-FINAL.md'), 'REKOMENDACJA: USG jamy brzusznej w trybie pilnym (do 24 h).\nPILNOŚĆ: 2 dziś — PEWNOŚĆ: średnia\nDLACZEGO: Kolka żółciowa najbardziej prawdopodobna.\nPLAN B: Gorączka lub żółtaczka: SOR.\nCZEGO NIE WIEMY: wyniki badań\nWRÓĆ / ESKALUJ GDY: gorączka, żółtaczka\nŹRÓDŁA: Tokio 2018\n');
  await pk.waitForSelector('#wnioski:not([hidden]) .rek', { timeout: 15000 });
  assert.match(await pk.textContent('#wnioski .rek'), /USG jamy brzusznej/);
  await zrzut(ipad, 'wnioski-poziom');
  await ipad.setViewportSize({ width: 820, height: 1180 });
  await new Promise((r) => setTimeout(r, 600));
  await zrzut(ipad, 'wnioski-pion');

  // 6. Anonimizator otwiera się na iPadzie (wybór pliku z aparatu / Plików)
  await ipad.tap('button.modul[data-modul="anonimizator"]');
  const an = await ramka('anonimizator');
  await an.waitForSelector('input[type="file"]', { state: 'attached', timeout: 30000 });
  await new Promise((r) => setTimeout(r, 800));
  await zrzut(ipad, 'anonimizator-pion');
  // schowek po http: zastępstwo przez execCommand
  assert.equal(await an.evaluate(() => typeof navigator.clipboard.writeText), 'function');

  // 7. Na komputerze widać połączonego iPada
  await czekaj(async () => /iPad połączony/.test(await pc.textContent('#ipad-info')), 5000, 'informacja o iPadzie');

  // 8. Wyłączenie: iPad pokazuje brak połączenia
  await pc.click('#ipad-wylacz');
  await pc.waitForSelector('#ipad-wlacz:not([hidden])');
  await ipad.tap('button.modul[data-modul="wywiad"]');
  await ipad.waitForSelector('#rozlaczony:not([hidden])', { timeout: 8000 });
  assert.match(await ipad.textContent('#rozlaczony'), /Brak połączenia z komputerem/);
  await zrzut(ipad, 'rozlaczony');
  assert.equal((await pc.textContent('.stan .offline')).trim(), 'Offline');

  assert.deepEqual(sieciIpad, [], 'iPad łączy się tylko z komputerem');
  assert.deepEqual(sieciPc, [], 'okno Windows dalej nie łączy się z siecią');
  console.log('e2e iPad OK', folder);
} finally {
  await przegladarka.close();
  await app.close();
}
