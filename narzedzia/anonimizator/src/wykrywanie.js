// Wykrywanie danych osobowych na stronach wyniku badań (układ formularzy Synevo).
// Czyste funkcje, bez DOM i bez sieci — testowane w Node (test/wykrywanie.test.js).
//
// Wejście: strony = [{ nr, szer, wys, slowa: [{ t, x, y, w, h }] }]
//   (współrzędne w jednostkach strony: punkty PDF albo piksele obrazu; y rośnie w dół)
// Wyjście: propozycje = [{ strona, x, y, w, h, kategoria, powod, tekst }]

export const KATEGORIE = {
  pacjent:      { nazwa: 'Imię i nazwisko pacjenta',      domyslnie: true },
  pesel:        { nazwa: 'PESEL i dokumenty',             domyslnie: true },
  urodzenie:    { nazwa: 'Data urodzenia',                domyslnie: true },
  adres:        { nazwa: 'Adres i kontakt',               domyslnie: true },
  zlecenie:     { nazwa: 'Nr zlecenia, próbki, kody',     domyslnie: true },
  kod:          { nazwa: 'Kody kreskowe i QR',            domyslnie: true },
  lekarz:       { nazwa: 'Lekarz i zleceniodawca',        domyslnie: true },
  personel:     { nazwa: 'Personel laboratorium',         domyslnie: true },
  placowka:     { nazwa: 'Punkt pobrań i placówka',       domyslnie: false },
  daty:         { nazwa: 'Daty pobrania i wydania',       domyslnie: false },
  fraza:        { nazwa: 'Twoje frazy',                   domyslnie: true },
};

// Etykiety formularza. Wartość stojąca za etykietą trafia do kategorii.
// kategoria null = etykieta „zostaje” (np. płeć, wiek): tylko zamyka wartość poprzedniej etykiety.
// Zapis bez polskich znaków i małymi literami (porównujemy po normalizacji).
export const ETYKIETY = [
  // pacjent
  ['imie i nazwisko', 'pacjent'], ['nazwisko i imie', 'pacjent'], ['imiona i nazwisko', 'pacjent'],
  ['dane pacjenta', 'pacjent'], ['pacjent', 'pacjent'], ['pacjentka', 'pacjent'],
  ['osoba badana', 'pacjent'], ['badany', 'pacjent'], ['badana', 'pacjent'],
  ['nazwisko', 'pacjent'], ['imie', 'pacjent'], ['imiona', 'pacjent'], ['opiekun', 'pacjent'],
  // PESEL i dokumenty
  ['nr pesel', 'pesel'], ['pesel', 'pesel'], ['nr dokumentu', 'pesel'], ['numer dokumentu', 'pesel'],
  ['dokument tozsamosci', 'pesel'], ['nr paszportu', 'pesel'], ['paszport', 'pesel'],
  ['id pacjenta', 'pesel'], ['nr pacjenta', 'pesel'], ['numer pacjenta', 'pesel'], ['nr karty pacjenta', 'pesel'],
  ['nr karty', 'pesel'], ['nip', 'pesel'],
  // urodzenie
  ['data urodzenia', 'urodzenie'], ['data ur', 'urodzenie'], ['ur', 'urodzenie'], ['urodzony', 'urodzenie'], ['urodzona', 'urodzenie'],
  // adres i kontakt
  ['adres zamieszkania', 'adres'], ['adres korespondencyjny', 'adres'], ['adres pacjenta', 'adres'], ['adres', 'adres'],
  ['ulica', 'adres'], ['miejscowosc', 'adres'], ['kod pocztowy', 'adres'], ['miasto', 'adres'],
  ['nr telefonu', 'adres'], ['telefon', 'adres'], ['tel', 'adres'], ['e-mail', 'adres'], ['email', 'adres'], ['mail', 'adres'],
  // zlecenie, próbka, dostęp do wyników
  ['numer zlecenia', 'zlecenie'], ['nr zlecenia', 'zlecenie'], ['kod zlecenia', 'zlecenie'], ['id zlecenia', 'zlecenie'],
  ['zlecenie nr', 'zlecenie'], ['nr zamowienia', 'zlecenie'], ['numer zamowienia', 'zlecenie'],
  ['nr probki', 'zlecenie'], ['numer probki', 'zlecenie'], ['kod probki', 'zlecenie'], ['id probki', 'zlecenie'],
  ['nr badania', 'zlecenie'], ['numer badania', 'zlecenie'], ['nr wyniku', 'zlecenie'], ['id wyniku', 'zlecenie'],
  ['kod kreskowy', 'zlecenie'], ['nr skierowania', 'zlecenie'], ['numer skierowania', 'zlecenie'],
  ['nr ksiegi', 'zlecenie'], ['nr rejestracji', 'zlecenie'], ['nr rej', 'zlecenie'], ['nr materialu', 'zlecenie'],
  ['kod dostepu', 'zlecenie'], ['haslo', 'zlecenie'], ['login', 'zlecenie'], ['pin', 'zlecenie'],
  // lekarz / zleceniodawca
  ['lekarz kierujacy', 'lekarz'], ['lekarz zlecajacy', 'lekarz'], ['lekarz zlecający', 'lekarz'], ['lekarz', 'lekarz'],
  ['zlecajacy', 'lekarz'], ['zleceniodawca', 'lekarz'], ['kierujacy', 'lekarz'], ['jednostka kierujaca', 'lekarz'],
  ['jednostka zlecajaca', 'lekarz'], ['skierowany przez', 'lekarz'], ['skierowana przez', 'lekarz'], ['zlecil', 'lekarz'],
  ['nr prawa wykonywania zawodu', 'lekarz'], ['npwz', 'lekarz'], ['pwz', 'lekarz'],
  // personel laboratorium (podpisy pod wynikiem)
  ['autoryzowal', 'personel'], ['autoryzowala', 'personel'], ['autoryzacja', 'personel'], ['zatwierdzil', 'personel'],
  ['zatwierdzila', 'personel'], ['wykonal', 'personel'], ['wykonala', 'personel'], ['wykonujacy', 'personel'],
  ['zweryfikowal', 'personel'], ['zweryfikowala', 'personel'], ['diagnosta laboratoryjny', 'personel'], ['diagnosta', 'personel'],
  ['pobral', 'personel'], ['pobrala', 'personel'], ['osoba pobierajaca', 'personel'], ['podpis', 'personel'],
  ['kierownik laboratorium', 'personel'],
  // placówka (domyślnie zostaje)
  ['punkt pobran', 'placowka'], ['punkt pobrania', 'placowka'], ['miejsce pobrania', 'placowka'], ['placowka', 'placowka'],
  // daty (domyślnie zostają — ważne dla przebiegu choroby)
  ['data i godzina pobrania', 'daty'], ['data pobrania', 'daty'], ['data przyjecia', 'daty'], ['data rejestracji', 'daty'],
  ['data wydania', 'daty'], ['data wydruku', 'daty'], ['data wykonania', 'daty'], ['data zlecenia', 'daty'],
  ['data autoryzacji', 'daty'], ['data przyjecia materialu', 'daty'],
  // etykiety, które zostają — tylko zamykają wartość
  ['plec', null], ['wiek', null], ['material', null], ['rodzaj materialu', null], ['badanie', null],
  ['wynik', null], ['jednostka', null], ['zakres referencyjny', null], ['norma', null], ['uwagi', null],
  ['strona', null], ['metoda', null],
];

// Tytuły przed nazwiskiem (podpisy lekarzy i diagnostów)
const TYTULY = ['lek', 'lek. med', 'dr', 'dr n. med', 'dr hab', 'prof', 'mgr', 'mgr farm', 'lic', 'inz', 'diagn', 'diag. lab'];

export function normalizuj(s) {
  return String(s)
    .toLowerCase()
    .replace(/ł/g, 'l')
    .normalize('NFD').replace(/[̀-ͯ]/g, '');
}

export function peselPoprawny(p) {
  if (!/^\d{11}$/.test(p)) return false;
  const wagi = [1, 3, 7, 9, 1, 3, 7, 9, 1, 3];
  let s = 0;
  for (let i = 0; i < 10; i++) s += wagi[i] * Number(p[i]);
  if ((10 - (s % 10)) % 10 !== Number(p[10])) return false;
  // miesiąc z przesunięciem stulecia
  const m = Number(p.slice(2, 4)) % 20;
  const d = Number(p.slice(4, 6));
  return m >= 1 && m <= 12 && d >= 1 && d <= 31;
}

// ── układanie słów w wiersze ─────────────────────────────────────
export function wiersze(slowa) {
  const s = slowa.filter((w) => w.t && w.t.trim()).map((w, i) => ({ ...w, i }));
  s.sort((a, b) => (a.y + a.h / 2) - (b.y + b.h / 2) || a.x - b.x);
  const out = [];
  for (const w of s) {
    const yc = w.y + w.h / 2;
    let cel = null;
    for (let k = out.length - 1; k >= 0 && k >= out.length - 4; k--) {
      const l = out[k];
      if (Math.abs(l.yc - yc) < Math.max(2, 0.5 * Math.min(l.h, w.h))) { cel = l; break; }
    }
    if (!cel) { cel = { slowa: [], yc, h: w.h }; out.push(cel); }
    cel.slowa.push(w);
    cel.yc = (cel.yc * (cel.slowa.length - 1) + yc) / cel.slowa.length;
    cel.h = Math.max(cel.h, w.h);
  }
  for (const l of out) {
    l.slowa.sort((a, b) => a.x - b.x);
    // tekst wiersza i przesunięcia znaków każdego słowa
    let txt = '';
    l.od = [];
    l.slowa.forEach((w, k) => {
      if (k) txt += ' ';
      l.od.push(txt.length);
      txt += w.t;
    });
    l.tekst = txt;
    l.norm = normalizuj(txt);
    l.y = Math.min(...l.slowa.map((w) => w.y));
    l.y2 = Math.max(...l.slowa.map((w) => w.y + w.h));
  }
  out.sort((a, b) => a.yc - b.yc);
  return out;
}

// indeksy słów wiersza pokrywające zakres znaków [a, b)
function slowaZakresu(l, a, b) {
  const r = [];
  l.slowa.forEach((w, k) => {
    const s = l.od[k], e = s + w.t.length;
    if (e > a && s < b) r.push(k);
  });
  return r;
}

function ramka(slowa) {
  const x = Math.min(...slowa.map((w) => w.x));
  const y = Math.min(...slowa.map((w) => w.y));
  const x2 = Math.max(...slowa.map((w) => w.x + w.w));
  const y2 = Math.max(...slowa.map((w) => w.y + w.h));
  return { x, y, w: x2 - x, h: y2 - y };
}

const ESC = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const ETYK_RE = ETYKIETY
  .slice()
  .sort((a, b) => b[0].length - a[0].length)
  .map(([e, k]) => ({
    e, k,
    // granica słowa po normalizacji; kropki/spacje w etykiecie elastyczne; opcjonalny „.” i „:”
    re: new RegExp('(^|[^a-z0-9])(' + ESC(e).replace(/\\\.\s*/g, '\\.?\\s*').replace(/\s+/g, '[\\s.]*') + ')\\.?\\s*(:|(?=\\s|$))', 'g'),
  }));

// znajdź etykiety w wierszu (bez nakładania się; dłuższe pierwsze)
export function etykietyWiersza(l) {
  const zajete = new Array(l.norm.length).fill(false);
  const traf = [];
  for (const { e, k, re } of ETYK_RE) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(l.norm))) {
      const a = m.index + m[1].length;
      const b = m.index + m[0].length;
      if (zajete.slice(a, b).some(Boolean)) continue;
      const dwukropek = m[3] === ':';
      const kropka = m[0].slice(m[1].length + m[2].length).includes('.');
      // krótkie/niejednoznaczne etykiety tylko z dwukropkiem (np. „ur:”, „tel:”, „pin:”, „imie:”)
      const krotka = ['ur', 'tel', 'pin', 'mail', 'login', 'haslo', 'imie', 'nazwisko', 'badany', 'badana',
        'podpis', 'badanie', 'wynik', 'material', 'norma', 'strona', 'metoda', 'jednostka', 'uwagi', 'miasto',
        'nip', 'pwz', 'opiekun', 'plec', 'wiek', 'adres', 'lekarz', 'pacjent', 'pacjentka', 'diagnosta', 'placowka'];
      if (krotka.includes(e) && !dwukropek) {
        // dopuść bez dwukropka tylko gdy etykieta stoi na początku wiersza i za nią są słowa
        if (kropka && ['ur', 'tel'].includes(e)) { /* „ur. 01.02.1985”, „tel. 600…” */ } else {
        if (a !== 0) continue;
        if (['ur', 'tel', 'pin', 'mail', 'badanie', 'wynik', 'material', 'norma', 'strona', 'metoda', 'jednostka', 'uwagi', 'podpis'].includes(e)) continue;
        }
      }
      for (let i = a; i < b; i++) zajete[i] = true;
      traf.push({ a, b, e, k, dwukropek });
    }
  }
  traf.sort((x, y) => x.a - y.a);
  return traf;
}

// ── główna funkcja ───────────────────────────────────────────────
export function wykryj(strony, opcje = {}) {
  const propozycje = [];
  const dodaj = (strona, slowa, kategoria, powod) => {
    if (!slowa.length) return;
    const r = ramka(slowa);
    propozycje.push({ strona, ...r, kategoria, powod, tekst: slowa.map((w) => w.t).join(' ') });
  };
  const znaneNazwiska = new Set();

  for (const st of strony) {
    const ws = wiersze(st.slowa);
    ws.forEach((l, li) => {
      const etyk = etykietyWiersza(l);
      const synevoStopka = /synevo|sp\.? z o\.?o|krs|regon|bdo/.test(l.norm);

      // 1) etykieta → wartość
      etyk.forEach((et, ei) => {
        if (!et.k) return;
        const koniec = ei + 1 < etyk.length ? etyk[ei + 1].a : l.norm.length;
        let idx = slowaZakresu(l, et.b, koniec).filter((k) => l.od[k] >= et.b - 1 || l.od[k] + l.slowa[k].t.length > et.b);
        // nie bierz słowa, w którym jest sama etykieta
        idx = idx.filter((k) => l.od[k] >= et.b || normalizuj(l.slowa[k].t).slice(et.b - l.od[k]).replace(/[:\s.]/g, ''));
        // przerwa kolumnowa: duży odstęp kończy wartość
        const wyb = [];
        let prev = slowaZakresu(l, et.a, et.b).map((k) => l.slowa[k]).pop();
        for (const k of idx) {
          const w = l.slowa[k];
          if (prev && w.x - (prev.x + prev.w) > Math.max(3.2 * l.h, 40)) break;
          wyb.push(w); prev = w;
          // tekst ciągły (wywiad): wartość kończy się na końcu zdania / przecinku, maks. 5 słów
          if (opcje.tekstCiagly && (/[.;,]$/.test(w.t) && !/^(ul|al|os|pl|lek|dr|mgr|prof|n|med)\.$/i.test(w.t) || wyb.length >= 5)) break;
        }
        // usuń same dwukropki / myślniki
        let wart = wyb.filter((w) => w.t.replace(/[:\-–.\s]/g, ''));
        // wartość w następnym wierszu pod etykietą
        if (!wart.length && li + 1 < ws.length) {
          const nl = ws[li + 1];
          const etW = slowaZakresu(l, et.a, et.b).map((k) => l.slowa[k]);
          const x0 = Math.min(...etW.map((w) => w.x)) - 4;
          if (nl.y - l.y2 < 1.6 * l.h && !etykietyWiersza(nl).some((e2) => e2.a === 0)) {
            const pod = [];
            let p = null;
            for (const w of nl.slowa) {
              if (w.x + w.w < x0) continue;
              if (p && w.x - (p.x + p.w) > Math.max(3.2 * nl.h, 40)) break;
              pod.push(w); p = w;
            }
            wart = pod;
          }
        }
        if (et.k === 'urodzenie') {
          // zostaw ewentualny wiek w nawiasie, np. „01.02.1985 (40 lat)”
          const i = wart.findIndex((w) => /^\(?\d{1,3}$/.test(w.t) && wart.length > 1);
          if (i > 0) wart = wart.slice(0, i);
        }
        if (wart.length) {
          dodaj(st.nr, wart, et.k, 'po etykiecie „' + et.e + '”');
          if (et.k === 'pacjent') for (const w of wart) {
            const n = normalizuj(w.t).replace(/[^a-z-]/g, '');
            if (n.length >= 3) znaneNazwiska.add(n);
          }
        }
      });

      // 2) wzorce w tekście wiersza
      const wzorce = [
        { re: /(?<!\d)\d{11}(?!\d)/g, k: (m) => (peselPoprawny(m) ? 'pesel' : 'zlecenie'), p: (m) => (peselPoprawny(m) ? 'PESEL (suma kontrolna się zgadza)' : 'długi numer (11 cyfr)') },
        { re: /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/g, k: () => 'adres', p: () => 'adres e-mail' },
        { re: /(?<![\d,.])(?:\+?48[\s-]?)?(?:\d{3}[\s-]\d{3}[\s-]\d{3}|\d{2}[\s-]\d{3}[\s-]\d{2}[\s-]\d{2})(?![\d,.])/g, k: () => 'adres', p: () => 'numer telefonu' },
        { re: /(?<![\d-])\d{2}-\d{3}(?![\d-])\s+[a-ząćęłńóśźż][a-ząćęłńóśźż-]+/g, k: () => (synevoStopka ? 'placowka' : 'adres'), p: () => 'kod pocztowy i miejscowość' },
        { re: /(?:^|\s)(?:ul|al|os|pl)\.?\s+[a-ząćęłńóśźż0-9][^\s,]*(?:\s+[a-ząćęłńóśźż][^\s,]*){0,3}\s+\d+[a-z]?(?:\s*\/\s*\d+[a-z]?|\s+m\.?\s*\d+)?/g, k: () => (synevoStopka ? 'placowka' : 'adres'), p: () => 'ulica i numer domu' },
        { re: /(?<![\d,.])\d{12,}(?![\d,.])|(?<![\d,.])\d{8,10}(?![\d,.])/g, k: () => 'zlecenie', p: () => 'długi numer (zlecenie / kod)' },
        { re: /(?<![a-z0-9])[a-z]{1,4}[-/]?\d{6,}(?![a-z0-9])/g, k: () => 'zlecenie', p: () => 'kod z literami i cyframi' },
      ];
      for (const { re, k, p } of wzorce) {
        re.lastIndex = 0;
        let m;
        while ((m = re.exec(l.norm))) {
          let a = m.index, b = m.index + m[0].length;
          while (a < b && /\s/.test(l.norm[a])) a++;
          const idx = slowaZakresu(l, a, b);
          const kat = k(m[0].trim());
          if (kat === 'placowka' && synevoStopka) { /* dane laboratorium */ }
          dodaj(st.nr, idx.map((i) => l.slowa[i]), kat, p(m[0].trim()));
        }
      }

      // 2b) wypowiedzi pisane własnymi słowami (wywiad): „nazywam się Jan Kowalski”, „mieszkam przy ul. …”
      const WIELKA = /^[A-ZĄĆĘŁŃÓŚŹŻ][A-Za-ząćęłńóśźżĄĆĘŁŃÓŚŹŻ'-]*[,.;]?$/;
      const ZWROTY_OSOBA = [['nazywam', 'sie'], ['mam', 'na', 'imie'], ['moje', 'imie', 'to'], ['moje', 'nazwisko', 'to'],
        ['nazwisko'], ['jestem'], ['tu'], ['z', 'tej', 'strony'], ['syn'], ['corka'], ['zona'], ['maz'], ['mama'], ['tata'], ['brat'], ['siostra']];
      const ZWROTY_ADRES = [['mieszkam', 'przy'], ['mieszkam', 'na'], ['mieszkam', 'w'], ['mieszkam', 'we'], ['zamieszkaly', 'w'],
        ['zamieszkala', 'w'], ['adres', 'zamieszkania'], ['moj', 'adres', 'to']];
      const normS = l.slowa.map((w) => normalizuj(w.t).replace(/[^a-z0-9-]/g, ''));
      const pasuje = (k, zw) => zw.every((z, i) => normS[k + i] === z);
      for (let k = 0; k < l.slowa.length; k++) {
        for (const zw of ZWROTY_OSOBA) {
          if (!pasuje(k, zw)) continue;
          const naz = [];
          let j = k + zw.length;
          while (j < l.slowa.length && naz.length < 3 && WIELKA.test(l.slowa[j].t) && l.slowa[j].t.replace(/[,.;]$/, '').length > 1) {
            naz.push(l.slowa[j]);
            if (/[,.;]$/.test(l.slowa[j].t)) break;
            j++;
          }
          // „jestem”, „tu”, „syn”… tylko gdy dalej stoją co najmniej dwa słowa z wielkiej litery (imię i nazwisko)
          const pewny = zw.length > 1 || zw[0] === 'nazwisko';
          if (naz.length >= (pewny ? 1 : 2)) dodaj(st.nr, naz, 'pacjent', 'zwrot „' + zw.join(' ') + '” i imię/nazwisko');
        }
        for (const zw of ZWROTY_ADRES) {
          if (!pasuje(k, zw)) continue;
          const adr = [];
          let j = k + zw.length;
          while (j < l.slowa.length && adr.length < 6) {
            const t = l.slowa[j].t;
            adr.push(l.slowa[j]);
            if (/[;.]$/.test(t) && !/^(ul|al|os|pl|m)\.$/i.test(t)) break;
            j++;
          }
          if (adr.length) dodaj(st.nr, adr, 'adres', 'zwrot „' + zw.join(' ') + '”');
        }
      }

      // 3) tytuł + nazwisko (lek. Jan Kowalski, dr n. med. …, mgr …)
      l.slowa.forEach((w, k) => {
        const n = normalizuj(w.t).replace(/[.,:]$/, '');
        if (!TYTULY.some((t) => t.split(/[\s.]+/)[0] === n)) return;
        // pomiń kolejne człony tytułu („dr n. med.”, „lek. med.”)
        let j = k + 1;
        while (j < l.slowa.length && /^(n\.|med\.?|hab\.?|n\.med\.?|farm\.?|lab\.?|wet\.?)$/i.test(l.slowa[j].t)) j++;
        const naz = [];
        while (j < l.slowa.length && naz.length < 3 && /^[A-ZĄĆĘŁŃÓŚŹŻ][A-Za-ząćęłńóśźżĄĆĘŁŃÓŚŹŻ'-]+[,]?$/.test(l.slowa[j].t)) {
          const pop = naz.length ? naz[naz.length - 1] : l.slowa[j - 1];
          if (l.slowa[j].x - (pop.x + pop.w) > Math.max(1.5 * l.h, 12)) break; // następna kolumna
          if (ETYKIETY.some(([e]) => e.split(' ')[0] === normalizuj(l.slowa[j].t).replace(/[:.,]$/, ''))) break; // „Data”, „Płeć”…
          naz.push(l.slowa[j]); j++;
          if (/,$/.test(naz[naz.length - 1].t)) break;
        }
        if (naz.length) dodaj(st.nr, naz, l.norm.includes('lekarz') || n === 'lek' ? 'lekarz' : 'personel', 'tytuł „' + w.t + '” i nazwisko');
      });
    });
  }

  // 4) powtórzenia imienia i nazwiska pacjenta w całym dokumencie (np. w stopce każdej strony)
  const frazy = [...(opcje.frazy || [])].map((f) => String(f).trim()).filter(Boolean);
  for (const st of strony) {
    for (const w of st.slowa) {
      const n = normalizuj(w.t).replace(/[^a-z-]/g, '');
      if (n.length >= 3 && znaneNazwiska.has(n) && !slowoZakryte(w, propozycje.filter((x) => x.strona === st.nr))) {
        propozycje.push({ strona: st.nr, x: w.x, y: w.y, w: w.w, h: w.h, kategoria: 'pacjent', powod: 'powtórzenie danych pacjenta', tekst: w.t });
      }
    }
  }

  // 5) frazy wpisane przez użytkownika (bez względu na wielkość liter i ogonki)
  for (const f of frazy) {
    const fn = normalizuj(f).replace(/\s+/g, ' ');
    if (fn.length < 2) continue;
    for (const st of strony) {
      for (const l of wiersze(st.slowa)) {
        let i = l.norm.indexOf(fn);
        while (i >= 0) {
          const idx = slowaZakresu(l, i, i + fn.length);
          dodaj(st.nr, idx.map((k) => l.slowa[k]), 'fraza', 'Twoja fraza „' + f + '”');
          i = l.norm.indexOf(fn, i + 1);
        }
      }
    }
  }

  return scal(propozycje);
}

// usuń duplikaty: ramkę leżącą w całości w innej ramce tej samej strony (pierwsza wygrywa przy równych)
function zawiera(b, a, tol = 1) {
  return b.x - tol <= a.x && b.y - tol <= a.y && b.x + b.w + tol >= a.x + a.w && b.y + b.h + tol >= a.y + a.h;
}
export function scal(p) {
  return p.filter((a, i) => !p.some((b, j) => j !== i && b.strona === a.strona && zawiera(b, a) &&
    (!zawiera(a, b) || j < i)));
}

// ── kody kreskowe na obrazie strony ──────────────────────────────
// szary: Uint8Array (0–255) o wymiarach w×h. Zwraca ramki w pikselach obrazu.
// Kod kreskowy = obszar z wieloma przejściami jasne/ciemne w poziomie i prawie zerem w pionie
// (pionowe paski). Kod QR / DataMatrix = gęsta szachownica w obu kierunkach, kwadratowa.
export function wykryjKodyKreskowe(szary, w, h, opcje = {}) {
  const K = opcje.komorka || 8;
  const cw = Math.floor(w / K), ch = Math.floor(h / K);
  const typ = new Uint8Array(cw * ch); // 1 = kreski, 2 = szachownica
  const ciemny = (x, y) => szary[y * w + x] < 128;
  for (let cy = 0; cy < ch; cy++) {
    for (let cx = 0; cx < cw; cx++) {
      let hz = 0, vt = 0, ciem = 0;
      for (let y = cy * K; y < cy * K + K; y++) {
        for (let x = cx * K; x < cx * K + K; x++) {
          const c = ciemny(x, y);
          if (c) ciem++;
          if (x > cx * K && c !== ciemny(x - 1, y)) hz++;
          if (y > cy * K && c !== ciemny(x, y - 1)) vt++;
        }
      }
      const pole = K * K;
      if (ciem < pole * 0.15 || ciem > pole * 0.85) continue;
      if (hz >= K * 1.0 && vt <= K * 0.3) typ[cy * cw + cx] = 1;
      else if (hz >= K * 1.2 && vt >= K * 1.2) typ[cy * cw + cx] = 2;
    }
  }
  // spójne obszary komórek jednego typu (z tolerancją 1 komórki przerwy)
  const odw = new Uint8Array(cw * ch);
  const ramki = [];
  for (let i = 0; i < cw * ch; i++) {
    if (!typ[i] || odw[i]) continue;
    const t = typ[i];
    const stos = [i];
    odw[i] = 1;
    let x0 = cw, y0 = ch, x1 = 0, y1 = 0, n = 0;
    while (stos.length) {
      const j = stos.pop();
      const x = j % cw, y = (j / cw) | 0;
      n++;
      x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
      for (let dy = -1; dy <= 1; dy++) for (let dx = -2; dx <= 2; dx++) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= cw || ny >= ch) continue;
        const nj = ny * cw + nx;
        if (!odw[nj] && typ[nj] === t) { odw[nj] = 1; stos.push(nj); }
      }
    }
    const bw = x1 - x0 + 1, bh = y1 - y0 + 1;
    const wyp = n / (bw * bh);
    if (t === 1 && bw >= 6 && bh >= 3 && wyp > 0.45) {
      ramki.push({ x: x0 * K - K, y: y0 * K - K, w: bw * K + 2 * K, h: bh * K + 2 * K, rodzaj: 'kod kreskowy' });
    }
    if (t === 2 && bw >= 4 && bh >= 4 && bw / bh < 1.6 && bh / bw < 1.6 && wyp > 0.6) {
      ramki.push({ x: x0 * K - K, y: y0 * K - K, w: bw * K + 2 * K, h: bh * K + 2 * K, rodzaj: 'kod 2D (QR)' });
    }
  }
  // połącz nakładające się lub stykające ramki tego samego rodzaju (kod pocięty na kawałki)
  let zmiana = true;
  while (zmiana) {
    zmiana = false;
    for (let i = 0; i < ramki.length && !zmiana; i++) for (let j = i + 1; j < ramki.length && !zmiana; j++) {
      const a = ramki[i], b = ramki[j];
      if (a.rodzaj !== b.rodzaj) continue;
      // poziomo kawałki kodu dzieli czasem szerszy pasek albo cyfry — łączymy szerzej, jeśli leżą w tym samym pasie
      const odstX = K * 10, odstY = K * 2;
      const pas = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y) > 0.5 * Math.min(a.h, b.h);
      if (a.x - (pas ? odstX : odstY) <= b.x + b.w && b.x - (pas ? odstX : odstY) <= a.x + a.w && a.y - odstY <= b.y + b.h && b.y - odstY <= a.y + a.h) {
        const x = Math.min(a.x, b.x), y = Math.min(a.y, b.y);
        ramki[i] = { ...a, x, y, w: Math.max(a.x + a.w, b.x + b.w) - x, h: Math.max(a.y + a.h, b.y + b.h) - y };
        ramki.splice(j, 1);
        zmiana = true;
      }
    }
  }
  return ramki.map((r) => ({ ...r, x: Math.max(0, r.x), y: Math.max(0, r.y) }));
}

// ── tekst po anonimizacji ────────────────────────────────────────
// Słowo uznajemy za zakryte, gdy aktywna ramka pokrywa ≥ 40% jego pola.
export function slowoZakryte(w, ramki) {
  const pole = Math.max(1e-6, w.w * w.h);
  return ramki.some((r) => {
    const ix = Math.max(0, Math.min(w.x + w.w, r.x + r.w) - Math.max(w.x, r.x));
    const iy = Math.max(0, Math.min(w.y + w.h, r.y + r.h) - Math.max(w.y, r.y));
    return (ix * iy) / pole >= 0.4;
  });
}

export function tekstPoAnonimizacji(strony, ramkiAktywne) {
  const czesci = [];
  for (const st of strony) {
    const r = ramkiAktywne.filter((x) => x.strona === st.nr);
    const linie = wiersze(st.slowa).map((l) => {
      const out = [];
      for (const w of l.slowa) {
        const z = slowoZakryte(w, r);
        if (z) { if (out[out.length - 1] !== '[USUNIĘTO]') out.push('[USUNIĘTO]'); } else out.push(w.t);
      }
      return out.join(' ');
    });
    czesci.push((strony.length > 1 ? `— strona ${st.nr} —\n` : '') + linie.join('\n'));
  }
  return czesci.join('\n\n');
}

// ── wersja dla zwykłego tekstu (np. wywiad pisany własnymi słowami) ──
// Zwraca zakresy znaków: [{ od, do, kategoria, powod, tekst }] (do = indeks za ostatnim znakiem).
// Tabulator albo ≥3 spacje traktujemy jak przerwę między kolumnami formularza.
export function wykryjWTekscie(tekst, opcje = {}) {
  const slowa = [];
  const pozycje = [];
  const re = /\S+/g;
  let nrWiersza = 0, poczWiersza = 0;
  for (const linia of String(tekst).split('\n')) {
    let x = 0, ostKoniec = 0, m;
    re.lastIndex = 0;
    while ((m = re.exec(linia))) {
      const przerwa = linia.slice(ostKoniec, m.index);
      x += /\t| {3,}/.test(przerwa) ? 200 : przerwa.length * 6;
      slowa.push({ t: m[0], x, y: nrWiersza * 16, w: m[0].length * 6, h: 10 });
      pozycje.push([poczWiersza + m.index, poczWiersza + m.index + m[0].length]);
      x += m[0].length * 6;
      ostKoniec = m.index + m[0].length;
    }
    nrWiersza++;
    poczWiersza += linia.length + 1;
  }
  const wyn = [];
  for (const p of wykryj([{ nr: 1, slowa }], { ...opcje, tekstCiagly: true })) {
    const idx = slowa.map((w, i) => (slowoZakryte(w, [p]) ? i : -1)).filter((i) => i >= 0);
    if (!idx.length) continue;
    const od = Math.min(...idx.map((i) => pozycje[i][0]));
    let doZn = Math.max(...idx.map((i) => pozycje[i][1]));
    // bez końcowej interpunkcji
    while (doZn > od && /[,.;:]/.test(tekst[doZn - 1])) doZn--;
    wyn.push({ od, do: doZn, kategoria: p.kategoria, powod: p.powod, tekst: tekst.slice(od, doZn) });
  }
  wyn.sort((a, b) => a.od - b.od);
  return wyn;
}

// Podmienia zakresy na „[USUNIĘTO: kategoria]” (nakładające się zakresy są łączone).
export function zanonimizujTekst(tekst, zakresy, { znacznik = (k) => `[USUNIĘTO: ${KATEGORIE[k]?.nazwa.toLowerCase() || k}]` } = {}) {
  const z = [...zakresy].sort((a, b) => a.od - b.od);
  const scalone = [];
  for (const r of z) {
    const o = scalone[scalone.length - 1];
    if (o && r.od <= o.do) o.do = Math.max(o.do, r.do);
    else scalone.push({ ...r });
  }
  let out = '', i = 0;
  for (const r of scalone) { out += tekst.slice(i, r.od) + znacznik(r.kategoria); i = r.do; }
  return out + tekst.slice(i);
}
