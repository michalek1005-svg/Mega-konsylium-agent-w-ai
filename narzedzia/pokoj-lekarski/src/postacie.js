// Pokój lekarski — postacie lekarzy (wątek Graficzny, 1.11.2026, makieta grafika/makiety-2026-11-01/makieta-1.png).
// Michał: postacie białej rasy, kobiety i mężczyźni; ordynator gruby, pali widoczną fajkę; większe twarze, ruch ust przy dymku.
// postacSVG(id, grupa, kolor) zwraca wnętrze <g class="ciało"> w układzie figury: stopy w (0,0), głowa ok. -150.
// Stałe klasy, na których opiera się logika pokoju: .papieros.fajka i .zar (dym ordynatora wychodzi z (28.5,-104)).
const POSTACIE_SKORA = ['#F3D5C0', '#EFCBB2', '#F6DDCB', '#EAC3A6'];
// fryzura: lysy | krotkie | siwe | przedzial | bob | kucyk | loki | kok
const POSTACIE_WYGLAD = {
  ordynator:            { gruby: 1, fryzura: 'lysy', wlosy: '#b9b4ad', broda: '#cfcac3', okulary: 1, fajka: 1 },
  hipotezujacy:         { fryzura: 'krotkie', wlosy: '#5b3a24' },
  bayes:                { fryzura: 'bob', wlosy: '#2f2a26', okulary: 1, skora: 2 },
  farmakolog:           { fryzura: 'kucyk', wlosy: '#c08a4a', skora: 1 },
  najgorszy_scenariusz: { fryzura: 'siwe', wlosy: '#8f8a84', broda: '#8f8a84', skora: 3 },
  poz_pragmatyk:        { fryzura: 'loki', wlosy: '#9b3e22', skora: 2 },
  gospodarz_kosztow:    { fryzura: 'przedzial', wlosy: '#d8b46a', okulary: 1 },
  lekarz_prowadzacy:    { fryzura: 'kok', wlosy: '#4a3428', teczka: 1 },
  z_zlozonosc:          { fryzura: 'krotkie', wlosy: '#3a2a20', broda: '#3a2a20' },
  z_bezpieczenstwo:     { fryzura: 'kucyk', wlosy: '#2f2a26', skora: 1 },
  z_niepewnosc:         { fryzura: 'siwe', wlosy: '#a9a39b', okulary: 1, skora: 3 },
  s_fakty:              { fryzura: 'przedzial', wlosy: '#6b4a33', okulary: 1 },
  s_proces:             { fryzura: 'bob', wlosy: '#d8b46a', skora: 2 },
  R1:                   { fryzura: 'krotkie', wlosy: '#c08a4a' },
  R2:                   { fryzura: 'kok', wlosy: '#5b3a24', skora: 2 },
  R3:                   { fryzura: 'krotkie', wlosy: '#2f2a26', okulary: 1, skora: 1 },
};
const POSTACIE_SKALA = 0.76; // rysunek w jednostkach makiety (≈196 wysokości) → skala sceny (≈150)

function postacSVG(id, grupa, kolor) {
  const o = POSTACIE_WYGLAD[id] || { fryzura: 'krotkie', wlosy: '#5b3a24' };
  const sk = POSTACIE_SKORA[o.skora || 0], w = o.wlosy, g = o.gruby ? 1.45 : 1;
  const rezydent = grupa === 'rezydent';
  const fartuch = rezydent ? kolor : 'var(--fartuch)', obrys = 'var(--fartuch-cien)';
  const bw = 30 * g, hy = -166;
  let h = `<g transform="scale(${POSTACIE_SKALA})">`;
  // nogi i buty
  h += `<rect x="-15" y="-52" width="12" height="52" rx="5" fill="${rezydent ? '#3a3f4a' : '#2f4744'}"/><rect x="3" y="-52" width="12" height="52" rx="5" fill="${rezydent ? '#3a3f4a' : '#2f4744'}"/>`;
  h += `<ellipse cx="-10" cy="-1" rx="10" ry="5" fill="#1d2b2a"/><ellipse cx="10" cy="-1" rx="10" ry="5" fill="#1d2b2a"/>`;
  // fartuch (ordynator: szerszy, z brzuchem)
  h += `<path d="M${-bw} -50 Q${-bw - 4} -110 ${-bw * 0.62} -128 L${bw * 0.62} -128 Q${bw + 4} -110 ${bw} -50 Q0 -42 ${-bw} -50Z" fill="${fartuch}" stroke="${obrys}" stroke-width="1.5"/>`;
  if (o.gruby) h += `<path d="M${-bw + 6} -66 Q0 -40 ${bw - 6} -66" fill="none" stroke="${obrys}" stroke-width="1.4"/>`;
  // koszula w kolorze roli i klapy
  h += `<path d="M-10 -128 L0 -100 L10 -128Z" fill="${rezydent ? '#e8e2d6' : kolor}"/>`;
  h += `<path d="M-11 -128 L-2 -96 L-14 -80 M11 -128 L2 -96 L14 -80" stroke="${obrys}" stroke-width="1.6" fill="none"/>`;
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
  if (grupa === 'lekarz' || grupa === 'ordynator' || grupa === 'prowadzacy') h += `<path d="M-8 -126 Q-16 -96 -2 -88 Q12 -96 8 -126" stroke="#3b5552" stroke-width="2.4" fill="none"/><circle cx="-2" cy="-86" r="4" fill="#9fb2af" stroke="#3b5552" stroke-width="1.6"/>`;
  h += rezydent
    ? `<rect x="${bw * 0.22}" y="-116" width="13" height="16" rx="2" fill="#fff"/><rect x="${bw * 0.22}" y="-116" width="13" height="5" rx="1" fill="${kolor}"/>`
    : `<rect x="${bw * 0.25}" y="-112" width="13" height="9" rx="2" fill="${kolor}"/>`;
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
