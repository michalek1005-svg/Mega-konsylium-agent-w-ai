# Instrukcja dla Operatora: MS Konsylium Psychologiczne 0.2.0 (commit f95ee72)

Osobna aplikacja – **nie podmieniać** niczego w MS Konsylium (lekarskim). Ma własną nazwę, własne ustawienia i port iPada 8766, więc obie aplikacje mogą działać obok siebie.

## Pliki (ten katalog)
- `MS-Konsylium-Psychologiczne-0.2.0-win-x64-f95ee72.zip` – aplikacja Windows (przenośna, ok. 127 MB).
- `MS-Konsylium-Psychologiczne-folder-ms-psycho-f95ee72.zip` – folder pracy dla Claude (CLAUDE.md, agenci, skrypty, config z numerami pomocy, przypadki testowe PSY‑01…10). To samo co katalog `ms-psycho/` na gałęzi `claude/project-thread-ud83qw`.
- `zrzuty/` – jak wygląda (prezent, Rozmowa, kryzys, Pokój, Wnioski).

## Najprostsza droga na PC bez gita i node (z GitHuba)
Archiwum commitu `4473b13` z gałęzi `claude/project-thread-ud83qw`. Skopiuj cały folder działającej MS Konsylium (ten sam Electron 38.0.0) do nowego `C:\Users\Kasia\Documents\MS-Konsylium-Psychologiczne\`, w kopii wyczyść `resources\app` i wgraj tam zawartość `ms-psycho/aplikacja/gotowe/`. Folder pracy = `ms-psycho/` z tego samego archiwum (bez `aplikacja/`) → `...\MS-Konsylium-Psychologiczne-folder\ms-psycho`. Dalej punkty 3–6 poniżej.

## Wdrożenie z paczki zip (gdy jest dostęp do tego katalogu) (stała zgoda na podmianę plików; konsylium startuje sam Michał)
1. Rozpakuj aplikację do `C:\Users\Kasia\Documents\MS-Konsylium-Psychologiczne\` (nowy folder). Utwórz skrót do `MS Konsylium Psychologiczne.exe` na pulpicie.
2. Rozpakuj folder pracy tak, żeby powstał `C:\Users\Kasia\Documents\MS-Konsylium-Psychologiczne-folder\ms-psycho\` (w nim `CLAUDE.md`, `skrypty\`, `config\`).
3. Opcjonalnie sygnał „AI pracuje”: skopiuj `.claude\settings.local.json` z folderu MS Konsylium (hooki `ai_aktywnosc.ps1`) do `ms-psycho\.claude\` – skrypt `skrypty\ai_aktywnosc.ps1` jest w folderze.
4. Uruchom aplikację raz: pojawi się czerwony prezent („Dla Halusi”). **Nie klikaj prezentu** – to niespodzianka dla Michała; zamknij aplikację bez otwierania albo użyj „Pomiń ›” tylko jeśli musisz ustawić folder. Folder: ikona folderu w pasku → wskaż `...\ms-psycho`. (Ustawienie zostaje; prezent pokaże się znowu przy następnym starcie – tak ma być w wersji 1.)
5. Sprawdź w `config\pomoc-pl.json`, że plik się otwiera (numery pomocy). Niczego nie zmieniaj.
6. Nie uruchamiaj sesji Claude ani konsylium. Michał startuje sam (polecenie dla sesji Claude jest w `ms-psycho\START-TUTAJ.md` §3).

## Jak sprawdzić, że działa (bez AI)
- Zakładka **Rozmowa** (pierwsza ikona) pokazuje powitanie Terapeuty AI i baner „To nie jest terapia”.
- Napisz testowo „czasem myślę, żeby skończyć ze sobą” → natychmiast pojawia się czerwona karta z numerami 112 / 800 70 2222 / 116 123 (filtr działa bez AI). Potem kliknij „Nowa rozmowa”, żeby nie zostawiać tego wpisu.
- Zakładka **Pokój psychologiczny** pokazuje sprawę pokazową PSY‑DEMO (dopóki w folderze nie ma spraw).

## Usunięcie (gdyby trzeba)
Usuń oba foldery; ustawienia są w `%APPDATA%\MS Konsylium Psychologiczne`.

## Nowe w 0.1.9 (1.11.2026)
- Przy pierwszym starcie Psychoterapia AI prosi o **konto** (pseudonim, wiek 18+, płeć, PIN opcjonalny). Konta i pamięć leżą w folderze pracy: `konta/<konto>/profil.json` i `pamiec.md`. Nie kasować przy podmianie folderu – przenieść razem z `rozmowy/`.
- Psychoterapeuta najpierw odpowiada krótko pytaniem, a pełniejszą odpowiedź zespołu dosyła po chwili.
- Podmiana folderu pracy: zachować `rozmowy/`, `konta/`, `sprawy/`, `wywiad-na-zywo/`.

## Nowe w 0.2.0 (1.11.2026 wieczór)
- Przycisk „Zacznij sesję” (sesja z ramą, karta zadania, suwaki na koniec). Nowe pliki w `konta/<konto>/`: `zadanie.json`, `suwaki.json` – zachować przy podmianie folderu.
