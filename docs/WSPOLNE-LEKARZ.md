# Wspólne zasady dla wszystkich lekarzy stałych (ten plik nie jest agentem; agenci go cytują)

1. **Ślepa tura.** Zanim zapiszesz własną opinię, NIE otwieraj `03-opinie/` ani `04-konsylium.md`. Czytasz tylko `00-surowe.md`, `01-wywiad.md`, `pamiec/zespol.md`, `zrodla/`, PubMed.
2. **Źródła wg CLAUDE.md §5.** Najpierw `zrodla/MANIFEST.md` — jeśli jest polska wytyczna dla tej sytuacji, oparcie się na niej jest obowiązkowe. Każda liczba (dawka, próg, kryterium) ma źródło albo etykietę `[wiedza modelu, niezweryfikowane]`.
2a. **Brak polskiej wytycznej.** Jeśli `zrodla/` nie ma polskiej wytycznej dla problemu, zapisz w opinii jedną linię `BRAK_PL: <jakiej wytycznej brakuje>`. Ordynator zbiera te linie do listy dla użytkownika.
2b. **Jeden objaw nie liczy się dwa razy.** Jeśli ten sam objaw wspiera dwie hipotezy z różnych torów (np. infekcja i reakcja polekowa), przypisz go tej, którą lepiej tłumaczy oś czasu, a przy drugiej zapisz go w `przeciw` lub jako niepewny. W `za` podawaj tylko informacje, które odróżniają hipotezę od konkurencyjnej.
3. **Format opinii** — zapisz do `sprawy/<ID>/03-opinie/<twoja-rola>.json` zgodnie z `schemas/opinia.schema.json`:
   - `rozpoznania`: lista `{nazwa, p, za[], przeciw[]}`, suma `p` ≤ 1,0; max 5 pozycji; nazwy w mianowniku, po polsku, bez skrótów.
   - `pilnosc`: 1 natychmiast / 2 dziś / 3 ten tydzień / 4 planowo / 5 obserwacja.
   - `pewnosc`: niska / srednia / wysoka — **Twoja własna**, nie zespołu.
   - `red_flags_wykluczone`, `red_flags_otwarte`.
   - `nastepny_krok`: jedno konkretne działanie, nie lista.
   - `co_zmieniloby_zdanie`: jedno zdanie.
   - `zrodla`: lista.
4. **NIEZNANE z wywiadu** traktuj jako nieznane, nie jako „pewnie w normie”.
5. **Runda dyskusji** (gdy ordynator Cię wezwie do `04-konsylium.md`): ≤120 słów, dwie części: „co mnie przekonuje w cudzych opiniach” i „co by zmieniło moje zdanie”. Możesz zmienić swoje `p` — wtedy dopisz `rewizja: true` w swoim JSON-ie i powód.
6. Zapisz do `_log.jsonl` start i stop.
   Ostatnia linia Twojej odpowiedzi dla ordynatora (w ślepej turze i w każdej rundzie): `SKRÓT: <1–2 pełne zdania, ≤400 znaków, językiem medycznym, z kluczową liczbą lub uzasadnieniem>`, np. „Najbardziej prawdopodobna jest wydalona matryca tabletki metforminy XR (p 0,70), bo kulka pojawia się raz na dobę po dawce. Pilność 4 (planowo), dopóki nie wyjdzie bilirubinuria lub wzrost CK.” Linię wyżej możesz dać `INFO: <liczby, skale, wytyczne, ≤200 znaków>`. Ordynator wpisze je jako dymek (docs/DYMKI.md).
7. Nie zwracaj się do użytkownika. Twój odbiorca to ordynator.
