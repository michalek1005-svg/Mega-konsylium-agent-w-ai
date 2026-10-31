// Fikcyjny przykład ankiety od AI (format ms-ankieta-1) dla opisu z przykładu „brzuch”.
// Tak wygląda odpowiedź Konsylium na prośbę o ankietę. Dane fikcyjne.
(function (root) {
  'use strict';
  var ankieta = {
  "format": "ms-ankieta-1",
  "kod": "DEMO-AI",
  "tytul": "Ból pod prawymi żebrami",
  "opis": "Od wczoraj boli mnie pod prawymi żebrami, zwłaszcza po tłustym jedzeniu, i promieniuje pod łopatkę. Raz zwymiotowałam. Mam 54 lata.",
  "pytania": [
    { "id": "teraz_bol", "typ": "skala", "tekst": "Jak silny jest ból w tej chwili?", "krotko": "nasilenie bólu teraz",
      "skala": ["brak bólu", "najgorszy, jaki można sobie wyobrazić"], "bo": "Punkt odniesienia; ból ≥ 8 przy kolce żółciowej przemawia za pilną oceną." },
    { "id": "goraczka", "typ": "jeden", "tekst": "Czy od początku bólu masz gorączkę albo dreszcze?", "krotko": "gorączka lub dreszcze",
      "opcje": [ { "w": "nie", "t": "Nie" }, { "w": "dreszcze", "t": "Tak, dreszcze" }, { "w": "goraczka", "t": "Tak, mierzyłam/mierzyłem gorączkę" } ],
      "bo": "Gorączka przy bólu w prawym podżebrzu sugeruje zapalenie pęcherzyka lub dróg żółciowych." },
    { "id": "temperatura", "typ": "liczba", "tekst": "Jaka była najwyższa zmierzona temperatura?", "krotko": "najwyższa temperatura",
      "min": 34, "max": 43, "krok": 0.1, "jednostka": "°C",
      "gdy": { "pytanie": "goraczka", "jest": "goraczka" }, "bo": "Próg 38 °C dla triady Charcota." },
    { "id": "zoltaczka", "typ": "wiele", "tekst": "Czy zauważyłaś/zauważyłeś któreś z tych zmian?", "krotko": "objawy cholestazy",
      "opcje": [ { "w": "oczy", "t": "Żółte białka oczu lub skóra" }, { "w": "mocz", "t": "Bardzo ciemny mocz" },
                 { "w": "stolec", "t": "Jasny, odbarwiony stolec" }, { "w": "swiad", "t": "Swędzenie skóry" },
                 { "w": "brak", "t": "Nic z tych rzeczy", "wyklucza": true } ],
      "bo": "Objawy cholestazy: kamica przewodowa, zapalenie dróg żółciowych." },
    { "id": "staly", "typ": "jeden", "tekst": "Czy ból jest stały od ponad 6 godzin, czy przychodzi i mija?", "krotko": "ciągłość bólu",
      "opcje": [ { "w": "staly", "t": "Stały, nie mija od ponad 6 godzin" }, { "w": "napady", "t": "Przychodzi napadami i mija" } ],
      "bo": "Ból ciągły > 6 h odróżnia ostre zapalenie pęcherzyka od kolki żółciowej." },
    { "id": "wymioty_ile", "typ": "jeden", "tekst": "Jak wyglądały wymioty?", "krotko": "charakter wymiotów",
      "opcje": [ { "w": "tresc", "t": "Treść pokarmowa lub żółć" }, { "w": "krew", "t": "Krew albo coś jak fusy od kawy" },
                 { "w": "wiele", "t": "Wymiotuję wielokrotnie, nie mogę nic utrzymać" } ],
      "bo": "Wyklucza krwawienie z górnego odcinka i odwodnienie." },
    { "id": "pas", "typ": "jeden", "tekst": "Czy ból idzie też opasująco do pleców, przez środek brzucha?", "krotko": "ból opasujący",
      "opcje": [ { "w": "tak", "t": "Tak" }, { "w": "nie", "t": "Nie" } ],
      "bo": "Ból opasujący po posiłku: ostre zapalenie trzustki (kamica)." },
    { "id": "epizody", "typ": "jeden", "tekst": "Czy podobny ból zdarzał się już wcześniej?", "krotko": "wcześniejsze epizody",
      "opcje": [ { "w": "nie", "t": "Nie, pierwszy raz" }, { "w": "kilka", "t": "Tak, kilka razy" }, { "w": "czesto", "t": "Tak, często" } ] },
    { "id": "usg", "typ": "jeden", "tekst": "Czy ktoś kiedyś mówił Ci o kamieniach w pęcherzyku żółciowym?", "krotko": "znana kamica",
      "opcje": [ { "w": "tak", "t": "Tak" }, { "w": "nie", "t": "Nie" } ],
      "gdy": { "pytanie": "epizody", "jest": ["kilka", "czesto"] } },
    { "id": "leki", "typ": "tekst", "tekst": "Jakie leki bierzesz na stałe? Wpisz nazwy i dawki, jeśli pamiętasz.", "krotko": "leki stałe",
      "podpowiedz": "Na przykład: amlodypina 5 mg rano" },
    { "id": "rozrzedzajace", "typ": "jeden", "tekst": "Czy bierzesz leki rozrzedzające krew?", "krotko": "leki przeciwkrzepliwe",
      "opcje": [ { "w": "tak", "t": "Tak" }, { "w": "nie", "t": "Nie" } ], "bo": "Ważne przed ewentualnym zabiegiem." },
    { "id": "obawy", "typ": "tekst", "tekst": "Czego najbardziej się obawiasz i czego oczekujesz od tej wizyty?", "krotko": "obawy i oczekiwania",
      "bezNieznanych": true }
  ],
  "flagi": [
    { "poziom": "pilne", "dlaLekarza": "Ból w prawym podżebrzu z gorączką ≥ 38 °C lub dreszczami: podejrzenie ostrego zapalenia pęcherzyka lub dróg żółciowych.",
      "gdy": { "ktorekolwiek": [ { "pytanie": "goraczka", "jest": "dreszcze" }, { "pytanie": "temperatura", "min": 38 } ] } },
    { "poziom": "112", "dlaLekarza": "Gorączka z żółtaczką (triada Charcota): podejrzenie ostrego zapalenia dróg żółciowych.",
      "gdy": { "wszystkie": [ { "pytanie": "zoltaczka", "jest": "oczy" }, { "pytanie": "goraczka", "jest": ["dreszcze", "goraczka"] } ] } },
    { "poziom": "112", "dlaLekarza": "Krwiste lub fusowate wymioty: krwawienie z górnego odcinka przewodu pokarmowego.",
      "gdy": { "pytanie": "wymioty_ile", "jest": "krew" } },
    { "poziom": "pilne", "dlaLekarza": "Uporczywe wymioty: ryzyko odwodnienia.",
      "gdy": { "pytanie": "wymioty_ile", "jest": "wiele" } },
    { "poziom": "pilne", "dlaLekarza": "Ból opasujący: wykluczyć ostre zapalenie trzustki (lipaza).",
      "gdy": { "pytanie": "pas", "jest": "tak" } },
    { "poziom": "pilne", "dlaLekarza": "Ból ciągły > 6 h lub bardzo silny: podejrzenie ostrego zapalenia pęcherzyka.",
      "gdy": { "ktorekolwiek": [ { "pytanie": "staly", "jest": "staly" }, { "pytanie": "teraz_bol", "min": 8 } ] } }
  ]
};
  if (typeof module !== 'undefined' && module.exports) module.exports = ankieta;
  else root.PrzykladAnkietyAI = ankieta;
})(typeof window !== 'undefined' ? window : this);
