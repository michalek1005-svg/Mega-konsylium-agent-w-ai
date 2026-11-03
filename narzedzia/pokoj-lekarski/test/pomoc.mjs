import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
// czyta folder sprawy tak jak przeglądarka po „Wczytaj sprawę”
export function wczytajSprawe(katalog) {
  const pliki = {};
  const chodz = (d) => {
    for (const f of readdirSync(d)) {
      const p = join(d, f);
      if (statSync(p).isDirectory()) chodz(p);
      else if (/\.(md|json|jsonl)$/i.test(f)) pliki[relative(katalog, p).split('\\').join('/')] = readFileSync(p, 'utf8');
    }
  };
  chodz(katalog);
  return pliki;
}
