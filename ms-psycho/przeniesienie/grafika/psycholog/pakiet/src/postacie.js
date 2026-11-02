// Pokój psychologiczny — postacie terapeutów (wątek Graficzny, 1.11.2026). Ta sama funkcja co w Pokoju lekarskim,
// ale: bez fartuchów (ubranie: sweter/marynarka w kolorze `ubranie`), bez stetoskopów, prowadzący bez fajki.
// Klucze = id ról z scenariusz.mjs (ROLE). Role wg wątku Psychologa (04:36): patrz komentarze przy wpisach.
// postacSVG(id, grupa, kolor) zwraca wnętrze <g class="ciało"> w układzie figury: stopy w (0,0), głowa ok. -150.
// Stałe klasy, na których opiera się logika pokoju: .papieros.fajka i .zar (dym ordynatora wychodzi z (28.5,-104)).
const POSTACIE_SKORA = ['#F3D5C0', '#EFCBB2', '#F6DDCB', '#EAC3A6'];
// fryzura: lysy | krotkie | siwe | przedzial | bob | kucyk | loki | kok
const POSTACIE_WYGLAD = {
  // ubranie = kolor swetra/marynarki, ubranieCien = kontur; skora: indeks POSTACIE_SKORA; fryzury 'bob','kucyk','loki','kok' = kobiece
  ordynator:            { gruby: 1, fryzura: 'siwe', wlosy: '#b9b4ad', broda: '#cfcac3', okulary: 1, ubranie: '#8a7fb5', ubranieCien: '#6b5f96', herbata: 1 },          // Prowadzący / superwizor (M, sweter, bez fajki – kubek herbaty)
  hipotezujacy:         { fryzura: 'bob', wlosy: '#2f2a26', okulary: 1, skora: 2, ubranie: '#cdb9e6', ubranieCien: '#a894c9', tablet: 1 },                                // Terapeutka CBT (K ~40, tablet)
  bayes:                { fryzura: 'przedzial', wlosy: '#8f8a84', broda: '#8f8a84', okulary: 1, skora: 3, ubranie: '#9fbf9a', ubranieCien: '#7fa07a' },                   // Terapeuta psychodynamiczny (M ~55, okulary)
  najgorszy_scenariusz: { fryzura: 'kok', wlosy: '#5b3a24', skora: 1, ubranie: '#e6c384', ubranieCien: '#c9a65c' },                                                      // Terapeutka systemowa (K ~45)
  poz_pragmatyk:        { fryzura: 'krotkie', wlosy: '#c08a4a', skora: 1, ubranie: '#8fb6c9', ubranieCien: '#6f96a9', swobodny: 1 },                                     // Terapeuta trzeciej fali ACT (M ~35, swobodnie – koszulka)
  farmakolog:           { fryzura: 'loki', wlosy: '#9b3e22', skora: 2, ubranie: '#d99a8c', ubranieCien: '#b97a6c' },                                                     // Terapeutka humanistyczna (K ~50)
  gospodarz_kosztow:    { fryzura: 'krotkie', wlosy: '#3a2a20', broda: '#3a2a20', ubranie: '#b7a0d9', ubranieCien: '#9780bb', laptop: 1 },                                // Diagnosta kliniczny (M ~40, laptop)
  psychiatra:           { fryzura: 'bob', wlosy: '#d8b46a', okulary: 1, skora: 2, ubranie: '#f0cfa6', ubranieCien: '#cfa97c', identyfikator: 1 },                        // Psychiatra konsultant (K ~50, identyfikator, bez stetoskopu)
  lekarz_prowadzacy:    { fryzura: 'przedzial', wlosy: '#3a2a20', broda: '#3a2a20', teczka: 1, skora: 1, ubranie: '#6b5f96', ubranieCien: '#4e4473' },                    // Terapeuta prowadzący (Ty – użytkownik)
  // role pomocnicze (jeśli zostają w scenariuszu): zastępcy/triage ryzyka, sprawdzający
  z_zlozonosc:          { fryzura: 'krotkie', wlosy: '#5b3a24', ubranie: '#9fbf9a', ubranieCien: '#7fa07a' },
  z_bezpieczenstwo:     { fryzura: 'kucyk', wlosy: '#2f2a26', skora: 1, ubranie: '#b8d1b0', ubranieCien: '#92ad8a' },
  z_niepewnosc:         { fryzura: 'siwe', wlosy: '#a9a39b', okulary: 1, skora: 3, ubranie: '#cdb9e6', ubranieCien: '#a894c9' },
  s_fakty:              { fryzura: 'przedzial', wlosy: '#6b4a33', okulary: 1, ubranie: '#e6c384', ubranieCien: '#c9a65c' },
  s_proces:             { fryzura: 'bob', wlosy: '#d8b46a', skora: 2, ubranie: '#f0cfa6', ubranieCien: '#cfa97c' },
  // Stażysta za szybą (mały, jak rezydent w Konsylium)
  R1:                   { fryzura: 'krotkie', wlosy: '#c08a4a', ubranie: '#dcd4ea', ubranieCien: '#b7a9d3' },
  R2:                   { fryzura: 'kok', wlosy: '#5b3a24', skora: 2, ubranie: '#dcd4ea', ubranieCien: '#b7a9d3' },
  R3:                   { fryzura: 'krotkie', wlosy: '#2f2a26', okulary: 1, skora: 1, ubranie: '#dcd4ea', ubranieCien: '#b7a9d3' },
};
const POSTACIE_SKALA = 0.76; // rysunek w jednostkach makiety (≈196 wysokości) → skala sceny (≈150)

function postacSVG(id, grupa, kolor) {
  const o = POSTACIE_WYGLAD[id] || { fryzura: 'krotkie', wlosy: '#5b3a24' };
  const sk = POSTACIE_SKORA[o.skora || 0], w = o.wlosy, g = o.gruby ? 1.45 : 1;
  const rezydent = grupa === 'rezydent';
  const fartuch = o.ubranie || (rezydent ? kolor : 'var(--fartuch)'), obrys = o.ubranieCien || 'var(--fartuch-cien)';
  const bw = 30 * g, hy = -166;
  let h = `<g transform="scale(${POSTACIE_SKALA})">`;
  // nogi i buty
  h += `<rect x="-15" y="-52" width="12" height="52" rx="5" fill="${rezydent ? '#3a3f4a' : '#2f4744'}"/><rect x="3" y="-52" width="12" height="52" rx="5" fill="${rezydent ? '#3a3f4a' : '#2f4744'}"/>`;
  h += `<ellipse cx="-10" cy="-1" rx="10" ry="5" fill="#1d2b2a"/><ellipse cx="10" cy="-1" rx="10" ry="5" fill="#1d2b2a"/>`;
  // fartuch (ordynator: szerszy, z brzuchem)
  h += `<path d="M${-bw} -50 Q${-bw - 4} -110 ${-bw * 0.62} -128 L${bw * 0.62} -128 Q${bw + 4} -110 ${bw} -50 Q0 -42 ${-bw} -50Z" fill="${fartuch}" stroke="${obrys}" stroke-width="1.5"/>`;
  if (o.gruby) h += `<path d="M${-bw + 6} -66 Q0 -40 ${bw - 6} -66" fill="none" stroke="${obrys}" stroke-width="1.4"/>`;
  // koszula w kolorze roli i klapy
  if (o.swobodny) h += `<path d="M-12 -128 Q0 -116 12 -128" fill="none" stroke="${obrys}" stroke-width="1.6"/>`;
  else { h += `<path d="M-10 -128 L0 -100 L10 -128Z" fill="${rezydent ? '#e8e2d6' : '#f6f2ea'}"/>`; h += `<path d="M-11 -128 L-2 -96 L-14 -80 M11 -128 L2 -96 L14 -80" stroke="${obrys}" stroke-width="1.6" fill="none"/>`; }
  // lewa ręka
  h += `<path d="M${-bw * 0.75} -122 Q${-bw - 14} -95 ${-bw - 6} -66" stroke="${fartuch}" stroke-width="13" stroke-linecap="round" fill="none"/>`;
  h += `<circle cx="${-bw - 6}" cy="-62" r="6.5" fill="${sk}"/>`;
  // prawa ręka: przy fajce, z teczką albo luźno
  if (o.fajka) {
    h += `<path d="M${bw * 0.75} -122 Q${bw + 14} -104 ${bw * 0.8} -112" stroke="${fartuch}" stroke-width="13" stroke-linecap="round" fill="none"/>`;
  } else {
    h += `<path d="M${bw * 0.75} -122 Q${bw + 14} -95 ${bw + 6} -66" stroke="${fartuch}" stroke-width="13" stroke-linecap="round" fill="none"/><circle cx="${bw + 6}" cy="-62" r="6.5" fill="${sk}"/>`;
    if (o.teczka) h += `<rect x="${bw - 6}" y="-74" width="30" height="38" rx="3" fill="#d9a84e" stroke="#a87b2c" stroke-width="1.5"/><rect x="${bw + 1}" y="-80" width="16" height="7" rx="2" fill="#a87b2c"/>`;
  }
  // stetoskop (lekarze i ordynator), identyfikator w kolorze roli
  // bez stetoskopu (pokój psychologiczny)
  if (rezydent || o.identyfikator) h += `<rect x="${bw * 0.22}" y="-116" width="13" height="16" rx="2" fill="#fff"/><rect x="${bw * 0.22}" y="-116" width="13" height="5" rx="1" fill="${kolor}"/>`;
  else h += `<circle cx="${bw * 0.3}" cy="-108" r="4" fill="${kolor}"/>`; // mała plakietka w kolorze roli
  if (o.tablet) h += `<g transform="translate(${-bw - 14},-82) rotate(-12)"><rect x="-9" y="-13" width="18" height="26" rx="2.5" fill="#2b2540"/><rect x="-7" y="-11" width="14" height="22" rx="1.5" fill="#cdb9e6" opacity=".8"/></g>`;
  if (o.laptop) h += `<g transform="translate(${-bw - 16},-78)"><rect x="-12" y="-9" width="24" height="16" rx="2" fill="#2b2540"/><rect x="-10" y="-7" width="20" height="12" rx="1" fill="#8fb6c9" opacity=".8"/></g>`;
  if (o.herbata) h += `<g class="herbata" transform="translate(${-bw - 10},-74)"><rect x="-7" y="-10" width="14" height="13" rx="3" fill="#fbfdfc" stroke="#b8c7c3"/><path d="M7,-7 q6,0 6,4 q0,4 -6,4" fill="none" stroke="#b8c7c3" stroke-width="2"/><path class="para" d="M-3,-14 q-3,-5 1,-9 M3,-14 q3,-5 -1,-9" fill="none" stroke="#c9c2d6" stroke-width="1.5" stroke-linecap="round"/></g>`;
  // szyja
  h += `<rect x="-6" y="-140" width="12" height="14" fill="${sk}"/>`;
  // włosy z tyłu
  if (o.fryzura === 'kucyk') h += `<path d="M18 ${hy - 6} Q40 ${hy + 6} 30 ${hy + 34} Q22 ${hy + 20} 16 ${hy + 8}Z" fill="${w}"/>`;
  if (o.fryzura === 'bob') h += `<path d="M-27 ${hy - 4} Q-30 ${hy + 26} -20 ${hy + 30} L20 ${hy + 30} Q30 ${hy + 26} 27 ${hy - 4}Z" fill="${w}"/>`;
  if (o.fryzura === 'loki') h += `<g fill="${w}">${[-26, -18, -8, 4, 14, 22, 27, -28, 28].map((dx, i) => `<circle cx="${dx}" cy="${hy + (i > 6 ? 14 : -14 + Math.abs(dx) / 3)}" r="11"/>`).join('')}</g>`;
  if (o.fryzura === 'kok') h += `<circle cx="0" cy="${hy - 30}" r="11" fill="${w}"/>`;
  // uszy, twarz, policzki
  h += `<ellipse cx="-24" cy="${hy + 2}" rx="5" ry="7" fill="${sk}"/><ellipse cx="24" cy="${hy + 2}" rx="5" ry="7" fill="${sk}"/>`;
  h += `<ellipse cx="0" cy="${hy}" rx="${o.gruby ? 26 : 23}" ry="26" fill="${sk}"/>`;
  h += `<ellipse cx="-13" cy="${hy + 8}" rx="5" ry="3" fill="#e9a99a" opacity=".45"/><ellipse cx="13" cy="${hy + 8}" rx="5" ry="3" fill="#e9a99a" opacity=".45"/>`;
  // włosy z przodu
  if (o.fryzura === 'lysy') h += `<path d="M-24 ${hy - 2} Q-25 ${hy - 14} -19 ${hy - 10} M24 ${hy - 2} Q25 ${hy - 14} 19 ${hy - 10}" stroke="${w}" stroke-width="7" stroke-linecap="round"/>`;
  else if (o.fryzura === 'krotkie' || o.fryzura === 'siwe') h += `<path d="M-24 ${hy - 2} Q-26 ${hy - 30} 0 ${hy - 29} Q26 ${hy - 30} 24 ${hy - 2} Q16 ${hy - 18} -4 ${hy - 17} Q-18 ${hy - 16} -24 ${hy - 2}Z" fill="${w}"/>`;
  else if (o.fryzura === 'przedzial') h += `<path d="M-24 ${hy} Q-27 ${hy - 30} 2 ${hy - 30} Q27 ${hy - 28} 24 ${hy} Q20 ${hy - 14} 8 ${hy - 20} Q-6 ${hy - 12} -24 ${hy}Z" fill="${w}"/>`;
  else h += `<path d="M-25 ${hy + 4} Q-28 ${hy - 32} 0 ${hy - 30} Q28 ${hy - 32} 25 ${hy + 4} Q22 ${hy - 14} 6 ${hy - 18} Q-10 ${hy - 12} -25 ${hy + 4}Z" fill="${w}"/>`;
  // oczy, brwi, okulary, nos
  h += `<ellipse cx="-9" cy="${hy + 1}" rx="2.6" ry="3.2" fill="#24302f"/><ellipse cx="9" cy="${hy + 1}" rx="2.6" ry="3.2" fill="#24302f"/>`;
  h += `<path d="M-14 ${hy - 7} Q-9 ${hy - 10} -4 ${hy - 7} M4 ${hy - 7} Q9 ${hy - 10} 14 ${hy - 7}" stroke="${o.fryzura === 'lysy' ? '#9a9a9a' : w}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
  if (o.okulary) h += `<g stroke="#2e3d3b" stroke-width="1.8" fill="rgba(255,255,255,.25)"><circle cx="-9" cy="${hy + 1}" r="7"/><circle cx="9" cy="${hy + 1}" r="7"/><path d="M-2 ${hy + 1} L2 ${hy + 1}"/></g>`;
  h += `<path d="M0 ${hy + 3} Q3 ${hy + 9} -1 ${hy + 10}" stroke="#c99c82" stroke-width="1.8" fill="none" stroke-linecap="round"/>`;
  if (o.broda) h += `<path d="M-21 ${hy + 6} Q-20 ${hy + 30} 0 ${hy + 32} Q20 ${hy + 30} 21 ${hy + 6} Q14 ${hy + 20} 0 ${hy + 19} Q-14 ${hy + 20} -21 ${hy + 6}Z" fill="${o.broda}"/>`;
  // usta: zamknięte i otwarte – przy dymku CSS przełącza je na zmianę (.postac.aktywna)
  h += `<g class="usta"><path class="u-zam" d="M-5 ${hy + 15} Q0 ${hy + 19} 5 ${hy + 15}" stroke="#8a3d38" stroke-width="2" fill="none" stroke-linecap="round"/><ellipse class="u-otw" cx="0" cy="${hy + 16}" rx="4.6" ry="3.8" fill="#8a3d38"/></g>`;
  h += `</g>`;
  // fajka ordynatora w skali sceny: wygięta, cybuch dokładnie w (28.5,-104), skąd wychodzi dym
  if (o.fajka) {
    const s = POSTACIE_SKALA;
    h += `<g class="papieros fajka"><path d="M${3 * s} ${(hy + 15) * s} Q${16} ${(hy + 26) * s} ${24} ${-108}" fill="none" stroke="#3a2416" stroke-width="3" stroke-linecap="round"/>` +
      `<path d="M21 -104 L36 -104 L34.5 -89 Q28.5 -84 22.5 -89Z" fill="#7a4524" stroke="#3a2416" stroke-width="1.3"/>` +
      `<ellipse cx="28.5" cy="-104" rx="7.5" ry="2.4" fill="#2a1a10"/><circle class="zar" cx="28.5" cy="-104" r="2.6" fill="#e8742a"/>` +
      `<circle cx="${bw * 0.8 * s + 1}" cy="${-112 * s + 1}" r="5" fill="${sk}"/></g>`;
  }
  return h;
}
