# MS Konsylium Psychologiczne (ms-psycho/)

Osobna aplikacja – „brat psychologiczny” MS Konsylium. **Narzędzie testowe i edukacyjne marki MS** – nie zastępuje psychoterapeuty i nie służy do diagnozy realnych osób.

Wszystko, co dotyczy aplikacji psychologicznej, jest w tym katalogu i nie zależy od reszty repozytorium (reszta = MS Konsylium lekarskie).

| Katalog | Zawartość |
|---|---|
| `CLAUDE.md`, `START-TUTAJ.md`, `.claude/agents/` | zasady zespołu i 16 agentów |
| `docs/` | ROZMOWA (Psychoterapia AI, §0–§0d), BEZPIECZENSTWO, SZTUKA-ROZMOWY, ADHD-DOROSLI, KONCEPCJA, SIEC-AGENTOW, … |
| `config/` | numery pomocy (`pomoc-pl.json`), filtr ryzyka (`frazy-ryzyka.json`), ćwiczenia krok po kroku (`cwiczenia.json`), karty stylu terapeuty (`style-terapeuty.json`) |
| `skrypty/` | `rozmowa.py` (pętla Psychoterapii AI, superwizja), `realizm.py` (pomiar realizmu sesji), `dymek.py`, `test_frazy.py`, `test_030.py`, `wywiad_na_zywo.py` |
| `aplikacja/` | kod aplikacji Windows (Electron): `powloka/` (budowanie: `node zbuduj.mjs`), `rozmowa/`, `pokoj-psychologiczny/`, `wywiad/` (kopia modułu z MS Konsylium), `wspolne/`, `prezent/` (ekran „Dla Halusi ❤” – tylko wersje 0.1.x–0.2.x, od 0.3.0 wyłączony), `gotowe/` (wynik budowania do `resources\app`) |
| `przypadki-testowe/` | sprawy PSY‑01…11, próby, kryteria oceny |
| `zrodla-psycho/` | manifest źródeł |
| `przeniesienie/` | pliki z projektu MS Konsylium (merytoryka, przypadki, grafika, koncepcje rozwoju, zrzuty) – do przeniesienia do nowego projektu |
| `PRZEKAZANIE.md` | stan, zasady Michała, otwarte sprawy i tekst startowy dla nowego projektu |
| `STRUKTURA-AGENTOW.md` | wątki-role projektu (koordynator, Kodujący, Graficzny, Merytoryczny, Innowacyjny, Testowy, Operator) i propozycja dla projektu psychologicznego |

Wersja **0.3.0** (2.11.2026): ćwiczenia krok po kroku, karta celu, karta stylu terapeuty, superwizja z notatką, `realizm.py` – docs/ROZMOWA.md §0d.

Testy: `cd aplikacja/powloka && node zbuduj.mjs && xvfb-run -a node test/e2e-psycho.mjs` · `python3 skrypty/test_frazy.py` · `python3 skrypty/test_030.py` · `cd aplikacja/pokoj-psychologiczny && npm test`.
Dane rozmów (`konta/`, `rozmowy/`, `sprawy/`, `wywiad-na-zywo/`, `superwizja/`, `raporty/`) zostają na komputerze użytkownika i nie trafiają do repo.

Autorzy wkładów (wątki projektu MS Konsylium, 1.11–2.11.2026): Psycholog (aplikacja, scalenie), Merytoryczny (role, bezpieczeństwo, źródła), Innowacyjny (sieć agentów, próba na sucho PSY‑03, koncepcje „realnej psychoterapii” – 0.2.0), Graficzny (scena Pokoju, prezent, makieta Rozmowy, poprawki wyglądu 0.1.9/0.2.0), Testowy (przypadki PSY‑01…10).
