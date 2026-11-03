# 04 — Protokół konsylium (sprawa 2026-10-31-02)

## Uwagi procesowe ordynatora
1. Hipoteza ordynatora była tym razem w osobnym pliku `_hipoteza-ordynatora.md` (czytał ją tylko zastępca niepewności). Ślepa tura bez przecieku.
2. Agregat surowy znów rozbił to samo rozpoznanie na kilka nazw („tabletka widmo”, „pozostałość tabletki…”, „objawy polekowe — metformina”). Przeliczone na kopii z dopisanymi synonimami: `_agregat-synonimy.json` (zgoda 0,63, bez flagi NISKA_ZGODA → 1 runda). `config/` bez zmian.
3. Sprawa ma **dwa odrębne problemy** (obiekt w stolcu, barwa moczu). Agregacja log-odds traktuje rozpoznania jako wzajemnie wykluczające się, więc p „zagęszczenia moczu” jest zaniżone. Czytamy je osobno.
4. **Korekta faktu:** Co-Prestarium 10/10 to peryndopryl + amlodypina, **nie** indapamid (najgorszy scenariusz i zastępca bezpieczeństwa wpisali indapamid). Ezehron Duo 20/10 to rosuwastatyna + ezetymib. [wiedza modelu, do potwierdzenia w ChPL]

## Ranking (agregat z synonimami)
| Rozpoznanie | p | wymienili |
|---|---|---|
| pozostałość tabletki metforminy XR („ghost tablet”) | 0,82 | bayes, hipotezujący, najgorszy scenariusz, POZ (+ farmakolog 0,75) |
| zagęszczenie moczu (mała podaż płynów) | 0,08 (osobny problem) | bayes, hipotezujący, najgorszy scenariusz, POZ |
| niestrawione resztki pokarmowe | 0,05 | bayes, hipotezujący, najgorszy scenariusz |
| kamica żółciowa | 0,01 | hipotezujący, najgorszy scenariusz, POZ |
| robaczyca jelitowa | 0,01 | bayes, najgorszy scenariusz |

Pilność: wszyscy 4 (planowo). Najgorszy scenariusz bez weta podwyższającego.

## Otwarte red flags (skrót)
Daty badań nieznane (jeśli sprzed ciemnego moczu — wykluczenia cholestazy, miopatii statynowej, uszkodzenia nerek nieaktualne); obiekt nieobejrzany (pasożyt / złóg nie wykluczone); alkohol, zioła, suplementy nieznane; **antykoncepcja nieznana u 40-latki na rosuwastatynie i peryndoprylu (leki przeciwwskazane w ciąży)**; mała podaż płynów przy ACE-I i metforminie (ryzyko ostrego uszkodzenia nerek przy odwodnieniu); RR i twardówki nieudokumentowane.

## Runda 1

### hipotezujacy

**Co mnie przekonuje:** zgodność czasowa kulki z przyjęciem Siofor XR, jedna kulka na epizod i prawidłowe wyniki laboratoryjne. Korekta, że Co-Prestarium to peryndopryl z amlodypiną, a nie indapamid, nie zmienia obrazu. Rozdzielenie dwóch problemów jest słuszne.

**Co by zmieniło moje zdanie:** kulka niepodobna do tabletki (twarda, warstwowa, segmentowana albo ruchoma). Zmieniłaby je też ciemny mocz z bilirubiną, krwią lub wysokim CK (kinazą kreatynową) w badaniu sprzed świeżego epizodu. Zmieniłaby je również data badań sprzed objawów.

**Decyzja:** top-2 p zostaje (tabletka 0,6, zagęszczenie moczu 0,2). Pilność zostaje 4 (planowo), pewność średnia.

**Niezbędny element planu:** przy następnym epizodzie zachować kulkę i oznaczyć datę badań laboratoryjnych. Jeśli są sprzed ciemnego moczu, powtórzyć je tego dnia.

### bayes
**Co mnie przekonuje:** zbieżność 4 lekarzy na ghost tablet (agregat 0,82). Moje 0,70 było ostrożniejsze, bo obiekt jest nieobejrzany. Pretest u osoby na metforminie XR plus jedna kulka na dobę to silne LR. Ciemny mocz traktuję osobno, jako zagęszczenie (około 0,10–0,15).

**Co by zmieniło moje zdanie:** obiekt ruchomy, segmentowany lub twardy i krystaliczny. Zmieniłoby je też to, że badania są sprzed ciemnego moczu, albo dodatnia bilirubinuria, krew w moczu, wzrost CK lub ALT.

**Zmiany:** top-2 bez zmian (tabletka 0,70, resztki pokarmowe 0,12). Pilność pozostaje 4.

**Niezbędny element planu:** ustalić daty badań laboratoryjnych. Jeśli są sprzed objawów, powtórzyć w dniu ciemnego moczu: badanie ogólne moczu z ciężarem właściwym, bilirubinę, ALT, CK i kreatyninę. Do tego oględziny kulki i porównanie z tabletką.

### poz-pragmatyk

**Przekonuje mnie:** zgodność 4 lekarzy co do tabletki widmo (Siofor XR) oraz korekta faktu, że Co-Prestarium to peryndopryl i amlodypina, nie indapamid. **Zmieniłoby zdanie:** kulka twarda, krystaliczna, ruchoma lub segmentowana, albo niezwiązana z porą przyjęcia leku. To samo dla ciemnego moczu z bilirubiną lub krwią w moczu, albo ze wzrostem ALT lub CK w świeżym badaniu.

**Top-2 p:** zostawiam p ≈ 0,6 dla tabletki widmo i p ≈ 0,15 dla zagęszczenia moczu, bo agregat 0,82 / 0,08 jest rozsądny. Pilność bez zmian: 4.

**Niezbędny element planu:** ustalić daty wyników. Jeśli są sprzed ciemnego moczu, w jednej wizycie zlecić z koszyka POZ badanie ogólne moczu, ALT, bilirubinę, kreatyninę z eGFR i CK. Dodatkowo kulka do obejrzenia (zdjęcie lub próbka z opakowaniem Siofor XR), kontrola za 1–2 tygodnie. Dopytać o antykoncepcję: peryndopryl i rosuwastatyna są przeciwwskazane w ciąży.

### najgorszy-scenariusz

**Co mnie przekonuje:** wszyscy 6 lekarzy zgadza się co do tabletki widmo (p ok. 0,6–0,8) i pilności 4. Zgodny jest też czas, bo w stolcu jest jedna kulka na epizod, a zmiana leku na Siofor XR była kilka miesięcy temu. Zbieżne jest także to, że relacja nie podaje bilirubinurii, krwiomoczu, bólów mięśni ani żółtaczki. Poprawka ordynatora: Co-Prestarium to peryndopryl z amlodypiną, nie indapamid. Tym samym moja flaga "indapamid" odpada, ale ACE-I (inhibitor konwertazy angiotensyny) z metforminą przy małej podaży płynów zostaje.

**Co by zmieniło moje zdanie:** daty badań sprzed ciemnego moczu (pilność 2), obiekt ruchomy lub członowany, żółtaczka, ból mięśni lub brzucha.

**Top-2 p i pilność:** bez zmian (tabletka 0,6, resztki pokarmowe 0,15). Weta nie używam, pilność pozostaje 4.

**Element planu:** ustalić daty badań, a gdy są starsze niż objaw, zlecić badanie ogólne moczu z ciężarem właściwym, ALT, bilirubinę, CK i kreatyninę z eGFR. Przy tym zapytać o antykoncepcję.

### farmakolog

**Co mnie przekonuje:** Zgodność 4 lekarzy co do tabletki widmo (p 0,82). Czasowa korelacja z Siofor XR, jedna kulka na dobę i brak objawów brzusznych przemawiają za tym samym. Korekta składu leków (peryndopryl i amlodypina, bez indapamidu) zmienia też moją ocenę ryzyka nerkowego. Nadal oznacza je jednak jako [wiedza modelu, niezweryfikowane].

**Co by zmieniło moje zdanie:** Kulka miękka, ruchoma albo segmentowana, lub występująca w dni bez metforminy. Ciemny mocz z bilirubinurią, krwią lub podwyższonym CK.

**Top-2 i pilność:** Nie zmieniam. Tabletka widmo to 0,75–0,82, a zagęszczenie moczu to osobny problem. Pilność pozostaje 4.

**Niezbędny element planu:** Ustalić daty badań i eGFR oraz antykoncepcję. Rosuwastatyna i peryndopryl są przeciwwskazane w ciąży, a przy małej podaży płynów trzeba pouczyć o wstrzymaniu metforminy w odwodnieniu.

### gospodarz-kosztow

**Co mnie przekonuje:** Zgodność 4 lekarzy co do tabletki widmo (0,82) i pilności 4. Dwa osobne problemy (kulka i barwa moczu) czytane osobno to dobra korekta.

**Co by zmieniło moje zdanie:** Oględziny kulki, które nie potwierdzają tabletki, uruchamiają badanie kału na pasożyty. Pojawienie się bólu brzucha, żółtaczki albo bólów mięśni z ciemnym moczem uruchamia CK, próby wątrobowe i kreatyninę.

**Zmiana top-2 p i pilności:** Nie. Mam p=0 w rozpoznaniu, a pilność zostaje na 4. Czekanie na oględziny jest bezpieczne.

**Niezbędny element planu:** Pierwsze krok to bezkosztowe oględziny kulki, czyli pacjentka przynosi ją albo robi zdjęcie i porównuje z tabletką Siofor XR. Jednocześnie trzeba ustalić daty badań laboratoryjnych i antykoncepcję, bo mają wpływ na decyzję. Bez tych danych badania sprzed ciemnego moczu nie wykluczają cholestazy ani miopatii.

## Zamknięcie ordynatora
- Stanowiska bez zmian: pozostałość tabletki metforminy XR (agregat 0,82); ciemny mocz — osobny problem, najpewniej zagęszczenie. Pilność 4 jednogłośnie, weto niewykorzystane.
- Flaga „indapamid” odpada (korekta składu Co-Prestarium); zostaje ACE-I + metformina przy małej podaży płynów.
- Uzgodnione elementy planu: daty badań (jeśli sprzed ciemnego moczu → powtórzyć pakiet), oględziny/zdjęcie kulki z porównaniem do tabletki, antykoncepcja (rosuwastatyna i peryndopryl przeciwwskazane w ciąży), pouczenie o nawodnieniu i wstrzymaniu metforminy w odwodnieniu.
