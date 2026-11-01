# 04 — Protokół konsylium (ordynator)

Sprawa TEST-2026-11-01-11 · kobieta 61 l. · cukrzyca typu 2 na metforminie + flozynie + inhibitorze konwertazy/sartanie · 3 dni wymiotów i biegunki, oddech Kussmaula, senność, ciśnienie skurczowe 98 mmHg, tętno 112/min.

Runda dyskusji pominięta (`_runda-pominieta.md`): wszystkie 6 ról dało to samo rozpoznanie nr 1 i tę samą pilność (1). Flaga `NISKA_ZGODA` (zgoda 0,01) w `_agregat.json` jest artefaktem: agregacja.py traktuje różne nazwy tej samej choroby jako różne rozpoznania. Synonimy połączyłem ręcznie poniżej.

## Połączony ranking (synonimy scalone)

Wartości p: orientacyjna średnia z opinii ról ważonych w torze rozpoznanie (bayes, hipotezujący, najgorszy scenariusz, POZ-pragmatyk; farmakolog i gospodarz kosztów mają wagę 0 w tym torze, ale wymienili rozpoznanie). Nie zastępuje agregacji log-odds — służy tylko do scalenia nazw.

| # | Rozpoznanie (nazwa ujednolicona) | p (orient.) | Wymienili | Scalone nazwy z agregatu |
|---|---|---|---|---|
| 1 | **Euglikemiczna cukrzycowa kwasica ketonowa związana z flozyną (inhibitor SGLT2), wyzwolona nieżytem żołądkowo-jelitowym i głodzeniem** | ~0,46 | bayes 0,45 · hipotezujący 0,40 · najgorszy scenariusz 0,45 · POZ-pragmatyk 0,55 · farmakolog 0,40 · gospodarz kosztów | „Euglikemiczna kwasica ketonowa związana z inhibitorem SGLT2…”, „Euglikemiczna cukrzycowa kwasica ketonowa…”, „objawy polekowe — euglikemiczna kwasica ketonowa…”, „…wywołana inhibitorem kotransportera sodowo-glukozowego typu 2…” |
| 2 | **Kwasica mleczanowa związana z metforminą przy przednerkowym ostrym uszkodzeniu nerek z odwodnienia** (możliwa postać mieszana z nr 1) | ~0,18 | bayes 0,20 · hipotezujący 0,20 · najgorszy scenariusz 0,15 · POZ-pragmatyk 0,15 · farmakolog 0,15 (+ osobno „przednerkowe AKI” 0,20) · gospodarz kosztów | „…przy ostrym uszkodzeniu nerek z odwodnienia”, „…przy ostrym przednerkowym uszkodzeniu nerek”, „objawy polekowe — kwasica mleczanowa…”, „Kwasica mleczanowa związana z metforminą” |
| 3 | **Ciężkie odwodnienie / wstrząs hipowolemiczny (± septyczny) w przebiegu zakaźnego nieżytu żołądkowo-jelitowego, bez istotnej kwasicy** | ~0,16 | bayes 0,17 · hipotezujący 0,15 · najgorszy scenariusz 0,20 · POZ-pragmatyk 0,12 · gospodarz kosztów | „Wirusowy nieżyt… bez istotnej kwasicy”, „Wstrząs hipowolemiczny lub septyczny…”, „Wstrząs hipowolemiczny z ostrym uszkodzeniem nerek…”, „Ciężkie odwodnienie hipowolemiczne…” |
| 4 | Ostra choroba jamy brzusznej / sepsa z punktem wyjścia w jamie brzusznej (niedokrwienie jelit, ostre zapalenie trzustki) | ~0,08 | hipotezujący 0,10 · najgorszy scenariusz 0,10 · POZ-pragmatyk 0,10 · gospodarz kosztów | „Sepsa lub ostry stan brzuszny…”, „Ostre zapalenie trzustki lub inna przyczyna chirurgiczna…” |
| 5 | Ostry zespół wieńcowy o nietypowym obrazie | ~0,04 | hipotezujący 0,05 · najgorszy scenariusz 0,05 · POZ-pragmatyk 0,03 · gospodarz kosztów | — |

Wniosek: rozpoznanie nr 1 jest jednomyślne (6/6 ról). Nr 2 i 3 nie są alternatywami, lecz współistniejącymi mechanizmami tego samego stanu (odwodnienie → AKI → kumulacja metforminy; głodzenie + flozyna → ketoza). Rozdzielenie wymaga gazometrii z luką anionową, β-hydroksymaślanu i mleczanu — niedostępnych poza szpitalem.

## Sprzeczności między rolami

1. **Nazwa nr 1 (bez sporu merytorycznego)** — rozbieżność tylko w nazewnictwie; scalono.
2. **Co jest „tłem”, a co rozpoznaniem** — bayes i farmakolog traktują nieżyt jako wyzwalacz, nie konkurencyjne rozpoznanie; hipotezujący i najgorszy scenariusz wyodrębniają wstrząs hipowolemiczny jako osobną pozycję. Rozstrzygam: nieżyt = wyzwalacz; odwodnienie/wstrząs = pozycja nr 3, bo nawet bez kwasicy wymaga płynów dożylnych (hipotezujący: „wciąż wymagające płynów dożylnych”). Nie zmienia to rekomendacji.
3. **Farmakolog: osobna pozycja „przednerkowe AKI nasilone przez ACEI/sartan i flozynę” (p 0,20)** — nie jest rozpoznaniem konkurencyjnym, lecz mechanizmem łączącym nr 2 i 3. Nie wchodzi do rankingu jako osobna linia.
4. **Odpowiedź na pytanie lekarza** — zgodna u wszystkich: nie nawadniać w domu; odstawić nie tylko metforminę, ale też flozynę i ACEI/sartan; samo odstawienie nie jest leczeniem (gospodarz kosztów).
5. **Brak sporu o pilność** — 6/6: pilność 1; mediana ważona 1,0.

## Otwarte red flags i rozstrzygnięcie (weto najgorszego scenariusza)

`lekarz-najgorszy-scenariusz` ma otwarte red flags → jego pilność (1) jest dolnym ograniczeniem wyniku. **Żadna nie jest wykluczona** w tym protokole — nie ma danych, by to zrobić. Weto pozostaje w mocy; pilność końcowa = 1.

| Red flag (zdeduplikowana) | Źródło danych | Status | Co by wykluczyło |
|---|---|---|---|
| Oddech głęboki i szybki, niemożliwy do uspokojenia (Kussmaul) przy flozynie + metforminie → kwasica metaboliczna | ankieta, reguła NATYCHMIAST 112 | OTWARTA | gazometria (pH, HCO3-, luka anionowa), β-hydroksymaślan, mleczan — tylko SOR |
| Senność, trudność w dobudzeniu → zaburzenia świadomości | ankieta, reguła NATYCHMIAST 112 | OTWARTA | badanie bezpośrednie (ZRM/SOR) |
| Ciśnienie skurczowe 98 mmHg, tętno 112/min (wskaźnik wstrząsowy ~1,1) → hipowolemia / wstrząs | pomiar domowy | OTWARTA | normalizacja po płynach i.v., mleczan |
| Nietolerancja płynów doustnych | ankieta | OTWARTA | — (przesądza o płynach i.v.) |
| Flozyna przy wymiotach, ketony niemierzone | ankieta | OTWARTA | β-hydroksymaślan we krwi (pasek moczowy nie wyklucza) |
| Kreatynina/eGFR NIEZNANE przy metforminie + flozynie + ACEI/sartan → AKI, hiperkaliemia | wywiad | OTWARTA | kreatynina, potas |
| Stały ból brzucha 5/10 bez badania fizykalnego → ostry brzuch / sepsa | ankieta | OTWARTA | badanie fizykalne, lipaza, CRP, morfologia (SOR); ból brzucha jest też objawem samej kwasicy ketonowej |
| Ostry zespół wieńcowy (kobieta 61 l., cukrzyca, duszność) | wywiad | OTWARTA, niskie p | EKG, troponina na SOR |

Wykluczone (z ankiety, bez badania): krwawienie z przewodu pokarmowego (brak krwi w stolcu, fusowatych wymiotów); jawny bezmocz (mocz w ciągu 6 h — nie wyklucza skąpomoczu ani AKI).

## Decyzja ordynatora

Jedna rekomendacja: wezwanie ZRM (112) i transport na SOR; w domu wstrzymać flozynę, metforminę i ACEI/sartan; nie nawadniać doustnie jako leczenie. Szczegóły w `05-projekt.md`.
