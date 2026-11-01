# Protokół konsylium — TEST-2026-11-01-09

Kobieta 46 lat, codzienny ból głowy od 6 miesięcy, leki przeciwbólowe >20 dni/mies. (ketoprofen, paracetamol, preparaty złożone z kofeiną), objawy wzrokowe przed bólem, złożona antykoncepcja (etynyloestradiol + drospirenon).
Pytanie lekarza: czy skierować na MRI głowy, co na te bóle.

Runda dyskusji pominięta (`_runda-pominieta.md`): wszystkie 6 ról dało to samo rozpoznanie nr 1 i tę samą pilność (3). Flaga `NISKA_ZGODA` w `_agregat.json` (zgoda 0,006) jest artefaktem: ten sam byt opisano pięcioma nazwami. Połączyłem synonimy ręcznie poniżej; wartości p z agregatu nie są wiążące, ranking kolejności jest.

## 1. Połączony ranking (synonimy scalone)

| # | Rozpoznanie (nazwa scalona) | Role, które wymieniły (nazwy u nich) | p u ról z wagą w torze rozpoznanie |
|---|---|---|---|
| 1 | **Ból głowy z nadużywania leków przeciwbólowych (ketoprofen, paracetamol, preparaty złożone z kofeiną) na podłożu pierwotnego bólu głowy** | bayes („…na podłożu pierwotnego bólu głowy"), hipotezujący („…na podłożu migreny z aurą"), najgorszy scenariusz („…na podłożu przewlekłego pierwotnego bólu głowy"), POZ-pragmatyk („polekowy ból głowy…"), farmakolog („objawy polekowe — ból głowy z nadużywania…"), gospodarz kosztów (nr 1, bez p — poza torem) | 0,60 / 0,60 / 0,62 / 0,60 (farmakolog 0,75, waga 0) → **ok. 0,6, jednomyślnie nr 1** |
| 2 | **Migrena z aurą wzrokową jako ból podstawowy** (u części ról osobny wiersz, u hipotezującego i gospodarza wpisana do wiersza 1) | bayes („przewlekła migrena z aurą"), najgorszy scenariusz („migrena z aurą wzrokową, współistniejąca"), POZ-pragmatyk („przewlekła migrena z aurą"), farmakolog (jako „nasilenie migreny przez etynyloestradiol", 0,05) | 0,15 / 0,15 / 0,15 |
| 3 | **Przewlekły ból głowy typu napięciowego** (jako ból podstawowy, fenotyp bólu pasuje lepiej niż do migreny) | bayes, hipotezujący, POZ-pragmatyk, gospodarz kosztów („…z nadużywaniem leków") | 0,10 / 0,12 / 0,10 |
| 4 | **Ból głowy związany ze snem / obturacyjny bezdech senny** | bayes, hipotezujący, najgorszy scenariusz, POZ-pragmatyk, gospodarz kosztów | 0,05 / 0,08 / 0,06 / 0,05 |
| 5 | **Wtórny ból głowy wewnątrzczaszkowy** (guz, idiopatyczne nadciśnienie śródczaszkowe, zakrzepica zatok żylnych) | bayes („zmiana strukturalna, w tym guz"), hipotezujący, najgorszy scenariusz (guz/IIH 0,03 + zakrzepica 0,01), POZ-pragmatyk, gospodarz kosztów | 0,02 / 0,04 / 0,04 / 0,03 → **ok. 0,03** |
| 6 | Ból polekowy z odstawienia kofeiny / nasilany estrogenem | farmakolog (0,10 + 0,05), hipotezujący (0,06) | mechanizm składowy wiersza 1, nie osobne rozpoznanie |

Wniosek: wiersze 2 i 3 nie konkurują z wierszem 1, tylko opisują ból podstawowy pod nadużyciem. Rozpoznanie robocze konsylium: **ból głowy z nadużywania leków na podłożu pierwotnego bólu głowy (migrena z aurą lub ból napięciowy — do rozstrzygnięcia po odstawieniu)**. Guz, którego boi się pacjentka: ok. 3%, dolne ograniczenie zależy od badania neurologicznego, którego nie ma.

## 2. Sprzeczności między rolami

1. **MRI „planowo" vs „nie zlecać".** Najgorszy scenariusz: MRI nie jako pierwszy krok, ale „uzasadniony planowo" przy zmianie wzorca po 40. rż. z aurą. Bayes, POZ-pragmatyk, gospodarz kosztów, hipotezujący: przy prawidłowym badaniu neurologicznym i typowej aurze bez MRI (AHS 2019, PMID 31891197, stopień A), MRI dopiero gdy brak poprawy po 2–3 mies. odstawienia lub aura nietypowa. **Rozstrzygam na rzecz większości**, bo (a) wynik MRI przy prawidłowym badaniu nie zmienia leczenia (i tak odstawiamy leki i estrogen), (b) znaleziska przypadkowe 1,4% z kaskadą (PMID 30467245), (c) MRI nie zmniejsza lęku po roku (RCT Howard, cyt. w PMID 23074404). Warunek najgorszego scenariusza wchodzi do PLANU B jako próg czasowy (8–12 tygodni).
2. **Iloraz wiarygodności aury dla zmiany wewnątrzczaszkowej:** bayes 3,2 (Detsky, JAMA 2006, PMID 16968852), najgorszy scenariusz 12,9 (ten sam przegląd cytowany w PMID 23074404). Streszczenie Ontario HTA podaje 12,9 (LR− 0,52). Rozbieżność źródeł; nawet przy 12,9 i pretest 0,9% po uwzględnieniu braku wymiotów (LR− 0,47) i braku nasilenia przy Valsalvie (LR− 0,70) p po teście pozostaje w okolicy 3–4%, a prawidłowe badanie neurologiczne (LR− 0,72) obniża je dalej. Nie zmienia decyzji; w 05 nie podaję tej liczby.
3. **Kolejność: badanie najpierw czy leczenie od razu.** Farmakolog: wszystko na tej samej wizycie. Pozostali: najpierw badanie neurologiczne i dno oka, leczenie przy wyniku prawidłowym. Nie jest to sprzeczność — na jednej wizycie POZ da się zrobić jedno i drugie; w 05 łączę: badanie → jeśli prawidłowe → start leczenia tego samego dnia.
4. **Profilaktyka:** zgodnie amitryptylina pierwsza (fenotyp napięciowy + migrena + zły sen), topiramat jako plan B (farmakolog) — bez sporu.

## 3. Otwarte red flags i jak je rozstrzygam

| Red flag (źródło) | Status | Rozstrzygnięcie |
|---|---|---|
| Badanie neurologiczne i dno oka NIEZNANE (wszystkie role) | **OTWARTA** | Jedyne, co realnie wyklucza proces wewnątrzczaszkowy. Wykonać na tej wizycie (oftalmoskop lub pilna konsultacja okulistyczna w ciągu tygodnia). Nieprawidłowe → pilność 2, pilny neurolog + obrazowanie. |
| Charakter aury NIEZNANY: nowa po 40. rż.? >60 min? jednostronne czuciowe/ruchowe? bez bólu? (wszystkie role) | **OTWARTA** | Doprecyzować wywiadem na wizycie. Aura przedłużona (>1 h, PMID 30171359) lub z objawami ruchowymi/mowy → wskazanie do obrazowania (PMID 31891197, stopień C), aura >60 min lub jednostronne objawy ruchowe trwające → SOR. |
| Aura + złożona antykoncepcja estrogenowa → ryzyko udaru niedokrwiennego (wszystkie role; PMID 36126006, 32056462, 41630559) | **OTWARTA, działanie bez czekania** | Odstawić etynyloestradiol niezależnie od wyniku badania; zamiana na metodę bez estrogenu (desogestrel 75 µg lub wkładka z lewonorgestrelem, PMID 42029625, 31094588). Dane przeciwne z 2025 (PMID 41406065, kohorta 18–45 lat) nie obejmują wieku 46 lat i nie uchylają zalecenia CDC. |
| Zmiana wzorca bólu po 40. rż. (SNNOOP10, PMID 30587518) | względna | Rozstrzyga badanie przedmiotowe (pkt 1), nie obrazowanie; wraca jako wskazanie do MRI, jeśli ból nie ustąpi po odstawieniu (PMID 31891197). |
| Codzienny ketoprofen 6 mies. + drospirenon: przewód pokarmowy, nerki, potas (najgorszy scenariusz, farmakolog) | OTWARTA, niska | Morfologia, kreatynina/eGFR, potas z koszyka POZ; ketoprofen odstawiany i tak. |
| Bezdech senny (zły sen, ból poranny) | OTWARTA, niska | 3 pytania na wizycie (chrapanie, obserwowane bezdechy, senność dzienna) + masa ciała; poligrafia tylko przy dodatnich. |
| Tlenek węgla (najgorszy scenariusz) | OTWARTA, bardzo niska | Jedno pytanie: piecyk gazowy/junkers, bóle u domowników. Bezkosztowe. |
| Nastrój NIEZNANY przed amitryptyliną (farmakolog) | OTWARTA, niska | PHQ-2 na wizycie; przy myślach samobójczych małe opakowania lub inna profilaktyka. |

**Weto najgorszego scenariusza:** jego pilność = 3, równa medianie; deklaruje obniżenie do 4 przy prawidłowym badaniu neurologicznym, typowej aurze i zamienionej antykoncepcji, podniesienie do 2 przy objawie ogniskowym, tarczy zastoinowej lub aurze >1 h. Przyjmuję w całości: **pilność 3 (w tym tygodniu)**, bo najważniejszy krok (badanie przedmiotowe) nie jest wykonany i nie da się go zastąpić ankietą. Red flag wewnątrzczaszkowa nie jest wykluczona w tym protokole — zostaje do wykluczenia badaniem; dlatego pilność nie spada do 4.

## 4. Źródła (poziom): `zrodla/` — brak polskich wytycznych dla bólu głowy i antykoncepcji (role sprawdziły MANIFEST); PubMed — PMID jak wyżej, potwierdzone w streszczeniach przez role i ordynatora (PMID 34554691, 40011869, 31891197, 32453406, 36126006, 23074404, 34966007, 38410849, 36153693, 30171359 sprawdzone 2026-11-01). Kryteria ICHD-3: leki złożone ≥10 dni/mies. >3 mies. potwierdzone (PMID 34966007), proste >15 dni/mies. (PMID 38410849).
