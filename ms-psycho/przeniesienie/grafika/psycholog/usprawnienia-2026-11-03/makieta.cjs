// Makieta usprawnień wyglądu (Graficzny 3.11.2026): zrzuty PRAWDZIWEJ aplikacji (build z `node zbuduj.mjs --bez-paczki`)
// przed i po wstrzyknięciu propozycji z tego katalogu. Użycie: node makieta.cjs <katalog-wyjściowy>
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const TU = __dirname, PSY = path.join(TU, '../../../..');
const B = path.join(PSY, 'aplikacja/powloka/build/app/index.html');
const OUT = process.argv[2] || path.join(TU, 'zrzuty');
fs.mkdirSync(OUT, { recursive: true });
const css = (f) => fs.readFileSync(path.join(TU, f), 'utf8');
const UI = fs.readFileSync(path.join(TU, 'fragmenty.js'), 'utf8');
const POMOC = JSON.parse(fs.readFileSync(path.join(PSY, 'config/pomoc-pl.json'), 'utf8'));
const CSS = { powloka: css('powloka.css'), rozmowa: css('rozmowa.css'), wywiad: css('wywiad.css'), pokoj: css('pokoj.css') };

async function wstrzyknij(p, po, opcje) {
  for (const f of p.frames()) {
    const glowna = f === p.mainFrame();
    await f.evaluate(([UI, po, glowna, url, CSS, POMOC, opcje]) => {
      eval(UI); const d = document;
      const styl = (t) => { const s = d.createElement('style'); s.textContent = t; d.head.appendChild(s); };
      // karta ćwiczenia (przed: gwiazdka jak w 0.3.0, po: ikona ćwiczenia)
      const kc = d.getElementById('karta-cwiczenia');
      if (kc && opcje.cwiczenie) {
        kc.hidden = false;
        kc.innerHTML = (po ? MS_UI.ikonaCwiczenia('zapis_mysli') : '') + '<span class="tresc"><b>Ćwiczenie · Zapis myśli · krok 2 z 5<span class="kroki"><i class="z"></i><i class="t"></i><i></i><i></i><i></i></span></b>Myśl – odpowiedz w polu poniżej, swoimi słowami.</span><button class="btn" type="button">Przerwij</button>';
      }
      if (!po) return;
      if (glowna) {
        styl(CSS.powloka);
        const nav = d.querySelector('nav.pasek'), kre = d.createElement('span'); kre.className = 'kreska';
        const b = d.createElement('button'); b.type = 'button'; b.className = 'pomoc'; b.id = 'pomoc-przycisk'; b.setAttribute('aria-label', 'Pomoc w kryzysie');
        b.innerHTML = MS_UI.ikonaPomocy + '<span class="podpis">Pomoc w kryzysie</span>'; nav.appendChild(kre); nav.appendChild(b);
        if (opcje.panel) {
          const pn = d.createElement('div'); pn.className = 'folder pomoc-panel'; pn.innerHTML = MS_UI.panelPomocy(POMOC);
          d.querySelector('.tafla-glowna').appendChild(pn); b.setAttribute('aria-pressed', 'true');
        }
      } else if (/rozmowa/.test(url)) {
        styl(CSS.rozmowa);
        const ROLE = { terapeuta_cbt: ['', 'CBT', '#7b6cc4'], terapeuta_systemowy: ['', 'TS', '#c9a65c'], terapeuta_humanistyczny: ['', 'TH', '#b97a6c'], straznik_ryzyka: ['', 'SR', '#c0504d'] };
        const glosy = Object.keys(ROLE).map((r) => ({ rola: r }));
        d.querySelectorAll('.glosy-btn').forEach((g) => { if (!g.parentNode.querySelector('.twarze')) g.insertAdjacentHTML('beforebegin', MS_UI.twarze(glosy, (r) => ROLE[r])); });
      } else if (/wywiad/.test(url)) styl(CSS.wywiad);
      else if (/pokoj/.test(url)) {
        styl(CSS.pokoj);
        const pk = d.getElementById('pokoj'); if (pk && !d.getElementById('pusty-pokoj')) pk.insertAdjacentHTML('beforeend', MS_UI.pustyPokoj());
      }
    }, [UI, po, glowna, f.url(), CSS, POMOC, opcje]).catch((e) => console.error('ramka', f.url(), e.message));
  }
}

(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 });
  const ekrany = [['rozmowa', 0, { cwiczenie: true }], ['rozmowa-pomoc', 0, { cwiczenie: true, panel: true }], ['rozmowa-zespol', 0, { zespol: true }], ['wywiad', 1, {}], ['pokoj', 2, {}]];
  for (const motyw of ['jasny', 'ciemny']) for (const [n, zak, opcje] of ekrany) for (const po of [false, true]) {
    await p.goto('file://' + B); await p.waitForTimeout(900);
    const r = p.getByRole('button', { name: 'Rozumiem' }); if (await r.count()) await r.click();
    await (await p.$$('nav.pasek button.modul'))[zak].click(); await p.waitForTimeout(1300);
    for (const f of p.frames()) await f.evaluate((m) => { document.documentElement.dataset.motyw = m; }, motyw).catch(() => {});
    await p.mouse.move(700, 20); await wstrzyknij(p, po, opcje); await p.waitForTimeout(500);
    if (opcje.zespol) for (const f of p.frames()) await f.evaluate(() => { const g = document.querySelector('.glosy-btn'); if (g) g.scrollIntoView({ block: 'center' }); }).catch(() => {});
    await p.waitForTimeout(300);
    await p.screenshot({ path: path.join(OUT, `${n}-${motyw}-${po ? 'po' : 'przed'}.png`) });
  }
  await b.close();
})();
