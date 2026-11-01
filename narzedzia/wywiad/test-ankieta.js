// Testy ankiety od AI: node narzedzia/wywiad/test-ankieta.js
'use strict';
var assert = require('assert');
var A = require('./ankieta.js');
var S = require('./silnik.js');
var ok = 0;
function t(nazwa, fn) { fn(); ok++; console.log('ok  ' + nazwa); }

var surowy = JSON.stringify(require('./przyklad-ankieta-ai.js'));

t('przykład wczytuje się bez błędów', function () {
  var r = A.zAnkiety(surowy);
  assert.deepStrictEqual(r.bledy, []);
  assert.strictEqual(r.bank.pytania[0].id, 'opis');
  assert.strictEqual(r.kod, 'DEMO-AI');
});

t('wklejony z czatu blok ```json też działa', function () {
  var r = A.zAnkiety('Oto ankieta:\n```json\n' + surowy + '\n```\nPowodzenia');
  assert.deepStrictEqual(r.bledy, []);
});

t('pytania idą w kolejności pliku, a „gdy” ukrywa pytanie', function () {
  var r = A.zAnkiety(surowy), B = r.bank;
  var h = [{ id: 'opis', wartosc: r.opis }];
  assert.strictEqual(S.nastepne(B, h).pytanie.id, 'teraz_bol');
  h.push({ id: 'teraz_bol', wartosc: 5 });
  h.push({ id: 'goraczka', wartosc: 'nie' });
  assert.strictEqual(S.nastepne(B, h).pytanie.id, 'zoltaczka', 'temperatura pominięta bez gorączki');
});

t('flaga 112 z ankiety: gorączka + żółtaczka', function () {
  var B = A.zAnkiety(surowy).bank;
  var h = [{ id: 'opis', wartosc: 'boli brzuch' }, { id: 'goraczka', wartosc: 'goraczka' }, { id: 'temperatura', wartosc: 38.6 }, { id: 'zoltaczka', wartosc: ['oczy', 'mocz'] }];
  var f = S.przelicz(B, h).flagi;
  assert.strictEqual(f[0].poziom, '112');
  assert.ok(f.some(function (x) { return /Charcota/.test(x.dlaLekarza); }));
});

t('wbudowane flagi nadal działają na opisie', function () {
  var B = A.zAnkiety(surowy).bank;
  var f = S.przelicz(B, [{ id: 'opis', wartosc: 'Nagle zrobiło mi się słabo, gniecie mnie w klatce i ból idzie do lewej ręki, jestem cały spocony.' }]).flagi;
  assert.ok(f.some(function (x) { return x.poziom === '112'; }), 'oczekiwano 112 z opisu');
});

t('błędny plik: czytelne błędy, nic się nie wykonuje', function () {
  var r = A.zAnkiety({ format: 'ms-ankieta-1', pytania: [{ id: 'a', typ: 'jeden', tekst: 'X?', opcje: [{ w: 'tak', t: 'Tak' }] , gdy: { pytanie: 'brak' } }], flagi: [{ poziom: 'zle' }] });
  assert.ok(r.bledy.length >= 3, r.bledy.join('; '));
  assert.ok(!r.bank);
  assert.ok(A.zAnkiety('nie json').bledy.length === 1);
  assert.ok(A.zAnkiety({ format: 'inny' }).bledy[0].indexOf('format') !== -1);
});

t('eksport zawiera opis, źródło AI i odpowiedzi', function () {
  var r = A.zAnkiety(surowy);
  var h = [{ id: 'opis', wartosc: r.opis }, { id: 'teraz_bol', wartosc: 6 }, { id: 'goraczka', wartosc: 'nie' }];
  var md = S.doMarkdown(r.bank, h, { kod: 'DEMO-AI' });
  assert.ok(/przygotowana przez Konsylium AI/.test(md));
  assert.ok(/P: Jak silny jest ból w tej chwili\?  O: 6\/10/.test(md));
  assert.ok(/łopatkę/.test(md));
});

t('krok 1: bank opisu kończy się po opisie, prośba ma opis i analizę', function () {
  var B = A.bankOpisu();
  var h = [];
  assert.strictEqual(S.nastepne(B, h).pytanie.id, 'opis');
  h.push({ id: 'opis', wartosc: 'Od wczoraj boli mnie brzuch po tłustym jedzeniu. Mam 54 lata.' });
  assert.strictEqual(S.nastepne(B, h).pytanie, null);
  var p = A.doProsby(B, h, { kod: 'ABC-123' });
  assert.ok(/ms-ankieta-1/.test(p) && /ABC-123/.test(p) && /tłustym/.test(p) && /wiek: 54/.test(p), p);
});

t('flaga bezwarunkowa, elastyczny limit, odpowiada opiekun (ankieta zmian 1.11)', function () {
  var d = JSON.parse(surowy);
  d.flagi = (d.flagi || []).concat([{ poziom: 'pilne', bezwarunkowa: true, dlaLekarza: 'Opis: najgorszy ból głowy w życiu' }]);
  d.respondent = { kto: 'opiekun', opis: 'córka' };
  var r = A.zAnkiety(d);
  assert.deepStrictEqual(r.bledy, []);
  var st = S.przelicz(r.bank, [{ id: 'opis', wartosc: r.opis }]);
  assert.ok(st.flagi.some(function (f) { return /najgorszy ból głowy/.test(f.dlaLekarza); }), 'flaga bezwarunkowa zapala się od razu');
  assert.strictEqual(r.bank.respondent.opis, 'córka');
  var duzo = JSON.parse(surowy); duzo.flagi = [];
  for (var i = 0; duzo.pytania.length < 72; i++) duzo.pytania.push({ id: 'x' + i, typ: 'jeden', tekst: 'Pytanie ' + i, opcje: [{ w: 'tak', t: 'Tak' }, { w: 'nie', t: 'Nie' }] });
  assert.ok(duzo.pytania.length > 60 && duzo.pytania.length <= 80);
  assert.deepStrictEqual(A.zAnkiety(duzo).bledy, [], 'ponad 60 pytań dozwolone (do 80)');
});

console.log('\n' + ok + ' testów przeszło.');
