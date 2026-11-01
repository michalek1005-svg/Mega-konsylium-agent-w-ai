# 04 — Protokół konsylium (ordynator, po ślepej turze i rundzie 1)

Sprawa: TEST-2026-11-01-08 · mężczyzna 74 l. · nowe splątanie od 2 dni, chwiejność, upadek bez świadków, nudności/wymioty, częstomocz + polidypsja · leki: indapamid 1,5 mg, sertralina 50 mg (nowa, <4 tyg.), amlodypina 5 mg · Na 131 mmol/l sprzed 4 tyg. (przed sertraliną).
Pytanie lekarza: czy to ZUM, jaki antybiotyk.

## 1. Ranking po połączeniu synonimów

`_agregat.json` rozbił jedno rozpoznanie na trzy wiersze (bayes / hipotezujący / farmakolog nazwali tę samą hiponatremię polekową inaczej), przez co flaga `NISKA_ZGODA` (zgoda 0,02) jest artefaktem nazewnictwa, nie sporem merytorycznym. Połączenie: wiersze agregatu zsumowane w obrębie grupy synonimów (nie uśredniam p ręcznie — poniżej masa z agregatu i zakres p z opinii wyłącznie informacyjnie).

| # | Rozpoznanie (forma kanoniczna) | Masa w agregacie | Kto wymienił (p w opinii) |
|---|---|---|---|
| 1 | **Objawowa hiponatremia polekowa** — sertralina (SIADH) dołączona do indapamidu (tiazydopodobny), na wyjściowym Na 131 | 0,095 + 0,080 + 0,069 = **0,244** | bayes 0,55 · farmakolog 0,60 · najgorszy_scenariusz 0,50 · poz_pragmatyk 0,50 · hipotezujący 0,45 · gospodarz_kosztow (#1, bez p — waga 0 w torze) — **6/6 ról na miejscu 1** |
| 2 | Zakażenie układu moczowego z majaczeniem (w tym wariant najgorszego: urosepsa / zatrzymanie moczu z AKI) | 0,055 | hipotezujący 0,10 · poz_pragmatyk 0,10 · najgorszy 0,10 · bayes 0,08 · farmakolog 0 (poza rolą) · gospodarz |
| 3 | Pourazowy krwiak wewnątrzczaszkowy (podtwardówkowy) po upadku bez świadków | 0,046 | hipotezujący 0,13 · bayes 0,10 · najgorszy 0,10 · poz_pragmatyk 0,10 · gospodarz |
| 4 | Hiperkalcemia (tiazydopodobny ± nowotwór/przytarczyce) / inne zaburzenia elektrolitowe po indapamidzie | poniżej top-5 | farmakolog 0,08 · poz_pragmatyk 0,07 · hipotezujący 0,05 · najgorszy 0,05 · gospodarz |
| 5 | Udar mózgu (tylny krąg) / inne majaczenie (odwodnienie-AKI, zaleganie moczu) | poniżej top-5 | hipotezujący 0,05 · najgorszy 0,05 · poz_pragmatyk 0,10 (zbiorczo) |
| 6 | Działania niepożądane sertraliny bez zaburzeń elektrolitowych / zespół serotoninowy | poniżej top-5 | farmakolog 0,05 · gospodarz |

Po scaleniu: rozpoznanie nr 1 ma ~4,4× masę rozpoznania nr 2. Zgoda co do rozpoznania jest faktycznie **wysoka**; druga runda z powodu `NISKA_ZGODA` niepotrzebna.

## 2. Sprzeczności i jak je rozstrzygam

1. **Pilność 1 vs 2 (jedyny realny spór).** W ślepej turze bayes i poz_pragmatyk dali 2 („dziś”), pozostali 1. W rundzie 1 obaj zrewidowali na 1 (bayes: splątanie/ataksja/upadek = objawy ciężkie hiponatremii, PMID 37983699; pragmatyk: sód z POZ dopiero jutro, TK niedostępna z POZ). Gospodarz kosztów trafnie nazwał to sporem słownym: ścieżka (SOR dziś) była identyczna, różnił się tylko tryb transportu. **Rozstrzygnięcie: pilność 1 — 6/6 po rundzie, weto najgorszego scenariusza spełnione, nie trzeba go uchylać.** Transport: ZRM (112) gdy senny, dalej wymiotuje, nie wstaje, drgawki lub objawy ogniskowe; inaczej rodzina samochodem bez zwłoki (pragmatyk).
2. **Wielomocz + polidypsja vs SIADH.** Kilka ról zauważa, że „oddaje dużo moczu i dużo pije” nie pasuje typowo do SIADH. Nie podważa to rozpoznania nr 1 (polidypsja + diuretyk tłumaczą diurezę, a pierwotne picie pogłębia hiponatremię), ale nakazuje na SOR oznaczyć równolegle wapń i glukozę (hiperkalcemia, nowa hiperglikemia) — przyjęte do planu badań.
3. **Zakres odstawienia leków.** Farmakolog: wstrzymać od dziś sertralinę i indapamid, antybiotyku nie podawać; dodaje w rundzie 1 ostrzeżenie, że jednoczesne odstawienie obu grozi akwarezą i zbyt szybką korektą — to argument dodatkowy ZA korektą w szpitalu z kontrolą Na, nie przeciw odstawieniu. Przyjmuję: nie podawać dzisiejszych dawek obu leków, korekta i monitorowanie w szpitalu.
4. **Klasyfikacja ciężkości objawów.** Role powoływały się na wytyczną ESE/ESICM/ERBP 2014 (PMID 24569496) z etykietą „wiedza modelu” (streszczenie nie podaje klasyfikacji). Zastąpiłem to źródłem potwierdzonym w streszczeniu: Miller 2023, Am Fam Physician, PMID 37983699 — splątanie, majaczenie i ataksja = objawy ciężkie; nudności/wymioty = objawy łagodne. Nie zmienia to decyzji: nasz pacjent ma objawy ciężkie (splątanie + ataksja/upadek).

## 3. Otwarte red flags (najgorszy scenariusz) i ich status

| Red flag | Czym wykluczyć | Status w protokole |
|---|---|---|
| Ciężka objawowa hiponatremia | aktualny Na w surowicy | **OTWARTA** — nie da się wykluczyć bez badania; wymusza pilność 1 (weto obowiązuje) |
| Krwawienie śródczaszkowe po upadku bez świadków | TK głowy bez kontrastu | **OTWARTA** — niejasny wywiad urazu głowy u ≥65 l. = 4,6% istotnego krwawienia (PMID 41170758); brak antykoagulacji obniża, nie wyklucza; objawy wyprzedziły upadek (upadek raczej skutek), ale wcześniejszy niezauważony uraz możliwy |
| Nowa hiperglikemia / hiperkalcemia | glukoza z palca, Ca | OTWARTA, tania do zamknięcia na SOR (lub glukometr w gabinecie) |
| Hipokaliemia / odwodnienie / AKI po wymiotach na diuretyku | jonogram, kreatynina | OTWARTA, zamykana tym samym pobraniem |
| Sepsa / urosepsa, zatrzymanie moczu | parametry życiowe, CRP, mocz z posiewem, USG pęcherza | OTWARTA, ale mało prawdopodobna (bez gorączki, bez dyzurii, oddech prawidłowy); u mężczyzny badanie zalegania zasadne |
| Zespół serotoninowy | badanie przedmiotowe (klonusy, drżenie, hipertermia, tachykardia) | OTWARTA formalnie; córka nie zgłasza drżeń/gorączki/pobudzenia |
| Parametry życiowe, GCS, objawy ogniskowe, stan poznawczy wyjściowy | badanie w gabinecie / SOR; wywiad od rodziny | NIEZNANE — jadą do FINAL |

Żadna red flag nie została wykluczona w protokole, więc **pilność wyniku = 1** (dolne ograniczenie z weta = 1, mediana ważona = 1).

## 4. Odpowiedź na pytanie lekarza (konsensus 6/6)

To najpewniej **nie jest ZUM** (bez gorączki i dreszczy, bez dyzurii, częstomocz z wielomoczem i polidypsją), a obraz tłumaczy hiponatremia polekowa z majaczeniem. **Antybiotyku nie przepisywać** przed oznaczeniem Na i badaniem moczu z posiewem: u starszych z majaczeniem i dodatnim moczem antybiotyk nie poprawiał ustępowania majaczenia w 7. dobie (RR 0,94; PMID 36447157); IDSA 2019 — nie leczyć bakteriomoczu bezobjawowego (PMID 30895288). Gdyby zakażenie potwierdzono na SOR: nie fluorochinolon, nie kotrimoksazol (farmakolog).

## 5. Co dalej
→ `05-projekt.md` w formacie §6. Rezydenci: 2 (ryzyko bezpieczeństwa wg triage — sprawdzić w 02-triage.json; brak pliku w katalogu, przyjmuję domyślnie 2).
