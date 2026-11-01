/*
 * Bank pytań i reguł wywiadu (MS · Wywiad z pacjentem) — wersja demonstracyjna.
 *
 * MATERIAŁ TESTOWO-EDUKACYJNY. Pytania i progi czerwonych flag nie zostały
 * zatwierdzone klinicznie. Przed użyciem z prawdziwymi pacjentami muszą je
 * przejrzeć i podpisać lekarze.
 *
 * Budowa pytania:
 *   id        — klucz odpowiedzi
 *   modul     — moduł, w którym pytanie żyje (moduł włącza się regułą w `moduly`)
 *   typ       — 'jeden' | 'wiele' | 'skala' | 'liczba' | 'tekst'
 *   tekst     — treść widziana przez pacjenta
 *   krotko    — etykieta do listy NIEZNANE, gdy pacjent nie zna odpowiedzi
 *   opcje     — [{ w: wartość, t: tekst, wyklucza?: true }]
 *   gdy       — (o, ma) => bool; pytanie pojawia się tylko, gdy reguła jest spełniona
 *   priorytet — wyższy = wcześniej; pytania wykluczające zagrożenia mają najwyższy
 *   bo        — dlaczego pytamy (widzi tylko lekarz, na podglądzie)
 *   nieWiem   — czy pokazać „Nie wiem” (domyślnie tak dla typu 'jeden')
 *   pominiecie— czy można pominąć (tekst/liczba)
 *   bezNieznanych — puste pole nie trafia do listy NIEZNANE
 */
(function (root) {
  'use strict';

  var TN = [{ w: 'tak', t: 'Tak' }, { w: 'nie', t: 'Nie' }];
  var BOL = function (o, ma) { return ma(o, 'powod', ['brzuch', 'klatka', 'glowa']); };

  var moduly = [
    { id: 'start', nazwa: 'Początek' },
    { id: 'klatka', nazwa: 'Ból w klatce', gdy: function (o, ma) { return ma(o, 'powod', 'klatka'); } },
    { id: 'brzuch', nazwa: 'Ból brzucha', gdy: function (o, ma) { return ma(o, 'powod', 'brzuch'); } },
    { id: 'glowa', nazwa: 'Ból głowy', gdy: function (o, ma) { return ma(o, 'powod', 'glowa'); } },
    { id: 'oddech', nazwa: 'Kaszel i duszność', gdy: function (o, ma) { return ma(o, 'powod', 'oddech'); } },
    { id: 'goraczka', nazwa: 'Gorączka', gdy: function (o, ma) { return ma(o, 'powod', 'goraczka') || ma(o, 'b_goraczka', 'tak'); } },
    { id: 'wspolne', nazwa: 'Leki i choroby', gdy: function (o) { return o.powod != null; } }
  ];

  var pytania = [
    // ── START ───────────────────────────────────────────────
    { id: 'opis', modul: 'start', typ: 'tekst', priorytet: 101, pominiecie: true, nieWiem: false,
      tekst: 'Opisz krótko własnymi słowami, co się dzieje, od kiedy i z czym przychodzisz.',
      podpowiedz: 'Na przykład: „Od trzech miesięcy unikam rozmów z nowym szefem. Przed spotkaniami nie śpię, a zadania odkładam na noc.”',
      krotko: 'opis sytuacji własnymi słowami',
      bo: 'Punkt wyjścia. Analiza opisu wybiera moduły, uzupełnia odpowiedzi podane wprost i od razu sprawdza czerwone flagi.' },
    { id: 'powod', modul: 'start', typ: 'wiele', priorytet: 100, nieWiem: false,
      tekst: 'Z czym się dziś zgłaszasz? Zaznacz wszystko, co pasuje.',
      tekstPoOpisie: 'Czy dobrze rozumiem, z czym się zgłaszasz? Popraw, jeśli trzeba.',
      krotko: 'powód zgłoszenia',
      bo: 'Pytanie otwierające. Odpowiedź włącza moduły wywiadu.',
      opcje: [
        { w: 'brzuch', t: 'Ból brzucha' },
        { w: 'klatka', t: 'Ból lub ucisk w klatce piersiowej' },
        { w: 'glowa', t: 'Ból głowy' },
        { w: 'oddech', t: 'Kaszel lub duszność' },
        { w: 'goraczka', t: 'Gorączka lub infekcja' },
        { w: 'inne', t: 'Coś innego' }
      ] },
    { id: 'powod_opis', modul: 'start', typ: 'tekst', priorytet: 99, pominiecie: true,
      tekst: 'Opisz krótko własnymi słowami, co się dzieje.',
      krotko: 'opis dolegliwości własnymi słowami',
      bo: 'Pacjent zaznaczył „coś innego”.',
      gdy: function (o, ma) { return ma(o, 'powod', 'inne') && !(typeof o.opis === 'string' && o.opis.trim()); } },
    { id: 'wiek', modul: 'start', typ: 'liczba', priorytet: 98, min: 0, max: 120, jednostka: 'lat',
      tekst: 'Ile masz lat?', krotko: 'wiek',
      bo: 'Wiek zmienia ryzyko i włącza pytania zależne od wieku.' },
    { id: 'plec', modul: 'start', typ: 'jeden', priorytet: 97, nieWiem: false,
      tekst: 'Płeć biologiczna', krotko: 'płeć',
      bo: 'Potrzebne do pytań o ciążę i do oceny ryzyka.',
      opcje: [{ w: 'k', t: 'Kobieta' }, { w: 'm', t: 'Mężczyzna' }, { w: 'x', t: 'Wolę nie podawać' }] },
    { id: 'od_kiedy', modul: 'start', typ: 'jeden', priorytet: 96,
      tekst: 'Od kiedy trwają dolegliwości?', krotko: 'czas trwania',
      bo: 'Ostry początek kieruje wywiad na stany nagłe.',
      opcje: [
        { w: 'h', t: 'Od kilku godzin' }, { w: 'd1', t: 'Od 1–3 dni' },
        { w: 'd4', t: 'Od 4–14 dni' }, { w: 'dl', t: 'Dłużej niż 2 tygodnie' }
      ] },
    { id: 'nasilenie', modul: 'start', typ: 'skala', priorytet: 95,
      tekst: 'Jak silne są dolegliwości w tej chwili?', krotko: 'nasilenie',
      bo: 'Skala 0–10 (NRS).', skala: ['brak', 'najgorsze, jakie można sobie wyobrazić'] },

    // ── KLATKA ──────────────────────────────────────────────
    { id: 'k_charakter', modul: 'klatka', typ: 'jeden', priorytet: 90,
      tekst: 'Jak najlepiej opisać ten ból?', krotko: 'charakter bólu w klatce',
      bo: 'Najpierw wykluczamy ostry zespół wieńcowy i rozwarstwienie aorty.',
      opcje: [
        { w: 'ucisk', t: 'Ucisk, gniecenie lub pieczenie za mostkiem' },
        { w: 'oddech', t: 'Kłucie, które nasila się przy wdechu' },
        { w: 'dotyk', t: 'Boli przy dotyku albo przy ruchu tułowia' },
        { w: 'rozryw', t: 'Nagły, rozrywający ból, który idzie do pleców' },
        { w: 'inny', t: 'Inaczej' }
      ] },
    { id: 'k_objawy', modul: 'klatka', typ: 'wiele', priorytet: 89,
      tekst: 'Czy razem z bólem masz któreś z tych objawów?', krotko: 'objawy towarzyszące bólowi w klatce',
      bo: 'Objawy towarzyszące podnoszą prawdopodobieństwo OZW.',
      opcje: [
        { w: 'dusznosc', t: 'Duszność' }, { w: 'poty', t: 'Zimne poty' },
        { w: 'omdlenie', t: 'Omdlenie lub zasłabnięcie' }, { w: 'nudnosci', t: 'Nudności' },
        { w: 'kolatanie', t: 'Kołatanie serca' }, { w: 'brak', t: 'Żadnego z tych', wyklucza: true }
      ] },
    { id: 'k_promien', modul: 'klatka', typ: 'wiele', priorytet: 88,
      tekst: 'Czy ból gdzieś promieniuje?', krotko: 'promieniowanie bólu w klatce',
      opcje: [
        { w: 'reka', t: 'Do lewej ręki' }, { w: 'zuchwa', t: 'Do żuchwy lub szyi' },
        { w: 'plecy', t: 'Do pleców' }, { w: 'nie', t: 'Nie promieniuje', wyklucza: true }
      ] },
    { id: 'k_teraz', modul: 'klatka', typ: 'jeden', priorytet: 87, opcje: TN,
      tekst: 'Czy ten ból trwa teraz bez przerwy dłużej niż 20 minut?', krotko: 'czas trwania bólu zamostkowego',
      bo: 'Ból zamostkowy > 20 min to wskazanie do pilnego EKG.',
      gdy: function (o, ma) { return ma(o, 'k_charakter', 'ucisk'); } },
    { id: 'k_wysilek', modul: 'klatka', typ: 'jeden', priorytet: 80, opcje: TN,
      tekst: 'Czy ból pojawia się albo nasila przy wysiłku, na przykład na schodach?', krotko: 'związek bólu z wysiłkiem',
      gdy: function (o, ma) { return !ma(o, 'k_charakter', ['rozryw']); } },
    { id: 'k_ryzyko', modul: 'klatka', typ: 'wiele', priorytet: 60,
      tekst: 'Co z tej listy Ciebie dotyczy?', krotko: 'czynniki ryzyka sercowo-naczyniowego',
      bo: 'Czynniki ryzyka do oceny prawdopodobieństwa przedtestowego.',
      opcje: [
        { w: 'palenie', t: 'Palę papierosy' }, { w: 'cukrzyca', t: 'Cukrzyca' },
        { w: 'nadcisnienie', t: 'Nadciśnienie' }, { w: 'cholesterol', t: 'Wysoki cholesterol' },
        { w: 'rodzina', t: 'Zawał lub udar u bliskich przed 55. rokiem życia' },
        { w: 'brak', t: 'Nic z tych', wyklucza: true }
      ] },

    // ── BRZUCH ──────────────────────────────────────────────
    { id: 'b_twardy', modul: 'brzuch', typ: 'jeden', priorytet: 90, opcje: TN,
      tekst: 'Czy brzuch jest twardy jak deska, a każdy ruch lub wstrząs nasila ból?', krotko: 'objawy otrzewnowe',
      bo: 'Najpierw wykluczamy ostry brzuch (zapalenie otrzewnej).' },
    { id: 'b_miejsce', modul: 'brzuch', typ: 'wiele', priorytet: 85,
      tekst: 'Gdzie dokładnie boli?', krotko: 'lokalizacja bólu brzucha',
      opcje: [
        { w: 'nadbrzusze', t: 'Górna część, pod mostkiem' }, { w: 'prawe_pz', t: 'Pod prawymi żebrami' },
        { w: 'lewe', t: 'Po lewej stronie' }, { w: 'pepek', t: 'Wokół pępka' },
        { w: 'prawy_dol', t: 'Prawy dół brzucha' }, { w: 'podbrzusze', t: 'Podbrzusze' },
        { w: 'caly', t: 'Cały brzuch' }
      ] },
    { id: 'b_charakter', modul: 'brzuch', typ: 'jeden', priorytet: 84,
      tekst: 'Jaki jest ten ból?', krotko: 'charakter bólu brzucha',
      opcje: [
        { w: 'kolka', t: 'Falami: narasta i słabnie' }, { w: 'staly', t: 'Stały' },
        { w: 'piek', t: 'Piekący' }, { w: 'klucie', t: 'Kłujący' }
      ] },
    { id: 'b_wymioty', modul: 'brzuch', typ: 'jeden', priorytet: 83,
      tekst: 'Czy wymiotujesz?', krotko: 'wymioty',
      bo: 'Krwiste lub fusowate wymioty to krwawienie z górnego odcinka przewodu pokarmowego.',
      opcje: [{ w: 'nie', t: 'Nie' }, { w: 'tak', t: 'Tak' }, { w: 'krew', t: 'Tak, z krwią albo jak fusy od kawy' }] },
    { id: 'b_stolec', modul: 'brzuch', typ: 'wiele', priorytet: 82,
      tekst: 'Czy coś zmieniło się w wypróżnieniach?', krotko: 'wypróżnienia',
      opcje: [
        { w: 'norm', t: 'Bez zmian', wyklucza: true }, { w: 'biegunka', t: 'Biegunka' },
        { w: 'zaparcie', t: 'Zaparcie i nie odchodzą gazy' }, { w: 'smolisty', t: 'Czarny, smolisty stolec' },
        { w: 'krew', t: 'Świeża krew w stolcu' }
      ] },
    { id: 'b_ciaza', modul: 'brzuch', typ: 'jeden', priorytet: 81, opcje: TN,
      tekst: 'Czy możesz być w ciąży?', krotko: 'możliwość ciąży',
      bo: 'Kobieta w wieku rozrodczym z bólem brzucha: wykluczyć ciążę pozamaciczną.',
      gdy: function (o) { return o.plec === 'k' && (o.wiek == null || o.wiek === 'nw' || (o.wiek >= 12 && o.wiek <= 55)); } },
    { id: 'b_wedrowka', modul: 'brzuch', typ: 'jeden', priorytet: 75, opcje: TN,
      tekst: 'Czy ból zaczął się wokół pępka i potem przesunął w prawy dół brzucha?', krotko: 'wędrówka bólu',
      bo: 'Wędrówka bólu do prawego dołu biodrowego typowa dla zapalenia wyrostka.',
      gdy: function (o, ma) { return ma(o, 'b_miejsce', 'prawy_dol'); } },
    { id: 'b_posilki', modul: 'brzuch', typ: 'jeden', priorytet: 70, opcje: TN,
      tekst: 'Czy ból pojawia się po jedzeniu, zwłaszcza tłustym?', krotko: 'związek bólu z posiłkami',
      bo: 'Ból w nadbrzuszu lub prawym podżebrzu: dopytujemy o drogi żółciowe.',
      gdy: function (o, ma) { return ma(o, 'b_miejsce', ['nadbrzusze', 'prawe_pz']); } },
    { id: 'b_promien', modul: 'brzuch', typ: 'wiele', priorytet: 69,
      tekst: 'Czy ból gdzieś promieniuje?', krotko: 'promieniowanie bólu brzucha',
      opcje: [
        { w: 'lopatka', t: 'Pod prawą łopatkę' }, { w: 'opas', t: 'Opasująco, do pleców' },
        { w: 'pachwina', t: 'Do pachwiny lub krocza' }, { w: 'klatka', t: 'Do klatki piersiowej' },
        { w: 'nie', t: 'Nie promieniuje', wyklucza: true }
      ] },
    { id: 'b_zoltaczka', modul: 'brzuch', typ: 'wiele', priorytet: 68,
      tekst: 'Czy zauważyłeś(-aś) któreś z tych objawów?', krotko: 'objawy cholestazy',
      bo: 'Objawy cholestazy przy podejrzeniu chorób dróg żółciowych.',
      gdy: function (o, ma) { return ma(o, 'b_miejsce', ['nadbrzusze', 'prawe_pz']) || ma(o, 'b_promien', 'lopatka'); },
      opcje: [
        { w: 'zolte', t: 'Żółte białka oczu lub skóra' }, { w: 'mocz', t: 'Ciemny mocz' },
        { w: 'stolec', t: 'Jasny, odbarwiony stolec' }, { w: 'brak', t: 'Nic z tych', wyklucza: true }
      ] },
    { id: 'b_goraczka', modul: 'brzuch', typ: 'jeden', priorytet: 67, opcje: TN,
      tekst: 'Czy masz gorączkę albo dreszcze?', krotko: 'gorączka',
      gdy: function (o, ma) { return !ma(o, 'powod', 'goraczka'); } },
    { id: 'b_alkohol', modul: 'brzuch', typ: 'jeden', priorytet: 60,
      tekst: 'Ile alkoholu piłeś(-aś) w ostatnich dniach?', krotko: 'alkohol',
      bo: 'Ból opasujący lub w nadbrzuszu: dopytujemy o zapalenie trzustki.',
      gdy: function (o, ma) { return ma(o, 'b_promien', 'opas') || ma(o, 'b_miejsce', 'nadbrzusze'); },
      opcje: [{ w: 'brak', t: 'Wcale' }, { w: 'malo', t: 'Niewiele' }, { w: 'duzo', t: 'Dużo' }] },

    // ── GŁOWA ───────────────────────────────────────────────
    { id: 'g_nagly', modul: 'glowa', typ: 'jeden', priorytet: 90, opcje: TN,
      tekst: 'Czy ból zaczął się nagle, w ciągu kilku sekund, i jest najgorszy w Twoim życiu?', krotko: 'piorunujący początek bólu',
      bo: 'Ból piorunujący: wykluczyć krwotok podpajęczynówkowy.' },
    { id: 'g_neuro', modul: 'glowa', typ: 'wiele', priorytet: 89,
      tekst: 'Czy masz teraz któryś z tych objawów?', krotko: 'objawy neurologiczne',
      bo: 'Ogniskowe objawy neurologiczne: wykluczyć udar.',
      opcje: [
        { w: 'reka', t: 'Osłabienie lub drętwienie ręki albo nogi' }, { w: 'mowa', t: 'Kłopot z mówieniem' },
        { w: 'twarz', t: 'Opadnięty kącik ust' }, { w: 'wzrok', t: 'Podwójne widzenie albo utrata widzenia' },
        { w: 'brak', t: 'Żadnego z tych', wyklucza: true }
      ] },
    { id: 'g_kark', modul: 'glowa', typ: 'jeden', priorytet: 88, opcje: TN,
      tekst: 'Czy masz sztywny kark, tak że trudno przygiąć brodę do klatki piersiowej?', krotko: 'sztywność karku',
      bo: 'Objawy oponowe.' },
    { id: 'g_uraz', modul: 'glowa', typ: 'jeden', priorytet: 87, opcje: TN,
      tekst: 'Czy w ostatnich dniach uderzyłeś(-aś) się w głowę?', krotko: 'uraz głowy' },
    { id: 'g_charakter', modul: 'glowa', typ: 'jeden', priorytet: 70,
      tekst: 'Jaki jest ten ból głowy?', krotko: 'charakter bólu głowy',
      opcje: [
        { w: 'puls', t: 'Pulsujący, po jednej stronie' }, { w: 'ucisk', t: 'Uciskowy, jak obręcz' },
        { w: 'oko', t: 'Bardzo silny, kłujący, wokół jednego oka' }, { w: 'inny', t: 'Inaczej' }
      ] },
    { id: 'g_aura', modul: 'glowa', typ: 'jeden', priorytet: 65, opcje: TN,
      tekst: 'Czy przed bólem widzisz mroczki, błyski albo zygzaki?', krotko: 'aura',
      gdy: function (o, ma) { return ma(o, 'g_charakter', 'puls'); } },
    { id: 'g_wczesniej', modul: 'glowa', typ: 'jeden', priorytet: 63,
      tekst: 'Czy takie bóle głowy zdarzały się już wcześniej?', krotko: 'wcześniejsze bóle głowy',
      bo: 'Nowy ból głowy po 50. roku życia wymaga pilniejszej diagnostyki.',
      opcje: [{ w: 'podobne', t: 'Tak, podobne' }, { w: 'inne', t: 'Tak, ale ten jest inny' }, { w: 'nie', t: 'Nie, to pierwszy raz' }] },

    // ── ODDECH ──────────────────────────────────────────────
    { id: 'o_ciezka', modul: 'oddech', typ: 'jeden', priorytet: 90, opcje: TN,
      tekst: 'Czy z powodu duszności nie możesz powiedzieć pełnego zdania albo masz sine usta?', krotko: 'ciężka duszność',
      bo: 'Najpierw wykluczamy niewydolność oddechową.' },
    { id: 'o_spoczynek', modul: 'oddech', typ: 'jeden', priorytet: 85, opcje: TN,
      tekst: 'Czy brakuje Ci tchu także w spoczynku?', krotko: 'duszność spoczynkowa' },
    { id: 'o_kaszel', modul: 'oddech', typ: 'jeden', priorytet: 80,
      tekst: 'Jaki masz kaszel?', krotko: 'kaszel',
      opcje: [{ w: 'suchy', t: 'Suchy' }, { w: 'mokry', t: 'Z odkrztuszaniem' }, { w: 'krew', t: 'Z krwią' }, { w: 'brak', t: 'Nie kaszlę' }] },
    { id: 'o_lydka', modul: 'oddech', typ: 'jeden', priorytet: 79, opcje: TN,
      tekst: 'Czy jedna łydka jest obrzęknięta lub bolesna, albo ostatnio długo leżałeś(-aś) lub podróżowałeś(-aś)?',
      krotko: 'czynniki ryzyka zatorowości', bo: 'Duszność + objawy ze strony łydki: wykluczyć zatorowość płucną.' },
    { id: 'o_saturacja', modul: 'oddech', typ: 'liczba', priorytet: 70, min: 50, max: 100, jednostka: '% SpO₂', pominiecie: true,
      tekst: 'Jeśli masz pulsoksymetr, jaki pokazuje wynik?', krotko: 'saturacja' },
    { id: 'o_swist', modul: 'oddech', typ: 'jeden', priorytet: 60, opcje: TN,
      tekst: 'Czy słyszysz świsty przy oddychaniu?', krotko: 'świsty' },

    // ── GORĄCZKA ────────────────────────────────────────────
    { id: 't_wysypka', modul: 'goraczka', typ: 'jeden', priorytet: 86, opcje: TN,
      tekst: 'Czy pojawiła się wysypka z plamek, które nie bledną, gdy przyciśniesz do nich szklankę?', krotko: 'wysypka krwotoczna',
      bo: 'Gorączka + wybroczyny: wykluczyć sepsę meningokokową.' },
    { id: 't_splatanie', modul: 'goraczka', typ: 'jeden', priorytet: 85, opcje: TN,
      tekst: 'Czy ktoś zauważył, że jesteś splątany(-a) albo trudno Cię dobudzić?', krotko: 'splątanie' },
    { id: 't_temp', modul: 'goraczka', typ: 'liczba', priorytet: 84, min: 34, max: 43, krok: 0.1, jednostka: '°C', pominiecie: true,
      tekst: 'Jaka była najwyższa zmierzona temperatura?', krotko: 'najwyższa temperatura' },
    { id: 't_zrodlo', modul: 'goraczka', typ: 'wiele', priorytet: 70,
      tekst: 'Czy oprócz gorączki masz któreś z tych dolegliwości?', krotko: 'źródło infekcji',
      opcje: [
        { w: 'gardlo', t: 'Ból gardła' }, { w: 'kaszel', t: 'Kaszel' },
        { w: 'mocz', t: 'Pieczenie przy oddawaniu moczu' }, { w: 'biegunka', t: 'Biegunka' },
        { w: 'brak', t: 'Nic z tych', wyklucza: true }
      ] },
    { id: 't_podroz', modul: 'goraczka', typ: 'jeden', priorytet: 55, opcje: TN,
      tekst: 'Czy w ostatnim miesiącu byłeś(-aś) w tropikach?', krotko: 'podróże' },

    // ── WSPÓLNE ─────────────────────────────────────────────
    { id: 'w_choroby', modul: 'wspolne', typ: 'wiele', priorytet: 20,
      tekst: 'Na jakie choroby przewlekłe się leczysz?', krotko: 'choroby przewlekłe',
      opcje: [
        { w: 'nadcisnienie', t: 'Nadciśnienie' }, { w: 'cukrzyca', t: 'Cukrzyca' },
        { w: 'serce', t: 'Choroby serca' }, { w: 'pluca', t: 'Astma lub POChP' },
        { w: 'nerki', t: 'Choroby nerek' }, { w: 'nowotwor', t: 'Nowotwór' },
        { w: 'brak', t: 'Żadne z tych', wyklucza: true }
      ] },
    { id: 'w_leki', modul: 'wspolne', typ: 'tekst', priorytet: 19, pominiecie: true,
      tekst: 'Jakie leki i suplementy bierzesz? Wpisz nazwy i dawki, jeśli pamiętasz.', krotko: 'pełna lista leków' },
    { id: 'w_antykoag', modul: 'wspolne', typ: 'jeden', priorytet: 18, opcje: TN,
      tekst: 'Czy bierzesz leki przeciwzakrzepowe („rozrzedzające krew”)?', krotko: 'leki przeciwzakrzepowe' },
    { id: 'w_przeciwbolowe', modul: 'wspolne', typ: 'jeden', priorytet: 17,
      tekst: 'Czy w ostatnich dniach brałeś(-aś) leki przeciwbólowe?', krotko: 'leki przeciwbólowe',
      gdy: BOL,
      opcje: [
        { w: 'nie', t: 'Nie' }, { w: 'paracetamol', t: 'Paracetamol' },
        { w: 'nlpz', t: 'Ibuprofen, ketoprofen lub podobne' }, { w: 'inne', t: 'Inne' }
      ] },
    { id: 'w_alergie', modul: 'wspolne', typ: 'tekst', priorytet: 16, pominiecie: true,
      tekst: 'Czy masz uczulenie na jakieś leki? Jeśli tak, na jakie?', krotko: 'alergie' },
    { id: 'w_epizody', modul: 'wspolne', typ: 'jeden', priorytet: 15, opcje: TN,
      tekst: 'Czy podobne dolegliwości zdarzały się już wcześniej?', krotko: 'wcześniejsze epizody',
      gdy: function (o) { return o.g_wczesniej == null; } },
    { id: 'w_obawy', modul: 'wspolne', typ: 'tekst', priorytet: 11, pominiecie: true, bezNieznanych: true,
      tekst: 'Czego najbardziej się obawiasz i czego oczekujesz od tej wizyty?', krotko: 'obawy i oczekiwania pacjenta',
      bo: 'Perspektywa pacjenta (obawy, oczekiwania): w badaniach wywiad komputerowy wypadał tu najsłabiej.' },
    { id: 'w_dodatkowe', modul: 'wspolne', typ: 'tekst', priorytet: 10, pominiecie: true, bezNieznanych: true,
      tekst: 'Czy jest coś jeszcze, co lekarz powinien wiedzieć?', krotko: 'uwagi pacjenta' }
  ];

  var P112 = 'Te objawy mogą oznaczać stan zagrożenia życia. Zadzwoń teraz pod numer 112. Nie czekaj na koniec ankiety.';
  var PILNE = 'Te objawy wymagają dziś oceny lekarza. Skontaktuj się z przychodnią lub nocną pomocą lekarską.';

  var flagi = [
    { id: 'ozw', poziom: '112', dlaPacjenta: P112,
      dlaLekarza: 'Ból zamostkowy uciskowy z objawami towarzyszącymi lub > 20 min: podejrzenie OZW.',
      gdy: function (o, ma) {
        return ma(o, 'k_charakter', 'ucisk') &&
          (ma(o, 'k_objawy', ['dusznosc', 'poty', 'omdlenie']) || ma(o, 'k_promien', ['reka', 'zuchwa']) || ma(o, 'k_teraz', 'tak'));
      } },
    { id: 'aorta', poziom: '112', dlaPacjenta: P112,
      dlaLekarza: 'Nagły, rozrywający ból w klatce promieniujący do pleców: podejrzenie rozwarstwienia aorty.',
      gdy: function (o, ma) { return ma(o, 'k_charakter', 'rozryw'); } },
    { id: 'omdlenie', poziom: 'pilne', dlaPacjenta: PILNE,
      dlaLekarza: 'Omdlenie towarzyszące bólowi w klatce.',
      gdy: function (o, ma) { return ma(o, 'k_objawy', 'omdlenie'); } },
    { id: 'otrzewna', poziom: '112', dlaPacjenta: P112,
      dlaLekarza: 'Deskowaty brzuch, ból nasilany ruchem: objawy otrzewnowe.',
      gdy: function (o, ma) { return ma(o, 'b_twardy', 'tak'); } },
    { id: 'krwawienie_gi', poziom: '112', dlaPacjenta: P112,
      dlaLekarza: 'Krwiste/fusowate wymioty lub smoliste stolce: krwawienie z przewodu pokarmowego.',
      gdy: function (o, ma) { return ma(o, 'b_wymioty', 'krew') || ma(o, 'b_stolec', 'smolisty'); } },
    { id: 'niedroznosc', poziom: 'pilne', dlaPacjenta: PILNE,
      dlaLekarza: 'Zatrzymanie gazów i stolca z wymiotami: podejrzenie niedrożności.',
      gdy: function (o, ma) { return ma(o, 'b_stolec', 'zaparcie') && ma(o, 'b_wymioty', ['tak', 'krew']); } },
    { id: 'ciaza', poziom: 'pilne', dlaPacjenta: PILNE,
      dlaLekarza: 'Ból brzucha u kobiety, ciąża możliwa lub niewykluczona: wykluczyć ciążę pozamaciczną (beta-hCG).',
      gdy: function (o, ma) { return ma(o, 'b_ciaza', ['tak', 'nw']); } },
    { id: 'cholangitis', poziom: 'pilne', dlaPacjenta: PILNE,
      dlaLekarza: 'Żółtaczka z gorączką: podejrzenie zapalenia dróg żółciowych.',
      gdy: function (o, ma) { return ma(o, 'b_zoltaczka', 'zolte') && (ma(o, 'b_goraczka', 'tak') || o.t_temp >= 38); } },
    { id: 'wyrostek', poziom: 'pilne', dlaPacjenta: PILNE,
      dlaLekarza: 'Ból wędrujący od pępka do prawego dołu biodrowego: podejrzenie zapalenia wyrostka.',
      gdy: function (o, ma) { return ma(o, 'b_wedrowka', 'tak'); } },
    { id: 'krew_stolec', poziom: 'pilne', dlaPacjenta: PILNE,
      dlaLekarza: 'Świeża krew w stolcu.',
      gdy: function (o, ma) { return ma(o, 'b_stolec', 'krew'); } },
    { id: 'sah', poziom: '112', dlaPacjenta: P112,
      dlaLekarza: 'Piorunujący, najsilniejszy w życiu ból głowy: wykluczyć krwotok podpajęczynówkowy.',
      gdy: function (o, ma) { return ma(o, 'g_nagly', 'tak'); } },
    { id: 'udar', poziom: '112', dlaPacjenta: P112,
      dlaLekarza: 'Ogniskowe objawy neurologiczne: podejrzenie udaru.',
      gdy: function (o, ma) { return ma(o, 'g_neuro', ['reka', 'mowa', 'twarz', 'wzrok']); } },
    { id: 'opony', poziom: '112', dlaPacjenta: P112,
      dlaLekarza: 'Sztywność karku z gorączką: podejrzenie zapalenia opon mózgowo-rdzeniowych.',
      gdy: function (o, ma) { return ma(o, 'g_kark', 'tak') && (ma(o, 'powod', 'goraczka') || ma(o, 'b_goraczka', 'tak') || o.t_temp >= 38); } },
    { id: 'kark', poziom: 'pilne', dlaPacjenta: PILNE,
      dlaLekarza: 'Sztywność karku (bez zgłoszonej gorączki).',
      gdy: function (o, ma) { return ma(o, 'g_kark', 'tak') && !(ma(o, 'powod', 'goraczka') || ma(o, 'b_goraczka', 'tak') || o.t_temp >= 38); } },
    { id: 'uraz_glowy', poziom: 'pilne', dlaPacjenta: PILNE,
      dlaLekarza: 'Ból głowy po urazie' + ' (szczególnie przy lekach przeciwzakrzepowych).',
      gdy: function (o, ma) { return ma(o, 'g_uraz', 'tak'); } },
    { id: 'nowy_po50', poziom: 'pilne', dlaPacjenta: PILNE,
      dlaLekarza: 'Nowy lub inny niż dotąd ból głowy po 50. roku życia.',
      gdy: function (o, ma) { return o.wiek >= 50 && ma(o, 'g_wczesniej', ['nie', 'inne']); } },
    { id: 'niewydolnosc', poziom: '112', dlaPacjenta: P112,
      dlaLekarza: 'Duszność uniemożliwiająca mówienie pełnymi zdaniami lub sinica.',
      gdy: function (o, ma) { return ma(o, 'o_ciezka', 'tak'); } },
    { id: 'saturacja', poziom: 'pilne', dlaPacjenta: PILNE,
      dlaLekarza: 'SpO₂ poniżej 92% w pomiarze domowym.',
      gdy: function (o) { return typeof o.o_saturacja === 'number' && o.o_saturacja < 92; } },
    { id: 'ztp', poziom: 'pilne', dlaPacjenta: PILNE,
      dlaLekarza: 'Duszność z objawami lub czynnikami ryzyka zakrzepicy: wykluczyć zatorowość płucną.',
      gdy: function (o, ma) { return ma(o, 'o_lydka', 'tak') && (ma(o, 'o_spoczynek', 'tak') || ma(o, 'powod', 'klatka')); } },
    { id: 'krwioplucie', poziom: 'pilne', dlaPacjenta: PILNE,
      dlaLekarza: 'Krwioplucie.',
      gdy: function (o, ma) { return ma(o, 'o_kaszel', 'krew'); } },
    { id: 'wybroczyny', poziom: '112', dlaPacjenta: P112,
      dlaLekarza: 'Gorączka z wysypką niebladnącą pod uciskiem: podejrzenie sepsy meningokokowej.',
      gdy: function (o, ma) { return ma(o, 't_wysypka', 'tak'); } },
    { id: 'splatanie', poziom: '112', dlaPacjenta: P112,
      dlaLekarza: 'Gorączka ze splątaniem lub zaburzeniami świadomości.',
      gdy: function (o, ma) { return ma(o, 't_splatanie', 'tak'); } },
    { id: 'wysoka', poziom: 'pilne', dlaPacjenta: PILNE,
      dlaLekarza: 'Temperatura ≥ 39,5 °C.',
      gdy: function (o) { return o.t_temp >= 39.5; } }
  ];

  var A = (typeof module !== 'undefined' && module.exports) ? require('./analiza.js') : root.AnalizaOpisu;

  var bank = {
    analizuj: A ? A.analizuj : null,
    wersja: 'demo-2026-10-31',
    moduly: moduly,
    pytania: pytania,
    flagi: flagi,
    // Tego ankieta pacjenta nie ustali — zawsze trafia do NIEZNANE.
    zawszeNieznane: ['badanie fizykalne i parametry życiowe (ankieta tego nie obejmuje)', 'aktualne wyniki badań']
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = bank;
  else root.BankWywiadu = bank;
})(typeof window !== 'undefined' ? window : this);
