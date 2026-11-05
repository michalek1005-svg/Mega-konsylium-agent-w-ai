# Ankieta od AI: format `ms-ankieta-1`

Ten plik jest instrukcją dla Konsylium (AI), jak odpowiedzieć na wiadomość „Prośba o ankietę dla pacjenta (MS Wywiad, krok 1)”.

## Przepływ

1. Pacjent pisze w aplikacji opis dolegliwości własnymi słowami.
2. Lekarz klika „Kopiuj opis do Konsylium”. Do schowka trafia prośba: zanonimizowany opis, wstępna analiza reguł i czerwone flagi z opisu. Lekarz wkleja ją do czatu projektu.
3. AI odpowiada **jednym blokiem ```json** z ankietą w tym formacie. Krótki komentarz dla lekarza może stać nad blokiem.
4. Lekarz kopiuje odpowiedź i w aplikacji klika „Wczytaj ankietę od AI”. Może wkleić całą wiadomość, bo aplikacja sama znajdzie blok JSON. Może też otworzyć plik .json.
5. Pacjent odpowiada na pytania. Silnik pokazuje je po kolei i pomija te, których warunek `gdy` nie jest spełniony. Po każdej odpowiedzi liczy czerwone flagi.
6. Lekarz klika „Kopiuj wywiad do Konsylium” i wkleja `01-wywiad.md` do czatu. Zaczyna się konsylium.

Aplikacja nie wykonuje żadnego kodu z pliku. Plik zawiera tylko dane, a warunki są deklaratywne. Wbudowane czerwone flagi aplikacji nadal działają na opisie pacjenta.

## Zasady dla AI

- Zwykle 8–20 pytań, ale **bez sztywnego limitu**: tyle, ile trzeba, żeby zamknąć czerwone flagi i pytanie lekarza (twardo najwyżej 80). Język ma być prosty i zwracać się do pacjenta per „Ty”. Formy żeńsko-męskie zapisuj jako „zauważyłaś/zauważyłeś”.
- **Najpierw pytania wykluczające stany nagłe** dla tego opisu, potem charakterystyka objawu, potem choroby, leki, alergie i ryzyko. Na koniec obawy i oczekiwania pacjenta (`bezNieznanych: true`).
- **Klikalnie, nie pisemnie (Michał 1.11.2026):** pacjent ma klikać, nie pisać. Używaj `jeden`, `wiele`, `skala`, opcji tak/nie/nie wiem oraz list godzin i czasów. `tekst` tylko gdy odpowiedzi nie da się zamknąć w opcjach (nazwa leku z opakowania), najwyżej 2–3 w ankiecie; `liczba` dla pomiarów.
- Nie pytaj o to, co pacjent już jasno napisał. Analiza z prośby pokazuje, co rozpoznano.
- Każde pytanie, którego odpowiedź może oznaczać zagrożenie, musi mieć flagę w `flagi`: `112` dla stanu nagłego, `pilne` dla oceny tego samego dnia.
- Treść pytań nie może sugerować rozpoznania. Uzasadnienie dla lekarza wpisz w `bo`, bo pacjent go nie widzi.
- Przepisz `kod` z prośby i wklej opis z prośby do pola `opis`.
- Nie wpisuj żadnych danych osobowych.

## Struktura

```json
{
  "format": "ms-ankieta-1",
  "kod": "ABC-123",
  "tytul": "Ból pod prawymi żebrami",
  "opis": "opis pacjenta z prośby",
  "pytania": [ … ],
  "flagi": [ … ]
}
```

### Pytanie

| pole | wymagane | znaczenie |
|---|---|---|
| `id` | tak | małe litery, cyfry i `_`, unikalne, nie `opis` |
| `typ` | tak | `jeden`, `wiele`, `skala` (0–10), `liczba`, `tekst` |
| `tekst` | tak | treść, którą widzi pacjent |
| `opcje` | dla `jeden`/`wiele` | od 2 do 12 opcji `{ "w": "wartość", "t": "tekst" }`. W pytaniu `wiele` opcja z `"wyklucza": true` odznacza pozostałe, np. „Nic z tych rzeczy” |
| `krotko` | zalecane | krótka etykieta dla lekarza i listy NIEZNANE |
| `bo` | zalecane | dlaczego pytamy; widzi to tylko lekarz |
| `gdy` | nie | warunek, kiedy pytanie się pojawia (patrz niżej) |
| `min`, `max`, `krok`, `jednostka` | dla `liczba` | np. `34`, `43`, `0.1`, `"°C"` |
| `skala` | dla `skala` | dwa opisy końców, np. `["brak bólu", "najgorszy możliwy"]` |
| `podpowiedz` | dla `tekst` | przykład w pustym polu |
| `priorytet` | nie | domyślnie liczy się kolejność w pliku |
| `nieWiem` | nie | `false` ukrywa przycisk „Nie wiem” |
| `bezNieznanych` | nie | puste pole nie trafia na listę NIEZNANE |

### Warunek `gdy`

- `{ "pytanie": "goraczka", "jest": "tak" }` albo `"jest": ["a", "b"]`: odpowiedź zawiera którąś z wartości (w pytaniu `wiele` wystarczy jedna zaznaczona).
- `{ "pytanie": "temperatura", "min": 38 }` oraz `"max"`: dla `liczba` i `skala`.
- `{ "pytanie": "leki", "odpowiedziano": true }`: pacjent udzielił odpowiedzi innej niż „Nie wiem” i innej niż pusta.
- `{ "wszystkie": [ … ] }`, `{ "ktorekolwiek": [ … ] }`, `{ "nie": { … } }`: łączenie warunków.

Warunek może odwoływać się tylko do pytań z tego samego pliku.

### Flaga

```json
{ "poziom": "112", "dlaLekarza": "Gorączka z żółtaczką: podejrzenie zapalenia dróg żółciowych.",
  "gdy": { "wszystkie": [ { "pytanie": "zoltaczka", "jest": "oczy" }, { "pytanie": "goraczka", "jest": "tak" } ] } }
```

**Flaga bezwarunkowa** (od 1.11.2026): gdy już sam opis pacjenta wskazuje na stan nagły albo pilny, flaga może nie mieć warunku: `{ "poziom": "pilne", "bezwarunkowa": true, "dlaLekarza": "Opis: nagły ból głowy »najgorszy w życiu«" }` (albo `"gdy": "zawsze"`). Zapala się od razu po wczytaniu ankiety.

### Kto odpowiada (od 1.11.2026)

Gdy pacjent jest splątany albo zbyt chory, odpowiada bliska osoba: `"respondent": { "kto": "opiekun", "opis": "córka" }`. Pytania nadal pisz o pacjencie („Czy mama/tata…” nie – neutralnie: „Czy chory…”), a w `01-wywiad.md` trafia linia „Odpowiada opiekun: córka”.

Komunikat dla pacjenta jest stały. Przy poziomie `112` aplikacja pokazuje pełnoekranowy alarm, a przy poziomie `pilne` komunikat „Ważne”.

Pełny przykład jest w `przyklad-ankieta-ai.js`. W aplikacji wczytuje go przycisk „Wczytaj fikcyjny przykład”.
