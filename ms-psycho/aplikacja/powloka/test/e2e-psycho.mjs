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
  // 1. Prezent na całym ekranie → klik → kolaż, napis, serca → „To nie jest terapia”
  await okno.waitForSelector('#prezent .pud', { state: 'visible' });
  await okno.waitForTimeout(1200); await zrzut('1-prezent');
  await okno.click('#prezent .pud', { force: true });
  await okno.waitForTimeout(2600); await zrzut('2-kolaz');
  await okno.waitForTimeout(6200); await zrzut('3-dla-halusi');
  assert.match(await okno.textContent('#prezent .napis'), /Dla Halusi/);
  await okno.waitForSelector('#zgoda:not([hidden])', { timeout: 12000 });
  await zrzut('4-to-nie-jest-terapia');
  await okno.click('#zgoda-ok');
  await okno.waitForSelector('#zgoda', { state: 'hidden' });

  // 2. Rozmowa jest zakładką startową
  const r = await ramka('rozmowa');
  // 2a. Konto lokalne (Michał 1.11.2026 15:42): pseudonim, wiek, płeć; wiek <18 odrzucony
  await r.waitForSelector('#konto-nowe:not([hidden])');
  await zrzut('4a-konto-nowe');
  await r.fill('#k-ps', 'Leśny'); await r.fill('#k-wiek', '16'); await r.click('#konto-nowe button[type=submit]');
  assert.match(await r.textContent('#k-blad'), /18\+/);
  await r.fill('#k-wiek', '41'); await r.selectOption('#k-plec', 'mężczyzna'); await r.click('#konto-nowe button[type=submit]');
  await r.waitForSelector('#konta', { state: 'hidden' });
  const konto = readdirSync(join(folder, 'konta'))[0];
  assert.match(konto, /^k[a-z0-9]{5}$/);
  assert.equal(JSON.parse(readFileSync(join(folder, 'konta', konto, 'profil.json'), 'utf8')).pseudonim, 'Leśny');
  assert.match(await r.textContent('#konto-nazwa'), /Leśny/);
  await r.waitForSelector('.msg.zespol');
  await czekaj(async () => readdirSync(join(folder, 'rozmowy')).length === 1, 8000, 'katalog rozmowy');
  const id = readdirSync(join(folder, 'rozmowy'))[0];
  const kat = join(folder, 'rozmowy', id);
  assert.ok(id.startsWith(konto + '-'), 'ID rozmowy z prefiksem konta');
  assert.equal(JSON.parse(readFileSync(join(kat, 'meta.json'), 'utf8')).konto, konto);
  await r.click('.emoji button[data-e="😟"]');
  await r.type('#tekst', ' Wczoraj szefowa przy wszystkich powiedziała, że mój raport jest na poziomie stażysty. Jak mam jutro iść do pracy?');
  await r.press('#tekst', 'Enter');
  const u = await czekaj(async () => { const j = JSON.parse(readFileSync(join(kat, 'uzytkownik.json'), 'utf8')); return j.wiadomosci.length ? j : null; }, 8000, 'uzytkownik.json');
  assert.match(u.wiadomosci[0].tekst, /^😟 Wczoraj szefowa/);
  assert.equal(u.wiadomosci[0].ryzykoLokalne, undefined);
  assert.match(py('rozmowa.py', 'czekaj', '--limit', '3'), /NOWE wiadomości[\s\S]*szefowa/);

  assert.match(py('rozmowa.py', 'czekaj', '--limit', '3'), /KONTO: Leśny · 41 l\.[\s\S]*SZYBKO NAJPIERW/);
  // 2b. Szybka odpowiedź wstępna z pytaniem (Michał 15:43) → pasek „zbiera opinie zespołu”
  writeFileSync(join(folder, 'wst.json'), JSON.stringify({ tekst: 'Auć, to musiało zaboleć – zwłaszcza przy wszystkich. Co wtedy poczułeś najpierw: wstyd czy złość?', ryzyko: 0, wstepna: true }));
  assert.match(py('rozmowa.py', 'odpowiedz', '--rozmowa', id, '--plik', join(folder, 'wst.json')), /OK: odpowiedź #1/);
  await r.waitForSelector('.msg.zespol.wstepna[data-n="1"]', { timeout: 8000 });
  await r.waitForSelector('text=Zbieram jeszcze opinie zespołu', { timeout: 8000 });
  await zrzut('4b-szybka-odpowiedz');
  assert.match(py('rozmowa.py', 'czekaj', '--limit', '3'), /SZYBKA ODPOWIEDŹ JUŻ POSZŁA/);

  // 3. Zespół pracuje → jedna odpowiedź
  py('rozmowa.py', 'pracuje', '--rozmowa', id, '--panel', 'straznik_ryzyka,terapeuta_cbt,terapeuta_humanistyczny,prowadzacy', '--etap', 'rozważa odpowiedź');
  await r.waitForSelector('.pracuje:not(.spi) .aw');
  await zrzut('5-rozmowa-zespol-pracuje');
  writeFileSync(join(folder, 'odp.json'), JSON.stringify({
    tekst: 'To brzmi jak coś, co naprawdę zabolało – zwłaszcza że padło przy innych. Nic dziwnego, że ta scena wraca i że jutro wydaje się ciężkie 🤍\n\nNa dziś proponuję jedno: zapisz dokładnie, co padło, a obok – co o tym raporcie wiesz Ty sam. Rozmowę ze szefową w cztery oczy zostawmy na moment, gdy emocje trochę opadną.\n\nCo Ci teraz najbardziej chodzi po głowie – sam raport, czy to, że inni to słyszeli? 🤔',
    ryzyko: 0, reakcja: '🤍',
    glosy: [{ rola: 'straznik_ryzyka', skrot: 'Poziom 0: brak sygnałów ryzyka.' }, { rola: 'terapeuta_cbt', skrot: 'Zapisać myśl automatyczną i dowody; nie unikać pójścia do pracy.' }, { rola: 'terapeuta_humanistyczny', skrot: 'Najpierw uznać upokorzenie, potem technika.' }]
  }));
  assert.match(py('rozmowa.py', 'odpowiedz', '--rozmowa', id, '--plik', join(folder, 'odp.json')), /OK: odpowiedź #2/);
  await r.waitForSelector('.msg.zespol[data-n="2"]', { timeout: 6000 });
  await r.click('[data-glosy="2"]');
  await r.waitForSelector('.glos');
  await zrzut('6-rozmowa-odpowiedz');
  await r.hover('.msg.zespol[data-n="2"]');
  await r.click('.msg.zespol[data-n="2"] [data-e="🙏"]', { force: true });
  await czekaj(async () => JSON.parse(readFileSync(join(kat, 'uzytkownik.json'), 'utf8')).reakcje["2"] === '🙏', 6000, 'reakcja');

  // 4. Filtr ryzyka w aplikacji: karta kryzysowa od razu, bez modelu
  await r.fill('#tekst', 'Czasem myślę, żeby skończyć ze sobą.');
  await r.press('#tekst', 'Enter');
  await r.waitForSelector('.msg.kryzys');
  assert.match(await r.textContent('.msg.kryzys'), /800 70 2222/);
  await zrzut('7-rozmowa-filtr-kryzys');
  assert.match(py('rozmowa.py', 'czekaj', '--limit', '3'), /FILTR RYZYKA: poziom ≥3/);
  // obniżenie poziomu bez nowego faktu jest odrzucane
  let odrzucone = false;
  try { py('rozmowa.py', 'odpowiedz', '--rozmowa', id, '--tekst', 'Rozumiem.', '--ryzyko', '0'); } catch { odrzucone = true; }
  assert.ok(odrzucone, 'rozmowa.py musi odrzucić obniżenie ryzyka');
  py('rozmowa.py', 'odpowiedz', '--rozmowa', id, '--tekst', 'Dziękuję, że to napisałeś. To ważne i nie zostawię tego bez odpowiedzi: to wymaga rozmowy z człowiekiem teraz. Zadzwoń proszę pod 800 70 2222 – to całodobowo i bezpłatnie. Jeśli jesteś w niebezpieczeństwie, dzwoń pod 112.', '--ryzyko', '3', '--kryzys');
  await r.waitForSelector('.msg.kryzys >> nth=1');
  // flaga bez wątku samobójczego (przemoc): bez kryzys odrzucone, z kierunkiem – karta z Niebieską Linią
  const flaga = { tekst: 'To, co opisujesz, brzmi groźnie i ważne jest Twoje bezpieczeństwo teraz. Jeśli on jest w pobliżu i się boisz, dzwoń pod 112.', ryzyko: 3, flagi: { przemoc_doswiadczana: true } };
  writeFileSync(join(folder, 'flaga.json'), JSON.stringify(flaga));
  let bezKryzysu = false;
  try { py('rozmowa.py', 'odpowiedz', '--rozmowa', id, '--plik', join(folder, 'flaga.json')); } catch { bezKryzysu = true; }
  assert.ok(bezKryzysu, 'flaga strażnika bez kryzys: true musi być odrzucona');
  writeFileSync(join(folder, 'flaga.json'), JSON.stringify({ ...flaga, kryzys: true, kierunek: 'przemoc' }));
  py('rozmowa.py', 'odpowiedz', '--rozmowa', id, '--plik', join(folder, 'flaga.json'));
  await r.waitForSelector('.msg.kryzys .kierunek');
  assert.match(await r.textContent('.msg.kryzys .kierunek'), /Niebieska Linia/);

  // 4a. Pamięć konta: zapis przez rozmowa.py pamiec → panel „Co pamiętam”
  writeFileSync(join(folder, 'pam.md'), '- Przychodzi z upokorzeniem po krytyce szefowej przy zespole.\n- Pomaga: zapisać, co padło, i co sam wie o raporcie.\n- Ostatni krok: rozmowa w cztery oczy, gdy emocje opadną.');
  assert.match(py('rozmowa.py', 'pamiec', '--rozmowa', id, '--plik', join(folder, 'pam.md')), /OK: pamięć konta/);
  await r.click('#pamiec-btn');
  await r.waitForSelector('#formulacja:not([hidden]) >> text=Co pamiętam');
  assert.match(await r.textContent('#formulacja'), /cztery oczy/);
  await zrzut('7a-co-pamietam');
  await r.click('#pamiec-zamknij');

  // 5. Zwołaj konsylium → sprawa → Pokój psychologiczny
  await r.click('#zwolaj');
  await r.click('#zwolaj-tak');
  const sprawa = await czekaj(async () => readdirSync(join(folder, 'sprawy')).find((x) => /^\d{4}-\d\d-\d\d-\d\d$/.test(x)), 8000, 'sprawa');
  assert.match(readFileSync(join(folder, 'sprawy', sprawa, '01-wywiad.md'), 'utf8'), /szefowa/);
  assert.match(py('rozmowa.py', 'czekaj', '--limit', '3'), /PAMIĘĆ psychoterapeuty[\s\S]*cztery oczy[\s\S]*ZWOŁAŁ KONSYLIUM/);
  const p = await ramka('pokoj');
  await czekaj(async () => !(await okno.$('iframe[data-modul="pokoj"][hidden]')), 8000, 'Pokój widoczny');
  py('dymek.py', join('sprawy', sprawa), '--rola', 'terapeuta-cbt', '--faza', 'Ślepa tura', '--skrot', 'Upokorzenie przy zespole uruchomiło myśl „jestem niekompetentny”; unikanie jutrzejszego dnia podtrzyma lęk.', '--temat', 'Ślepa tura formulacji');
  py('dymek.py', join('sprawy', sprawa), '--rola', 'straznik-ryzyka', '--faza', 'Ryzyko', '--skrot', 'Słowa „skończyć ze sobą” – poziom 3 do czasu rozmowy z człowiekiem; konsylium pracuje nad planem bezpieczeństwa.');
  await p.waitForSelector('.dymek', { timeout: 15000 });
  await okno.waitForTimeout(1500);
  await zrzut('8-pokoj-psychologiczny');

  assert.deepEqual(sieci, [], 'aplikacja nie może łączyć się z siecią');
  console.log('OK: prezent, zgoda, konto, Rozmowa (szybka odpowiedź, pamięć, odpowiedź, głosy, reakcja, filtr ryzyka, kryzys), Zwołaj konsylium, Pokój z dymkami; zero żądań sieciowych.');
} finally {
  await app.close();
}
