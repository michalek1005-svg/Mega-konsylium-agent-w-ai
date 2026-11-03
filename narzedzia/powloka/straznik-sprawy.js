'use strict';
/*
 * Strażnik najnowszej sprawy (dla powiadomień w tle na iPadzie): co kilka sekund patrzy na sprawy/<najnowsza>/
 * i zgłasza trzy zdarzenia, te same co Pokój lekarski na ekranie:
 *   • pytanie  – {"zdarzenie":"pytanie","id","tekst"} w _log.jsonl (skrypty/pytanie_lekarza.py), bez odpowiedzi,
 *   • alarm    – {"zdarzenie":"alarm","tekst"} w _log.jsonl (skrypty/alarm.py), bez "koniec",
 *   • wnioski  – pojawienie się 09-FINAL.md (pierwsza linia REKOMENDACJA jako treść).
 * Działa po stronie komputera, więc budzi iPada także wtedy, gdy na iPadzie nic nie jest otwarte.
 * Zdarzenia sprzed włączenia strażnika nie są zgłaszane (tylko nowe).
 */
const fs = require('node:fs');
const path = require('node:path');

const utnij = (t, n) => { t = String(t || '').replace(/\s+/g, ' ').trim(); return t.length > n ? t.slice(0, n - 1).replace(/\s+\S*$/, '') + '…' : t; };

function najnowszaSprawa(korzen) {
  let lista = [];
  try { lista = fs.readdirSync(path.join(korzen, 'sprawy'), { withFileTypes: true }).filter((d) => d.isDirectory() && !d.name.startsWith('_') && !d.name.startsWith('.')).map((d) => d.name); } catch { return null; }
  // jak Pokój: najświeższy _log.jsonl, a przy remisie nazwa (daty w nazwach)
  let best = null, bestT = -1;
  for (const n of lista) {
    let t = 0; try { t = fs.statSync(path.join(korzen, 'sprawy', n, '_log.jsonl')).mtimeMs; } catch { try { t = fs.statSync(path.join(korzen, 'sprawy', n)).mtimeMs; } catch {} }
    if (t > bestT || (t === bestT && n > best)) { best = n; bestT = t; }
  }
  return best;
}

function zdarzeniaSprawy(kat) {
  const out = [];
  let log = '';
  try { log = fs.readFileSync(path.join(kat, '_log.jsonl'), 'utf8'); } catch {}
  const odp = new Set(); const pytania = []; let alarm = null;
  for (const l of log.split('\n')) {
    if (!l.trim()) continue;
    let z; try { z = JSON.parse(l); } catch { continue; }
    if (z.zdarzenie === 'alarm') alarm = z.koniec ? null : String(z.tekst || 'Podejrzenie stanu zagrożenia życia – rozważ 112 teraz');
    else if (z.zdarzenie === 'pytanie' && z.id && z.tekst) pytania.push(z);
    else if (z.zdarzenie === 'wypowiedz' && z.pytanie_id) odp.add(String(z.pytanie_id));
  }
  // odpowiedzi z Pokoju trafiają też do uwagi-lekarza.jsonl
  try { for (const l of fs.readFileSync(path.join(kat, 'uwagi-lekarza.jsonl'), 'utf8').split('\n')) { try { const z = JSON.parse(l); if (z.pytanie_id) odp.add(String(z.pytanie_id)); } catch {} } } catch {}
  if (alarm) out.push({ klucz: 'alarm:' + alarm, tytul: 'Alarm 112', tekst: alarm });
  for (const p of pytania) if (!odp.has(String(p.id))) out.push({ klucz: 'pytanie:' + p.id, tytul: 'Konsylium pyta Ciebie', tekst: String(p.tekst) });
  let final = null; try { final = fs.readFileSync(path.join(kat, '09-FINAL.md'), 'utf8'); } catch {}
  if (final) {
    const rek = (final.match(/^\**REKOMENDACJA\**\s*:\s*(.+)$/m) || [])[1];
    out.push({ klucz: 'wnioski:' + final.length, tytul: 'Wnioski konsylium gotowe', tekst: rek || 'Otwórz Pokój lekarski.' });
  }
  return out;
}

/**
 * @param {{ korzen: () => string|null, zglos: (z: {sprawa, tytul, tekst, tag}) => void, co?: number }} o
 * @returns {{ stop(), sprawdz() }}
 */
function utworzStraznika(o) {
  const widziane = new Set();
  let pierwszy = true;
  function sprawdz() {
    const k = o.korzen(); if (!k) return;
    const s = najnowszaSprawa(k); if (!s) return;
    for (const z of zdarzeniaSprawy(path.join(k, 'sprawy', s))) {
      const klucz = s + '|' + z.klucz;
      if (widziane.has(klucz)) continue;
      widziane.add(klucz);
      if (!pierwszy) o.zglos({ sprawa: s, tytul: z.tytul, tekst: utnij(z.tekst, 180), tag: (z.klucz.split(':')[0] + '-' + s).slice(0, 32) });
    }
    pierwszy = false;
  }
  try { sprawdz(); } catch {}
  const t = setInterval(() => { try { sprawdz(); } catch {} }, o.co || 4000);
  if (t.unref) t.unref();
  return { stop: () => clearInterval(t), sprawdz };
}

module.exports = { utworzStraznika, zdarzeniaSprawy, najnowszaSprawa };
