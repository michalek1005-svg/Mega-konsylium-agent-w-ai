// Testy silnika wywiadu: node narzedzia/wywiad/test-silnik.js
'use strict';
const assert = require('assert');
const S = require('./silnik.js');
const bank = require('./pytania.js');
const przyklady = require('./przyklady.js');
const A = require('./analiza.js');

// Odtwarza scenariusz: odpowiada na pytania, które silnik sam wybiera.
function przejdz(odp) {
  const historia = [];
  for (let i = 0; i < 200; i++) {
    const { pytanie } = S.nastepne(bank, historia);
    if (!pytanie) break;
    const v = Object.prototype.hasOwnProperty.call(odp, pytanie.id) ? odp[pytanie.id] : S.NIE_WIEM;
    historia.push({ id: pytanie.id, wartosc: v });
  }
  return { historia, stan: S.przelicz(bank, historia) };
}
const ids = (h) => h.map((x) => x.id);
let ok = 0;
function test(nazwa, fn) { fn(); ok++; console.log('ok  ' + nazwa); }

test('bank: unikalne id i znane moduły', () => {
  const seen = new Set();
  const mod = new Set(bank.moduly.map((m) => m.id));
  bank.pytania.forEach((q) => {
    assert(!seen.has(q.id), 'duplikat ' + q.id); seen.add(q.id);
    assert(mod.has(q.modul), 'nieznany moduł ' + q.modul);
    if (q.typ === 'jeden' || q.typ === 'wiele') assert(q.opcje && q.opcje.length, 'brak opcji ' + q.id);
  });
});

test('punkt wyjścia: opis własnymi słowami, potem powód zgłoszenia', () => {
  assert.strictEqual(S.nastepne(bank, []).pytanie.id, 'opis');
  assert.strictEqual(S.nastepne(bank, [{ id: 'opis', wartosc: '' }]).pytanie.id, 'powod');
});

test('analiza opisu: moduły, fakty, podpowiedzi i zaprzeczenia', () => {
  const a = A.analizuj(przyklady.brzuch.odpowiedzi.opis);
  assert.deepStrictEqual(a.moduly, ['brzuch']);
  assert.strictEqual(a.fakty.b_posilki, 'tak');
  assert.strictEqual(a.fakty.b_wymioty, 'tak');
  assert.strictEqual(a.fakty.wiek, 54);
  assert.strictEqual(a.fakty.plec, 'k');
  assert.strictEqual(a.fakty.od_kiedy, 'd1');
  assert.deepStrictEqual(a.podpowiedzi.b_miejsce, ['prawe_pz']);
  assert.deepStrictEqual(a.podpowiedzi.b_promien, ['lopatka']);
  const b = A.analizuj('Boli brzuch, bez gorączki, nie wymiotuję.');
  assert.strictEqual(b.fakty.b_goraczka, 'nie');
  assert.strictEqual(b.fakty.b_wymioty, 'nie');
  assert(!b.moduly.includes('goraczka'));
  const c = A.analizuj('Mam kaszel, ale nie mam duszności.');
  assert(!c.podpowiedzi.k_objawy, 'zaprzeczona duszność nie może być podpowiedzią');
});

test('pytania z odpowiedzią w opisie są pomijane, reszta zostaje', () => {
  const h = [{ id: 'opis', wartosc: przyklady.brzuch.odpowiedzi.opis }, { id: 'powod', wartosc: ['brzuch'] }];
  const st = S.przelicz(bank, h);
  const kand = st.kandydaci.map((q) => q.id);
  ['b_posilki', 'b_wymioty', 'wiek', 'plec', 'od_kiedy'].forEach((id) => assert(!kand.includes(id), id + ' powinno być pominięte'));
  ['b_twardy', 'b_miejsce', 'nasilenie'].forEach((id) => assert(kand.includes(id), id + ' powinno zostać'));
  assert(st.zOpisu.b_posilki);
});

test('czerwona flaga od razu po opisie, jeszcze przed pytaniami', () => {
  const st = S.przelicz(bank, [{ id: 'opis', wartosc: przyklady.klatka.odpowiedzi.opis }]);
  assert(st.flagi.some((f) => f.id === 'ozw'), 'opis ucisku z promieniowaniem do lewej ręki i potami = OZW');
});

test('ból brzucha (jak PRZYKLAD-001): dopytuje o drogi żółciowe, bez flag 112', () => {
  const { historia, stan } = przejdz(przyklady.brzuch.odpowiedzi);
  const h = ids(historia);
  assert(stan.o.b_posilki === 'tak' && h.includes('b_zoltaczka'));
  assert(!h.some((id) => id.startsWith('k_') || id.startsWith('g_')), 'nie powinno pytać o klatkę/głowę');
  assert(h.indexOf('b_twardy') < h.indexOf('b_charakter'), 'zagrożenia przed szczegółami');
  assert(!stan.flagi.some((f) => f.poziom === '112'));
  assert(h.includes('b_ciaza'), 'kobieta 54 l.: pytanie o ciążę');
});

test('ból w klatce z potami: flaga OZW 112', () => {
  const { stan } = przejdz(przyklady.klatka.odpowiedzi);
  assert(stan.flagi.some((f) => f.id === 'ozw' && f.poziom === '112'));
});

test('mężczyzna nie dostaje pytania o ciążę', () => {
  const { historia } = przejdz({ ...przyklady.brzuch.odpowiedzi, opis: '', plec: 'm' });
  assert(!ids(historia).includes('b_ciaza'));
});

test('kilka powodów naraz łączy moduły', () => {
  const { historia } = przejdz({ powod: ['glowa', 'goraczka'], wiek: 30, plec: 'k', g_kark: 'tak', t_temp: 38.6 });
  const h = ids(historia);
  assert(h.includes('g_nagly') && h.includes('t_wysypka'));
  const { stan } = przejdz({ powod: ['glowa', 'goraczka'], wiek: 30, plec: 'k', g_kark: 'tak', t_temp: 38.6 });
  assert(stan.flagi.some((f) => f.id === 'opony'));
});

test('wybór AI spoza listy kandydatów jest odrzucany', () => {
  const obce = { id: 'zmyslone', tekst: 'Pytanie spoza banku' };
  const { pytanie } = S.nastepne(bank, [], () => obce);
  assert.strictEqual(pytanie.id, 'opis');
});

test('eksport 01-wywiad.md: format Konsylium, bez hipotezy', () => {
  const { historia } = przejdz(przyklady.brzuch.odpowiedzi);
  const md = S.doMarkdown(bank, historia, { kod: 'TEST' });
  assert(md.includes('## Pytania i odpowiedzi'));
  assert(md.includes('## NIEZNANE'));
  assert(/^P: .+  O: .+$/m.test(md));
  assert(!/hipotez/i.test(md), 'eksport nie może zawierać hipotezy');
  assert(md.includes('(z opisu pacjenta)'), 'odpowiedzi wzięte z opisu są oznaczone');
});

console.log(`\n${ok} testów przeszło.`);
