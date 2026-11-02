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
  // 1. Prezent (tylko 0.1.x–0.2.x) → „To nie jest terapia” (zawsze)
  if (await okno.$('#prezent')) {
    await okno.waitForSelector('#prezent .pud', { state: 'visible' });
    await okno.waitForTimeout(1200); await zrzut('1-prezent');
    await okno.click('#prezent .pud', { force: true });
    await okno.waitForTimeout(2600); await zrzut('2-kolaz');
    await okno.waitForTimeout(6200); await zrzut('3-dla-halusi');
    assert.match(await okno.textContent('#prezent .napis'), /Dla Halusi/);
  } else assert.ok(!/^0\.[12]\./.test(JSON.parse(readFileSync(join(tu, '..', 'package.json'), 'utf8')).version), 'w 0.1.x–0.2.x prezent musi być');
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
  await r.fill('#k-wiek', '41'); await r.selectOption('#k-plec', 'mężczyzna');
  await r.check('#konto-nowe input[name="styl"][value="cieplo"]');  // 0.3.0: karta terapeuty przy koncie
  await r.click('#konto-nowe button[type=submit]');
  await r.waitForSelector('#konta', { state: 'hidden' });
  const konto = readdirSync(join(folder, 'konta'))[0];
  assert.match(konto, /^k[a-z0-9]{5}$/);
  assert.equal(JSON.parse(readFileSync(join(folder, 'konta', konto, 'profil.json'), 'utf8')).pseudonim, 'Leśny');
  assert.match(await r.textContent('#konto-nazwa'), /Leśny/);
  assert.equal(JSON.parse(readFileSync(join(folder, 'konta', konto, 'terapeuta.json'), 'utf8')).styl, 'cieplo');
  await czekaj(async () => /ciepło i z humorem/.test(await r.textContent('#sub')), 6000, 'styl w nagłówku');
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

  // 3a. Sesja z ramą (0.2.0): start → otwarcie → zadanie (Biorę) → koniec z suwakami i terminem
  await r.click('#sesja-btn');
  await r.waitForSelector('.dzien >> text=Sesja · początek');
  await r.waitForSelector('#faza:not([hidden]) span.on >> text=Otwarcie');
  assert.match(py('rozmowa.py', 'czekaj', '--limit', '3'), /SESJA 1 – OTWARCIE/);
  writeFileSync(join(folder, 'zad.json'), JSON.stringify({ tekst: 'Dobrze, że jesteś 🙂 Proponuję na koniec jedno małe zadanie – jest na karcie pod rozmową. O czym dziś najważniejsze?', ryzyko: 0, tempo: 'krotko', zadanie: 'Zapisz dziś wieczorem, co padło na zebraniu i co sam wiesz o swoim raporcie – 10 minut.' }));
  py('rozmowa.py', 'odpowiedz', '--rozmowa', id, '--plik', join(folder, 'zad.json'));
  await r.waitForSelector('#karta-zadania:not([hidden]) >> text=Biorę', { timeout: 8000 });
  await zrzut('6a-sesja-zadanie');
  await r.click('#karta-zadania [data-zadanie="biore"]');
  await czekaj(async () => JSON.parse(readFileSync(join(folder, 'konta', konto, 'zadanie.json'), 'utf8')).status === 'biore', 6000, 'zadanie biorę');
  await r.waitForSelector('#karta-zadania >> text=Zrobione');
  assert.match(py('rozmowa.py', 'czekaj', '--limit', '3'), /ZADANIE – osoba kliknęła: biore/);
  py('rozmowa.py', 'odpowiedz', '--rozmowa', id, '--tekst', 'Super, to konkret – trzymam kciuki za ten wieczór 🙂', '--ryzyko', '0');

  // 3b. 0.3.0: cel pracy → karta „Nad czym pracujemy” → „To jest to”
  await r.fill('#tekst', 'Chcę, żeby takie uwagi szefowej nie zabierały mi całego wieczoru.'); await r.press('#tekst', 'Enter');
  await czekaj(async () => /zabierały/.test(readFileSync(join(kat, 'uzytkownik.json'), 'utf8')), 6000, 'wiadomość o celu');
  assert.match(py('rozmowa.py', 'czekaj', '--limit', '3'), /STYL TERAPEUTY[^\n]*Ciepło i z humorem/);
  writeFileSync(join(folder, 'cel.json'), JSON.stringify({ tekst: 'Zapiszmy to jako cel naszej pracy – możesz go poprawić na karcie u góry. Co zwykle dzieje się wieczorem po takiej uwadze?', ryzyko: 0, cel: 'Żeby uwagi szefowej nie zabierały mi całego wieczoru.' }));
  py('rozmowa.py', 'odpowiedz', '--rozmowa', id, '--plik', join(folder, 'cel.json'));
  await r.waitForSelector('#cel:not([hidden]) >> text=To jest to', { timeout: 8000 });
  await zrzut('6c-cel-propozycja');
  await r.click('#cel [data-cel="tak"]');
  await czekaj(async () => JSON.parse(readFileSync(join(folder, 'konta', konto, 'cel.json'), 'utf8')).status === 'uzgodniony', 6000, 'cel uzgodniony');
  await r.waitForSelector('#cel >> text=Nad czym pracujemy');
  assert.match(py('rozmowa.py', 'czekaj', '--limit', '3'), /CEL PRZYJĘTY/);
  py('rozmowa.py', 'odpowiedz', '--rozmowa', id, '--tekst', 'Dobrze, to nasz kierunek 🌱 Wracając do wieczoru – mam pomysł na krótkie ćwiczenie, kilka minut. Spróbujemy?', '--ryzyko', '0');

  // 3c. 0.3.0: ćwiczenie krok po kroku za zgodą → karta kroku → karta wyniku; drugie przerwane przyciskiem
  await r.fill('#tekst', 'tak, spróbujmy'); await r.press('#tekst', 'Enter');
  await czekaj(async () => /spróbujmy/.test(readFileSync(join(kat, 'uzytkownik.json'), 'utf8')), 6000, 'zgoda na ćwiczenie');
  assert.match(py('rozmowa.py', 'czekaj', '--limit', '3'), /ĆWICZENIA \(za zgodą/);
  const krok = (o) => { writeFileSync(join(folder, 'cw.json'), JSON.stringify({ ryzyko: 0, ...o })); return py('rozmowa.py', 'odpowiedz', '--rozmowa', id, '--plik', join(folder, 'cw.json')); };
  krok({ tekst: 'Zróbmy mały eksperyment 🙂 Co Twoim zdaniem się stanie, jeśli jutro zapytasz szefową, czego brakowało w raporcie – i na ile w to wierzysz, od 0 do 100?', cwiczenie: { start: 'eksperyment', zgoda: 'tak, spróbujmy' } });
  await r.waitForSelector('#karta-cwiczenia:not([hidden]) >> text=krok 1 z 4', { timeout: 8000 });
  await zrzut('6d-cwiczenie-krok');
  const odpOsoby = ['Że mnie zbędzie albo zrobi mi wykład, 80', 'Jutro po stand-upie, w jej pokoju', 'Że stchórzę – wtedy wyślę jej maila', 'Jeśli powie jedną konkretną rzecz do poprawy'];
  for (let i = 0; i < odpOsoby.length; i++) {
    await r.fill('#tekst', odpOsoby[i]); await r.press('#tekst', 'Enter');
    await czekaj(async () => readFileSync(join(kat, 'uzytkownik.json'), 'utf8').includes(odpOsoby[i]), 6000, 'krok ' + i);
    if (i === 0) assert.match(py('rozmowa.py', 'czekaj', '--limit', '3'), /ĆWICZENIE „Eksperyment behawioralny” · krok 1\/4/);
    krok(i < 3 ? { tekst: ['Zapisane. Co dokładnie zrobisz, kiedy i gdzie?', 'Dobrze. Co może przeszkodzić i co wtedy zrobisz?', 'Mądry plan B. Po czym poznasz, czy przewidywanie się sprawdziło?'][i], cwiczenie: { krok: odpOsoby[i] } }
      : { tekst: 'Masz gotowy eksperyment – zapis jest pod tą wiadomością. Ciekawie będzie zobaczyć, co naprawdę się wydarzy 🌱', cwiczenie: { krok: odpOsoby[i] } });
  }
  await r.waitForSelector('.msg.zespol .wynik-cw >> text=Eksperyment behawioralny', { timeout: 8000 });
  await r.waitForSelector('#karta-cwiczenia', { state: 'hidden' });
  await zrzut('6e-cwiczenie-wynik');
  assert.equal(JSON.parse(readFileSync(join(folder, 'konta', konto, 'cwiczenia.json'), 'utf8'))[0].id, 'eksperyment');
  await r.fill('#tekst', 'a może jeszcze uziemienie, trochę mnie nosi'); await r.press('#tekst', 'Enter');
  await czekaj(async () => /uziemienie/.test(readFileSync(join(kat, 'uzytkownik.json'), 'utf8')), 6000, 'prośba o uziemienie');
  krok({ tekst: 'Jasne. Jak silne jest napięcie w tej chwili, od 0 do 10?', cwiczenie: { start: 'uziemienie', zgoda: 'może jeszcze uziemienie' } });
  await r.waitForSelector('#karta-cwiczenia:not([hidden]) >> text=Uziemienie', { timeout: 8000 });
  await r.click('#cw-przerwij');
  await r.waitForSelector('#karta-cwiczenia', { state: 'hidden' });
  await czekaj(async () => /"akcja": "przerwij"/.test(readFileSync(join(kat, 'uzytkownik.json'), 'utf8')), 6000, 'przerwanie ćwiczenia');
  assert.match(py('rozmowa.py', 'czekaj', '--limit', '3'), /ĆWICZENIE PRZERWANE przyciskiem/);
  krok({ tekst: 'Jasne, zostawiamy to – możemy wrócić, kiedy zechcesz 🙂', tempo: 'krotko', cwiczenie: { przerwij: true } });
  assert.equal(JSON.parse(readFileSync(join(kat, 'cwiczenie.json'), 'utf8')).status, 'przerwane');
  let drugie = false;
  try { py('rozmowa.py', 'odpowiedz', '--rozmowa', id, '--plik', join(folder, 'zad.json')); } catch { drugie = true; }
  assert.ok(drugie, 'drugie zadanie w tej samej sesji musi być odrzucone');
  await r.click('#sesja-btn');
  await r.waitForSelector('#suwaki-karta');
  await r.fill('#su-s', '6'); await r.fill('#su-t', '8');
  await zrzut('6b-sesja-suwaki');
  await r.click('#sesja-koniec-tak');
  await r.waitForSelector('.dzien >> text=Koniec sesji');
  const su = await czekaj(async () => { try { return JSON.parse(readFileSync(join(folder, 'konta', konto, 'suwaki.json'), 'utf8')); } catch { return null; } }, 6000, 'suwaki.json');
  assert.equal(su[0].trafnosc, 8);
  assert.match(py('rozmowa.py', 'czekaj', '--limit', '3'), /SESJA ZAKOŃCZONA/);
  py('rozmowa.py', 'odpowiedz', '--rozmowa', id, '--tekst', 'Dziękuję za dziś 🙂 Trzymam kciuki za te 10 minut wieczorem – do zobaczenia za tydzień, a gdyby coś się działo wcześniej, pisz śmiało.', '--ryzyko', '0');

  // 3d. 0.3.0: superwizja po sesji → panel „Superwizja” w oknie konta → notatka superwizora; raport realizmu
  writeFileSync(join(folder, 'str.md'), 'Osoba przyszła z upokorzeniem po krytyce szefowej. Uzgodniliśmy cel i zrobiliśmy eksperyment behawioralny. Klient-sędzia: zielona kartka.');
  assert.match(py('rozmowa.py', 'superwizja', '--rozmowa', id, '--plik', join(folder, 'str.md')), /OK: superwizja zapisana/);
  await r.click('#konto-btn');
  await r.click('#k-superwizja');
  await r.waitForSelector('#formulacja:not([hidden]) >> text=Superwizja');
  assert.match(await r.textContent('#formulacja'), /eksperyment behawioralny/);
  await r.fill('#sw-notatka', 'Za szybko do techniki – w następnej sesji więcej słuchania.');
  await r.click('#sw-zapisz');
  await czekaj(async () => { try { return /więcej słuchania/.test(readFileSync(join(folder, 'superwizja', konto, 'notatka.json'), 'utf8')); } catch { return false; } }, 6000, 'notatka superwizora');
  await zrzut('6f-superwizja');
  await r.click('#sw-zamknij');
  assert.match(py('realizm.py'), /Ćwiczenia ukończone \/ rozpoczęte \| 1\/2/);

  // 3e. 0.3.0: zmiana stylu w „Co pamiętam” → zdarzenie dla terapeuty
  await r.click('#pamiec-btn');
  await r.click('#styl-zmien');
  await r.check('#formulacja input[name="styl"][value="wprost"]');
  await r.click('#styl-zapisz');
  await czekaj(async () => JSON.parse(readFileSync(join(folder, 'konta', konto, 'terapeuta.json'), 'utf8')).styl === 'wprost', 6000, 'zmiana stylu');
  assert.match(py('rozmowa.py', 'czekaj', '--limit', '3'), /STYL ZMIENIONY przez osobę na „Wprost i konkretnie”/);
  py('rozmowa.py', 'odpowiedz', '--rozmowa', id, '--tekst', 'Dobrze – od teraz będę mówić bardziej wprost i konkretnie.', '--ryzyko', '0');

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
  console.log('OK: (prezent tylko 0.1.x–0.2.x), zgoda, konto, Rozmowa (szybka odpowiedź, sesja z zadaniem i suwakami, cel pracy, ćwiczenie krok po kroku i przerwanie, superwizja, zmiana stylu, pamięć, odpowiedź, głosy, reakcja, filtr ryzyka, kryzys), Zwołaj konsylium, Pokój z dymkami; zero żądań sieciowych.');
} finally {
  await app.close();
}
