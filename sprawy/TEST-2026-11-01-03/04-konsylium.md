# 04 — Protokół konsylium (ordynator)

Sprawa TEST-2026-11-01-03 · kobieta 52 l. · ból lewej łydki od 4 dni po 14 h podróży autokarem, od dziś ból opłucnowy po prawej, duszność wysiłkowa, stan przedomdleniowy od wczoraj, SpO2 94%, tętno 104/min, RR 132 mmHg, doustna HTZ (estradiol + dydrogesteron), wywiad rodzinny zakrzepicy, ibuprofen od 4 dni.

**Runda dyskusji pominięta** (`_runda-pominieta.md`): 6/6 ról zgodnych w ślepej turze co do rozpoznania wiodącego i pilności 1; zgoda agregatu 0,78.

## 1. Połączony ranking rozpoznań

Ranking `_agregat.json` jest rozbity przez synonimy. Połączenia dokonane przez ordynatora:

- **(A)** „Zatorowość płucna wtórna do ZŻG lewej kończyny dolnej" (bayes, hipotezujacy, najgorszy_scenariusz, poz_pragmatyk) + „objawy polekowe — ŻChZZ (ZŻG lewego podudzia z ZP) współwywołana doustną HTZ" (farmakolog) = **jedno rozpoznanie**. Farmakolog nazwał to samo zdarzenie od strony czynnika wyzwalającego.
- **(B)** „ZŻG lewej kończyny dolnej bez ZP, z bólem opłucnowym innego pochodzenia" (bayes) + „…z inną przyczyną bólu w klatce piersiowej" (najgorszy_scenariusz, poz_pragmatyk) + „…z niezależną przyczyną bólu opłucnowego" (hipotezujacy) = **jedno rozpoznanie**.
- gospodarz_kosztow podał p=0 przy wszystkich rozpoznaniach (zgodnie z rolą: waga 0 w torze rozpoznanie) — rozpoznania wymienił, nie wyceniał.

| # | Rozpoznanie (połączone) | p (agregat, po połączeniu) | Wymienili |
|---|---|---|---|
| 1 | **Zatorowość płucna (ZP) wtórna do zakrzepicy żył głębokich (ZŻG) lewej kończyny dolnej**, sprowokowana podróżą 14 h i doustną HTZ | **≈0,79** (0,771 + 0,017) | bayes, hipotezujacy, najgorszy_scenariusz, poz_pragmatyk, farmakolog (+ gospodarz_kosztow wymienił) |
| 2 | ZŻG lewej kończyny dolnej bez ZP, z inną przyczyną bólu opłucnowego | ≈0,04 (0,016 + 0,014 + 0,013) | bayes, hipotezujacy, najgorszy_scenariusz, poz_pragmatyk (+ gospodarz_kosztow) |
| 3 | Zapalenie płuc z odczynem opłucnowym (± współistniejący uraz łydki) | <0,02 | bayes, hipotezujacy, najgorszy_scenariusz, poz_pragmatyk, gospodarz_kosztow |
| 4 | Naciągnięcie/naderwanie mięśnia łydki + nerwoból międzyżebrowy / ból ściany klatki (hipoteza lekarza prowadzącego) | <0,02 | bayes, hipotezujacy, najgorszy_scenariusz, poz_pragmatyk, gospodarz_kosztow; farmakolog p=0 |
| 5 | Pęknięta torbiel podkolanowa (zespół rzekomozakrzepowy) | <0,01 | hipotezujacy, poz_pragmatyk |
| 6 | Ostry zespół wieńcowy / zapalenie osierdzia | <0,01 | bayes, najgorszy_scenariusz |
| 7 | Obrzęk podudzia po amlodypinie | <0,01 | farmakolog (obustronny, niebolesny — nie pasuje do obrazu) |

Wartości p po połączeniu są przybliżone (suma rozbitych pozycji); ranking kolejności nie zmienia się. Hipoteza lekarza prowadzącego (poz. 4) jest u każdej roli na końcu listy.

## 2. Sprzeczności między rolami

Brak sprzeczności co do rozpoznania wiodącego i pilności (6/6 pilność 1). Różnice tylko w szczegółach wykonawczych:

1. **Pierwsza dawka heparyny drobnocząsteczkowej (HDCz) w POZ przed transportem**: najgorszy_scenariusz i poz_pragmatyk — tak, jeśli dostępna i transport się przeciąga; farmakolog i gospodarz_kosztow — nie wspominają / priorytetem jest transport. **Rozstrzygnięcie ordynatora:** nie opóźniać wezwania ZRM; HDCz w gabinecie tylko gdy pacjentka już jest w gabinecie, nie ma przeciwwskazań i transport się przeciąga — z adnotacją w skierowaniu. Zasada oparta na ESC 2019 (streszczenie w PubMed niedostępne) → w projekcie oznaczona `[wiedza modelu, niezweryfikowane]`.
2. **Odstawienie HTZ**: farmakolog, najgorszy_scenariusz, poz_pragmatyk — wstrzymać od dziś; gospodarz_kosztow — decyzja zespołu po potwierdzeniu. **Rozstrzygnięcie:** wstrzymać od dziś (koszt zerowy, podejrzenie czynnej zakrzepicy); decyzja o dalszej terapii (droga przezskórna) należy do ginekologa po leczeniu.
3. **Transport**: bayes/hipotezujacy/gospodarz — „transport medyczny"; poz_pragmatyk/najgorszy_scenariusz — ZRM 112/999. **Rozstrzygnięcie:** ZRM (stan przedomdleniowy + tachykardia + hipoksemia graniczna, pacjentka nie jedzie sama).
4. **Wybór antykoagulantu po potwierdzeniu**: farmakolog — apiksaban (mniej krwawień macicznych niż rywaroksaban u kobiet na progestagenie). Decyzja należy do szpitala; w projekcie podaję jako informację dla lekarza POZ, nie jako zalecenie do wdrożenia w POZ.

## 3. Otwarte red flags i rozstrzygnięcie (weto najgorszego scenariusza)

Red flags **otwarte** (nikt ich nie wykluczył; w sprawie nie ma badania fizykalnego ani żadnych badań):
- ZP z obciążeniem prawej komory: stan przedomdleniowy + tętno 104/min + SpO2 94% — w ZP omdlenie wiąże się z niestabilnością hemodynamiczną (OR 3,50) i dysfunkcją prawej komory (OR 2,10) (PMID 30339253).
- ZŻG lewej kończyny: jednostronny obrzęk, ocieplenie, tkliwość po podróży >4 h — niepotwierdzona USG.
- Kliniczne prawdopodobieństwo ZP wysokie: Wells 7,5 (objawy ZŻG 3 + brak alternatywnego rozpoznania 3 + tętno >100 1,5; >6 = wysokie) (PMID 10744147). Przy Wells „ZP prawdopodobna" D-dimer nie służy do wykluczenia — chory idzie od razu na angio-TK (PMID 16403929).
- Ibuprofen od 4 dni: maskuje objawy; po włączeniu antykoagulacji NLPZ zwiększa poważne krwawienia HR 2,37 (PMID 24733305).
- Doustna HTZ kontynuowana przy podejrzeniu czynnej zakrzepicy (doustna HTZ aOR 1,58 dla ŻChZZ; PMID 30626577).
- OZW/zaburzenia rytmu jako przyczyna stanu przedomdleniowego — wyklucza EKG + troponina w SOR.
- Zapalenie płuc — wyklucza RTG/TK w SOR.

Red flags **wykluczone** (wstępnie, pomiar domowy): wstrząs/hipotensja (RR skurczowe 132 mmHg), ciężka hipoksemia (SpO2 94%, nie <90%).

**Weto pilności:** najgorszy_scenariusz ocenił pilność 1 (pewność wysoka); żadna z powyższych red flags nie została jawnie wykluczona, więc pilność 1 jest dolnym ograniczeniem wyniku i pozostaje. Pozostałe 5 ról niezależnie dało 1 — weto nie zmienia niczego, potwierdza.

## 4. Odpowiedź na pytanie lekarza (do projektu)

Pytanie: „Czy to ból mięśniowy łydki i nerwoból międzyżebrowy? Co dać przeciwbólowo?" Odpowiedź zespołu: **nie** — obraz odpowiada ZŻG z zatorowością płucną; leczenie przeciwbólowe nie jest teraz celem, a NLPZ i opioidy są przeciwwskazane (krwawienie przy antykoagulacji, maskowanie objawów, sedacja przy stanie przedomdleniowym). Doraźnie tylko paracetamol.

## 5. NIEZNANE jadące dalej
- badanie fizykalne i parametry mierzone przez personel (ankieta = pomiar domowy, jednorazowy)
- masa ciała, eGFR, morfologia z płytkami, ALT (dobór i dawka antykoagulantu — w SOR)
- odległość do SOR, czy pacjentka jest sama w domu
- brak polskiej wytycznej ŻChZZ/ZP w `zrodla/` (poziom 1 milczy; oparcie na ESC 2019 i PubMed)
