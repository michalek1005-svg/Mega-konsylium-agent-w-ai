# 04 — Protokół konsylium (ordynator) · TEST-2026-11-01-13

Runda dyskusji pominięta (patrz `_runda-pominieta.md`): 6/6 ról — to samo rozpoznanie nr 1 i pilność 2. Flaga `NISKA_ZGODA` (zgoda 0,026) w `_agregat.json` jest artefaktem: cztery nazwy tego samego rozpoznania. Poniżej ranking po ręcznym połączeniu synonimów.

## 1. Ranking po połączeniu synonimów

| # | Rozpoznanie (nazwy połączone) | Udział w agregacie | p u ról z wagą w torze rozpoznanie | Kto wymienił |
|---|---|---|---|---|
| 1 | **Ostre zapalenie osierdzia, idiopatyczne/poinfekcyjne wirusowe** („najpewniej wirusowe / idiopatyczne", „idiopatyczne / poinfekcyjne wirusowe", „poinfekcyjne, idiopatyczne", „idiopatyczne lub poinfekcyjne, wirusowe") | 0,113+0,104+0,057+0,056 = **0,33** | 0,58 / 0,55 / 0,66 / 0,62 | bayes, hipotezujacy, najgorszy_scenariusz, poz_pragmatyk; farmakolog i gospodarz_kosztow wymienili z p 0 (poza wagą) |
| 2 | **Zapalenie mięśnia sercowego z zajęciem osierdzia** („zapalenie mięśniowo-osierdziowe", „zapalenie mięśnia sercowego i osierdzia", „…z zajęciem osierdzia", „…z zapaleniem osierdzia") | poniżej progu agregatu (rozbite) | 0,10 / 0,12 / 0,14 / 0,12 | bayes, hipotezujacy, najgorszy_scenariusz, poz_pragmatyk, gospodarz_kosztow |
| 3 | **Zatorowość płucna** (u farmakologa jako „objawy polekowe — złożona antykoncepcja hormonalna") | 0,099 | 0,07 / 0,08 / 0,06 / 0,06 | wszystkie 6 ról |
| 4 | Zapalenie opłucnej / zapalenie płuc z zajęciem opłucnej | — | 0,10 / 0,07 / 0,06 / 0,08 | bayes, hipotezujacy, najgorszy_scenariusz, poz_pragmatyk |
| 5 | Ból mięśniowo-szkieletowy / nerwoból międzyżebrowy (hipoteza lekarza i pacjentki) | — | 0,08 / 0,05 / 0,05 / 0,05 | bayes, hipotezujacy, najgorszy_scenariusz, poz_pragmatyk, gospodarz_kosztow |

Wniosek: zapalenie osierdzia jest rozpoznaniem nr 1 u każdej roli z wagą w torze rozpoznanie, z przewagą ~5–10× nad każdą alternatywą. Nerwoból międzyżebrowy jest u wszystkich na końcu listy z tym samym argumentem: ból nie nasila się przy ucisku ani skręcie tułowia, a zależność od pozycji (leżenie ↔ pochylenie) i stan podgorączkowy nie pasują do przyczyny ściennej.

## 2. Sprzeczności między opiniami i rozstrzygnięcie

1. **D-dimer dziś czy warunkowo?** Bayes i hipotezujący: D-dimer dziś (PERC niespełniony przez estrogeny). Gospodarz kosztów i POZ-pragmatyk: tylko gdy po EKG i badaniu obraz nie jest typowy dla osierdzia, bo w pierwszym epizodzie zapalenia osierdzia D-dimer jest podwyższony u 73,3% chorych i w wykonanych angio-TK nie znaleziono zatorowości (PMID 37357033). **Rozstrzygam na rzecz podejścia warunkowego**: najpierw badanie, EKG, troponina, CRP, saturacja, ocena kończyn dolnych i skala Wellsa; D-dimer tylko przy Wells „zatorowość niemało prawdopodobna" lub gdy EKG/badanie nie potwierdzają osierdzia. Dodatni D-dimer przy typowym obrazie osierdziowym nie może sam uruchamiać angio-TK.
2. **Częstość zajęcia mięśnia sercowego**: 60,9% (PMID 23846679, kohorta hospitalizowana) vs 19,9% (PMID 41850763). Różne populacje; dla decyzji bez znaczenia — każdy wzrost troponiny jest cechą złego rokowania i kieruje do szpitala (PMID 15028364).
3. **Próg masy ciała dla kolchicyny**: POZ-pragmatyk „<70 kg", pozostali „≤70 kg". Obowiązuje ICAP: 0,5 mg 2×/d przy >70 kg, 0,5 mg 1×/d przy ≤70 kg (PMID 23992557).
4. **Czy sam ibuprofen wystarczy** — brak sporu: 6/6 ról: nie; kolchicyna obowiązkowo (ICAP: przetrwanie/nawrót 16,7% vs 37,5%, NNT 4; COPE: 10,7% vs 32,3%, PMID 16186437; ESC 2025: NLPZ + kolchicyna, PMID 41534803, 42376745).

## 3. Otwarte red flags i weto najgorszego scenariusza

Najgorszy scenariusz ocenia pilność 2 i utrzymuje 4 otwarte flagi; żadnej nie da się wykluczyć z ankiety, więc **weto obowiązuje: pilność nie niższa niż 2 (dziś)**, a plan jest warunkowy do czasu wyniku badań.

| Flaga | Stan | Co ją zamyka | Co ją potwierdza → eskalacja do pilności 1 (SOR) |
|---|---|---|---|
| Zapalenie mięśnia sercowego z zajęciem osierdzia | otwarta (troponina NIEZNANA) | prawidłowa troponina hs i EKG bez zaburzeń rytmu/przewodzenia | troponina podwyższona (PMID 15028364: myopericarditis = kryterium hospitalizacji) |
| Duży wysięk / tamponada | otwarta (ciśnienie, badanie fizykalne NIEZNANE) | prawidłowe ciśnienie, brak tętna paradoksalnego i poszerzenia żył szyjnych; echo planowo | hipotonia, tętno paradoksalne, poszerzone żyły szyjne |
| Zatorowość płucna (estrogeny + tętno 96/min + ból opłucnowy; PERC niespełniony, PMID 18318689) | otwarta | SpO2 ≥95%, tętno <100/min, brak objawów zakrzepicy kończyn, Wells niski, EKG bez przeciążenia prawej komory; D-dimer wg pkt 2.1 | SpO2 <95%, tachykardia >100/min, obrzęk jednostronny kończyny, EKG z przeciążeniem prawej komory |
| Cechy złego rokowania zapalenia osierdzia (PMID 17502574, 15028364) | dziś nieobecne (37,6 °C) lub NIEZNANE | temperatura ≤38 °C, poprawa po NLPZ w ciągu 7 dni | gorączka >38 °C, brak odpowiedzi na NLPZ po tygodniu |
| Ostry zespół wieńcowy | klinicznie mało prawdopodobny (38 lat, ból pozycyjny, niewysiłkowy) | EKG + troponina hs (PMID 33627355: pojedyncza hs-cTnT <5 ng/l ≥3 h od objawów, NPV 100% w doraźnej POZ) | zmiany niedokrwienne w EKG |
| Interakcja kolchicyny z makrolidem (klarytromycyna po „przeziębieniu"?) | otwarta (NIEZNANE) | pytanie o antybiotyk z ostatnich 2 tygodni | — (zmienia lek, nie pilność) |

## 4. Decyzja ordynatora do projektu

Rozpoznanie robocze: ostre zapalenie osierdzia poinfekcyjne. Pilność 2 (dziś), pewność średnia (rozpoznanie wyłącznie z wywiadu — 1 z 4 kryteriów; brak EKG, osłuchiwania, CRP, echo). Jedno działanie: wizyta w gabinecie dziś z EKG i troponiną; leczenie NLPZ + kolchicyna dopiero po wykluczeniu cech wysokiego ryzyka. Brak troponiny tego samego dnia = skierowanie na SOR (zgodnie z POZ-pragmatykiem i gospodarzem kosztów).
