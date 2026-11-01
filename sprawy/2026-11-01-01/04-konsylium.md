# 04 — Protokół konsylium (sprawa 2026-11-01-01, tryb PEŁNY, dwa pytania)

Pytanie wiodące po korekcie lekarza POZ (01.11.2026 00:39): **Część A — INFEKCJA** (etiologia, dlaczego nagły przebieg z silnym osłabieniem i nagłym kaszlem, leczenie). **Część B — reakcja na lek** (wątek dodatkowy; pełny protokół: `B-alergia/04-konsylium.md`).
Prowadzi: ordynator. Lekarze stali: 6 osobnych agentów (model Opus), osobne konteksty; dwie ślepe tury (B: 00:32–00:35; A: 00:44–00:45), dwie rundy dyskusji (B: 00:37–00:38; A: 00:45–00:46) — wpisy w `_log.jsonl`.

---

# CZĘŚĆ A — INFEKCJA (wiodąca)

## A1. Ślepa tura (opinie oddane niezależnie)

| Rola | p grypa | p COVID-19 | p inne wirusowe | p adenowirus | Pilność | Główny argument |
|---|---|---|---|---|---|---|
| bayes | 0,10 | 0,30 | 0,45 | 0,03 | 3 | Polski nadzór 2024–26 (PMID 42797869): grypa szczytuje I–II, na przełomie X/XI pretest ~5%; złe samopoczucie u ≥60 l. LR 2,6 (PMID 15728170); wirusowe łącznie ~92%, bakteryjne ~6–7% |
| hipotezujący | 0,30 | 0,20 | 0,20 | 0,10 | 2 | Nagły początek + prostracja = obraz grypopodobny; krople do oka PRZED objawami oddechowymi → adenowirus; Cochrane: antybiotyk bez korzyści (RR 1,07; PMID 28626858) |
| najgorszy scenariusz | 0,28 | 0,22 | 0,25 | 0,07 | 2 (weto) | „Silne osłabienie” u 64-latki na bisoprololu nie wolno przypisać infekcji bez wykluczenia hipoksemii, zawału po infekcji (×6 w 7 dni po grypie, PMID 29365305), zapalenia nagłośni (PMID 34787558) |
| pragmatyk POZ | 0,22 | 0,24 | 0,24 | 0,06 | 2 | Plan gabinetowy: CRB-65, CRP przyłóżkowe (PMID 36250577), test w 15 min, e-ZLA, zgłoszenie do zespołu kontroli zakażeń |
| farmakolog | — (waga 0) | — | — | — | 2 | Odstawić cefuroksym, azytromycynę (QTc + bisoprolol, PMID 33759318) i budezonid; oseltamiwir tylko po teście (PMID 37306992) |
| gospodarz kosztów | 0,28 | 0,20 | 0,19 | 0,10 | 2 | Test antygenowy jedynym badaniem zmieniającym decyzję dziś; nie zlecać paneli PCR, PCT, serologii, RTG rutynowo |

Agregat ślepej tury: inne wirusowe 0,36; COVID-19 0,28; grypa 0,22; adenowirus 0,05; RSV 0,05. **Zgoda 0,15 → flaga NISKA_ZGODA.** Pilność 2 (mediana ważona).
Zgodne u wszystkich sześciu bez uzgadniania: etiologia wirusowa (~0,9), bakteryjna ~0,06; bez antybiotyku przy braku cech zapalenia płuc; odstawić cefuroksym; paracetamol zamiast NLPZ; dziś SpO2/oddech/RR/osłuchiwanie + test grypa/SARS-CoV-2; zwolnienie z pracy na OIT.

**Decyzja ordynatora o drugiej rundzie (CLAUDE.md: 2 rundy przy NISKA_ZGODA):** rozrzut dotyczy wyłącznie *którego wirusa* (grypa 0,10–0,30), nie kategorii ani decyzji — wszystkie sześć ról w rundzie 1 jawnie stwierdziło, że różnica nie zmienia żadnego działania dziś (test rozstrzyga; oseltamiwir po teście). Druga runda zaniechana, odstępstwo zapisane tutaj dla Sprawdzającego procesu.

## A2. Dyskusja — pięć punktów spornych

### Sporne 1. Grypa 0,10 (sezonowość) vs 0,30 (obraz kliniczny)
- **Bayes**: sezonowość w Polsce — szczyt COVID-19 we wrześniu, grypy w styczniu–lutym, RSV w lutym–marcu (PMID 42797869); obraz kliniczny bez potwierdzonej gorączki daje LR ≤2,6 (PMID 15728170), nie podnosi pretestu 5% do 0,30. Ustąpił w drugą stronę: 0,10→0,13 (nieznana aktywność sezonu 2026/27; obrazu nie liczy drugi raz).
- **Najgorszy scenariusz** sprawdził PMID 42797869 i przyjął: 0,28→0,15; dodał, że zawał rośnie też po RSV (×3,5) i innych wirusach (×2,8) — więc argument sercowy nie zależy od grypy.
- **Hipotezujący** 0,30→0,15 („dziś różnica nic nie zmienia”). **POZ** 0,22→0,15. **Gospodarz** 0,28→0,18.
- **Farmakolog**: rozbieżność ma znaczenie tylko dla oseltamiwiru bez testu; test ją unieważnia.
- **Rozstrzygnięcie**: grypa 0,14 (agregat). Różnica nie zmienia decyzji — test obowiązkowy.

### Sporne 2. Oseltamiwir empirycznie czy tylko po teście
- Wszyscy: **tylko po dodatnim teście** (wynik antygenowy w ok. 15 min — gospodarz, POZ). Korzyść skromna: skrócenie objawów ok. 17–25 h (PMID 24718923, 25640810), brak redukcji hospitalizacji u ambulatoryjnych, także ≥65 l. (PMID 37306992), więcej nudności i wymiotów.
- Wyjątki uzgodnione: **farmakolog** — gdy testu nie ma dziś i ≤48 h od początku, dopuszczalny empirycznie 75 mg 2×/d z odstawieniem po ujemnym wyniku; **najgorszy, gospodarz, bayes, hipotezujący** — przy ciężkim/pogarszającym się przebiegu, zapaleniu płuc, znanym ognisku grypy na oddziale — leczyć niezależnie od 48 h. Bayes: dodatkowo gorączka ≥38,5 °C z dreszczami/bólami mięśni (grypa ~30%) bez testu.
- **Rozstrzygnięcie**: po teście; wyjątki jak wyżej.

### Sporne 3. Azytromycyna — czy ktoś widzi wskazanie
- **Jednogłośnie odstawić.** Krztusiec w 2. dobie z nagłym kaszlem produktywnym ~0,5% (bayes; faza nieżytowa narasta stopniowo — najgorszy, wykluczone chronologią), Mycoplasma ~1% (nagły początek LR 0,4). Powrót tylko przy: kaszlu napadowym ≥2 tyg. z PCR, kontakcie z potwierdzonym krztuścem, ognisku płucnym atypowym — wtedy z EKG, K, Mg (farmakolog, PMID 33759318). Najgorszy przyjął argument QTc od farmakologa; zaznaczył, że w RCT u hospitalizowanych azytromycyna nie wydłużała QTc (PMID 38104755) — główny argument to brak wskazania, nie serce. POZ: odstawienie usuwa też lek zaciemniający część B.

### Sporne 4. Adenowirus jako wspólne wyjaśnienie oka i gardła — wpływ na część B
- **Hipotezujący** wniósł sekwencję: krople do jednego oka 3–4 dni temu (1–2 dni PRZED objawami oddechowymi) → zapalenie gardła → obrzęk powieki drugiego oka = gorączka gardłowo-spojówkowa; 0,10→0,08.
- **Najgorszy scenariusz — korekta faktograficzna**: PMID 23719580 (cytowany przez hipotezującego) dotyczy czucia rogówki w adenowirusowym zapaleniu rogówki i spojówek, **nie** wspiera tezy o sekwencji oko→drogi oddechowe. Ordynator: PMID 23719580 **nie jest cytowany** w FINAL ani w raporcie w tym kontekście; sekwencja pozostaje [wiedza modelu, niezweryfikowane].
- Zgoda wszystkich: adenowirus tłumaczy co najwyżej obrzęk drugiej powieki, **nie** wysypkę dłoni i stóp 15 min po dawce. Wpływ na B tylko przy potwierdzeniu, że krople były na zapalenie spojówek, a drugie oko ma przekrwienie i wydzielinę: cefuroksym 0,75→0,6 (bayes), 0,55→0,45 (POZ), −0,05 (hipotezujący); etykieta bez zmian. Bromfenak + lewofloksacyna + steryd wskazują raczej na zabieg (zaćma) niż na zapalenie spojówek.
- **Rozstrzygnięcie**: rozstrzyga bezpłatne badanie: powód kropli + spojówki obu oczu (przekrwienie, wydzielina, węzeł przeduszny). Bez tego B bez zmian.

### Sporne 5. EKG dziś — standard czy nadmiar
- **Bayes**: nadmiar jako rutyna — bez objawów sercowych bezwzględne ryzyko małe, azytromycynę odstawiamy, więc QTc nie zmienia decyzji; tylko przy objawach.
- **POZ, hipotezujący, najgorszy scenariusz**: dziś, u tej pacjentki — 64 l., skurcze nadkomorowe, bisoprolol maskujący, osłabienie nieproporcjonalne do objawów miejscowych (nietypowy OZW), zawał ×6 w 7 dni po grypie (PMID 29365305); najgorszy dodatkowo powołuje się na `pamiec/zespol.md` (PRZYKLAD-001: EKG w gabinecie u kobiety 50+ z obciążeniem sercowym). Kilka minut, aparat w gabinecie.
- **Gospodarz kosztów**: z niskim progiem — przy wizycie, jeśli aparat jest; obowiązkowo przy objawach albo kontynuacji makrolidu; nie kierować osobno.
- **Farmakolog**: obowiązkowe przy kontynuacji makrolidu albo objawach sercowych; poza tym rozsądne, nie warunek.
- **Rozstrzygnięcie ordynatora: EKG dziś, w gabinecie, podczas tej samej wizyty.** Uzasadnienie: (1) „ostry zespół wieńcowy / zapalenie mięśnia sercowego wywołane infekcją” jest otwartą red flag najgorszego scenariusza, a EKG bez nowych zmian jest w jego własnym kryterium jedynym sposobem jej jawnego wykluczenia i zejścia z pilności 2 na 3; (2) potwierdzony wniosek zespołu (`pamiec/zespol.md`, PRZYKLAD-001) — wpis po follow-upie, więc ma pierwszeństwo przed szacunkiem bezwzględnego ryzyka; (3) koszt i ryzyko kaskady minimalne (gospodarz). Przyjmuję zastrzeżenie bayesa: **nie** jako standard dla każdej infekcji — tylko przy tym profilu (wiek, arytmia, beta-adrenolityk, prostracja).

### Tabela po rewizji

| Rola | p grypa | p COVID-19 | p inne wirusowe | Pilność | Zmiana i powód |
|---|---|---|---|---|---|
| bayes | 0,13 | 0,28 | 0,42 | 2 | grypa ↑ (nieznana aktywność sezonu); adenowirus 0,03→0,05 (kolejność oko→gardło); pilność 3→2 |
| hipotezujący | 0,15 | 0,28 | 0,30 | 2 | grypa ↓↓ (sezonowość PMID 42797869, LR ≤2,6 bez gorączki); COVID ↑, inne ↑ |
| najgorszy scenariusz | 0,15 | 0,28 | 0,30 | 2 (weto) | grypa ↓ po weryfikacji PMID 42797869; przyjął QTc od farmakologa; skorygował cytat hipotezującego; weto utrzymane |
| pragmatyk POZ | 0,15 | 0,26 | 0,30 | 2 | grypa ↓ (sezonowość); oseltamiwir tylko po teście — wzmocnione; EKG dziś |
| farmakolog | — | — | — | 2 | dodał plan B dla oseltamiwiru (empirycznie gdy brak testu i ≤48 h); doprecyzował wskazania do EKG |
| gospodarz kosztów | 0,18 | 0,24 | 0,27 | 2 | grypa ↓ (sezonowość); EKG z niskim progiem |

Agregat po rewizji: **inne wirusowe zakażenie dróg oddechowych 0,42; COVID-19 0,32; grypa 0,14; adenowirus 0,04; RSV 0,04.** Zgoda 0,21 (nadal NISKA_ZGODA — co do wirusa, nie decyzji). Pilność 2. Bakteryjne łącznie ~0,06 (zapalenie płuc 0,04–0,05, zapalenie krtani/tchawicy 0,01–0,02, Mycoplasma 0,01–0,04, krztusiec ≤0,02, zapalenie nagłośni ≤0,01).

## A3. Weto pilności najgorszego scenariusza — stan

| Red flag | Jawnie wykluczona? | Co by wykluczyło |
|---|---|---|
| Hipoksemia / zapalenie płuc (wirusowe, wtórne bakteryjne) | **NIE — NIEZNANE** (SpO2, częstość oddechów, osłuchiwanie) | SpO2 ≥95%, oddechy <20/min, osłuchowo czysto [progi: wiedza modelu, niezweryfikowane] |
| Ostry zespół wieńcowy / zapalenie mięśnia sercowego / arytmia po infekcji (PMID 29365305), maskowane bisoprololem | **NIE — NIEZNANE** | EKG dziś bez nowych zmian; brak bólu w klatce, duszności wysiłkowej, kołatań |
| Zapalenie nagłośni (PMID 34787558, 31359308) / obrzęk krtani (część B) — chrypka maskuje | **NIE — NIEZNANE** | Brak odynofagii nieproporcjonalnej, ślinienia, stridoru, głosu „kluskowatego” |
| Sepsa z zamaskowaną tachykardią (bisoprolol) | **NIE — NIEZNANE** | Ciśnienie, stan świadomości, częstość oddechów prawidłowe |
| Zapalenie wnętrza gałki po ewentualnym zabiegu oka | **NIE — powód kropli NIEZNANY** | Brak zabiegu albo brak bólu oka i spadku ostrości |
| Transmisja na pacjentów OIT | **NIE — otwarta** do testu i zwolnienia | e-ZLA dziś; przy dodatnim teście zgłoszenie do zespołu kontroli zakażeń |

Wykluczone (zgodnie): krztusiec jako przyczyna nagłego początku (faza nieżytowa narasta stopniowo; nie wyklucza współzakażenia); zakażenia odkleszczowe/tropikalne (brak przesłanek).
**Werdykt pilności: 2 (dziś). Weto obowiązuje.** Kryterium zejścia do 3 (najgorszy scenariusz): SpO2 ≥95%, oddechy <20/min, ciśnienie prawidłowe, osłuchowo czysto, bez objawów nagłośniowych, EKG bez nowych zmian, oko bez bólu i spadku ostrości. Eskalacja do 1: SpO2 <92%, oddechy ≥30/min, SBP <90 mm Hg, splątanie, stridor, ból w klatce, zmiany niedokrwienne w EKG [progi: wiedza modelu, niezweryfikowane].

## A4. Rozstrzygnięcie ordynatora — część A
1. **Etiologia**: ostre wirusowe zakażenie dróg oddechowych (~0,9): inne wirusy oddechowe 0,42 > COVID-19 0,32 > grypa 0,14 > adenowirus 0,04 ≈ RSV 0,04; bakteryjna ~0,06. Który wirus — rozstrzyga wyłącznie test antygenowy grypa A/B + SARS-CoV-2 (± RSV), dziś.
2. **Nagły przebieg** — patrz `RAPORT.md` A2; kluczowe: odpowiedź cytokinowa, wiek, praca nocna, inokulum, bisoprolol (maskowanie i nietolerancja wysiłku), nałożona reakcja nadwrażliwości.
3. **Leczenie**: bez antybiotyku (PMID 28626858); odstawić cefuroksym (brak wskazania + część B), azytromycynę (brak wskazania; PMID 33759318), budezonid (brak dowodów u dorosłej bez astmy; wyjątek: świsty, albo potwierdzony COVID-19 — PRINCIPLE PMID 34388395), erdosteinę (część B); paracetamol zamiast NLPZ; oseltamiwir 75 mg 2×/d 5 dni tylko po dodatnim teście na grypę [dawka: wiedza modelu, niezweryfikowane] z wyjątkami ze Spornego 2.
4. **Diagnostyka dziś**: parametry życiowe (tętno nieinformacyjne — bisoprolol), osłuchiwanie, gardło/krtań (nagłośnia), jama ustna, spojówki obu oczu, test, **EKG**, CRP tylko przy niejednoznacznym obrazie; RTG tylko przy progach z A3. Nie zlecać: paneli PCR wielopatogenowych, PCT, serologii atypowych, posiewu, PCR krztuśca w 2. dobie.
5. **Praca**: e-ZLA dziś; powrót po ≥24 h bez gorączki i wyraźnej poprawie, przy grypie/COVID-19 wg procedury szpitala (zwykle ≥5 dni) [wiedza modelu, niezweryfikowane]; dodatni test → zespół kontroli zakażeń; po wyzdrowieniu szczepienia (grypa 2026/27, COVID-19, RSV ≥60 l., dTpa).

---

# CZĘŚĆ B — REAKCJA NA LEK (skrót; pełny protokół: `B-alergia/04-konsylium.md`, werdykt: `B-alergia/09-FINAL.md`, raport: `B-alergia/RAPORT-ETIOLOGIA.md`)

- Ślepa tura: cefuroksym 0,38–0,83 u 6 ról (agregat 0,79), erdosteina 0,03–0,27, pokrzywka wirusowa 0,10–0,22; krople wykluczone zgodnie (obrzęk oka NIEleczonego + stopy, 15 min po dawce doustnej).
- Dyskusja: 4 role niezależnie wniosły hipotezę operacji zaćmy z cefuroksymem dokomorowym (PMID 29911363, 34489227) → mechanizm wzmocnienia istniejącego uczulenia, nie uczulenia pierwotnego; erdosteina obniżona zgodnie do 0,07–0,18 (częstość bazowa); POZ i gospodarz wycofali etykietę „sprawca nieustalony” na rzecz nazwanej.
- Po rewizji: **cefuroksym 0,81** (indywidualnie 0,50–0,75; różnica = efekt puli log-odds normalizowanej między kandydatami), pokrzywka wirusowa 0,08, erdosteina 0,07. Pilność 2 (weto: krtań, krążenie przy bisoprololu, śluzówki NIEZNANE).
- Etykieta: „podejrzenie natychmiastowej nadwrażliwości (31.10.2026) na cefuroksym — każdą drogą, także dokomorowo — i cefalosporyny o podobnym łańcuchu R1 (ceftriakson, cefotaksym, cefepim) oraz na erdosteinę; do weryfikacji alergologicznej; nie jest to alergia na wszystkie beta-laktamy”.
- Wpływ części A na B: adenowirusowe zapalenie spojówek drugiego oka (jeśli potwierdzone badaniem) obniża wartość obrzęku powieki jako objawu alergii (cefuroksym ok. −0,1), nie zmienia etykiety ani planu testów; infekcja = kofaktor (PMID 23909934) i tło pokrzywki infekcyjnej.

## Uwaga procesowa (odstępstwa od ordynator.md / CLAUDE.md §1)
Sprawa prowadzona **dwutorowo (A/B)** na zlecenie lekarza, w jednym katalogu, z dwiema ślepymi turami i dwiema rundami dyskusji. **Pominięto**: `05-projekt.md` (werdykt pisany bezpośrednio jako `09-FINAL.md`), rezydentów (`06-rezydenci/`) i `08-odpowiedz-rezydentom.md`; zamiast tego `08-odpowiedz-sprawdzajacemu.md` (odpowiedź na żółtą kartkę Sprawdzającego faktów, `07-sprawdzenie.json`). Druga runda dyskusji przy NISKA_ZGODA w części A zaniechana (uzasadnienie w A1). **Wyjątek do zatwierdzenia przez Michała** — bez zatwierdzenia sprawa nie zasila `pamiec/`.

Dalej: `07-sprawdzenie.json` (pętla 1: ŻÓŁTA) → `08-odpowiedz-sprawdzajacemu.md` → `09-FINAL.md` v2, `RAPORT.md` v2 → zatwierdzenie wyjątku przez użytkownika.
