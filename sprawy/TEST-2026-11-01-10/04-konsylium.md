# 04 — Protokół konsylium (ordynator)

Sprawa: TEST-2026-11-01-10 · mężczyzna 19 lat · nagły ból prawego jądra 8/10 od 3–6 h, jądro uniesione, obrzęk moszny, wymioty.
Runda dyskusji pominięta (`_runda-pominieta.md`): wszystkie 6 ról w ślepej turze dało to samo rozpoznanie nr 1 i pilność 1.

## 1. Ranking po połączeniu synonimów

`_agregat.json` zgłosił `NISKA_ZGODA` (0,143) wyłącznie z powodu trzech zapisów tej samej choroby: „Skręt jądra prawego (skręt powrózka nasiennego)", „skręt powrózka nasiennego (skręt jądra prawego)", „skręt jądra prawego". Po połączeniu zgoda jest pełna.

| # | Rozpoznanie (połączone) | p w agregacie | p u ról | Wymienili |
|---|---|---|---|---|
| 1 | **Skręt jądra prawego (skręt powrózka nasiennego)** | **≈0,54** (0,342 + 0,136 + 0,061) | 0,72–0,80 | hipotezujący 0,80, najgorszy scenariusz 0,75, POZ-pragmatyk 0,75, bayes 0,72; farmakolog i gospodarz kosztów (waga 0 w torze rozpoznania) wskazali je opisowo jako wiodące |
| 2 | Skręt przyczepka jądra | 0,094 | 0,05–0,08 | bayes, hipotezujący, najgorszy scenariusz, POZ-pragmatyk |
| 3 | Zapalenie najądrza (± jądra) | 0,07 | 0,05–0,09 | bayes, hipotezujący, najgorszy scenariusz, POZ-pragmatyk |
| 4 | Kolka nerkowa prawostronna z bólem rzutowanym | — (poniżej progu) | 0,02–0,04 | bayes, hipotezujący, najgorszy scenariusz |
| 5 | Uwięźnięta przepuklina pachwinowa prawostronna | — | 0,02–0,03 | bayes, hipotezujący, najgorszy scenariusz, POZ-pragmatyk |

Uwaga do agregatu: rozbicie p skrętu na 3 wiersze zaniżyło także wartość względną pozycji 2–3; po połączeniu skręt jądra ma ok. 6× większą masę niż następne rozpoznanie. Pilność: wynik 1, mediana ważona 1,0, 6/6 ról.

## 2. Sprzeczności

Brak sprzeczności w rozpoznaniu nr 1, pilności (1 u wszystkich) ani w następnym kroku (SOR z urologią natychmiast, bez antybiotyku). Różnice tylko redakcyjne:
- bayes liczy skalę TWIST z ankiety na 4 pkt (obrzęk 2 + wymioty 1 + jądro wysoko 1), hipotezujący pisze „≥4"; twarde jądro (+2) i odruch nosidłowy (+1) NIEZNANE — przyjmuję 4–7, co i tak nie zmienia decyzji (Shunmugam 2021, PMID 34521708: TWIST ≥1 w gabinecie → SOR).
- POZ-pragmatyk dopuszcza doraźny paracetamol przed wyjazdem, farmakolog — nic doustnie (na czczo). Rozstrzygam na korzyść farmakologa: nic doustnie, analgezja na SOR; nie opóźnia to wyjazdu, a nie opóźni znieczulenia.
- Składowe TWIST i wartości LR pojedynczych objawów są u ról oznaczone `[wiedza modelu, niezweryfikowane]` — w projekcie używam tylko liczb z PMID.

## 3. Otwarte red flags i rozstrzygnięcie (weto najgorszego scenariusza)

Najgorszy scenariusz ma `red_flags_otwarte` → pilność 1 jest dolnym ograniczeniem i **nie zostaje obniżona**, bo żadnej z flag nie da się wykluczyć danymi z ankiety:
1. **Skręt jądra** (nagły ból 8/10, jądro uniesione, obrzęk, wymioty, ujemny objaw Prehna, wcześniejszy samoustępujący epizod = możliwy skręt przerywany, PMID 39539564) — wykluczy go wyłącznie urolog z USG doppler/eksploracją. NIE wykluczony.
2. **Okno czasowe 3–6 h** — jądro zachowane u 100% przy interwencji <6 h, 64,7% przy 6–12 h, 20,8% >12 h (PMID 39814209); próg 8,5 h czułość 73% dla jądra nieuratowanego (PMID 29354505). Czas liczy się od początku bólu, nie od zgłoszenia.
3. **Bariera wstydu / kontakt przez aplikację** — opóźnienie zgłoszenia podnosi odsetek orchidektomii (17,9 h vs 7,5 h → 42% vs 29%, PMID 33832873). Rozstrzygnięcie: telefon zamiast wiadomości, nazwanie ryzyka utraty jądra wprost.
4. **Brak badania fizykalnego i parametrów życiowych** (NIEZNANE) — nie uzupełniać w POZ kosztem czasu; uzupełni SOR.
5. **Uwięźnięta przepuklina** — mało prawdopodobna (brak uwypuklenia wg pacjenta), ale trafia na ten sam SOR; nie zmienia decyzji.

Flagi wykluczone zgodnie przez role: uraz, gorączka ≥38 °C, przyczyna polekowa (brak leków), świnka, alergie.

## 4. Decyzja ordynatora

Odpowiedź na pytanie lekarza („zapalenie najądrza? antybiotyk i kontrola za tydzień?"): **nie**. Rozpoznanie robocze: skręt jądra prawego do wykluczenia operacyjnie. Pilność 1. Projekt → `05-projekt.md`.
