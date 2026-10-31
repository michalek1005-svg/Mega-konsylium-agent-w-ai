// Pokój lekarski — rysuje pokój (SVG), sadza członków konsylium i odtwarza scenariusz w dymkach.
// Wymaga: zbudujScenariusz, ROLE (z scenariusz.mjs, wklejone przez build) i DEMO (scenariusz osadzony przy budowie).
(function () {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const esc = (t) => String(t ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const W = 1200, H = 700;
  const KOLOR = { ordynator: 'var(--g-ordynator)', lekarz: 'var(--g-lekarz)', zastepca: 'var(--g-zastepca)', sprawdzajacy: 'var(--g-sprawdzajacy)', rezydent: 'var(--g-rezydent)' };
  const SKORA = ['#e9c4a6', '#d7a684', '#b9825e', '#f0d2b8', '#8d5b3d', '#e2b48f'];
  const WLOSY = ['#2b211c', '#5a3b26', '#9b9590', '#1d1d22', '#7a4b2a', '#c9a46a'];

  // miejsca: x, y stóp, skala, warstwa (0 = za stołem, 1 = przed stołem), fryzura, okulary
  const MIEJSCA = {
    ordynator:            { x: 600, y: 440, s: 1.04, w: 0, f: 2, o: true },
    hipotezujacy:         { x: 440, y: 452, s: .95, w: 0, f: 1 },
    bayes:                { x: 760, y: 452, s: .95, w: 0, f: 0, o: true },
    najgorszy_scenariusz: { x: 262, y: 566, s: 1.02, w: 1, f: 3 },
    poz_pragmatyk:        { x: 938, y: 566, s: 1.02, w: 1, f: 4 },
    farmakolog:           { x: 470, y: 668, s: 1.05, w: 1, f: 5 },
    gospodarz_kosztow:    { x: 730, y: 668, s: 1.05, w: 1, f: 0 },
    z_zlozonosc:          { x: 214, y: 392, s: .78, w: 0, f: 3 },
    z_bezpieczenstwo:     { x: 274, y: 388, s: .78, w: 0, f: 0 },
    z_niepewnosc:         { x: 334, y: 392, s: .78, w: 0, f: 1, o: true },
    s_fakty:              { x: 1058, y: 444, s: .8, w: 0, f: 4, o: true },
    s_proces:             { x: 1138, y: 444, s: .8, w: 0, f: 2 },
  };
  const MIEJSCA_REZ = { 1: [[100]], 2: [[72], [130]], 3: [[58], [100], [142]] };

  let scen = null, kroki = [], i = 0, gra = false, timer = null, tempo = 1, szczegolKto = null;

  // ---------- rysunek pokoju ----------
  function figura(id, m, rola) {
    const g = rola.grupa, kol = KOLOR[g], s = m.s, ziarno = [...id].reduce((a, c) => a + c.charCodeAt(0), 0);
    const skora = SKORA[ziarno % SKORA.length], wlosy = WLOSY[(ziarno >> 1) % WLOSY.length];
    const fartuch = g === 'rezydent' ? kol : 'var(--fartuch)';
    const dlugi = g === 'ordynator' ? 8 : 0;
    const fry = [
      `<path d="M-17,-128 a17,17 0 0 1 34,0 q-4,-8 -17,-9 q-13,1 -17,9z" fill="${wlosy}"/>`,
      `<path d="M-18,-124 a18,19 0 0 1 36,0 l0,14 q-3,-14 -6,-18 q-12,4 -24,0 q-3,4 -6,18z" fill="${wlosy}"/>`,
      `<path d="M-17,-126 q2,-3 4,-2 l0,8 q-3,0 -4,-6z M17,-126 q-2,-3 -4,-2 l0,8 q3,0 4,-6z" fill="${wlosy}"/>`,
      `<path d="M-18,-126 a18,18 0 0 1 36,0 q-8,-6 -18,-6 q-10,0 -18,6z" fill="${wlosy}"/><circle cx="0" cy="-146" r="7" fill="${wlosy}"/>`,
      `<path d="M-18,-125 a18,18 0 0 1 36,-2 q-6,-4 -12,-3 q-8,-6 -24,5z" fill="${wlosy}"/>`,
      `<path d="M-19,-122 a19,20 0 0 1 38,0 l1,26 q-5,-2 -6,-20 q-12,-6 -26,0 q-1,18 -6,20z" fill="${wlosy}"/>`,
    ][m.f % 6];
    const stetoskop = (g === 'lekarz' || g === 'ordynator')
      ? `<path d="M-10,-104 q-4,22 6,30 q8,5 12,-4" fill="none" stroke="#2b3a38" stroke-width="2.4" stroke-linecap="round"/><circle cx="8" cy="-77" r="3.6" fill="#9fb1ad" stroke="#2b3a38" stroke-width="1.4"/>`
      : '';
    const plakietka = g === 'rezydent'
      ? `<rect x="7" y="-96" width="11" height="14" rx="2" fill="#fff"/><rect x="7" y="-96" width="11" height="4" rx="1" fill="var(--g-rezydent)"/>`
      : `<rect x="-17" y="-92" width="10" height="7" rx="1.5" fill="${kol}"/>`;
    const okulary = m.o ? `<g fill="none" stroke="#1e2a28" stroke-width="1.6"><circle cx="-6.5" cy="-123" r="4.6"/><circle cx="6.5" cy="-123" r="4.6"/><path d="M-2,-123 h4"/></g>` : '';
    const nogi = g === 'rezydent' ? '#3a3f4a' : '#24413d';
    return `
<g class="postac" data-kto="${id}" tabindex="0" role="button" aria-label="${esc(rola.nazwa)}" transform="translate(${m.x},${m.y}) scale(${s})" style="--g:${kol}">
  <ellipse cx="0" cy="0" rx="30" ry="7" fill="var(--cien-postaci)"/>
  <ellipse class="halo" cx="0" cy="0" rx="38" ry="10" fill="none" stroke="var(--petrol)" stroke-width="3"/>
  <g class="ciało">
    <rect x="-14" y="-48" width="11" height="47" rx="4" fill="${nogi}"/><rect x="3" y="-48" width="11" height="47" rx="4" fill="${nogi}"/>
    <rect x="-16" y="-4" width="14" height="5" rx="2.5" fill="#1b2120"/><rect x="2" y="-4" width="14" height="5" rx="2.5" fill="#1b2120"/>
    <path d="M-27,-${44 - dlugi} L-24,-98 Q-22,-108 -10,-109 L10,-109 Q22,-108 24,-98 L27,-${44 - dlugi} Z" fill="${fartuch}"/>
    <path d="M-10,-109 L0,-90 L10,-109 Z" fill="${g === 'rezydent' ? '#e8e2d6' : kol}"/>
    <path d="M0,-90 L0,-${46 - dlugi}" stroke="var(--fartuch-cien)" stroke-width="1.4"/>
    <rect x="-34" y="-104" width="10" height="44" rx="5" fill="${fartuch}"/><rect x="24" y="-104" width="10" height="44" rx="5" fill="${fartuch}"/>
    <circle cx="-29" cy="-58" r="5" fill="${skora}"/><circle cx="29" cy="-58" r="5" fill="${skora}"/>
    ${plakietka}${stetoskop}
    <rect x="-6" y="-114" width="12" height="8" fill="${skora}"/>
    <circle cx="0" cy="-125" r="17" fill="${skora}"/>
    ${fry}${okulary}
  </g>
</g>`;
  }

  function podpisy(widoczne) {
    return widoczne.map(([id, m]) => {
      const r = ROLE[id]; if (!r) return '';
      const KROTKO = { z_zlozonosc: 'złożoność', z_bezpieczenstwo: 'bezpieczeństwo', z_niepewnosc: 'niepewność', s_fakty: 'fakty', s_proces: 'proces' };
      const nazwa = r.grupa === 'rezydent' ? r.inicjaly : (KROTKO[id] || r.nazwa);
      const maly = r.grupa === 'zastepca' || r.grupa === 'sprawdzajacy' || r.grupa === 'rezydent';
      const y = m.y + 18 * m.s + (id === 'z_bezpieczenstwo' ? 11 : 0) + (r.grupa === 'sprawdzajacy' ? 32 : 0);
      return `<text class="${maly ? 'podpis podpis-maly' : 'podpis'}" x="${m.x}" y="${y}" text-anchor="middle">${esc(nazwa)}</text>`;
    }).join('');
  }

  function rysujPokoj() {
    const lr = Math.max(1, Math.min(3, scen?.tablica?.liczbaRezydentow || ileRezydentow()));
    const miejsca = { ...MIEJSCA };
    MIEJSCA_REZ[lr].forEach(([x], k) => { miejsca['R' + (k + 1)] = { x, y: 318, s: lr === 3 ? .6 : .66, w: -1, f: k + 2 }; });
    const wpisy = Object.entries(miejsca).filter(([id]) => ROLE[id]);

    // podłoga w perspektywie
    let podloga = '';
    for (let k = -12; k <= 12; k++) podloga += `<line x1="${600 + k * 22}" y1="338" x2="${600 + k * 140}" y2="700" stroke="var(--podloga-linia)" stroke-width="1.5"/>`;
    for (const y of [360, 392, 436, 494, 566, 652]) podloga += `<line x1="0" y1="${y}" x2="1200" y2="${y}" stroke="var(--podloga-linia)" stroke-width="1.5"/>`;
    let gwiazdy = '';
    [[905, 92], [960, 130], [1010, 84], [1080, 118], [1125, 96], [930, 190], [1050, 170], [1110, 210]].forEach(([x, y]) => { gwiazdy += `<circle cx="${x}" cy="${y}" r="1.6" fill="var(--okno-gwiazda)"/>`; });

    const zaStolem = wpisy.filter(([, m]) => m.w === 0).map(([id, m]) => figura(id, m, ROLE[id])).join('');
    const przedStolem = wpisy.filter(([, m]) => m.w === 1).map(([id, m]) => figura(id, m, ROLE[id])).join('');
    const rezydenci = wpisy.filter(([, m]) => m.w === -1).map(([id, m]) => figura(id, m, ROLE[id])).join('');

    $('rys').innerHTML = `
<rect x="0" y="0" width="${W}" height="338" fill="var(--sciana)"/>
${[180, 360, 840, 1020].map((x) => `<rect x="${x}" y="0" width="2" height="330" fill="var(--sciana-2)"/>`).join('')}
<polygon points="0,338 1200,338 1200,700 0,700" fill="var(--podloga)"/>
${podloga}
<rect x="0" y="328" width="${W}" height="10" fill="var(--listwa)"/>

<!-- okno -->
<rect x="876" y="56" width="280" height="200" rx="10" fill="var(--listwa)"/>
<rect x="886" y="66" width="260" height="180" rx="5" fill="var(--okno-niebo)"/>${gwiazdy}
<circle cx="1100" cy="104" r="14" fill="var(--okno-gwiazda)"/>
<rect x="1013" y="66" width="6" height="180" fill="var(--listwa)"/><rect x="886" y="153" width="260" height="6" fill="var(--listwa)"/>
<rect x="870" y="250" width="292" height="9" rx="3" fill="var(--listwa)"/>

<!-- tablica -->
<rect x="366" y="34" width="468" height="234" rx="12" fill="var(--tablica-rama)"/>
<rect x="374" y="42" width="452" height="218" rx="7" fill="var(--tablica)"/>
<rect x="420" y="268" width="360" height="7" rx="3" fill="var(--tablica-rama)"/>
<rect x="452" y="262" width="26" height="6" rx="2" fill="#0F5E58"/><rect x="484" y="262" width="26" height="6" rx="2" fill="#A83A38"/>

<!-- zegar: czas bieżącej fazy -->
<g transform="translate(276,142)"><circle r="30" fill="var(--tablica)" stroke="var(--tablica-rama)" stroke-width="5"/>
${Array.from({ length: 12 }, (_, k) => `<rect x="-1" y="-25" width="2" height="${k % 3 ? 3 : 6}" fill="var(--tablica-mut)" transform="rotate(${k * 30})"/>`).join('')}
<line id="wsk-h" x1="0" y1="0" x2="0" y2="-13" stroke="var(--tablica-txt)" stroke-width="3" stroke-linecap="round"/>
<line id="wsk-m" x1="0" y1="0" x2="0" y2="-20" stroke="var(--tablica-txt)" stroke-width="2" stroke-linecap="round"/>
<circle r="2.6" fill="#A83A38"/></g>

<!-- drzwi: korytarz rezydentów za szybą -->
<rect x="22" y="78" width="164" height="260" rx="6" fill="var(--listwa)"/>
<rect x="30" y="86" width="148" height="244" fill="var(--sciana-2)"/>
<rect x="30" y="300" width="148" height="30" fill="var(--podloga)"/>
${rezydenci}
<rect x="30" y="86" width="148" height="244" fill="var(--szyba)" stroke="var(--szyba-obrys)" stroke-width="2"/>
${[0, 1, 2, 3, 4, 5].map((k) => `<line x1="${44 + k * 22}" y1="96" x2="${30 + k * 22}" y2="150" stroke="var(--szyba-obrys)" stroke-width="1" opacity=".5"/>`).join('')}
<rect x="44" y="52" width="120" height="20" rx="5" fill="var(--g-rezydent)"/>
<text x="104" y="66" text-anchor="middle" font-family="var(--font)" font-size="10.5" font-weight="800" letter-spacing=".8" fill="#fff">STAŻ ZEWNĘTRZNY</text>

<!-- biurko sprawdzających -->
${zaStolem}
<rect x="1002" y="420" width="186" height="16" rx="4" fill="var(--stol-blat)"/>
<rect x="1006" y="436" width="178" height="38" rx="3" fill="var(--stol)"/>
<rect x="1030" y="384" width="54" height="36" rx="4" fill="#1b2826" stroke="var(--szyba-obrys)" stroke-width="1.5"/><rect x="1052" y="418" width="10" height="4" fill="#1b2826"/>
<rect x="1110" y="384" width="54" height="36" rx="4" fill="#1b2826" stroke="var(--szyba-obrys)" stroke-width="1.5"/><rect x="1132" y="418" width="10" height="4" fill="#1b2826"/>

<!-- stół konsylium -->
<ellipse cx="600" cy="548" rx="306" ry="88" fill="var(--stol-krawedz)"/>
<ellipse cx="600" cy="538" rx="300" ry="82" fill="var(--stol-blat)"/>
<ellipse cx="600" cy="532" rx="270" ry="64" fill="none" stroke="rgba(255,255,255,.06)" stroke-width="2"/>
<g opacity=".9">
  <rect x="566" y="478" width="68" height="40" rx="4" fill="#1b2826"/><rect x="570" y="482" width="60" height="30" rx="2" fill="var(--petrol)" opacity=".35"/>
  <rect x="452" y="500" width="34" height="24" rx="2" fill="var(--fartuch)" transform="rotate(-8 469 512)"/>
  <rect x="712" y="500" width="34" height="24" rx="2" fill="var(--fartuch)" transform="rotate(7 729 512)"/>
  <rect x="352" y="532" width="32" height="22" rx="2" fill="var(--fartuch)" transform="rotate(-14 368 543)"/>
  <rect x="818" y="532" width="32" height="22" rx="2" fill="var(--fartuch)" transform="rotate(12 834 543)"/>
  <rect x="488" y="568" width="34" height="24" rx="2" fill="var(--fartuch)" transform="rotate(4 505 580)"/>
  <rect x="680" y="568" width="34" height="24" rx="2" fill="var(--fartuch)" transform="rotate(-5 697 580)"/>
</g>
${przedStolem}

<!-- roślina -->
<g transform="translate(1150,676)"><path d="M-22,0 L-18,-34 L18,-34 L22,0 Z" fill="var(--listwa)"/>
<g fill="var(--g-zastepca)"><ellipse cx="-14" cy="-58" rx="10" ry="24" transform="rotate(-24 -14 -58)"/><ellipse cx="12" cy="-62" rx="10" ry="26" transform="rotate(20 12 -62)"/><ellipse cx="0" cy="-70" rx="9" ry="28"/></g></g>
${podpisy(wpisy)}`;
    MIEJSCA_AKT = miejsca;
    document.querySelectorAll('.postac').forEach((el) => {
      el.addEventListener('click', () => pokazOsobe(el.dataset.kto));
      el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pokazOsobe(el.dataset.kto); } });
    });
  }
  let MIEJSCA_AKT = MIEJSCA;

  function ileRezydentow() {
    if (!scen) return 2;
    const ids = new Set();
    scen.sceny.forEach((s) => s.wypowiedzi.forEach((w) => { if (/^R\d$/.test(w.kto)) ids.add(w.kto); }));
    return ids.size || 2;
  }

  // ---------- czas ----------
  function hhmm(ts) {
    if (!ts) return '';
    const d = new Date(ts); if (isNaN(d)) return '';
    try { return d.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Warsaw' }); } catch { return d.toISOString().slice(11, 16); }
  }
  function ustawZegar(ts) {
    const d = ts ? new Date(ts) : null;
    if (!d || isNaN(d)) return;
    let h = d.getUTCHours(), m = d.getUTCMinutes();
    try { const [hh, mm] = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Warsaw' }).split(':'); h = +hh; m = +mm; } catch { /* zostaje UTC */ }
    $('wsk-h')?.setAttribute('transform', `rotate(${(h % 12) * 30 + m / 2})`);
    $('wsk-m')?.setAttribute('transform', `rotate(${m * 6})`);
  }

  // ---------- odtwarzanie ----------
  // tryb na żywo: nowy scenariusz tej samej sprawy bez cofania odtwarzania
  // ---------- wnioski końcowe ----------
  let wnioskiPokazane = '';
  function rysujWnioski(s, otworz) {
    const w = s && s.wnioski, btn = $('wnioski-btn'), el = $('wnioski');
    // zmiana sprawy: poprzednie wnioski znikają, a nowe mogą otworzyć się same
    if (!scen || !s || scen.sprawa !== s.sprawa) { el.hidden = true; el.innerHTML = ''; wnioskiPokazane = null; }
    btn.hidden = !w;
    if (!w) { el.hidden = true; el.innerHTML = ''; return; }
    const rek = w.pola.find((p) => /^REKOMENDACJA/i.test(p.etykieta));
    const reszta = w.pola.filter((p) => p !== rek);
    el.innerHTML = `<div class="gora"><h2 id="wnioski-t">Wnioski konsylium · ${esc(s.sprawa || '')}</h2><button class="nk-button" type="button" id="wnioski-zamknij">Wróć do pokoju</button></div>` +
      (rek ? `<div class="rek">${esc(rek.tresc)}</div>` : '') +
      (reszta.length ? `<dl>${reszta.map((p) => `<dt>${esc(p.etykieta)}</dt><dd>${esc(p.tresc)}</dd>`).join('')}</dl>` : `<div style="white-space:pre-wrap">${esc(w.tekst)}</div>`) +
      `<p class="stopka-w">Narzędzie testowe i edukacyjne marki MS. Nie służy do podejmowania decyzji u realnych pacjentów.</p>`;
    $('wnioski-zamknij').addEventListener('click', () => { el.hidden = true; });
    // na żywo: pierwsze pojawienie się 09-FINAL otwiera wnioski same
    const klucz = (s.sprawa || '') + '|' + w.tekst.length;
    if (otworz && wnioskiPokazane !== klucz) { wnioskiPokazane = klucz; el.hidden = false; }
  }
  $('wnioski-btn').addEventListener('click', () => { $('wnioski').hidden = !$('wnioski').hidden; });

  function aktualizuj(s) {
    rysujWnioski(s, !!zywoTimer);
    const bylo = kroki.length, naKoncu = i >= bylo - 1;
    const rez = scen ? ileRezydentow() : 0;
    scen = s;
    s.tablica.liczbaRezydentow = ileRezydentow();
    kroki = [];
    s.sceny.forEach((sc, si) => sc.wypowiedzi.forEach((w, wi) => kroki.push({ si, wi })));
    if (kroki.length === bylo && bylo) return;
    if (s.tablica.liczbaRezydentow !== rez || !bylo) rysujPokoj();
    rysujOs(); rysujListe();
    if (!bylo) { rysujLegende(); pokaz(0, true); return; }
    pokaz(naKoncu ? Math.min(bylo, kroki.length - 1) : i, !naKoncu);
  }

  function przygotuj(s) {
    rysujWnioski(s, false); $('wnioski').hidden = true;
    scen = s;
    s.tablica.liczbaRezydentow = ileRezydentow();
    kroki = [];
    s.sceny.forEach((sc, si) => sc.wypowiedzi.forEach((w, wi) => kroki.push({ si, wi })));
    i = 0;
    $('opis-sprawy').textContent = s.sprawa ? `Sprawa ${s.sprawa}` : 'Sprawa bez nazwy';
    const chip = $('chip-tryb');
    chip.hidden = !s.tryb; chip.textContent = s.tryb === 'PELNY' ? 'pełne konsylium' : s.tryb === 'SZYBKI' ? 'tryb szybki' : (s.tryb || '');
    rysujPokoj(); rysujOs(); rysujListe(); rysujLegende();
    pokaz(0, true);
  }

  function czasKroku(k) {
    const w = scen.sceny[k.si].wypowiedzi[k.wi];
    return (2400 + (w.tresc || w.skrot).length * 34 + (w.info ? 1200 : 0)) / tempo;
  }

  function pokaz(n, bezPisania) {
    if (!kroki.length) return;
    i = Math.max(0, Math.min(kroki.length - 1, n));
    const k = kroki[i], sc = scen.sceny[k.si], w = sc.wypowiedzi[k.wi];
    const pokoj = $('pokoj');
    pokoj.classList.add('mowi');
    const poprz = i > 0 ? scen.sceny[kroki[i - 1].si].wypowiedzi[kroki[i - 1].wi].kto : null;
    document.querySelectorAll('.postac').forEach((el) => {
      el.classList.toggle('aktywna', el.dataset.kto === w.kto);
      el.classList.toggle('niedawno', el.dataset.kto === poprz && poprz !== w.kto);
    });
    rysujTablice(k.si);
    ustawZegar(sc.czas);
    // dymek: najpierw „pisze…”, potem treść
    const dymki = $('dymki');
    dymki.querySelectorAll('.dymek').forEach((d) => { d.classList.add('stary'); setTimeout(() => d.remove(), 400); });
    const d = document.createElement('div');
    const r = ROLE[w.kto] || { nazwa: w.kto, grupa: 'lekarz' };
    d.className = 'dymek wejscie' + (w.tresc ? ' pelny' : '');
    d.style.setProperty('--g', r.grupa === 'rezydent' ? '#8a5f34' : r.grupa === 'zastepca' ? '#4b6e3c' : r.grupa === 'sprawdzajacy' ? '#5a5890' : '#0F5E58');
    const tresc = `<span class="kto">${esc(r.nazwa)}${w.persona ? ' · ' + esc(w.persona) : ''}</span>${esc(w.tresc || w.skrot)}${w.info ? `<span class="info">${esc(w.info)}</span>` : ''}`;
    const ruch = !bezPisania && !matchMedia('(prefers-reduced-motion: reduce)').matches;
    d.innerHTML = ruch ? '<span class="kropki" aria-label="mówi"><i></i><i></i><i></i></span>' : tresc;
    if (ruch) d.classList.add('pisze');
    d.addEventListener('click', () => pokazSzczegol(w, sc));
    dymki.appendChild(d);
    ustawDymek(d, w.kto);
    if (ruch) setTimeout(() => { if (!d.isConnected) return; d.classList.remove('pisze'); d.innerHTML = tresc; ustawDymek(d, w.kto); }, Math.min(700, 900 / tempo));
    $('napisy').innerHTML = `<span class="nap-temat"><b>Teraz · ${esc(sc.tytul)}</b>${esc(sc.temat)}</span><span><b>${esc(r.nazwa)}</b>${esc(w.tresc || w.skrot)}${w.info ? ` <i>(${esc(w.info)})</i>` : ''}</span>`;
    // oś i protokół
    document.querySelectorAll('.odcinek').forEach((el, si) => {
      el.classList.toggle('biezacy', si === k.si);
      const ile = scen.sceny[si].wypowiedzi.length;
      const zrob = si < k.si ? ile : si === k.si ? k.wi + 1 : 0;
      el.querySelector('i').style.width = (100 * zrob / ile) + '%';
    });
    document.querySelectorAll('.wpis').forEach((el, n2) => { el.classList.toggle('biezacy', n2 === i); el.classList.toggle('przyszly', n2 > i); });
    const akt = document.querySelector('.wpis.biezacy');
    if (akt) { const l = $('lista'); const top = akt.offsetTop - l.offsetTop - l.clientHeight / 2; l.scrollTo({ top, behavior: ruch ? 'smooth' : 'auto' }); }
    zaplanuj();
  }

  function ustawDymek(d, kto) {
    const m = MIEJSCA_AKT[kto]; if (!m) return;
    const pokoj = $('pokoj'), Wp = pokoj.clientWidth, Hp = pokoj.clientHeight;
    const ax = m.x / W * Wp, ay = (m.y - 152 * m.s - 6) / H * Hp;
    const bw = d.offsetWidth, bh = d.offsetHeight, marg = 8;
    let left = ax;
    left = Math.max(bw / 2 + marg, Math.min(Wp - bw / 2 - marg, left));
    d.style.left = left + 'px';
    d.style.top = Math.max(bh + marg, ay) + 'px';
    d.style.setProperty('--ogon', Math.max(14, Math.min(bw - 14, ax - (left - bw / 2))) + 'px');
  }

  function zaplanuj() {
    clearTimeout(timer);
    if (!gra) return;
    timer = setTimeout(() => {
      if (i >= kroki.length - 1) { ustawGre(false); return; }
      pokaz(i + 1);
    }, czasKroku(kroki[i]));
  }
  function ustawGre(v) {
    gra = v;
    const b = $('graj'); b.textContent = v ? '❚❚' : '▶︎ Odtwarzaj'; b.classList.toggle('nk-on', v);
    if (v && i >= kroki.length - 1) pokaz(0); else zaplanuj();
  }

  // ---------- tablica ----------
  function rysujTablice(si) {
    const sc = scen.sceny[si], t = scen.tablica;
    const poAgregacji = scen.sceny.findIndex((s) => s.id === 'agregat');
    const final = ['final', 'followup'].includes(sc.id);
    let dol = '';
    if (final && t.werdykt) {
      dol = `<div class="werdykt"><b>Rekomendacja:</b> ${esc(t.werdykt)}</div>`;
    } else if (t.ranking.length && (poAgregacji === -1 || si >= poAgregacji)) {
      dol = `<div class="ranking">${t.ranking.slice(0, 3).map((r) => `<div class="wiersz"><span title="${esc(r.nazwa)}">${esc(r.nazwa)}</span><span class="belka"><i style="width:${Math.round(r.p * 100)}%"></i></span><span class="p">${r.p.toFixed(2).replace('.', ',')}</span></div>`).join('')}</div>`;
    } else {
      dol = `<div class="ranking"><div class="wiersz"><span>Ranking pojawi się po ślepej turze</span><span></span><span></span></div></div>`;
    }
    $('tablica').innerHTML = `<div class="gora"><span class="faza">Teraz · ${esc(sc.tytul)}</span><span class="czas">${hhmm(sc.czas)}</span></div><p class="temat">${esc(sc.temat)}</p>${dol}`;
  }

  // ---------- oś, protokół, legenda ----------
  function rysujOs() {
    $('os').innerHTML = scen.sceny.map((sc, si) => `<button class="odcinek" type="button" style="--n:${Math.max(1, sc.wypowiedzi.length)}" data-si="${si}" title="${esc(sc.tytul)}"><span class="tor"><i></i></span><span class="et">${esc(sc.tytul)}</span></button>`).join('');
    $('os').querySelectorAll('.odcinek').forEach((b) => b.addEventListener('click', () => { pokaz(kroki.findIndex((k) => k.si === +b.dataset.si), false); }));
  }
  function rysujListe() {
    let html = '', n = 0;
    scen.sceny.forEach((sc) => {
      html += `<div class="sekcja-faza">${esc(sc.tytul)}<span>${hhmm(sc.czas)}</span></div>`;
      sc.wypowiedzi.forEach((w) => {
        const r = ROLE[w.kto] || { nazwa: w.kto, grupa: 'lekarz', inicjaly: '?' };
        html += `<button class="wpis" type="button" data-n="${n++}" style="--g:${KOLOR[r.grupa]}"><span class="zn">${esc(r.inicjaly)}</span><span class="t"><b>${esc(r.nazwa)}</b>${esc(w.skrot)}</span></button>`;
      });
    });
    $('lista').innerHTML = html;
    $('lista').querySelectorAll('.wpis').forEach((b) => b.addEventListener('click', () => {
      ustawGre(false); pokaz(+b.dataset.n, true);
      const k = kroki[+b.dataset.n]; pokazSzczegol(scen.sceny[k.si].wypowiedzi[k.wi], scen.sceny[k.si]);
    }));
  }
  function rysujLegende() {
    const g = [['ordynator', 'Ordynator'], ['lekarz', 'Lekarze stali (6)'], ['zastepca', 'Zastępcy (triage)'], ['sprawdzajacy', 'Sprawdzający'], ['rezydent', 'Rezydenci za szybą']];
    $('legenda').innerHTML = g.map(([k, t]) => `<span style="--g:${KOLOR[k]}"><i></i>${t}</span>`).join('');
  }
  function pokazSzczegol(w, sc) {
    const r = ROLE[w.kto] || { nazwa: w.kto };
    const el = $('szczegol'); el.hidden = false;
    el.innerHTML = `<b>${esc(r.nazwa)} · ${esc(sc.tytul)}</b>\n${esc(w.pelny)}${w.info && !String(w.pelny).includes(w.info) ? `\n\n${esc(w.info)}` : ''}${w.plik ? `\n\n<span class="plik">${esc(w.plik)}</span>` : ''}`;
    el.scrollTop = 0;
  }
  function pokazOsobe(kto) {
    for (let n = i; n >= 0; n--) {
      const k = kroki[n], w = scen.sceny[k.si].wypowiedzi[k.wi];
      if (w.kto === kto) { pokazSzczegol(w, scen.sceny[k.si]); return; }
    }
    const r = ROLE[kto];
    const el = $('szczegol'); el.hidden = false;
    el.innerHTML = `<b>${esc(r?.nazwa || kto)}</b>\nJeszcze się nie odezwał w tej sprawie.`;
  }

  // ---------- wczytanie folderu sprawy ----------
  async function wczytajPliki(lista) {
    const pliki = {}; let nazwa = '';
    for (const { sciezka, plik } of lista) {
      const czesci = sciezka.split('/').filter(Boolean);
      if (czesci.length > 1 && !nazwa) nazwa = czesci[0];
      const wzgl = czesci.length > 1 ? czesci.slice(1).join('/') : czesci[0];
      if (!/\.(md|json|jsonl)$/i.test(wzgl)) continue;
      pliki[wzgl] = await plik.text();
    }
    const s = zbudujScenariusz(pliki, nazwa);
    if (!s.sceny.length) { $('opis-sprawy').textContent = 'W tym folderze nie ma plików sprawy (01-wywiad.md … 09-FINAL.md). Wybierz folder z katalogu sprawy/.'; return; }
    ustawGre(false); przygotuj(s); ustawGre(true);
  }
  $('wczytaj').addEventListener('click', () => { zatrzymajZywo(); $('folder').click(); });

  // ---------- na żywo: folder sprawy czytany co 3 s (File System Access API: Chrome, Edge, powłoka Windows) ----------
  let zywoTimer = null;
  function zatrzymajZywo() { clearInterval(zywoTimer); zywoTimer = null; $('zywo').classList.remove('nk-on'); $('zywo').textContent = 'Na żywo…'; }
  async function czytajUchwyt(uchwyt, sciezka, pliki) {
    for await (const [nazwa, el] of uchwyt.entries()) {
      if (el.kind === 'directory') await czytajUchwyt(el, sciezka + nazwa + '/', pliki);
      else if (/\.(md|json|jsonl)$/i.test(nazwa)) pliki[sciezka + nazwa] = await (await el.getFile()).text();
    }
    return pliki;
  }
  if (typeof window.showDirectoryPicker === 'function') {
    $('zywo').hidden = false;
    $('zywo').addEventListener('click', async () => {
      if (zywoTimer) { zatrzymajZywo(); return; }
      let uchwyt;
      try { uchwyt = await window.showDirectoryPicker({ mode: 'read' }); } catch { return; }
      const odswiez = async () => {
        try { aktualizuj(zbudujScenariusz(await czytajUchwyt(uchwyt, '', {}), uchwyt.name)); }
        catch (e) { zatrzymajZywo(); $('opis-sprawy').textContent = 'Nie da się już czytać folderu sprawy: ' + e.message; }
      };
      scen = null; kroki = []; i = 0;
      await odswiez();
      $('opis-sprawy').textContent = `Sprawa ${uchwyt.name} · na żywo`;
      $('zywo').classList.add('nk-on'); $('zywo').textContent = '● Na żywo';
      zywoTimer = setInterval(odswiez, 3000);
      ustawGre(true);
    });
  }
  // ---------- na żywo w powłoce Windows: najnowsza sprawa z sprawy/ w folderze Konsylium ----------
  // Konsylium (Claude Code na tym komputerze) pisze sprawy/<ID>/_log.jsonl skryptem dymek.py.
  // Pokój co 3 s czyta folder sprawy, a co 15 s sprawdza, czy nie zaczęła się nowsza sprawa.
  let zywoPowloka = null;
  async function najnowszaSprawa() {
    const l = (await window.MsMost.lista('sprawy')).filter((x) => x.katalog && /^\d{4}-\d{2}-\d{2}/.test(x.nazwa));
    if (!l.length) return null;
    const zLogiem = [];
    for (const x of l) {
      const log = (await window.MsMost.lista('sprawy/' + x.nazwa)).filter((p) => !p.katalog).reduce((m, p) => Math.max(m, p.zmiana), 0);
      zLogiem.push({ nazwa: x.nazwa, zmiana: Math.max(log, x.zmiana) });
    }
    // Najnowsza = najwyższy identyfikator (data + numer); czas zmiany tylko rozstrzyga remis.
    // (Czas plików nie jest wiarygodny: pobranie repo odświeża go we wszystkich starych sprawach.)
    zLogiem.sort((a, b) => b.nazwa.localeCompare(a.nazwa) || b.zmiana - a.zmiana);
    return zLogiem[0];
  }
  async function zywoZPowloki(tylkoSwieza) {
    const s = await najnowszaSprawa().catch(() => null);
    if (!s) { if (!tylkoSwieza) $('opis-sprawy').textContent = 'W folderze Konsylium nie ma jeszcze spraw (sprawy/…). Pokój poczeka na pierwszą.'; return false; }
    if (tylkoSwieza && Date.now() - s.zmiana > 3 * 3600 * 1000) return false;
    zatrzymajZywo();
    let nazwa = s.nazwa, licz = 0;
    const odswiez = async () => {
      try {
        if (++licz % 5 === 0) { const n = await najnowszaSprawa(); if (n && n.nazwa !== nazwa) { nazwa = n.nazwa; scen = null; kroki = []; i = 0; } }
        const pliki = {};
        for (const p of await window.MsMost.czytajFolder('sprawy/' + nazwa)) pliki[p.sciezka] = p.tekst;
        aktualizuj(zbudujScenariusz(pliki, nazwa));
        $('opis-sprawy').textContent = `Sprawa ${nazwa} · na żywo z folderu Konsylium`;
      } catch (e) { $('opis-sprawy').textContent = 'Nie da się czytać folderu sprawy: ' + e.message; }
    };
    scen = null; kroki = []; i = 0;
    await odswiez();
    zywoPowloka = setInterval(odswiez, 3000);
    zywoTimer = zywoPowloka;
    $('zywo').classList.add('nk-on'); $('zywo').textContent = '● Na żywo';
    ustawGre(true);
    return true;
  }
  if (window.MsMost) window.MsMost.dostepny().then(async (jest) => {
    if (!jest) return;
    document.documentElement.classList.add('osadzony');
    // protokół na żądanie (scena na całą stronę)
    const pb = $('protokol-btn'), uk = document.querySelector('.uklad');
    pb.hidden = false;
    pb.addEventListener('click', () => { const on = uk.classList.toggle('z-protokolem'); pb.setAttribute('aria-pressed', String(on)); pb.classList.toggle('nk-on', on); });
    // w powłoce przycisk „Na żywo” zawsze bierze sprawę z folderu Konsylium (bez okna wyboru)
    const nowy = $('zywo').cloneNode(true); $('zywo').replaceWith(nowy);
    nowy.hidden = false; nowy.title = 'Pokazuje najnowszą sprawę z folderu Konsylium i dociąga nowe dymki co 3 sekundy.';
    nowy.addEventListener('click', () => { if (zywoTimer) zatrzymajZywo(); else zywoZPowloki(false); });
    if (await window.MsMost.folder().catch(() => null)) zywoZPowloki(false);
    else $('opis-sprawy').textContent = 'Wybierz folder Konsylium (ikona folderu po lewej), a Pokój pokaże najnowszą sprawę.';
    window.MsMost.naDane((od, d) => { if (d && d.zywo) zywoZPowloki(false); });
  });
  window.addEventListener('message', (e) => { if (e.data && e.data.typ === 'ms-motyw') ustawMotyw(e.data.motyw); });
  $('folder').addEventListener('change', (e) => {
    const l = [...e.target.files].map((f) => ({ sciezka: f.webkitRelativePath || f.name, plik: f }));
    if (l.length) wczytajPliki(l);
    e.target.value = '';
  });
  async function zbierz(entry, sciezka, out) {
    if (entry.isFile) { out.push({ sciezka: sciezka + entry.name, plik: await new Promise((ok, zle) => entry.file(ok, zle)) }); return; }
    const czytnik = entry.createReader();
    let partia;
    do { partia = await new Promise((ok, zle) => czytnik.readEntries(ok, zle)); for (const e of partia) await zbierz(e, sciezka + entry.name + '/', out); } while (partia.length);
  }
  document.addEventListener('dragover', (e) => e.preventDefault());
  document.addEventListener('drop', async (e) => {
    e.preventDefault();
    const out = [];
    for (const it of [...(e.dataTransfer?.items || [])]) { const en = it.webkitGetAsEntry && it.webkitGetAsEntry(); if (en) await zbierz(en, '', out); }
    if (out.length) wczytajPliki(out);
  });

  // ---------- sterowanie ----------
  $('graj').addEventListener('click', () => ustawGre(!gra));
  $('wstecz').addEventListener('click', () => { pokaz(i - 1, true); });
  $('dalej').addEventListener('click', () => { pokaz(i + 1); });
  $('tempo').addEventListener('change', (e) => { tempo = +e.target.value; zaplanuj(); });
  document.addEventListener('keydown', (e) => {
    if (e.target.closest && e.target.closest('select, input, textarea, button, [role="button"]')) return;
    if (e.key === ' ') { e.preventDefault(); ustawGre(!gra); }
    if (e.key === 'ArrowRight') pokaz(i + 1);
    if (e.key === 'ArrowLeft') pokaz(i - 1, true);
  });
  window.addEventListener('resize', () => { const d = document.querySelector('.dymek:not(.stary)'); if (d && kroki.length) ustawDymek(d, scen.sceny[kroki[i].si].wypowiedzi[kroki[i].wi].kto); });

  // motyw: domyślnie ciemny (jak woli Michał); zapamiętany lokalnie, jeśli się da
  function ustawMotyw(m) {
    const root = document.documentElement;
    root.setAttribute('data-motyw', m === 'jasny' ? 'jasny' : 'ciemny');
    root.setAttribute('data-theme', m === 'jasny' ? 'light' : 'dark');
    $('motyw').textContent = m === 'jasny' ? 'Tryb ciemny' : 'Tryb jasny';
    try { localStorage.setItem('pokoj-motyw', m); } catch { /* brak pamięci przeglądarki */ }
  }
  let motyw = null;
  try { motyw = localStorage.getItem('pokoj-motyw'); } catch { /* jw. */ }
  if (motyw && window.parent === window) ustawMotyw(motyw); // w aplikacji (iframe) motyw przychodzi z powłoki
  else $('motyw').textContent = matchMedia('(prefers-color-scheme: light)').matches ? 'Tryb ciemny' : 'Tryb jasny';
  $('motyw').addEventListener('click', () => {
    const teraz = document.documentElement.getAttribute('data-motyw') || (matchMedia('(prefers-color-scheme: light)').matches ? 'jasny' : 'ciemny');
    ustawMotyw(teraz === 'jasny' ? 'ciemny' : 'jasny');
  });

  // start: osadzona sprawa demonstracyjna — tylko poza aplikacją MS Konsylium (w aplikacji Pokój czyta folder Konsylium)
  function startDemo() {
    if (typeof DEMO !== 'undefined' && DEMO) {
      przygotuj(DEMO);
      if (!matchMedia('(prefers-reduced-motion: reduce)').matches) setTimeout(() => ustawGre(true), 1500);
      else ustawGre(false);
    }
  }
  gra = false; $('graj').textContent = '▶︎ Odtwarzaj'; $('graj').classList.remove('nk-on');
  if (window.MsMost) window.MsMost.dostepny().then((jest) => { if (!jest) startDemo(); }); else startDemo();
})();
