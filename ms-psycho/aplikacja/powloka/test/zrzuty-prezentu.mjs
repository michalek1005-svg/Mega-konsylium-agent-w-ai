// Zrzuty TEJ aplikacji do kolażu w prezencie „Dla Halusi” (tylko wersja 1).
// Użycie: node zbuduj.mjs --bez-paczki && xvfb-run -a node test/zrzuty-prezentu.mjs  → ../prezent/zrzuty/*.png (potem jpg, zbuduj.mjs bierze *.jpg)
import { createRequire } from 'node:module';
const { _electron: electron } = createRequire(import.meta.url)('playwright');
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readdirSync, cpSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const tu = dirname(fileURLToPath(import.meta.url));
const psycho = join(tu, '..', '..', '..');
const cel = join(psycho, 'aplikacja', 'prezent', 'zrzuty');
mkdirSync(cel, { recursive: true });
const folder = mkdtempSync(join(tmpdir(), 'ms-psycho-z-'));
for (const k of ['CLAUDE.md', 'config', 'skrypty']) cpSync(join(psycho, k), join(folder, k), { recursive: true });
const py = (...a) => execFileSync('python3', [join(folder, 'skrypty', a[0]), ...a.slice(1)], { cwd: folder, encoding: 'utf8' });
const app = await electron.launch({
  executablePath: join(tu, '..', 'node_modules', 'electron', 'dist', 'electron'),
  args: ['--no-sandbox', join(tu, '..', 'build', 'main.js')],
  env: { ...process.env, MS_FOLDER_KONSYLIUM: folder, MS_DANE_APLIKACJI: mkdtempSync(join(tmpdir(), 'ms-dane-')), ELECTRON_DISABLE_SECURITY_WARNINGS: '1' }
});
const okno = await app.firstWindow();
await okno.waitForLoadState('domcontentloaded');
const zrzut = (n) => okno.screenshot({ path: join(cel, n + '.png') });
const ramka = async (m) => { for (;;) { const f = okno.frames().find((x) => x.url().includes('moduly/' + m + '.html')); if (f) return f; await okno.waitForTimeout(200); } };
const czekaj = (ms) => okno.waitForTimeout(ms);
try {
  await okno.click('#prezent-pomin');
  await okno.click('#zgoda-ok');
  const r = await ramka('rozmowa');
  await r.waitForSelector('.msg.zespol');
  await czekaj(1500);
  const id = readdirSync(join(folder, 'rozmowy'))[0];
  await r.fill('#tekst', 'Od tygodnia kłócę się z siostrą o opiekę nad mamą i po każdej rozmowie czuję się winna 😔 Jak z nią o tym porozmawiać, żeby nie skończyło się awanturą?');
  await r.press('#tekst', 'Enter');
  await czekaj(800);
  py('rozmowa.py', 'pracuje', '--rozmowa', id, '--panel', 'straznik_ryzyka,terapeuta_systemowy,terapeuta_humanistyczny,prowadzacy', '--etap', 'rozważa odpowiedź');
  await czekaj(2200);
  await zrzut('2-Zespół pracuje');
  writeFileSync(join(folder, 'odp.json'), JSON.stringify({
    tekst: 'Słyszę, że zależy Ci i na mamie, i na siostrze – a poczucie winy po każdej rozmowie mówi, jak bardzo 🤍\n\nSpróbowałbym zacząć nie od tego, kto ma rację, tylko od wspólnego celu: „Obie chcemy, żeby mamie było dobrze”. Potem jedna konkretna sprawa na rozmowę – np. weekendy – zamiast całej listy. I umówcie się, że gdy zrobi się gorąco, robicie przerwę i wracacie do tematu następnego dnia.\n\nCo jest dla Ciebie najtrudniejsze w tych rozmowach – ton siostry, czy to, co sama wtedy myślisz o sobie? 🌱',
    ryzyko: 0, reakcja: '🤍',
    glosy: [{ rola: 'straznik_ryzyka', skrot: 'Poziom 0: brak sygnałów ryzyka.' }, { rola: 'terapeuta_systemowy', skrot: 'Spór o opiekę to często spór o lojalność i role z dzieciństwa; zacząć od wspólnego celu, jedna sprawa naraz.' }, { rola: 'terapeuta_humanistyczny', skrot: 'Poczucie winy pokazuje wartość troski; najpierw je uznać, potem strategia rozmowy.' }]
  }));
  py('rozmowa.py', 'odpowiedz', '--rozmowa', id, '--plik', join(folder, 'odp.json'));
  await r.waitForSelector('.msg.zespol[data-n="1"]');
  await czekaj(800);
  await zrzut('1-Rozmowa');
  await r.click('[data-glosy="1"]');
  await czekaj(500);
  await zrzut('3-Głosy zespołu');
  await okno.click('button.modul[data-modul="wywiad"]');
  await czekaj(2500);
  await zrzut('4-Wywiad');
  await okno.click('button.modul[data-modul="pokoj"]');
  const p = await ramka('pokoj');
  await czekaj(9000);
  await zrzut('5-Pokój psychologiczny');
  await czekaj(6000);
  await zrzut('6-Konfrontacja podejść');
  await p.click('#wnioski-btn').catch(() => {});
  await czekaj(1500);
  await zrzut('7-Wnioski');
  await okno.click('#motyw');
  await okno.click('button.modul[data-modul="rozmowa"]');
  await czekaj(1500);
  await zrzut('8-Tryb ciemny');
} finally { await app.close(); }
console.log('Zrzuty w', cel);
