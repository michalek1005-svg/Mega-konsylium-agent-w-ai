// Plakat na ścianie Pokoju: realistyczny rysunek pastelowy nieogolonego diagnosty z laską i serduszkiem
// (żartobliwy hołd dla serialowego lekarza; rysunek autorski, bez zdjęć, bez nazwisk aktorów).
// Technika: kolorowy papier z ziarnem, miękkie plamy pigmentu (rozmycie), kreski pastelu, chropowate brzegi
// (feDisplacementMap) i „ząbek” papieru prześwitujący przez pigment. Układ współrzędnych: 200 × 250.
// PLAKAT_DEFS wstawia się raz w scenie; <use href="#pl-rys"> pokazuje ten sam rysunek w powiększeniu.
const PLAKAT_W = 200, PLAKAT_H = 250;

function plKreski(n, x0, y0, x1, y1, dx, dy, kolor, gr, op, seed) {
  // n równoległych kresek pastelu z lekkim rozrzutem (deterministyczny, żeby rysunek był zawsze ten sam)
  let s = seed, out = '';
  const los = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  for (let k = 0; k < n; k++) {
    const t = k / Math.max(1, n - 1), x = x0 + (x1 - x0) * t + (los() - .5) * 3, y = y0 + (y1 - y0) * t + (los() - .5) * 3;
    const l = .7 + los() * .6;
    out += `<path d="M${x.toFixed(1)},${y.toFixed(1)} q${(dx * l / 2 + (los() - .5) * 2).toFixed(1)},${(dy * l / 2 + (los() - .5) * 2).toFixed(1)} ${(dx * l).toFixed(1)},${(dy * l).toFixed(1)}"/>`;
  }
  return `<g fill="none" stroke="${kolor}" stroke-width="${gr}" stroke-linecap="round" opacity="${op}">${out}</g>`;
}

function plWlosy() {
  // krótkie, potargane, siwiejące włosy: kreski od linii czoła ku górze i na boki
  let s = 11, out = '';
  const los = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  const kol = ['#5b4a3f', '#7a6a5e', '#9c9088', '#3e322b', '#b7aea6'];
  for (let k = 0; k < 220; k++) {
    const a = Math.PI * (1.08 + los() * .84), r = 18 + los() * 13;
    const x = 100 + Math.cos(a) * r * 1.12, y = 80 + Math.sin(a) * r * 1.05;
    const dl = 3 + los() * 4, kat = a + Math.PI / 2 * (los() < .5 ? 1 : -1) + (los() - .5) * .9;
    out += `<path d="M${x.toFixed(1)},${y.toFixed(1)} l${(Math.cos(kat) * dl).toFixed(1)},${(Math.sin(kat) * dl).toFixed(1)}" stroke="${kol[k % kol.length]}"/>`;
  }
  return `<g fill="none" stroke-width=".9" stroke-linecap="round" opacity=".75">${out}</g>`;
}

const PLAKAT_DEFS = `
<defs>
  <filter id="pl-kreda" x="-4%" y="-4%" width="108%" height="108%">
    <feTurbulence type="fractalNoise" baseFrequency=".055" numOctaves="3" seed="3" result="szum"/>
    <feDisplacementMap in="SourceGraphic" in2="szum" scale="2.4" xChannelSelector="R" yChannelSelector="G" result="brzeg"/>
    <feTurbulence type="fractalNoise" baseFrequency="1.3" numOctaves="1" seed="9" result="zab"/>
    <feColorMatrix in="zab" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.25 1.5" result="zabA"/>
    <feComposite in="brzeg" in2="zabA" operator="in"/>
  </filter>
  <filter id="pl-miekko" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3.2"/></filter>
  <filter id="pl-mgla" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="7"/></filter>
  <filter id="pl-cien" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="1.4"/></filter>
  <filter id="pl-papier" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="5" result="z"/>
    <feColorMatrix in="z" type="matrix" values="0 0 0 0 .35  0 0 0 0 .33  0 0 0 0 .3  0 0 0 .55 -.08"/>
    <feComposite in2="SourceGraphic" operator="in"/>
  </filter>
  <filter id="pl-zarost" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="1.6" numOctaves="1" seed="21" result="z"/>
    <feColorMatrix in="z" type="matrix" values="0 0 0 0 .28  0 0 0 0 .23  0 0 0 0 .2  0 0 0 -2.6 1.95"/>
    <feComposite in2="SourceGraphic" operator="in"/>
  </filter>
  <radialGradient id="pl-tlo" cx="45%" cy="34%" r="80%"><stop offset="0" stop-color="#e9dcc4"/><stop offset=".55" stop-color="#c7c2b4"/><stop offset="1" stop-color="#8e9aa2"/></radialGradient>
  <radialGradient id="pl-skora" cx="44%" cy="36%" r="70%"><stop offset="0" stop-color="#f1d3bd"/><stop offset=".55" stop-color="#dcae93"/><stop offset="1" stop-color="#a7765f"/></radialGradient>
  <linearGradient id="pl-szyja" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9c6a55"/><stop offset="1" stop-color="#c99a80"/></linearGradient>
  <linearGradient id="pl-marynarka" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4b5068"/><stop offset=".5" stop-color="#30344a"/><stop offset="1" stop-color="#1c1f2e"/></linearGradient>
  <linearGradient id="pl-koszula" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8eaac6"/><stop offset=".5" stop-color="#b9cfe2"/><stop offset="1" stop-color="#7f9bb8"/></linearGradient>
  <linearGradient id="pl-laska" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#3b2416"/><stop offset=".45" stop-color="#8a5a37"/><stop offset="1" stop-color="#4a2e1b"/></linearGradient>
  <radialGradient id="pl-teczowka" cx="50%" cy="45%" r="55%"><stop offset="0" stop-color="#9cc3e0"/><stop offset=".6" stop-color="#4f86b4"/><stop offset="1" stop-color="#2c4f72"/></radialGradient>
  <clipPath id="pl-twarz-clip"><path d="M70,84 C69,60 82,46 100,46 C118,46 131,60 130,84 C130,100 127,112 120,122 C113,131 107,135 100,135 C93,135 87,131 80,122 C73,112 70,100 70,84 Z"/></clipPath>
  <clipPath id="pl-ramka"><rect x="0" y="0" width="${PLAKAT_W}" height="${PLAKAT_H}" rx="2"/></clipPath>
  <g id="pl-rys" clip-path="url(#pl-ramka)">
    <!-- papier pastelowy -->
    <rect width="${PLAKAT_W}" height="${PLAKAT_H}" fill="url(#pl-tlo)"/>
    <g filter="url(#pl-kreda)">
      <!-- tło: szerokie pociągnięcia ochry i błękitu za głową -->
      <ellipse cx="96" cy="88" rx="70" ry="64" fill="#f2e3c6" opacity=".75" filter="url(#pl-mgla)"/>
      <ellipse cx="170" cy="40" rx="40" ry="36" fill="#9fb4c0" opacity=".55" filter="url(#pl-mgla)"/>
      ${plKreski(26, 8, 20, 60, 200, 22, -16, '#efe2c8', 2.4, .35, 3)}
      ${plKreski(22, 140, 120, 196, 210, 18, -22, '#7f939e', 2.2, .3, 7)}
      ${plKreski(16, 150, 10, 196, 90, 16, 14, '#d9c9a8', 2, .3, 13)}

      <!-- marynarka i ramiona -->
      <path d="M8,250 L14,196 C18,172 36,160 62,152 L84,146 L100,176 L116,146 L138,152 C164,160 182,172 186,196 L192,250 Z" fill="url(#pl-marynarka)"/>
      <path d="M62,152 L84,146 L98,184 L86,250 L70,250 L76,196 Z" fill="#3c4159"/>
      <path d="M138,152 L116,146 L102,184 L114,250 L130,250 L124,196 Z" fill="#2a2e41"/>
      <path d="M64,154 C70,170 74,188 76,200" fill="none" stroke="#6c728c" stroke-width="2.4" opacity=".55" filter="url(#pl-cien)"/>
      <path d="M30,186 C40,176 52,168 64,162" fill="none" stroke="#6a7089" stroke-width="5" opacity=".35" filter="url(#pl-miekko)"/>
      ${plKreski(18, 20, 200, 60, 246, 10, -14, '#545a74', 1.6, .45, 17)}
      ${plKreski(16, 140, 196, 182, 246, -8, -14, '#15182a', 1.6, .45, 19)}

      <!-- koszula bez krawata, rozpięty kołnierzyk -->
      <path d="M84,146 L100,176 L116,146 L112,140 L100,150 L88,140 Z" fill="url(#pl-koszula)"/>
      <path d="M86,142 L80,156 L94,166 Z M114,142 L120,156 L106,166 Z" fill="#c8d9e8"/>
      <path d="M92,166 L100,176 L108,166 L104,250 L96,250 Z" fill="url(#pl-koszula)"/>
      <path d="M100,180 L100,250" stroke="#6f8aa6" stroke-width="1" opacity=".6"/>
      <circle cx="100" cy="196" r="1.3" fill="#e8eef4"/><circle cx="100" cy="216" r="1.3" fill="#e8eef4"/>

      <!-- szyja -->
      <path d="M86,122 L86,146 C92,152 108,152 114,146 L114,122 Z" fill="url(#pl-szyja)"/>
      <ellipse cx="100" cy="136" rx="16" ry="6" fill="#7d4f3e" opacity=".45" filter="url(#pl-miekko)"/>

      <g transform="translate(100,86) scale(1.1) translate(-100,-84)">
      <!-- uszy -->
      <path d="M71,76 C65,74 64,90 67,98 C69,102 72,101 72,97 Z" fill="#cf9f86"/>
      <path d="M129,76 C135,74 136,90 133,98 C131,102 128,101 128,97 Z" fill="#c4937a"/>
      <path d="M68,82 q2,6 1,11 M132,82 q-2,6 -1,11" fill="none" stroke="#8c5c49" stroke-width="1" opacity=".6"/>

      <!-- twarz: baza i światłocień -->
      <path d="M70,84 C69,60 82,46 100,46 C118,46 131,60 130,84 C130,100 127,112 120,122 C113,131 107,135 100,135 C93,135 87,131 80,122 C73,112 70,100 70,84 Z" fill="url(#pl-skora)"/>
      <g clip-path="url(#pl-twarz-clip)">
        <ellipse cx="128" cy="92" rx="10" ry="30" fill="#9a6550" opacity=".5" filter="url(#pl-miekko)"/>
        <ellipse cx="73" cy="92" rx="7" ry="26" fill="#a77260" opacity=".35" filter="url(#pl-miekko)"/>
        <ellipse cx="96" cy="60" rx="20" ry="9" fill="#f8e6d6" opacity=".7" filter="url(#pl-miekko)"/>
        <ellipse cx="86" cy="76" rx="9" ry="5" fill="#8f5c49" opacity=".55" filter="url(#pl-miekko)"/>
        <ellipse cx="114" cy="76" rx="9" ry="5" fill="#8a5644" opacity=".6" filter="url(#pl-miekko)"/>
        <ellipse cx="82" cy="98" rx="7" ry="6" fill="#e3a58e" opacity=".45" filter="url(#pl-miekko)"/>
        <ellipse cx="119" cy="100" rx="6" ry="9" fill="#a46b56" opacity=".45" filter="url(#pl-miekko)"/>
        <ellipse cx="99" cy="92" rx="3" ry="9" fill="#f9e7d8" opacity=".65" filter="url(#pl-cien)"/>
        <ellipse cx="106" cy="94" rx="3" ry="8" fill="#a26a55" opacity=".5" filter="url(#pl-cien)"/>
        ${plKreski(10, 74, 66, 80, 118, 4, 10, '#b27e66', 1.2, .35, 23)}
        ${plKreski(10, 122, 66, 126, 118, -4, 10, '#8c5845', 1.2, .4, 29)}
        <!-- zarost kilkudniowy: policzki, broda, nad wargą -->
        <path d="M74,98 C76,114 86,130 100,133 C114,130 124,114 126,98 C122,108 116,110 112,108 C106,104 94,104 88,108 C84,110 78,108 74,98 Z" fill="#5a4337" opacity=".68" filter="url(#pl-miekko)"/>
        <path d="M74,96 C76,114 86,130 100,135 C114,130 124,114 126,96 L126,136 L74,136 Z" fill="#000" filter="url(#pl-zarost)" opacity=".9"/>
        <path d="M90,106 C95,103 105,103 110,106 L110,109 C104,107 96,107 90,109 Z" fill="#4a372d" opacity=".55" filter="url(#pl-cien)"/>
        <!-- zmarszczki: czoło i kurze łapki -->
        <path d="M86,58 q14,-4 28,0 M84,63 q16,-4 32,0" fill="none" stroke="#a5715c" stroke-width=".9" opacity=".5"/>
        <path d="M97,68 l1,5 M102,68 l-1,5" fill="none" stroke="#8f5c49" stroke-width="1" opacity=".6"/>
        <path d="M74,79 l-3,-1 M74,82 l-3,1 M126,79 l3,-1 M126,82 l3,1" fill="none" stroke="#8f5c49" stroke-width=".8" opacity=".6"/>
      </g>

      <!-- brwi: ciężkie, jedna lekko uniesiona -->
      <path d="M78,72 C83,68 90,67 96,70" fill="none" stroke="#4a3a31" stroke-width="3.2" stroke-linecap="round"/>
      <path d="M104,69 C110,65 118,66 123,71" fill="none" stroke="#4a3a31" stroke-width="3.2" stroke-linecap="round"/>
      ${plKreski(8, 79, 71, 94, 69, 3, -2, '#6e5a4e', .8, .7, 31)}
      ${plKreski(8, 105, 68, 121, 69, 3, -2, '#6e5a4e', .8, .7, 37)}

      <!-- oczy: głęboko osadzone, przenikliwie niebieskie -->
      <path d="M80,79 C84,75 92,75 96,79 C92,82 84,82 80,79 Z" fill="#ece4dc"/>
      <path d="M104,79 C108,75 116,75 120,79 C116,82 108,82 104,79 Z" fill="#e8dfd6"/>
      <circle cx="88.5" cy="78.6" r="3.2" fill="url(#pl-teczowka)"/><circle cx="112.5" cy="78.6" r="3.2" fill="url(#pl-teczowka)"/>
      <circle cx="88.5" cy="78.6" r="1.35" fill="#151a22"/><circle cx="112.5" cy="78.6" r="1.35" fill="#151a22"/>
      <circle cx="87.4" cy="77.6" r=".8" fill="#fff" opacity=".9"/><circle cx="111.4" cy="77.6" r=".8" fill="#fff" opacity=".9"/>
      <!-- ciężkie powieki: przykrywają górę tęczówki, spojrzenie spod brwi -->
      <path d="M79,79 C83,74 93,74 97,79 C93,77.2 84,77.2 79,79 Z" fill="#b98670"/>
      <path d="M103,79 C107,74 117,74 121,79 C116,77.2 108,77.2 103,79 Z" fill="#b07c66"/>
      <path d="M80,79 C84,77.6 92,77.6 96.5,79" fill="none" stroke="#3a2a22" stroke-width="1.4" stroke-linecap="round"/>
      <path d="M104,79 C108,77.6 116,77.6 120.5,79" fill="none" stroke="#3a2a22" stroke-width="1.4" stroke-linecap="round"/>
      <path d="M79.5,79 C84,74.4 92,74.4 96.5,79" fill="none" stroke="#3a2a22" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M103.5,79 C108,74.4 116,74.4 120.5,79" fill="none" stroke="#3a2a22" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M82,84 q6,3 12,0 M106,84 q6,3 12,0" fill="none" stroke="#9a6450" stroke-width=".9" opacity=".7"/>

      <!-- nos -->
      <path d="M100,80 C100,90 103,96 106,101 C104,104 100,105 96,103" fill="none" stroke="#8e5a46" stroke-width="1.3" stroke-linecap="round" opacity=".8"/>
      <path d="M93,102 q2,2 4,1 M104,103 q2,-1 3,-3" fill="none" stroke="#6e4233" stroke-width="1.2" stroke-linecap="round"/>

      <!-- usta: wąskie, z kpiącym półuśmiechem -->
      <path d="M90,114 C95,112 104,112 111,112 C106,116 96,117 90,114 Z" fill="#a8665a"/>
      <path d="M90,114 C96,113.5 104,113 111,111.5" fill="none" stroke="#5e3229" stroke-width="1.2" stroke-linecap="round"/>
      <path d="M95,119 q5,2 10,0" fill="none" stroke="#c48a77" stroke-width="1.2" opacity=".6"/>

      <!-- włosy: krótkie, siwiejące, potargane -->
      <path d="M71,80 C68,56 80,42 100,41 C120,41 133,54 130,80 C127,66 122,58 116,55 C108,52 94,52 86,55 C79,58 74,66 71,80 Z" fill="#6c5c50"/>
      <path d="M72,72 C74,60 82,50 92,48 C86,54 80,62 78,74 Z" fill="#8f8278" opacity=".7"/>
      ${plWlosy()}

      </g>

      <!-- laska: drewniana, zakrzywiona rączka, dłoń na rączce -->
      <path d="M176,232 L158,168" stroke="url(#pl-laska)" stroke-width="6.5" stroke-linecap="round"/>
      <path d="M158,170 C156,152 168,144 178,150 C184,154 184,162 180,166" fill="none" stroke="url(#pl-laska)" stroke-width="6.5" stroke-linecap="round"/>
      <path d="M159,170 C158,156 167,149 176,153" fill="none" stroke="#c08a5e" stroke-width="1.4" opacity=".7"/>

      <!-- serduszko -->
      <g id="pl-serce" transform="translate(34,40)">
        <path d="M0,-6 c-6,-10 -22,-6 -21,6 c1,10 14,16 21,23 c7,-7 20,-13 21,-23 c1,-12 -15,-16 -21,-6z" fill="#d9413f"/>
        <path d="M-12,-4 c-3,1 -5,5 -4,9" fill="none" stroke="#f7b7a8" stroke-width="2.2" stroke-linecap="round" opacity=".8"/>
        ${plKreski(7, -14, 6, 10, 2, 6, 6, '#a72a2c', 1.3, .55, 41)}
      </g>

      <!-- pasek z napisem -->
      <rect x="0" y="222" width="${PLAKAT_W}" height="28" fill="#eadfca"/>
      <path d="M0,222 L${PLAKAT_W},222" stroke="#b9ab90" stroke-width="1.5"/>
      <!-- napis pastelą -->
      <text x="100" y="241" text-anchor="middle" font-family="var(--font, sans-serif)" font-size="15" font-weight="800" letter-spacing="1.4" fill="#2f3447" opacity=".9">WSZYSCY KŁAMIĄ</text>
    </g>
    <!-- ząbek papieru: drobne jasne i ciemne ziarno na całości -->
    <rect width="${PLAKAT_W}" height="${PLAKAT_H}" fill="#fff" filter="url(#pl-papier)" opacity=".55"/>
  </g>
</defs>`;
