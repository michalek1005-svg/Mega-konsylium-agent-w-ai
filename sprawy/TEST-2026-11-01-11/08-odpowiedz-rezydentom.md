# 08 — Odpowiedź ordynatora rezydentom i Sprawdzającemu faktów

Sprawa TEST-2026-11-01-11 · 2026-11-01

## Rezydent 1 (persona: psychiatra konsultujący)

**R1.1 Czego brakuje: kto wypełnia ankietę; alkohol w ostatnich 3 dniach; leki nasenne/uspokajające/opioidy (także bez recepty); przyjęcie większej dawki leków (przypadkowo lub celowo); leczenie psychiatryczne.**
PRZYJMUJĘ — u chorej „trudnej do dobudzenia” nie ustalono, kto odpowiada, ani nie zapytano o alkohol i leki sedatywne, a to zmienia sposób czytania całej ankiety i to, co ZRM/SOR powinny sprawdzić od razu. Kategoria: brak_danych · hasło: wywiad-toksykologiczny-i-informator. **Zmienia decyzję: NIE** (pilność 1 i transport na SOR pozostają; pytania dopisane do CZEGO NIE WIEMY i do informacji dla ZRM).

**R1.2 Hipoteza niewypowiedziana: zaburzenie świadomości z innej przyczyny niż kwasica ketonowa — kwasica mleczanowa po metforminie przy AKI, nasilona alkoholem lub lekiem sedatywnym, włącznie z nieprzypadkowym przedawkowaniem (także metforminy).**
PRZYJMUJĘ CZĘŚCIOWO — kwasica mleczanowa po metforminie była w rankingu na miejscu 2 i w planie B, więc nie była „niewypowiedziana”; nowy element to intoksykacja/przedawkowanie (alkohol, sedatywa, metformina) jako współprzyczyna senności i kwasicy, który dopisuję do CZEGO NIE WIEMY i do informacji dla SOR (etanol, przesiew toksykologiczny, pytanie o intencje). Kategoria: hipoteza · hasło: intoksykacja-przedawkowanie. **Zmienia decyzję: NIE** (każda z tych przyczyn wymaga tego samego kroku: 112 i SOR teraz).

**R1.3 Podejrzane założenie: wywiad to pozycje ankiety, mógł być sugerujący; zespół wybrał mechanizm z listy leków i założył, że senna chora rzetelnie opisuje swój stan; nikt nie ocenił orientacji, splątania, alkoholu, intencji.**
ODRZUCAM w części dotyczącej decyzji — rekomendacja nie opiera się na wiarygodności opisu, lecz na zbiorze objawów, z których każdy z osobna (senność, oddech Kussmaula, ciśnienie 98/tętno 112, nietolerancja płynów) sam wymusza ten sam krok; projekt już zaznacza, że badania fizykalnego i stanu świadomości nie oceniono. PRZYJMUJĘ w części metodycznej — ankieta nie ma pytania o informatora ani o alkohol/sedatywa; to luka ankiety, nie tej sprawy. Kategoria: zalozenie · hasło: wiarygodnosc-ankiety-u-chorego-z-zaburzeniami-swiadomosci. **Zmienia decyzję: NIE.**

## Sprawdzający faktów (07-sprawdzenie.json, kartka ŻÓŁTA)

**BEZ_ZRODLA 1: „wstrzymanie flozyny do ≥24–48 h normalnego jedzenia i picia”.**
PRZYJMUJĘ — liczba bez źródła; w FINAL zastąpiona formułą jakościową (do powrotu normalnej podaży doustnej, decyzja w wypisie). Zmienia decyzję: NIE.

**BEZ_ZRODLA 2: brak polskich wytycznych PTD / ChPL w `zrodla/`.**
PRZYJMUJĘ — FINAL deklaruje, że poziom 1 milczy; zapis o odstawieniu flozyny/metforminy w ostrej chorobie oznaczam jako [wiedza modelu, niezweryfikowane]. Sprawa systemowa: dodać PTD 2026 i ChPL metforminy/empagliflozyny/dapagliflozyny do `zrodla/` (do zgłoszenia użytkownikowi; nie piszę do `pamiec/`). Zmienia decyzję: NIE.

**SPRZECZNE: brak (0).**

**Poprawki do FINAL (wszystkie PRZYJMUJĘ, żadna nie zmienia decyzji):**
1. PMID 21307381 (β-OHB >1,5 mmol/l, czułość 98,1%) — populacja z glukozą ≥250 mg/dl; w FINAL oznaczone jako „nie przenosi się wprost na euglikemiczną postać”.
2. PMID 42882058 (11/15 głodzenie) — seria przypadków przy glukozie <100 mg/dl, bardzo niska pewność; w FINAL „seria przypadków, wniosek mechanistyczny”.
3. PMID 42906932 („3 dni”) — kontekst okołooperacyjny; w FINAL jako analogia; liczba usunięta z PLANU B.
4. PMID 42696402 (MALA <10/100 000, śmiertelność 30–50%) — kontekst agonisty GLP-1; w FINAL „analogia”.
5. Próg 0,6 mmol/l — opisany jako próg przesiewowy bez walidacji prospektywnej (PMID 42906932); kryteria rozpoznania DKA z konsensusu ADA/EASD/JBDS 2024 (PMID 39052901) — wartości liczbowe konsensusu nie są w streszczeniu, więc w FINAL nie podaję ich jako liczb.
6. Wskaźnik wstrząsowy >1,0 — źródło PMID 31616192 zamiast etykiety; dopisek: populacje uraz/sepsa/OZW, nie swoiście kwasica.
7. Wstrzymanie metforminy, flozyny, ACEI/sartanu w chorobie z odwodnieniem — źródło PMID 38792982 (SADMANS) + PMID 42178010.
