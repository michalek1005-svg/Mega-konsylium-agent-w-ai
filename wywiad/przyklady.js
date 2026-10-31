// Fikcyjne scenariusze do demonstracji i testów. Nie są to dane prawdziwych pacjentów.
(function (root) {
  'use strict';
  var przyklady = {
    brzuch: {
      nazwa: 'Ból brzucha po tłustym posiłku',
      odpowiedzi: {
        opis: 'Od wczoraj boli mnie pod prawymi żebrami, zwłaszcza po tłustym jedzeniu, i promieniuje pod łopatkę. Raz zwymiotowałam. Mam 54 lata.',
        powod: ['brzuch'], wiek: 54, plec: 'k', od_kiedy: 'd1', nasilenie: 6,
        b_twardy: 'nie', b_miejsce: ['nadbrzusze', 'prawe_pz'], b_charakter: 'kolka',
        b_wymioty: 'tak', b_stolec: ['norm'], b_ciaza: 'nie', b_posilki: 'tak',
        b_promien: ['lopatka'], b_zoltaczka: ['brak'], b_goraczka: 'nie', b_alkohol: 'malo',
        w_choroby: ['nadcisnienie'], w_leki: 'amlodypina 5 mg, coś na cholesterol (nie pamiętam nazwy)',
        w_antykoag: 'nie', w_przeciwbolowe: 'nlpz', w_alergie: 'brak', w_epizody: 'tak', w_dodatkowe: ''
      }
    },
    klatka: {
      nazwa: 'Ucisk w klatce z potami',
      odpowiedzi: {
        opis: 'Od godziny gniecie mnie w klatce piersiowej, ból idzie do lewej ręki, jestem cały spocony. Mam 61 lat.',
        powod: ['klatka'], wiek: 61, plec: 'm', od_kiedy: 'h', nasilenie: 8,
        k_charakter: 'ucisk', k_objawy: ['poty', 'nudnosci'], k_promien: ['reka'], k_teraz: 'tak',
        k_wysilek: 'tak', k_ryzyko: ['palenie', 'nadcisnienie']
      }
    },
    glowa: {
      nazwa: 'Migrena z aurą',
      odpowiedzi: {
        opis: 'Od rana pulsujący ból głowy po jednej stronie, przed bólem widziałam mroczki i zygzaki. Wzięłam ibuprofen.',
        powod: ['glowa'], wiek: 29, plec: 'k', od_kiedy: 'h', nasilenie: 7,
        g_nagly: 'nie', g_neuro: ['brak'], g_kark: 'nie', g_uraz: 'nie', g_charakter: 'puls',
        g_aura: 'tak', g_wczesniej: 'podobne', w_choroby: ['brak'], w_leki: 'antykoncepcja doustna',
        w_antykoag: 'nie', w_przeciwbolowe: 'nlpz', w_alergie: '', w_dodatkowe: ''
      }
    }
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = przyklady;
  else root.PrzykladyWywiadu = przyklady;
})(typeof window !== 'undefined' ? window : this);
