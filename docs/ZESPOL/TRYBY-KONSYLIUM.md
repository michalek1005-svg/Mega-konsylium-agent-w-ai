# Paczka z Nawigatora i trzy tryby konsylium

Stały regulamin Michała z 2.11.2026, przekazany 3.11.2026. Obowiązuje każdego Claude, który dostaje sprawę do konsylium: Nadzorcę, wątek konsylium, Operatora (sesję na laptopie) i ordynatora w aplikacji.

## 1. Skąd przychodzi sprawa: paczka z Nawigatora
Michał klika w Nawigatorze Medycznym „Do Konsylium” i wkleja paczkę. Paczka zaczyna się linią
`=== PACZKA DLA MS KONSYLIUM (z Nawigatora Medycznego) ===` i kończy linią `=== KONIEC PACZKI ===`.

Układ paczki jest zawsze ten sam:
```
=== PACZKA DLA MS KONSYLIUM (z Nawigatora Medycznego) ===
Tryb: <1|2|3> — <nazwa> (<opis>)
Wiek: <n> lat(a) · Płeć: kobieta|mężczyzna
Pytanie lekarza: <zdanie lekarza albo „—”>
Choroba przeglądana w Nawigatorze: <nazwa>          (może nie być)
--- WIZYTA (wywiad, badanie przedmiotowe, pomiary i badania dodatkowe) ---
<tekst wizyty: zdania lekarza, dokładne liczby>
--- ALARMY NAWIGATORA (podpowiedzi reguł Nawigatora, nie rozpoznanie) ---   (może nie być)
Czerwony|Żółty: <nazwa alarmu> — <objawy, które go dały>
=== KONIEC PACZKI ===
```

Zasady paczki:
- **Paczka jest anonimowa** (tylko wiek i płeć). Nie proś o dane identyfikujące. Jeśli w tekście są takie dane, zatrzymaj się i powiedz to Michałowi.
- **„Pytanie lekarza” ma pierwszeństwo przed pilnością.** Gdy jest „Pytanie lekarza: —”, zapytaj Michała jednym zdaniem o pytanie, zanim zaczniesz.
- **Alarmy Nawigatora** traktuj jak wskazówkę z reguł Michała do sprawdzenia, a nie jak rozpoznanie.
- Zanim uruchomisz konsylium, zapytaj (jak zawsze), czy dołączyć wyniki badań laboratoryjnych lub obrazowych.

## 2. Trzy tryby
Tryb wybiera Michał w Nawigatorze (linia „Tryb:”).

| | Tryb 1 – pełny z aplikacją | Tryb 2 – szybki, bez aplikacji | Tryb 3 – pełny bez grafiki |
|---|---|---|---|
| Gdzie | aplikacja MS Konsylium, folder Konsylium, Pokój lekarski z dymkami, ekran Wnioski | w rozmowie | w rozmowie |
| Skład | pełny (triage, ślepa tura, rundy, sprawdzający, rezydenci) | ordynator + 1–3 najważniejsze role, krótkie rundy | pełny, jak w trybie 1 |
| PubMed | bez limitu, min. 3 skuteczne zapytania na rolę | twierdzenia z PMID/DOI | bez limitu, min. 3 skuteczne zapytania na rolę |
| Wynik | `09-FINAL.md` → ekran Wnioski | wiadomości na bieżąco w 4 blokach + podsumowanie w układzie Wniosków | zwięzły przebieg + pełne Wnioski |

### Tryb 1 – pełny z aplikacją
Jak dotąd (`docs/NA-ZYWO.md`): sprawa w folderze Konsylium, aplikacja MS Konsylium, Pokój lekarski z dymkami, ekran Wnioski. Michał może wkleić paczkę w aplikację albo Claude. W drugim przypadku Claude zakłada nową, czystą sprawę, a treść paczki zapisuje jako `01-wywiad.md`. Konsylium nadal startuje sam Michał.

### Tryb 2 – szybki, bez aplikacji
Nie uruchamiasz aplikacji ani grafiki, tylko pracujesz w rozmowie. Skład jest krótki (ordynator + 1–3 najważniejsze role), rundy też. Michał w tym czasie dalej pracuje z pacjentem, więc informujesz go **na bieżąco krótkimi wiadomościami**, gdy pojawiają się wnioski. Każda wiadomość ma cztery bloki:
- **BADANIA** – co zlecić teraz i po co;
- **PODEJRZENIA** – ranking z uzasadnieniem;
- **LEKI** – co rozważyć i czego unikać (dawki tylko ze źródłem);
- **ZALECENIA** – co powiedzieć pacjentowi, kiedy ma wrócić, kiedy eskalować.

Każde twierdzenie ma PMID/DOI albo etykietę „[wiedza modelu, niezweryfikowane]”. Na końcu jedno podsumowanie w układzie Wniosków (punkt 3).

### Tryb 3 – pełny bez grafiki
Konsylium jest takie samo jak w trybie 1: triage, ślepa tura, rundy, sprawdzający faktów i procesu, werdykt, PubMed bez limitu i co najmniej 3 skuteczne zapytania na rolę. Nie ma tylko aplikacji, folderu wymiany ani Pokoju lekarskiego. Przebieg piszesz w rozmowie zwięźle (kto, jaka opinia, z jakim źródłem), a na końcu podajesz pełne Wnioski.

### We wszystkich trybach
Jeśli role nie działały jako osobne wywołania (wszystko w jednym procesie), **powiedz to wprost**.

## 3. Układ Wniosków
```
REKOMENDACJA: <jedno zdanie, co zrobić teraz>
PILNOŚĆ: <1 natychmiast / 2 dziś / 3 w tym tygodniu / 4 planowo / 5 obserwacja> — PEWNOŚĆ: <niska/średnia/wysoka>
DLACZEGO: <≤3 zdania>
PLAN B: <jeśli pierwsza linia nie da efektu / wynik wyjdzie X>
CZEGO NIE WIEMY: <NIEZNANE i co by zmieniło decyzję>
WRÓĆ / ESKALUJ GDY: <konkretne objawy alarmowe>
ŹRÓDŁA: <PMID/DOI, zrodla/>
```
Ten układ to `CLAUDE.md §6`. Przy pierwszych Wnioskach w rozmowie przypomnij jednym zdaniem, że konsylium jest testowo‑edukacyjne i nie służy do decyzji u realnych pacjentów.

## 4. Granice
- **Nie masz dostępu do Nawigatora.** Nie otwierasz jego plików, nie sterujesz jego oknem i nic w nim nie zmieniasz.
- **Wnioski nie wracają do Nawigatora.** Michał sam przepisuje do dokumentacji to, co uzna za potrzebne.
- Rozmawiasz z Michałem po polsku, krótko, bez żargonu technicznego.

## 5. Kto co robi z paczką
- **Nadzorca:** rozpoznaje paczkę i tryb. **Tryb 1** → Operator (sprawa w aplikacji na laptopie, czeka na start Michała). **Tryb 2 i 3** → nowy wątek konsylium (tytuł np. „Konsylium: <wiek> <płeć> – <pytanie>”), któremu przekazuje paczkę z załączoną wiadomością Michała.
- **Wątek konsylium (tryb 2/3):** prowadzi konsylium wg tego pliku, a role uruchamia jako osobne subagenty z modelami wg `.claude/agents/`. Po zakończeniu zapisuje Wnioski do `/mnt/project-files/konsylium/<sprawa>/09-FINAL.md`.
- **Operator (tryb 1):** zakłada czystą sprawę z paczką jako `01-wywiad.md`, zostawia ją gotową i czeka na start Michała.
- **Kodujący:** gdyby aplikacja miała sama przyjmować wklejoną paczkę (rozpoznanie znaczników, linia „Tryb:”), zmianę robi dopiero po decyzji Michała.
- **Merytoryczny i Testowy:** recenzują i testują także sprawy z trybów 2 i 3. Paczki testowe mają ten sam układ.
