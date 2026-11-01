// Pokój psychologiczny — rysuje pokój (SVG), sadza zespół terapeutów i odtwarza scenariusz w dymkach.
// Wątek Graficzny 1.11.2026: zmienione tylko MIEJSCA i rysujPokoj() (scena); logika bez zmian.
// Wymaga: zbudujScenariusz, ROLE (z scenariusz.mjs, wklejone przez build) i DEMO (scenariusz osadzony przy budowie).
(function () {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const esc = (t) => String(t ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const W = 1200, H = 700;
  const KOLOR = { ordynator: 'var(--g-ordynator)', lekarz: 'var(--g-lekarz)', zastepca: 'var(--g-zastepca)', sprawdzajacy: 'var(--g-sprawdzajacy)', rezydent: 'var(--g-rezydent)', prowadzacy: 'var(--g-prowadzacy)' };
  // postacie białej rasy, kobiety i mężczyźni (Michał 1.11): jasne odcienie skóry; fryzury 1, 3, 5 kobiece, 0, 2, 4 męskie
  const SKORA = ['#f3d9c4', '#ecc9ad', '#f6e1cf', '#e9c4a6', '#f1d2b9', '#e6bf9f'];
  const WLOSY = ['#2b211c', '#5a3b26', '#9b9590', '#1d1d22', '#7a4b2a', '#c9a46a'];
  const KOBIETA = (f) => f % 2 === 1;

  // miejsca: x, y stóp, skala, warstwa (0 = za stołem, 1 = przed stołem), fryzura, okulary
  const MIEJSCA = {
    ordynator:            { x: 600, y: 440, s: 1.04, w: 0, f: 2, o: true },
    hipotezujacy:         { x: 440, y: 452, s: .95, w: 0, f: 1 },
    bayes:                { x: 760, y: 452, s: .95, w: 0, f: 0, o: true },
    najgorszy_scenariusz: { x: 262, y: 566, s: 1.02, w: 1, f: 3 },
    poz_pragmatyk:        { x: 938, y: 566, s: 1.02, w: 1, f: 4 },
    farmakolog:           { x: 430, y: 668, s: 1.05, w: 1, f: 5 },
    gospodarz_kosztow:    { x: 770, y: 668, s: 1.05, w: 1, f: 2 },
    psychiatra:           { x: 318, y: 470, s: .95, w: 0, f: 1, o: true }, // 8. fotel: Psychiatra konsultant (jeśli rola istnieje w ROLE)
    z_zlozonosc:          { x: 214, y: 392, s: .78, w: 0, f: 3 },
    z_bezpieczenstwo:     { x: 274, y: 388, s: .78, w: 0, f: 0 },
    z_niepewnosc:         { x: 334, y: 392, s: .78, w: 0, f: 1, o: true },
    s_fakty:              { x: 1040, y: 444, s: .74, w: 0, f: 4, o: true },
    s_proces:             { x: 1100, y: 444, s: .74, w: 0, f: 5 },
    klient_sedzia:        { x: 1160, y: 444, s: .74, w: 0, f: 3 }, // klient-sędzia czyta tekst oczami klienta
    // lekarz prowadzący (użytkownik aplikacji) — stoi z prawej przed stołem, pisze z paska pod sceną
    lekarz_prowadzacy:    { x: 1040, y: 672, s: 1.05, w: 1, f: 0 },
  };
  const MIEJSCA_REZ = { 1: [[100]], 2: [[72], [130]], 3: [[58], [100], [142]] };

  let scen = null, kroki = [], i = 0, gra = false, timer = null, tempo = 1, szczegolKto = null;

  // ---------- rysunek pokoju ----------
  function figura(id, m, rola) {
    // rysunek postaci: src/postacie.js (wątek Graficzny 1.11 – kobiety i mężczyźni, większe twarze, ruch ust, ordynator z fajką)
    const g = rola.grupa, kol = KOLOR[g], s = m.s;
    return `
<g class="postac" data-kto="${id}" tabindex="0" role="button" aria-label="${esc(rola.nazwa)}" transform="translate(${m.x},${m.y}) scale(${s})" style="--g:${kol}">
  <ellipse cx="0" cy="0" rx="${g === 'ordynator' ? 40 : 30}" ry="7" fill="var(--cien-postaci)"/>
  <ellipse class="halo" cx="0" cy="0" rx="${g === 'ordynator' ? 46 : 38}" ry="10" fill="none" stroke="var(--petrol)" stroke-width="3"/>
  <g class="ciało">${postacSVG(id, g, kol)}</g>
  <g class="znak-gotowe" aria-hidden="true" transform="translate(24,-138)"><circle r="9" fill="#3fbf8a"/><path d="M-4.5,0 l3,3 l6,-6" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></g>
</g>`;
  }

  function podpisy(widoczne) {
    return widoczne.map(([id, m]) => {
      const r = ROLE[id]; if (!r) return '';
      const KROTKO = { z_zlozonosc: 'złożoność', z_niepewnosc: 'niepewność', s_fakty: 'źródła', s_proces: 'etyka', klient_sedzia: 'klient', z_bezpieczenstwo: 'ryzyko' };
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

    const zaStolem = wpisy.filter(([, m]) => m.w === 0).map(([id, m]) => figura(id, m, ROLE[id])).join('');
    const przedStolem = wpisy.filter(([, m]) => m.w === 1).map(([id, m]) => figura(id, m, ROLE[id])).join('');
    const rezydenci = wpisy.filter(([, m]) => m.w === -1).map(([id, m]) => figura(id, m, ROLE[id])).join('');

    $('rys').innerHTML = `
<!-- pokój psychologiczny (makieta grafika/psycholog/makieta-psycholog-1.png): ciepłe światło, fotele, lampa, regał, okno z ogrodem; zero elementów szpitalnych -->
<defs><linearGradient id="sc-sciana" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--sciana)"/><stop offset="1" stop-color="var(--sciana-2)"/></linearGradient>
<linearGradient id="sc-szklo" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity=".75"/><stop offset="1" stop-color="#e3dced" stop-opacity=".5"/></linearGradient>
<linearGradient id="sc-led" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffd9a0" stop-opacity="0"/><stop offset=".5" stop-color="#ffd9a0"/><stop offset="1" stop-color="#ffd9a0" stop-opacity="0"/></linearGradient>
<linearGradient id="sc-ogrod" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--okno-niebo)"/><stop offset=".55" stop-color="#e9f1e4"/><stop offset=".56" stop-color="#a9c48f"/><stop offset="1" stop-color="#7fa36a"/></linearGradient>
<linearGradient id="sc-miasto" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--okno-niebo)"/><stop offset="1" stop-color="var(--sciana)"/></linearGradient>
<linearGradient id="sc-podloga" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--podloga)"/><stop offset="1" stop-color="var(--stol)"/></linearGradient>
<radialGradient id="sc-lampa" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffe9b8" stop-opacity=".75"/><stop offset="1" stop-color="#ffe9b8" stop-opacity="0"/></radialGradient>
<filter id="sc-glow"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
<rect x="0" y="0" width="${W}" height="338" fill="url(#sc-sciana)"/>
<polygon points="0,338 1200,338 1200,700 0,700" fill="url(#sc-podloga)"/>
${podloga}
<ellipse cx="600" cy="572" rx="370" ry="108" fill="#e8dcd0" opacity=".75"/><ellipse cx="600" cy="572" rx="370" ry="108" fill="none" stroke="#cdb9a3" stroke-width="3" opacity=".8"/>
<rect x="0" y="330" width="${W}" height="8" fill="var(--listwa)" opacity=".8"/>
<!-- ciepły pasek LED pod sufitem: świeci = wszystko działa, pulsuje gdy AI pracuje -->
<rect x="0" y="0" width="${W}" height="10" fill="var(--sciana)"/>
<rect class="led" x="60" y="9" width="1080" height="4" rx="2" fill="url(#sc-led)" filter="url(#sc-glow)"/>

<!-- okno z ogrodem = inteligentne szkło: po kliknięciu „Prognozy” (zgodność kierunku pracy w %) pokazuje #prognoza -->
<g id="ekran-sciana" role="button" aria-label="Ekran prognoz – zgodność kierunku pracy">
<rect x="870" y="30" width="312" height="210" rx="8" fill="var(--listwa)"/>
<rect x="880" y="40" width="292" height="190" rx="4" fill="url(#sc-ogrod)"/>
<g fill="#6f9a5a"><ellipse cx="926" cy="150" rx="30" ry="42"/><ellipse cx="1120" cy="142" rx="36" ry="48"/><ellipse cx="1030" cy="164" rx="22" ry="30"/></g>
<rect x="918" y="186" width="16" height="36" fill="#8a6a4a"/><rect x="1112" y="184" width="16" height="40" fill="#8a6a4a"/>
<rect x="1023" y="40" width="6" height="190" fill="var(--listwa)"/><rect x="880" y="132" width="292" height="6" fill="var(--listwa)"/>
<rect x="880" y="40" width="292" height="190" fill="url(#sc-szklo)" opacity=".18"/>
<rect x="872" y="36" width="26" height="200" fill="#cdb9e6" opacity=".7"/><rect x="1154" y="36" width="26" height="200" fill="#cdb9e6" opacity=".7"/>
</g>
<!-- kącik herbaciany (zamiast ekspresu i drukarki): czajnik z parą, filiżanki, chusteczki, roślina -->
<g class="komoda">
<rect x="884" y="266" width="290" height="70" rx="6" fill="var(--stol-blat)"/><rect x="884" y="266" width="290" height="6" rx="2" fill="#ffffff" opacity=".45"/>
${[0, 1, 2, 3].map((k) => `<rect x="${892 + k * 72}" y="278" width="64" height="52" rx="4" fill="var(--stol)" stroke="var(--stol-krawedz)" stroke-opacity=".4"/><circle cx="${924 + k * 72}" cy="304" r="3" fill="#ffffff" opacity=".6"/>`).join('')}
<g transform="translate(910,266)"><path d="M4,-4 L4,-30 Q4,-40 20,-40 Q36,-40 36,-30 L36,-4 Z" fill="#e9e2ea" stroke="#b7a9d3" stroke-width="1.5"/><rect x="2" y="-4" width="36" height="4" rx="2" fill="#8a7fb5"/><path d="M36,-30 q12,2 10,14" fill="none" stroke="#b7a9d3" stroke-width="2.5"/><rect x="14" y="-46" width="12" height="6" rx="2" fill="#8a7fb5"/><path class="para" d="M16,-50 q-3,-7 1,-12 M24,-50 q3,-7 -1,-12" fill="none" stroke="#c9c2d6" stroke-width="1.6" stroke-linecap="round"/></g>
${[966, 984, 1002].map((x) => `<g transform="translate(${x},266)"><rect x="-6" y="-11" width="12" height="11" rx="3" fill="#fbfdfc" stroke="#c9c2d6"/><path d="M6,-8 q5,0 5,3.5 q0,3.5 -5,3.5" fill="none" stroke="#c9c2d6" stroke-width="1.8"/></g>`).join('')}
<g transform="translate(1030,266)"><rect x="0" y="-16" width="40" height="16" rx="3" fill="#ffffff" stroke="#d9cbb8"/><path d="M14,-16 q6,-9 12,0" fill="none" stroke="#cdb9e6" stroke-width="2.5"/></g>
<g transform="translate(1084,266)">${[0, 1, 2, 3, 4].map((k) => `<rect x="${k * 12}" y="${-30 + (k % 2) * 4}" width="10" height="${30 - (k % 2) * 4}" rx="1.5" fill="${['#b7a0d9', '#9fbf9a', '#e6c384', '#d99a8c', '#8fb6c9'][k]}"/>`).join('')}</g>
<g transform="translate(1160,266)"><rect x="-10" y="-22" width="20" height="22" rx="4" fill="#e8dcc8" stroke="#cdb9a3"/><g fill="#8fb37a"><ellipse cx="-6" cy="-36" rx="5" ry="16" transform="rotate(-25 -6 -36)"/><ellipse cx="6" cy="-38" rx="5" ry="17" transform="rotate(22 6 -38)"/><ellipse cx="0" cy="-42" rx="4.5" ry="19"/></g></g>
</g>

<!-- obraz na ścianie (zamiast plakatu lekarskiego): spokojny pastelowy pejzaż; id #plakat zachowane dla logiki -->
<g id="plakat" transform="translate(212,70)" role="button" aria-label="Obraz: pastelowy pejzaż">
  <rect x="-7" y="-7" width="92" height="118" rx="4" fill="var(--listwa)"/>
  <rect x="-2" y="-2" width="82" height="108" fill="#efe9dd"/>
  <rect x="4" y="4" width="70" height="96" fill="#cfe6ef"/><ellipse cx="39" cy="70" rx="48" ry="26" fill="#a9c48f"/><ellipse cx="39" cy="84" rx="48" ry="22" fill="#7fa36a"/><circle cx="56" cy="26" r="9" fill="#ffe9b8"/><ellipse cx="22" cy="54" rx="9" ry="14" fill="#6f9a5a"/><rect x="20" y="62" width="4" height="12" fill="#8a6a4a"/>
</g>

<!-- lampa podłogowa z ciepłym światłem -->
<g class="lampa" transform="translate(150,336)"><circle cx="0" cy="-150" r="120" fill="url(#sc-lampa)"/><rect x="-3" y="-206" width="6" height="206" fill="#8a6a4a"/><ellipse cx="0" cy="0" rx="18" ry="5" fill="#8a6a4a"/><path d="M-36,-206 L36,-206 L26,-246 L-26,-246 Z" fill="#f3e3c3" stroke="#d9c4a0"/></g>

<!-- ściana wideo w miękkiej ramie (zamiast tablicy): treść w HTML #tablica -->
<rect x="306" y="20" width="570" height="270" rx="18" fill="var(--listwa)"/>
<rect x="316" y="26" width="550" height="256" rx="12" fill="#2b2540"/>
<rect x="324" y="34" width="534" height="240" rx="6" fill="#1e1a2e"/>
<rect x="324" y="34" width="534" height="240" rx="6" fill="none" stroke="#cdb9e6" stroke-opacity=".35"/>

<!-- zegar: czas bieżącej fazy -->
<g transform="translate(206,236)"><circle r="22" fill="var(--tablica)" stroke="var(--tablica-rama)" stroke-width="4"/>
${Array.from({ length: 12 }, (_, k) => `<rect x="-1" y="-20" width="2" height="${k % 3 ? 3 : 5}" fill="var(--tablica-mut)" transform="rotate(${k * 30})"/>`).join('')}
<line id="wsk-h" x1="0" y1="0" x2="0" y2="-10" stroke="var(--tablica-txt)" stroke-width="3" stroke-linecap="round"/>
<line id="wsk-m" x1="0" y1="0" x2="0" y2="-16" stroke="var(--tablica-txt)" stroke-width="2" stroke-linecap="round"/>
<circle r="2.6" fill="#A83A38"/></g>

<!-- drzwi: stażysta za szybą (jak rezydent w Konsylium) -->
<rect x="22" y="78" width="164" height="260" rx="4" fill="var(--listwa)" opacity=".9"/>
<rect x="30" y="86" width="148" height="244" fill="var(--sciana-2)"/>
<rect x="30" y="300" width="148" height="30" fill="var(--podloga)"/>
${rezydenci}
<rect x="30" y="86" width="70" height="244" fill="url(#sc-szklo)" opacity=".7" stroke="var(--szyba-obrys)" stroke-width="1.5"/>
<rect x="108" y="86" width="70" height="244" fill="url(#sc-szklo)" opacity=".7" stroke="var(--szyba-obrys)" stroke-width="1.5"/>
<rect x="100" y="86" width="8" height="244" fill="#cdb9e6" opacity=".6"/>
<rect x="54" y="52" width="100" height="20" rx="5" fill="var(--g-rezydent)"/>
<text x="104" y="66" text-anchor="middle" font-family="var(--font)" font-size="10.5" font-weight="800" letter-spacing=".8" fill="#fff">STAŻYSTA</text>


<!-- biurko sprawdzających / konsultantów (prawa strona) -->
${zaStolem}
<rect x="1002" y="420" width="186" height="12" rx="4" fill="var(--stol-blat)"/>
<rect x="1010" y="432" width="6" height="42" fill="var(--stol)"/><rect x="1174" y="432" width="6" height="42" fill="var(--stol)"/>
<rect x="1030" y="384" width="54" height="36" rx="4" fill="#2b2540" stroke="var(--szyba-obrys)" stroke-width="1.5"/><rect x="1052" y="418" width="10" height="4" fill="#2b2540"/>
<rect x="1110" y="384" width="54" height="36" rx="4" fill="#2b2540" stroke="var(--szyba-obrys)" stroke-width="1.5"/><rect x="1132" y="418" width="10" height="4" fill="#2b2540"/>

<!-- niski stolik w kręgu foteli: chusteczki, woda, notatniki -->
<ellipse cx="600" cy="620" rx="150" ry="34" fill="var(--cien-postaci)" opacity=".35"/>
<path d="M470,572 A130,38 0 0 0 730,572 L730,596 A130,38 0 0 1 470,596 Z" fill="var(--stol-krawedz)"/>
<ellipse cx="600" cy="572" rx="130" ry="38" fill="var(--stol-blat)" stroke="#ffffff" stroke-opacity=".5" stroke-width="2"/>
<ellipse cx="600" cy="572" rx="100" ry="26" fill="none" stroke="#ffffff" stroke-opacity=".35"/>
<g opacity=".95">
  <g transform="translate(548,566)"><rect x="-16" y="-12" width="32" height="14" rx="3" fill="#ffffff" stroke="#d9cbb8"/><path d="M-4,-12 q4,-9 8,0" fill="none" stroke="#cdb9e6" stroke-width="2.4"/></g>
  <g transform="translate(606,560)"><rect x="-6" y="-24" width="12" height="26" rx="3" fill="#cfe6ef" stroke="#9fc4d6"/><rect x="-5" y="-28" width="10" height="5" rx="1" fill="#6f9ab0"/></g>
  ${[[520, 592, -8], [680, 590, 6], [640, 572, -3]].map(([x, y, r]) => `<g transform="translate(${x},${y}) rotate(${r})"><rect x="-16" y="-10" width="32" height="20" rx="1.5" fill="#fbfdfc" stroke="#d9cbb8"/><rect x="-12" y="-5" width="20" height="1.4" fill="#a894c9"/><rect x="-12" y="-1" width="24" height="1.4" fill="#a894c9"/><rect x="-12" y="3" width="14" height="1.4" fill="#a894c9"/></g>`).join('')}
  <!-- notatniki terapeutów (klasa .laptop zachowana: animacja pisania w etapie „piszą”) -->
  ${[[442, 520, -8], [758, 520, 7], [300, 556, -10], [900, 556, 10], [500, 612, 4], [700, 612, -5]].map(([x, y, r]) => `<g class="laptop" transform="translate(${x},${y}) rotate(${r})"><rect x="-18" y="-13" width="36" height="24" rx="2.5" fill="#f6f2ea" stroke="#cdb9a3"/><rect class="ekran" x="-15" y="-10" width="30" height="18" rx="1.5" fill="#ffffff" opacity=".9"/><g class="kursor"><rect x="-11" y="-6" width="14" height="1.5" fill="#8a7fb5" opacity=".8"/><rect x="-11" y="-2" width="20" height="1.5" fill="#8a7fb5" opacity=".6"/><rect x="-11" y="2" width="9" height="1.5" fill="#8a7fb5" opacity=".7"/></g><rect x="-18" y="-13" width="4" height="24" fill="#8a7fb5" opacity=".5"/></g>`).join('')}
</g>
<!-- fotele (klasa .krzesla zachowana) -->
<g class="krzesla">${[[600, 440, '#cdb9e6'], [440, 452, '#b8d1b0'], [760, 452, '#f0cfa6'], [318, 470, '#cdb9e6'], [262, 566, '#b8d1b0'], [938, 566, '#f0cfa6'], [430, 668, '#cdb9e6'], [770, 668, '#b8d1b0']].map(([x, y, k]) => `<g transform="translate(${x},${y})"><rect x="-34" y="-78" width="68" height="60" rx="16" fill="${k}"/><rect x="-40" y="-42" width="80" height="34" rx="12" fill="${k}"/><rect x="-44" y="-48" width="14" height="40" rx="7" fill="${k}" opacity=".85"/><rect x="30" y="-48" width="14" height="40" rx="7" fill="${k}" opacity=".85"/><rect x="-36" y="-10" width="72" height="6" rx="3" fill="rgba(0,0,0,.12)"/></g>`).join('')}</g>
${przedStolem}
<!-- przerwa (AI pracuje): parujące kubki herbaty i tabliczka „Narada” – widoczne tylko w .pokoj.przerwa -->
<g class="kubki" aria-hidden="true">${[[520, 556], [600, 548], [680, 556], [560, 590], [640, 590]].map(([x, y]) => `<g transform="translate(${x},${y})"><rect x="-8" y="-16" width="16" height="16" rx="3" fill="#fbfdfc" stroke="#c9c2d6"/><path d="M8,-12 q7,0 7,5 q0,5 -7,5" fill="none" stroke="#c9c2d6" stroke-width="2.2"/><rect x="-6" y="-14" width="12" height="3" rx="1" fill="#b98a3a" opacity=".6"/><path class="para" d="M-3,-20 q-4,-7 1,-13 q4,-6 0,-12 M3,-20 q4,-7 -1,-13 q-4,-6 0,-12" fill="none" stroke="#c9c2d6" stroke-width="1.8" stroke-linecap="round"/></g>`).join('')}</g>
<g class="narada-znak" transform="translate(10,14)" aria-hidden="true"><rect width="196" height="30" rx="15" fill="#5B4A8A"/><circle class="narada-kropka" cx="16" cy="15" r="5" fill="#e3d6ff"/><text id="narada-czas" x="27" y="19.5" font-family="var(--font)" font-size="10.5" font-weight="800" fill="#fff">NARADA · AI pracuje</text></g>
<g id="dym" aria-hidden="true"></g>

<!-- biurko terapeuty prowadzącego z notatnikiem -->
<g class="biurko-prowadzacego"><rect x="948" y="618" width="76" height="10" rx="3" fill="var(--stol-blat)"/><rect x="954" y="628" width="6" height="48" fill="var(--stol)"/><rect x="1012" y="628" width="6" height="48" fill="var(--stol)"/>
  <g class="laptop" transform="translate(986,618) rotate(-6)"><rect x="-18" y="-13" width="36" height="24" rx="2.5" fill="#f6f2ea" stroke="#cdb9a3"/><rect class="ekran" x="-15" y="-10" width="30" height="18" rx="1.5" fill="#ffffff" opacity=".9"/><g class="kursor"><rect x="-11" y="-6" width="14" height="1.5" fill="#8a7fb5" opacity=".8"/><rect x="-11" y="-2" width="20" height="1.5" fill="#8a7fb5" opacity=".6"/></g></g></g>
<!-- rośliny -->
<g transform="translate(1150,676)"><path d="M-22,0 L-18,-34 L18,-34 L22,0 Z" fill="var(--listwa)"/>
<g fill="#6f9a5a"><ellipse cx="-14" cy="-58" rx="10" ry="24" transform="rotate(-24 -14 -58)"/><ellipse cx="12" cy="-62" rx="10" ry="26" transform="rotate(20 12 -62)"/><ellipse cx="0" cy="-70" rx="9" ry="28"/></g></g>
<g transform="translate(60,672)"><rect x="-16" y="-32" width="32" height="32" rx="6" fill="#e8dcc8" stroke="#cdb9a3"/><g fill="#8fb37a"><ellipse cx="-9" cy="-54" rx="7" ry="24" transform="rotate(-25 -9 -54)"/><ellipse cx="9" cy="-56" rx="7" ry="26" transform="rotate(22 9 -56)"/><ellipse cx="0" cy="-62" rx="6" ry="28"/></g></g>
${podpisy(wpisy)}`;
    MIEJSCA_AKT = miejsca;
    startDymu();
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
    const rek = w.pola.find((p) => /^(KIERUNEK PRACY|REKOMENDACJA)/i.test(p.etykieta));
    const reszta = w.pola.filter((p) => p !== rek);
    el.innerHTML = `<div class="gora"><h2 id="wnioski-t">Wnioski konsylium psychologicznego · ${esc(s.sprawa || '')}</h2><button class="nk-button" type="button" id="wnioski-zamknij">Wróć do pokoju</button></div>` +
      (rek ? `<div class="rek">${esc(rek.tresc)}</div>` : '') +
      (reszta.length ? `<dl>${reszta.map((p) => `<dt>${esc(p.etykieta)}</dt><dd>${esc(p.tresc)}</dd>`).join('')}</dl>` : `<div style="white-space:pre-wrap">${esc(w.tekst)}</div>`) +
      `<p class="stopka-w">Narzędzie testowe i edukacyjne marki MS. Nie służy do diagnozy ani terapii realnych osób. To nie jest terapia.</p>`;
    $('wnioski-zamknij').addEventListener('click', () => { el.hidden = true; });
    // na żywo: pierwsze pojawienie się 09-FINAL otwiera wnioski same
    // ...ale dopiero gdy odtwarzanie dojdzie do końca dyskusji (nie zasłania trwającej rozmowy)
    const klucz = (s.sprawa || '') + '|' + w.tekst.length;
    if (otworz && wnioskiPokazane !== klucz) wnioskiCzekaja = klucz;
  }
  $('wnioski-btn').addEventListener('click', () => { $('wnioski').hidden = !$('wnioski').hidden; });

  let wnioskiCzekaja = null;
  function otworzCzekajaceWnioski() {
    if (!wnioskiCzekaja || !scen || !scen.wnioski) return;
    wnioskiPokazane = wnioskiCzekaja; wnioskiCzekaja = null; $('wnioski').hidden = false;
  }
  function aktualizuj(s) {
    rysujWnioski(s, !!zywoTimer);
    const bylo = kroki.length, naKoncu = i >= bylo - 1;
    const rez = scen ? ileRezydentow() : 0;
    scen = s;
    s.tablica.liczbaRezydentow = ileRezydentow();
    kroki = [];
    s.sceny.forEach((sc, si) => sc.wypowiedzi.forEach((w, wi) => kroki.push({ si, wi })));
    if (kroki.length === bylo && bylo) { if (i >= kroki.length - 1 && !gra) { otworzCzekajaceWnioski(); if (s.wnioski) zakonczPrzerwe(); else planujPrzerwe(); } return; }
    if (s.tablica.liczbaRezydentow !== rez || !bylo) rysujPokoj();
    rysujListe();
    if (bylo && Date.now() < cichoDo) { document.querySelectorAll('.wpis').forEach((el, n2) => { el.classList.toggle('biezacy', n2 === i); el.classList.toggle('przyszly', n2 > i); }); return; }
    if (!bylo) { rysujLegende(); const d = wAplikacji() ? pierwszyDyskusji() : -1; pokaz(d > 0 ? d : 0, true); return; }
    // na żywo w aplikacji: gdy trwa jeszcze etap techniczny, a pojawiła się dyskusja — przeskocz do niej
    if (wAplikacji() && techniczny(kroki[i])) { const d = pierwszyDyskusji(i); if (d > i) { pokaz(d); return; } }
    const dalej = () => {
      pokaz(naKoncu ? Math.min(bylo, kroki.length - 1) : i, !naKoncu);
      if (zywoTimer && naKoncu && !gra) ustawGre(true); // na żywo: nowe wypowiedzi odtwarzają się same
    };
    if (przerwa || pisza) zakonczPrzerwe(dalej); else dalej(); // lekarze wracają z narady z gotową wypowiedzią
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
    rysujPokoj(); rysujListe(); rysujLegende();
    pokaz(0, true);
  }

  // W aplikacji liczy się dyskusja i wnioski (Michał 31.10): etapy techniczne (wywiad, triage, ślepa tura,
  // agregacja) przelatują szybko, a dyskusja idzie w tempie do czytania.
  const TECHNICZNE = new Set(['wywiad', 'triage', 'slepa', 'agregat']);
  const wAplikacji = () => document.documentElement.classList.contains('osadzony');
  const techniczny = (k) => k && scen && TECHNICZNE.has(scen.sceny[k.si].id);
  const pierwszyDyskusji = (od = 0) => { for (let j = Math.max(0, od); j < kroki.length; j++) if (!techniczny(kroki[j])) return j; return -1; };
  function czasKroku(k) {
    const w = scen.sceny[k.si].wypowiedzi[k.wi];
    if (wAplikacji() && techniczny(k)) return 650 / tempo;
    return (2400 + (w.tresc || w.skrot).length * 34 + (w.info ? 1200 : 0)) / tempo;
  }

  function pokaz(n, bezPisania) {
    if (!kroki.length) return;
    i = Math.max(0, Math.min(kroki.length - 1, n));
    if (przerwa || pisza) zakonczPrzerwe();
    clearTimeout(przerwaTimer); przerwaTimer = null;
    const k = kroki[i], sc = scen.sceny[k.si], w = sc.wypowiedzi[k.wi];
    const pokoj = $('pokoj');
    pokoj.classList.add('mowi');
    const poprz = i > 0 ? scen.sceny[kroki[i - 1].si].wypowiedzi[kroki[i - 1].wi].kto : null;
    document.querySelectorAll('.postac').forEach((el) => {
      el.classList.toggle('aktywna', el.dataset.kto === w.kto);
      el.classList.toggle('niedawno', el.dataset.kto === poprz && poprz !== w.kto);
    });
    rysujTablice(k.si);
    rysujPrognoze(k.si);
    ustawZegar(sc.czas);
    // dymek: najpierw „pisze…”, potem treść
    const dymki = $('dymki');
    dymki.querySelectorAll('.dymek').forEach((d) => { d.classList.add('stary'); setTimeout(() => d.remove(), 400); });
    const d = document.createElement('div');
    const r = ROLE[w.kto] || { nazwa: w.kto, grupa: 'lekarz' }; // grupa „lekarz” = zespół terapeutów
    d.className = 'dymek wejscie' + (w.tresc ? ' pelny' : '');
    d.style.setProperty('--g', r.grupa === 'rezydent' ? '#8a5f34' : r.grupa === 'zastepca' ? '#4b6e3c' : r.grupa === 'sprawdzajacy' ? '#5a5890' : r.grupa === 'prowadzacy' ? '#8a4a1f' : '#5B4A8A');
    const tresc = `<span class="kto">${esc(r.nazwa)}${w.persona ? ' · ' + esc(w.persona) : ''}</span>${esc(w.tresc || w.skrot)}${w.info ? `<span class="info">${esc(w.info)}</span>` : ''}`;
    const ruch = !bezPisania && !matchMedia('(prefers-reduced-motion: reduce)').matches;
    d.innerHTML = ruch ? '<span class="kropki" aria-label="mówi"><i></i><i></i><i></i></span>' : tresc;
    if (ruch) d.classList.add('pisze');
    d.addEventListener('click', () => pokazSzczegol(w, sc));
    dymki.appendChild(d);
    ustawDymek(d, w.kto);
    if (ruch) setTimeout(() => { if (!d.isConnected) return; d.classList.remove('pisze'); d.innerHTML = tresc; ustawDymek(d, w.kto); }, Math.min(700, 900 / tempo));
    $('napisy').innerHTML = `<span class="nap-temat"><b>Teraz · ${esc(sc.tytul)}</b>${esc(sc.temat)}</span><span><b>${esc(r.nazwa)}</b>${esc(w.tresc || w.skrot)}${w.info ? ` <i>(${esc(w.info)})</i>` : ''}</span>`;
    // protokół
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
    let top = Math.max(bh + marg, ay);
    // dymek nie może zasłaniać tablicy (318–864 × 28–280 w scenie): wtedy węższy dymek nad głową, ale obok tablicy
    const tL = 318 / W * Wp, tR = 864 / W * Wp, tB = 280 / H * Hp;
    d.classList.remove('boczny');
    if (left + bw / 2 > tL && left - bw / 2 < tR && top - bh < tB) {
      d.classList.add('boczny');
      const bw2 = d.offsetWidth, bh2 = d.offsetHeight, prawa = m.x >= 600;
      left = prawa ? Math.max(tR + marg + bw2 / 2, Math.min(Wp - bw2 / 2 - marg, ax)) : Math.min(tL - marg - bw2 / 2, Math.max(bw2 / 2 + marg, ax));
      top = Math.max(bh2 + marg, ay);
      d.style.left = left + 'px'; d.style.top = top + 'px';
      d.style.setProperty('--ogon', Math.max(14, Math.min(bw2 - 14, ax - (left - bw2 / 2))) + 'px');
      return;
    }
    d.style.left = left + 'px';
    d.style.top = top + 'px';
    d.style.setProperty('--ogon', Math.max(14, Math.min(bw - 14, ax - (left - bw / 2))) + 'px');
  }

  function zaplanuj() {
    clearTimeout(timer);
    if (!gra) return;
    timer = setTimeout(() => {
      if (i >= kroki.length - 1) {
        ustawGre(false);
        const koniec = scen && scen.wnioski && ['final', 'followup'].includes(scen.sceny[kroki[i].si].id);
        const czekaj = koniec ? cmokPlakat((scen.sprawa || '') + '|' + i) : 0;
        if (czekaj) setTimeout(otworzCzekajaceWnioski, czekaj - 600); else otworzCzekajaceWnioski();
        planujPrzerwe();
        return;
      }
      pokaz(i + 1);
    }, czasKroku(kroki[i]));
  }
  function ustawGre(v) {
    gra = v;
    const b = $('graj'); b.textContent = v ? '❚❚' : '▶︎ Odtwarzaj'; b.classList.toggle('nk-on', v);
    // na żywo nie zaczynamy od nowa: nowa wypowiedź na końcu ma się odtworzyć, nie cała sprawa
    if (v && i >= kroki.length - 1 && !zywoTimer) pokaz(0); else zaplanuj();
  }

  // ---------- przerwa: AI pracuje, lekarze wychodzą z pokoju i wracają z gotową wypowiedzią (Michał 1.11) ----------
  // Na żywo, gdy odtwarzanie dogoniło ostatnią wypowiedź, a werdyktu jeszcze nie ma: lekarze wychodzą przez drzwi
  // (konsylium czyta literaturę i pisze opinie), tablica pokazuje czas narady; nowa wypowiedź sprowadza ich z powrotem.
  let przerwa = false, przerwaOd = 0, przerwaTimer = null, przerwaZegar = null, aiPracuje = false, aiOd = 0;
  // Michał 1.11 04:05: „za często wychodzą” – najpierw lekarze PISZĄ opinie na laptopach przy stole (.pokoj.pisza);
  // dopiero gdy namysł AI trwa dłużej niż 1,5 min, wychodzą z pokoju (.pokoj.przerwa). Test ustawia próg przez window.__progWyjscia.
  let pisza = false, piszaOd = 0, piszaTimer = null;
  const PROG_WYJSCIA = () => Number(window.__progWyjscia) || 90000;
  const WYCHODZA = (id) => !/^R\d$/.test(id) && id !== 'lekarz_prowadzacy';
  const DRZWI = { x: 104, y: 336 };
  const mmss = (ms) => { const s = Math.max(0, Math.floor(ms / 1000)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
  const naKoncuBezWerdyktu = () => !!(zywoTimer && scen && kroki.length && i >= kroki.length - 1 && !gra && !scen.wnioski);
  function planujPrzerwe() {
    if (przerwa || !naKoncuBezWerdyktu()) { clearTimeout(przerwaTimer); przerwaTimer = null; return; }
    if (przerwaTimer) return; // odliczanie już trwa (odświeżenie co 3 s go nie cofa)
    // z sygnałem „AI pracuje” po 4 s, bez sygnału po 12 s ciszy
    przerwaTimer = setTimeout(() => { przerwaTimer = null; if (naKoncuBezWerdyktu() && !przerwa && !pisza) zacznijPisanie(); }, aiPracuje ? 4000 : 12000);
  }
  function zacznijPisanie() {
    pisza = true; piszaOd = aiPracuje && aiOd ? aiOd : Date.now();
    $('pokoj').classList.add('pisza');
    $('dymki').querySelectorAll('.dymek').forEach((d) => { d.classList.add('stary'); setTimeout(() => d.remove(), 400); });
    rysujPrzerwe(); clearInterval(przerwaZegar); przerwaZegar = setInterval(rysujPrzerwe, 1000);
    clearTimeout(piszaTimer);
    piszaTimer = setTimeout(() => { piszaTimer = null; if (pisza && naKoncuBezWerdyktu()) zacznijPrzerwe(); }, Math.max(0, PROG_WYJSCIA() - (Date.now() - piszaOd)));
  }
  function zacznijPrzerwe() {
    clearTimeout(piszaTimer); piszaTimer = null;
    przerwa = true; przerwaOd = pisza && piszaOd ? piszaOd : (aiPracuje && aiOd ? aiOd : Date.now());
    pisza = false; $('pokoj').classList.remove('pisza');
    $('pokoj').classList.add('przerwa');
    $('dymki').querySelectorAll('.dymek').forEach((d) => { d.classList.add('stary'); setTimeout(() => d.remove(), 400); });
    document.querySelectorAll('.postac').forEach((el, n) => {
      const id = el.dataset.kto, m = MIEJSCA_AKT[id]; if (!WYCHODZA(id) || !m) return;
      el.getAnimations().forEach((a) => a.cancel());
      if (bezRuchu()) { el.style.opacity = 0; return; }
      const start = `translate(${m.x}px, ${m.y}px) scale(${m.s})`;
      const cel = `translate(${DRZWI.x + (n % 3 - 1) * 22}px, ${DRZWI.y}px) scale(${m.s * .62})`;
      el.animate([{ transform: start, opacity: 1 }, { transform: cel, opacity: 1, offset: .82 }, { transform: cel, opacity: 0 }],
        { duration: 2600 + Math.random() * 900, delay: 150 + n * 140, easing: 'ease-in-out', fill: 'forwards' });
    });
    rysujPrzerwe(); clearInterval(przerwaZegar); przerwaZegar = setInterval(rysujPrzerwe, 1000);
  }
  function rysujPrzerwe() {
    if (pisza && !przerwa) {
      const t = mmss(Date.now() - piszaOd);
      $('tablica').innerHTML = `<div class="gora"><span class="faza">Konsylium pracuje</span><span class="czas">${t}</span></div><div class="narada"><b>Terapeuci piszą notatki · ${t}</b><span>Czytają literaturę i układają formulacje. Nowa wypowiedź pojawi się sama.</span></div><div class="ai-kropki" aria-hidden="true"><i></i><i></i><i></i></div>`;
      $('napisy').innerHTML = `<span class="nap-temat"><b>AI pracuje · ${t}</b>Terapeuci piszą notatki w fotelach.</span>`;
      rysujChipAi(); return;
    }
    if (!przerwa) return;
    const t = mmss(Date.now() - przerwaOd);
    $('tablica').innerHTML = `<div class="gora"><span class="faza">Konsylium pracuje</span><span class="czas">${t}</span></div><div class="narada"><b>Narada · ${t}</b><span>Terapeuci czytają literaturę i piszą formulacje. Wrócą z gotową wypowiedzią.</span></div><div class="ai-kropki" aria-hidden="true"><i></i><i></i><i></i></div>`;
    const zn = $('narada-czas'); if (zn) zn.textContent = 'NARADA · AI pracuje ' + t;
    $('napisy').innerHTML = `<span class="nap-temat"><b>AI pracuje · ${t}</b>Terapeuci są poza pokojem; nowa wypowiedź pojawi się sama.</span>`;
    rysujChipAi();
  }
  function zakonczPrzerwe(potem) {
    clearTimeout(przerwaTimer); przerwaTimer = null; clearInterval(przerwaZegar); przerwaZegar = null;
    clearTimeout(piszaTimer); piszaTimer = null;
    if (pisza) { pisza = false; $('pokoj').classList.remove('pisza'); }
    if (!przerwa) { if (potem) potem(); return; }
    przerwa = false; $('pokoj').classList.remove('przerwa');
    let najdluzej = 0;
    document.querySelectorAll('.postac').forEach((el, n) => {
      const id = el.dataset.kto, m = MIEJSCA_AKT[id]; if (!WYCHODZA(id) || !m) return;
      el.getAnimations().forEach((a) => a.cancel()); el.style.opacity = '';
      if (bezRuchu()) return;
      const start = `translate(${DRZWI.x + (n % 3 - 1) * 22}px, ${DRZWI.y}px) scale(${m.s * .62})`, cel = `translate(${m.x}px, ${m.y}px) scale(${m.s})`;
      const d = 2200 + Math.random() * 700, op = 100 + n * 110;
      el.animate([{ transform: start, opacity: 0 }, { transform: start, opacity: 1, offset: .15 }, { transform: cel, opacity: 1 }], { duration: d, delay: op, easing: 'ease-in-out', fill: 'none' });
      najdluzej = Math.max(najdluzej, d + op);
      setTimeout(() => { el.classList.add('gotowe'); setTimeout(() => el.classList.remove('gotowe'), 1800); }, d + op);
    });
    rysujChipAi();
    if (potem) setTimeout(potem, najdluzej);
  }
  // sygnał „AI pracuje” z powłoki (plik _ai-aktywnosc.json: hooki Claude Code albo skrypty dymek.py / wywiad_na_zywo.py)
  function ustawAi(aktywne, od) {
    const bylo = aiPracuje;
    aiPracuje = aktywne; if (aktywne && (!bylo || !aiOd)) aiOd = Number(od) || Date.now();
    if (!aktywne) aiOd = 0;
    if (aktywne && !bylo) { clearTimeout(przerwaTimer); przerwaTimer = null; planujPrzerwe(); }
    rysujChipAi();
  }
  function rysujChipAi() {
    const c = $('chip-ai'); if (!c) return;
    const on = aiPracuje || przerwa || pisza;
    c.hidden = !on;
    if (on) c.textContent = 'AI pracuje · ' + mmss(Date.now() - (przerwa ? przerwaOd : pisza ? piszaOd : (aiOd || Date.now())));
  }
  setInterval(() => { if (aiPracuje && !przerwa && !pisza) rysujChipAi(); }, 1000);

  // ---------- bajer: ordynator od czasu do czasu pali fajkę; dym rozchodzi się po pokoju i znika ----------
  let dymTimer = null;
  const bezRuchu = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  function klebDymu() {
    const g = $('dym'), m = MIEJSCA_AKT.ordynator; if (!g || !m || bezRuchu() || document.hidden) return;
    const zar = document.querySelector('.postac[data-kto="ordynator"] .zar');
    if (!zar) return; // pokój psychologiczny: prowadzący nie pali – dym wyłączony (para z herbaty idzie z CSS .para)
    if (zar) { zar.classList.add('zar-on'); setTimeout(() => zar.classList.remove('zar-on'), 1400); }
    // Michał 1.11 04:11: ruch „pykania” fajką tylko wtedy, gdy idzie dym
    const ord = document.querySelector('.postac[data-kto="ordynator"]');
    if (ord) { ord.classList.add('pyka'); setTimeout(() => ord.classList.remove('pyka'), 2600); }
    const x0 = m.x + 28.5 * m.s, y0 = m.y - 104 * m.s; // z cybucha fajki
    // jeden wydech = kilka kłębów, każdy większy i wolniejszy; całość ok. 12–16 s
    for (let k = 0; k < 7; k++) {
      setTimeout(() => {
        // bez createElementNS z adresem (strażnik budowania zabrania adresów w kodzie): kopia istniejącego kółka
        const c = document.querySelector('.postac[data-kto="ordynator"] .zar').cloneNode(false);
        c.removeAttribute('class'); c.setAttribute('class', 'dym-kleb'); c.removeAttribute('fill');
        c.setAttribute('cx', x0); c.setAttribute('cy', y0); c.setAttribute('r', 5 + k * 1.5);
        g.appendChild(c);
        const dx = 60 + k * 45 + Math.random() * 50, dy = -(90 + k * 28 + Math.random() * 40), sk = 6 + k * 2.2, czas = 9000 + k * 1100 + Math.random() * 1500;
        const a = c.animate([
          { transform: 'translate(0px, 0px) scale(1)', opacity: 0 },
          { transform: `translate(${dx * .18}px, ${dy * .2}px) scale(${sk * .3})`, opacity: .34, offset: .12 },
          { transform: `translate(${dx * .65}px, ${dy * .7}px) scale(${sk * .8})`, opacity: .14, offset: .6 },
          { transform: `translate(${dx}px, ${dy}px) scale(${sk})`, opacity: 0 }
        ], { duration: czas, easing: 'cubic-bezier(.2,.6,.4,1)', fill: 'forwards' });
        a.onfinish = () => c.remove();
      }, 1500 + k * 420);
    }
  }
  // plakat w powiększeniu: kliknięcie plakatu na ścianie, zamknięcie kliknięciem albo Esc
  document.addEventListener('click', (e) => {
    const stare = document.querySelector('.plakat-duzy');
    if (stare) { stare.remove(); return; }
    if (!e.target.closest || !e.target.closest('#plakat')) return;
    const d = document.createElement('div');
    d.className = 'plakat-duzy';
    d.innerHTML = `<svg viewBox="-6 -6 ${PLAKAT_W + 12} ${PLAKAT_H + 12}" role="img" aria-label="Plakat: rysunek pastelowy doktora z laską i serduszkiem"><rect x="-6" y="-6" width="${PLAKAT_W + 12}" height="${PLAKAT_H + 12}" rx="4" fill="#efe9dd"/><use href="#pl-rys"/></svg>`;
    document.body.appendChild(d);
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') document.querySelector('.plakat-duzy')?.remove(); });
  // koniec konsylium: ordynator podchodzi do plakatu i cmoka go w czoło (bajer, Michał 1.11)
  let cmokBylo = '';
  function cmokPlakat(klucz) {
    const el = document.querySelector('.postac[data-kto="ordynator"]'), m = MIEJSCA_AKT.ordynator, g = $('dym');
    if (!el || !m || bezRuchu() || cmokBylo === klucz) return 0;
    cmokBylo = klucz;
    const start = `translate(${m.x}px, ${m.y}px) scale(${m.s})`, cel = 'translate(304px, 300px) scale(.72) rotate(-5deg)';
    el.animate([{ transform: start }, { transform: cel, offset: .32 }, { transform: cel, offset: .72 }, { transform: start }],
      { duration: 4800, easing: 'ease-in-out', fill: 'none' });
    setTimeout(() => {
      for (let k = 0; k < 4; k++) {
        const h = document.querySelector('#pl-serce').cloneNode(false); h.removeAttribute('id');
        h.removeAttribute('transform'); h.setAttribute('class', 'serce');
        h.setAttribute('transform', `translate(${280 + k * 10},${170}) scale(.7)`);
        g.appendChild(h);
        h.animate([{ transform: `translate(${280 + k * 10}px, 170px) scale(.6)`, opacity: .95 }, { transform: `translate(${270 + k * 16}px, ${110 - k * 12}px) scale(1.1)`, opacity: 0 }],
          { duration: 1500 + k * 200, delay: k * 120, easing: 'ease-out', fill: 'forwards' }).onfinish = () => h.remove();
      }
    }, 1600);
    return 4800;
  }
  function startDymu() {
    clearTimeout(dymTimer);
    if (bezRuchu()) return;
    // co ok. 20 s (Michał 1.11): wydech, kłęby rozchodzą się i znikają, potem kolejny wdech
    const nastepny = () => { dymTimer = setTimeout(() => { klebDymu(); nastepny(); }, 18000 + Math.random() * 4000); };
    dymTimer = setTimeout(() => { klebDymu(); nastepny(); }, 4000 + Math.random() * 3000);
  }

  // ---------- lekarz prowadzący: użytkownik dopisuje do dyskusji (plik sprawy/<ID>/uwagi-lekarza.jsonl) ----------
  // Konsylium (Claude na tym komputerze) czyta ten plik przed każdą wypowiedzią: skrypty/uwagi_lekarza.py (docs/NA-ZYWO.md).
  let sprawaZywa = null, odswiezZywo = null, cichoDo = 0; // cichoDo: do kiedy scena pokazuje dymek lekarza (odświeżenie go nie zdejmuje)
  function dymekTymczasowy(kto, tekst, nazwa) {
    const dymki = $('dymki');
    dymki.querySelectorAll('.dymek').forEach((d) => { d.classList.add('stary'); setTimeout(() => d.remove(), 400); });
    const d = document.createElement('div');
    d.className = 'dymek wejscie pelny'; d.style.setProperty('--g', '#8a4a1f');
    d.innerHTML = `<span class="kto">${esc(nazwa)}</span>${esc(tekst)}`;
    dymki.appendChild(d); ustawDymek(d, kto);
    document.querySelectorAll('.postac').forEach((el) => el.classList.toggle('aktywna', el.dataset.kto === kto));
  }
  async function powiedzLekarz(tekst) {
    tekst = String(tekst || '').replace(/\s+/g, ' ').trim();
    if (!tekst || !sprawaZywa || !window.MsMost) return false;
    const sc = scen && kroki.length ? scen.sceny[kroki[kroki.length - 1].si] : null;
    const faza = sc && !TECHNICZNE.has(sc.id) ? sc.tytul : 'Konsylium · runda 1';
    const skrot = tekst.length > 400 ? tekst.slice(0, 399).replace(/\s+\S*$/, '') + '…' : tekst;
    const wpis = { ts: new Date().toISOString().replace(/\.\d{3}Z$/, '+00:00'), zdarzenie: 'wypowiedz', rola: 'lekarz_prowadzacy', faza, skrot, pelny: tekst };
    if (tekst.length > 400) wpis.tresc = tekst.length > 600 ? tekst.slice(0, 599).replace(/\s+\S*$/, '') + '…' : tekst;
    const plik = 'sprawy/' + sprawaZywa + '/uwagi-terapeuty.jsonl';
    let stare = '';
    try { stare = await window.MsMost.czytaj(plik); } catch { stare = ''; }
    stare = String(stare || '');
    await window.MsMost.zapisz(plik, (stare && !stare.endsWith('\n') ? stare + '\n' : stare) + JSON.stringify(wpis) + '\n');
    // głos lekarza zatrzymuje odtwarzanie na kilka sekund, żeby jego dymek był widoczny; potem dyskusja idzie dalej
    const bylaGra = gra; if (gra) ustawGre(false);
    cichoDo = Date.now() + 6000;
    dymekTymczasowy('lekarz_prowadzacy', tekst, 'Terapeuta prowadzący');
    setTimeout(() => { cichoDo = 0; if (!gra && (bylaGra || zywoTimer) && i < kroki.length - 1) ustawGre(true); }, 6000);
    if (odswiezZywo) setTimeout(odswiezZywo, 300);
    return true;
  }
  (function glos() {
    const f = $('glos'), t = $('glos-tekst'), b = $('glos-wyslij'); if (!f) return;
    const dopasuj = () => { t.style.height = 'auto'; t.style.height = Math.min(120, t.scrollHeight) + 'px'; };
    t.addEventListener('input', dopasuj);
    t.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); f.requestSubmit(); } e.stopPropagation(); });
    f.addEventListener('submit', async (e) => {
      e.preventDefault();
      const tekst = t.value.trim(); if (!tekst) return;
      b.disabled = true;
      try { if (await powiedzLekarz(tekst)) { t.value = ''; dopasuj(); f.classList.remove('blad'); } }
      catch (err) { f.classList.add('blad'); f.querySelector('.glos-blad').textContent = 'Nie udało się zapisać: ' + (err && err.message || err); }
      finally { b.disabled = false; t.focus(); }
    });
  })();

  // ---------- prognoza rozpoznań: mały wykres tylko dla Lekarza prowadzącego (Michał 1.11) ----------
  // Dymki nie mają procentów; prawdopodobieństwa są tylko tutaj: średnia opinii → agregacja → zdarzenia „prognoza”.
  // Wykres jest opcjonalny (Michał 1.11: „ma być opcjonalny do wyświetlenia po kliknięciu”): przycisk „Prognoza %” w nagłówku.
  let prognozaWidoczna = false;
  $('prognoza-btn').addEventListener('click', () => { prognozaWidoczna = !prognozaWidoczna; $('prognoza-btn').setAttribute('aria-pressed', String(prognozaWidoczna)); $('prognoza-btn').classList.toggle('nk-on', prognozaWidoczna); if (kroki.length) rysujPrognoze(kroki[i].si); });
  // ekran na ścianie (zamiast okna) też przełącza wykres; wygaszony pokazuje logo K
  document.addEventListener('click', (e) => { if (e.target.closest && e.target.closest('#ekran-sciana, #prognoza')) $('prognoza-btn').click(); });
  function rysujPrognoze(si) {
    const el = $('prognoza'); if (!el) return;
    document.querySelector('#ekran-sciana')?.classList.toggle('wlaczony', prognozaWidoczna && !!(scen && scen.tablica && scen.tablica.prognozy && scen.tablica.prognozy.length));
    const lista = (scen && scen.tablica && scen.tablica.prognozy) || [];
    const akt = lista.filter((p) => p.si <= si).pop();
    $('prognoza-btn').hidden = !akt || !akt.rozpoznania.length;
    if (!akt || !akt.rozpoznania.length || !prognozaWidoczna) { el.hidden = true; el.innerHTML = ''; return; }
    const max = Math.max(...akt.rozpoznania.map((r) => r.p), 0.01);
    el.hidden = false;
    el.innerHTML = `<div class="pr-gora"><b>Mapa zgody · kierunek pracy</b><span>dla Ciebie · ${esc(akt.zrodlo)}</span></div>` +
      akt.rozpoznania.map((r) => `<div class="pr-wiersz" title="${esc(r.nazwa)} · ${Math.round(r.p * 100)}%"><span class="pr-nazwa">${esc(r.nazwa)}</span><span class="pr-belka"><i style="width:${Math.round(100 * r.p / max)}%"></i></span><span class="pr-p">${Math.round(r.p * 100)}%</span></div>`).join('');
  }

  // ---------- tablica ustaleń (Michał 1.11: zamiast paska etapów na dole) ----------
  // Na tablicy: stan prac (etapy: zrobione ✓, bieżący, przed nami), temat, najważniejsze ustalenia zapisane przez
  // lekarzy (zdarzenia „tablica” z _log.jsonl; odrzucone skreślone), ranking po agregacji, na końcu rekomendacja.
  // Wygląd (wątek Graficzny 1.11, makieta-2): biała tablica pisana markerem w trzech kolumnach –
  // Stan prac (✓ zrobione, ✱ teraz, ○ dalej) | Ustalenia | Odrzucone (przekreślone na czerwono).
  function rysujEtapy(si) {
    const k = kroki[i] || { si, wi: 0 }, n0 = Math.max(0, Math.min(si - 2, scen.sceny.length - 6));
    return `<div class="etapy" role="toolbar" aria-label="Stan prac">${scen.sceny.map((sc, n) => {
      const ile = Math.max(1, sc.wypowiedzi.length);
      const zrob = n < si ? ile : n === si ? Math.min(ile, k.wi + 1) : 0;
      const kl = n < si ? 'zrobiony' : n === si ? 'biezacy' : 'przyszly';
      const daleko = n < n0 || n >= n0 + 6 ? ' daleko' : '';
      return `<button class="etap ${kl}${daleko}" type="button" data-si="${n}" title="${esc(sc.tytul)} · ${zrob}/${ile}"><i style="--p:${Math.round(100 * zrob / ile)}%"></i><span>${esc(sc.tytul)}</span></button>`;
    }).join('')}</div>`;
  }
  function rysujTablice(si) {
    const sc = scen.sceny[si], t = scen.tablica;
    const poAgregacji = scen.sceny.findIndex((s) => s.id === 'agregat');
    const final = ['final', 'followup'].includes(sc.id);
    const ust = (t.ustalenia || []).filter((u) => u.si <= si).map((u) => ({ ...u, skreslone: u.skreslone && (u.siSkreslenia ?? u.si) <= si }));
    const dobre = ust.filter((u) => !u.skreslone).slice(-4), odrz = ust.filter((u) => u.skreslone).slice(-3);
    const powod = (u) => u.powod ? `<small>${esc(u.powod)}</small>` : '';
    let srodek = '';
    if (final && t.werdykt) {
      srodek = `<div class="werdykt"><b>Rekomendacja</b>${esc(t.werdykt)}</div>`;
    } else if (dobre.length) {
      srodek = `<ul class="ustalenia">${dobre.map((u, n) => `<li title="${esc(u.tekst)}">${n + 1}. ${esc(u.tekst)}${powod(u)}</li>`).join('')}</ul>`;
    } else if (t.ranking.length && (poAgregacji === -1 || si >= poAgregacji)) {
      srodek = `<div class="ranking">${t.ranking.slice(0, 3).map((r, n) => `<div class="wiersz"><span title="${esc(r.nazwa)}">${n + 1}. ${esc(r.nazwa)}</span><span class="p">${r.p.toFixed(2).replace('.', ',')}</span></div>`).join('')}</div>`;
    } else {
      srodek = `<p class="pusto">Pojawią się w trakcie konsylium</p>`;
    }
    const prawa = odrz.length
      ? `<ul class="ustalenia odrzucone">${odrz.map((u) => `<li class="skreslone" title="${esc(u.tekst)}"><s>${esc(u.tekst)}</s>${powod(u)}</li>`).join('')}</ul>`
      : `<p class="pusto">Jeszcze nic</p>`;
    const zrobione = scen.sceny.filter((_, n) => n < si).length;
    const pil = t.pilnosc ? `<span class="pilnosc${t.pilnosc >= 4 ? ' wysoka' : ''}" title="Pilność wg triage">pilność ${t.pilnosc}</span>` : '';
    $('tablica').innerHTML = `<div class="gora"><span class="faza">Teraz · ${esc(sc.tytul)}</span>${pil}<span class="stan" title="Etapy zakończone">${zrobione}/${scen.sceny.length}</span><span class="czas">${hhmm(sc.czas)}</span></div>` +
      `<p class="temat">${esc(sc.temat)}</p>` +
      `<div class="kolumny"><div class="kol"><h4>Stan prac</h4>${rysujEtapy(si)}<div class="postep"><i style="width:${Math.round(100 * zrobione / scen.sceny.length)}%"></i></div></div>` +
      `<div class="kol"><h4>Ustalenia</h4>${srodek}</div><div class="kol"><h4>Odrzucone</h4>${prawa}</div></div>`;
    $('tablica').querySelectorAll('.etap').forEach((b) => b.addEventListener('click', () => { ustawGre(false); pokaz(kroki.findIndex((k) => k.si === +b.dataset.si), false); }));
  }

  // ---------- protokół, legenda ----------
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
    const g = [['ordynator', 'Prowadzący / superwizor'], ['lekarz', 'Zespół terapeutów'], ['zastepca', 'Ocena ryzyka'], ['sprawdzajacy', 'Sprawdzający'], ['rezydent', 'Stażysta za szybą'], ['prowadzacy', 'Terapeuta prowadzący (Ty)']];
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
    el.innerHTML = `<b>${esc(r?.nazwa || kto)}</b>\nJeszcze nie zabrał(a) głosu w tej sprawie.`;
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
  function zatrzymajZywo() { zakonczPrzerwe(); clearInterval(zywoTimer); zywoTimer = null; sprawaZywa = null; odswiezZywo = null; const g = $('glos'); if (g) g.hidden = true; $('zywo').classList.remove('nk-on'); $('zywo').textContent = 'Na żywo…'; }
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
  async function zywoZPowloki(tylkoSwieza, wskazana) {
    const s = wskazana ? { nazwa: wskazana, zmiana: Date.now() } : await najnowszaSprawa().catch(() => null);
    if (!s) { if (!tylkoSwieza) $('opis-sprawy').textContent = 'W folderze Konsylium nie ma jeszcze spraw (sprawy/…). Pokój poczeka na pierwszą.'; return false; }
    if (tylkoSwieza && Date.now() - s.zmiana > 3 * 3600 * 1000) return false;
    zatrzymajZywo();
    let nazwa = s.nazwa, licz = 0;
    sprawaZywa = nazwa; $('glos').hidden = false;
    const odswiez = async () => {
      try {
        if (++licz % 5 === 0) { const n = await najnowszaSprawa(); if (n && n.nazwa !== nazwa) { nazwa = n.nazwa; sprawaZywa = nazwa; scen = null; kroki = []; i = 0; } }
        const pliki = {};
        for (const p of await window.MsMost.czytajFolder('sprawy/' + nazwa)) pliki[p.sciezka] = p.tekst;
        aktualizuj(zbudujScenariusz(pliki, nazwa));
        $('opis-sprawy').textContent = `Sprawa ${nazwa} · na żywo z folderu Konsylium`;
      } catch (e) { $('opis-sprawy').textContent = 'Nie da się czytać folderu sprawy: ' + e.message; }
    };
    scen = null; kroki = []; i = 0;
    odswiezZywo = odswiez;
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
    // wywiad wysłał sprawę: Pokój przełącza się na nią natychmiast (nie czeka na odpytywanie co 15 s)
    window.MsMost.naDane((od, d) => { if (d && d.zywo) zywoZPowloki(false, typeof d.sprawa === 'string' && /^\d{4}-\d{2}-\d{2}-\d+$/.test(d.sprawa) ? d.sprawa : null); });
  });
  window.addEventListener('message', (e) => {
    if (!e.data) return;
    if (e.data.typ === 'ms-motyw') ustawMotyw(e.data.motyw);
    if (e.data.typ === 'ms-ai') ustawAi(!!e.data.aktywne, e.data.od);
  });
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
