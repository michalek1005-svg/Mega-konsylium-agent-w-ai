# 04 — Protokół konsylium (sprawa 2026-10-31-01)

## Uwagi procesowe ordynatora
1. **Ślepota tury naruszona technicznie.** Wszyscy lekarze wczytali `01-wywiad.md` w całości, więc widzieli sekcję „Hipoteza robocza ordynatora” (kolka, pilność 3). Pięciu z sześciu sami to zgłosiło. Wszyscy dali pilność 2, czyli odmiennie od hipotezy, więc wpływ zakotwiczenia uznaję za mały. Opinie przyjęte do agregacji. Wniosek dla aplikacji: hipoteza ordynatora powinna leżeć w osobnym pliku, niewidocznym dla lekarzy.
2. **Agregat surowy (`_agregat.json`) zaniża zgodę.** `config/synonimy.yaml` dopasowuje tylko dokładne nazwy; ta sama „kolka żółciowa” trafiła do rankingu trzy razy pod różnymi nazwami. Przeliczyłem na kopii roboczej z dopisanymi synonimami (`_agregat-synonimy.json`), bez zmiany `config/` (zmienia tylko użytkownik). Do dyskusji używam wersji z synonimami.

## Ranking (agregat z synonimami)
| Rozpoznanie | p | wymienili |
|---|---|---|
| kolka żółciowa (objawowa kamica pęcherzyka) | 0,58 | bayes, hipotezujący, najgorszy scenariusz, POZ |
| ostre zapalenie pęcherzyka żółciowego | 0,24 | j.w. |
| kamica przewodowa / żółciowe ostre zapalenie trzustki | 0,05 | j.w. |
| choroba wrzodowa / dyspepsja (w tym po NLPZ) | 0,04 | bayes, hipotezujący, POZ |
| ostry zespół wieńcowy z bólem w nadbrzuszu | 0,02 | hipotezujący, najgorszy scenariusz, POZ |

Zgoda 0,37 → **NISKA_ZGODA** (2 rundy). Pilność: ważona mediana **2**, wszyscy lekarze dali 2. Weto najgorszego scenariusza: pilność 2.

## Sprzeczności
- Główna oś: kolka (bez zapalenia) vs wczesne ostre zapalenie pęcherzyka. Różnica decyduje o tym, czy pacjentka idzie dziś do chirurga, czy na planową cholecystektomię.
- Kolejność badań: EKG od razu (pamięć zespołu, najgorszy scenariusz, gospodarz kosztów) vs EKG razem z laboratorium.
- Lipaza vs amylaza (POZ dopuszcza amylazę, gospodarz kosztów — tylko lipaza).

## Otwarte red flags (skrót)
OZW (brak EKG); ostre zapalenie pęcherzyka (brak CRP, morfologii, USG; ibuprofen mógł maskować gorączkę); kamica przewodowa / OZT (brak bilirubiny, prób wątrobowych, lipazy); nowotwór dróg żółciowych/trzustki (nawracające dolegliwości od roku, do USG); status menopauzalny / ciąża; eGFR nieznane (bezpieczeństwo NLPZ).

## Runda 1

### hipotezujacy

**Co mnie przekonuje:** Zbieżność wszystkich sześciu opinii, czyli pilność 2 i ta sama oś (kolka kontra ostre zapalenie pęcherzyka). Argument najgorszego scenariusza, że ibuprofen maskuje gorączkę, a Murphy jest dodatni i objawy trwają 3 dni. Agregat przesuwa ostre zapalenie w górę względem mojego p (0,24 wobec 0,25, bez istotnej różnicy). Zgadzam się, że EKG trzeba wykonać od razu.

**Co by zmieniło zdanie:** Podwyższone CRP albo leukocytoza, pogrubiała ściana pęcherzyka w USG, bilirubina lub lipaza podwyższona, EKG z niedokrwieniem.

**Zmiany:** top-2 zostaje bez zmian (kolka 0,45, ostre zapalenie 0,25). Pilność zostaje 2. Pewność średnia, bo pilność to nie moja mocna strona.

### bayes

**Co mnie przekonuje:** Zgadzam się z głównym sporem, czyli kolką (niepowikłaną) a wczesnym zapaleniem pęcherzyka. Argument najgorszego scenariusza (0,32 dla zapalenia: Murphy dodatni, 3 dni, ibuprofen maskujący) jest sensowny. Leczenie przeciwbólowe zaburza LR− gorączki, bo jej brak niewiele waży. Pretest ACS (ostry zespół wieńcowy) jest niski, ale EKG (elektrokardiogram) jest tanie i kończy sprawę, więc robić je od razu.

**Co by zmieniło moje zdanie:** CRP (białko C-reaktywne) i leukocytoza w normie oraz USG (ultrasonografia) bez pogrubienia ściany obniżyłyby zapalenie do około 0,10. Podwyższone CRP lub sonograficzny Murphy podniosłyby je powyżej 0,5.

**Zmiany:** top-2 zostaje 0,48 kolka i 0,27 zapalenie, bo nie dochodzi żadna nowa informacja. Pilność nadal 2.

### poz-pragmatyk

**Co mnie przekonuje:** wszyscy dają pilność 2 i ten sam pakiet dziś (EKG, morfologia, CRP, próby wątrobowe, bilirubina, lipaza, kreatynina, USG). Gospodarz kosztów ma rację, że lipaza jest lepsza niż amylaza, więc zmieniam zlecenie na samą lipazę. Przekonuje mnie też EKG na początku wizyty, bo trwa 5 minut i zamyka najgorszy scenariusz.

**Co by zmieniło moje zdanie:** CRP lub leukocyty podwyższone, gorączka, ból trwający powyżej 6 godzin albo USG niedostępne w ciągu 72 godzin. Wtedy SOR, bez ambulatoryjnego czekania.

**Zmiany:** p top-2 bez zmian (kolka 0,50, ostre zapalenie pęcherzyka 0,25), pilność 2, pewność średnia.

### najgorszy-scenariusz

**Co mnie przekonuje:** zgodność wszystkich na pilność 2 i na EKG oraz laboratorium dziś. Agregat 0,58/0,24 dla kolki i zapalenia pęcherzyka jest rozsądny jako ranking. Nie zgadzam się jednak z jego zbyt niskim p zapalenia, bo ibuprofen maskuje gorączkę i obronę mięśniową.

**Co by zmieniło moje zdanie:** prawidłowe EKG, CRP, leukocyty, bilirubina, próby wątrobowe i lipaza oraz USG bez cech zapalenia i bez poszerzenia dróg żółciowych. Wtedy zszedłbym do pilności 3.

**Zmiany:** p top-2 bez zmian (kolka 0,45, zapalenie 0,32). Pilność 2 bez zmian. Nie podnoszę jej: perforację, krwawienie i sepsę uznaję za wykluczone klinicznie.

**Pytania, czym wykluczacie:**
- OZW: czym, skoro EKG nie wykonano?
- Zapalenie pęcherzyka: czym, bez CRP i USG, po ibuprofenie?

Uwaga: w agregacie pole `weto` ma wartość null, mimo że protokół mówi o wecie na poziomie 2.

### gospodarz-kosztow

**Co mnie przekonuje:** Wszystkie sześć opinii zbiega się w jednym punkcie. Pilność 2, jeden dzisiejszy pakiet (EKG, morfologia, CRP, lipaza, bilirubina, próby wątrobowe, kreatynina) i USG. Każde z tych badań zmienia decyzję: dodatnie CRP, leukocytoza lub USG oznaczają chirurga dziś, a prawidłowe oznaczają planową cholecystektomię. Lipaza zamiast amylazy jest też wspólna dla większości.

**Co by zmieniło moje zdanie:** Gdyby USG w POZ nie było dostępne w ciągu 72 h, kieruję od razu na SOR (jedna wizyta zamiast kaskady). Gdyby dodać obrazowanie inne niż USG (TK, MRCP) bez wyniku wskazującego na powikłanie, byłoby to zbędne.

**Zmiany:** Moje p to 0 (waga w rozpoznaniu = 0), więc top-2 bez zmian. Pilność zostaje 2.

### farmakolog

**Co mnie przekonuje:** Zespół zgodnie ocenia pilność na 2 i widzi kolkę jako główne rozpoznanie (p około 0,58) przy otwartej osi z ostrym zapaleniem pęcherzyka (0,24). Przekonuje mnie EKG od razu, bo NLPZ i nadciśnienie przy niewykluczonym OZW to ryzyko lekowe. Zgadzam się też, że ibuprofen mógł zamaskować gorączkę i CRP.

**Co by zmieniło moje zdanie:** eGFR poniżej 30, ALT powyżej 3 × górnej granicy normy (wstrzymać atorwastatynę), cechy krwawienia z przewodu pokarmowego albo estrogeny i inne nieujęte leki. Lipaza nad amylazą: zgadzam się z gospodarzem kosztów.

**Zmiany:** Mój p dla rozpoznań polekowych nie zmienia się (top-2: ibuprofen 0,05, atorwastatyna 0,02), a pilność zostaje 2. Doprecyzowanie planu: diklofenak i.m. dopiero po EKG, a do wyniku eGFR tylko jedna dawka.

## Runda 2

### bayes

Stanowisko ostateczne: kolka żółciowa 0,48, ostre zapalenie pęcherzyka 0,30. Podnoszę zapalenie z 0,27, bo przekonał mnie argument ibuprofenu: maskuje gorączkę i CRP, więc ich brak waży mało, a Murphy jest dodatni. Pilność 2, pewność średnia.

Niezbędny element planu: dziś CRP z morfologią i USG pęcherzyka, EKG na początku wizyty. Przy braku USG dziś lub podwyższonym CRP: SOR. Wyniki rozstrzygną między planową cholecystektomią a chirurgiem dziś.

### hipotezujacy

**Top-2:** kolka żółciowa p=0,48 i ostre zapalenie pęcherzyka żółciowego p=0,28. Zmieniam to względem rundy 1 (0,45 i 0,25). Powód: dodatni Murphy, 3 dni objawów i brak gorączki, która po ibuprofenie mało waży. To zbliża moje liczby do agregatu (0,58 i 0,24). Zgadzam się z najgorszym scenariuszem co do pilności, ale nie przesuwam jej poza 2.

**Pilność:** 2, pewność średnia.

**Niezbędny element planu:** EKG w gabinecie od razu. Potem tego samego dnia CRP, morfologia, lipaza, bilirubina, próby wątrobowe i USG. Przy podwyższonych wynikach albo braku USG w 72 godziny kieruję na SOR.

### najgorszy-scenariusz

Top-2 bez zmian: kolka żółciowa 0,45, ostre zapalenie pęcherzyka 0,32. Pilność 2, pewność średnia. Nie podnoszę pilności, bo perforację, sepsę i krwawienie uznaję za wykluczone klinicznie. Nikt nie odpowiedział na moje pytania, czym wykluczacie OZW i zapalenie pęcherzyka. Obie flagi zostają otwarte do EKG, CRP i USG. Weto w agregacie ma wartość null, ale wynik 2 jest zgodny. Niezbędny element planu to EKG od ręki. Gdy USG nie będzie dostępne dziś, kierujemy na SOR.

### poz-pragmatyk

**Top-2:** kolka żółciowa p 0,50, ostre zapalenie pęcherzyka żółciowego p 0,27. Podnoszę zapalenie z 0,25, bo ibuprofen osłabia wartość braku gorączki, a Murphy jest dodatni. Pilność 2, pewność średnia.

**Jeden niezbędny element planu:** dziś EKG i krew z wynikiem tego samego dnia (morfologia, CRP, lipaza, bilirubina, próby wątrobowe, kreatynina), a USG w ≤72 h. Podwyższone CRP lub leukocyty, gorączka albo brak USG w ≤72 h oznaczają SOR dziś.

### gospodarz-kosztow

**Stanowisko ostateczne:** top-2 bez zmian, p=0 (waga w rozpoznaniu = 0). Osie to kolka żółciowa i ostre zapalenie pęcherzyka. Pilność 2. Czekanie na badania jest bezpieczne tylko wtedy, gdy pakiet zrobimy dziś.

**Niezbędny element planu:** jedna wizyta dziś z EKG i pakietem krwi (morfologia, CRP, lipaza, bilirubina, próby wątrobowe, kreatynina). Każde z tych badań zmienia decyzję. USG w ≤72 h. Gdy USG jest niedostępne albo wyniki są nieprawidłowe, kieruję od razu na SOR. Nie zlecam TK ani MRCP bez wskazań.

### farmakolog

Top-2 bez zmian, p dla rozpoznań polekowych (tor rozpoznania ma u mnie wagę 0): ibuprofen (dyspepsja, gastropatia) 0,05 i atorwastatyna (uszkodzenie wątroby) 0,02. Pilność 2, pewność średnia.

Niezbędny element planu: diklofenak 75 mg i.m. tylko po EKG i tylko jako jedna dawka do wyniku eGFR (bez ibuprofenu). Dzisiejsze badania: kreatynina z eGFR, ALT i lipaza. Jeśli ALT jest powyżej 3 × górnej granicy normy, wstrzymać atorwastatynę. Dawki bez źródła w `zrodla/`: `[wiedza modelu, niezweryfikowane]`.

## Zamknięcie ordynatora
- Stanowiska po rundzie 2: kolka 0,45–0,50, ostre zapalenie pęcherzyka 0,27–0,32 (wzrost u trzech lekarzy po argumencie o maskowaniu przez ibuprofen). Pilność 2 jednogłośnie.
- Odpowiedź na pytanie najgorszego scenariusza: **OZW i ostrego zapalenia pęcherzyka NIE wykluczamy.** Obie flagi zostają otwarte do EKG, CRP z morfologią i USG; weto pilności (2) obowiązuje. Pole `weto: null` w agregacie to brak w skrypcie (nie zapisuje weta, gdy mediana już równa się jego ocenie) — zgłoszone jako uwaga do aplikacji.
- Uzgodnione: EKG na początku wizyty; lipaza zamiast amylazy; NLPZ (diklofenak) dopiero po EKG, jedna dawka do wyniku eGFR; brak USG w ≤72 h lub nieprawidłowe wyniki = SOR / chirurg dziś.
