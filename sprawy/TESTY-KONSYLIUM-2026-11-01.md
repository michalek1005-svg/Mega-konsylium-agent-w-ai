# Test konsylium na 5 przypadkach syntetycznych — 1.11.2026

Wątek „Przetestuj konsylium na wielu przypadkach”. Przypadki fikcyjne, wyłącznie dorośli, tylko wiek i płeć. Kod aplikacji i definicje w `.claude/` nie były zmieniane.

## Najważniejsze zmiany (w kolejności ważności)

1. **Wyniki badań i parametry przed startem.** Ankieta pyta tylko, *czy* były badania. Nie pyta, *co wyszło*. Rozpoznanie w sprawie 1 udało się wyłącznie dzięki dołączonym wynikom. W sprawie 2 rezydent słusznie wytknął, że „morfologia: coś nieprawidłowe” nie ma wartości. Proponuję obowiązkowy ekran przed startem: „Dołącz wyniki / wpisz RR, tętno, SpO2, temperaturę / zbadałem fizykalnie: tak, nie”. Ekran ma blokować start, dopóki lekarz nie wybierze „brak wyników”.
2. **Błąd agregacji (fałszywa „niska zgoda”).** Sześć ról zgodnie stawiało to samo rozpoznanie, a agregat pokazywał zgodę 0,03–0,11 i flagę NISKA_ZGODA. Przyczyna: ta sama choroba zapisana na 4 sposoby liczy się jak 4 różne choroby. Dowód: w sprawie 3 cztery role przypadkiem użyły jednej nazwy i zgoda wyszła 0,78. Naprawa: role podają kod ICD-10 obok nazwy, a `agregacja.py` łączy pozycje po kodzie. To samo dotyczy listy red flags: w sprawie 3 było około 30 pozycji, głównie duplikaty.
3. **Wczesny alarm po triage.** Triage w 20–30 s trafnie wskazał zagrożenie życia w 3 z 5 spraw: OZW, krwotok podpajęczynówkowy, zatorowość płucna. Mimo to lekarz czeka 10–15 min na pełne konsylium. Przy pilności 1 od zastępcy bezpieczeństwa aplikacja powinna od razu pokazać pasek „Podejrzenie X — rozważ 112 teraz”, a konsylium niech pracuje dalej w tle.
4. **Pomijanie rundy przy jednomyślności.** W sprawach 2, 3 i 4 wszystkie 6 ról w ślepej turze dało to samo rozpoznanie i tę samą pilność. Rundę pominąłem, co oszczędza 6 agentów, około 0,5 mln tokenów i 1–2 min na sprawę. Gdy role się różniły, runda była naprawdę wartościowa. W sprawie 1 dwie role podniosły pilność z 2 do 1, a role poprawiały sobie nawzajem interpretację badań. Reguła: runda tylko przy różnicy w rozpoznaniu nr 1 lub w pilności.
5. **Pakiet rezydenta gubi dane.** Dotyczy wszystkich 5 spraw:
   - Do pakietu nie trafiają dołączone wyniki badań (są w `01-wywiad.md`, a pakiet bierze `00-surowe.md`). Rezydent w sprawie 1 skrytykował „DRESS bez morfologii, ALT i kreatyniny”, choć te wyniki były.
   - Sekcja [B] to same odpowiedzi bez pytań („Tak”, „Nie wiem”, „1–2 dziennie”), nieczytelne dla każdego z 5 rezydentów.
   - [C] to jedno zdanie bez planu B.

   Poprawka w `pakiet_rezydenta.py`: dołączać wyniki, krótką treść pytania przy każdej odpowiedzi oraz REKOMENDACJĘ i PLAN B.
6. **Tryb SZYBKI jest nieosiągalny.** Nawet łagodna sprawa 5 (pilność 3) poszła w tryb PEŁNY: zastępca bezpieczeństwa dolicza +1 za każde NIEZBADANE i cztery braki wystarczą do progu. Proponuję liczyć NIEZBADANE tylko dla red flags danej prezentacji albo podnieść próg.
7. **PubMed.** Działa konektor `mcp__PubMed__*`, także w subagentach po załadowaniu przez ToolSearch. Komunikat o 403 dotyczy innej wtyczki. Gdy agenci opierali się na samej wyszukiwarce, cytowali PMID po tytułach. Z działającym PubMedem czytali streszczenia i sami poprawiali błędy, np. „czułość TK ok. 85% w 3. dobie” zamieniono na 99,6% do 48 h. Dwie uwagi:
   - Przy 6 agentach naraz PubMed odrzuca część zapytań z powodu limitu częstości. Potrzebna kolejka albo uruchamianie 3 ról naraz.
   - Role nie szukają polskich wytycznych. Sprawdzający w sprawie 5 sam znalazł zalecenia PTE 2021 i 2022, których nie miała żadna rola.
8. **Biblioteka `zrodla/` jest pusta** (sam MANIFEST z przykładami). Przez to w każdej sprawie poziom 1 źródeł milczy, a wytyczne ESC nie mają streszczeń w PubMed. Wszystkie 5 kartek Sprawdzającego wyszło żółtych, a sprzeczność była tylko jedna. Wgranie kilku polskich wytycznych (OZW, ŻChZZ, tarczyca, ból głowy, reakcje polekowe) to zadanie dla Michała. Da największy przyrost jakości źródeł.
9. **09-FINAL jest za gęsty.** Treść kliniczna ma 240–450 słów, w zdaniach DLACZEGO są 4–5 numerów PMID, a lista ŹRÓDEŁ (10–14 pozycji) jest dłuższa niż cała rekomendacja. Proponuję:
   - numerowane przypisy [1] zamiast PMID w tekście,
   - PLAN B najwyżej w 3 punktach,
   - najwyżej 5 źródeł w FINAL, a resztę w `04-konsylium.md`.
10. **Słowo pilności musi pasować do liczby.** W sprawie 1 jest „PILNOŚĆ: 1 natychmiast”, ale w treści „skieruj dziś do szpitala”, czyli definicja pilności 2. Ordynator powinien pilnować jednej z dwóch par: 1 = 112 teraz albo 2 = szpital dziś.

Drobniejsze rzeczy do ankiety:
- Ból piorunujący daje w ankiecie tylko flagę „pilne”, a nie 112.
- Format flag nie ma warunku „zawsze”, więc sam opis pacjenta nie może podnieść pilności.
- Opcja „Teraz nie mam miesiączki” jest dwuznaczna; rezydent odczytał ją jako brak miesiączki.
- W sprawie 3 brakowało opcji „zakręciło się przy wstawaniu”, więc symulowana pacjentka wybrała „prawie zemdlałam”. Ankieta wymusiła mocniejszy objaw niż w rzeczywistości.
- Ankieta nie pyta o datę ostatniej miesiączki.
- `01-wywiad.md` zawsze wpisuje „aktualne wyniki badań” do NIEZNANE, nawet gdy wyniki dołączono.
- Persona rezydenta jest losowa (psychiatra przy zatorowości, lekarz paliatywny przy tarczycy). Lepiej dobierać ją do problemu, np. SOR albo internista.

## Wyniki merytoryczne

| Sprawa | Prawda (ukryty klucz) | Werdykt konsylium | Trafność | Pilność klucz → konsylium |
|---|---|---|---|---|
| 1. K 71, gorączka i wysypka po antybiotyku | DRESS po allopurynolu (amoksycylina to pułapka) | DRESS po allopurynolu; odstawić na stałe, wstrzymać ramipryl, szpital | ✓ pułapka ominięta | 1–2 → 1 (opis jak 2) |
| 2. K 66, „zgaga” z cukrzycą | OZW bez uniesienia ST (pułapka: IPP) | nie IPP, 112, szpital z hemodynamiką; rezydent dodał pytanie o smoliste stolce | ✓ | 1 → 1 |
| 3. K 52, łydka i kłucie w klatce po podróży | ZŻG + zatorowość płucna (pułapka: mięsień, NLPZ) | ZŻG + ZP, karetka, bez D-dimeru, odstawić ibuprofen i hormony | ✓ | 1 → 1 |
| 4. M 47, „naciągnięty kark” | krwotok podpajęczynówkowy (krwawienie ostrzegawcze) | SAH do wykluczenia, SOR, TK + angio-TK, nakłucie przy ujemnym TK | ✓ | 1 → 1 |
| 5. K 34, TSH 5,4, planuje ciążę | niedobór żelaza; lewotyroksyny teraz nie | dziś bez lewotyroksyny, test ciążowy, żelazo, TSH + anty-TPO za 4 tyg. | ✓ | 4 → 3 (lekka nadtriaż) |

Wszystkie 5 rozpoznań było trafnych i żadna pułapka nie zadziałała. Każdy FINAL odpowiada na pytanie lekarza w pierwszym zdaniu. Sprawdzający faktów wydał 5 żółtych kartek, wskazał 1 sprzeczność (zdanie „brak polskich wytycznych”) i nie znalazł żadnego błędu dawki. Uwaga: przypadki były podręcznikowe, a wyniki badań dołączone, więc to test procesu, nie trudności klinicznej.

## Oceny wg pytań koordynatora

- **Ankieta klikalna i zwięzła.** Tak: 18–20 pytań, w tym 2 otwarte, pytania alarmowe na początku, bez sugerowania rozpoznania. Słabe strony: brak parametrów i wartości badań (pkt 1) oraz dwuznaczne opcje.
- **Czy konsylium prosi o wyniki przed startem.** Nie. Ankieta pyta tylko, czy badania były. Gdyby nie dołączone wyniki, w sprawie 1 nie dałoby się odróżnić DRESS od mononukleozy, co pokazał rezydent, który wyników nie dostał.
- **Dymki.** To medyczne zdania, nie zapis rozmowy agentów. Mają 300–400 znaków i powtarzają między rolami te same liczby: trzy role w sprawie 5 cytowały ten sam PMID. Proponuję, żeby każda rola w dymku podawała tylko to, co wnosi nowego.
- **Wnioski.** Spójne i z cytowaniami. Każdą liczbę sprawdzono w streszczeniu PubMed. Za długie dla lekarza (pkt 9).
- **Czas i koszt.** Szacunki z pomiarów subagentów (pełna sprawa, tryb PEŁNY):

| Etap | Czas | Tokeny |
|---|---|---|
| wywiad | ~2 min | ~70 tys. |
| triage (3 zastępców) | ~0,5 min | ~165 tys. |
| ślepa tura (6 ról równolegle) | 1,5–3 min | ~550 tys. |
| runda, gdy potrzebna | ~1 min | ~500 tys. |
| projekt ordynatora | ~2,5 min | ~130 tys. |
| rezydent + Sprawdzający faktów | ~3 min | ~180 tys. |
| FINAL | ~1 min | ~30 tys. |
| **razem** | **12–15 min** | **ok. 1,1 mln bez rundy / 1,6 mln z rundą** |

Najwięcej kosztuje sześć ról, które za każdym razem czytają CLAUDE.md i swoją definicję. Pomijanie rundy (pkt 4) i tryb SZYBKI (pkt 6) obniżyłyby koszt łagodnych spraw o około połowę.

## Gdzie są dane
Sprawy testowe w repo, katalogi `sprawy/TEST-2026-11-01-01` do `-05`: ankiety, opinie, runda, projekt, rezydent, sprawdzenie, FINAL i `_log.jsonl` z dymkami do obejrzenia w Pokoju lekarskim. Gałąź `claude/project-thread-60vhst` (tylko dane testowe, bez zmian kodu).
