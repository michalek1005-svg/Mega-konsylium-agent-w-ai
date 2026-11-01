# 04 — Protokół konsylium (sprawa TEST-2026-11-01-04)

Runda dyskusji pominięta: 6/6 ról zgodnych co do rozpoznania wiodącego i pilności 1 w ślepej turze (`_runda-pominieta.md`). Protokół poniżej to synteza ordynatora z `03-opinie/*.json` i `_agregat.json`.

## 1. Ranking agregatu — uwaga techniczna
`_agregat.json` wskazuje jako pierwszy zespół odwracalnego skurczu naczyń mózgowych (p 0,164) i flagę `NISKA_ZGODA` (0,046). To artefakt: krwotok podpajęczynówkowy został wpisany pod czterema różnymi nazwami („z pęknięcia tętniaka wewnątrzczaszkowego”, „najpewniej z pękniętego tętniaka, ewentualnie okołośródmózgowiowy”, „z pęknięcia tętniaka (w tym krwawienie ostrzegawcze)”, „okołośródmózgowiowy bez tętniaka”), więc skrypt rozbił jego masę na osobne pozycje. Po ręcznym połączeniu synonimów (bez ręcznego uśredniania p — CLAUDE.md §4; podaję tylko kolejność i zakres p z poszczególnych ról) zgodność jest faktycznie pełna.

## 2. Połączony ranking
| # | Rozpoznanie (po połączeniu synonimów) | Role, które je wymieniły | p w rolach toru rozpoznania |
|---|---|---|---|
| 1 | **Krwotok podpajęczynówkowy** (tętniakowy, krwawienie ostrzegawcze; wariant okołośródmózgowiowy nietętniakowy jako podtyp) | bayes, hipotezujacy, najgorszy_scenariusz, poz_pragmatyk, gospodarz_kosztow, farmakolog (6/6) | 0,40–0,58 (hipotezujacy 0,50 + 0,08 podtyp) |
| 2 | Zespół odwracalnego skurczu naczyń mózgowych (w tym wariant wywołany alkoholem) | bayes, hipotezujacy, najgorszy_scenariusz, poz_pragmatyk, farmakolog, gospodarz_kosztow (6/6) | 0,10–0,12 |
| 3 | Rozwarstwienie tętnicy kręgowej / szyjnej | bayes, hipotezujacy, najgorszy_scenariusz, poz_pragmatyk, gospodarz_kosztow (5/6) | 0,08–0,10 |
| 4 | Pierwotny piorunujący / wysiłkowy ból głowy (rozpoznanie z wykluczenia) | bayes, hipotezujacy, najgorszy_scenariusz, poz_pragmatyk (4/6) | 0,05–0,25 |
| 5 | Naciągnięcie mięśni karku (hipoteza pacjenta) | bayes, poz_pragmatyk, gospodarz_kosztow, farmakolog (4/6) | 0,07–0,08 |
| 6 | Krwotok śródmózgowy nadciśnieniowy | najgorszy_scenariusz (1/6) | 0,05 |
| 7 | Ból głowy z odstawienia alkoholu / polekowy (ibuprofen) | farmakolog (1/6) | 0,01–0,02 |

Pilność: 6/6 ról = 1 (natychmiast). Agregat: wynik 1, mediana ważona 1,0. Pewność: 5 ról „wysoka”, bayes „średnia”.

## 3. Sprzeczności i jak je rozstrzygam
1. **Drugie miejsce w rankingu** — bayes i najgorszy_scenariusz stawiają pierwotny ból wysiłkowy (0,20–0,25) przed skurczem naczyń; pozostałe role odwrotnie. Bez znaczenia dla decyzji: obie pozycje są rozpoznaniami z wykluczenia albo wymagają tej samej angio-TK. Nie rozstrzygam.
2. **Zwolnienie lekarskie** — poz_pragmatyk: wystawić od dziś (otwiera rozmowę, spełnia oczekiwanie pacjenta); gospodarz_kosztow: nie wystawiać „z rozpoznaniem bólu karku”. Rozstrzygnięcie: wystawić, ale z rozpoznaniem roboczym „podejrzenie krwotoku podpajęczynówkowego / obserwacja”, nigdy „ból karku” — spełnia oba warunki.
3. **Tryb transportu** — gospodarz_kosztow dopuszcza transport własny przy prawidłowym badaniu w gabinecie; bayes, hipotezujacy, najgorszy_scenariusz, poz_pragmatyk, farmakolog: zespół ratownictwa medycznego. Rozstrzygnięcie: zespół ratownictwa medycznego (weto najgorszego scenariusza; ryzyko ponownego krwawienia w drodze, pacjent nie prowadzi sam).
4. **Nakłucie lędźwiowe czy angio-TK po ujemnym TK** — gospodarz_kosztow zostawia kolejność SOR; pozostali: nakłucie z oceną ksantochromii jako krok 2, angio-TK jako zamiennik lub uzupełnienie. Rozstrzygnięcie: na skierowaniu prosić o TK + angio-TK głowy i szyi, a przy ujemnym TK o nakłucie; wybór ostateczny należy do SOR.

## 4. Red flags
**Otwarte (żadna nie wykluczona w tym protokole — weto najgorszego scenariusza utrzymuje pilność 1):**
- piorunujący, najsilniejszy w życiu ból głowy przy wysiłku 3 doby temu, bez żadnej diagnostyki obrazowej;
- objawy oponowe dziś (ograniczenie zgięcia karku, światłowstręt) bez gorączki;
- wymioty przy zachorowaniu;
- krwotok podpajęczynówkowy NIE wykluczony — wykluczy dopiero TK bez krwi ORAZ (po >6 h) płyn bez ksantochromii lub angio-TK bez tętniaka;
- rozwarstwienie tętnicy szyjnej/kręgowej i zespół skurczu naczyń — NIE wykluczone (angio-TK głowy i szyi);
- nieleczone nadciśnienie, ciśnienie od epizodu NIEZNANE;
- badanie neurologiczne, parametry życiowe, stan świadomości NIEZNANE (ankieta);
- ojciec zmarł nagle w wieku 52 lat, „wylew” nieznanego typu; palenie 20/d, dużo alkoholu w ostatnich 2 tygodniach;
- ibuprofen 1–2 tabl./d (hamowanie płytek przy możliwym krwawieniu) — odstawić;
- ryzyko zespołu odstawienia alkoholu po przyjęciu (uwaga dla szpitala).

**Wykluczone wywiadem (zgodnie w rolach):** utrata przytomności przy zachorowaniu; leki przeciwkrzepliwe/przeciwpłytkowe na stałe; alergie; gorączka i dreszcze (bakteryjne zapalenie opon mało prawdopodobne, bez izolacji — nie wyklucza krwotoku).

**Weto:** `lekarz-najgorszy-scenariusz` ma otwarte red flags → pilność nie może być niższa niż 1. Żadnej z nich nie wykluczam, bo żadna nie jest wykluczalna bez badania obrazowego. Pilność końcowa: **1**.

## 5. Odpowiedź na pytanie lekarza (ustalenie konsylium)
Nie — to nie jest naciągnięcie mięśni karku; naciągnięcie nie daje bólu „najgorszego w życiu” ze szczytem w sekundy, wymiotów, światłowstrętu ani ograniczenia zgięcia karku, a jest tu rozpoznaniem z wykluczenia (6/6 ról). Nie przepisywać nic „na kark” (zgodnie: farmakolog, poz_pragmatyk, gospodarz_kosztow, najgorszy_scenariusz); dopuszczalny doraźnie tylko paracetamol.

## 6. Literatura — weryfikacja ordynatora
Role nie miały MCP PubMed (proxy) i opierały się na WebSearch po tytułach; liczby oznaczały jako `[wiedza modelu, niezweryfikowane]`. Ordynator sprawdził w PubMed (narzędzie `mcp__PubMed__get_article_metadata`) streszczenia PMID 21768192, 29133539, 14970066, 34819306, 37212182, 24911172, 14984225 — liczby w `05-projekt.md` pochodzą z tych streszczeń. Korekta wobec opinii: wg PMID 34819306 czułość nowoczesnego wielorzędowego TK dla krwotoku tętniakowego wynosi 99,6% jeszcze w 48 h od początku bólu (nie „ok. 85% w 3. dobie”, jak szacowały role z pamięci); dla 72 h badanie nie podaje wartości, więc ujemne TK w 3. dobie nadal nie zamyka ścieżki.
