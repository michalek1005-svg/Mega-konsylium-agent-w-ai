# 04 — Protokół konsylium (ordynator)

Sprawa: TEST-2026-11-01-02 · kobieta 66 lat · „zgaga” od wczoraj wieczorem, nowa duszność wysiłkowa, cukrzyca typu 2.
Runda dyskusji pominięta: 6/6 ról zgodnych w rozpoznaniu i pilności w ślepej turze (`_runda-pominieta.md`).

## 1. Ranking po połączeniu synonimów

`_agregat.json` rozbił to samo rozpoznanie na trzy wpisy (OZW: 0,112 + 0,102 + 0,054; refluks: 0,057 + 0,053) przez różne brzmienie nazw. Połączyłem synonimy ręcznie wg treści, nie przeliczałem log-odds (agregacja.py nie łączy nazw); kolejność poniżej jest kolejnością połączonych wpisów agregatu i jest zgodna z kolejnością p w każdej z czterech ról diagnostycznych.

| # | Rozpoznanie (połączone) | Kto wymienił (p w ślepej turze) | Uwaga |
|---|---|---|---|
| 1 | **Ostry zespół wieńcowy (OZW) bez uniesienia ST — NSTEMI lub niestabilna dławica de novo, obraz nietypowy** | hipotezujacy 0,60 · poz_pragmatyk 0,55 · bayes 0,50 · najgorszy_scenariusz 0,50 | poz_pragmatyk osobno: STEMI / zawał dokonany 0,07 — ten sam tor postępowania, rozstrzyga EKG |
| 2 | Choroba refluksowa przełyku / dyspepsja czynnościowa / ostre zapalenie błony śluzowej żołądka | bayes 0,15 · najgorszy_scenariusz 0,15 · poz_pragmatyk 0,12 · hipotezujacy 0,10 | wszystkie role: nie tłumaczy wysiłkowego charakteru, zimnego potu, promieniowania i duszności |
| 3 | Niewydolność serca de novo / ostra niedokrwienna dysfunkcja LK | bayes 0,07 · poz_pragmatyk 0,06 · najgorszy_scenariusz 0,05 | najczęściej jako następstwo 1 |
| 4 | Niedokrwistość (niedobór B12 przy metforminie, utajone krwawienie z GOPP) nasilająca niedokrwienie | hipotezujacy 0,07 · bayes 0,05 · poz_pragmatyk 0,05 | „coś nieprawidłowego” w morfologii/HbA1c z ostatniego roku — NIEZNANE co |
| 5 | Zatorowość płucna | bayes 0,04 · hipotezujacy 0,04 · najgorszy_scenariusz 0,04 | brak duszności spoczynkowej i czynników ryzyka ŻChZZ |
| 6 | Kwasica mleczanowa przy metforminie | hipotezujacy 0,02 | eGFR NIEZNANE |
| 7 | Ostry zespół aortalny | najgorszy_scenariusz 0,02 | ból międzyłopatkowy + nadciśnienie; charakter bólu nie pasuje |

Farmakolog i gospodarz kosztów (waga 0 w torze rozpoznania) nie dali rankingu, ale obaj pracowali na hipotezie OZW i obaj dali pilność 1.

## 2. Pilność

6/6 ról: **pilność 1 (natychmiast)**. Mediana ważona 1,0, weto najgorszego scenariusza nieaktywne, bo wynik już równa się jego ocenie. Flaga `NISKA_ZGODA` (zgoda 0,035) w agregacie jest artefaktem rozbicia nazw, nie realnej niezgody — faktyczna zgoda co do rozpoznania nr 1 i pilności jest pełna.

## 3. Sprzeczności

Brak sprzeczności co do rozpoznania, pilności i pierwszego kroku (112, bez IPP). Różnice drugorzędne:
- **Kwas acetylosalicylowy przed transportem**: farmakolog, poz_pragmatyk, bayes, najgorszy_scenariusz — podać 150–300 mg do rozgryzienia przy braku przeciwwskazań; gospodarz_kosztow i hipotezujacy — nie wypowiadają się / zostawiają farmakologowi. Rozstrzygam: podać (zgodne z ESC 2023, dawka potwierdzona w PubMed, patrz 05-projekt.md ŹRÓDŁA).
- **Metformina**: farmakolog — wstrzymać od teraz; poz_pragmatyk — nie odstawiać niczego w POZ, decyzja szpitala. Rozstrzygam: w POZ nie podawać kolejnej dawki w dniu transportu (najprostsze, bez ryzyka), dalsza decyzja w szpitalu zależnie od eGFR.
- **Gliklazyd**: farmakolog — wstrzymać na czas hospitalizacji; poz_pragmatyk — monitorować glikemię. Rozstrzygam: jak wyżej, decyzja szpitalna; w POZ tylko nie dawać kolejnej dawki przy nudnościach i głodzeniu.

## 4. Otwarte red flags i jak je rozstrzygam (weto najgorszego scenariusza)

Żadnej z poniższych nie wykluczam w protokole — wszystkie wymagają badań, których POZ nie ma dziś. Pilność 1 zostaje.

| Red flag (po scaleniu duplikatów z 6 opinii) | Status | Co wyklucza |
|---|---|---|
| Zimny pot bez przyczyny + ucisk/pieczenie w szyi, żuchwie, ramieniu lub między łopatkami od wczoraj (reguła ankiety NATYCHMIAST 112) | OTWARTA | EKG 12-odpr. + seryjna troponina hs (szpital) |
| Pieczenie nasilające się przy wysiłku, ustępujące w spoczynku (równoważnik dławicy de novo) | OTWARTA | j.w. |
| Nowa duszność wysiłkowa od wczoraj u 66-latki z cukrzycą, HA, dyslipidemią, paleniem | OTWARTA | j.w. + echokardiografia, jeśli troponina nie wyjaśni |
| STEMI nie wykluczony bez EKG | OTWARTA | EKG (w gabinecie, jeśli nie opóźnia 112) |
| Parametry życiowe, badanie fizykalne, EKG, troponina — NIEZNANE | OTWARTA | pomiar przy pierwszym kontakcie |
| Niedokrwistość / krwawienie z GOPP (nieznany „nieprawidłowy” wynik morfologii lub HbA1c) | OTWARTA | morfologia w szpitalu, pytanie o smoliste stolce |
| eGFR NIEZNANE (metformina, kontrast, dawkowanie leków p/krzepliwych) | OTWARTA | kreatynina w szpitalu |
| Zatorowość płucna, ostry zespół aortalny, zaburzenia rytmu, kwasica mleczanowa | OTWARTE, mało prawdopodobne | SpO2/tętno, RR na obu ramionach, EKG, gazometria — w szpitalu, dopiero po wyjaśnieniu OZW |

Wykluczone zgodnie przez role (bez wpływu na pilność): duszność spoczynkowa (zaprzecza), wymioty (brak), hipoglikemia w chwili pomiaru (214 mg/dl; przy gliklazydzie nie wyklucza wcześniejszego epizodu).

## 5. Decyzja ordynatora

Hipoteza robocza z wywiadu (`_hipoteza-ordynatora.md`: OZW bez uniesienia ST, pilność 1) pokrywa się z wynikiem ślepej tury. Odpowiedź na pytanie lekarza: **nie leczyć jak refluksu**. Projekt rekomendacji w `05-projekt.md`.
