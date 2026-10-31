# MS · Wywiad z pacjentem (prototyp)

Adaptacyjna ankieta, którą pacjent otwiera z linku. Po każdej odpowiedzi silnik dobiera kolejne pytanie, a lekarz widzi na żywo odpowiedzi, czerwone flagi i to, dlaczego padło dane pytanie. Na końcu wywiad eksportuje się do pliku `01-wywiad.md` w formacie sprawy Konsylium.

**Status: materiał testowo-edukacyjny, tylko dane fikcyjne.** Pytania i progi czerwonych flag nie są zatwierdzone klinicznie. Nic nie jest wysyłane na serwer: odpowiedzi zostają w przeglądarce (localStorage).

## Pliki

| Plik | Co robi |
|---|---|
| `index.html` | Okno wywiadu: widok pacjenta i podgląd lekarza obok siebie |
| `silnik.js` | Logika: przeliczenie stanu, wybór następnego pytania, czerwone flagi, eksport do `01-wywiad.md` |
| `pytania.js` | Bank pytań, moduły i reguły czerwonych flag (to edytują lekarze) |
| `przyklady.js` | Fikcyjne scenariusze do demo i testów |
| `test-silnik.js` | Testy: `node wywiad/test-silnik.js` |

Uruchomienie: otwórz `index.html` w przeglądarce. Nie trzeba nic budować.

## Jak działa dobór pytań

1. Pytanie startowe („Z czym się dziś zgłaszasz?”) włącza moduły: ból w klatce, ból brzucha, ból głowy, kaszel i duszność, gorączka. Kilka powodów naraz łączy moduły.
2. Każde pytanie ma regułę `gdy`, więc pojawia się tylko wtedy, gdy ma sens (np. pytanie o ciążę tylko u kobiet 12–55 lat, o drogi żółciowe tylko przy bólu w nadbrzuszu lub prawym podżebrzu).
3. Kandydaci są sortowani po priorytecie. Pytania, które wykluczają stany nagłe, mają najwyższy priorytet w swoim module, więc padają przed pytaniami szczegółowymi.
4. Czerwone flagi liczą wyłącznie reguły. Flaga „112” zasłania ankietę komunikatem z numerem alarmowym, a flaga „pilne” pokazuje pacjentowi prośbę o kontakt z lekarzem jeszcze dziś. Lekarz widzi obie od razu.
5. Stan jest za każdym razem przeliczany od zera z historii odpowiedzi, więc „Wstecz” po prostu usuwa ostatnią odpowiedź.

## Miejsce na AI

`SilnikWywiadu.nastepne(bank, historia, wybieracz)` przyjmuje opcjonalną funkcję `wybieracz(kandydaci, stan)`. Dziś wybór to „najwyższy priorytet”. W kolejnym kroku można tu wpiąć Claude, który:

- wybiera spośród dozwolonych kandydatów (silnik odrzuca pytanie spoza listy),
- interpretuje odpowiedzi tekstowe i streszcza wywiad dla lekarza,
- nie może dodać własnego pytania, pominąć czerwonej flagi ani pokazać pacjentowi rozpoznania.

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
