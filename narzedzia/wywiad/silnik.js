/*
 * Silnik adaptacyjnego wywiadu (MS · Wywiad z pacjentem)
 *
 * Czysta logika bez interfejsu: działa w przeglądarce (window.SilnikWywiadu)
 * i w Node (require('./silnik.js')), dzięki czemu da się go testować.
 *
 * Zasada: po każdej odpowiedzi przeliczamy cały stan od zera z historii
 * odpowiedzi. Dzięki temu „Wstecz” jest zwykłym usunięciem ostatniej
 * odpowiedzi, a stan nigdy się nie rozjeżdża.
 *
 * Kolejne pytanie wybiera się w dwóch krokach:
 *  1. reguły (pytania.js) wyznaczają listę dozwolonych kandydatów,
 *     posortowaną po priorytecie (pytania o zagrożenia mają najwyższy);
 *  2. funkcja `wybierz` bierze pierwszego kandydata. To jest miejsce,
 *     w które później można wpiąć AI: AI dostaje TYLKO listę kandydatów
 *     i może wybrać spośród nich, ale nie może dodać własnego pytania
 *     ani pominąć czerwonych flag (te liczą reguły, nie AI).
 */
(function (root) {
  'use strict';

  var NIE_WIEM = 'nw';

  // ma(o, 'pytanie', 'wartosc' | ['a','b']) — czy odpowiedź zawiera wartość
  function ma(o, id, w) {
    var v = o[id];
    if (v === undefined || v === null) return false;
    var lista = Array.isArray(w) ? w : [w];
    if (Array.isArray(v)) return lista.some(function (x) { return v.indexOf(x) !== -1; });
    return lista.indexOf(v) !== -1;
  }

  function bezpiecznie(fn, o) {
    try { return !!fn(o, ma); } catch (e) { return false; }
  }

  function przelicz(bank, historia) {
    var o = {};
    historia.forEach(function (h) { o[h.id] = h.wartosc; });

    // Analiza opisu własnymi słowami: fakty podane wprost uzupełniają odpowiedzi
    // (te pytania są pomijane), podpowiedzi zaznaczają wstępnie pytania „wiele”.
    var analiza = { moduly: [], fakty: {}, podpowiedzi: {}, slady: [] };
    if (bank.analizuj && typeof o.opis === 'string' && o.opis.trim()) analiza = bank.analizuj(o.opis);
    if (analiza.moduly.length) analiza.podpowiedzi.powod = analiza.moduly.slice();
    var zOpisu = {};
    Object.keys(analiza.fakty).forEach(function (k) {
      if (o[k] === undefined) { o[k] = analiza.fakty[k]; zOpisu[k] = true; }
    });
    // Do czerwonych flag liczą się też podpowiedzi z opisu, dopóki pacjent ich nie potwierdzi
    // ani nie poprawi: lepiej ostrzec za wcześnie niż za późno.
    var doFlag = {};
    Object.keys(o).forEach(function (k) { doFlag[k] = o[k]; });
    Object.keys(analiza.podpowiedzi).forEach(function (k) { if (doFlag[k] === undefined) doFlag[k] = analiza.podpowiedzi[k]; });

    var moduly = bank.moduly
      .filter(function (m) { return !m.gdy || bezpiecznie(m.gdy, doFlag); })
      .map(function (m) { return m.id; });

    var flagi = bank.flagi
      .filter(function (f) { return bezpiecznie(f.gdy, doFlag); })
      .map(function (f) {
        return {
          id: f.id,
          poziom: f.poziom,
          dlaPacjenta: f.dlaPacjenta,
          dlaLekarza: f.dlaLekarza
        };
      });
    // 112 przed „pilne”
    flagi.sort(function (a, b) { return (a.poziom === '112' ? 0 : 1) - (b.poziom === '112' ? 0 : 1); });

    var zadane = {};
    historia.forEach(function (h) { zadane[h.id] = true; });

    var kandydaci = bank.pytania
      .map(function (q, i) { return { q: q, i: i }; })
      .filter(function (x) {
        var q = x.q;
        return !zadane[q.id] && !zOpisu[q.id] && moduly.indexOf(q.modul) !== -1 && (!q.gdy || bezpiecznie(q.gdy, o));
      })
      .sort(function (a, b) { return (b.q.priorytet || 0) - (a.q.priorytet || 0) || a.i - b.i; })
      .map(function (x) { return x.q; });

    return { o: o, moduly: moduly, flagi: flagi, kandydaci: kandydaci, analiza: analiza, zOpisu: zOpisu };
  }

  // Domyślny wybór: najwyższy priorytet. Podmień na wybór AI (z tej samej listy).
  function wybierz(kandydaci /*, stan */) {
    return kandydaci[0] || null;
  }

  function nastepne(bank, historia, wybieracz) {
    var stan = przelicz(bank, historia);
    var q = (wybieracz || wybierz)(stan.kandydaci, stan);
    if (q && stan.kandydaci.indexOf(q) === -1) q = stan.kandydaci[0] || null; // AI nie może wyjść poza listę
    return { pytanie: q, stan: stan };
  }

  function pytanieWg(bank, id) {
    for (var i = 0; i < bank.pytania.length; i++) if (bank.pytania[i].id === id) return bank.pytania[i];
    return null;
  }

  function uzasadnienie(q, o) {
    if (!q || !q.bo) return '';
    return typeof q.bo === 'function' ? q.bo(o, ma) : q.bo;
  }

  function opisOdpowiedzi(q, v) {
    if (v === null || v === undefined || v === '') return 'Pominięto';
    if (v === NIE_WIEM) return 'Nie wiem';
    if (q.typ === 'skala') return v + '/10';
    if (q.typ === 'liczba') {
      var j = q.jednostka === 'lat' ? lata(v) : q.jednostka;
      return String(v).replace('.', ',') + (j ? ' ' + j : '');
    }
    if (q.typ === 'tekst') return String(v).trim();
    var lista = Array.isArray(v) ? v : [v];
    return lista.map(function (w) {
      var op = (q.opcje || []).filter(function (x) { return x.w === w; })[0];
      return op ? op.t : w;
    }).join('; ');
  }

  function lata(n) {
    if (n === 1) return 'rok';
    var d = n % 10, s = n % 100;
    return d >= 2 && d <= 4 && !(s >= 12 && s <= 14) ? 'lata' : 'lat';
  }

  function czyNieznane(v) {
    return v === null || v === undefined || v === '' || v === NIE_WIEM;
  }

  /*
   * Zapis w formacie sprawy Konsylium (01-wywiad.md).
   * Celowo BEZ hipotezy ani podpowiedzi rozpoznania: wywiad idzie do
   * ślepej tury lekarzy i nie może im niczego sugerować.
   */
  function doMarkdown(bank, historia, meta) {
    meta = meta || {};
    var stan = przelicz(bank, historia);
    var linie = [];
    linie.push('# Wywiad wstępny (ankieta pacjenta)');
    linie.push('');
    linie.push('_Źródło: adaptacyjna ankieta MS' + (meta.kod ? ' · kod ' + meta.kod : '') +
      (meta.data ? ' · ' + meta.data : '') + ' · DANE FIKCYJNE (demo)_');
    linie.push('');
    linie.push('## Czerwone flagi (reguły ankiety)');
    if (stan.flagi.length === 0) linie.push('- brak');
    stan.flagi.forEach(function (f) {
      linie.push('- [' + (f.poziom === '112' ? 'NATYCHMIAST 112' : 'PILNE') + '] ' + f.dlaLekarza);
    });
    linie.push('');
    linie.push('## Pytania i odpowiedzi');
    linie.push('### Tura 1 (pacjent, ankieta)');
    historia.forEach(function (h) {
      var q = pytanieWg(bank, h.id);
      if (!q) return;
      linie.push('P: ' + q.tekst + '  O: ' + opisOdpowiedzi(q, h.wartosc));
      if (h.id === 'opis') {
        Object.keys(stan.zOpisu).forEach(function (k) {
          var qz = pytanieWg(bank, k);
          if (qz) linie.push('P: ' + qz.tekst + '  O: ' + opisOdpowiedzi(qz, stan.o[k]) + ' (z opisu pacjenta)');
        });
      }
    });
    linie.push('');
    linie.push('## NIEZNANE');
    var nieznane = historia
      .filter(function (h) {
        var q = pytanieWg(bank, h.id);
        return czyNieznane(h.wartosc) && !(q && q.bezNieznanych && h.wartosc !== NIE_WIEM);
      })
      .map(function (h) { return (pytanieWg(bank, h.id) || {}).krotko || h.id; });
    nieznane = nieznane.concat(bank.zawszeNieznane || []);
    nieznane.forEach(function (n) { linie.push('- ' + n); });
    linie.push('');
    return linie.join('\n');
  }

  var api = {
    NIE_WIEM: NIE_WIEM,
    ma: ma,
    przelicz: przelicz,
    wybierz: wybierz,
    nastepne: nastepne,
    pytanieWg: pytanieWg,
    uzasadnienie: uzasadnienie,
    opisOdpowiedzi: opisOdpowiedzi,
    czyNieznane: czyNieznane,
    doMarkdown: doMarkdown
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.SilnikWywiadu = api;
})(typeof window !== 'undefined' ? window : this);
