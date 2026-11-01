# 04 — Protokół konsylium (ordynator)

Sprawa TEST-2026-11-01-01 · kobieta 71 l. · tryb PEŁNY (złożoność 7/10) · ślepa tura 6 opinii + runda 1 (6 wpisów w `04-runda1/`).

## 1. Połączony ranking rozpoznań

`_agregat.json` pokazuje 5 pozycji po 0,05–0,11, bo każda rola nazwała to samo rozpoznanie inaczej („reakcja polekowa z eozynofilią i objawami ogólnymi / układowymi / ogólnoustrojowymi (DRESS)”). Połączyłem synonimy ręcznie i przeliczyłem tą samą metodą co `skrypty/agregacja.py` (ważona pula logitów, wagi z `config/wagi.yaml` × k z `pamiec/kalibracja.json`, ε = 0,02 dla niewymienionych; farmakolog z wagą 1,0 dla pozycji polekowych; gospodarz kosztów bez wagi w torze rozpoznania — jego p = 0 jest zgodne z rolą). Wynik po rewizjach z rundy 1:

| # | Rozpoznanie (po scaleniu) | p agregatu | p lekarzy | Kto wymienił |
|---|---|---|---|---|
| 1 | **DRESS po allopurynolu** (zajęcie wątroby i nerek) | **0,90** | 0,70–0,75 | bayes, hipotezujący, najgorszy_scenariusz, poz_pragmatyk, farmakolog (+ gospodarz_kosztow, bez wagi) |
| 2 | DRESS / opóźniona reakcja nadwrażliwości po amoksycylinie | 0,03 | 0,08–0,10 | wszyscy (jw.) |
| 3 | Mononukleoza zakaźna (EBV/CMV) z osutką po aminopenicylinie | 0,02 | 0,06–0,07 | wszyscy (jw.) |
| 4 | Sepsa / uogólnione zakażenie bakteryjne | 0,01 | 0,00–0,04 | bayes, hipotezujący, najgorszy_scenariusz, poz_pragmatyk |
| 5 | Niepowikłana osutka plamisto-grudkowa | 0,01 | 0,03–0,05 | bayes, poz_pragmatyk (+ gospodarz_kosztow) |
| — | SJS/TEN wczesna faza (nakładanie) 0,01 · chłoniak angioimmunoblastyczny 0,01 · DILI po paracetamolu 0,01 | | | pojedyncze role |

Po scaleniu zgoda jest wysoka (flaga `NISKA_ZGODA` z agregatu była artefaktem nazewnictwa, nie sporem). Druga runda niepotrzebna.

Odpowiedź na pytanie lekarza („infekcja czy reakcja na antybiotyk?”): **ani jedno, ani drugie w pierwszym rzędzie** — to reakcja polekowa typu DRESS, a lekiem sprawczym jest najpewniej allopurynol (włączony ~4 tyg. temu, w oknie latencji: mediana 22 dni, IQR 17–31; PMID 23855313), nie amoksycylina (~7 dni od pierwszej dawki, poza oknem; wcześniej tolerowana). Eozynofilia 2,1 G/l (15%) przemawia przeciw zakażeniu. Ból gardła tydzień temu mógł być prodromem DRESS.

## 2. Sprzeczności i jak je rozstrzygam

1. **Pilność 2 vs 1** (ślepa tura: poz_pragmatyk i gospodarz_kosztow dali 2; pozostali 1). W rundzie 1 obaj przeszli na 1 (skąpomocz + kreatynina 1,6 przy ramiprylu, potas i RR NIEZNANE, zawroty ortostatyczne; u ≥85 l. po AKI ACEi/ARB: hiperkaliemia aHR 1,69, hipotensja aHR 1,38 — PMID 41387369). Po rundzie zgoda 6/6: **pilność 1**.
2. **Ramipryl jako kofaktor DRESS** (farmakolog, ślepa tura) — wycofane w rundzie 1 (pojedyncze opisy, brak mechanizmu; PMID 38333456). Ramipryl wstrzymujemy wyłącznie z powodu AKI/hipowolemii/ryzyka hiperkaliemii. Przyjmuję.
3. **Zakres diagnostyki w POZ przed skierowaniem**: poz_pragmatyk chce RR, SpO2, śluzówki, EKG w gabinecie; gospodarz_kosztow — „nic, co opóźnia skierowanie”. Rozstrzygam: parametry życiowe + oglądnięcie śluzówek/skóry obowiązkowo (5 min, decydują o ZRM vs transport rodziną); EKG tylko jeśli od ręki. Serologia EBV, HLA-B*58:01, prokalcytonina — nie w POZ (nie zmieniają decyzji dziś).
4. **Glikokortykosteroid**: farmakolog podaje dawkę 0,5–1 mg/kg/d prednizonu; poz_pragmatyk i gospodarz — nie włączać w POZ. Rozstrzygam: decyzja szpitala (po posiewie krwi, ocenie narządów; PMID 23602183). W POZ nie podawać.
5. **Stopień AKI**: role rozbieżne (stopień 1 wg kreatyniny ≥1,5× wyjściowej; oliguria może oznaczać wyższy). Definicja KDIGO ≥1,5× baseline potwierdzona (PMID 31703649); stopień przy oligurii — do ustalenia w szpitalu z diurezą godzinową.

## 3. Otwarte red flags i weto najgorszego scenariusza

`najgorszy_scenariusz` ma pilność 1 i otwarte red flags → **weto obowiązuje, pilność nie może być niższa niż 1**, dopóki nie wykluczymy jawnie poniższych. Żadnej nie wykluczam w tym protokole (brak badania fizykalnego, brak potasu):

- hipowolemia / hipotensja ortostatyczna (zawroty przy wstawaniu, gorączka, oliguria, amlodypina + ramipryl) — RR, tętno, SpO2 NIEZNANE;
- hiperkaliemia przy AKI + ramipryl — potas NIEZNANY;
- AKI z oligurią (kreatynina 1,6 vs 1,0 mg/dl = 1,6×) — składowa śródmiąższowa (DRESS) + przednerkowa;
- zapalenie wątroby polekowe (ALT 186, AST 140 U/l) — bilirubina, INR NIEZNANE;
- zajęcie serca (eozynofilowe zapalenie mięśnia sercowego; wiek >65 l. związany ze zgonem — PMID 35160164) i płuc — nieocenione; EKG, troponina w szpitalu;
- nakładanie SJS/TEN — pęcherze, nadżerki śluzówek niezweryfikowane badaniem (łagodne zajęcie śluzówek ma 56% chorych z DRESS i samo nie przesądza o SJS — PMID 23855313);
- sepsa bakteryjna — u starszych z DRESS częstsza (PMID 37669109); posiew krwi przed steroidem;
- HLH wtórna — ferrytyna, TG, fibrynogen w szpitalu;
- dalsze przyjmowanie allopurynolu — NIEZNANE, czy pacjentka nadal bierze.

Wykluczone wstępnie (zgodnie, słabo): małopłytkowość (PLT 210), istotna niedokrwistość (Hb 12,9), wcześniejsza alergia na amoksycylinę, kontakt z chorymi z wysypką.

Warunek obniżenia pilności do 2 (zgodny u 5 ról): prawidłowe RR bez spadku w pionizacji, SpO2 ≥92%, zachowana diureza, EKG bez cech hiperkaliemii, brak pęcherzy i nadżerek śluzówek w badaniu. Nawet wtedy hospitalizacja dziś pozostaje wskazana.

## 4. Decyzja ordynatora

Jedna rekomendacja (do `05-projekt.md`): odstawić allopurynol na stałe, wstrzymać ramipryl, zmierzyć RR/tętno/SpO2 i obejrzeć śluzówki, skierować dziś do szpitala (interna/dermatologia przez SOR; ZRM przy hipotensji, SpO2 <92% lub zmianach śluzówkowych). Bez steroidu, NLPZ i nowego antybiotyku w POZ.

Źródła zweryfikowane przez ordynatora w PubMed (streszczenia przeczytane): PMID 23855313 (doi:10.1111/bjd.12501), 37669109 (doi:10.1089/derm.2022.0032), 41387369 (doi:10.1002/bcp.70408), 31662996 (doi:10.1155/2019/7863815), 35160164 (doi:10.3390/jcm11030704), 23602183 (doi:10.1016/j.jaad.2013.01.032), 22488501 (doi:10.1002/art.34488), 31703649 (doi:10.1186/s12885-019-6233-9; definicja KDIGO w metodach). Progi skali RegiSCAR (>5 = pewny) — [wiedza modelu, niezweryfikowane]; `zrodla/` nie zawiera wytycznej dla DRESS.
