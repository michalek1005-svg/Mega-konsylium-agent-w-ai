# Propozycje zmian w definicjach ról (`.claude/agents/`) — do zatwierdzenia przez Michała

Wątek Merytoryczny, 1.11.2026. Definicje agentów zmienia Michał; poniżej gotowe dopiski (tekst do wklejenia). Każda propozycja wynika z konkretnego błędu w sprawie 2026-11-01-02 (p. RECENZJA-2026-11-01-02.md) albo z raportu Testera.

## P1. Sprawdzający faktów — sprawdza też, czy źródło PASUJE do twierdzenia

**Dlaczego:** w sprawie 02 cztery cytowania istniały i miały zgodne liczby, ale dotyczyły innej populacji (dzieci, chorzy hospitalizowani, króliki, terapia skojarzona z NLPZ). Obecna instrukcja sprawdza tylko „prawdziwe i udokumentowane”.

Dopisać po liście werdyktów w `sprawdzajacy-faktow.md`:
> Dodatkowy werdykt `NIEPASUJĄCE`: źródło istnieje, ale dotyczy innej populacji (dzieci zamiast dorosłych, szpital zamiast POZ, model zwierzęcy), innej interwencji (lek w skojarzeniu, inna droga podania) albo nie zawiera podanej liczby (liczba wyliczona przez zespół). Dla każdego PMID otwórz streszczenie (`get_article_metadata`) i porównaj populację, interwencję i liczbę. `NIEPASUJĄCE` dla dawki = CZERWONA kartka; dla pozostałych = ŻÓŁTA i etykieta `[wyliczone]` lub `[model zwierzęcy]` / `[inna populacja]` w FINAL.

## P2. Farmakolog — reaktywność krzyżowa wg łańcucha bocznego, nie „cała klasa”

**Dlaczego:** FINAL zakazał wszystkich beta‑laktamów po reakcji na cefuroksym, co odbiera amoksycylinę (I rzut w zapaleniu płuc w Polsce) bez podstaw w EAACI 2020 i AAAAI 2022.

Dopisać w pkt 3 `lekarz-farmakolog.md`:
> Przy podejrzeniu alergii na antybiotyk beta‑laktamowy oceń reaktywność krzyżową wg łańcucha bocznego R1 (EAACI 2020, PMID 31749148; AAAAI/ACAAI 2022, PMID 36122788) i ciężkości reakcji. Wskaż, których leków unikać (podobny R1) i który beta‑laktam jest dopuszczalny. Zakaz całej klasy tylko po reakcji ciężkiej (anafilaksja, SJS/TEN, DRESS) — z uzasadnieniem.
> Jeśli Twoje zalecenie odbiega od wytycznej WHO/europejskiej, którą znasz (np. lek przeciwwirusowy poza wskazaniem z wytycznej), napisz to wprost i podaj powód.

## P3. Wszyscy lekarze (`docs/WSPOLNE-LEKARZ.md`) — jeden objaw nie liczy się dwa razy

**Dlaczego:** obrzęk i zaczerwienienie powieki, który pojawił się razem z pokrzywką 15 min po leku, posłużył jednocześnie jako argument za reakcją i za adenowirusem.

Dopisać jako pkt 3a:
> Jeśli ten sam objaw wspiera dwie hipotezy z różnych torów (np. infekcja i reakcja polekowa), przypisz go tej, którą lepiej tłumaczy oś czasu, a przy drugiej zapisz go w `przeciw` lub jako niepewny. W `za` podawaj tylko informacje, które odróżniają hipotezę od konkurencyjnej.

## P4. Ordynator — REKOMENDACJA bez prawdopodobieństw, limit długości Wniosków

**Dlaczego:** Tester („FINAL za gęsty”) i ta recenzja: REKOMENDACJA zawiera 5 liczb, PLAN B ok. 14 warunków. Michał czyta Wnioski w aplikacji i chce odpowiedzi na swoje pytanie wiodące.

Dopisać w kroku 3B pkt 4 `ordynator.md`:
> REKOMENDACJA: jedno zdanie, jedno działanie, bez prawdopodobieństw (te idą do DLACZEGO). DLACZEGO: najpierw jedno zdanie odpowiedzi na PYTANIE WIODĄCE użytkownika; łącznie ≤80 słów. PLAN B: najwyżej 6 warunków „jeśli … to …”, pozostałe do `05-projekt.md`. Gdy Twoje zalecenie odbiega od wytycznej (polskiej lub WHO/europejskiej), napisz to jednym zdaniem z powodem.

## P5. Ordynator / PLAN B — profilaktyka w sprawach zakażeń

**Dlaczego:** nieszczepiona pielęgniarka OIT, a Wnioski nie wspominają szczepień.

Dopisać w `lekarz-poz-pragmatyk.md` w `plan_poz`:
> W sprawach zakażeń dopisz profilaktykę po wyzdrowieniu (szczepienia wg Programu Szczepień Ochronnych i zawodu, ochrona domowników), jeśli ma znaczenie.

## P6. Słowo „gabinet” w definicjach

`lekarz-poz-pragmatyk.md` (opis i treść) używa „gabinet lekarza rodzinnego”, „gabinet POZ”, „w gabinecie”. Michał polecił usunąć słowo „Gabinet” z aplikacji i opisów. Proponuję zamienić na „poradnia POZ” / „w poradni”. Agent cytuje ten tekst w dymkach, więc słowo może pojawić się w Pokoju lekarskim.

## P7. (do decyzji) Polskie wytyczne obowiązkowo szukane, gdy `zrodla/` milczy

Dopisać w `WSPOLNE-LEKARZ.md` pkt 2:
> Jeśli `zrodla/` nie ma polskiej wytycznej dla problemu, zapisz w opinii jedną linię `BRAK_PL: <jakiej wytycznej brakuje>`. Ordynator zbiera te linie do listy dla użytkownika.

Dzięki temu biblioteka uzupełnia się z każdą sprawą, a Michał wie, co pobrać.
