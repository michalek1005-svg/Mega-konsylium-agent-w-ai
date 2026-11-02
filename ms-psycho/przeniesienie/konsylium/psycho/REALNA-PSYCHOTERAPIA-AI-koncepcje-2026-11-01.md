# Psychoterapia AI bliższa prawdziwej terapii – koncepcje rozwoju (wersja 0.1.9 → dalej)

Wątek „Rola: Innowacyjny – realniejsza psychoterapia AI”, 1.11.2026 ~20:30, na polecenie Michała („jak sprawić, by była realna bardziej?”).
Punkt wyjścia: wersja 0.1.9 (konta i pamięć, szybka odpowiedź wstępna, pełna opinia zespołu jednym głosem, zasady języka z `docs/SZTUKA-ROZMOWY.md`, ścieżka kryzysowa). Właściciel kodu: wątek Psychologa – ten plik niczego w kodzie nie zmienia.
Źródła: PubMed przez konektor (streszczenia sprawdzone `get_article_metadata`), numery PMID/DOI w §7. Europe PMC był dziś niedostępny (limit zapytań) – dwie prace, których tam szukano, są oznaczone jako NIEPOTWIERDZONE i nie wchodzą do uzasadnień.
— Narzędzie testowe marki MS. Nie zastępuje psychoterapeuty. Tylko dorośli.

## 0. Diagnoza: czym dziś różni się Psychoterapia AI od prawdziwej terapii

Wersja 0.1.9 rozmawia już „jak terapeuta” (język, jedno pytanie, odzwierciedlenia, brak banałów). To, co nadal odróżnia ją od realnej terapii, nie leży w pojedynczych zdaniach, tylko w **ramie i ciągłości**:

| Prawdziwa terapia | Psychoterapia AI 0.1.9 |
|---|---|
| Ma **sesje**: początek, agendę, pracę, zamknięcie, umówiony następny termin. | Jeden niekończący się czat; każda wiadomość to „tura”. |
| Między sesjami jest **zadanie** i terapeuta w następnej sesji o nie pyta. | Krok „do następnej rozmowy” pada w tekście i znika. |
| Terapeuta **pamięta narrację** (słowa osoby, metafory, wątki otwarte) i sam do nich wraca. | `pamiec.md` to lista faktów; nawiązanie jest jedno, w turze 1. |
| Terapeuta **słucha więcej niż mówi**, robi pauzy, czasem tylko „mhm, mów dalej”. | Każda wiadomość dostaje pełną, zbudowaną odpowiedź. |
| Techniki są **prowadzone krok po kroku** w sesji (zapis myśli, eksperyment, plan tygodnia). | Technika jest opisana w jednym akapicie jako rada. |
| Terapeuta **zauważa wzorce i je nazywa**, ma zdanie, czasem delikatnie konfrontuje. | Terapeuta AI głównie reaguje na ostatnią wiadomość. |
| Jest **wspólny cel** i co jakiś czas pytanie „czy idziemy w dobrą stronę?”. | Cel jest w formulacji roboczej, niewidoczny dla osoby. |
| Osoba wybiera terapeutę, który jej **pasuje**; terapeuta ma spójny styl. | Styl zależy od modelu i tury. |
| Terapia ma **koniec** i zasady kontaktu między sesjami. | Dostępność 24/7 bez ramy – sprzyja zależności zamiast samodzielności. |

Stąd kierunek: **nie „lepsze zdania”, tylko rama sesji, zadania, pamięć narracyjna, tempo, techniki prowadzone, cel i informacja zwrotna.** Dowody, że to właśnie te elementy robią różnicę, są w §7 (sojusz r≈0,28; zadania domowe – jakość wykonania g=0,78; dwie sesje w tygodniu lepsze niż jedna; informacja zwrotna – mniej przerwanych terapii; naprawa pęknięć r=0,29; dopasowanie do preferencji – o 44% mniej rezygnacji; ekspresja emocji klienta d=0,85).

## 1. Ranking: wpływ × koszt

Wpływ = jak bardzo zbliża do realnej terapii (W1–W3). Koszt = prompt/dokumentacja (K1), skrypt + mała zmiana UI (K2), nowy moduł UI lub maszyna stanów (K3). Czas w wieczorach wątku Psychologa.

| # | Koncepcja | Wpływ | Koszt | Kolejność |
|---|---|---|---|---|
| 1 | **Sesja z ramą**: otwarcie–agenda–praca–zamknięcie–następny termin; tryb „sesja” obok „swobodnej rozmowy” | W3 | K2 | 1 |
| 2 | **Zadanie między sesjami z prawdziwym powrotem** (karta, odhaczenie, „jak poszło?”) | W3 | K2 | 2 |
| 3 | **Dwa suwaki po sesji** (jak Ci dziś 0–10; czy rozmowa była o tym, o czym chciałaś 0–10) → naprawa pęknięć | W3 | K2 | 3 |
| 4 | **Pamięć narracyjna i nawiązania** (słowa osoby, wątki otwarte, co działało; 1 nawiązanie na sesję; zakaz zmyślania wspomnień) | W3 | K1–K2 | 4 |
| 5 | **Tempo słuchania**: krótkie zachęty („mhm, mów dalej”), czekanie, gdy osoba jeszcze pisze; limit udziału terapeuty w słowach | W2 | K1–K2 | 5 |
| 6 | **Obserwacje terapeuty** (1 zauważony wzorzec na sesję, z historii i pamięci; zdanie własne) | W2 | K1 | 6 |
| 7 | **Ćwiczenia prowadzone krok po kroku** (6 protokołów, 4–8 tur, zawsze z wyjściem) | W3 | K3 | 7 |
| 8 | **Cel pracy jako widoczna karta** („Nad czym pracujemy”, 0–10 co 4 sesje, edytowalna) | W2 | K2 | 8 |
| 9 | **Karta terapeuty**: imię i styl wybierany przy zakładaniu konta (2–3 do wyboru), stały między sesjami | W2 | K2 | 9 |
| 10 | **Superwizja człowieka**: Michał (docelowo psycholog) czyta streszczenie sesji i zostawia notatkę, którą terapeuta AI uwzględnia | W2 | K2 | 10 |
| 11 | **Pomiar realizmu** (skrypt: udział słów, pytania na turę, nawiązania, powroty do zadań, suwaki, naprawy pęknięć) | W2 | K2 | 11 |
| 12 | **Dziennik między sesjami** („co chcę poruszyć”, nastrój 1 kliknięciem) + 1 przypomnienie dziennie | W2 | K3 | 12 |
| 13 | **Praca z emocją tu-i-teraz** („co czujesz teraz, gdy to piszesz?”, zwolnienie tempa) | W2 | K1 | 13 |
| 14 | **Głos** (dyktowanie w Safari na iPadzie, opcjonalnie czytanie odpowiedzi głosem systemowym) | W2 | K2 (test na iPadzie) | 14 |
| 15 | **Plan zakończenia i sesje przypominające** (po 8–12 sesjach rozmowa o zakończeniu; „booster” co 4 tygodnie) | W1 | K1 | 15 |
| 16 | **Uważność na porę i rytm** (nocne pisanie → łagodna uwaga o śnie, nie formularz) | W1 | K1 | 16 |

**Polecany pakiet na wersję 0.2.0:** pozycje 1–6 (wszystkie K1–K2, razem ok. 2 wieczory). Wersja 0.3.0: 7–11. Reszta po pierwszych prawdziwych sesjach.

## 2. Koncepcje 1–6 (pakiet 0.2.0) – szczegóły

### 2.1 Sesja z ramą
**Co.** Przycisk „Zacznij sesję” obok zwykłego pola (swobodna rozmowa zostaje – Michał chce też pytań o konkretne sytuacje). Sesja ma cztery części, prowadzący pilnuje ich jak zegara:
1. **Otwarcie (1–2 tury):** most do poprzedniej sesji („Ostatnio umówiliśmy się na … – jak poszło?”) i agenda („O czym dziś najważniejsze?”). Jeśli jest zadanie (§2.2), zaczyna od niego.
2. **Praca (główna część):** jeden temat, rozumienie → technika za zgodą.
3. **Zamknięcie (2 tury):** podsumowanie w 2–3 zdaniach, jedno zadanie, dwa suwaki (§2.3), „otwarte drzwi”.
4. **Następny termin:** osoba wybiera dzień z listy (jutro / za 2 dni / za tydzień / sama powiem). Aplikacja pokazuje go na karcie konta.

Sesja kończy się po ok. 35–45 minutach albo 12–16 turach – prowadzący dostaje od `czekaj` licznik tur i czas; w ostatnich 2 turach przechodzi do zamknięcia (bez sztywnego ucinania; przy ryzyku ≥2 sesja nie kończy się „z zegara”).
**Dlaczego.** Struktura sesji to wspólny element wszystkich szkół; dwie sesje tygodniowo działały lepiej niż jedna (Bruijniks 2020), a pojedyncza, domknięta sesja daje mierzalny efekt (Schleider 2025, SMD −0,25) – czyli każda sesja powinna coś zamykać. Rama ogranicza też niekończący się czat, który w badaniach nad chatbotami wiąże się z ryzykiem zależności (Zhang 2025, §7).
**Koszt.** `rozmowa.py sesja start|koniec` (zapis do `meta.json`: `sesja`, `tura_w_sesji`, `nastepny_termin`), `czekaj` wypisuje fazę; prompt prowadzącego. UI: przycisk, pasek fazy („Otwarcie · Praca · Zamknięcie”), karta terminu.

### 2.2 Zadanie między sesjami z prawdziwym powrotem
**Co.** Na zamknięciu prowadzący proponuje **jedno** zadanie, konkretne i małe („W środę wieczorem 10 minut spaceru bez telefonu”), a osoba je akceptuje, zmienia albo odrzuca (przyciski: „Biorę”, „Zmieńmy”, „Nie teraz”). Zadanie trafia na kartę „Do następnej rozmowy” w oknie rozmowy, z odhaczeniem i polem „jak było” (1 zdanie, opcjonalnie). Następna sesja zaczyna się od niego: udało się → wzmocnienie i wnioski; nie udało się → bez oceny, szukanie przeszkody („co stanęło na drodze?”), ewentualnie mniejsze zadanie.
**Dlaczego.** W CBT jakość wykonania zadań wiąże się z wynikiem g=0,78, ilość g≈0,5 (Kazantzis 2016). Zadanie bez powrotu nie istnieje – prawdziwy terapeuta zawsze pyta.
**Koszt.** Pole `zadanie` w `odp.json` → `zadania.json` w rozmowie; `rozmowa.py zadanie --status`; `czekaj` wypisuje otwarte zadanie na początku sesji. UI: karta nad polem pisania. Reguła w promptach: zadanie proponowane tylko w zamknięciu i tylko jedno; skrypt odrzuca drugie.

### 2.3 Dwa suwaki po sesji i naprawa pęknięć
**Co.** Po zamknięciu aplikacja pokazuje dwa suwaki 0–10 (bez nazwy skali): „Jak się dziś czujesz?” i „Czy ta rozmowa była o tym, o czym chciałaś?”. Wyniki idą do `pamiec.md` (wykres w panelu „Co pamiętam”). Spadek drugiego suwaka ≤6 albo spadek o ≥3 → następna sesja zaczyna się od naprawy („Ostatnio ta rozmowa nie była o tym, o czym chciałaś. Co powinniśmy zrobić inaczej?”). W trakcie sesji **wykrywacz pęknięć** (skrypt, bez modelu): nagłe skrócenie odpowiedzi po dłuższych, „ok”, „nieważne”, „nie rozumiesz”, „to nic nie daje”, ironia, cisza >2 min po pytaniu → `czekaj` wypisuje PĘKNIĘCIE i prowadzący stosuje §4 pkt 11 z `SZTUKA-ROZMOWY.md` (nazwij, weź na siebie, zmień kurs).
**Dlaczego.** Informacja zwrotna w trakcie terapii = mniej przerwanych terapii i mały efekt na objawy (de Jong 2021, d=0,15); naprawa pęknięć r=0,29, nienaprawione pęknięcia r=−0,21 (Eubanks 2018).
**Koszt.** UI: dwa suwaki po „koniec sesji”; skrypt: wykrywacz w `czekaj`; prompt: scenariusz naprawy.

### 2.4 Pamięć narracyjna i nawiązania
**Co.** `pamiec.md` dostaje stałe sekcje: **Własne słowa osoby** (metafory, nazwy, które nadała: „ściana”, „tryb przetrwania”), **Wątki otwarte** (niezamknięte tematy), **Co pomaga / co nie**, **Ważne osoby** (bez nazwisk), **Cel i ostatnie zadanie**, **Suwaki** (daty i wartości), **Jak lubi rozmawiać**. Prowadzący ma w każdej sesji **jedno** nawiązanie poza turą 1 („Pamiętasz, jak nazwałaś to ścianą? Czy dziś to też ściana?”). Twarda zasada: **nie wolno wspominać niczego, czego nie ma w `pamiec.md` ani w historii** – skrypt sprawdza frazy „pamiętam, że…”, „mówiłaś, że…”, „ostatnio…” i ostrzega, gdy cytowany fragment nie pasuje do pamięci (proste dopasowanie słów kluczowych).
**Dlaczego.** Poczucie bycia pamiętanym to rdzeń sojuszu (Flückiger 2020, r=0,28); w badaniu Therabota użytkownicy ocenili sojusz z chatbotem jak z terapeutą właśnie dzięki personalizacji (Heinz 2025). Zmyślone wspomnienie niszczy zaufanie bardziej niż brak wspomnienia.
**Koszt.** Nowy szablon `pamiec.md`, prompt prowadzącego, kontrola w `rozmowa.py odpowiedz`.

### 2.5 Tempo słuchania
**Co.** Trzy reguły:
- **Osoba jeszcze pisze:** jeśli wiadomość kończy się wielokropkiem, bez kropki, albo przyszły 2+ wiadomości w ciągu 60 s – `czekaj` czeka jeszcze 45 s i dopiero wtedy oddaje turę (zamiast odpowiadać na pół myśli).
- **Krótka zachęta zamiast odpowiedzi:** gdy osoba jest w środku opowieści (długa wiadomość narracyjna, bez pytania, ryzyko 0), prowadzący może odpowiedzieć **jednym zdaniem** („Mhm. Mów dalej – co było potem?”, „Słyszę. I co wtedy?”) i nie uruchamiać panelu. Najwyżej 2 takie zachęty z rzędu. To osobne tempo „słucham” w tabeli §3a `ROZMOWA.md`.
- **Udział słów:** w sesji terapeuta AI nie powinien mieć więcej niż ~40% słów. Skrypt liczy to w locie; od 50% `czekaj` wypisuje „ZA DUŻO MÓWISZ” i prowadzący skraca.
**Dlaczego.** Ekspresja emocji klienta wiąże się z wynikiem d=0,85 (Peluso i Freund 2018) – żeby mogła się pojawić, terapeuta musi zostawić miejsce. Chatbot ma odwrotny nawyk: odpowiedzi 4× dłuższe niż lekarzy (Ayers 2023).
**Koszt.** `czekaj` (odczekanie, licznik słów), tabela temp, prompt. Bez UI.

### 2.6 Obserwacje terapeuty
**Co.** Raz na sesję (najwcześniej w 3. sesji) zespół w tle dostaje pytanie: „Jaki wzorzec widać w tej i poprzednich rozmowach, którego osoba sama nie nazwała?” Prowadzący wybiera jeden i mówi go **tentatywnie, ze zdaniem własnym** („Zauważam, że za każdym razem, gdy mówisz o pracy, w tej samej wiadomości pojawia się mama. Możliwe, że to dwa osobne tematy, które się sklejają. Co o tym myślisz?”). To realizuje życzenie Michała o „autentycznych poradach” i zdaniu własnym, bez diagnozowania (żadnych etykiet, mechanizmów, kodów).
**Dlaczego.** To, czego osoba sama nie widzi, jest tym, po co przychodzi do terapeuty; pytania sokratejskie i nazywanie wzorców działają przez zmianę myślenia (Behav Res Ther 2022, PMID 35016095).
**Koszt.** Jedno pytanie w promptach panelu + pole `obserwacja` w `odp.json`; limit 1/sesję w skrypcie.

## 3. Koncepcje 7–11 (wersja 0.3.0)

### 3.1 Ćwiczenia prowadzone krok po kroku
Sześć protokołów jako maszyny stanów (4–8 tur, każdy krok = jedno pytanie, osoba zawsze może przerwać „nie teraz”): **zapis myśli** (sytuacja → myśl → emocja 0–100 → dowody za/przeciw → myśl alternatywna → emocja ponownie), **eksperyment behawioralny** (przewidywanie → plan → co uznam za wynik), **plan aktywności** (3 rzeczy z sensem na tydzień, z dniem i godziną), **uziemienie 5‑4‑3‑2‑1** (przy silnym napięciu), **karta wartości** (ACT: co jest ważne → jeden krok w tę stronę), **analiza łańcuchowa** (co było przed → impuls → zachowanie → skutek → gdzie przerwać). Wynik ćwiczenia zapisuje się jako karta w rozmowie i w pamięci. Prowadzący proponuje ćwiczenie tylko za zgodą (ask–offer–ask) i tylko w fazie „praca”.
**Dowody:** komponenty rozwiązywania problemów i aktywizacji behawioralnej są najskuteczniejsze także w samopomocy bez przewodnika (Sakata 2026, OR 0,25); jakość wykonania zadań (Kazantzis 2016). **Koszt K3:** `cwiczenia/*.json` z krokami, stan w `meta.json`, UI z kartą wyniku. Można zacząć od dwóch: zapis myśli i plan aktywności.

### 3.2 Cel pracy jako widoczna karta
„Nad czym pracujemy” – zdanie słowami osoby, uzgodnione w sesji 1–2, widoczne nad rozmową, edytowalne przez osobę. Co 4 sesje: „Na ile jesteśmy bliżej (0–10)? Czy cel nadal ten sam?”. Dowód: zgoda co do celu r=0,34 (Tryon 2011, PMID 21401274). Koszt K2: pole `cel` w `pamiec.md` + karta.

### 3.3 Karta terapeuty
Przy zakładaniu konta osoba wybiera jedną z 2–3 kart: np. **„Spokojna, pytająca”** (więcej odzwierciedleń, wolniejsze tempo, rzadziej rady), **„Bezpośredni, konkretny”** (krótko, wprost, szybciej do zadania), **„Ciepło i z humorem”** (lżejszy rejestr, emotikony). Karta = imię, 3 cechy stylu, 3 ulubione zwroty, czego nie robi; stała między sesjami; można zmienić w ustawieniach (terapeuta AI wtedy sam to nazywa: „Od dziś będę bardziej bezpośrednia, tak jak chciałaś”). Zespół w tle bez zmian – zmienia się tylko głos. Dowód: dopasowanie do preferencji klienta = mniej rezygnacji (OR 1,79) i lepszy wynik d=0,28 (Swift 2018). Koszt K2: `konta/<konto>/terapeuta.json`, prompt prowadzącego czyta kartę. Uwaga: bez biografii i bez udawanych uczuć (zasada z `SZTUKA-ROZMOWY.md` §4 pkt 10 zostaje).

### 3.4 Superwizja człowieka
Po każdej sesji skrypt pisze `superwizja/<sesja>.md` (streszczenie 10 zdań, suwaki, ryzyko, zadanie, co terapeuta AI zrobił dobrze/źle wg klienta‑sędziego). Michał (docelowo psycholog) może dopisać **notatkę superwizora** (2–3 zdania: „za szybko do rad; wróć do tematu siostry”), którą `czekaj` wypisuje przed następną sesją. Dowód: interwencje cyfrowe z udziałem człowieka g=0,63 vs bez g=0,34 (Moshe 2021); przewodnik pomaga najbardziej przy PHQ‑9 >9 (Karyotaki 2021). To też odpowiedź na wniosek z `PSYCHO-SIEC-AGENTOW.md` §4.5: poziom „nadzór człowieka”, nie autonomia. Koszt K2.

### 3.5 Pomiar realizmu (skrypt `realizm.py`)
Po sesji liczy: udział słów terapeuty (cel ≤40%), pytania na turę (cel ≤1), nawiązania do pamięci (cel 1–2/sesję, 0 zmyślonych), powroty do zadań (cel 100%), suwaki (średnia i trend), wykryte i naprawione pęknięcia, odsetek tur „słucham”, długość sesji. Raport w `narzedzia/psycho/REALIZM-<data>.md`; Testowy porównuje 5 sesji przed i po 0.2.0. Osobno **ślepa ocena**: sędzia na innym modelu (Opus, gdy terapeuta na Fable) dostaje 2 transkrypty bez etykiet i ocenia „który bardziej przypomina sesję z człowiekiem i dlaczego” – 10 par na wersję.

## 4. Koncepcje 12–16 (później)
- **Dziennik między sesjami (K3):** jedno kliknięcie nastroju dziennie + pole „chcę o tym pogadać”; terapeuta AI **nie odpowiada** między sesjami (poza kryzysem – ścieżka bez zmian), ale otwiera następną sesję od tych notatek. Jedno przypomnienie dziennie, wyłączalne. Przeglądy interwencji „w porę” pokazują, że to wciąż wczesne stadium (van Genugten 2025: 5 interwencji, małe próby) – zatem wersja minimalna, bez algorytmu.
- **Praca z emocją tu‑i‑teraz (K1):** przy silnym temacie pytanie o to, co osoba czuje **teraz, pisząc**, i gdzie w ciele; mniej słów, wolniej (zgodne z `SZTUKA-ROZMOWY.md` §4 pkt 12; dowód d=0,85 Peluso 2018).
- **Głos (K2):** dyktowanie w Safari na iPadzie (wbudowane w klawiaturę, bez kodu) + opcjonalne czytanie odpowiedzi głosem systemowym (`speechSynthesis`, offline). Wymaga testu Operatora na iPadzie; brak badań porównujących głos z tekstem w PubMed (0 trafień) – oceniać po próbie.
- **Plan zakończenia (K1):** po 8–12 sesjach prowadzący sam porusza temat zakończenia lub rzadszych spotkań; sesja przypominająca co 4 tygodnie. Przeciwwaga dla zależności od chatbota (Zhang 2025 ostrzega przed ryzykiem; list o pętli pochlebstwa PMID 42269974).
- **Pora i rytm (K1):** trzecia nocna rozmowa z rzędu → jedno zdanie o śnie, bez formularza.

## 5. Jak wyglądałaby jedna sesja po 0.2.0 (próba na sucho, PSY‑03, 4. sesja)

> **[Zacznij sesję]** 
> **Terapeutka:** Dobrze Cię widzieć. Ostatnio umówiłyśmy się, że w środę wyjdziesz na 10 minut bez telefonu. *[karta: Zadanie – ☐ Zrobione]* Jak poszło? 
> **Osoba:** nie wyszłam, padało i w ogóle nie miałam siły 
> **Terapeutka:** Rozumiem. Nie chodzi o to, że się nie udało – chodzi o to, co stanęło na drodze. Brak siły był przed deszczem czy po nim? 
> **Osoba:** przed. cały tydzień taki. w pracy znowu to samo co wtedy z szefową, a w domu mama dzwoni codziennie i pyta czemu jeszcze nie mam dzieci… 
> **Terapeutka:** Mhm. Mów dalej. *(tempo „słucham”, bez panelu)* 
> **Osoba:** [długa wiadomość] 
> **Terapeutka:** *(obserwacja, 1/sesję)* Zauważam coś – popraw mnie, jeśli źle trafiam. W zeszłym tygodniu nazwałaś to „ścianą”. Dziś, kiedy mówisz o pracy, w tej samej wiadomości od razu pojawia się mama. Możliwe, że to dwie osobne ściany, które sklejają się w jedną i dlatego nie ma siły na żadną. Która jest dziś cięższa? 
> **Osoba:** mama chyba 
> **Terapeutka:** To zostańmy przy mamie. Jeśli chcesz, mam jeden pomysł na dzisiejszą rozmowę: zapiszemy razem, co dokładnie dzieje się w Tobie, gdy dzwoni – krok po kroku, to zajmie kilka minut. Pasuje? *(ćwiczenie „zapis myśli” – w 0.3.0; w 0.2.0 prowadzący robi to bez maszyny stanów)* 
> … *(praca)* … 
> **Terapeutka:** *(zamknięcie)* Dziś zobaczyłyśmy, że po telefonie mamy najmocniejsza jest myśl „zawodzę wszystkich”, a nie złość. Zadanie na ten tydzień – jedno, małe: gdy zadzwoni, po rozmowie zapisz jedno zdanie, co pomyślałaś. Bierzesz? *[Biorę · Zmieńmy · Nie teraz]* 
> *[Suwaki: Jak się dziś czujesz? 4/10 · Czy rozmowa była o tym, o czym chciałaś? 8/10]* 
> **Terapeutka:** Dziękuję. Kiedy następnym razem? *[jutro · za 2 dni · za tydzień · sama powiem]* 

Co tu jest „realne”, a nie było w 0.1.9: powrót do zadania bez oceny, słuchanie bez odpowiadania, jedno nawiązanie do własnych słów osoby („ściana”), jedno spostrzeżenie ze zdaniem własnym, zgoda przed techniką, zamknięcie z jednym zadaniem, informacja zwrotna i termin.

## 6. Pre‑mortem: co może pójść źle i jak temu zapobiec

| Ryzyko | Zapobieganie |
|---|---|
| Rama sesji wydaje się sztywna, osoba chce po prostu zapytać o sytuację | Tryb swobodnej rozmowy zostaje domyślny; sesja na przycisk; prowadzący może zaproponować sesję, gdy temat jest większy. |
| Wykrywacz pęknięć fałszywie reaguje na krótkie „ok” u osoby, która pisze krótko | Linia bazowa z pierwszych 10 wiadomości osoby; alarm tylko przy odchyleniu od jej własnego stylu. |
| Zmyślone nawiązanie do pamięci | Kontrola w `odpowiedz` (§2.4); klient‑sędzia dostaje `pamiec.md` i punkt „czy nawiązanie jest prawdziwe?”. |
| Dłuższe sesje = więcej tokenów i czasu | Tempo „słucham” i krótsze odpowiedzi kompensują; licznik tur zamyka sesję. Mierzyć kosztem na sesję przed/po. |
| Suwaki traktowane jak „ocena aplikacji” | Pytania bez nazwy skali, ton rozmowy, wynik widoczny osobie w „Co pamiętam” jako jej własny wykres. |
| Karta terapeuty przeradza się w fikcyjną osobę | Karta to styl, nie biografia; zakazy z `SZTUKA-ROZMOWY.md` §4 pkt 10 bez zmian; sędzia sprawdza. |
| Zależność od codziennych sesji | Termin wybiera osoba, ale prowadzący od 3. sesji z rzędu dzień po dniu proponuje odstęp; plan zakończenia (§4). |
| Bezpieczeństwo | Nic z powyższego nie zmienia ścieżki kryzysowej: ryzyko ≥2 wyłącza tempo „słucham” i zamknięcie „z zegara”; strażnik zawsze pierwszy. |

## 7. Źródła (PubMed, sprawdzone streszczeniem 1.11.2026)

| Teza | Praca | PMID | DOI |
|---|---|---|---|
| Pierwsze RCT generatywnego chatbota terapeutycznego (Therabot, N=210): depresja d≈0,85–0,90, lęk d≈0,79–0,84; sojusz oceniany jak z terapeutą; >6 h użycia | Heinz MV i wsp., NEJM AI 2025 | 42932588 | 10.1056/AIoa2400802 |
| Metaanaliza 14 RCT chatbotów generatywnych: ES=0,30 (PI −0,85…1,67); chatboty „społeczne” skuteczniejsze niż zadaniowe; ostrzeżenie o ryzykach | Zhang Q i wsp., J Med Internet Res 2025 | 41401240 | 10.2196/78238 |
| Dwie sesje tygodniowo lepsze niż jedna (CBT/IPT, N=200) | Bruijniks SJE i wsp., Br J Psychiatry 2020 | 32029012 | 10.1192/bjp.2019.265 |
| Interwencje jednosesyjne: SMD −0,25 w 12 przeglądach, 415 prób | Schleider JL i wsp., Annu Rev Clin Psychol 2025 | 39874601 | 10.1146/annurev-clinpsy-081423-025033 |
| Zadania domowe w CBT: jakość wykonania g=0,78, ilość g≈0,5 | Kazantzis N i wsp., Behav Ther 2016 | 27816086 | 10.1016/j.beth.2016.05.002 |
| Interwencje cyfrowe w depresji (83 RCT): z udziałem człowieka g=0,63 vs samopomoc g=0,34 | Moshe I i wsp., Psychol Bull 2021 | 34898233 | 10.1037/bul0000334 |
| iCBT z przewodnikiem vs bez (IPD, 9751 osób): przewaga przewodnika przy PHQ‑9 >9 | Karyotaki E i wsp., JAMA Psychiatry 2021 | 33471111 | 10.1001/jamapsychiatry.2020.4364 |
| Dopasowanie do preferencji klienta: mniej rezygnacji OR 1,79, wynik d=0,28 (53 badania) | Swift JK i wsp., J Clin Psychol 2018 | 30091140 | 10.1002/jclp.22680 |
| Ekspresja emocji: terapeuty d=0,56, klienta d=0,85 | Peluso PR, Freund RR, Psychotherapy 2018 | 30335458 | 10.1037/pst0000165 |
| Odpowiedzi chatbota 4× dłuższe niż lekarzy, oceniane jako bardziej empatyczne – przestroga przed „ścianą tekstu” | Ayers JW i wsp., JAMA Intern Med 2023 | 37115527 | 10.1001/jamainternmed.2023.1838 |
| Komponenty CBT w prewencji: rozwiązywanie problemów + aktywizacja, także w samopomocy (OR 0,25) | Sakata M i wsp., Behav Res Ther 2026 | 41564645 | 10.1016/j.brat.2026.104960 |
| Interwencje „w porę” (JITAI) w zdrowiu psychicznym: 5 interwencji, wczesne stadium | van Genugten CR i wsp., Front Digit Health 2025 | 39935463 | 10.3389/fdgth.2025.1460167 |
| Już w `SZTUKA-ROZMOWY.md`: sojusz r=0,28 (Flückiger 2020, PMID 32212755); naprawa pęknięć r=0,29 (Eubanks 2018, PMID 30335462); informacja zwrotna d=0,15, mniej przerwań (de Jong 2021, PMID 33721605); pytania sokratejskie (PMID 35016095); zgoda co do celu r=0,34 (PMID 21401274); pochlebstwo AI (PMID 42269974); plan bezpieczeństwa (Stanley 2018, PMID 29998307) | | | |

**NIEPOTWIERDZONE dziś (Europe PMC niedostępny – limit zapytań):** Hatch i wsp. 2025, PLOS Mental Health („When ELIZA meets therapists” – odpowiedzi ChatGPT vs terapeutów) oraz Lucas i wsp. 2014 (wirtualny rozmówca a gotowość do zwierzeń). Nie cytować, dopóki ktoś nie sprawdzi.

## 8. Co z tego idzie do Psychologa (polecane, w tej kolejności)

1. `docs/ROZMOWA.md`: nowy §0c „Sesja” (fazy, licznik tur, termin), tempo „słucham” w §3a, pole `zadanie` i `obserwacja` w `odp.json`, reguła 1 nawiązanie/sesję i zakaz zmyślania wspomnień, scenariusz naprawy po suwakach.
2. `skrypty/rozmowa.py`: `sesja start|koniec`, `zadanie`, odczekanie na „jeszcze pisze”, licznik udziału słów, wykrywacz pęknięć, kontrola nawiązań.
3. `pamiec.md`: nowy szablon z sekcjami (§2.4) – zgodny z zasadą „bez danych identyfikujących, bez diagnoz”.
4. UI: przycisk „Zacznij sesję”, pasek fazy, karta zadania z trzema przyciskami, dwa suwaki na zamknięciu, lista terminów.
5. `prowadzacy.md`: sekcja „Sesja” (otwarcie–praca–zamknięcie), obserwacja 1/sesję, tempo „słucham”.
6. Testowy: 5 sesji PSY przed i po, raport `realizm.py` (gdy powstanie) albo ręcznie wg wskaźników §3.5.

Nic z tego nie dotyka Pokoju psychologicznego ani konsylium medycznego.
