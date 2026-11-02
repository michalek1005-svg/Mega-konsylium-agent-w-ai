# Struktura agentów (wątków) – jak pracujemy w projekcie MS Konsylium i jak to odwzorować w projekcie psychologicznym

Stan na 2.11.2026. Opis dla projektu „Konsylium agentow AI wersja psychologiczna”. Dotyczy **wątków projektu**, czyli kto co robi w rozmowach z Michałem. To coś innego niż agenci *wewnątrz* aplikacji (strażnik ryzyka, terapeuci, prowadzący…), których definicje są w `.claude/agents/`.

## 1. Jak to działa u nas (projekt MS Konsylium)

### Koordynator = NADZORCA
- Rozmawia z Michałem w czacie projektu i zakłada wątki.
- **Przekazuje polecenia Michała do właściwej roli** razem z jego oryginalną wiadomością, bo Michał często pisze w dowolnym wątku albo w czacie.
- Prowadzi **pamięć projektu**, czyli stałe zasady i decyzje Michała z datą i godziną, żeby nowy wątek nie pytał drugi raz.
- **Archiwizuje wątki na bieżąco**: zakończone i niepotrzebne od razu, a stare zastąpione nowymi zostawia do wglądu.
- Zbiera podsumowania ról w jeden post dla Michała, np. rano po pracy nocnej.

### Stałe wątki-role (tytuł zawsze „Rola: …”)
| Rola | Zakres | Czego NIE robi |
|---|---|---|
| **Kodujący** | **Jedyny właściciel kodu** aplikacji. Commituje na swoją gałąź i buduje paczkę zip oraz `gotowe/` (wynik budowy do `resources\app`). Opisuje Operatorowi, co wdrożyć. | Nie obsługuje Windows ani spraw. |
| **Graficzny** | Wygląd, makiety, sceny, postacie i poprawki CSS. Zasoby oddaje w `/mnt/project-files/grafika/…` jako pliki, a Kodujący je wdraża. | **Nie zmienia kodu w repo**. Wyjątek to wąski zakres plików, który Michał może mu przydzielić. |
| **Merytoryczny** | Jakość medyczna lub psychologiczna wniosków, definicje ról agentów, biblioteka źródeł i wytycznych. Proponuje zmiany w definicjach, a zatwierdza je Michał. | Nie zmienia kodu aplikacji. |
| **Innowacyjny** | Artykuły, nowe pomysły i koncepcje rozwoju (ranking wpływ × koszt, pre‑mortem, próba na sucho, źródła z PMID). Oddaje plik z koncepcją i listą zmian dla Kodującego. | Nie wdraża. |
| **Testowy** | Testy na syntetycznych przypadkach (tylko dorośli), raporty z uwagami do planu. | Nie poprawia kodu sam. |
| **Operator aplikacji** | **Jedyny z dostępem do Windows** (Remote Control na laptopie Michała). Ma **stałą zgodę** na używanie laptopa: podmianę plików, otwieranie aplikacji, wgrywanie przypadków. Wdraża paczki, gdy nic nie trwa. | Nie edytuje kodu i nie zmienia ustawień systemu. **Nie startuje konsylium ani sesji**, bo robi to sam Michał. |

W wersji psychologicznej była jeszcze rola **Psycholog**. Budowała osobną aplikację psychologiczną jako jej jedyny właściciel kodu i pracowała z Graficznym, Innowacyjnym i Operatorem tak samo jak Kodujący.

### Zasady współpracy
- **Przepływ zmian:** pomysł (Michał, Innowacyjny, Testowy) → Kodujący robi commit, test i paczkę zip w `/mnt/project-files/narzedzia/…` → Operator wdraża na laptopie, kiedy nic nie trwa → Michał testuje.
- Na laptopie nie ma gita ani node, a blokada nie przepuszcza pobranego kodu. Dlatego aktualizację z gotowego skryptu (`akt-…-aktualizuj.ps1`, który pobiera najnowszy stan gałęzi) **uruchamia sam Michał**. Operatorowi pisze się tylko o zmianie gałęzi, układu katalogów albo listy rzeczy do zachowania.
- **Michał sam uruchamia** konsylium i sesje. Role przygotowują wszystko i czekają.
- **Pytania do Michała zadajemy jako interaktywne karty** z jedną opcją oznaczoną jako polecana, nigdy jako listę do przepisania. Przy zgodzie zbiorczej role nie czekają i same wybierają opcje polecane.
- **Prosty język**, krótko, wynik na początku. Długie rzeczy trafiają do pliku, a w wiadomości zostaje jedno zdanie z linkiem.
- **Model:** domyślnie Opus 5.5. Konsylium pracuje na Fable/Opus z najwyżej jednym agentem na Sonnecie. Zapasowy jest Opus. Wątek zatrzymany limitem zastępuje nowy wątek tej samej roli.
- Commity bez identyfikatora modelu. Zrzuty ekranu z testów przy każdej paczce.
- **Pamięć projektu** trzyma jedną sprawę na plik z datą decyzji. Zapisujemy w tej samej turze, w której Michał coś postanowi.
- **Dane rozmów i spraw zostają na laptopie** („Nie wyciągaj historii”, 2.11). Przypadki w projekcie mają tylko wiek i płeć.

## 2. Propozycja dla projektu psychologicznego

| Wątek | Tytuł | Zakres w wersji psychologicznej |
|---|---|---|
| Koordynator | (czat projektu) | Jak wyżej: przekazywanie poleceń Michała, pamięć projektu, archiwizacja na bieżąco, poranne podsumowanie. |
| **Rola: Kodujący** | „Rola: Kodujący – aplikacja psychologiczna” | Jedyny właściciel kodu `ms-psycho/`: commity, paczka, `gotowe/`, testy (e2e, `test_frazy.py`, Pokój). Na start czyta `PRZEKAZANIE.md` i `README.md`. |
| **Rola: Merytoryczny (psychologia)** | „Rola: Merytoryczny – psychoterapia” | Jakość psychologiczna, `.claude/agents/`, `docs/SZTUKA-ROZMOWY.md`, `docs/BEZPIECZENSTWO.md`, biblioteka `zrodla-psycho/` (PubMed + Europe PMC jako drugie źródło). Nadzoruje ścieżkę kryzysową i filtr `config/frazy-ryzyka.json`. |
| **Rola: Graficzny** | „Rola: Graficzny – aplikacja psychologiczna” | Paleta lawendowa, okno Psychoterapii AI, Pokój psychologiczny, ekrany konta i sesji. Oddaje pliki CSS do wklejenia (jak `przeniesienie/grafika/psycholog/poprawki-0.2.0.css`). |
| **Rola: Innowacyjny** | „Rola: Innowacyjny – realna psychoterapia” | Kontynuuje `przeniesienie/konsylium/psycho/REALNA-PSYCHOTERAPIA-AI-koncepcje-2026-11-01.md`: plan 0.3.0 (ćwiczenia prowadzone, karta celu, karta terapeuty, superwizja, `realizm.py`). |
| **Rola: Testowy** | „Rola: Testowy – przypadki psychologiczne” | Przypadki PSY‑01…11 i nowe, próby rozmów i raporty (`przypadki-testowe/`). Tylko dorośli. Klucze przypadków nigdy nie trafiają do aplikacji ani do agentów. |
| **Rola: Operator** | „Rola: Operator – laptop Michała” | Ten sam laptop i te same zasady: stała zgoda, wdraża tylko wtedy, gdy nic nie trwa, nie startuje sesji, zachowuje `konta/`, `rozmowy/`, `sprawy/`, `wywiad-na-zywo/`. **Nie przenosi treści rozmów.** |

Na początek wystarczą **Kodujący, Merytoryczny i Operator**. Graficzny, Innowacyjny i Testowy dochodzą, gdy pojawi się dla nich praca. Laptop ma jednego Operatora na raz: jeśli oba projekty działają równolegle, wdrożenia obu aplikacji trzeba uzgodnić u jednego z nich.

## 3. Gdzie co jest
- Stan aplikacji, zasady Michała, otwarte sprawy i tekst startowy: `PRZEKAZANIE.md`.
- Pliki z poprzedniego projektu: `przeniesienie/`.
- Agenci wewnątrz aplikacji: `.claude/agents/` i `CLAUDE.md`.
