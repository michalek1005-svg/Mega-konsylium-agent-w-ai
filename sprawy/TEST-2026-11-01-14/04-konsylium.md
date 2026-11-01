# 04 — Protokół konsylium (ordynator)

Sprawa TEST-2026-11-01-14. Runda dyskusji pominięta: wszystkie 6 ról w ślepej turze wskazało to samo rozpoznanie nr 1 i pilność 1 (`_runda-pominieta.md`). Pytanie lekarza prowadzącego: „Napad dny – kolchicyna i NLPZ?”

## 1. Ranking po połączeniu synonimów

`_agregat.json` rozbił jedno rozpoznanie na trzy nazwy („Septyczne (bakteryjne) zapalenie stawu kolanowego prawego”, „Septyczne zapalenie stawu kolanowego prawego (samodzielne lub współistniejące z napadem dny)”, „septyczne zapalenie stawu kolanowego prawego”) i dnę na dwie, przez co zgoda spadła do 0,076 i powstała flaga NISKA_ZGODA. Po ręcznym połączeniu synonimów (sumowanie p z agregatu):

| # | Rozpoznanie (połączone) | p agregatu | p w opiniach ról | Wymienili |
|---|---|---|---|---|
| 1 | Septyczne zapalenie stawu kolanowego prawego (samodzielne lub nałożone na napad dny) | ok. 0,32 | 0,45–0,65 | hipotezujący 0,55; bayes 0,45; najgorszy scenariusz 0,50; POZ-pragmatyk 0,55 + 0,10 (współistniejące z dną) |
| 2 | Napad dny moczanowej stawu kolanowego bez zakażenia | ok. 0,13 | 0,20–0,35 | hipotezujący 0,20; bayes 0,35; najgorszy scenariusz 0,30; POZ-pragmatyk 0,25 |
| 3 | Dna rzekoma (pirofosforan wapnia) | <0,05 | 0,05–0,07 | hipotezujący, bayes, POZ-pragmatyk |
| 4 | Ropne zapalenie kaletki przedrzepkowej / cellulitis okolicy kolana | <0,05 | 0,05–0,07 | hipotezujący, bayes, najgorszy scenariusz |
| 5 | Łuszczycowe zapalenie stawów — ostre monoartritis | <0,05 | 0,03–0,05 | hipotezujący, bayes, najgorszy scenariusz, POZ-pragmatyk |

Farmakolog i gospodarz kosztów mają wagę 0 w torze rozpoznania; obaj w treści opinii przyjęli ten sam porządek (zakażenie przed dną). Realna zgoda zespołu co do rozpoznania nr 1: 6/6. Flagę NISKA_ZGODA uznaję za artefakt nazewnictwa.

## 2. Sprzeczności

- **Interakcja NLPZ–metotreksat.** Hipotezujący i najgorszy scenariusz piszą o „zwiększonej toksyczności” z etykietą [wiedza modelu]. Farmakolog cytuje przegląd (den Uil 2025, PMID 40779298): krótkotrwałe NLPZ przy metotreksacie ≤30 mg/tydz. bez czynników ryzyka nie wymagają dodatkowego monitorowania; ryzyko rośnie przy odwodnieniu i niewydolności nerek (tu: sepsa możliwa). **Rozstrzygnięcie:** powód, by nie podawać NLPZ dziś, to nie interakcja sama w sobie, lecz maskowanie gorączki przed punkcją i ryzyko ostrego uszkodzenia nerek w możliwej sepsie. W projekcie nie piszę „NLPZ przeciwwskazane przy metotreksacie”.
- **Próg cytozy płynu.** Margaretten 2007 (PMID 17405973): >50 000/µl LR 7,7. Mukerji 2024 (PMID 38901050): próg 32 000/mm³ daje 100 % czułości dla zakażenia nałożonego na artropatię krystaliczną. **Rozstrzygnięcie:** w planie B przyjmuję próg bezpieczeństwa <25 000/µl (LR 0,32) jako warunek leczenia jak dny; zakres 25–50 tys. traktuję jako nierozstrzygnięty (leczenie jak zakażenie do posiewu).
- **Antybiotyk w POZ.** POZ-pragmatyk i farmakolog: nie przed posiewami, wyjątek — wstrząs lub długi transport. Nikt nie oponował. Przyjmuję.

## 3. Otwarte red flags i rozstrzygnięcie (weto najgorszego scenariusza)

Najgorszy scenariusz ocenił pilność 1 z pewnością wysoką; jego `red_flags_otwarte` stanowią dolne ograniczenie pilności. Żadna z nich nie została wykluczona w protokole, bo wszystkie wymagają danych spoza wywiadu (badanie fizykalne, parametry życiowe, płyn stawowy):

1. **Septyczne zapalenie stawu u chorego w immunosupresji (metotreksat + glikokortykosteroid), gorączka 38,6 °C, dreszcze, CRP 186 mg/l, rana skóry nad stawem, brak ruchu biernego** — OTWARTA. Wyklucza wyłącznie punkcja (cytoza, odsetek neutrofili, Gram, posiew). Kryształy moczanu nie wykluczają zakażenia (PMID 35611099; 7,2 % artropatii krystalicznych ma równoczesne zakażenie — PMID 38901050).
2. **Sepsa / bakteriemia** — OTWARTA. Parametry życiowe NIEZNANE; glikokortykosteroid może maskować obraz. Do zmierzenia w gabinecie, decyduje o trybie transportu, nie o kierunku.
3. **Bezpieczeństwo metotreksatu** (płytki, Hb, ALT NIEZNANE) — OTWARTA, ale neutrofile 13,2 G/l przemawiają przeciw ciężkiej mielosupresji; nie zmienia decyzji, badania zrobi szpital.
4. **Glikokortykosteroid: dawka i czas NIEZNANE; ryzyko niewydolności nadnerczy** — OTWARTA. Nie odstawiać; ustalić preparat i dawkę, wpisać do skierowania.

Wykluczone wstępnie (najgorszy scenariusz, hipotezujący): martwicze zapalenie powięzi (brak objawów alarmowych z ankiety; badanie fizykalne NIEZNANE, więc tylko wstępnie), poliartritis (chory zaprzecza), uszkodzenie nerek ograniczające leczenie (kreatynina 1,1 mg/dl).

**Wynik:** pilność 1 (natychmiast) utrzymana wetem i jednomyślnością. Rozpoznanie robocze do skierowania: podejrzenie septycznego zapalenia stawu kolanowego prawego u chorego w immunosupresji; dna moczanowa jako współistniejąca lub alternatywna — do rozstrzygnięcia płynem stawowym.

## 4. Odpowiedź na pytanie lekarza (do wplecenia w projekt)

Nie — nie leczyć dziś jak napadu dny kolchicyną i NLPZ; najpierw punkcja stawu w szpitalu.
