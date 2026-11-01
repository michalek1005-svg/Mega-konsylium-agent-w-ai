# 04 — Protokół konsylium (ordynator)

Sprawa TEST-2026-11-01-07 · kobieta 29 lat · kołatanie, napięcie, chudnięcie 5 kg mimo apetytu, tętno spoczynkowe 115/min, objawy oczne.
Runda dyskusji pominięta: wszystkie 6 ról w ślepej turze podało to samo rozpoznanie nr 1 i tę samą pilność (2). Flaga `NISKA_ZGODA` (0,46) w `_agregat.json` jest artefaktem synonimów — poniżej ranking po ręcznym połączeniu nazw.

## Ranking po połączeniu synonimów

| # | Rozpoznanie (nazwa ujednolicona) | p (łącznie) | Wymienili | Uwagi |
|---|---|---|---|---|
| 1 | **Nadczynność tarczycy w przebiegu choroby Gravesa-Basedowa (z orbitopatią)** | ≈0,66 | hipotezujacy (0,82), bayes (0,80), najgorszy_scenariusz (0,80), poz_pragmatyk (0,75); farmakolog i gospodarz_kosztow wymienili jako kontekst (p=0 z definicji roli, waga 0 w torze rozpoznanie) | Połączone wiersze agregatu: „…Gravesa-Basedowa z orbitopatią” (0,556) + „…Gravesa-Basedowa” (0,102). Wszystkie 4 role ważone dały p ≥ 0,75 — zgoda faktyczna, nie 0,46. |
| 2 | Tyreotoksykoza o innej przyczynie (bezbolesne/podostre zapalenie tarczycy, wole guzkowe toksyczne, egzogenna) | ≈0,05 | bayes, hipotezujacy, poz_pragmatyk, farmakolog (egzogenna 0,03) | Połączone: „tyreotoksykoza o innej przyczynie” (0,027) + „bezbolesne zapalenie tarczycy” (0,023) + wole guzkowe/egzogenna (poniżej progu listy). Wspólny argument przeciw: orbitopatia nie występuje w tych postaciach. |
| 3 | Zaburzenie lękowe uogólnione | ≈0,04 | bayes, hipotezujacy, najgorszy_scenariusz, poz_pragmatyk, gospodarz_kosztow (kontekst) | Jednogłośnie: rozpoznanie z wykluczenia, nie do postawienia bez TSH. |
| 4 | Pierwotna tachyarytmia nadkomorowa | ≈0,02 | bayes, poz_pragmatyk | Nie tłumaczy objawów ogólnych; EKG rozstrzyga. |
| 5 | Powikłania tyreotoksykozy (przełom, kardiomiopatia, neuropatia n. wzrokowego) | 0,03–0,05 każde | najgorszy_scenariusz | Nie konkurują z nr 1 — są jego scenariuszami ciężkości; prowadzą pilność, nie rozpoznanie. |

Wniosek: ranking jest jednomodalny. Alternatywy (2–4) łącznie < 0,12 i każda jest rozstrzygana tym samym pierwszym krokiem (EKG + TSH/FT4/FT3).

## Odpowiedź na pytanie lekarza („Czy włączyć SSRI?”)
Wszystkie role, które się wypowiedziały (farmakolog, najgorszy_scenariusz, poz_pragmatyk, gospodarz_kosztow, bayes, hipotezujacy): **nie, nie teraz**. Argument wspólny: obraz jest somatyczny (hipermetaboliczny), SSRI nie leczy przyczyny i opóźnia rozpoznanie; gospodarz_kosztow: próba SSRI przed TSH to „najdroższa ścieżka”. Warunek powrotu do SSRI (jednogłośnie): prawidłowe TSH (i FT4) — wtedy tor lękowy po ocenie psychiatrycznej/GAD-7.

## Sprzeczności między rolami
Brak sprzeczności w rozpoznaniu nr 1, pilności (6×2) ani w odpowiedzi na pytanie lekarza. Różnice drugorzędne:
1. **Propranolol dziś vs po wynikach.** farmakolog i poz_pragmatyk: włączyć objawowo już dziś po EKG (gdy rytm zatokowy, brak astmy); bayes, hipotezujacy, gospodarz_kosztow: nie wypowiadają się. Rozstrzygnięcie ordynatora: beta-adrenolityk **po EKG w gabinecie** (ten sam dzień), nie „na ślepo” — warunki: tachykardia zatokowa, brak astmy/bradykardii/hipotensji (astma NIEZNANE, trzeba zapytać).
2. **TRAb w POZ.** gospodarz_kosztow i hipotezujacy: pobrać od razu z tej samej próbki; poz_pragmatyk: zwykle poza koszykiem POZ, może zlecić endokrynolog. Rozstrzygnięcie: TRAb zalecić, ale **nie warunkować nim ani leczenia objawowego, ani skierowania** — TSH/FT4/FT3 + orbitopatia wystarczają do rozpoznania roboczego (ETA 2018, PMID 30283735).
3. **Pewność:** hipotezujacy „średnia” (brak jakiegokolwiek potwierdzenia biochemicznego, objawy oczne subiektywne), pozostali „wysoka”. Przyjmuję **wysoką** co do decyzji (co zrobić dziś), **średnią** co do rozpoznania ostatecznego — bo rekomendacja jest ta sama niezależnie od tego, która postać tyreotoksykozy się potwierdzi.

## Otwarte red flags i ich rozstrzygnięcie (weto najgorszego scenariusza)
`najgorszy_scenariusz` ocenił pilność 2 i zostawił 5 otwartych flag → **dolne ograniczenie pilności = 2 (dziś)**. Żadnej flagi nie wykluczam w protokole — wszystkie wymagają badania fizykalnego/EKG/laboratorium, których ankieta nie zastąpi. Pilność pozostaje 2, z jawnymi progami eskalacji do 1:

| Red flag | Status | Jak rozstrzygnąć | Eskalacja do 1 (SOR) gdy |
|---|---|---|---|
| Tachykardia spoczynkowa 115/min, kołatanie ciągłe >1 h (reguła ankiety: EKG + TSH tego samego dnia) | OTWARTA | EKG 12-odpr. w gabinecie dziś | migotanie przedsionków, HR ≥130–150/min, cechy niewydolności serca |
| Przełom tarczycowy | OTWARTA (p 0,03 wg najgorszego; brak gorączki/splątania w ankiecie, ale nieoceniony) | temperatura, stan świadomości, HR, RR, skala Burcha-Wartofsky'ego w gabinecie (PMID 42554462) | gorączka, splątanie, wymioty/biegunka masywna, niewydolność serca |
| Orbitopatia zagrażająca wzrokowi (neuropatia n. wzrokowego) | OTWARTA — ankieta nie pytała o ostrość wzroku, widzenie barw, diplopię | zapytać i zbadać w gabinecie; sztuczne łzy objawowo | spadek ostrości wzroku, zaburzenie widzenia barw, podwójne widzenie → okulista w trybie pilnym (dni) (EUGOGO 2021, PMID 34297684) |
| Ciąża niewykluczona (rzadsze/skąpsze miesiączki, „nie dotyczy” niejednoznaczne) | OTWARTA | test ciążowy z moczu / beta-hCG dziś, **przed** tiamazolem | — (zmienia lek: PTU w I trymestrze, zakaz scyntygrafii; ETA 2018, PMID 30283735) |
| Przeciwwskazania do beta-adrenolityku (astma) | OTWARTA — NIEZNANE | zapytać przed receptą | — (przy astmie: nie propranolol; alternatywa wg farmakologa) |

Red flags wykluczone (zgodnie, na podstawie ankiety): myśli samobójcze; leki/używki wywołujące tachykardię lub tyreotoksykozę (tylko melisa). „Rytm równy” wg pacjentki **nie** jest wykluczeniem migotania przedsionków — rozstrzyga EKG.

## Decyzja ordynatora do projektu
Jedna rekomendacja: dziś wizyta w gabinecie z EKG i pobraniem TSH, FT4, FT3 (+ TRAb, morfologia z rozmazem, ALT, test ciążowy) — **SSRI nie włączać**; beta-adrenolityk objawowo po EKG; tiamazol po potwierdzeniu biochemicznym; skierowanie do endokrynologa w trybie pilnym. Pilność 2.
