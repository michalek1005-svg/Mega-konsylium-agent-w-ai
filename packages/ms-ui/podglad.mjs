// Buduje podglad.html: wszystkie elementy ms-ui w trybie jasnym i ciemnym obok siebie (do porównywania zrzutów).
// Uruchomienie: node packages/ms-ui/podglad.mjs  [--wariant lawenda]  → packages/ms-ui/podglad.html (offline, bez sieci)
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { logoDataUrl } from './logo.js';

const tu = dirname(fileURLToPath(import.meta.url));
const czytaj = (f) => readFileSync(join(tu, f), 'utf8');
const wariant = process.argv.includes('--wariant') ? process.argv[process.argv.indexOf('--wariant') + 1] : '';
// tryby obok siebie: selektory motywu przeniesione z <html> na planszę (tylko w podglądzie)
const naPlansze = (t) => t.replace(/html\[data-motyw="ciemny"\]/g, '.plansza[data-motyw="ciemny"]').replace(/:root\s*\{/g, ':root, .plansza[data-motyw="jasny"] {');
const css = naPlansze(czytaj('tokeny.css') + czytaj('komponenty.css') + (wariant ? czytaj(`warianty/${wariant}.css`) : ''));
const ikony = czytaj('ikony.svg').replace(/<metadata>[\s\S]*?<\/metadata>/g, '').replace(/\s+xmlns:c2pa="[^"]*"/g, '');
const font = existsSync(join(tu, 'czcionki', 'plus-jakarta-sans.css')) ? czytaj('czcionki/plus-jakarta-sans.css') : '';
const IK = [['wywiad', 'Wywiad z pacjentem'], ['anonimizator', 'Anonimizator badań'], ['pokoj', 'Pokój lekarski'], null, ['folder', 'Folder Konsylium'], ['ipad', 'iPad'], ['powiadomienia', 'Powiadomienia'], ['motyw', 'Motyw']];

const plansza = (motyw) => `
<section class="plansza" data-motyw="${motyw}">
  <div class="scena"></div>
  <nav class="pasek" aria-label="Pasek ikon">${IK.map((x, n) => x ? `<button type="button" title="${x[1]}"${n === 2 ? ' aria-current="page"' : ''}><svg><use href="#i-${x[0]}"/></svg></button>` : '<div class="kreska"></div>').join('')}</nav>
  <div class="loga">
    <figure><img src="${logoDataUrl('K', motyw)}" width="48" height="51" alt="K"><figcaption>K · Konsylium</figcaption></figure>
    <figure><img src="${logoDataUrl('N', motyw)}" width="48" height="51" alt="N"><figcaption>N · Nawigator (tymczasowe N)</figcaption></figure>
  </div>
  <div class="tafla-glowna">
    <p class="nk-label">Tryb ${motyw}${wariant ? ' · wariant ' + wariant : ''}</p>
    <h2>Szklana tafla i panel</h2>
    <div class="panel">
      <p class="nk-label">Przyciski</p>
      <div class="rzad"><button class="nk-button" type="button">Zwykły</button><button class="nk-button nk-on" type="button">Aktywny</button><button class="nk-button" type="button" disabled>Wyłączony</button></div>
      <p class="nk-label odstep">Pole</p>
      <textarea class="nk-manual" rows="2" placeholder="Jedno zdanie…"></textarea>
      <p class="nk-status">Zapisano</p>
      <p class="nk-muted">Tekst pomocniczy w kolorze --mut.</p>
      <p class="nk-label odstep">Kolory</p>
      <div class="rzad probki">${['petrol', 'ink', 'mut', 'on', 'alarm', 'bg-viewport'].map((k) => `<span><i style="background:var(--${k})"></i>--${k}</span>`).join('')}</div>
    </div>
    <div class="stan-rog"><i></i>Offline · ms-ui ${czytaj('WERSJA').trim()}</div>
  </div>
</section>`;

const html = `<!doctype html>
<html lang="pl" data-motyw="jasny"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data:; font-src data:">
<title>ms-ui · podgląd</title>
<style>${font}${css}
*, *::before, *::after { box-sizing: border-box; }
.plansza[data-motyw="jasny"] .loga img { filter: contrast(1.2) drop-shadow(0 1px 2px rgba(10,54,52,.4)); }
html, body { margin: 0; background: #888; font-family: 'Plus Jakarta Sans Variable', 'Segoe UI', system-ui, sans-serif; }
.plansze { display: grid; grid-template-columns: 1fr 1fr; min-height: 100vh; }
.plansza { position: relative; overflow: hidden; min-height: 640px; color: var(--ink); background: var(--bg-viewport); isolation: isolate; }
.plansza .scena { position: absolute; inset: 0; background: var(--scene); z-index: -2; }
.plansza .scena::after { content: ""; position: absolute; inset: 0; background: var(--grain); opacity: .16; mix-blend-mode: soft-light; }
.plansza[data-motyw="ciemny"] .scena::after { opacity: .08; }
.pasek { position: absolute; left: 24px; top: 50%; transform: translateY(-50%); display: flex; flex-direction: column; gap: 6px; padding: 8px; border-radius: 24px;
  background: var(--wcisk-tlo); backdrop-filter: blur(12px); border: 1px solid var(--nav-obrys); box-shadow: 8px 8px 16px var(--wcisk-cien), -8px -8px 16px var(--wcisk-swiatlo); }
.pasek button { width: 40px; height: 40px; border-radius: 50%; border: 0; background: transparent; color: var(--mut); display: grid; place-items: center; cursor: pointer; }
.pasek button svg { width: 18px; height: 18px; }
.pasek button[aria-current="page"] { background: var(--wcisk-on-tlo); box-shadow: var(--wcisk-on-cien); color: var(--ink); }
.pasek .kreska { height: 1px; margin: 4px 8px; background: var(--nav-obrys); }
.loga { position: absolute; left: 23px; top: 12px; display: flex; gap: 18px; }
.loga figure { margin: 0; display: flex; align-items: center; gap: 8px; font-size: 11px; color: var(--mut); }
.tafla-glowna { position: absolute; left: 100px; right: 24px; top: 84px; bottom: 24px; border-radius: 44px; padding: 26px 30px;
  background: var(--tafla); box-shadow: var(--tafla-cien); backdrop-filter: blur(26px) saturate(140%); }
.tafla-glowna h2 { margin: 0 0 14px; font-size: 20px; }
.panel { background: var(--panel); box-shadow: var(--panel-cien); border-radius: 22px; padding: 18px 20px; }
.rzad { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.probki span { display: inline-flex; align-items: center; gap: 6px; font-size: 11px; color: var(--mut); }
.probki i { width: 18px; height: 18px; border-radius: 6px; box-shadow: inset 0 0 0 1px rgba(127,127,127,.3); }
.stan-rog { position: absolute; left: 30px; bottom: 18px; font-size: 12px; color: var(--mut); display: flex; align-items: center; gap: 7px; }
.stan-rog i { width: 8px; height: 8px; border-radius: 50%; background: #3fbf8a; }
@media (max-width: 1100px) { .plansze { grid-template-columns: 1fr; } }
</style></head>
<body>${ikony}<main class="plansze">${plansza('jasny')}${plansza('ciemny')}</main></body></html>`;

if (/https?:\/\//.test(html.replace(/xmlns(:\w+)?="http:\/\/www\.w3\.org\/[^"]*"/g, ''))) throw new Error('podgląd ma adres sieciowy');
const wyj = join(tu, wariant ? `podglad-${wariant}.html` : 'podglad.html');
writeFileSync(wyj, html);
console.log('Zbudowano', wyj);
