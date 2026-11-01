# 04 — Protokół konsylium (ordynator), sprawa TEST-2026-11-01-12

Pytanie lekarza prowadzącego: wypalenie/depresja czy coś somatycznego? Jakie badania?

## 1. Ranking po połączeniu synonimów

`_agregat.json` rozbił to samo rozpoznanie na różne nazwy („Chłoniak nieziarniczy" vs „Chłoniak nieziarniczy (w tym z komórek T…)"; „Gruźlica płuc z gruźliczym zapaleniem węzłów" vs „Gruźlica węzłów chłonnych lub płuc" vs „Gruźlica (płucna z zajęciem węzłów)"; „Klasyczny chłoniak Hodgkina" vs „Chłoniak Hodgkina (klasyczny)"). Po scaleniu (ta sama metoda: ważona pula logitów w torze `rozpoznanie`, wagi z `wagi_uzyte`, softmax) ranking jest:

| # | Rozpoznanie | p (scalone) | Kto wymienił |
|---|---|---|---|
| 1 | Chłoniak Hodgkina klasyczny | ≈ 0,70 | hipotezujący 0,55, najgorszy scenariusz 0,55, pragmatyk POZ 0,55, Bayes 0,50 |
| 2 | Chłoniak nieziarniczy (w tym T-komórkowy, np. angioimmunoblastyczny) | ≈ 0,11 | Bayes 0,18, hipotezujący 0,15, najgorszy 0,12, pragmatyk 0,12 |
| 3 | Rak płuca z przerzutami do węzłów nadobojczykowych | ≈ 0,08 | pragmatyk 0,13, Bayes 0,12, najgorszy 0,12, hipotezujący 0,10 |
| 4 | Gruźlica płuc / węzłów chłonnych | ≈ 0,07 | Bayes 0,10, najgorszy 0,10, pragmatyk 0,10, hipotezujący 0,08 |
| 5 | Wypalenie zawodowe / depresja | < 0,01 | wszyscy czterej: 0,01–0,02 |
| — | Objawy polekowe | ≈ 0,01 | farmakolog (brak leków i suplementów) |

Flaga `NISKA_ZGODA` z agregatu była artefaktem rozbicia nazw; po scaleniu zgoda co do rozpoznania wiodącego jest pełna (wszystkie role z wagą w torze rozpoznanie: 0,50–0,55). Gospodarz kosztów i farmakolog nie typują (waga 0 w torze), zgodnie z rolą.

Wspólne argumenty za chłoniakiem Hodgkina: węzeł szyjny/nadobojczykowy > 2 cm z objawami B (37,8 °C, poty nocne, −7 kg/3 mies.), ból węzła po alkoholu (PMID 31780609, 39734971), uogólniony świąd bez wysypki (PMID 38489975), eozynofilia 0,9 G/l (PMID 38254826, 23100947), OB 62 mm/h, limfopenia 0,8 G/l. Lokalizacja nadobojczykowa i płeć męska to niezależne predyktory złośliwości węzła (RR 3,72 i 2,72; Chau 2003, PMID 12569376).

Odpowiedź na pytanie lekarza — jednogłośna: **somatyczne, nie wypalenie**. Brak anhedonii i przygnębienia, apetyt zachowany, objawy somatyczne poprzedziły pogorszenie samopoczucia, obiektywne odchylenia (gorączka, węzeł, OB, morfologia).

## 2. Sprzeczności

1. **Pilność 2 vs 3** (jedyny spór). W ślepej turze Bayes i pragmatyk POZ dali 3 („diagnostyka onkologiczna trwa dni, nie godziny"), pozostałe role 2. Po rundzie 1 obaj zrewidowali do 2 (argument: pacjent niebadany, kaszel > 3 tyg. + węzeł nadobojczykowy = nieodrzucona masa śródpiersia i możliwa prątkująca gruźlica; „DiLO dziś" było niespójne z pilnością 3). **Stan po rundzie 1: 6/6 ról pilność 2.** Spór zamknięty.
2. **Pretest HL vs NHL w wieku 55 lat.** Bayes: NHL kilkukrotnie częstszy w tej grupie. Hipotezujący: trzy względnie swoiste cechy (ból po alkoholu, świąd, eozynofilia) przeważają iloraz szans na korzyść HL. Rozstrzygnięcie: nie zmienia postępowania — rozpoznanie w obu wypadkach daje biopsja wycięciowa węzła; różnica zostaje w rankingu, nie w planie.
3. **USG węzłów / badania laboratoryjne z POZ.** Pragmatyk: zlecić USG szyi i jamy brzusznej, LDH, próby wątrobowe, HIV/HBV/HCV. Gospodarz kosztów: USG nie może być warunkiem skierowania; TK i markery nie. Rozstrzygnięcie: badania krwi tak (nie opóźniają), USG tylko równolegle, nic nie warunkuje skierowania na biopsję.

## 3. Otwarte red flags i rozstrzygnięcie (weto najgorszego scenariusza)

Najgorszy scenariusz ma `red_flags_otwarte`, więc jego pilność (2) jest dolnym ograniczeniem wyniku.

| Red flag | Status | Jak rozstrzygam |
|---|---|---|
| Masa śródpiersia z uciskiem tchawicy / zespół żyły głównej górnej (kaszel > 3 tyg. + węzeł nadobojczykowy) | **NIE wykluczona** — brak badania fizykalnego i RTG | Nie mogę wykluczyć na podstawie ankiety; „nic z tych rzeczy" dotyczyło listy ankiety, nie badania. Ucisk dróg oddechowych może być nagły także u bezobjawowego dorosłego (PMID 21596865; zespół żyły głównej górnej PMID 40470453). **Weto utrzymane: pilność 2.** Wykluczy: badanie dziś (obrzęk twarzy/szyi, poszerzone żyły szyjne, stridor, duszność w leżeniu, SpO2) + RTG PA i boczne dziś. |
| Gruźlica prątkująca (kaszel > 3 tyg., poty, chudnięcie, palacz) | **NIE wykluczona** — brak RTG | Reguła ankiety PILNE. Wykluczy RTG; przy zmianach — plwocina na prątki ×3. Do wyniku: nie podawać fluorochinolonu. |
| Węzeł > 2 cm z objawami B (reguła ankiety PILNE) | **Potwierdzona, nie do wykluczenia** | To wskazanie do biopsji, nie flaga do zamknięcia. Jedzie na kartę DiLO. |
| Utrata 7 kg przy zachowanym apetycie | Potwierdzona | Objaw B, element powyższego. |
| Niedokrwistość Hb 12,1 / zajęcie szpiku lub wątroby | NIEZNANE | Rozmaz, LDH, ALT/AST, albumina, kreatynina, HIV/HBV/HCV z POZ; biopsja szpiku to decyzja hematologa (Lugano: nierutynowa w HL, PMID 25113753). |
| Parametry życiowe, badanie fizykalne | NIEZNANE | Dziś w gabinecie. |

Wykluczone (zgodnie): myśli samobójcze (zaprzecza), przyczyna polekowa (brak leków i suplementów), ostre objawy z listy ankiety w ostatnich dniach.

**Wynik toru pilność: 2 (dziś).** Zejście do 3 możliwe dopiero po udokumentowanym prawidłowym badaniu fizykalnym i RTG (warunek zgłoszony przez najgorszy scenariusz, hipotezującego, gospodarza kosztów i Bayesa); podniesienie do 1 przy stridorze, duszności spoczynkowej, obrzęku twarzy/szyi.

## 4. Co nie podlega dyskusji (zgoda 6/6)

- Nie kierować do psychologa / nie włączać leków przeciwdepresyjnych jako pierwszego kroku.
- Nie podawać glikokortykosteroidów (także „na świąd") ani antybiotyku empirycznego przed biopsją.
- Rozpoznanie daje biopsja wycięciowa węzła (nie cienkoigłowa: dokładność BAC w HL 82 %, PMID 39113669; wydajność wycięciowa 97 % vs gruboigłowa 79 %, PMID 32461041).
- Ścieżka: karta DiLO do hematologa/chirurga.

Runda 2 niepotrzebna (NISKA_ZGODA była artefaktem nazw; spór o pilność zamknięty w rundzie 1). Przechodzę do `05-projekt.md`.
