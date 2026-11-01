# 08 — Odpowiedź ordynatora rezydentom i Sprawdzającemu faktów

## Rezydent 1 (persona: lekarz medycyny paliatywnej)

**Uwaga techniczna (ocena ordynatora):** pakiet rezydenta nie zawierał dołączonych wyników (Hb 10,8 g/dl, MCV 76 fl, ferrytyna 8 ng/ml) ani treści pytań ankiety, a odpowiedź „Teraz nie mam miesiączki” padła na pytanie „Czy właśnie teraz krwawisz tak mocno, że podpaska przemaka w godzinę…” — oznacza „nie jestem w trakcie miesiączki”, nie wtórny brak miesiączki. Dwie z trzech uwag rezydenta wynikają z tej luki pakietu, nie z błędu zespołu. Luka jest realna i trafi do `pamiec/luki.md` po follow-upie jako wada narzędzia (`skrypty/pakiet_rezydenta.py` powinien dołączać sekcję „Wyniki badań” i treść pytań przy odpowiedziach jednowyrazowych).

### 1. Czego brakuje w danych — data ostatniej miesiączki, antykoncepcja, Hb/MCV/ferrytyna, B12
- Hb/MCV/ferrytyna: **ODRZUCAM** — wyniki są w `01-wywiad.md` i były podstawą decyzji; brak ich w pakiecie to wada narzędzia, nie sprawy. Kategoria: brak_danych (pakiet). Hasło: pakiet-bez-wyników. Nie zmienia decyzji.
- B12: **ODRZUCAM jako nowość** — witamina B12 jest już w pobraniu za 4 tygodnie (`05-projekt.md`). Kategoria: brak_danych. Hasło: B12-wegetarianka. Nie zmienia decyzji.
- Data ostatniej miesiączki i antykoncepcja: **PRZYJMUJĘ** — ankieta nie pytała o datę ostatniej miesiączki ani o antykoncepcję, a u kobiety starającej się o dziecko to wzmacnia wskazanie do testu ciążowego na wizycie; w FINAL mieści się w punkcie „ciąża (tylko deklaracja)” i w teście ciążowym jako pierwszej czynności (limit 250 słów), pełna lista w 05-projekt.md. Kategoria: brak_danych. Hasło: data-ostatniej-miesiączki. Nie zmienia decyzji (test ciążowy był już pierwszym krokiem).

### 2. Hipoteza niewypowiedziana — pacjentka jest już w ciąży (wtórny brak miesiączki)
**ODRZUCAM w uzasadnieniu, PRZYJMUJĘ w skutku** — przesłanka jest błędna („teraz nie mam miesiączki” = nie krwawi w tej chwili, nie amenorrhoea), ale wniosek jest zbieżny z planem: ciąża jest wykluczona tylko deklaracją, dlatego test ciążowy jest pierwszą czynnością na wizycie, a wynik dodatni oznacza lewotyroksynę od razu. Kategoria: hipoteza. Hasło: ciąża-przed-decyzją-tarczycową. Nie zmienia decyzji (ścieżka istniała w `05-projekt.md`, Plan B pkt 1); w FINAL przenoszę ją wyżej, do REKOMENDACJI.

### 3. Podejrzane założenie — decyzja nie rozgałęzia się na wynik testu; żelazo bez ferrytyny; „Tak/Nie” niezrozumiałe
- Brak rozgałęzienia: **ODRZUCAM** — Plan B w `05-projekt.md` zaczyna się od „test dodatni → lewotyroksyna od razu”; rezydent nie widział tego z powodu skrótu pakietu. Kategoria: zalozenie. Hasło: rozgałęzienie-test-ciążowy. Nie zmienia decyzji, ale uwaga poprawia czytelność FINAL (rozgałęzienie w pierwszym zdaniu).
- Żelazo bez ferrytyny/MCV: **ODRZUCAM** — ferrytyna 8 ng/ml i MCV 76 fl są znane. Kategoria: brak_danych (pakiet). Hasło: pakiet-bez-wyników. Nie zmienia decyzji.
- Odpowiedzi „Tak/Nie/Nie, tylko raz” bez pytań: **PRZYJMUJĘ jako uwagę do narzędzia** — „Tak” dotyczyło posiadania wyników, „Nie, tylko raz” — liczby oznaczeń TSH; pakiet musi przenosić treść pytania. Kategoria: brak_danych (pakiet). Hasło: pakiet-pytania-bez-treści. Nie zmienia decyzji.

## Sprawdzający faktów — kartka ŻÓŁTA

Wszystkie BEZ_ZRODLA i SPRZECZNE:

1. **Próg przyrostu Hb <1 g/dl po 4 tygodniach — BEZ_ZRODLA.** **PRZYJMUJĘ** — etykieta [wiedza modelu, niezweryfikowane] zostaje w FINAL. Nie zmienia decyzji.
2. **Powtórne TSH/FT4/anty-TPO po 4 tygodniach — BEZ_ZRODLA.** **PRZYJMUJĘ** — odstęp uzasadniam logistycznie (jedno pobranie z kontrolą Hb po żelazie; wytyczne wymagają powtórzenia, bez sztywnego odstępu) i oznaczam etykietą. Nie zmienia decyzji.
3. **Hb <8 g/dl jako próg eskalacji — BEZ_ZRODLA.** **PRZYJMUJĘ** — etykieta w WRÓĆ/ESKALUJ. Nie zmienia decyzji.
4. **„Brak polskich wytycznych” — SPRZECZNE** (PTE 2021 choroby tarczycy w ciąży, PMID 34855189; PTE 2022 tarczyca a płodność, PMID 36059162). **PRZYJMUJĘ** — przeformułowuję: polskich wytycznych nie ma w `zrodla/`, ale istnieją; w ŹRÓDŁACH przywołuję PTE 2021/2022 jako nadrzędne (treść progów z pamięci, etykieta zostaje). Nie zmienia decyzji.
5. **Pominięty dowód: przy współistnieniu niedokrwistości z niedoboru żelaza i subklinicznej niedoczynności żelazo bez lewotyroksyny daje słaby przyrost Hb (+0,4 vs +1,9 g/dl; PMID 18984662).** **PRZYJMUJĘ** — wzmacnia Plan B: brak przyrostu Hb po 4 tygodniach przy potwierdzonym TSH >4 mIU/l to dodatkowy argument za lewotyroksyną, nie tylko za celiakią/żelazem dożylnym. Nie zmienia decyzji głównej (dziś nie włączać), bo badanie dotyczyło potwierdzonej, nie jednorazowej SCH.
6. Uwagi redakcyjne (kwas foliowy 0,4 mg/d ma źródło poziomu 2 PMID 41432531; serologia celiakii wg BSG z pamięci; metaanaliza PMID 33716980 pokazuje też OR 1,89 dla anty-TPO przy niedoborze żelaza): **PRZYJMUJĘ** — poprawione w ŹRÓDŁACH/etykietach. Nie zmienia decyzji.

## Wynik
Żadna uwaga nie zmienia decyzji (lewotyroksyny dziś nie włączać; test ciążowy + żelazo; decyzja po pobraniu za 4 tygodnie). Zmiany w FINAL: rozgałęzienie na test ciążowy w pierwszym zdaniu, PMID 18984662 w Planie B, PTE 2021/2022 w źródłach, etykiety wg Sprawdzającego. Powrót do pkt 4 (nowy projekt) niepotrzebny.
