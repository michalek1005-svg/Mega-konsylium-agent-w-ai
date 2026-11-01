/*
 * Ankieta od AI (MS · Wywiad z pacjentem)
 *
 * Przepływ w dwóch krokach:
 *  1. Pacjent pisze opis dolegliwości. Lekarz kopiuje go (po anonimizacji) do
 *     czatu Konsylium jako „prośbę o ankietę” (doProsby).
 *  2. Konsylium (AI) odpowiada plikiem JSON w formacie ms-ankieta-1
 *     (FORMAT-ANKIETY.md). Lekarz wczytuje go w aplikacji, a zAnkiety zamienia
 *     go na zwykły bank pytań, który prowadzi ten sam silnik.
 *
 * Plik od AI to wyłącznie dane: warunki „gdy” są opisane deklaratywnie
 * i tłumaczone tutaj na funkcje. Żaden kod z pliku nie jest wykonywany.
 * Wbudowane czerwone flagi (pytania.js) działają dalej na opisie pacjenta.
 */
(function (root) {
  'use strict';

  var FORMAT = 'ms-ankieta-1';
  var TYPY = ['jeden', 'wiele', 'skala', 'liczba', 'tekst'];
  var POZIOMY = ['112', 'pilne'];
  var P112 = 'Te objawy mogą oznaczać stan zagrożenia życia. Zadzwoń teraz pod numer 112. Nie czekaj na koniec ankiety.';
  var PILNE = 'Te objawy wymagają dziś oceny lekarza. Skontaktuj się z przychodnią lub nocną pomocą lekarską.';

  function bazowy() {
    return (typeof module !== 'undefined' && module.exports) ? require('./pytania.js') : root.BankWywiadu;
  }
  function silnik() {
    return (typeof module !== 'undefined' && module.exports) ? require('./silnik.js') : root.SilnikWywiadu;
  }

  // Bank kroku 1: tylko opis własnymi słowami. Analiza opisu i wbudowane flagi
  // działają, więc alarm 112 pojawi się już przy opisie, jeśli z niego wynika.
  function bankOpisu() {
    var B = bazowy();
    var opis = B.pytania.filter(function (q) { return q.id === 'opis'; })[0];
    return {
      analizuj: B.analizuj,
      wersja: B.wersja + ' · krok 1: opis dla AI',
      tryb: 'opis',
      moduly: [B.moduly[0]],
      pytania: [opis],
      flagi: B.flagi,
      zawszeNieznane: []
    };
  }

  // ── warunki deklaratywne → funkcje ──
  function zWarunku(w, ids, sciezka, bledy) {
    if (w == null) return null;
    if (typeof w !== 'object' || Array.isArray(w)) { bledy.push(sciezka + ': warunek musi być obiektem'); return null; }
    if (w.wszystkie || w.ktorekolwiek) {
      var lista = w.wszystkie || w.ktorekolwiek;
      if (!Array.isArray(lista) || !lista.length) { bledy.push(sciezka + ': pusta lista warunków'); return null; }
      var fns = lista.map(function (x, i) { return zWarunku(x, ids, sciezka + '[' + i + ']', bledy); });
      var wszystkie = !!w.wszystkie;
      return function (o, ma) {
        return wszystkie ? fns.every(function (f) { return f && f(o, ma); }) : fns.some(function (f) { return f && f(o, ma); });
      };
    }
    if (w.nie) {
      var f = zWarunku(w.nie, ids, sciezka + '.nie', bledy);
      return function (o, ma) { return !(f && f(o, ma)); };
    }
    if (typeof w.pytanie !== 'string') { bledy.push(sciezka + ': brak pola „pytanie”'); return null; }
    if (ids.indexOf(w.pytanie) === -1) { bledy.push(sciezka + ': nie ma pytania „' + w.pytanie + '”'); return null; }
    var id = w.pytanie;
    if (w.jest !== undefined) {
      var wart = Array.isArray(w.jest) ? w.jest.map(String) : [String(w.jest)];
      return function (o, ma) { return ma(o, id, wart); };
    }
    if (typeof w.min === 'number' || typeof w.max === 'number') {
      var min = typeof w.min === 'number' ? w.min : -Infinity, max = typeof w.max === 'number' ? w.max : Infinity;
      return function (o) { return typeof o[id] === 'number' && o[id] >= min && o[id] <= max; };
    }
    if (w.odpowiedziano) return function (o) { return o[id] !== undefined && o[id] !== null && o[id] !== '' && o[id] !== 'nw'; };
    bledy.push(sciezka + ': warunek potrzebuje „jest”, „min”/„max” albo „odpowiedziano”');
    return null;
  }

  function tekst(v, max) { return typeof v === 'string' && v.trim() && v.length <= (max || 400); }

  // Zamienia plik od AI na bank pytań. Zwraca { bank, opis, bledy }.
  function zAnkiety(dane) {
    var bledy = [];
    if (typeof dane === 'string') {
      var t = dane.trim();
      var blok = t.match(/```(?:json)?\s*([\s\S]*?)```/); // wklejone razem z blokiem kodu z czatu
      if (blok) t = blok[1];
      var i0 = t.indexOf('{'), i1 = t.lastIndexOf('}');
      if (i0 === -1 || i1 <= i0) return { bledy: ['To nie wygląda na ankietę: brak bloku JSON.'] };
      try { dane = JSON.parse(t.slice(i0, i1 + 1)); } catch (e) { return { bledy: ['Błąd w JSON: ' + e.message] }; }
    }
    if (!dane || dane.format !== FORMAT) return { bledy: ['Nieznany format pliku. Oczekiwano „' + FORMAT + '”.'] };
    if (!Array.isArray(dane.pytania) || !dane.pytania.length) return { bledy: ['Ankieta nie ma pytań.'] };
    // elastyczny limit (ankieta zmian 1.11): zwykle 8–20, tyle ile trzeba do zamknięcia czerwonych flag; twardo najwyżej 80
    if (dane.pytania.length > 80) bledy.push('Za dużo pytań (najwyżej 80).');

    var ids = dane.pytania.map(function (q) { return q && q.id; });
    var B = bazowy();
    var zajete = ['opis'];
    var pytania = [];
    dane.pytania.forEach(function (q, i) {
      var s = 'pytanie ' + (i + 1) + (q && q.id ? ' („' + q.id + '”)' : '');
      if (!q || typeof q.id !== 'string' || !/^[a-z0-9_]{1,40}$/.test(q.id)) { bledy.push(s + ': id tylko z małych liter, cyfr i _'); return; }
      if (zajete.indexOf(q.id) !== -1) { bledy.push(s + ': powtórzone id'); return; }
      zajete.push(q.id);
      if (TYPY.indexOf(q.typ) === -1) bledy.push(s + ': typ musi być jednym z ' + TYPY.join(', '));
      if (!tekst(q.tekst)) bledy.push(s + ': brak treści pytania');
      var opcje;
      if (q.typ === 'jeden' || q.typ === 'wiele') {
        if (!Array.isArray(q.opcje) || q.opcje.length < 2 || q.opcje.length > 12) bledy.push(s + ': od 2 do 12 opcji');
        else opcje = q.opcje.map(function (op, j) {
          if (!op || !tekst(String(op.w == null ? '' : op.w), 40) || !tekst(op.t, 200)) bledy.push(s + ', opcja ' + (j + 1) + ': potrzebne „w” i „t”');
          return { w: String(op && op.w), t: op && op.t, wyklucza: !!(op && op.wyklucza) };
        });
      }
      var n = {
        id: q.id, modul: 'ankieta', typ: q.typ, tekst: q.tekst,
        krotko: tekst(q.krotko, 80) ? q.krotko : q.tekst.slice(0, 60),
        priorytet: typeof q.priorytet === 'number' ? q.priorytet : 90 - i * 0.01,
        bo: tekst(q.bo, 300) ? q.bo : '',
        nieWiem: q.nieWiem === false ? false : q.typ !== 'tekst',
        pominiecie: q.typ === 'tekst' || !!q.pominiecie,
        bezNieznanych: !!q.bezNieznanych
      };
      if (opcje) n.opcje = opcje;
      if (q.typ === 'liczba') {
        n.min = typeof q.min === 'number' ? q.min : 0; n.max = typeof q.max === 'number' ? q.max : 1000;
        n.krok = typeof q.krok === 'number' ? q.krok : 1; n.jednostka = typeof q.jednostka === 'string' ? q.jednostka : '';
      }
      if (q.typ === 'skala') n.skala = Array.isArray(q.skala) && q.skala.length === 2 ? q.skala.map(String) : ['brak', 'najgorsze, jakie można sobie wyobrazić'];
      if (q.typ === 'tekst' && tekst(q.podpowiedz, 300)) n.podpowiedz = q.podpowiedz;
      if (q.gdy) n.gdy = zWarunku(q.gdy, ids, s + '.gdy', bledy);
      pytania.push(n);
    });

    var flagi = [];
    (dane.flagi || []).forEach(function (f, i) {
      var s = 'flaga ' + (i + 1);
      if (!f || POZIOMY.indexOf(f.poziom) === -1) { bledy.push(s + ': poziom „112” albo „pilne”'); return; }
      if (!tekst(f.dlaLekarza, 300)) bledy.push(s + ': brak opisu „dlaLekarza”');
      // flaga bezwarunkowa (ankieta zmian 1.11): sam opis pacjenta może podnieść pilność – "gdy": "zawsze" albo "bezwarunkowa": true
      var bezw = f.bezwarunkowa === true || f.gdy === 'zawsze';
      var g = bezw ? function () { return true; } : zWarunku(f.gdy, ids, s + '.gdy', bledy);
      if (!g) { bledy.push(s + ': flaga musi mieć warunek „gdy” (albo "bezwarunkowa": true)'); return; }
      flagi.push({ id: 'ai_' + i, poziom: f.poziom, dlaPacjenta: f.poziom === '112' ? P112 : PILNE, dlaLekarza: f.dlaLekarza, gdy: g });
    });
    if (bledy.length) return { bledy: bledy };

    var opisQ = B.pytania.filter(function (q) { return q.id === 'opis'; })[0];
    // wiek i płeć muszą trafić do wywiadu: jeśli Claude o nie nie zapytał, pytają pytania bazowe
    // (silnik pomija je, gdy pacjent podał wiek/płeć w opisie)
    ['plec', 'wiek'].forEach(function (id) {
      if (pytania.some(function (q) { return q.id === id; })) return;
      var q = B.pytania.filter(function (x) { return x.id === id; })[0];
      if (q) pytania.unshift(Object.assign({}, q, { modul: 'ankieta', priorytet: 99 }));
    });
    var bank = {
      analizuj: B.analizuj,
      wersja: 'ankieta AI' + (tekst(dane.kod, 20) ? ' · ' + dane.kod : ''),
      tryb: 'ai',
      zrodlo: 'ankieta przygotowana przez Konsylium AI na podstawie opisu pacjenta',
      tytul: tekst(dane.tytul, 80) ? dane.tytul : 'Pytania dla Ciebie',
      moduly: [B.moduly[0], { id: 'ankieta', nazwa: tekst(dane.tytul, 80) ? dane.tytul : 'Pytania dla Ciebie' }],
      pytania: [opisQ].concat(pytania),
      // wbudowane flagi (działają na opisie pacjenta) + flagi z ankiety
      flagi: B.flagi.concat(flagi),
      zawszeNieznane: B.zawszeNieznane
    };
    // respondent-opiekun (ankieta zmian 1.11): przy splątanym albo ciężko chorym pacjencie odpowiada bliska osoba
    if (dane.respondent && dane.respondent.kto === 'opiekun') bank.respondent = { kto: 'opiekun', opis: tekst(dane.respondent.opis, 60) ? dane.respondent.opis : 'opiekun' };
    return { bank: bank, opis: typeof dane.opis === 'string' ? dane.opis : '', kod: typeof dane.kod === 'string' ? dane.kod : '', bledy: [] };
  }

  // Tekst do wklejenia w czacie Konsylium po kroku 1.
  function doProsby(bank, historia, meta) {
    var S = silnik();
    meta = meta || {};
    var st = S.przelicz(bank, historia);
    var B = bazowy();
    var l = [];
    l.push('# Prośba o ankietę dla pacjenta (MS Wywiad, krok 1)');
    l.push('');
    l.push('Kod: ' + (meta.kod || '') + (meta.data ? ' · ' + meta.data : ''));
    l.push('');
    l.push('Przygotuj ankietę w formacie ' + FORMAT + ' (narzedzia/wywiad/FORMAT-ANKIETY.md) dopasowaną do opisu poniżej. ' +
      'Odpowiedz jednym blokiem JSON, który wczytam w aplikacji. Wpisz w nim kod ' + (meta.kod || '') + '.');
    l.push('');
    l.push('## Opis pacjenta własnymi słowami');
    l.push(typeof st.o.opis === 'string' && st.o.opis.trim() ? st.o.opis.trim() : '(pacjent nic nie wpisał)');
    l.push('');
    l.push('## Wstępna analiza opisu (reguły aplikacji)');
    var slady = st.analiza.slady;
    if (!slady.length) l.push('- nic nie rozpoznano');
    slady.forEach(function (s) {
      var q = S.pytanieWg(B, s.id);
      var odp = q ? S.opisOdpowiedzi(q, q.typ === 'wiele' ? [s.wartosc] : s.wartosc) : s.wartosc;
      l.push('- ' + (q ? q.krotko : s.id) + ': ' + odp + ' („' + s.fragment + '”)');
    });
    l.push('');
    l.push('## Czerwone flagi z opisu');
    if (!st.flagi.length) l.push('- brak');
    st.flagi.forEach(function (f) { l.push('- [' + (f.poziom === '112' ? 'NATYCHMIAST 112' : 'PILNE') + '] ' + f.dlaLekarza); });
    l.push('');
    return l.join('\n');
  }

  var api = { FORMAT: FORMAT, bankOpisu: bankOpisu, zAnkiety: zAnkiety, doProsby: doProsby };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.AnkietaAI = api;
})(typeof window !== 'undefined' ? window : this);
