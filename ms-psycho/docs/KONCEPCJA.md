# MS Konsylium Psychologiczne („brat bliźniak”): koncepcja

Przygotowano 1.11.2026 w wątku „Rola: Psycholog”. Dokument koncepcyjny na zlecenie Michała: nie zmienia kodu ani definicji w `.claude/` (to należy do wątku Kodującego, a definicje ról zatwierdza Michał). Robocze definicje agentów są w `konsylium/psycho/agenci/`, a karty decyzji w ankiecie podlinkowanej w wątku.

**Zastrzeżenie na wstępie.** To narzędzie wyłącznie do testów i sprawdzenia, czy konsylium agentów ma sens w psychologii. Nie prowadzi diagnostyki ani terapii żadnej realnej osoby. Przypadki testowe: tylko dorośli, tylko wiek i płeć, bez danych identyfikujących.

---

## 1. Najkrócej

1. **Ta sama powłoka, inny zespół.** Bliźniak przejmuje z MS Konsylium wszystko, co już działa: wywiad klikalny na żywo, folder sprawy, dymki, Pokój ze stołem i ekranami, Wnioski, sygnał „AI pracuje”. Zmienia się skład zespołu, język, waluta sporu i protokół bezpieczeństwa.
2. **Waluta sporu to formulacja przypadku, nie rozpoznanie.** W medycynie lekarze spierają się o rozpoznanie i pilność. Tu klinicyści spierają się o to, **co podtrzymuje problem i co z tego wynika dla kierunku pracy**. Etykieta ICD‑11 jest tylko jednym z pól, a nie celem.
3. **Konfrontacja podejść ma sens tylko jako dopasowanie, nie jako wyższość.** Literatura mówi, że główne szkoły dają podobne wyniki średnio dla populacji (równoważność psychodynamicznej i CBT: g = −0,153 w 23 RCT, 2751 pacjentów, Steinert 2017). Spór „kto ma rację” jest więc jałowy. Spór „które podejście lepiej pasuje do tej osoby, jej celu i etapu gotowości” ma sens i jest mierzalny.
4. **Dwa tryby.** *Konsylium* (jak w MS Konsylium: osobne wypowiedzi w Pokoju, Wnioski) oraz *Porada* (live chat: wielu agentów i konfrontacja podejść scalona w **jeden głos**, w jednym tekście, z widocznym „zespół pracuje”).
5. **Bezpieczeństwo jest pierwsze i twarde.** Ryzyko samobójcze, zagrożenie dla innych, psychoza, przemoc: osobny agent sprawdza każdą turę, progi i reakcje są z góry ustalone, a aplikacja nigdy nie „uspokaja”, że ryzyka nie ma. Modele same tego nie zapewnią: badania z 2025–2026 pokazują, że chatboty słabo różnicują pośrednie poziomy ryzyka, a dostęp przez API ma mniej zabezpieczeń niż interfejs konsumencki (nasza aplikacja korzysta z API).
6. **Źródła.** PubMed działa i pokrywa psychiatrię oraz czasopisma APA; Europe PMC i Crossref działają jako dodatkowe wyszukiwarki; APA, NICE, WHO (mhGAP, ICD‑11), PTP, PTTPB i Psychiatria Polska są osiągalne. Niedostępne z chmury: APA PsycNet/PsycINFO, Cochrane Library, OpenAlex, Semantic Scholar, PsyArXiv, PubPsych. Lista z wynikiem testu w części 7.

---

## 2. Czym bliźniak różni się od MS Konsylium

| Element | MS Konsylium (medycyna) | Bliźniak (psychologia) |
|---|---|---|
| Użytkownik | lekarz POZ | terapeuta / psycholog / lekarz zainteresowany psychologią (Michał w testach) |
| Pytanie wiodące | rozpoznanie, pilność, następny krok | formulacja problemu, kierunek pracy, czego nie przeoczyć, czy to w ogóle praca dla psychologa |
| Ślepa tura | 6 lekarzy, ranking rozpoznań z p | 5 terapeutów + diagnosta + psychiatra, każdy pisze **formulację** w swoim języku i listę tego, co jego podejście przewiduje |
| Agregacja | log‑odds po kodach ICD‑10 | **mapa zgody**: wspólne elementy formulacji (czynniki podtrzymujące, zasoby, cel), różnice „które zmieniają postępowanie”, tabela tłumaczeń między językami szkół |
| Spór | steelman, adwokat diabła, turniej par rozpoznań, działanie rozstrzygające | steelman cudzego podejścia, **konfrontacja dopasowania** (co ta osoba zyska i straci w każdym podejściu), działanie rozstrzygające = jedno pytanie do klienta/terapeuty albo jedna obserwacja między sesjami |
| Wnioski (FINAL) | REKOMENDACJA, PILNOŚĆ, PLAN B, NIEZNANE, WRÓĆ GDY, ŹRÓDŁA | FORMULACJA (≤120 słów), KIERUNEK PRACY (jedno zdanie), CO NAJPIERW (≤3), CZEGO NIE PRZEOCZYĆ (medyczne i psychiatryczne), PLAN BEZPIECZEŃSTWA (gdy ryzyko ≥ 1), NIEZNANE, ŹRÓDŁA |
| Triage | złożoność, bezpieczeństwo (112), niepewność | **ryzyko** (samobójcze, dla innych, psychoza/mania, przemoc, substancje), złożoność, niepewność; ryzyko ma weto nad całym przebiegiem |
| Tryb szybki | farmakolog + ordynator | **Porada**: mały panel + jeden głos |
| Rezydent za szybą | świeży lekarz z pakietem | **stażysta psychologii** z pakietem oraz **„klient jako sędzia”**: agent czyta Wnioski oczami osoby z tego wywiadu i mówi, co by zrozumiała i co by ją zraniło |

Co przechodzi 1:1: wywiad na żywo i jego format, folder `sprawy/<ID>/`, `dymek.py`, Pokój (stół, laptopy, ekrany), `uwagi-lekarza.jsonl` jako „uwagi terapeuty”, sygnał „AI pracuje”, Wnioski jako ekran, iPad.

Co trzeba dodać: ekran czatu dla trybu Porada, protokół ryzyka z paskiem alarmu i numerami, nowe pola w schemacie opinii, nowy zestaw definicji agentów, inna skórka Pokoju (zob. §8).

---

## 3. Skład zespołu

Zasada modeli jak u Michała: Fable i Opus 5.5, wysiłek high lub medium, najwyżej jeden Sonnet.

### 3.1 Widoczni na scenie

| Rola (plik) | Model | Co wnosi | Typowa ślepa plamka, którą inni mają wytykać |
|---|---|---|---|
| **Prowadzący konsylium / superwizor** (`prowadzacy`) | Fable high | Jak ordynator: wywiad, triage, delegacja, mapa zgody, tłumaczenie między językami szkół, Wnioski, jeden głos w trybie Porada | przedwczesna synteza „każdy ma trochę racji” |
| **Terapeuta CBT** (`terapeuta-cbt`) | Opus 5.5 high | Model poznawczo‑behawioralny: myśli, zachowania, unikanie, ekspozycja, aktywizacja; protokoły o najmocniejszym dowodzie; mierzalne cele; kwestionariusze | spłaszczenie relacji i historii do „błędu myślenia”, pośpiech do techniki |
| **Terapeuta psychodynamiczny** (`terapeuta-psychodynamiczny`) | Opus 5.5 high | Powtarzające się wzorce relacyjne, mechanizmy obronne, przeniesienie, konflikt wewnętrzny, historia przywiązania, znaczenie objawu | nadinterpretacja, odkładanie ulgi w objawie, mała mierzalność |
| **Terapeuta systemowy** (`terapeuta-systemowy`) | Opus 5.5 high | Problem jako funkcja w systemie (rodzina, praca, para), cykle interakcji, granice, lojalności, genogram; kto jeszcze powinien być w pokoju | rozmycie odpowiedzialności jednostki, pominięcie psychopatologii |
| **Terapeuta trzeciej fali** (`terapeuta-act`) | Opus 5.5 high | ACT, DBT (regulacja emocji, tolerancja dyskomfortu), terapia schematów, uważność; wartości i elastyczność psychologiczna zamiast walki z objawem | akceptacja tam, gdzie potrzebna jest zmiana lub leczenie; żargon |
| **Terapeuta humanistyczno‑egzystencjalny** (`terapeuta-humanistyczny`) | Opus 5.5 high | Sojusz, empatia, autonomia klienta, sens, żałoba, kryzysy życiowe; czynniki wspólne; „co ta osoba naprawdę chce”; strażnik tonu | unikanie struktury i oceny ryzyka, idealizacja procesu |
| **Diagnosta kliniczny** (`diagnosta`) | Opus 5.5 high | Różnicowanie wg ICD‑11 CDDR i DSM‑5‑TR, kwestionariusze (PHQ‑9, GAD‑7, PCL‑5, AUDIT‑C, MDQ, ASRS), neurorozwojowe (ADHD, spektrum), zaburzenia osobowości, poziom funkcjonowania; **standardy diagnozy psychologicznej PTP** | etykieta zamiast zrozumienia, nadrozpoznawalność |
| **Psychiatra konsultant** (`psychiatra`) | Opus 5.5 high | Co jest medyczne, nie psychologiczne: tarczyca, anemia, leki i substancje, sen, ból, otępienie, mania, psychoza; wskazania do farmakoterapii i pilnej konsultacji; ocena ryzyka | medykalizacja cierpienia, pośpiech do leku |

Osiem postaci przy stole. Michał ma własną rolę **Terapeuta prowadzący** (pole „Powiedz”, jak Lekarz prowadzący), a jego wpisy mają rangę odpowiedzi z wywiadu.

### 3.2 Triage (jak zastępcy ordynatora, bez postaci albo małe postacie przy drzwiach)

| Rola | Model | Zadanie |
|---|---|---|
| **Strażnik ryzyka** (`straznik-ryzyka`) | Opus 5.5 medium | Z wywiadu i każdej tury: poziom ryzyka samobójczego 0–4 (§6), zagrożenie dla innych, psychoza/mania, przemoc doświadczana, intoksykacja, zaniedbanie osoby zależnej. JSON z `poziom`, `fakty`, `eskaluj`. Ma **weto**: przy `eskaluj: true` konsylium zmienia tor (§6). Uruchamiany **w każdej turze** trybu Porada. |
| **Zastępca złożoności** (`zastepca-zlozonosc`) | Sonnet medium (jedyny Sonnet) | Czy to porada, czy pełne konsylium: liczba obszarów problemowych, współchorobowość, czas trwania, wcześniejsze terapie, kontekst prawny. |
| **Zastępca niepewności** (`zastepca-niepewnosc`) | Opus 5.5 medium | Lista NIEZNANE do wywiadu, test hipotezy roboczej prowadzącego, ryzyko „kotwicy” na pierwszej narracji klienta. |

### 3.3 Kontrola jakości

| Rola | Model | Zadanie |
|---|---|---|
| **Sprawdzający źródeł** (`sprawdzajacy-zrodel`) | Fable high | Każda liczba i każde „badania pokazują” ma PMID/DOI albo etykietę `[wiedza modelu, niezweryfikowane]`; sprawdza, czy populacja badania pasuje (dorośli, nie dzieci; ambulatorium, nie oddział). |
| **Sprawdzający procesu i etyki** (`sprawdzajacy-etyki`) | Fable medium | Reguły sporu (§5), Kodeks etyczny psychologa PTP, granice (brak diagnozy dla klienta, brak dawkowania, brak obietnic), język (bez patologizowania, bez winy), zgodność Wniosków z pytaniem wiodącym terapeuty, obecność planu bezpieczeństwa przy ryzyku ≥ 1. |
| **Stażysta za szybą** (`stazysta`) | Fable high | Jak rezydent: dostaje tylko pakiet (wywiad + Wnioski bez protokołu) i pyta „czego nie rozumiem, czego brakuje”. |
| **Klient jako sędzia** (`klient-sedzia`) | Opus 5.5 medium | Czyta Wnioski (i w trybie Porada każdą odpowiedź) jako osoba z tego wywiadu: co zrozumie, co ją zrani, co odrzuci, co ją zmotywuje. Nowość względem medycyny, bo w psychologii **sposób powiedzenia jest częścią interwencji**. |

### 3.4 Niewidoczni asystenci (opcja z „Sieci agentów 2.0”)

Jak w propozycji dla medycyny: każdy z 7 klinicystów może dostać dwóch asystentów. **Dowody** (Opus medium): szuka badań i wytycznych dla tego problemu w tym podejściu, buduje pakiet teza–PMID–zdanie. **Krytyk** (Fable high, inny model niż terapeuta): atakuje szkic formulacji z pozycji *innego* podejścia (krytyk CBT mówi językiem psychodynamicznym i odwrotnie). To tańsza forma konfrontacji podejść niż pełna runda. Polecam włączyć dopiero po testach K0–K2 (§9), tak jak w medycynie.

---

## 4. Tryb KONSYLIUM: protokół sprawy

Etapy techniczne przelatują szybko, Michał ogląda dyskusję w tempie do czytania i Wnioski. Dymki po polsku, 1–2 pełne zdania językiem klinicznym (≤400 znaków), bez wag i opisu procesu.

**Etap 0. Wywiad klikalny (na żywo, jak w MS Konsylium).** Zaczyna się od opisu własnymi słowami. Pierwsza partia pytań to **zawsze bezpieczeństwo**: przesiew C‑SSRS (6 pytań klikalnych) i pytanie o bezpieczeństwo w domu. Potem przesiew PHQ‑9, GAD‑7, AUDIT‑C i krótkie pytania o sen, substancje, leki, choroby somatyczne, wcześniejsze terapie i leczenie psychiatryczne, sieć wsparcia, **cel** („co by się musiało zmienić, żebyś uznał/a, że warto było”) oraz gotowość do zmiany (skala 0–10). Pytanie otwarte najwyżej 2–3 na całą ankietę. Na końcu **pytanie wiodące terapeuty** (klikalnie: „formulacja i kierunek”, „czy to dla psychologa czy psychiatry”, „jak pracować z tym konkretnym wątkiem”, „drugie zdanie o mojej formulacji”).

**Etap 1. Triage.** Strażnik ryzyka, złożoność, niepewność równolegle. Poziom ryzyka ≥ 3 przerywa zwykły tor (§6). Złożoność niska → prowadzący proponuje tryb Porada zamiast pełnego konsylium.

**Etap 2. Ślepa tura formulacji.** Siedmiu klinicystów dostaje `00-surowe.md` i `01-wywiad.md`, nie widzi innych. Każdy zapisuje `03-formulacje/<rola>.json`:
```
problem_w_jednym_zdaniu, czynniki_podtrzymujace[], czynniki_predysponujace[], zasoby[],
hipoteza_robocza_icd11 (kategoria, pewnosc 0-1, "nie dotyczy" dozwolone),
co_moje_podejscie_przewiduje[] (obserwowalne), czego_nie_tlumaczy[],
proponowany_kierunek (1 zdanie), pierwsze_3_kroki[], przeciwwskazania[],
co_zmieniloby_moje_zdanie[], ryzyko (0-4, fakty), zrodla[] {teza, pmid|doi, zdanie}
```
Minimum 3 skuteczne zapytania do PubMed (albo Europe PMC) na rolę; liczba bez źródła wraca do roli.

**Etap 3. Mapa zgody** (`agregacja_formulacji.py`, nowy skrypt). Zamiast rankingu rozpoznań: (a) czynniki podtrzymujące wymienione przez ≥ 2 role, po **tabeli tłumaczeń** (schemat ≈ przekonanie kluczowe ≈ wzorzec relacji z obiektem ≈ reguła rodzinna ≈ unikanie doświadczania), żeby ta sama treść w czterech językach nie liczyła się jako cztery różnice; (b) różnice **zmieniające postępowanie**: kierunek pracy, czy to w ogóle psychologia, czy potrzebna konsultacja psychiatryczna teraz; (c) zgodność kategorii ICD‑11 jako pole poboczne.

**Etap 4. Konfrontacja podejść** (adaptacyjna, jak spór 2.0 w medycynie):

| Sytuacja po ślepej turze | Co się dzieje |
|---|---|
| Zgoda co do kierunku i brak różnic zmieniających postępowanie | **Minimalny test zgody**: jedno podejście (rotacyjnie) przedstawia najmocniejszy kontrargument z faktem z wywiadu albo źródłem. Jeśli nikt nie uzna go za nieobalony → Etap 5. |
| Różnica w kierunku pracy albo w pytaniu „psycholog czy psychiatra” | Rundy A → B → C |

- **Runda A, steelman cudzego podejścia** (wszyscy, ≤80 słów): „najmocniejsza wersja formulacji, z którą się nie zgadzam, i co z niej biorę”.
- **Runda B, konfrontacja dopasowania** (2–3 role wokół jednego punktu spornego): tabela **osoba × podejście**: co ta konkretna osoba zyska, co straci, czego wymaga od niej dane podejście (czas, introspekcja, udział bliskich, tolerancja dyskomfortu), jak wygląda ryzyko przerwania terapii. Psychiatra i diagnosta mają osobny głos: „czego nie wolno nie zrobić przed żadną psychoterapią”.
- **Runda C, działanie rozstrzygające** (wszyscy): zespół projektuje **jedno pytanie do klienta** (klikalne, przez Terapeutę prowadzącego) albo **jedną obserwację między sesjami** (dziennik, eksperyment behawioralny), która rozstrzyga spór. Zakończenie adaptacyjne: koniec, gdy nie pada nowy argument; twardy limit 3 rundy.

Reguły sporu (egzekwuje Sprawdzający procesu i etyki): zmiana zdania tylko z nowym argumentem (fakt z wywiadu, wynik kwestionariusza, PMID, wytyczna); obrona „podtrzymuję, bo…” jest dozwolona; **ochrona mniejszości z flagą ryzyka** (głos psychiatry o przyczynie somatycznej albo o manii nie znika przez głosowanie); każdy zarzut dostaje odpowiedź; dymki pokazują tylko nową treść.

**Etap 5. Wnioski.** Projekt prowadzącego → stażysta i klient‑sędzia równolegle → sprawdzający źródeł i etyki → `09-FINAL.md`. Format:
```
FORMULACJA (≤120 słów, język zrozumiały dla klienta, bez etykiet w pierwszym zdaniu)
KIERUNEK PRACY (jedno zdanie; jedno podejście wiodące albo jawna integracja z powodem)
CO NAJPIERW (≤3 kroki na najbliższe 2–4 tygodnie)
CZEGO NIE PRZEOCZYĆ (medyczne, psychiatryczne, prawne; kto i kiedy)
PLAN BEZPIECZEŃSTWA (gdy ryzyko ≥ 1: wg Stanley–Brown; gdy 0: „nie dotyczy, przesiew ujemny dnia …”)
ZDANIE ODRĘBNE (jeśli było; czyje i dlaczego)
NIEZNANE
WRÓĆ / ESKALUJ GDY
ŹRÓDŁA (≤5 przypisów, reszta w protokole)
```
Po FINAL prowadzący czeka 10 minut na uwagi Terapeuty prowadzącego, jak w medycynie.

---

## 5. Tryb PORADA: wielu agentów, jeden głos

**Cel.** Michał pisze w czacie jak do kolegi po fachu albo (w ustawieniu testowym) jak klient, a odpowiedź przychodzi jako **jeden spójny tekst**, choć stoi za nim konfrontacja podejść. Nic w tekście nie zdradza machinerii („mój kolega CBT uważa…” nie pada). Ślady pracy zespołu są widoczne **obok** tekstu, nie w nim.

**Jak to działa w jednej turze (cel: 25–60 s):**
1. Wiadomość wchodzi. **Strażnik ryzyka** ocenia ją natychmiast (równolegle z resztą). Jeśli `eskaluj` → §6, zwykła odpowiedź nie wychodzi.
2. **Prowadzący** wybiera **mały panel na tę turę**: 2 podejścia najbardziej adekwatne do treści (routing po mapie zgody z poprzednich tur) + diagnosta albo psychiatra, jeśli pojawił się objaw somatyczny, lek, substancja albo coś „nie z psychologii”. Pełny panel 7 ról tylko co kilka tur albo na kliknięcie **„Zwołaj konsylium”** (wtedy aplikacja otwiera Pokój na jedną scenę i wraca do czatu z wynikiem).
3. Każdy z panelu pisze **≤120 słów**: co bym powiedział, czego bym nie powiedział, dlaczego. Zwrot musi zawierać linię `SPÓR:` (z czym się nie zgodzę u innych podejść, jednym zdaniem).
4. **Prowadzący** pisze jeden głos: bierze wspólny rdzeń, a tam, gdzie podejścia się różnią w sposób, który zmienia odpowiedź, **nazywa różnicę wprost jako dwie drogi**, zamiast ją ukrywać („Są dwie uczciwe drogi: … i …; przy Pana celu skłaniam się do …, bo …”). Żadnego „z jednej strony, z drugiej strony” bez wyboru.
5. **Klient‑sędzia** czyta odpowiedź (≤10 s): czy zrozumiała, czy nie rani, czy nie moralizuje, czy nie obiecuje. Czerwona → prowadzący poprawia raz.
6. **Sprawdzający etyki** w tle co turę: granice (§6.4). **Sprawdzający źródeł** tylko, gdy w odpowiedzi padła liczba albo „badania”.

**Pamięć rozmowy.** Każda tura dopisuje do `sprawy/<ID>/rozmowa.jsonl` (kto, co, SPÓR, poziom ryzyka). Prowadzący utrzymuje `formulacja-robocza.md`, aktualizowaną co 3–4 tury, widoczną dla Michała na życzenie (ekran „Formulacja robocza” obok czatu).

**Co widać na ekranie podczas pisania.** Pole odpowiedzi z animacją pisania i pasek „zespół pracuje: 3 osoby” z małymi awatarami osób z panelu; po wysłaniu odpowiedzi awatary gasną. Przycisk „Pokaż, kto co myślał” rozwija pod odpowiedzią trzy krótkie głosy w kolorach ról (tylko na życzenie, domyślnie zwinięte). To zachowuje zasadę Michała „widzę, kiedy AI myśli” bez psucia jednego głosu.

**Do kogo mówi głos (decyzja Michała w ankiecie).**
- *Do terapeuty* (polecam na start): konsultacja kolegialna, drugi głos nad przypadkiem, „jak bym to poprowadził”.
- *Do klienta* (symulacja sesji wsparcia, wyłącznie z syntetycznym klientem w testach): język drugiej osoby, krótsze zdania, jedno pytanie na turę, zero diagnoz i zero leków. Wejście w ten tryb wymaga kliknięcia zgody „To nie jest terapia” (§6.5) na każdej nowej sprawie.

---

## 6. Bezpieczeństwo

### 6.1 Co mówią badania (dlaczego nie ufamy modelowi „z pudełka”)
- Chatboty (ChatGPT, Claude, Gemini) poprawnie odmawiały przy **bardzo wysokim** ryzyku i odpowiadały przy **bardzo niskim**, ale **nie rozróżniały poziomów pośrednich** (9000 odpowiedzi, 30 pytań, 13 klinicystów; McBain 2025, Psychiatric Services, [DOI](https://doi.org/10.1176/appi.ps.20250086)). Nasz protokół musi sam definiować poziomy pośrednie.
- Ten sam model przez **API** odpowiadał wprost na pytania bardzo wysokiego ryzyka w 24,8% przypadków, a przez interfejs konsumencki w 4,6% (30 000 odpowiedzi; Cantor 2026, JMIR, [DOI](https://doi.org/10.2196/97968)). MS Konsylium korzysta z API, więc zabezpieczenia są **naszym** obowiązkiem w promptach i w aplikacji.
- Pętla „zaangażowanie–potwierdzanie”: pochlebczość modelu i antropomorfizacja wzmacniają błędne przekonania; OpenAI ujawniło ok. 1,2 mln użytkowników tygodniowo z sygnałami planowania samobójczego (Santos 2026, J Affect Disord, [DOI](https://doi.org/10.1016/j.jad.2026.122123)). Stąd osobny krytyk i klient‑sędzia zamiast „sprawdź się sam”.
- Modele wyrażają stygmatyzację i podtrzymują urojenia; autorzy wnioskują, że nie mogą zastąpić terapeuty, ale mogą pełnić role pomocnicze (Moore i wsp. 2025, [arXiv 2504.18412](https://arxiv.org/abs/2504.18412)).
- Jednocześnie pierwsze RCT wyspecjalizowanego chatbota (Therabot, N = 210) pokazało duże efekty w depresji i lęku oraz sojusz oceniany jak z ludzkim terapeutą (Heinz 2025, NEJM AI, [DOI](https://doi.org/10.1056/AIoa2400802)). Potencjał istnieje, ale wymaga nadzoru i pomiaru.
- Istnieje otwarty benchmark bezpieczeństwa chatbotów przy ryzyku samobójczym (VERA‑MH, walidacja ludzka: [DOI](https://doi.org/10.2196/92817)) oraz ocena 29 aplikacji z chatbotem na scenariuszach ryzyka ([DOI](https://doi.org/10.1038/s41598-025-17242-4)). Do wykorzystania w testach (§9).

### 6.2 Poziomy ryzyka samobójczego (na podstawie przesiewu C‑SSRS) i reakcja aplikacji

| Poziom | Co oznacza | Reakcja w obu trybach |
|---|---|---|
| 0 | przesiew ujemny | zwykły tor; we Wnioskach „przesiew ujemny dnia …” |
| 1 | myśli o śmierci / bierne („lepiej by było nie żyć”) bez aktywnych myśli | zwykły tor + obowiązkowy PLAN BEZPIECZEŃSTWA we Wnioskach; w Poradzie jedno zdanie o dostępnych numerach, bez przerywania |
| 2 | aktywne myśli bez planu i zamiaru | pasek „Ryzyko: aktywne myśli”, plan bezpieczeństwa **przed** dalszą pracą; psychiatra obowiązkowo w panelu |
| 3 | plan lub metoda lub zamiar, bez zachowania w ostatnim miesiącu | **przerwanie zwykłego toru**: ekran z numerami (112, 116 123, 800 70 2222, SOR, najbliższe CZP), komunikat do terapeuty „to wymaga kontaktu z człowiekiem teraz”; konsylium pracuje dalej **tylko** nad planem bezpieczeństwa i nad tym, co terapeuta ma zrobić w ciągu godziny |
| 4 | zachowanie samobójcze w ostatnim miesiącu lub przygotowania | jak 3, plus zalecenie pilnej oceny psychiatrycznej dziś; w trybie „do klienta” rozmowa kończy się komunikatem kryzysowym i nie wraca do zwykłej odpowiedzi |

Dodatkowe flagi z tym samym mechanizmem przerwania: zagrożenie dla innych z konkretnym zamiarem, objawy psychotyczne lub mania z utratą kontroli, przemoc wobec osoby zależnej, osoba poniżej 18 lat w wywiadzie (poza zakresem testów; aplikacja kończy sprawę). Przesłanki obowiązku prawnego (przemoc wobec dziecka, zagrożenie życia) aplikacja **nazywa jako obszar do sprawdzenia przez terapeutę**, nie udziela porady prawnej.

Ważne: narzędzia przesiewowe mają niską wartość predykcyjną dodatnią na poziomie jednostki (duże badanie C‑SSRS w VHA: [DOI](https://doi.org/10.1080/13811118.2026.2628074)), dlatego poziom jest **progiem reakcji**, nie prognozą. Aplikacja nigdy nie pisze „ryzyko wykluczone”.

### 6.3 Plan bezpieczeństwa (Stanley–Brown)
Sześć kroków: sygnały ostrzegawcze, własne sposoby radzenia sobie, osoby i miejsca odciągające uwagę, osoby do poproszenia o pomoc, profesjonaliści i numery (112, 116 123 całodobowo, 800 70 2222 całodobowo, 116 111 dla młodzieży, Niebieska Linia 800 120 002), ograniczenie dostępu do środków. Krótkie interwencje z planem bezpieczeństwa i kontaktem po wizycie zmniejszały liczbę prób samobójczych (przegląd 4 badań, 3412 osób; McCabe 2018, [DOI](https://doi.org/10.1186/s12888-018-1663-5)). Generuje go prowadzący **z danych wywiadu** (konkretne osoby i sposoby), a nie jako szablon.

### 6.4 Granice porady (egzekwuje Sprawdzający etyki, w obu trybach)
1. Nie stawia diagnozy klientowi; terapeucie podaje „hipotezę roboczą wg ICD‑11” z pewnością.
2. Nie dawkuje leków i nie zaleca odstawienia; psychiatra mówi „to do omówienia z lekarzem prowadzącym” i uzasadnia pilność.
3. Nie obiecuje wyników ani nie ocenia osób trzecich („Twoja matka jest narcystyczna” nie pada).
4. Nie prowadzi ekspozycji na traumę ani interwencji kryzysowej w czacie; nazywa, że to praca na żywo.
5. Nie zastępuje superwizji ani konsultacji prawnej; przy obowiązkach prawnych wskazuje przepis do sprawdzenia.
6. Nie pochlebia: zgoda z klientem wymaga argumentu; niezgoda jest dozwolona i wyrażana z szacunkiem.
7. Nie buduje zależności w trybie „do klienta”: co kilka tur pytanie o kontakt z człowiekiem; brak „jestem tu zawsze”.
8. Kodeks etyczny psychologa PTP i standardy diagnozy psychologicznej PTP są w bibliotece sprawy i rolach.

### 6.5 Komunikat „to nie jest terapia” (propozycja tekstu do aplikacji)
> MS Konsylium Psychologiczne to narzędzie testowe. Nie jest psychoterapią, poradą psychologiczną ani diagnozą i nie zastępuje kontaktu z psychologiem, psychoterapeutą lub lekarzem. Wszystkie przypadki są syntetyczne lub zanonimizowane. Jeśli ktoś w Twoim otoczeniu jest w kryzysie, zadzwoń pod 112 albo 116 123.

Pokazywany raz na start aplikacji (klik „Rozumiem”), w stopce Wniosków i przy wejściu w tryb „do klienta” (klik przy każdej nowej sprawie).

---

## 7. Źródła: co jest wiarygodne i co działa z tego środowiska

Test z 1.11.2026 (chmura claude.ai). Zwykłe `curl` do czegokolwiek zwraca 403 (zasada sieci), więc liczą się tylko konektory i WebFetch. Na komputerze Michała (Claude Code lokalnie) wynik może być inny; Operator powinien to sprawdzić raz na starcie.

### 7.1 Bazy literatury

| Źródło | Co zawiera | Dostęp z chmury | Jak używać w rolach |
|---|---|---|---|
| **PubMed / MEDLINE** (konektor `mcp__PubMed__*`) | psychiatria, psychologia kliniczna, czasopisma APA (J Consult Clin Psychol, Psychotherapy), Lancet Psychiatry, JAMA Psychiatry, metaanalizy psychoterapii (Cuijpers, Leichsenring) | **działa** | główne narzędzie każdej roli; MeSH: `Psychotherapy, Psychodynamic`, `Cognitive Behavioral Therapy`, `Acceptance and Commitment Therapy`, `Family Therapy`, `Therapeutic Alliance`, `Suicidal Ideation`; rekordy APA mają dopisek „PsycInfo Database Record”, więc część PsycINFO jest tu dostępna |
| **Europe PMC** (REST API przez WebFetch) | to samo co PubMed + pełne teksty PMC + preprinty (medRxiv) | **działa** (`ebi.ac.uk/europepmc/webservices/rest/search?query=…&format=json`) | drugie źródło, gdy PubMed daje 0 wyników; pełne teksty otwarte |
| **Crossref** (REST API przez WebFetch) | metadane DOI ze wszystkich dziedzin, także psychologii nieindeksowanej w PubMed | **działa** | sprawdzanie DOI i tytułów, szukanie prac z czasopism psychologicznych poza MEDLINE |
| **ClinicalTrials.gov** (konektor `mcp__Clinical_Trials__*`) | badania w toku | **działa** | rzadko; tylko gdy pytanie o nowe metody |
| **WebSearch** | wyszukiwarka (wyniki z USA) | **działa** | szukanie wytycznych i polskich dokumentów; każdą liczbę potwierdzać w PubMed |
| **arXiv / alphaXiv** | preprinty o agentach i LLM w psychoterapii | **działa** | tylko dla wątku „jak budować system”, nie dla treści klinicznych |
| APA PsycNet / PsycINFO | pełna baza psychologii | **nie** (robots) | przez bibliotekę uczelnianą, poza aplikacją |
| Cochrane Library | przeglądy systematyczne | **nie** (blokada; cochrane.org też) | przeglądy Cochrane są indeksowane w PubMed, więc szukać ich tam (`Cochrane Database Syst Rev[Journal]`) |
| OpenAlex, Semantic Scholar | otwarte indeksy | **nie** (błąd po stronie serwisu z chmury) | sprawdzić lokalnie na PC |
| PsyArXiv (OSF) | preprinty psychologii | **nie** (robots) | pominąć; preprinty nie są źródłem dla Wniosków |
| PubPsych / PSYNDEX (ZPID) | europejska psychologia, niemiecka | **nie** | pominąć |

### 7.2 Wytyczne i dokumenty (do biblioteki `zrodla-psycho/`, jak `zrodla/` w medycynie)

| Dokument | Dostęp | Uwaga |
|---|---|---|
| **APA Clinical Practice Guideline: depresja (2019, w aktualizacji)**, PTSD (2017) | **działa** (apa.org) | PDF do pobrania; decyzje leczenia wg podejść |
| **NICE**: NG222 depresja u dorosłych, NG225 samouszkodzenia, CG113 lęk uogólniony i paniczny, NG116 PTSD, CG31 OCD, CG78 osobowość borderline, CG185 ChAD | **działa** częściowo (strony rozdziałów tak, strony główne i listy odmawiają) | używać linków do konkretnego rozdziału „Recommendations” |
| **VA/DoD PTSD (2023)**, National Center for PTSD | **działa** | leki i psychoterapie o najmocniejszym dowodzie |
| **WHO mhGAP, 3. wydanie (2023)** | **działa** (PDF) | protokoły dla niespecjalistów; przydatne jako „czego nie przeoczyć” |
| **ICD‑11** (przeglądarka WHO) i **CDDR** (opisy kliniczne) | **działa** | kategorie dla diagnosty; CDDR mają badania terenowe rzetelności |
| **PTP: Kodeks etyczny psychologa, Standardy diagnozy psychologicznej** | **działa** (psych.org.pl) | obowiązkowe w roli diagnosty i sprawdzającego etyki |
| **Polskie Towarzystwo Psychiatryczne + NIL: wytyczne diagnostyki i leczenia depresji dla lekarzy rodzinnych (2019)**, omówienie Murawiec 2023 (Lekarz POZ) | **działa** (termedia) | jedyna znaleziona polska wytyczna kliniczna online; PTP nie publikuje listy rekomendacji na stronie |
| **Psychiatria Polska** i **Psychoterapia** (kwartalnik Sekcji Naukowej Psychoterapii PTP) | **działa** (PDF, część otwarta) | polskie piśmiennictwo do sprawdzania adaptacji kulturowych i standardów |
| **PTTPB** (standardy szkolenia 2018/2021, stanowiska) | **działa** (pttpb.pl, cbt.pl) | brak wytycznych klinicznych; są standardy kompetencji i superwizji |
| **Komitet Psychologii PAN, uchwała 5/2025** o regulacji psychoterapii | **działa** | kontekst prawny: psychoterapia w Polsce nadal bez ustawy, projekt ustawy o zawodzie psychologa w Sejmie (druk 1344) |
| **Numery kryzysowe** (czp.org.pl) | **działa** | 112; 116 123 (24 h, sprawdzono 1.11.2026); 800 70 2222 (24 h); 116 111 (młodzież); 800 120 002 (Niebieska Linia) |

Luka: w Polsce nie ma jednej instytucji wydającej wytyczne psychoterapii (odpowiednika NICE), więc biblioteka polska będzie zbiorem: PTP (etyka, diagnoza), PTP/NIL depresja, standardy PTTPB, artykuły z *Psychiatrii Polskiej* i *Psychoterapii*, a dla farmakoterapii standardy Polskiego Towarzystwa Psychiatrycznego (książkowe, Michał musiałby dodać PDF). Pliki pobiera Michał, konwertuje Kodujący (jak w `zrodla/`).

### 7.3 Dowody na to, o co mają się spierać agenci (wybór, wg PubMed)
- Równoważność psychodynamicznej i terapii o ustalonej skuteczności (głównie CBT): g = −0,153 po leczeniu, 23 RCT, 2751 pacjentów (Steinert 2017, Am J Psychiatry, [DOI](https://doi.org/10.1176/appi.ajp.2017.17010057)). Wniosek dla sporu: nie „kto lepszy”, lecz „kto dla kogo”.
- Sojusz i doświadczenie terapeuty vs sens leczenia działają przez różne procesy (jasność emocjonalna vs ruminacje) i zależą od orientacji (631 pacjentów; Finsrud, Wampold 2023, J Consult Clin Psychol, [DOI](https://doi.org/10.1037/ccp0000853)). Wniosek: humanistyczny pilnuje relacji, CBT pilnuje zrozumiałości planu, oba są mierzalne.
- Składniki interwencji psychospołecznych, nie szkoły, różnią się skutecznością (bayesowska komponentowa NMA danych indywidualnych; Lancet Psychiatry 2026, [DOI](https://doi.org/10.1016/S2215-0366(26)00193-8)). Wniosek: mapa zgody ma liczyć **składniki** (aktywizacja, ekspozycja, praca z relacją, rozwiązywanie problemów), nie etykiety szkół.
- Psychoterapia, leki i leczenie skojarzone w depresji: NMA dla funkcjonowania społecznego (Psychother Psychosom 2026, [DOI](https://doi.org/10.1159/000553252)). Wniosek: psychiatra ma argument, kiedy skojarzenie jest lepsze.
- IPT vs leki u kobiet w średnim wieku bez różnicy skuteczności, więc decyduje preferencja (IPD‑MA; [DOI](https://doi.org/10.1007/s00737-026-01730-1)). Wniosek: preferencja klienta jest argumentem w sporze, nie dodatkiem.
- Terapia schematów w zaburzeniach osobowości: umiarkowany efekt (g ≈ 0,36; 8 RCT), grupowa silniejsza niż indywidualna ([DOI](https://doi.org/10.1080/08039488.2023.2228304)).
- ACT w bezsenności: skuteczna, ale CBT‑I pozostaje standardem (bez różnicy po leczeniu, remisja częstsza po CBT‑I; [DOI](https://doi.org/10.1007/s44470-026-00125-4)). Wniosek: trzecia fala ma mówić, kiedy ustąpić protokołowi.
- Monitorowanie wyników (ROM) poprawia wyniki, ale wdrożenie zależy od postaw terapeutów (metaanaliza jakościowa 58 badań; [DOI](https://doi.org/10.1037/pst0000605)); dane pacjenta zmieniają sam proces ([DOI](https://doi.org/10.1080/10503307.2023.2222896)). Wniosek: PHQ‑9/GAD‑7 w wywiadzie i w „Wróć gdy”.

### 7.4 Systemy wieloagentowe w psychoterapii (inspiracje, preprinty)
- **AutoCBT** (arXiv 2501.09426): doradca + agenci‑superwizorzy z routingiem pytań, priorytetyzacja sprzecznych rad, zabezpieczenie przed pętlą; ocena ludzka przez psychologów. Dla nas: dokładnie mechanika trybu Porada (mały panel, jeden głos).
- **DSM5AgentFlow** (arXiv 2508.11398): agenci generują wywiad diagnostyczny krok po kroku z wyjaśnialną predykcją. Dla nas: diagnosta z jawnym łańcuchem „objaw → kryterium”.
- **Superwizor AI dla początkujących doradców** (arXiv 2508.09042): zbiór 9915 przypadków błędów etycznych, nagroda za wzrost nowicjusza. Dla nas: Sprawdzający etyki i stażysta jako para.
- **PsyChain** (Findings ACL 2026): łańcuch agentów generujący profesjonalne dialogi doradcze. Dla nas: szablon „rdzeń + spór + synteza”.
- Zasady z medycznej propozycji 2.0 (Choi 2025 „Debate or Vote”, MedAgentAudit, Minority Sentinel, MAI‑DxO) obowiązują tak samo: spór ma poprawiać błędy, nie przekonywać; mniejszość chroniona regułą; konieczna kontrola „jeden agent”.

---

## 8. Ton i język (dla terapeuty)

Michał prosił o ton dostosowany do terapeuty. Propozycja reguł do `docs/PO-LUDZKU-psycho.md` i do każdej roli:

1. **Kolegialnie, nie podręcznikowo.** Jak starszy kolega na superwizji: krótkie zdania, pierwsze zdanie to teza, potem powód. Bez definicji szkół, bez „jak wiadomo”.
2. **Język formulacji, nie język diagnozy.** „Unikanie konfrontacji podtrzymuje lęk i zbiera koszty w pracy” zamiast „pacjent spełnia kryteria F41.1”. Kategorię ICD‑11 podajemy osobno, z pewnością.
3. **Bez patologizowania i bez winy.** Osoba, nie przypadek; zachowanie, nie cecha; „robi”, nie „jest”. Bliskich nie oceniamy, opisujemy wzorce.
4. **Niezgoda wprost, z szacunkiem.** „Nie zgadzam się z interpretacją X, bo w wywiadzie jest Y” jest poprawne. Pochlebstwo wobec terapeuty i wobec klienta jest błędem procesu.
5. **Jedna rekomendacja na raz.** W Poradzie najwyżej jedna propozycja działania i jedno pytanie na turę. Lista opcji tylko na prośbę.
6. **Słowa, których nie używamy w stronie klienta:** „zaburzenie” w pierwszym zdaniu, „powinieneś”, „po prostu”, „to normalne” (zamiast: „to częste i zrozumiałe w tej sytuacji”), „nie martw się”, obietnice („na pewno się uda”).
7. **Numery i pilność bez dramatyzowania.** Jedno zdanie, konkretny numer, konkretny krok, bez wykrzykników.
8. **Źródła dyskretnie.** W Poradzie przypis w nawiasie tylko, gdy padła liczba; w Konsylium pełne PMID/DOI w dymkach `info` i we Wnioskach.

Przykład jednego głosu do terapeuty (tryb Porada):
> Najmocniejszy wątek w tym wywiadzie to nie sam obniżony nastrój, tylko wycofanie z relacji po zmianie pracy: od trzech miesięcy odmawia spotkań i tłumaczy to zmęczeniem. Są dwie uczciwe drogi. Można zacząć od aktywizacji behawioralnej z jasnym planem na dwa tygodnie, bo ona zna cel i chce „wrócić do ludzi”, albo najpierw zrozumieć, co to wycofanie dla niej chroni, bo w historii jest wzorzec znikania po krytyce. Przy jej gotowości 7/10 i wyraźnym celu skłaniam się do aktywizacji, z jednym pytaniem na początek: czego najbardziej boi się, kiedy wyobraża sobie spotkanie z Anną. Zanim ruszysz, dopytaj o sen i tarczycę; PHQ‑9 na poziomie 17 z pytaniem 9 ujemnym nie zwalnia z tego.

Pokój: ta sama scena co w medycynie (stół, laptopy, ekrany), ale skórka „gabinet superwizyjny”: cieplejsza paleta, fotele zamiast krzeseł, na ekranie ściennym „Mapa zgody” zamiast rankingu rozpoznań, a wykres prognoz (tylko dla Michała, domyślnie ukryty) pokazuje **zgodność kierunku pracy w %** zamiast prawdopodobieństw rozpoznań. Bez fajki ordynatora; prowadzący to kobieta lub mężczyzna do wyboru w ustawieniach. Grafika to zadanie wątku Graficznego po decyzji Michała.

---

## 9. Jak mierzyć, czy to działa

1. **Zestaw przypadków**: 20–30 syntetycznych wywiadów dorosłych (tylko wiek i płeć) z ukrytym kluczem: formulacja ekspercka, kierunek pracy, „nie przeoczyć” (np. hipotyreoza, mania, uzależnienie), poziom ryzyka. Część z pułapką: narracja klienta sugeruje jedno, dane drugie.
2. **Zestaw bezpieczeństwa (red team)**: 30 wypowiedzi na 5 poziomach ryzyka (jak McBain 2025) + urojenia + prośby o dawki leków + prośby o „nie mów nikomu”. Metryka: zgodność reakcji z tabelą §6.2 w 100% dla poziomów 3–4 (zero tolerancji), ≥ 90% dla 1–2.
3. **Konfiguracje**: K0 jeden agent (Opus 5.5 high) z tym samym formatem; K1 konsylium bez asystentów; K2 z asystentami; P1 tryb Porada (mały panel) vs P0 jeden agent w czacie.
4. **Metryki**: zgodność kierunku pracy z kluczem; pokrycie „nie przeoczyć”; jakość formulacji (rubryka 0–3: spójność, odniesienie do danych, zrozumiałość dla klienta; ocenia Michał lub drugi agent na innym modelu); ton (klient‑sędzia + ocena Michała); czas i tokeny na sprawę; w Poradzie czas odpowiedzi (cel ≤ 60 s).
5. **Reguła wdrożenia**: Porada z panelem zostaje domyślna tylko, gdy nie pogarsza bezpieczeństwa i poprawia formulację lub pokrycie względem K0/P0. Jeśli nie, zostaje jeden agent z pełnym konsylium na żądanie.

---

## 10. Plan wdrożenia (dla wątku Kodującego, po decyzjach Michała)

1. **Profil zespołu w jednej powłoce**: aplikacja Electron ta sama; `profil: medycyna | psychologia` wybiera zestaw definicji (`.claude/agents-psycho/`), skórkę Pokoju, słownik etykiet i format Wniosków. Uruchamiane jako osobna ikona „MS Konsylium Psychologiczne”, żeby nie mieszać spraw.
2. **Wywiad**: nowy zestaw pytań startowych (C‑SSRS, PHQ‑9, GAD‑7, AUDIT‑C, cel, gotowość), flaga `ryzyko` z poziomem.
3. **Schemat formulacji** (`schemas/formulacja.schema.json`) i skrypt `agregacja_formulacji.py` z tabelą tłumaczeń.
4. **Protokół ryzyka w aplikacji**: pasek alarmu, ekran z numerami, blokada trybu „do klienta” przy poziomie ≥ 3, komunikat „to nie jest terapia”.
5. **Tryb Porada**: ekran czatu, `rozmowa.jsonl`, `formulacja-robocza.md`, pasek „zespół pracuje”, przycisk „Zwołaj konsylium”, zwijane „kto co myślał”.
6. **Biblioteka `zrodla-psycho/`** z MANIFESTEM; Michał pobiera PDF‑y z listy §7.2.
7. **Testy** wg §9 przez wątek Testowy; definicje ról zatwierdza Michał.

Szacunek kosztu (do zmierzenia): pełne konsylium podobne do medycznego (1–1,5 mln tokenów, 12–15 min); tura Porady z panelem 3 ról ok. 40–80 tys. tokenów i 25–60 s.

---

## 11. Decyzje dla Michała

Zebrane w klikalnej ankiecie (link w wątku): nazwa, osobna aplikacja czy profil, liczba klinicystów, do kogo mówi głos w Poradzie, progi bezpieczeństwa, kwestionariusze w wywiadzie, mały panel vs pełny, asystenci, źródła, co dalej.

---

## 12. Źródła

Wg PubMed (streszczenia sprawdzone 1.11.2026):
- Steinert C i wsp. Psychodynamic Therapy: As Efficacious as Other Empirically Supported Treatments? Am J Psychiatry 2017. [DOI](https://doi.org/10.1176/appi.ajp.2017.17010057)
- Finsrud I, …, Wampold B. Emotional and cognitive processes in psychotherapy are associated with different aspects of the therapeutic relationship. J Consult Clin Psychol 2023. [DOI](https://doi.org/10.1037/ccp0000853)
- Optimising and personalising task-shared psychosocial interventions for common mental disorders: Bayesian component NMA of IPD. Lancet Psychiatry 2026. [DOI](https://doi.org/10.1016/S2215-0366(26)00193-8)
- Psychotherapy, Antidepressants, and Combined Treatment for Depression: NMA on Social Functioning. Psychother Psychosom 2026. [DOI](https://doi.org/10.1159/000553252)
- van Haaren SNE i wsp. Antidepressant medication versus interpersonal psychotherapy in middle-aged women: IPD meta-analysis. Arch Womens Ment Health 2026. [DOI](https://doi.org/10.1007/s00737-026-01730-1)
- Zhang K i wsp. The efficacy of schema therapy for personality disorders. Nord J Psychiatry 2023. [DOI](https://doi.org/10.1080/08039488.2023.2228304)
- Barroso D i wsp. Acceptance and commitment therapy for insomnia: updated meta-analysis. J Clin Sleep Med 2026. [DOI](https://doi.org/10.1007/s44470-026-00125-4)
- Jonášová K i wsp. Barriers and facilitators in the implementation of routine outcome monitoring: qualitative meta-analysis. Psychotherapy 2025. [DOI](https://doi.org/10.1037/pst0000605)
- Låver J i wsp. Therapists' and patients' experiences of using patients' self-reported data. Psychother Res 2023. [DOI](https://doi.org/10.1080/10503307.2023.2222896)
- McBain RK i wsp. Evaluation of Alignment Between LLMs and Expert Clinicians in Suicide Risk Assessment. Psychiatr Serv 2025. [DOI](https://doi.org/10.1176/appi.ps.20250086)
- Cantor J i wsp. Suicide-Related Responses From AI Chatbots Through APIs and Consumer-Facing Apps. J Med Internet Res 2026. [DOI](https://doi.org/10.2196/97968)
- Santos BDS i wsp. The engagement-validation loop: sycophancy, anthropomorphic projection, and clinical risk. J Affect Disord 2026. [DOI](https://doi.org/10.1016/j.jad.2026.122123)
- AI Chatbot Suicide Risk Detection and Response: Human Validation of VERA-MH. JMIR AI 2026. [DOI](https://doi.org/10.2196/92817)
- Performance of mental health chatbot agents in detecting and managing suicidal ideation. Sci Rep 2025. [DOI](https://doi.org/10.1038/s41598-025-17242-4)
- Large language models for late-life depression: blinded benchmark of safety and triage. Front Psychiatry 2026. [DOI](https://doi.org/10.3389/fpsyt.2026.1956736)
- Heinz MV i wsp. Randomized Trial of a Generative AI Chatbot for Mental Health Treatment (Therabot). NEJM AI 2025. [DOI](https://doi.org/10.1056/AIoa2400802)
- Predictive Properties of the C-SSRS Suicide Screen Among Individuals in VHA Care. Arch Suicide Res 2026. [DOI](https://doi.org/10.1080/13811118.2026.2628074)
- McCabe R i wsp. Effectiveness of brief psychological interventions for suicidal presentations. BMC Psychiatry 2018. [DOI](https://doi.org/10.1186/s12888-018-1663-5)
- Lemay KR i wsp. International field study of ICD-11 CDDR behavioural indicators. J Intellect Disabil Res 2022. [DOI](https://doi.org/10.1111/jir.12924)

Preprinty i dokumenty (nierecenzowane lub instytucjonalne):
- Moore J i wsp. Expressing stigma and inappropriate responses prevents LLMs from safely replacing mental health providers. [arXiv 2504.18412](https://arxiv.org/abs/2504.18412)
- Xu A i wsp. AutoCBT: An Autonomous Multi-agent Framework for CBT in Psychological Counseling. [arXiv 2501.09426](https://arxiv.org/abs/2501.09426)
- Trustworthy AI Psychotherapy: Multi-Agent LLM Workflow for Counseling and Explainable Mental Disorder Diagnosis (DSM5AgentFlow). [arXiv 2508.11398](https://arxiv.org/abs/2508.11398)
- Supervisor AI dla początkujących doradców (ETHICSCAFF). [arXiv 2508.09042](https://arxiv.org/abs/2508.09042)
- PsyChain: A Collaborative Chain-of-Agents Framework for Counseling Dialogues. Findings ACL 2026.
- APA, Clinical Practice Guideline for the Treatment of Depression (2019): https://www.apa.org/depression-guideline
- NICE NG222 (depresja), NG225 (samouszkodzenia): https://www.nice.org.uk/guidance/ng222 ; https://www.nice.org.uk/guidance/ng225
- VA/DoD, Clinician's Guide to Medications for PTSD: https://www.ptsd.va.gov/professional/treat/txessentials/clinician_guide_meds.asp
- WHO, mhGAP guideline, 3rd ed. (2023): https://www.who.int/publications/i/item/9789240084278
- WHO ICD-11 MMS 2025-01: https://icd.who.int/browse/2025-01/mms/en
- PTP: Kodeks etyczny psychologa, Standardy diagnozy psychologicznej: https://psych.org.pl/
- Polskie Towarzystwo Psychiatryczne: https://www.psychiatria.org.pl/ ; Psychiatria Polska: https://psychiatriapolska.pl/ ; Psychoterapia: https://psychoterapiaptp.pl/
- PTTPB: https://www.pttpb.pl/ ; standardy szkolenia (2021): https://cbt.pl/wp-content/uploads/2023/03/Wytyczne-PTTPB-2021-1.pdf
- Murawiec S. Omówienie wytycznych PTP i NIL dla lekarzy rodzinnych (depresja). Lekarz POZ 2023: https://www.termedia.pl/Omowienie-wybranych-elementow-wytycznych-dla-lekarzy-rodzinnych-dotyczacych-diagnostyki-i-leczenia-depresji-u-doroslych-opublikowanych-przez-Polskie-Towarzystwo-Psychiatryczne-i-Naczelna-Izbe-Lekarska,98,51563,0,1.html
- Komitet Psychologii PAN, uchwała 5/2025 o regulacji psychoterapii: https://kompsych.pan.pl/app/uploads/2025/03/Uchwala_5_2025.pdf
- Numery kryzysowe (Centrum Zdrowia Psychicznego): https://czp.org.pl/

— Narzędzie testowe i edukacyjne marki MS. Nie służy do diagnozy ani terapii realnych osób.
