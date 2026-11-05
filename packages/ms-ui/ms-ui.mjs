// Wspólny pakiet wyglądu MS: buildy biorą CSS stąd (tokeny + komponenty, w tej kolejności).
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const KATALOG = dirname(fileURLToPath(import.meta.url));
export const WERSJA = readFileSync(join(KATALOG, 'WERSJA'), 'utf8').trim();
export function msUiCss() {
  const czytaj = (f) => readFileSync(join(KATALOG, f), 'utf8');
  return czytaj('tokeny.css') + czytaj('komponenty.css');
}
