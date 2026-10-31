# MS · Wywiad z pacjentem (prototyp)

Adaptacyjna ankieta, którą pacjent otwiera z linku. Po każdej odpowiedzi silnik dobiera kolejne pytanie, a lekarz widzi na żywo odpowiedzi, czerwone flagi i to, dlaczego padło dane pytanie. Na końcu wywiad eksportuje się do pliku `01-wywiad.md` w formacie sprawy Konsylium.

**Status: materiał testowo-edukacyjny, tylko dane fikcyjne.** Pytania i progi czerwonych flag nie są zatwierdzone klinicznie. Nic nie jest wysyłane na serwer: odpowiedzi zostają w przeglądarce (localStorage).

## Pliki

| Plik | Co robi |
|---|---|
| `index.html` | Okno wywiadu: widok pacjenta i podgląd lekarza obok siebie |
| `analiza.js` | Analiza opisu dolegliwości pisanego własnymi słowami (słowa kluczowe, zaprzeczenia) |
| `silnik.js` | Logika: przeliczenie stanu, wybór następnego pytania, czerwone flagi, eksport do `01-wywiad.md` |
| `pytania.js` | Bank pytań, moduły i reguły czerwonych flag (to edytują lekarze) |
| `przyklady.js` | Fikcyjne scenariusze do demo i testów |
| `ankieta.js` | Ankieta od AI: krok 1 (prośba z opisem), wczytanie pliku `ms-ankieta-1` jako banku pytań |
| `FORMAT-ANKIETY.md` | Format ankiety i zasady dla Konsylium, jak ją przygotować |
| `przyklad-ankieta-ai.js` | Fikcyjna ankieta od AI do demo i testów |
| `test-silnik.js`, `test-ankieta.js` | Testy: `node narzedzia/wywiad/test-silnik.js` i `node narzedzia/wywiad/test-ankieta.js` |

Uruchomienie: otwórz `index.html` w przeglądarce. Nie trzeba nic budować.

## Pytania od AI (dwa kroki)

1. **Opis pacjenta dla AI.** Pacjent pisze, co mu dolega. Lekarz klika „Kopiuj opis do Konsylium” i wkleja zanonimizowany opis do czatu projektu.
2. **Wczytaj ankietę od AI.** Konsylium odpowiada ankietą JSON przygotowaną dla tego pacjenta (format: `FORMAT-ANKIETY.md`). Lekarz wkleja ją w aplikacji, pacjent odpowiada, a gotowy wywiad wraca do Konsylium przyciskiem „Kopiuj wywiad do Konsylium”.

Aplikacja nadal nie łączy się z siecią. AI pracuje w czacie Konsylium, a dane przenosi lekarz przez schowek. Ankieta standardowa bez AI nadal jest dostępna.

## Na żywo z Konsylium (od 0.4.0, aplikacja Windows)

Trzecia droga obok dwóch kroków przez schowek: aplikacja i Claude dzielą folder na dysku (kopia repo Konsylium). Aplikacja po każdej odpowiedzi zapisuje zanonimizowany `wywiad-na-zywo/<KOD>/stan.json`, Claude dopisuje pytania do `ankieta.json`, a pacjent w tym czasie widzi „Dobieram kolejne pytania…”. Przycisk **Dołącz wyniki badań** otwiera anonimizator i wraca z zanonimizowanym tekstem do wywiadu. **Wyślij do Konsylium** zapisuje `01-wywiad.md`. Protokół i instrukcja dla Claude: `docs/NA-ZYWO.md`, skrypt `skrypty/wywiad_na_zywo.py`.

## Jak działa dobór pytań

0. **Punkt wyjścia: opis własnymi słowami.** Pacjent pisze krótko, co mu dolega. Analiza opisu (`analiza.js`) od razu:
   - wybiera moduły (np. „gniecie w klatce” → ból w klatce),
   - uzupełnia odpowiedzi podane wprost (np. „od wczoraj”, „po tłustym jedzeniu”, „mam 54 lata”), więc o to już nie pytamy,
   - zaznacza wstępnie odpowiedzi w pytaniach wielokrotnego wyboru (np. lokalizację bólu); pacjent je potwierdza lub poprawia,
   - sprawdza czerwone flagi, zanim padnie pierwsze pytanie (opis ucisku w klatce z promieniowaniem do lewej ręki i potami → od razu ekran 112).
   Brak wzmianki o objawie nigdy nie jest traktowany jak „nie”. Lekarz widzi opis z podświetlonymi fragmentami i to, co z nich wynika, już w trakcie pisania.
1. Pytanie startowe („Z czym się dziś zgłaszasz?”) włącza moduły: ból w klatce, ból brzucha, ból głowy, kaszel i duszność, gorączka. Kilka powodów naraz łączy moduły.
2. Każde pytanie ma regułę `gdy`, więc pojawia się tylko wtedy, gdy ma sens (np. pytanie o ciążę tylko u kobiet 12–55 lat, o drogi żółciowe tylko przy bólu w nadbrzuszu lub prawym podżebrzu).
3. Kandydaci są sortowani po priorytecie. Pytania, które wykluczają stany nagłe, mają najwyższy priorytet w swoim module, więc padają przed pytaniami szczegółowymi.
4. Czerwone flagi liczą wyłącznie reguły. Flaga „112” zasłania ankietę komunikatem z numerem alarmowym, a flaga „pilne” pokazuje pacjentowi prośbę o kontakt z lekarzem jeszcze dziś. Lekarz widzi obie od razu.
5. Stan jest za każdym razem przeliczany od zera z historii odpowiedzi, więc „Wstecz” po prostu usuwa ostatnią odpowiedź.

## Miejsce na AI

`SilnikWywiadu.nastepne(bank, historia, wybieracz)` przyjmuje opcjonalną funkcję `wybieracz(kandydaci, stan)`. Dziś wybór to „najwyższy priorytet”. W kolejnym kroku można tu wpiąć Claude, który:

- wybiera spośród dozwolonych kandydatów (silnik odrzuca pytanie spoza listy),
- zastępuje regułową analizę opisu (`analizuj(tekst)` zwraca ten sam kształt: moduły, fakty, podpowiedzi, ślady),
- interpretuje odpowiedzi tekstowe i streszcza wywiad dla lekarza,
- nie może dodać własnego pytania, pominąć czerwonej flagi ani pokazać pacjentowi rozpoznania.

## Na żywo: co działa dziś, a co wymaga serwera

Dziś wszystko dzieje się w jednej przeglądarce: każda odpowiedź od razu zmienia kolejne pytanie, a podgląd lekarza obok aktualizuje się w tej samej chwili. Żeby pacjent i lekarz byli na dwóch różnych urządzeniach, potrzebny jest serwer, który przekazuje odpowiedzi z telefonu pacjenta do panelu lekarza. Tego celowo jeszcze nie ma (dane zdrowotne, RODO).

## Aplikacja na Windows (tryb pacjenta)

Wywiad jest jednym z modułów aplikacji `narzedzia/powloka` (Electron, obok anonimizatora). Aplikacja blokuje każde połączenie sieciowe, dane zostają na komputerze.

1. Pacjent siada sam przy komputerze, opisuje dolegliwości własnymi słowami i odpowiada na pytania. Panel lekarza jest ukryty.
2. Lekarz klika „Podsumowanie dla lekarza”: widzi odpowiedzi, fragmenty z opisu i flagi.
3. „Kopiuj do Konsylium” przepuszcza `01-wywiad.md` przez anonimizator (PESEL, imię i nazwisko, adres, kontakt) i kopiuje do schowka. Lekarz przegląda tekst i wkleja go do czatu projektu Konsylium.

Budowanie: `cd narzedzia/powloka && npm install && node zbuduj.mjs` daje `out/MS-Konsylium-Narzedzia-<wersja>-win-x64.zip`. Sam moduł wywiadu: `node narzedzia/wywiad/zbuduj.mjs` (plik w `dist/`).

## Format eksportu

Eksport ma sekcje `## Czerwone flagi`, `## Pytania i odpowiedzi` (linie `P: …  O: …`) i `## NIEZNANE`, jak `sprawy/*/01-wywiad.md`. Celowo nie zawiera hipotezy ani podpowiedzi rozpoznania, żeby nie zdradzać niczego lekarzom przed ślepą turą.

## Zanim trafi do prawdziwych pacjentów (RODO)

Dane o zdrowiu to szczególna kategoria danych (art. 9 RODO). Potrzebne będą co najmniej:

- podstawa prawna i wyraźna informacja dla pacjenta (zgoda lub art. 9 ust. 2 lit. h w ramach świadczenia zdrowotnego),
- umowy powierzenia z hostingiem i dostawcą AI, najlepiej z przetwarzaniem w UE,
- jednorazowe, wygasające linki zamiast danych w adresie; szyfrowanie w transmisji i w spoczynku,
- pseudonimizacja: do AI trafiają odpowiedzi bez imienia, nazwiska i PESEL,
- określony czas przechowywania i usuwanie, rejestr czynności przetwarzania, ocena skutków (DPIA),
- przegląd i podpis banku pytań przez lekarzy oraz ocena, czy narzędzie nie staje się wyrobem medycznym (MDR).
