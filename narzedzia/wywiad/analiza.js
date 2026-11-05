/*
 * Analiza opisu dolegliwości pisanego przez pacjenta własnymi słowami.
 *
 * Wersja regułowa (słowa kluczowe + prosta obsługa zaprzeczeń „nie / bez / brak”).
 * Działa w przeglądarce, bez wysyłania tekstu na zewnątrz. W kolejnym kroku tę
 * funkcję może zastąpić Claude, który zwróci TEN SAM kształt wyniku:
 *
 *   {
 *     moduly:      ['brzuch', ...],             // podpowiedź do pytania „Z czym się zgłaszasz?”
 *     fakty:       { b_posilki: 'tak', wiek: 54 }, // odpowiedzi wprost z opisu → te pytania są pomijane
 *     podpowiedzi: { b_miejsce: ['prawe_pz'] },    // wstępne zaznaczenia w pytaniach wielokrotnego wyboru
 *     slady:       [{ fragment, id, wartosc, rodzaj }] // co w tekście dało dany wniosek (dla lekarza)
 *   }
 *
 * Zasada bezpieczeństwa: z opisu wyciągamy tylko to, co pacjent napisał wprost.
 * Brak wzmianki o objawie nigdy nie jest traktowany jak „nie”.
 */
(function (root) {
  'use strict';

  function normalizuj(t) {
    // Zachowuje długość tekstu (1 znak → 1 znak), więc indeksy pasują do oryginału.
    return String(t).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ł/g, 'l');
  }

  var MODULY = [
    { modul: 'brzuch', re: /brzuch|nadbrzus|podbrzus|zoladk|zoladek|pod (prawymi |lewymi )?zebr|wyrost|pepk|pepek|watrob|pecherzyk/ },
    { modul: 'klatka', re: /klat(k|c)|mostk|w sercu|serce mnie|zawal/ },
    { modul: 'glowa', re: /glow|migren/ },
    { modul: 'oddech', re: /kaszl|kaszel|kaszle|dusz|oddych|tchu|zadysz|swist/ },
    { modul: 'goraczka', re: /goracz|temperatur|dreszcz|infekc|przezieb/ }
  ];

  // rodzaj: 'fakt' (pytanie pomijane) albo 'podp' (wstępne zaznaczenie w pytaniu „wiele”)
  // neg: wartość, gdy fraza jest poprzedzona zaprzeczeniem (np. „bez gorączki” → 'nie')
  var REGULY = [
    { id: 'od_kiedy', rodzaj: 'fakt', w: 'h', re: /od (kilku |paru |)godzin|od godziny|od rana|dzis rano|od dzisiaj|od dzis|od wczoraj wieczor|od pol godziny/ },
    { id: 'od_kiedy', rodzaj: 'fakt', w: 'd1', re: /od wczoraj|od (2|3|dwoch|trzech|kilku|paru) dni|od przedwczoraj/ },
    { id: 'od_kiedy', rodzaj: 'fakt', w: 'd4', re: /od tygodnia|od (4|5|6|7|8|9|10|czterech|pieciu|szesciu) dni|od (2|dwoch) tygodni/ },
    { id: 'od_kiedy', rodzaj: 'fakt', w: 'dl', re: /od miesiac|od (kilku |paru |)miesiecy|od (3|4|5|kilku|paru|trzech) tygodni|od roku|od dawna|od lat/ },

    { id: 'plec', rodzaj: 'fakt', w: 'k', re: /\bkobieta\b|w ciazy|\b(bylam|mialam|zauwazylam|wzielam|poczulam|zwymiotowalam|wymiotowalam|zemdlalam|upadlam|uderzylam|musialam|moglam|spocona|zmeczona)\b/ },
    { id: 'plec', rodzaj: 'fakt', w: 'm', re: /\bmezczyzna\b|\b(bylem|mialem|zauwazylem|wzialem|poczulem|zwymiotowalem|wymiotowalem|zemdlalem|upadlem|uderzylem|musialem|moglem|spocony|zmeczony)\b/ },

    // brzuch
    { id: 'b_twardy', rodzaj: 'fakt', w: 'tak', re: /twardy jak deska|brzuch (jest )?twardy|deskowat/ },
    { id: 'b_miejsce', rodzaj: 'podp', w: 'prawe_pz', re: /pod prawymi zebr|prawe podzebr|pod zebrami po prawej|prawym podzebrz|pod prawym zebr/ },
    { id: 'b_miejsce', rodzaj: 'podp', w: 'nadbrzusze', re: /nadbrzus|w dolku|zoladek|zoladku|pod mostkiem/ },
    { id: 'b_miejsce', rodzaj: 'podp', w: 'pepek', re: /pepk|pepek/ },
    { id: 'b_miejsce', rodzaj: 'podp', w: 'prawy_dol', re: /prawy dol|prawym dole|prawej stronie podbrzusza|nad prawa pachwin/ },
    { id: 'b_miejsce', rodzaj: 'podp', w: 'podbrzusze', re: /podbrzus/ },
    { id: 'b_miejsce', rodzaj: 'podp', w: 'lewe', re: /po lewej stronie brzucha|lewym boku|lewej stronie brzucha/ },
    { id: 'b_charakter', rodzaj: 'fakt', w: 'kolka', re: /kolk|falami|chwyta i puszcza|narasta i slabnie/ },
    { id: 'b_charakter', rodzaj: 'fakt', w: 'piek', re: /piecze|pieczenie w zoladku|zgaga/ },
    { id: 'b_posilki', rodzaj: 'fakt', w: 'tak', neg: 'nie', re: /po (jedzeniu|posilk|tlust|obiedzie|kolacji|smazon)/ },
    { id: 'b_promien', rodzaj: 'podp', w: 'lopatka', re: /lopatk/ },
    { id: 'b_promien', rodzaj: 'podp', w: 'opas', re: /opasuj|jak pasem/ },
    { id: 'b_wymioty', rodzaj: 'fakt', w: 'krew', re: /wymiot\w* (z )?krwi|wymiot\w* krwia|krwaw\w* wymiot|fusy|jak fusy/ },
    { id: 'b_wymioty', rodzaj: 'fakt', w: 'tak', neg: 'nie', re: /wymiot|zwymiotow/ },
    { id: 'b_stolec', rodzaj: 'podp', w: 'smolisty', re: /smolist|czarny stolec|czarne stolce/ },
    { id: 'b_stolec', rodzaj: 'podp', w: 'krew', re: /krew w stolcu|krwi w stolcu|krwawienie z odbytu/ },
    { id: 'b_stolec', rodzaj: 'podp', w: 'biegunka', re: /biegunk|rozwolnien/ },
    { id: 'b_stolec', rodzaj: 'podp', w: 'zaparcie', re: /zaparci|nie odchodza gazy|nie oddaje gazow/ },
    { id: 'b_goraczka', rodzaj: 'fakt', w: 'tak', neg: 'nie', re: /goracz|dreszcz/ },
    { id: 'b_zoltaczka', rodzaj: 'podp', w: 'zolte', re: /zolte oczy|zoltaczk|pozolkl|zolta skora|zolte bialka/ },
    { id: 'b_zoltaczka', rodzaj: 'podp', w: 'mocz', re: /ciemny mocz|mocz jak piwo|ciemniejszy mocz/ },

    // klatka
    { id: 'k_charakter', rodzaj: 'fakt', w: 'rozryw', re: /rozryw|rozdzier/ },
    { id: 'k_charakter', rodzaj: 'fakt', w: 'ucisk', re: /ucisk|gniecie|gniot|sciska|ciezar na klatce|pieczenie za mostkiem|pali za mostkiem|cos mi siedzi na klatce/ },
    { id: 'k_charakter', rodzaj: 'fakt', w: 'oddech', re: /klu\w* .{0,25}(wdech|oddech)|(wdech|oddech)\w* .{0,25}klu/ },
    { id: 'k_objawy', rodzaj: 'podp', w: 'poty', re: /zimny pot|spocon|poce sie|oblewa mnie pot|zlany potem/ },
    { id: 'k_objawy', rodzaj: 'podp', w: 'dusznosc', re: /dusz|brak tchu|nie moge zlapac tchu/ },
    { id: 'k_objawy', rodzaj: 'podp', w: 'omdlenie', re: /zemdl|omdl|zaslab|stracil\w* przytomn/ },
    { id: 'k_objawy', rodzaj: 'podp', w: 'nudnosci', re: /nudnos|mdli|mdlosci/ },
    { id: 'k_objawy', rodzaj: 'podp', w: 'kolatanie', re: /kolat|serce wali|serce bije szybko/ },
    { id: 'k_promien', rodzaj: 'podp', w: 'reka', re: /lew\w* rek|lewe ramie|do reki|w reke/ },
    { id: 'k_promien', rodzaj: 'podp', w: 'zuchwa', re: /zuchw|szczek|w szyje|do szyi/ },
    { id: 'k_promien', rodzaj: 'podp', w: 'plecy', re: /do plec|w plecy|miedzy lopatk/ },
    { id: 'k_wysilek', rodzaj: 'fakt', w: 'tak', re: /przy wysilku|na schodach|po schodach|przy chodzeniu|jak szybko ide/ },

    // głowa
    { id: 'g_nagly', rodzaj: 'fakt', w: 'tak', re: /najgorszy bol\w*( glowy)? w zyciu|jak uderzenie|jak piorun|piorunuj|nagle jakby ktos uderzyl/ },
    { id: 'g_neuro', rodzaj: 'podp', w: 'reka', re: /(dretw|oslab|bezwlad)\w* .{0,20}(rek|nog)|nie moge ruszyc (reka|noga)/ },
    { id: 'g_neuro', rodzaj: 'podp', w: 'mowa', re: /belkocz|belkot|trudno mi mowic|nie moge mowic|platal mi sie jezyk|placze mi sie jezyk/ },
    { id: 'g_neuro', rodzaj: 'podp', w: 'twarz', re: /opad\w* .{0,15}(kacik|usta|twarz)|krzywa twarz|krzywe usta/ },
    { id: 'g_neuro', rodzaj: 'podp', w: 'wzrok', re: /widze podwojnie|dwoi mi sie|stracil\w* wzrok|nie widze na/ },
    { id: 'g_kark', rodzaj: 'fakt', w: 'tak', neg: 'nie', re: /sztywn\w* kark|kark\w* sztywn/ },
    { id: 'g_uraz', rodzaj: 'fakt', w: 'tak', re: /uderzyl\w* (sie )?(w )?glow|upadl\w*|uraz glowy/ },
    { id: 'g_charakter', rodzaj: 'fakt', w: 'puls', re: /pulsuj|tetni/ },
    { id: 'g_charakter', rodzaj: 'fakt', w: 'ucisk', re: /obrecz|jak w imadle|sciska glowe/ },
    { id: 'g_aura', rodzaj: 'fakt', w: 'tak', re: /mroczk|blyski|zygzak|aura/ },

    // oddech
    { id: 'o_ciezka', rodzaj: 'fakt', w: 'tak', re: /nie moge (powiedziec|dokonczyc) zdania|sine usta|sinieje|zsinial/ },
    { id: 'o_spoczynek', rodzaj: 'fakt', w: 'tak', re: /w spoczynku|nawet (jak |gdy )?leze|na lezaco|przy siedzeniu/ },
    { id: 'o_kaszel', rodzaj: 'fakt', w: 'krew', re: /krwioplu|kaszl\w* krwia|krew przy kaszlu|krwi\w* w plwocin/ },
    { id: 'o_kaszel', rodzaj: 'fakt', w: 'mokry', re: /mokry kaszel|odkrztusz|flegm|wydzielin|plwocin/ },
    { id: 'o_kaszel', rodzaj: 'fakt', w: 'suchy', re: /suchy kaszel|suchym kaszlem/ },
    { id: 'o_lydka', rodzaj: 'fakt', w: 'tak', re: /lydk|po dlugiej podrozy|po locie|unieruchom|w gipsie/ },
    { id: 'o_swist', rodzaj: 'fakt', w: 'tak', re: /swist|rzezi/ },

    // gorączka
    { id: 't_wysypka', rodzaj: 'fakt', w: 'tak', re: /wybroczyn|plam\w* .{0,30}nie (znika|bledn)/ },
    { id: 't_splatanie', rodzaj: 'fakt', w: 'tak', re: /splatan|nie wie gdzie jest|trudno (go |ja |mnie )?dobudzic/ },
    { id: 't_zrodlo', rodzaj: 'podp', w: 'gardlo', re: /gardl/ },
    { id: 't_zrodlo', rodzaj: 'podp', w: 'mocz', re: /piecze przy (siusianiu|oddawaniu moczu)|pieczenie przy (siusianiu|oddawaniu moczu)/ },

    // leki
    { id: 'w_antykoag', rodzaj: 'fakt', w: 'tak', re: /xarelto|eliquis|pradaxa|acenokumarol|sintrom|warfaryn|rywaroksaban|apiksaban|dabigatran|na rozrzedzenie krwi/ },
    { id: 'w_przeciwbolowe', rodzaj: 'fakt', w: 'nlpz', re: /ibuprofen|ibuprom|nurofen|ketonal|ketoprofen|naproksen|diklofenak|pyralgin/ },
    { id: 'w_przeciwbolowe', rodzaj: 'fakt', w: 'paracetamol', re: /paracetamol|apap|panadol|codipar/ }
  ];

  function zaprzeczone(n, idx) {
    var przed = n.slice(Math.max(0, idx - 22), idx);
    return /\b(nie|bez|brak|ani|zadnych|zadnej|zadnego)\b[^.,;!?]*$/.test(przed);
  }

  // Rozszerza dopasowanie do końca słowa („łopatk” → „łopatkę”), żeby lekarz widział pełne słowa.
  function doKoncaSlowa(n, koniec) {
    while (koniec < n.length && /[a-z]/.test(n[koniec])) koniec++;
    return koniec;
  }

  var PREFIKSY = { b_: 'brzuch', k_: 'klatka', g_: 'glowa', o_: 'oddech', t_: 'goraczka' };

  function analizuj(tekst) {
    var wynik = { moduly: [], fakty: {}, podpowiedzi: {}, slady: [] };
    if (typeof tekst !== 'string' || !tekst.trim()) return wynik;
    var n = normalizuj(tekst);

    MODULY.forEach(function (m) {
      var r = m.re.exec(n);
      if (r && !zaprzeczone(n, r.index)) wynik.moduly.push(m.modul);
    });

    REGULY.forEach(function (reg) {
      var r = reg.re.exec(n);
      if (!r) return;
      var neg = zaprzeczone(n, r.index);
      if (neg && !reg.neg) return;
      var w = neg ? reg.neg : reg.w;
      var fragment = tekst.slice(r.index, doKoncaSlowa(n, r.index + r[0].length));
      if (reg.rodzaj === 'fakt') {
        if (wynik.fakty[reg.id] !== undefined) return; // pierwsza (bardziej szczegółowa) reguła wygrywa
        wynik.fakty[reg.id] = w;
      } else {
        var lista = wynik.podpowiedzi[reg.id] || (wynik.podpowiedzi[reg.id] = []);
        if (lista.indexOf(w) !== -1) return;
        lista.push(w);
      }
      wynik.slady.push({ fragment: fragment, id: reg.id, wartosc: w, rodzaj: reg.rodzaj });
    });

    // Objaw przypisany do modułu włącza ten moduł, nawet gdy nie padła jego nazwa.
    wynik.slady.forEach(function (sl) {
      var m = PREFIKSY[sl.id.slice(0, 2)];
      if (m && sl.id !== 'b_goraczka' && wynik.moduly.indexOf(m) === -1) wynik.moduly.push(m);
    });

    var wiek = /(?:mam |^|\s)(\d{1,3})\s?(?:lat|lata|l\.|-?latk|letni)/.exec(n);
    if (wiek && +wiek[1] <= 120) {
      wynik.fakty.wiek = +wiek[1];
      wynik.slady.push({ fragment: tekst.slice(wiek.index, wiek.index + wiek[0].length).trim(), id: 'wiek', wartosc: +wiek[1], rodzaj: 'fakt' });
    }
    var temp = /(3[5-9]|4[0-2])(?:[.,](\d))?\s?(?:st|°|stopn|c\b)/.exec(n) || /(?:goraczk\w*|temperatur\w*)\D{0,8}(3[5-9]|4[0-2])(?:[.,](\d))?/.exec(n);
    if (temp) {
      var t = parseFloat(temp[1] + '.' + (temp[2] || '0'));
      wynik.fakty.t_temp = t;
      wynik.slady.push({ fragment: tekst.slice(temp.index, temp.index + temp[0].length).trim(), id: 't_temp', wartosc: t, rodzaj: 'fakt' });
      if (wynik.moduly.indexOf('goraczka') === -1 && t >= 38) wynik.moduly.push('goraczka');
    }
    var skala = /\b(10|[0-9])\s?(?:\/|na)\s?10\b/.exec(n);
    if (skala) {
      wynik.fakty.nasilenie = +skala[1];
      wynik.slady.push({ fragment: tekst.slice(skala.index, skala.index + skala[0].length), id: 'nasilenie', wartosc: +skala[1], rodzaj: 'fakt' });
    }
    return wynik;
  }

  var api = { analizuj: analizuj, normalizuj: normalizuj };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.AnalizaOpisu = api;
})(typeof window !== 'undefined' ? window : this);
