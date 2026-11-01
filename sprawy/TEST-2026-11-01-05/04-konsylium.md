# 04 — Protokół konsylium (ordynator)

Sprawa: TEST-2026-11-01-05 · kobieta 34 l. · pytanie lekarza: „Czy włączyć lewotyroksynę?”
Ślepa tura: 6 opinii (`03-opinie/`), agregat `03-opinie/_agregat.json` (flaga `NISKA_ZGODA`, zgoda 0,111). Runda 1: `04-runda1/*.md`; rewizja po rundzie: `najgorszy_scenariusz` (niedobór żelaza 0,50 → 0,65; tarczyca 0,25 → 0,15).

## 1. Ranking po połączeniu synonimów

Agregat rozbił te same rozpoznania na różne nazwy. Połączyłem je ręcznie (p = suma pozycji agregatu dla tego samego bytu; nie uśredniam sam, tylko sumuję wiersze skryptu):

| # | Rozpoznanie (nazwa ujednolicona) | p (agregat, po scaleniu) | Wymienili (p w ślepej turze) | Scalone wiersze agregatu |
|---|---|---|---|---|
| 1 | **Niedokrwistość z niedoboru żelaza wtórna do obfitych krwawień miesiączkowych** (z komponentą diety wegetariańskiej) | **0,36** | bayes 0,72 · poz_pragmatyk 0,72 · najgorszy_scenariusz 0,65 (rewizja) · hipotezujacy 0,55 · gospodarz_kosztow (wymienił, p=0 zgodnie z rolą) · farmakolog (kontekst, p=0) | „…wtórna do obfitych krwawień miesiączkowych” 0,222 + „…nasilona dietą wegetariańską” 0,088 + „…w przebiegu obfitych krwawień” 0,051 |
| 2 | **Subkliniczna niedoczynność tarczycy, podłoże autoimmunologiczne (Hashimoto) niepotwierdzone** | **0,14** | bayes 0,10 · poz_pragmatyk 0,14 · najgorszy_scenariusz 0,15 (rewizja) · hipotezujacy 0,15 · gospodarz_kosztow (p=0, rola) · farmakolog (p=0, rola) | „…w przebiegu przewlekłego autoimmunologicznego zapalenia tarczycy” 0,091 + „…typu Hashimoto” 0,046 |
| 3 | Przemijające (nietrwałe) podwyższenie TSH — jedno oznaczenie | poniżej progu tabeli agregatu | poz_pragmatyk 0,07 (jako osobny byt); pozostali ujęli to jako argument „przeciw” w poz. 2 | — |
| 4 | Strukturalna przyczyna obfitych krwawień (mięśniak, polip, adenomioza) — przyczyna poz. 1, nie konkurent | poniżej progu | hipotezujacy 0,12 · gospodarz_kosztow (lista) · najgorszy_scenariusz (w red flags) | — |
| 5 | Wrodzona skaza krwotoczna (choroba von Willebranda) | poniżej progu | najgorszy_scenariusz 0,08 · hipotezujacy 0,05 · bayes 0,03 · poz_pragmatyk 0,02 | — |
| 6 | Celiakia jako współprzyczyna niedoboru żelaza | poniżej progu | bayes 0,05 · hipotezujacy 0,05 · najgorszy_scenariusz 0,05 · poz_pragmatyk 0,04 | — |
| 7 | Rozrost/nowotwór endometrium | poniżej progu | najgorszy_scenariusz 0,02 | — |

Uwaga do interpretacji: p w ślepej turze oznacza „dominujące wyjaśnienie objawów” (zastrzeżenie poz_pragmatyka i bayesa); poz. 1 i 2 mogą współistnieć. Bayes szacuje osobno: p potwierdzenia subklinicznej niedoczynności w powtórnym oznaczeniu ≈ 0,5, p dodatnich anty-TPO ≈ 0,3–0,35 [wiedza modelu, niezweryfikowane].

Flaga `NISKA_ZGODA` jest artefaktem nazewnictwa, nie sporu klinicznego: po scaleniu wszystkie role z wagą w torze rozpoznania dają niedoborowi żelaza ≥0,55, a tarczycy 0,10–0,15.

## 2. Odpowiedź na pytanie lekarza — stan po rundzie 1

Wszystkie 6 ról: **lewotyroksyny dziś nie włączać.** Zgoda co do warunków włączenia:
- natychmiast — dodatni test ciążowy (TSH 5,4 mIU/l przekracza próg leczenia w ciąży);
- przed koncepcją — potwierdzone w powtórnym oznaczeniu TSH >4 mIU/l (zwłaszcza z dodatnimi anty-TPO) lub TSH >10 mIU/l / FT4 poniżej zakresu;
- farmakolog i gospodarz dopuszczają też próg >2,5 mIU/l przy dodatnich anty-TPO przedkoncepcyjnie [wiedza modelu, niezweryfikowane — ATA 2017].

## 3. Sprzeczności i jak je rozstrzygam

1. **Termin powtórnego TSH: 2–4 tyg. (hipotezujacy, bayes) vs 4 tyg. (POZ, najgorszy) vs 6–8 tyg. (gospodarz, farmakolog w ślepej turze).** W rundzie 1 gospodarz, farmakolog i hipotezujacy przeszli na ok. 4 tygodnie, bo pacjentka planuje ciążę, a samoistna normalizacja TSH trwa medianę 18 miesięcy (PMID 15811925), więc czekanie na nią nie ma sensu. **Decyzja: jedno pobranie za 4 tygodnie** (TSH, FT4, anty-TPO, morfologia z retikulocytami, ferrytyna, B12).
2. **Czy niedobór żelaza „tłumaczy” TSH 5,4?** Ślepa tura (bayes, gospodarz, farmakolog) przyjęła, że tak — ciężki niedobór żelaza podnosi TSH. Farmakolog i hipotezujacy w rundzie 1 skorygowali: metaanaliza wykazała wzrost TSH tylko u ciężarnych i mały (MD 0,12 mIU/l; PMID 33716980), u nieciężarnych raczej częstsze anty-TPO (OR 1,89). **Decyzja: żelazo nie tłumaczy TSH 5,4; powtórka jest potrzebna z powodu pojedynczego pomiaru, nie „po wyrównaniu żelaza”.** Dlatego nie czekamy 6–8 tygodni.
3. **Próg przedkoncepcyjny 2,5 vs 4,0 mIU/l.** Metaanaliza RCT: leczenie przedkoncepcyjne nie poprawia odsetka ciąż ani żywych urodzeń (RR 1,41; 0,84–2,36), w ciąży korzyść dla porodu przedwczesnego tylko w podgrupie TSH >4,0 (RR 0,47; 0,20–1,10), nie w 2,5–4,0 (PMID 38368537). U eutyreotycznych z anty-TPO lewotyroksyna nie zwiększa żywych urodzeń (TABLET 37,4 % vs 37,9 %; PMID 30907987). **Decyzja: próg operacyjny w projekcie = potwierdzone TSH >4,0 mIU/l; przy TSH 2,5–4,0 z dodatnimi anty-TPO — bez leczenia, kontrola TSH po zajściu w ciążę.**
4. **Dawka żelaza i schemat.** Farmakolog 60–120 mg Fe elementarnego dziennie lub co drugi dzień; POZ 60–100 mg. Schemat co drugi dzień ma lepszą frakcję wchłaniania (PMID 29032957, 31413088). **Decyzja: 80–100 mg Fe²⁺ co drugi dzień rano, na czczo.**
5. **tTG-IgA od razu (gospodarz, najgorszy — BSG 2021 zaleca serologię celiakii u wszystkich dorosłych z IDA, PMID 34497146) vs dopiero przy braku odpowiedzi (POZ, bayes).** **Decyzja: dołączyć do pobrania za 4 tygodnie** (tanie, jedno pobranie, nie opóźnia leczenia).

## 4. Otwarte red flags i weto najgorszego scenariusza

Najgorszy scenariusz utrzymuje pilność 3 z otwartymi flagami; nikt nie ocenił niżej. Mediana ważona 3,0; weto nie obniża wyniku. **Pilność sprawy = 3 (w tym tygodniu).**

| Flaga | Status | Rozstrzygnięcie |
|---|---|---|
| Ciąża wykluczona tylko deklaracją | OTWARTA | Test ciążowy z moczu na tej wizycie, przed resztą planu. Dodatni → lewotyroksyna od razu, inna ścieżka. |
| Parametry życiowe / badanie fizykalne NIEZNANE (tachykardia, hipotonia, bladość, tarczyca palpacyjnie) | OTWARTA | Badanie na wizycie. Tachykardia spoczynkowa/hipotonia ortostatyczna → pilność 2, żelazo dożylne, szybszy ginekolog. |
| Przyczyna strukturalna obfitych krwawień (mięśniak, polip, adenomioza, rozrost endometrium) | OTWARTA | Skierowanie/zalecenie wizyty u ginekologa z USG przezpochwowym, tryb planowy (tygodnie). Nie blokuje żelaza. |
| Skaza krwotoczna (vWD) | OTWARTA, niskie p | Ustrukturyzowany wywiad krwawień na wizycie (dziąsła, nos, po zabiegach, rodzinnie); badania krzepnięcia dopiero przy dodatnim wywiadzie. Obfitość od roku, nie od menarche — argument przeciw. |
| Utrata krwi z przewodu pokarmowego / celiakia | OTWARTA, niskie p | Dopytać o smoliste stolce, krew w stolcu, biegunki, chudnięcie; tTG-IgA + IgA całkowite w pobraniu za 4 tyg. |
| Niedobór B12 u wegetarianki (maskowany mikrocytozą) | OTWARTA | B12 w pobraniu za 4 tyg.; kwas foliowy 0,4 mg/d od teraz. |
| Pierwotna niedoczynność kory nadnerczy przed lewotyroksyną | OTWARTA, bardzo niskie p | Dotyczy tylko sytuacji włączania lewotyroksyny; przy hipotonii/przebarwieniach/hiponatremii kortyzol poranny przed LT4 [wiedza modelu, niezweryfikowane]. Nie zmienia dzisiejszej decyzji. |
| Dynamika Hb od 2 tyg. przy trwających krwawieniach | OTWARTA | Morfologia w pobraniu za 4 tyg.; wcześniej, jeśli objawy narastają. |

Wykluczone (zgodnie, z argumentem): czynne masywne krwawienie (nie miesiączkuje), ciężka niedokrwistość wymagająca przetoczenia (Hb 10,8 g/dl), jawna niedoczynność (FT4 w zakresie), poporodowe zapalenie tarczycy (brak porodu/poronienia), polekowe (brak leków z listy), myśli samobójcze (zaprzecza), zmiany szyi w ocenie pacjentki.

## 5. Decyzja do projektu

Odpowiedź lekarzowi: **nie dziś.** Jedno działanie: żelazo doustne + test ciążowy na wizycie; jedno pobranie za 4 tygodnie rozstrzyga lewotyroksynę. Plan B zależny od testu ciążowego i powtórnego TSH. Szczegóły: `05-projekt.md`.
