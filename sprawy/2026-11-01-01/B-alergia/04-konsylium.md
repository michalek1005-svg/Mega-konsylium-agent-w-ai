# 04 — Protokół konsylium (sprawa 2026-11-01-01, tryb PEŁNY, pytanie etiologiczne)

Pytanie konsylium: nadwrażliwość przyjęta jako fakt; ustalić **czynnik etiologiczny** i **wyjaśnienie**.
Prowadzi: ordynator. Lekarze stali: hipotezujący, bayes, najgorszy scenariusz, pragmatyk POZ, farmakolog, gospodarz kosztów (6 osobnych agentów, model Opus, osobne konteksty; wpisy start/stop w `_log.jsonl` 00:32–00:35 dla ślepej tury, 00:37–00:38 dla rewizji).

## 1. Ślepa tura (opinie oddane niezależnie, przed wglądem w cudze)

| Rola | p cefuroksym | p erdosteina | p pokrzywka wirusowa | Pilność | Główny argument |
|---|---|---|---|---|---|
| hipotezujący | 0,38 | 0,22 | 0,22 | 2 | Opis pielęgniarki uczulonej wziewnie na cefuroksym, reakcja po doustnym cefuroksymie w infekcji (PMID 29114903); rozstrzyga tolerancja dawek z dni 1–2 |
| bayes | 0,83 | 0,03 | 0,10 | 3 | Rachunek LR: pretest beta-laktamów ~10× wyższy, chronologia LR 3, ekspozycja zawodowa LR 2,5, reakcja na 3.–4. dawkę LR 0,6 |
| najgorszy scenariusz | 0,50 | 0,17 | 0,12 | 2 (weto) | Najgroźniejszy błąd = „oczyszczenie” cefuroksymu i ceftriakson i.v. na SOR; anafilaksja z krtanią zamaskowana chrypką i bisoprololem |
| pragmatyk POZ | 0,45 | 0,25 | 0,12 | 2 | Ranking odwraca bezobjawowa tolerancja ≥3 dawek cefuroksymu + pierwsza dawka erdosteiny; etykieta „sprawca nieustalony” |
| farmakolog | 0,50 | 0,20 | 0,12 | 2 | IgE przeciw łańcuchowi R1 (metoksyimino) wspólnemu z ceftriaksonem/cefotaksymem; kofaktory: infekcja, praca nocna |
| gospodarz kosztów | 0,38 | 0,27 | 0,22 | 4 | Etykieta kosztuje: testować tylko cefuroksym, erdosteiny unikać bez testów; „sprawca nieustalony”, nie „beta-laktamy” |

Agregat ślepej tury (`skrypty/agregacja.py`): cefuroksym 0,79; pokrzywka wirusowa 0,09; erdosteina 0,07; substancja pomocnicza/konserwant 0,02; krople 0,01. Zgoda 0,55 (powyżej progu NISKA_ZGODA 0,5 → jedna runda). Pilność: mediana ważona 2.

Wspólne dla wszystkich sześciu (bez uzgadniania): reakcja natychmiastowa, układowa, krople praktycznie wykluczone jako sprawca (obrzęk oka NIEleczonego + stopy), tolerancja wcześniejsza nie wyklucza uczulenia, ekspozycja zawodowa jako główna droga uczulenia.
Niezależnie wniesione przez 4 role (najgorszy scenariusz, bayes, pragmatyk POZ, farmakolog): zestaw kropli lewofloksacyna+steryd+bromfenak = schemat po operacji zaćmy → możliwy cefuroksym dokomorowy 3–4 dni przed reakcją (PMID 29911363, 34489227).

## 2. Dyskusja — cztery punkty sporne

### Sporne 1. Hipoteza zabiegu zaćmy z cefuroksymem dokomorowym — czy i jak zmienia ocenę
- **Farmakolog**: dawka dokomorowa 1,0 mg/0,1 ml (PMID 41784986) to ok. 1/500 dawki doustnej; anafilaksje opisane (PMID 23850230, 34489227, 29911363). 3–4 dni za krótko na uczulenie pierwotne; wprowadza mechanizm **odpowiedzi anamnestycznej**: kolejne ekspozycje podnoszą miano IgE w ciągu dni, co osłabia argument „nie zareagowała na pierwszą dawkę”.
- **Hipotezujący**: pierwotna odpowiedź IgE trwa 7–10+ dni [wiedza modelu, niezweryfikowane]; u osoby już uczulonej (praca, kursy) zabieg = dawka przypominająca → reakcja dopiero przy 3.–4. dawce doustnej staje się zrozumiała. „Osłabia mój główny argument przeciw cefuroksymowi.”
- **Bayes**: na razie neutralne (zabieg NIEZNANY); po potwierdzeniu LR 1,5–2 → ok. 0,83.
- **Gospodarz kosztów**: zabieg to wniosek, nie fakt; najtańsze rozstrzygające badanie = karta informacyjna z okulistyki (0 zł). Zmienia stawkę etykiety: operacja drugiego oka = kolejny cefuroksym dokomorowo; diagnostyka alergologiczna musi zakończyć się PRZED tym zabiegiem.
- **Najgorszy scenariusz, pragmatyk POZ**: zgodnie — wzmocnienie istniejącego uczulenia, „trzecia droga ekspozycji na ten sam lek w ciągu tygodnia”; okulista musi wiedzieć.
- Zmiany zdania: hipotezujący 0,38→0,50; gospodarz 0,38→0,50; POZ 0,45→0,55; najgorszy 0,50→0,55; farmakolog 0,50→0,55. **Rozstrzygnięcie**: hipoteza przyjęta jako warunkowa (NIEZNANE), z mechanizmem booster, nie uczulenia pierwotnego.

### Sporne 2. Erdosteina: 0,03 (bayes) vs 0,27 (gospodarz)
- **Bayes** ustąpił w drugą stronę: przyjął argument POZ i hipotezującego, że reakcja dopiero na 3.–4. dawkę jest mocniejsza niż zakładał (LR 0,6→0,35), i podwoił pretest erdosteiny z powodu niedoraportowania → erdosteina 0,03→0,07, cefuroksym 0,83→0,75.
- **Gospodarz kosztów**: „jedyny nowy lek” to sygnał czasowy, nie przyczynowy; 0,27→0,15. **Hipotezujący**: „jedyny nowy lek” = LR 2–3, baza beta-laktam : erdosteina >10× → 0,22→0,15. **POZ**: 0,25→0,15, ale nie niżej, dopóki tolerancja dawek z dni 1–2 NIEZNANA. **Najgorszy**: 0,17→0,12. **Farmakolog**: 0,18 — „0,03 za mało (PMID 33546741 niemal identyczny obraz: dłonie + obrzęk w infekcji), 0,27 za dużo”.
- **Rozstrzygnięcie**: erdosteina = drugi podejrzany, zakres indywidualny 0,07–0,18; nie testować, unikać (koszt unikania ≈ 0, zgoda wszystkich).

### Sporne 3. Pilność 2 / 3 / 4
- **Najgorszy scenariusz** utrzymał weto 2: nikt nie wykluczył jawnie obrzęku krtani (chrypka maskuje), objawów krążeniowych przy bisoprololu ani zmian śluzówkowych; przyjął od bayesa, że SJS/TEN jako mechanizm reakcji z 15. minuty jest mało prawdopodobny.
- **Bayes** 3→2 (przyjął weto). **Gospodarz** 4→3, weto 2 przyjmuje „dla dzisiejszego kontaktu”. **Hipotezujący, POZ, farmakolog**: 2.
- **Rozstrzygnięcie**: patrz §3 — weto obowiązuje.

### Sporne 4. Etykieta w dokumentacji
- Przed dyskusją dwie role (POZ, gospodarz) proponowały „sprawca nieustalony”. Po dyskusji **obie wycofały**: POZ — „systemy ostrzeżeń w e-recepcie i szpitalu działają na nazwę substancji”; gospodarz — „ryzyko ponownej ekspozycji w szpitalu”. **Najgorszy scenariusz**: „etykieta bez nazwy leku nie zatrzyma ceftriaksonu podanego dożylnie”; penicylin i cefazoliny nie blokować. Wszyscy odrzucili też „alergia na beta-laktamy” (koszt etykiety: PMID 29950489 — gospodarz).
- Różnica resztkowa: zakres cefalosporyn R1 — bayes/POZ/gospodarz: ceftriakson, cefotaksym; farmakolog/hipotezujący/najgorszy: + cefepim (ostrożnie ceftazydym; grupowanie Romano, PMID 25930196).
- **Rozstrzygnięcie**: etykieta nazwana, czasowa, z jawnym zakresem; przyjmuję wersję szerszą (z cefepimem) — asymetria strat.

### Tabela po rewizji

| Rola | p cefuroksym | p erdosteina | p pokrzywka wirusowa | Pilność | Zmiana i powód |
|---|---|---|---|---|---|
| hipotezujący | 0,50 | 0,15 | 0,18 | 2 | ↑ cefuroksym (booster po zabiegu osłabia argument „nie pierwsza dawka”); ↓ erdosteina (częstość bazowa) |
| bayes | 0,75 | 0,07 | 0,13 | 2 | ↓ cefuroksym (LR 3.–4. dawki 0,6→0,35), ↑ erdosteina (pretest ×2); pilność 3→2 (weto) |
| najgorszy scenariusz | 0,55 | 0,12 | 0,10 | 2 | ↑ cefuroksym (zabieg); ↓ erdosteina; weto utrzymane; odrzuca „sprawca nieustalony” |
| pragmatyk POZ | 0,55 | 0,15 | 0,12 | 2 | ↑ cefuroksym (trzecia droga ekspozycji); ↓ erdosteina; **zmienia etykietę** na nazwaną |
| farmakolog | 0,55 | 0,18 | 0,10 | 2 | ↑ cefuroksym (odpowiedź anamnestyczna); dodaje alternatywę dokomorową (moksyfloksacyna 0,5 mg/0,1 ml, PMID 41784986) |
| gospodarz kosztów | 0,50 | 0,15 | 0,18 | 3 (weto 2 przyjęte) | ↑ cefuroksym; ↓ erdosteina; pilność 4→3; **wycofuje „sprawca nieustalony”** |

Agregat po rewizji: **cefuroksym 0,81**; pokrzywka wirusowa 0,08; erdosteina 0,07; substancja pomocnicza/konserwant 0,02; krople 0,01. Zgoda 0,58. Pilność 2.
Uwaga do liczby 0,81 wobec indywidualnych 0,50–0,75: skrypt uśrednia ważone log-odds każdego rozpoznania i normalizuje je softmaxem tylko między wymienionymi kandydatami, więc gdy wszystkie sześć opinii wskazuje ten sam kierunek, masa, którą każdy lekarz osobno rozkładał na rzadsze i niewymienione hipotezy, przechodzi na lidera — 0,81 jest miarą zgodności zespołu, nie oceną żadnego z lekarzy.

## 3. Weto pilności najgorszego scenariusza — stan

Rola `najgorszy_scenariusz` ma `red_flags_otwarte`. Zgodnie z CLAUDE.md §4 pilność nie może być niższa od jego oceny (2), dopóki red flag nie zostanie jawnie wykluczona tutaj z argumentem i źródłem.

| Red flag | Czy jawnie wykluczona w tym protokole | Co by wykluczyło |
|---|---|---|
| Obrzęk krtani w czasie reakcji, zamaskowany chrypką infekcyjną | **NIE — NIEZNANE** (objawy oddechowe w czasie reakcji nieopisane) | Brak stridoru, duszności, dysfagii, ślinienia w czasie reakcji i teraz; prawidłowa saturacja |
| Objawy krążeniowe/brzuszne (kryteria anafilaksji WAO 2020, PMID 33204386) | **NIE — NIEZNANE** | Pomiar ciśnienia w czasie/po reakcji, brak zasłabnięcia, wymiotów |
| Maskowanie ciężkości przez bisoprolol, słabsza odpowiedź na adrenalinę | **NIE — otwarta** (lek przyjmowany) | Nie da się wykluczyć; uwzględnić w planie awaryjnym (glukagon jako 2. linia, PMID 41700292) |
| Zmiany śluzówkowe, pęcherze, zmiany tarczowate (ciężka reakcja skórna) | **NIE — NIEZNANE** (morfologia nieopisana); jako mechanizm reakcji z 15. minuty mało prawdopodobne (zgoda bayes + najgorszy) | Oglądnięcie jamy ustnej, spojówek obu oczu; bąble znikające <24 h |
| Ponowna ekspozycja zawodowa / dożylna na cefalosporyny przed diagnostyką | **NIE — otwarta** do czasu wpisu i zmiany zadań w pracy | Etykieta w dokumentacji + odsunięcie od przygotowywania cefalosporyn |

Wykluczone chronologią (zgodnie, 3 role): DRESS, choroba posurowicza, SJS/TEN jako mechanizm tego epizodu (latencja dni–tygodnie vs 15 min) [wiedza modelu, niezweryfikowane]; krople jako jedyne wyjaśnienie (anatomicznie i czasowo).

**Werdykt pilności: 2 (dziś). Weto obowiązuje.** Po jawnym wykluczeniu czterech pierwszych flag w badaniu — 3 dla samej diagnostyki etiologicznej (testy skórne i tak w oknie 4–6 tygodni [wiedza modelu, niezweryfikowane]).

## 4. Rozstrzygnięcie ordynatora

1. **Czynnik etiologiczny: cefuroksym** (agregat 0,81; każda z 6 ról stawia go na pierwszym miejscu, indywidualnie 0,50–0,75). Mechanizm: natychmiastowa nadwrażliwość IgE-zależna przeciw determinancie łańcucha bocznego R1 (metoksyimino), uczulenie nabyte zawodowo (aerozol/skóra przy przygotowywaniu cefalosporyn i.v.; PMID 29114903, 17445015) i/lub w kolejnych kursach, prawdopodobnie wzmocnione niedawną ekspozycją dokomorową (zabieg zaćmy — NIEZNANE), ujawnione przy kofaktorze ostrej infekcji (PMID 23909934).
2. **Drugi podejrzany: erdosteina** (0,07–0,18 indywidualnie). Nie testować, unikać trwale.
3. **Krople**: nie są sprawcą tej reakcji (obrzęk oka nieleczonego, stopy, 15 min po dawce doustnej, 3–4 dni bezobjawowego stosowania). Nie odstawiać bez okulisty.
4. **Etykieta** (brzmienie uzgodnione): „Podejrzenie natychmiastowej nadwrażliwości (31.10.2026) na CEFUROKSYM — nie podawać żadną drogą, także dokomorowo przy zabiegu oka; unikać cefalosporyn o podobnym łańcuchu R1: ceftriakson, cefotaksym, cefepim — oraz na ERDOSTEINĘ. Do weryfikacji alergologicznej. NIE jest to alergia na wszystkie beta-laktamy; penicyliny i cefazolina do oceny alergologa.”
5. **Pilność 2** — weto utrzymane (§3).
6. Pytania/badania rozstrzygające (kolejność wg wartości informacyjnej i kosztu): karta zabiegu okulistycznego (cefuroksym dokomorowo? drugie oko planowane?); liczba i tolerancja dawek cefuroksymu z dni 1–2 oraz czy erdosteina była pierwszą dawką; morfologia zmian (zdjęcia); objawy oddechowo-krążeniowe w czasie reakcji; wywiad zawodowy (jakie cefalosporyny przygotowuje, objawy w pracy); testy skórne z cefuroksymem u alergologa (EAACI, PMID 31749148), przy ujemnych — prowokacja (PMID 38155501).

Dalej: `05-projekt.md` → rezydenci → sprawdzający → `09-FINAL.md`, `RAPORT-ETIOLOGIA.md`.
