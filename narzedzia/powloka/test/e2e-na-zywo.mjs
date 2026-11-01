// Test całej ścieżki „na żywo” w prawdziwym Electronie (Linux + Xvfb w CI/chmurze):
// wywiad → stan.json → „Claude” (skrypty/wywiad_na_zywo.py) dopisuje pytania → pacjent odpowiada →
// 01-wywiad.md po anonimizacji → dymki konsylium (skrypty/dymek.py) → Pokój psychologiczny na żywo.
// Użycie: node zbuduj.mjs --bez-paczki && xvfb-run -a node test/e2e-na-zywo.mjs
import { createRequire } from 'node:module';
const { _electron: electron } = createRequire(import.meta.url)('playwright'); // Playwright globalnie albo w projekcie
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const tu = dirname(fileURLToPath(import.meta.url));
const repo = join(tu, '..', '..', '..');
const folder = mkdtempSync(join(tmpdir(), 'ms-konsylium-'));
writeFileSync(join(folder, 'CLAUDE.md'), '# test\n');
const py = (...a) => execFileSync('python3', [join(repo, 'skrypty', a[0]), ...a.slice(1)], { cwd: folder, encoding: 'utf8' });
const czekaj = async (fn, ms = 15000, opis = '') => {
  const t = Date.now();
  for (;;) { const w = await fn(); if (w) return w; if (Date.now() - t > ms) throw new Error('Nie doczekano się: ' + opis); await new Promise((r) => setTimeout(r, 200)); }
};

const app = await electron.launch({
  executablePath: join(tu, '..', 'node_modules', 'electron', 'dist', 'electron'),
  args: ['--no-sandbox', join(tu, '..', 'build', 'main.js')],
  env: { ...process.env, MS_FOLDER_KONSYLIUM: folder, MS_DANE_APLIKACJI: mkdtempSync(join(tmpdir(), 'ms-dane-')), ELECTRON_DISABLE_SECURITY_WARNINGS: '1' }
});
const sieci = [];
const okno = await app.firstWindow();
okno.on('request', (r) => { if (!/^(file|data|blob|devtools):/.test(r.url())) sieci.push(r.url()); });
okno.on('console', (m) => { if (m.type() === 'error') console.log('[konsola]', m.text()); });
await okno.waitForLoadState('domcontentloaded');
const ramka = (m) => czekaj(() => okno.frames().find((f) => f.url().includes('moduly/' + m + '.html')), 15000, 'ramka ' + m);

try {
  // 1. Folder Konsylium widoczny w menu
  await czekaj(async () => (await okno.textContent('#folder-sciezka')).includes(folder), 5000, 'ścieżka folderu');

  // 1a. Prezent startowy (tylko wersja 0.1.x): zakrywa aplikację, otwiera się kliknięciem i sam znika
  if (await okno.$('#prezent')) {
    await okno.click('#prezent');
    await czekaj(async () => !(await okno.$('#prezent')), 20000, 'zniknięcie prezentu');
  }

  // 1b. Rozmowa (domyślna zakładka): wiadomość → rozmowa/<KOD>/wiadomosci.jsonl → odpowiedź zespołu jednym głosem
  const rz = await ramka('rozmowa');
  await rz.waitForSelector('#tekst');
  await rz.fill('#tekst', 'Klient unika szefa od dwóch tygodni, jak zacząć rozmowę o tym?');
  await rz.click('#wyslij');
  const kodR = await czekaj(() => existsSync(join(folder, 'rozmowa')) && execFileSync('ls', [join(folder, 'rozmowa')], { encoding: 'utf8' }).trim().split('\n')[0], 5000, 'katalog rozmowy');
  const katR = join(folder, 'rozmowa', kodR);
  await czekaj(() => existsSync(join(katR, 'wiadomosci.jsonl')), 5000, 'wiadomosci.jsonl');
  const pierwsza = JSON.parse(readFileSync(join(katR, 'wiadomosci.jsonl'), 'utf8').trim().split('\n')[0]);
  assert.match(pierwsza.tekst, /unika szefa/);
  assert.match(py('rozmowa.py', 'czekaj', '--kod', kodR, '--limit', '5'), /unika szefa/);
  py('rozmowa.py', 'panel', '--kod', kodR, '--role', 'cbt,systemowy,straznik');
  await rz.waitForSelector('text=zespół pracuje', { timeout: 8000 });
  writeFileSync(join(folder, 'odp.json'), JSON.stringify({ tekst: 'Zacznij od tego, czego klient się spodziewa po tej rozmowie.', panel: ['cbt', 'systemowy', 'straznik'], ryzyko: 0, glosy: [{ rola: 'cbt', skrot: 'unikanie podtrzymuje lęk' }], odbiorca: 'terapeuta' }));
  py('rozmowa.py', 'odpowiedz', '--kod', kodR, '--plik', join(folder, 'odp.json'));
  await new Promise((r) => setTimeout(r, 3000));
  await rz.waitForSelector('.wiad.on >> text=czego klient się spodziewa', { timeout: 8000 });
  assert.ok(!existsSync(join(katR, 'panel.json')), 'panel.json usunięty po odpowiedzi');

  // 2. Wywiad na żywo: opis z danymi osobowymi (mają zniknąć przed zapisem)
  await okno.click('button.modul[data-modul="wywiad"]');
  const w = await ramka('wywiad');
  await w.waitForSelector('[data-tryb="zywo"]:not([disabled])');
  await w.click('[data-tryb="zywo"]');
  await w.fill('#pole-opis', 'Nazywam się Jan Kowalski, PESEL 85010112345, mam 44 lata, jestem mężczyzną. Od wczoraj boli mnie brzuch pod prawymi żebrami, gorzej po tłustym.');
  await w.click('#dalej');
  await w.waitForSelector('text=Dobieram kolejne pytania', { timeout: 8000 });
  const katalogi = () => execFileSync('ls', [join(folder, 'wywiad-na-zywo')], { encoding: 'utf8' }).trim().split('\n');
  const kod = await czekaj(() => existsSync(join(folder, 'wywiad-na-zywo')) && katalogi()[0], 5000, 'katalog wywiadu');
  const kat = join(folder, 'wywiad-na-zywo', kod);
  const stan1 = JSON.parse(readFileSync(join(kat, 'stan.json'), 'utf8'));
  assert.equal(stan1.etap, 'czeka-na-pytania');
  assert.ok(stan1.czekaNaPytania);
  const s1 = JSON.stringify(stan1);
  assert.ok(!s1.includes('85010112345'), 'PESEL nie może trafić do stan.json');
  assert.ok(!s1.includes('Kowalski'), 'nazwisko nie może trafić do stan.json');
  assert.match(stan1.markdown, /Prośba o ankietę dla pacjenta \(MS Wywiad, na żywo\)/);

  // 3. „Claude” czeka na stan i dopisuje dwa pytania (pierwsze z flagą 112)
  const pod = py('wywiad_na_zywo.py', 'czekaj', '--limit', '5');
  assert.match(pod, /PACJENT CZEKA NA PYTANIA/);
  writeFileSync(join(folder, 'p1.json'), JSON.stringify({
    pytania: [
      { id: 'zoltaczka', typ: 'jeden', tekst: 'Czy zauważyłaś/zauważyłeś zażółcenie białek oczu?', krotko: 'Żółtaczka', opcje: [{ w: 'tak', t: 'Tak' }, { w: 'nie', t: 'Nie' }] },
      { id: 'goraczka', typ: 'jeden', tekst: 'Czy masz gorączkę lub dreszcze?', krotko: 'Gorączka', opcje: [{ w: 'tak', t: 'Tak' }, { w: 'nie', t: 'Nie' }] }
    ],
    flagi: [{ poziom: '112', dlaLekarza: 'Żółtaczka z gorączką: podejrzenie zapalenia dróg żółciowych.', gdy: { wszystkie: [{ pytanie: 'zoltaczka', jest: 'tak' }, { pytanie: 'goraczka', jest: 'tak' }] } }]
  }));
  assert.match(py('wywiad_na_zywo.py', 'dodaj', '--kod', kod, '--pytania', 'p1.json'), /wersja 1/);
  await w.waitForSelector('text=zażółcenie białek oczu', { timeout: 8000 });
  await w.click('.opcja[data-w="nie"]');
  await w.waitForSelector('text=gorączkę lub dreszcze', { timeout: 5000 });

  // 4. Powtórzone id jest odrzucane przez skrypt
  writeFileSync(join(folder, 'p2.json'), JSON.stringify([{ id: 'goraczka', typ: 'tekst', tekst: 'x' }]));
  assert.throws(() => py('wywiad_na_zywo.py', 'dodaj', '--kod', kod, '--pytania', 'p2.json'));

  // 5. Wyniki z anonimizatora dołączone z ekranu wywiadu
  await w.waitForSelector('#dolacz-wyniki:not([hidden])');
  await w.click('#dolacz-wyniki');
  const an = await ramka('anonimizator');
  await an.waitForSelector('#b-wywiad:not([hidden])', { timeout: 20000, state: 'attached' });
  assert.ok(await okno.$eval('iframe[data-modul="anonimizator"]', (f) => !f.hidden), 'anonimizator jest widoczny');
  await an.evaluate(() => window.parent.postMessage({ typ: 'ms-most', id: 999, op: 'wyslij', args: ['wywiad', { wyniki: 'ALT 112 U/l (N <35)\nBilirubina 1,4 mg/dl\nPacjent: Anna Nowak', nazwa: 'Synevo test' }] }, '*'));
  await okno.click('button.modul[data-modul="wywiad"]');
  await w.click('.opcja[data-w="nie"]');
  await w.waitForSelector('text=Dobieram kolejne pytania', { timeout: 5000 });
  const stan2 = JSON.parse(await czekaj(() => { const t = readFileSync(join(kat, 'stan.json'), 'utf8'); return JSON.parse(t).odpowiedzi.length >= 3 && t; }, 5000, 'stan po odpowiedziach'));
  assert.equal(stan2.wyniki.length, 1);
  assert.match(stan2.wyniki[0].tekst, /ALT 112/);

  // 6. Ostatnie pytanie i koniec
  writeFileSync(join(folder, 'p3.json'), JSON.stringify([{ id: 'obawy', typ: 'tekst', tekst: 'Czego najbardziej się obawiasz?', bezNieznanych: true }]));
  py('wywiad_na_zywo.py', 'dodaj', '--kod', kod, '--pytania', 'p3.json', '--koniec');
  await w.waitForSelector('text=Czego najbardziej się obawiasz', { timeout: 8000 });
  await w.fill('#pole-obawy', 'Że to coś poważnego.');
  await w.click('#dalej');
  await w.waitForSelector('[data-akcja="zywo-wyslij"]', { timeout: 5000 });
  await w.click('[data-akcja="zywo-wyslij"]');
  const md = await czekaj(() => existsSync(join(kat, '01-wywiad.md')) && readFileSync(join(kat, '01-wywiad.md'), 'utf8'), 5000, '01-wywiad.md');
  assert.match(md, /# Wywiad wstępny/);
  assert.match(md, /zażółcenie białek oczu.*O: Nie/);
  assert.match(md, /## Wyniki badań \(z anonimizatora\)/);
  assert.ok(!/85010112345|Kowalski|Nowak/.test(md), '01-wywiad.md bez danych osobowych');
  assert.match(py('wywiad_na_zywo.py', 'pokaz', '--kod', kod), /Wywiad wysłany/);

  // 7. Konsylium pisze dymki z pełną treścią, Pokój psychologiczny pokazuje je na żywo
  // aplikacja sama założyła czystą sprawę dla tego wywiadu (Michał 1.11: „znowu miesza sprawy”)
  const idSprawy = (await czekaj(() => existsSync(join(kat, 'sprawa.txt')) && readFileSync(join(kat, 'sprawa.txt'), 'utf8').trim(), 5000, 'sprawa.txt'));
  assert.match(idSprawy, /^\d{4}-\d{2}-\d{2}-\d{2}$/, 'nazwa sprawy RRRR-MM-DD-NN');
  const sprawa = join(folder, 'sprawy', idSprawy);
  assert.ok(existsSync(join(sprawa, '00-surowe.md')) && existsSync(join(sprawa, '01-wywiad.md')) && existsSync(join(sprawa, '_log.jsonl')), 'sprawa z wywiadem i logiem');
  assert.match(readFileSync(join(sprawa, '01-wywiad.md'), 'utf8'), /\*\*Pacjent:\*\*/, 'wiek i płeć w nagłówku wywiadu');
  assert.match(py('wywiad_na_zywo.py', 'pokaz', '--kod', kod), new RegExp('ZAŁOŻYŁA JUŻ sprawę sprawy/' + idSprawy));
  py('dymek.py', sprawa, '--rola', 'prowadzacy', '--faza', 'Wywiad', '--temat', 'Ból w prawym podżebrzu po tłustym posiłku', '--skrot', 'Zaczynamy.',
    '--tresc', 'Pacjent z bólem w prawym podżebrzu nasilającym się po posiłku tłustym, bez żółtaczki i gorączki. Zaczynamy od triage.');
  await okno.click('button.modul[data-modul="pokoj"]');
  const pk = await ramka('pokoj');
  await pk.waitForSelector('text=na żywo z folderu Konsylium', { timeout: 10000 });
  py('dymek.py', sprawa, '--rola', 'psychodynamiczny', '--faza', 'Ślepa tura', '--skrot', 'Kolka żółciowa 0,55.',
    '--tresc', 'Najbardziej prawdopodobna jest kolka żółciowa (p≈0,55) w przebiegu kamicy pęcherzyka żółciowego. Brak gorączki i żółtaczki obniża prawdopodobieństwo zapalenia dróg żółciowych.',
    '--info', 'p=0,55 · Tokio 2018: kryteria niespełnione');
  await pk.waitForSelector('.dymek.pelny >> text=kamicy pęcherzyka żółciowego', { timeout: 15000 });
  assert.match(await pk.textContent('.dymek.pelny .info'), /Tokio 2018/);

  // 8. Wnioski końcowe: 09-FINAL.md otwiera ekran wniosków w Pokoju
  writeFileSync(join(sprawa, '09-FINAL.md'), 'FORMULACJA: Ból po posiłkach podtrzymuje lęk o zdrowie i unikanie jedzenia.\nKIERUNEK PRACY: CBT lęku o zdrowie po wykluczeniu przyczyny somatycznej (USG jamy brzusznej).\nCO NAJPIERW: dzienniczek posiłków i objawów przez 7 dni\nCZEGO NIE PRZEOCZYĆ: kolka żółciowa, gorączka lub żółtaczka: SOR\nPLAN BEZPIECZEŃSTWA: przesiew ujemny dnia 2026-11-01\nZDANIE ODRĘBNE: brak\nCZEGO NIE WIEMY: wyniki badań\nWRÓĆ / ESKALUJ GDY: gorączka, żółtaczka\nŹRÓDŁA: Tokio 2018\n— Narzędzie testowe i edukacyjne marki MS. Nie służy do diagnozy ani terapii realnych osób.\n');
  await pk.waitForSelector('#wnioski:not([hidden]) .rek', { timeout: 10000 });
  assert.match(await pk.textContent('#wnioski .rek'), /CBT lęku o zdrowie/);
  assert.match(await pk.textContent('#wnioski dl'), /CZEGO NIE PRZEOCZYĆ/);
  await okno.screenshot({ path: join(tmpdir(), 'ms-na-zywo-wnioski.png') });

  assert.deepEqual(sieci, [], 'aplikacja nie łączy się z siecią');
  await okno.screenshot({ path: join(tmpdir(), 'ms-na-zywo-pokoj.png') });
  console.log('e2e na żywo OK', folder);
} finally {
  await app.close();
}
