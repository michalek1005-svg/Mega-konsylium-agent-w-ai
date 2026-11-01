# Protokół konsylium — TEST-2026-11-01-06 (ordynator)

Pytanie lekarza: „Czy to nawrót kolki nerkowej? Co przeciwbólowo?”

## 1. Ranking po połączeniu synonimów
`_agregat.json` (zgoda 0,017, flaga NISKA_ZGODA) rozbił to samo rozpoznanie na kilka nazw. Połączone ręcznie przez ordynatora (ta sama jednostka kliniczna, różne brzmienie):

| # | Rozpoznanie (połączone) | Nazwy scalone z agregatu | Wymienili (p w ślepej turze) | p łączne z agregatu (ważone) |
|---|---|---|---|---|
| 1 | **Pęknięty / objawowy tętniak aorty brzusznej (przeciek zaotrzewnowy)** | „Pęknięty lub objawowy (przeciekający…) tętniak…” (0,093) + „Pęknięty lub objawowy tętniak…” (0,085) + „Objawowy (pękający, zaotrzewnowo ograniczony) tętniak…” (0,078) | hipotezujacy 0,50; najgorszy_scenariusz 0,35→0,45 (rewizja w rundzie 1); poz_pragmatyk 0,50; bayes 0,35; farmakolog i gospodarz_kosztow sygnalizują (waga 0 w torze) | **≈0,26** — pierwsze miejsce |
| 2 | **Kolka nerkowa, kamica moczowodowa lewa (nawrót)** | „Kolka nerkowa w przebiegu kamicy moczowodowej” (0,125) + „…lewostronnej kamicy moczowodowej (nawrót)” (0,061) | bayes 0,35; najgorszy_scenariusz 0,40→0,30; poz_pragmatyk 0,25; hipotezujacy 0,22 | **≈0,19** — drugie miejsce |
| 3 | Ostre rozwarstwienie aorty | poza top-5 agregatu | hipotezujacy 0,08; najgorszy_scenariusz 0,07; poz_pragmatyk 0,08; gospodarz (sygnał) | <0,05 |
| 4 | Krwiak zaotrzewnowy / krwawienie nasilone przez ASA + ketoprofen (czynnik nasilający, nie przyczyna) | poza top-5 | poz_pragmatyk 0,07; farmakolog 0,03 | <0,05 |
| 5 | Zawał nerki lewej | poza top-5 | najgorszy_scenariusz 0,03; poz_pragmatyk | <0,05 |
| 6 | Hipotensja polekowa (amlodypina 10 mg + drotaweryna) — składowa, nie przyczyna bólu | poza top-5 | farmakolog 0,05 | <0,05 |

Po scaleniu NISKA_ZGODA jest artefaktem nazewnictwa: wszystkie cztery role z wagą w torze rozpoznania stawiają tętniak i kolkę jako dwa pierwsze, u trzech z czterech tętniak na pierwszym miejscu, a przyczyny naczyniowe łącznie (tętniak + rozwarstwienie + zawał nerki) ≥0,45 u każdej roli. Druga runda nie jest potrzebna: rozbieżność nie zmienia pilności ani działania (wszystkie sześć ról: pilność 1, ten sam następny krok).

## 2. Sprzeczności
- **Kolejność tętniak/kolka** (bayes 0,35 = 0,35; najgorszy 0,40 kolka > 0,35 tętniak w ślepej turze, odwrócone w rundzie 1 na 0,45/0,30). Rozstrzygnięcie: nieistotne dla decyzji — oba wymagają tej samej ścieżki (112, obrazowanie aorty w szpitalu), a kolka jest u 68-latka rozpoznaniem z wykluczenia.
- **Źródło hipotensji**: farmakolog dopuszcza udział amlodypiny 10 mg + drotaweryny; bayes, hipotezujacy, poz_pragmatyk — presynkopa + wskaźnik wstrząsowy ≈1,0 bardziej pasuje do utraty objętości. Rozstrzygnięcie: nawet jeśli leki tłumaczą część spadku RR, nie tłumaczą bólu stałego, rozrywającego ani tachykardii 108/min; składowa polekowa nie obniża pilności.
- **USG w gabinecie**: najgorszy_scenariusz początkowo dopuszczał, w rundzie 1 wycofał (USG opóźniało skierowanie do chirurgii naczyniowej z 0,75 do 2,5 h, PMID 9654880). Gospodarz, poz_pragmatyk, bayes: żadnego badania w POZ opóźniającego transport. Rozstrzygnięcie: zgodne — bez USG/moczu/planowych badań z POZ.
- **Analgezja**: wszystkie role zgodne — nic „mocniejszego” doustnie do domu; opioid dożylny miareczkowany w ZRM/SOR; bez kolejnego ketoprofenu i drotaweryny (ASA + NLPZ w nieznanej dawce, hipoperfuzja).

## 3. Otwarte red flags i weto najgorszego scenariusza
Otwarte (po deduplikacji):
1. Ból stały, rozrywający u mężczyzny 68 lat, palacza, z nadciśnieniem, nigdy bez USG aorty → pęknięty tętniak / rozwarstwienie niewykluczone (reguła ankiety [NATYCHMIAST 112] spełniona).
2. Presynkopa + RR skurczowe 104 mmHg u leczonego nadciśnieniowca + tętno 108/min (wskaźnik wstrząsowy ≈1,0) → wyrównany wstrząs krwotoczny możliwy.
3. ASA 75 mg + ketoprofen w nieznanej dawce → krwawienie, maskowanie, ostre uszkodzenie nerek.
4. Badanie przedmiotowe i powtórne parametry — NIEZNANE.

Wykluczone jawnie: gorączka/dreszcze (pacjent zaprzecza; zakażona zablokowana nerka mniej prawdopodobna, ale ketoprofen może maskować), utrata przytomności (presynkopa, nie omdlenie), wymioty.

**Weto pilności (najgorszy_scenariusz: pilność 1, utrzymane w rundzie 1) — PRZYJĘTE.** Żadna z flag 1–4 nie może być wykluczona danymi dostępnymi w POZ/teleporadzie: czułość tętniącego guza 47%, hipotensji 31%, omdlenia 28% — brak klasycznych objawów nie wyklucza pęknięcia (PMID 35220634); 30% pęknięć początkowo błędnie rozpoznanych, najczęściej jako kolka nerkowa (PMID 1619721); w POZ trafne rozpoznanie 38%, kolka 24% pomyłek (PMID 9654880). Wykluczenie wymaga obrazowania aorty w szpitalu (POCUS czułość 97,8%, swoistość 97,0% dla tętniaka; angio-TK czułość 91,4% dla pęknięcia, PMID 35220634). Pilność końcowa: **1**.

## 4. Odpowiedź na pytanie lekarza (konsensus 6/6)
Nie traktować jako nawrotu kolki do czasu obrazowego wykluczenia tętniaka; nie wystawiać leku przeciwbólowego z POZ — analgezja dożylna miareczkowana w ZRM/SOR po wezwaniu 112.

Źródła PMID potwierdzone przez ordynatora w PubMed (streszczenia): 1619721, 9654880, 35220634, 38040202, 29174580, 31356266. `zrodla/`: brak polskiej wytycznej dla tej prezentacji (MANIFEST — tylko przykłady).
