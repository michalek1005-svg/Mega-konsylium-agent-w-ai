import { test } from 'node:test';
import assert from 'node:assert/strict';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { zbudujScenariusz, rola, utnij, pierwszeZdanie, ROLE } from '../src/scenariusz.mjs';
import { wczytajSprawe } from './pomoc.mjs';

const tu = dirname(fileURLToPath(import.meta.url));
const sprawa = (n) => zbudujScenariusz(wczytajSprawe(join(tu, 'fixtura', n)), n);

test('rozpoznaje różne zapisy ról', () => {
  assert.equal(rola('poz-pragmatyk'), 'poz_pragmatyk');
  assert.equal(rola('lekarz-bayes'), 'bayes');
  assert.equal(rola('najgorszy-scenariusz'), 'najgorszy_scenariusz');
  assert.equal(rola('zastepca_bezpieczenstwo'), 'z_bezpieczenstwo');
  assert.equal(rola('R2'), 'R2');
  assert.equal(rola('coś innego'), null);
});

test('skróty: pełne słowa, nie tnie na „np.”', () => {
  assert.ok(utnij('a '.repeat(200), 50).length <= 50);
  assert.equal(pierwszeZdanie('Pasożyt, np. glista. Drugie zdanie.'), 'Pasożyt, np. glista.');
});

test('sprawa 2026-10-31-02: pełny przebieg od wywiadu do follow-upu', () => {
  const s = sprawa('2026-10-31-02');
  assert.deepEqual(s.sceny.map((x) => x.id),
    ['wywiad', 'triage', 'slepa', 'agregat', 'runda1', 'projekt', 'rezydenci', 'sprawdzenie', 'odpowiedz', 'final', 'followup']);
  assert.equal(s.tryb, 'PELNY');
  assert.equal(s.tablica.ranking[0].nazwa, 'pozostałość tabletki metforminy xr');
  assert.equal(s.tablica.pilnosc, 4);
  const slepa = s.sceny.find((x) => x.id === 'slepa');
  assert.equal(slepa.wypowiedzi.length, 6, 'sześciu lekarzy w ślepej turze');
  const rez = s.sceny.find((x) => x.id === 'rezydenci');
  assert.deepEqual(rez.wypowiedzi.map((w) => w.kto), ['R1', 'R2']);
});

test('każda wypowiedź ma znaną rolę i krótki dymek', () => {
  for (const n of ['2026-10-31-01', '2026-10-31-02']) {
    for (const sc of sprawa(n).sceny) {
      assert.ok(sc.temat, `${n}/${sc.id}: temat`);
      for (const w of sc.wypowiedzi) {
        assert.ok(ROLE[w.kto], `${n}/${sc.id}: rola ${w.kto}`);
        assert.ok(w.skrot.length > 3 && w.skrot.length <= 150, `${n}/${sc.id}/${w.kto}: dymek ${w.skrot.length}`);
        assert.doesNotMatch(w.skrot, /\*\*/, 'bez markdownu w dymku');
      }
    }
  }
});

test('sprawa 01: dwie rundy i spór na tablicy', () => {
  const s = sprawa('2026-10-31-01');
  const r1 = s.sceny.find((x) => x.id === 'runda1');
  assert.ok(s.sceny.find((x) => x.id === 'runda2'));
  assert.match(r1.temat, /^Spór: Główna oś: kolka/);
});

test('zdarzenia „wypowiedz” w _log.jsonl mają pierwszeństwo (tryb na żywo)', () => {
  const log = [
    { ts: '2026-11-01T10:00:00Z', zdarzenie: 'wypowiedz', rola: 'ordynator', faza: 'Wywiad', temat: 'Ból w klatce od rana', skrot: 'Zaczynam wywiad.' },
    { ts: '2026-11-01T10:05:00Z', zdarzenie: 'wypowiedz', rola: 'lekarz-bayes', faza: 'Ślepa tura', skrot: 'ACS p 0,30.' },
    { ts: '2026-11-01T10:05:10Z', zdarzenie: 'wypowiedz', rola: 'najgorszy-scenariusz', faza: 'Ślepa tura', skrot: 'Weto: pilność 1.' },
  ].map((x) => JSON.stringify(x)).join('\n');
  const s = zbudujScenariusz({ '_log.jsonl': log }, 'X');
  assert.equal(s.zrodlo, 'log');
  assert.deepEqual(s.sceny.map((x) => x.tytul), ['Wywiad', 'Ślepa tura']);
  assert.deepEqual(s.sceny[1].wypowiedzi.map((w) => w.kto), ['bayes', 'najgorszy_scenariusz']);
  assert.equal(s.sceny[0].temat, 'Ból w klatce od rana');
});

test('pusty folder daje pusty scenariusz zamiast błędu', () => {
  assert.equal(zbudujScenariusz({}, 'pusty').sceny.length, 0);
});
