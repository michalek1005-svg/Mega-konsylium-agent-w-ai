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

---

# Seria 2: 10 kolejnych przypadków (1.11.2026, 03:05–03:35)

Przypadki były trudniejsze niż w serii 1, każdy z pułapką w opisie pacjenta albo w pytaniu lekarza. Wyłącznie dorośli. Pełny przebieg: ankieta, symulowany pacjent, ślepa tura 6 ról, agregacja, runda (tylko przy różnicy), projekt, rezydent, Sprawdzający faktów i FINAL. W 3 sprawach dodatkowo był pojedynczy agent kontrolny bez konsylium.

## Najważniejsze wnioski serii 2 (w kolejności ważności)

1. **Pierwsza czerwona kartka: polskie wytyczne istnieją, ale role ich nie szukają.** W sprawie 09 (ból głowy z nadużywania leków) żadna z 6 ról ani ordynator nie znaleźli polskiego konsensusu PTBG/SBG PTN 2022 (PMID 36457955). Projekt twierdził nawet, że polskich wytycznych brak. Przez to dawka amitryptyliny (25–50 mg) była sprzeczna z polskim zakresem 50–150 mg. W sprawach 07 (PTE 2022) i 15 (PTNT/PTK/PTGiP 2019) polskie wytyczne też znalazł dopiero Sprawdzający. Propozycja: każda rola robi obowiązkowo jedno zapytanie „Polish guidelines / rekomendacje PT…” w PubMed, a `zrodla/` trzeba zapełnić. To ten sam wniosek co pkt 8 serii 1, teraz z twardym dowodem. Sprawdzający działał zgodnie z celem: FINAL sprawy 09 ma już dawkę według polskiego konsensusu.
2. **Pojedynczy agent dawał te same decyzje co konsylium, około 15 razy taniej.** W sprawach 07, 11 i 14 kontrola miała to samo rozpoznanie, pilność i decyzję. Kontrolne FINAL-e były krótsze (317–352 słowa wobec 445–528) i równie trafne. Wartość dodana konsylium w tych sprawach: weryfikacja liczb przez Sprawdzającego oraz pytania rezydenta. Rekomendacja nigdzie się nie zmieniła. Wniosek dla sieci agentów: przy prostych sprawach wystarczy tryb SZYBKI (1 agent + Sprawdzający), a pełne konsylium zostawić na sprawy z rozbieżnością lub złożonością.
3. **Runda dyskusji pomaga tylko przy różnicy w rozpoznaniu.** Odbyły się 3 rundy:
   - 06: rola „najgorszy scenariusz” przeszła z kolki nerkowej na pękający tętniak aorty (zmiana na dobre).
   - 08: dwie role podniosły pilność z 2 na 1; nie zmieniło to decyzji.
   - 12: dwie role zmieniły pilność z 3 na 2, czyli dalej od klucza, choć z uzasadnieniem.

   Zmian na gorsze w rozpoznaniu nie było. Pozostałe 7 spraw pominęło rundę (pełna zgoda) bez straty jakości. Propozycja: runda tylko przy różnicy w rozpoznaniu nr 1; sama różnica pilności o 1 poziom niech rozstrzyga ordynator bez rundy.
4. **Artefakt farmakologa.** Farmakolog wpisuje jako rozpoznanie nr 1 „objawy polekowe p 0,01–0,05” nawet wtedy, gdy pacjent nie bierze leków. To psuje porównanie rozpoznania nr 1 i liczenie zgody. Propozycja: farmakolog nie podaje rankingu rozpoznań, tylko pozycję „przyczyna polekowa: tak/nie/możliwa” i interakcje.
5. **Rezydent z wynikami badań wnosi merytoryczne uwagi.** W sprawach 08, 12 i 14 dopisałem rezydentowi wyniki ręcznie (symulacja poprawki `pakiet_rezydenta.py`). Uwagi były wtedy kliniczne:
   - Na 131 mmol/l jeszcze przed sertraliną, więc trzeba oznaczyć kortyzol i TSH;
   - test HIV przy chłoniaku.

   Bez wyników rezydent krytykował braki danych, które w sprawie były. Potwierdza to pkt 5 serii 1. W sumie 1 uwaga rezydenta zmieniła treść rekomendacji (15: neuroobrazowanie z wenografią przy utrzymujących się objawach), a żadna nie zmieniła decyzji.
6. **Persona rezydenta jest źle dobrana.** Wypadali: pediatra przy 68- i 57-latku, geriatra przy 19-latku, lekarz paliatywny przy chorobie Gravesa. Propozycja: dobierać personę do problemu (SOR, internista, lekarz rodzinny).
7. **Rezydenci piszą „PubMed 403”**, bo nie ładują konektora `mcp__PubMed__*` i widzą komunikat o innej wtyczce. W poleceniu rezydenta trzeba podać nazwę narzędzia wprost.
8. **Luki formatu ankiety** (powtarzające się w wielu wywiadach):
   - brak flagi bezwarunkowej, którą mógłby podnieść sam opis pacjenta (3 wywiady obchodziły to sztuczkami);
   - sztywny limit 8–20 pytań kłóci się z minimum wywiadu z CLAUDE.md §2 (raz trzeba było usunąć ważne pytanie);
   - brak respondenta-opiekuna („odpowiada córka”) przy splątanym albo sennym pacjencie (08, 11);
   - ankieta 06 nie zapytała o rodzinny tętniak, ankieta 09 o palenie przy migrenie z aurą i estrogenach.
9. **Sprawdzający faktów jest najbardziej wartościowym krokiem po ślepej turze.** Wydał 9 żółtych i 1 czerwoną kartkę. Ordynator przyjął praktycznie wszystkie poprawki: etykiety, zakresy, źródła i jedną sprzeczność kliniczną (12: 37,8 °C to nie gorączka B >38 °C).

## Wyniki merytoryczne serii 2

| Sprawa | Prawda (ukryty klucz), pilność | Werdykt konsylium | Pilność | Runda / kontrola | Kartka |
|---|---|---|---|---|---|
| 06. M 68, „kolka nerkowa” | pękający tętniak aorty brzusznej, 1 | tętniak, 112, bez leków doustnych z POZ | 1 ✓ | runda: najgorszy kolka → tętniak | żółta 8/10 |
| 07. K 29, „lęk, SSRI?” | choroba Gravesa-Basedowa, 3 | Graves, bez SSRI, dziś EKG + TSH/FT4/TRAb | 2 (+1) | kontrola: to samo | żółta 13/17 |
| 08. M 74, splątanie, „ZUM?” | hiponatremia polekowa, 1–2 | hiponatremia, bez antybiotyku, SOR natychmiast | 1 ✓ | runda: pilność 2→1 u 2 ról | żółta 15/16 |
| 09. K 46, „MRI głowy?” | ból z nadużywania leków, bez MRI, zmiana antykoncepcji, 4 | MOH, bez MRI, amitryptylina, antykoncepcja bezestrogenowa | 3 (+1) | — | **czerwona** 18/26 |
| 10. M 19, ból jądra | skręt jądra, 1 | skręt, SOR teraz, 112 przy odmowie | 1 ✓ | — | żółta 11/13 |
| 11. K 61, wymioty na flozynie | euglikemiczna kwasica ketonowa, 1 | euDKA, 112, odstawić flozynę/metforminę/ACEI | 1 ✓ | kontrola: to samo | żółta 17/19 |
| 12. M 55, „wypalenie” | chłoniak Hodgkina, 3 | Hodgkin, dziś badanie + RTG + HIV, DiLO, biopsja | 2 (+1) | runda: pilność 3→2 u 2 ról | żółta 18/25 |
| 13. K 38, ból w klatce | zapalenie osierdzia, 2 | zapalenie osierdzia, dziś EKG/troponina/CRP, NLPZ + kolchicyna | 2 ✓ | — | żółta 16/20 |
| 14. M 57, „napad dny” | septyczne zapalenie stawu, 1–2 | septyczne do wykluczenia, SOR, punkcja przed antybiotykiem | 1 ✓ | kontrola: to samo | żółta 11/16 |
| 15. K 32, ból głowy w połogu | stan przedrzucawkowy poporodowy, 1 | stan przedrzucawkowy, 112 do izby położniczej | 1 ✓ | — | żółta 14/18 |

**Podsumowanie:** 10/10 trafnych rozpoznań, wszystkie pułapki ominięte. Pilność zgodna w 7 sprawach, w 3 zawyżona o 1 poziom (bezpieczna nadtriaż). Kontrole 3/3 zgodne z konsylium. FINAL-e mieszczą się w 250 słowach treści, ale lista ŹRÓDEŁ nadal bywa bardzo długa (09: ok. 20 pozycji).

**Koszt:** rola w ślepej turze 80–110 tys. tokenów (70–130 s), ordynator 120–200 tys., Sprawdzający 100–160 tys., rezydent ok. 56 tys., agent kontrolny ok. 100 tys. Pełna sprawa bez rundy ok. 1,1 mln tokenów, z rundą ok. 1,6 mln, a kontrola ok. 0,1 mln.

Dane: `sprawy/TEST-2026-11-01-06` do `-15` na gałęzi `claude/project-thread-60vhst` (z `_log.jsonl` do obejrzenia w Pokoju lekarskim, kontrolne FINAL-e w `09-FINAL-kontrola.md`).
