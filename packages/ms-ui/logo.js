// Logo marki MS: ta sama forma („Grawer wklęsły”, wariant 7b z Nawigatora), litera jako parametr.
// Użycie w buildzie (Node):  import { logoSvg } from '../../packages/ms-ui/logo.js';
//   logoSvg('K', 'jasny')  → string SVG 62×66 (do wbudowania albo do eksportu PNG @3x jak powloka/zasoby/export.js)
// Decyzja Michała 3.11.2026: obok litery NIE ma znaku „MS” (opcja ms:true zostaje tylko do porównań).
// Zmiany wyglądu marki tylko przez Michała.
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const KATALOG = join(dirname(fileURLToPath(import.meta.url)), 'logo');

// Ścieżki liter w układzie generatora Nawigatora (płótno 760×838): A = pień, B = pozostałe kreski,
// A_RDZEN = pień skrócony dla cienkiej jasnej linii w środku.
export const LITERY = {
  K: { nazwa: 'Konsylium AI', A: 'M66.5 764.0 L66.5 74.0', A_RDZEN: 'M66.5 700.0 L66.5 74.0',
       B: 'M620.0 74.0 L120.0 470.0 M320.0 312.0 L660.0 764.0' },             // = powloka/zasoby/norm.json
  // N: TYMCZASOWE, narysowane tu w tym samym układzie. Przy kroku 2 (Nawigator) podmienić na ścieżki z
  // repo Nawigatora (makiety/logo-lod/generator, lib/logo-n.ts), żeby N było co do piksela jak dziś.
  N: { nazwa: 'Nawigator Medyczny', A: 'M66.5 764.0 L66.5 74.0', A_RDZEN: 'M66.5 700.0 L66.5 74.0',
       B: 'M66.5 74.0 L660.0 764.0 L660.0 74.0' },
};

export function logoSvg(litera = 'K', motyw = 'jasny', { ms = false, nazwa } = {}) {
  const l = LITERY[litera];
  if (!l) throw new Error(`logoSvg: brak litery ${litera} w LITERY (dopisz ścieżki A, A_RDZEN, B)`);
  const m = motyw === 'ciemny' ? 'ciemny' : 'jasny';
  let s = readFileSync(join(KATALOG, `szablon-${m}.svg`), 'utf8');
  s = s.replace(/<metadata>[\s\S]*?<\/metadata>/g, '').replace(/\s+xmlns:c2pa="[^"]*"/g, '');   // metadane dopisywane przez niektóre dyski
  s = s.replace(/<!--MS\{([\s\S]*?)\}MS-->/g, ms ? '$1' : '');
  const id = (litera + m[0]).toLowerCase();                                  // np. kj, kc, nj, nc – unikalne id filtrów
  return s.replaceAll('{{ID}}', id).replaceAll('{{A_RDZEN}}', l.A_RDZEN).replaceAll('{{A}}', l.A)
    .replaceAll('{{B}}', l.B).replaceAll('{{NAZWA}}', nazwa || l.nazwa);
}

// Wbudowanie w HTML jako <img> (bez sieci): <img class="jasne" src="${logoDataUrl('K','jasny')}">
export const logoDataUrl = (litera, motyw, opcje) => 'data:image/svg+xml;base64,' + Buffer.from(logoSvg(litera, motyw, opcje)).toString('base64');
