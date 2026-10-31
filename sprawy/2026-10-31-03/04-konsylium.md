# 04 — Konsylium (protokół ordynatora) — sprawa 2026-10-31-03

## Uwagi do agregatu
1. Surowy `_agregat.json` rozbija tę samą pokrzywkę poinfekcyjną na 4 nazwy. Przeliczyłem na kopii roboczej z dopisanymi synonimami (`_agregat-synonimy.json`), bez zmiany `config/` (zmienia tylko Michał). Do dyskusji używam wersji z synonimami.
2. Flaga `NISKA_ZGODA` (zgoda 0,38) jest artefaktem miary entropii przy długim ogonie małych pozycji: wszystkich 5 lekarzy z wagą w torze rozpoznania stawia na 1. miejscu cefuroksym (p 0,45–0,50), wszystkich 6 daje pilność 2. Dodatkowej rundy pisemnej nie zwoływałem (tryb opinii w tle); rozbieżności opisane niżej. Odstępstwo zgłoszone sprawdzającemu procesu.

## Ranking (agregat z synonimami)
| rozpoznanie | p | wymienili |
|---|---|---|
| objawy polekowe — cefuroksym (natychmiastowa nadwrażliwość) | 0,64 | 5/5 |
| ostra pokrzywka z obrzękiem naczynioruchowym w przebiegu zakażenia wirusowego | 0,15 | 4/5 |
| objawy polekowe — erdosteina | 0,08 | 5/5 |
| objawy polekowe — bromfenak (NLPZ jako kofaktor) | 0,04 | 3/5 |
| objawy polekowe — lewofloksacyna z deksametazonem (krople) | 0,03 | 3/5 |
Poza agregatem (pojedyncze głosy): rumień wielopostaciowy (hipotezujący, najgorszy scenariusz, ≤0,06), adenowirusowe zapalenie spojówek i gardła (najgorszy scenariusz 0,10), osutka wirusowa (bayes 0,05).

Pilność: 2 (dziś), mediana ważona 2,0; weto najgorszego scenariusza = 2 (zgodne). Nikt nie dał 1, bo reakcja minęła kilka godzin temu i opis dotyczy skóry i tkanki podskórnej.

## Zgodność
- Obrzęk powieki oka NIELECZONEGO + zmiany dłoniowo-podeszwowe 15 min po dawce = wzorzec układowy, nie miejscowy; to przemawia przeciw kroplom jako przyczynie (wszyscy).
- Wcześniejsza tolerancja cefuroksymu i erdosteiny nie wyklucza uczulenia (poprzednie kursy mogły uczulić); zakażenie wirusowe obniża próg reakcji (kofaktor).
- Żadnej czerwonej flagi nie wykluczono — objawy układowe i parametry życiowe NIEZNANE.
- Bisoprolol: nie przeciwwskazuje adrenaliny; może osłabiać jej działanie; glukagon przy oporności; dawka 1,25 mg kardioselektywnego leku — efekt prawdopodobnie mały; nie odstawiać nagle.
- Budezonid rozcieńczany wodą do wstrzykiwań: błąd — roztwór hipotoniczny może prowokować skurcz oskrzeli; rozcieńczać 0,9% NaCl (bayes, farmakolog, najgorszy, gospodarz).
- Azytromycyna: obraz wirusowy → odstawić przy braku przesłanek bakteryjnych; jeśli zostaje, EKG z QTc (wszyscy).

## Rozbieżności i rozstrzygnięcia ordynatora
- Adenowirus (najgorszy scenariusz): sekwencja „jedno oko → gardło → drugie oko” pasuje do gorączki gardłowo-spojówkowej. Nie tłumaczy jednak zmian dłoniowo-podeszwowych 15 min po leku. Zostaje jako NIEZNANE do weryfikacji (zaczerwienienie spojówki, wydzielina) — ważne dla zakaźności w szpitalu.
- Rumień wielopostaciowy: latencja 15 min przemawia przeciw; rozstrzyga utrzymywanie się zmian tarczowatych >24 h.
- EKG: pragmatyk i najgorszy chcą EKG dziś zawsze; gospodarz i farmakolog — tylko gdy azytromycyna zostaje. Przyjmuję: EKG przy dzisiejszej wizycie, bo pacjentka ma zaburzenia rytmu i już przyjmuje azytromycynę.
- Glikokortykosteroid doustny: tylko farmakolog (opcjonalnie). Nie wpisuję do rekomendacji głównej; opcja przy rozległym obrzęku.
- Zakaźność dla pacjentów szpitala (najgorszy scenariusz): przyjmuję do planu.
