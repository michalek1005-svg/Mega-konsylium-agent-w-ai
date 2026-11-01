import { test } from 'node:test';
import assert from 'node:assert/strict';
import { wykryj, peselPoprawny, wykryjKodyKreskowe, tekstPoAnonimizacji, etykietyWiersza, wiersze } from '../src/wykrywanie.js';

// Układ wiersza jak w wydruku: słowa o szerokości ~6 pt na znak, wysokość 10 pt
function strona(linie, nr = 1) {
  const slowa = [];
  linie.forEach((l, i) => {
    const y = 40 + i * 16;
    // „|” w tekście = duży odstęp kolumnowy
    let x = 30;
    for (const kol of l.split('|')) {
      for (const t of kol.trim().split(/\s+/).filter(Boolean)) {
        slowa.push({ t, x, y, w: t.length * 6, h: 10 });
        x += t.length * 6 + 4;
      }
      x += 120;
    }
  });
  return { nr, szer: 595, wys: 842, slowa };
}
const teksty = (p, kat) => p.filter((x) => !kat || x.kategoria === kat).map((x) => x.tekst);

// Dane FIKCYJNE (PESEL wygenerowany z poprawną sumą kontrolną, nie należy do nikogo znanego)
const PESEL = '85010112345';

test('PESEL: suma kontrolna', () => {
  assert.equal(peselPoprawny(PESEL), true);
  assert.equal(peselPoprawny('85010112349'), false);
  assert.equal(peselPoprawny('02270803624'), true); // urodzony w 2002 (miesiąc +20)
});

test('nagłówek wyniku w układzie Synevo', () => {
  const st = strona([
    'SYNEVO Laboratorium Medyczne',
    'Pacjent: KOWALSKI JAN | Data urodzenia: 01.01.1985 (40 lat)',
    'PESEL: ' + PESEL + ' | Płeć: M',
    'Adres: ul. Długa 15/3, 00-950 Warszawa',
    'Nr zlecenia: 1234567890 | Data pobrania: 12.10.2026 08:15',
    'Lekarz kierujący: lek. Anna Nowak | Zleceniodawca: Przychodnia Zdrowie',
    'Morfologia krwi',
    'Hemoglobina 14,2 g/dl 13,5 - 17,5',
    'Autoryzował: mgr Piotr Wiśniewski, diagnosta laboratoryjny',
  ]);
  const p = wykryj([st]);
  assert.deepEqual(teksty(p, 'pacjent'), ['KOWALSKI JAN']);
  assert.deepEqual(teksty(p, 'urodzenie'), ['01.01.1985']);
  assert.ok(teksty(p, 'pesel').includes(PESEL));
  assert.ok(teksty(p, 'adres').some((t) => t.includes('Długa')));
  assert.ok(teksty(p, 'zlecenie').includes('1234567890'));
  assert.ok(teksty(p, 'lekarz').some((t) => t.includes('Nowak')));
  assert.ok(teksty(p, 'lekarz').some((t) => t.includes('Przychodnia')));
  assert.ok(teksty(p, 'personel').some((t) => t.includes('Wiśniewski')));
  assert.deepEqual(teksty(p, 'daty'), ['12.10.2026 08:15']);
  // wyniki badań i płeć zostają
  assert.ok(!p.some((x) => /Hemoglobina|14,2|17,5|Morfologia/.test(x.tekst)));
  assert.ok(!p.some((x) => x.tekst === 'M'));
});

test('wartość pod etykietą (w następnym wierszu)', () => {
  const st = strona(['Imię i nazwisko:', 'Maria Zielińska', 'Glukoza 92 mg/dl']);
  assert.deepEqual(teksty(wykryj([st]), 'pacjent'), ['Maria Zielińska']);
});

test('powtórzenia nazwiska pacjenta na kolejnych stronach', () => {
  const s1 = strona(['Pacjent: Kowalski Jan']);
  const s2 = strona(['Wynik dla: Kowalski Jan, strona 2'], 2);
  const p = wykryj([s1, s2]);
  assert.ok(p.some((x) => x.strona === 2 && x.tekst.startsWith('Kowalski')));
});

test('frazy użytkownika bez względu na wielkość liter i ogonki', () => {
  const st = strona(['Uwagi: pacjentka zgłosiła się z mężem Zbigniewem ŁUCZAK']);
  const p = wykryj([st], { frazy: ['luczak', 'Zbigniewem'] });
  assert.deepEqual(teksty(p, 'fraza').sort(), ['Zbigniewem', 'ŁUCZAK']);
});

test('telefon, e-mail, kod dostępu', () => {
  const st = strona(['Tel. 600 700 800 e-mail: jan.k@example.com', 'Kod dostępu: AB12CD']);
  const p = wykryj([st]);
  assert.ok(teksty(p, 'adres').some((t) => t.includes('600')));
  assert.ok(teksty(p, 'adres').some((t) => t.includes('@')));
  assert.ok(teksty(p, 'zlecenie').includes('AB12CD'));
});

test('wyniki liczbowe nie są brane za numery', () => {
  const st = strona(['Leukocyty 6,45 tys/µl 4,00 - 10,00', 'PLT 245 tys/µl', 'TSH 1,234 µIU/ml 0,270 - 4,200']);
  assert.equal(wykryj([st]).length, 0);
});

test('etykiety: „ur.” z kropką działa, „pacjent” w środku zdania bez dwukropka nie', () => {
  const l = wiersze(strona(['ur. 01.02.1990']).slowa)[0];
  assert.equal(etykietyWiersza(l)[0].k, 'urodzenie');
  const st = strona(['Zalecenie: pacjent powinien powtórzyć badanie']);
  assert.equal(teksty(wykryj([st]), 'pacjent').length, 0);
});

test('kod kreskowy na obrazie', () => {
  const w = 400, h = 200;
  const g = new Uint8Array(w * h).fill(255);
  // paski 2–4 px w obszarze x 100–300, y 60–120
  let x = 100, k = 0;
  while (x < 300) { const sz = 2 + (k % 3); if (k % 2 === 0) for (let y = 60; y < 120; y++) for (let i = 0; i < sz; i++) g[y * w + x + i] = 0; x += sz; k++; }
  const r = wykryjKodyKreskowe(g, w, h);
  assert.equal(r.length, 1);
  assert.ok(r[0].x <= 100 && r[0].x + r[0].w >= 290 && r[0].y <= 60 && r[0].y + r[0].h >= 115);
  // pusta strona: nic
  assert.equal(wykryjKodyKreskowe(new Uint8Array(w * h).fill(255), w, h).length, 0);
});

test('tekst po anonimizacji', () => {
  const st = strona(['Pacjent: KOWALSKI JAN', 'Glukoza 92 mg/dl']);
  const p = wykryj([st]);
  const t = tekstPoAnonimizacji([st], p);
  assert.equal(t, 'Pacjent: [USUNIĘTO]\nGlukoza 92 mg/dl');
});

import { wykryjWTekscie, zanonimizujTekst } from '../src/wykrywanie.js';
test('zwykły tekst (wywiad): zakresy i podmiana', () => {
  const t = 'Pacjent: Jan Kowalski, PESEL 85010112345\nTel. 600 700 800. Od 3 dni gorączka 38,5 st. C.\nLekarz kierujący: lek. Anna Nowak';
  const z = wykryjWTekscie(t);
  const wynik = zanonimizujTekst(t, z);
  for (const x of ['Kowalski', '85010112345', '600 700 800', 'Nowak']) assert.ok(!wynik.includes(x), wynik);
  for (const x of ['gorączka 38,5', 'Od 3 dni']) assert.ok(wynik.includes(x), wynik);
  assert.ok(z.every((r) => t.slice(r.od, r.do) === r.tekst));
});

test('wypowiedź pacjenta: imię i nazwisko oraz adres bez etykiet formularza', () => {
  const t = 'Nazywam się Jan Kowalski, PESEL 85010112345. Mieszkam przy ul. Lipowej 7 m. 12. Od tygodnia mam kaszel.\n' +
    'Mam na imię Ewa. Jestem zmęczona od rana. Tu Anna Nowak, córka pacjentki.';
  const wynik = zanonimizujTekst(t, wykryjWTekscie(t));
  for (const x of ['Kowalski', 'Jan ', '85010112345', 'Lipowej', 'Ewa', 'Anna Nowak']) assert.ok(!wynik.includes(x), x + ' → ' + wynik);
  for (const x of ['Od tygodnia mam kaszel', 'Jestem zmęczona od rana']) assert.ok(wynik.includes(x), wynik);
});

test('słowa rodzajowe („pacjent”, „pacjenta”) nie są usuwane jako dane osobowe', () => {
  const t = '# Wywiad wstępny (ankieta pacjenta)\n### Tura 1 (pacjent, ankieta)\nP: Wiek  O: 64 (z opisu pacjenta)\n' +
    'Pacjentka zgłasza kaszel od dwóch dni.\nPacjent: Jan Kowalski\nPowtórnie: Kowalski, ankieta pacjenta.';
  const wynik = zanonimizujTekst(t, wykryjWTekscie(t));
  for (const x of ['(ankieta pacjenta)', '(pacjent, ankieta)', '(z opisu pacjenta)', 'Pacjentka zgłasza kaszel od dwóch dni.', 'ankieta pacjenta.']) assert.ok(wynik.includes(x), x + ' → ' + wynik);
  for (const x of ['Jan', 'Kowalski']) assert.ok(!wynik.includes(x), x + ' → ' + wynik);
});
