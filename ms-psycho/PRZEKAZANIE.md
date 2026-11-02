# Przekazanie: MS Konsylium Psychologiczne → projekt „Konsylium agentow AI wersja psychologiczna”

Stan na 2.11.2026. Przygotował wątek Psychologa w projekcie MS Konsylium.

## 1. Tekst startowy (wklej jako pierwszą wiadomość w nowym projekcie)

> To jest projekt aplikacji **MS Konsylium Psychologiczne**, czyli „brata psychologicznego” MS Konsylium. Narzędzie jest **testowe i edukacyjne** marki MS. Nie zastępuje psychoterapeuty i nie diagnozuje realnych osób.
> **Kod:** repo `michalek1005-svg/mega-konsylium-agent-w-ai`, gałąź `claude/project-thread-ud83qw`, katalog `ms-psycho/` (wersja 0.2.0). **Cała aplikacja psychologiczna jest w `ms-psycho/` i nie zależy od niczego poza nim**; reszta repo to MS Konsylium lekarskie – jej nie zmieniaj. Pliki z poprzedniego projektu (merytoryka, przypadki, grafika, koncepcje, zrzuty) są w `ms-psycho/przeniesienie/`. Podłącz to repo do projektu i pracuj na tej gałęzi albo na nowej gałęzi od niej.
> Na start przeczytaj `ms-psycho/CLAUDE.md`, `ms-psycho/START-TUTAJ.md`, `ms-psycho/docs/ROZMOWA.md` (§0–§0c), `ms-psycho/docs/BEZPIECZENSTWO.md` i `ms-psycho/docs/SZTUKA-ROZMOWY.md`.
> Stałe zasady:
> - tylko dorośli; jedyne dane o osobie to wiek i płeć;
> - nigdy nie używaj słowa „gabinet”;
> - Psychoterapia AI daje **wsparcie, zrozumienie i autentyczne porady**, a diagnostyka należy do Pokoju psychologicznego (konsylium);
> - najpierw szybka odpowiedź z pytaniem, pełna opinia zespołu potem, jednym głosem;
> - ostrzeżeń jest mało, ale ścieżka kryzysowa działa zawsze;
> - jeśli osoba zaprzeczy myślom samobójczym („nie mam”), nie pytaj o nie ponownie;
> - **nie wyciągaj ani nie przenoś treści moich rozmów** z laptopa;
> - zasada „mało pisania” obowiązuje tylko konsylium lekarskie.
> Pełne przekazanie: `ms-psycho/PRZEKAZANIE.md`. Struktura wątków-ról (koordynator, Kodujący, Merytoryczny, Graficzny, Innowacyjny, Testowy, Operator) i jak ją tu odwzorować: `ms-psycho/STRUKTURA-AGENTOW.md` – załóż wątki wg §2 tego pliku.

## 2. Stan aplikacji (0.2.0, commit f95ee72)

| Część | Co robi |
|---|---|
| **Psychoterapia AI** (zakładka startowa, w kodzie „rozmowa”) | Okno jak komunikator, w którym odpowiada jeden Psychoterapeuta AI, a w tle pracuje zespół agentów (strażnik ryzyka, 5 terapeutów różnych podejść, psychiatra, diagnosta, klient‑sędzia). Najpierw przychodzi szybka odpowiedź z pytaniem (`"wstepna": true`), potem pełna opinia zespołu. Ma lokalne **konta** (pseudonim, wiek 18+, płeć, opcjonalny PIN) i **pamięć rozmów** na dysku (`konta/<konto>/pamiec.md`, panel „Co pamiętam”). |
| **Sesja z ramą** (0.2.0, przycisk „Zacznij sesję”) | Sesja przechodzi przez otwarcie, pracę i zamknięcie, a pasek pokazuje fazę. Na koniec zostaje **jedno zadanie** do następnej rozmowy (karta Biorę / Zmieńmy / Nie teraz, potem Zrobione / Nie wyszło), osoba ustawia **dwa suwaki** 0–10 i wybiera termin. Działa też naprawa pęknięć, tempo „słucham”, kontrola udziału słów (terapeuta ≤40%), pilnowanie, żeby terapeuta nie zmyślał wspomnień, i obserwacja wzorca od 3. sesji. |
| **Wywiad** | Ankieta (moduł z MS Konsylium z napisami psychologicznymi). Przyciskiem „Wyślij do Konsylium” zakłada sprawę. |
| **Pokój psychologiczny** | Konsylium terapeutów z dymkami na scenie (diagnoza problemu i kierunek leczenia; Wnioski z HIPOTEZĄ ROBOCZĄ i LECZENIEM). Uruchamia się z Rozmowy przyciskiem „Zwołaj konsylium”. |
| **Ekran prezentu „Dla Halusi ❤”** | Pokazuje się tylko w wersjach 0.1.x–0.2.x. Wyłącza go `const PREZENT = false` w `aplikacja/powloka/zbuduj.mjs`. |

Bezpieczeństwo:
- `config/pomoc-pl.json` jest jedynym źródłem numerów pomocy (112, 800 70 2222, 116 123, Niebieska Linia 800 120 002).
- `config/frazy-ryzyka.json` to filtr słownikowy działający w aplikacji i w skrypcie, z kluczem `zaprzeczenia`. Poziom 3 pokazuje kartę kryzysową, poziom 2 łagodną kartę (raz na rozmowę).
- `skrypty/rozmowa.py` nie pozwala obniżyć ryzyka bez nowego faktu (`obnizam_ryzyko`).

Testy (wszystkie zielone na f95ee72):
- `cd ms-psycho/aplikacja/powloka && node zbuduj.mjs && xvfb-run -a node test/e2e-psycho.mjs` – prezent, konto, szybka odpowiedź, sesja z zadaniem i suwakami, pamięć, kryzys, Pokój;
- `python3 ms-psycho/skrypty/test_frazy.py` – 80/80;
- `cd ms-psycho/aplikacja/pokoj-psychologiczny && npm test` – 12/12.

## 3. Pliki do przeniesienia / podłączenia

**Wszystko poniżej jest już w repo** (gałąź `claude/project-thread-ud83qw`): kod i dokumenty w `ms-psycho/`, pliki projektu w `ms-psycho/przeniesienie/` (`konsylium/`, `grafika/psycholog/`, `narzedzia/psycho/` – zrzuty i instrukcja Operatora). Paczek zip (127 MB) nie ma w repo – odtwarza je `node ms-psycho/aplikacja/powloka/zbuduj.mjs`, a gotowe pliki aplikacji są w `ms-psycho/aplikacja/gotowe/`. Moduł Wywiadu jest kopią w `ms-psycho/aplikacja/wywiad/` (od 2.11 – budowanie nie sięga do katalogów konsylium lekarskiego).

**Repo:** cały katalog `ms-psycho/` z gałęzi `claude/project-thread-ud83qw`.
- `CLAUDE.md`, `START-TUTAJ.md`;
- `.claude/agents/` (16 agentów);
- `config/`;
- `docs/` (ROZMOWA, BEZPIECZENSTWO, SZTUKA-ROZMOWY, ADHD-DOROSLI, SIEC-AGENTOW, NA-ZYWO);
- `skrypty/` (rozmowa.py, dymek.py, test_frazy.py, wywiad_na_zywo.py…);
- `zrodla-psycho/` (manifest źródeł);
- `przypadki-testowe/` (PSY‑01…11, próby, kryteria oceny);
- `aplikacja/`: kod źródłowy oraz `gotowe/`, czyli zawartość `resources\app` do wgrania bez budowania.

**Pliki projektu MS Konsylium** (skopiuj je do nowego projektu jako pliki):
- `/mnt/project-files/narzedzia/psycho/`: `MS-Konsylium-Psychologiczne-0.2.0-win-x64-f95ee72.zip` (aplikacja Windows), `MS-Konsylium-Psychologiczne-folder-ms-psycho-f95ee72.zip` (folder pracy dla Claude), `INSTRUKCJA-OPERATORA-psycho.md`, `zrzuty/`;
- `/mnt/project-files/konsylium/psycho/`: `REALNA-PSYCHOTERAPIA-AI-koncepcje-2026-11-01.md` (Innowacyjny, plan 0.2.0/0.3.0), `SZTUKA-ROZMOWY-przewodnik.md`, `ADHD-DOROSLI-przewodnik.md`, `PSYCHO-SIEC-AGENTOW.md`, `KONCEPCJE-ROZWOJU-PSYCHO-2026-11-02.md`;
- `/mnt/project-files/konsylium/PSYCHO-KONSYLIUM-koncepcja.md` (koncepcja wyjściowa);
- `/mnt/project-files/grafika/psycholog/`: makiety, `ms-tokeny-lawenda.css`, `poprawki-0.1.9.css`, `poprawki-0.2.0.css` (obie już wdrożone), pakiet Pokoju.

**Na laptopie Michała** (folder pracy `…\MS-Konsylium-Psychologiczne\…\ms-psycho\`): `konta/`, `rozmowy/`, `sprawy/`, `wywiad-na-zywo/`. To dane z rozmów, więc **zostają na laptopie** i nie trafiają do repo ani do projektu (decyzja Michała z 2.11: „Nie wyciągaj historii”). Przy aktualizacji aplikacji te katalogi trzeba zachować.

**Nigdy nie przenosić:** `_KLUCZE-NIE-DLA-APLIKACJI.md` (nie trafia do aplikacji ani do agentów).

## 4. Zasady Michała (stałe, w kolejności czasu)

1. Projekt jest testowy: tylko dorośli, jedyne dane to wiek i płeć, bez danych identyfikujących. Słowo „gabinet” nie pada nigdzie.
2. Aplikacja ma dwa widoki. Konsylium psychologiczne to agenci różnych podejść, którzy dyskutują i diagnozują. Psychoterapia AI to jeden terapeuta, który ma za sobą wielu agentów. Okno wygląda jak komunikator z emotikonami. Terapeuta odpowiada na pytania o konkretne sytuacje i jest partnerem do rozmowy.
3. (1.11 07:42) Europe PMC jest obowiązkowym drugim źródłem, gdy PubMed da mniej niż 3 trafienia.
4. (07:47) Zasada „mało pisania” dotyczy tylko konsylium lekarskiego. W wersji psychologicznej jest więcej tekstu. Tempo zależy od pytania: proste pytanie dostaje szybką odpowiedź, trudne wymaga namysłu.
5. (07:45) Strażnik ryzyka i klient‑sędzia pracują na Opus, a krótkie wiadomości idą krótką ścieżką.
6. (07:59) Psychoterapia AI ma wyglądać i działać jak psychoterapia. Zespół w tle się spiera i wspiera, a terapeuta odpowiada 1–4 wiadomościami.
7. (15:39) „Jak nie mam to nie mam i kontynuuje rozmowę”: po zaprzeczeniu myśli samobójczych nie ma karty i ponownych pytań, chyba że pojawi się nowy sygnał.
8. (15:42–15:43, nadrzędne) Psychoterapia AI to wsparcie, zrozumienie i autentyczne porady, a nie droga do rozpoznania (diagnostyka jest w konsylium). Na koniec ma być **jedna opinia**, którą przedstawia psychoterapeuta. Ostrzeżeń ma być mniej. Aplikacja ma mieć konto użytkownika i pamięć rozmów na dysku. Ma działać szybciej: dopytywać, zagadywać i dawać sobie czas na zebranie opinii agentów.
9. (19:23) „Jak sprawić, by psychoterapia była bardziej realna?” Odpowiedzią jest pakiet Innowacyjnego wdrożony w 0.2.0.
10. (2.11 14:08) **„Nie wyciągaj historii”**: treści rozmów nie wolno wyciągać z laptopa.
11. Modele: konsylium pracuje na Fable/Opus, najwyżej jeden agent na Sonnecie, a zapasowy jest Opus.
12. Zgoda zbiorcza z 1.11 04:41 dotyczy otwartych pytań do wersji testowej: role wybierają opcje polecane.

## 5. Ustalenia z wątku Innowacyjnego (psychoterapia)

Plik: `REALNA-PSYCHOTERAPIA-AI-koncepcje-2026-11-01.md`. Zawiera 16 pomysłów w rankingu wpływ × koszt, źródła PubMed z numerami PMID, próbę na sucho i pre‑mortem.
- **Wdrożone w 0.2.0:**
  1. sesja z ramą;
  2. zadanie między sesjami z powrotem do niego;
  3. dwa suwaki i naprawa pęknięć;
  4. pamięć narracyjna bez zmyślania wspomnień;
  5. tempo „słucham”, czekanie, gdy osoba jeszcze pisze, i licznik udziału słów;
  6. obserwacja wzorca od 3. sesji.
- **Plan 0.3.0:**
  - ćwiczenia prowadzone krok po kroku;
  - karta celu pracy;
  - karta terapeuty (styl do wyboru przy koncie, bez fikcyjnej biografii);
  - notatka superwizora od Michała;
  - skrypt `realizm.py` mierzący realizm (udział słów, pytania, nawiązania, naprawy).
- **Później** (§4 pliku): pozostałe pomysły 12–16.
- Pre‑mortem (§6) wymaga, żeby swobodna rozmowa została domyślna, żeby wykrywacz pęknięć miał linię bazową osoby i żeby przy ryzyku ≥2 nie było tempa „słucham” ani zamknięcia sesji z zegara.

## 6. Otwarte sprawy

1. **Instalacja 0.2.0 na laptopie.** Uruchamia ją Michał, bo blokada nie przepuszcza Operatorowi pobranego kodu. Polecenie to `powershell -NoProfile -ExecutionPolicy Bypass -File "$env:USERPROFILE\Documents\akt-psycho-aktualizuj.ps1"` (pobiera najnowszy stan gałęzi). Na laptopie ostatnio była 0.1.6/0.1.7. Po starcie trzeba założyć konto.
2. **Decyzje Michała z 2.11 22:30:** cały pakiet 0.2.0 – zatwierdzony (już wdrożony). Trzy karty w wątku Innowacyjnego jeszcze bez odpowiedzi: tryb sesji (polecane: **terapeuta proponuje** – wdrożone w zasadach, ROZMOWA.md §0c), **trzy style terapeuty do wyboru przy koncie** (polecane – do zbudowania), **notatka superwizora po każdej sesji** (polecane – do zbudowania). Style i notatka = pierwsze zadania dla Kodującego w nowym projekcie, chyba że Michał wybierze inaczej.
3. **Nieprzetestowane na żywo:** szybka odpowiedź wstępna i czas tury, sesja z ramą, karta zadania i suwaki. Testy automatyczne przechodzą, ale nie było jeszcze prawdziwej rozmowy na 0.1.9 ani 0.2.0.
4. **Ostatnia rozmowa z 1.11** (od ok. 13:48) skończyła się na poziomie 2, a zachęta do wizyty u psychiatry została bez odpowiedzi. Jej treść zostaje na laptopie (zasada 10).
5. Wersja **0.3.0** według koncepcji Innowacyjnego.
6. Na końcu wdrożenie do głównej wersji (scalenie z MS Konsylium). Termin i sposób ustala Michał.
7. Lawendowe tokeny (`ms-tokeny-lawenda.css`) są gotowe u Graficznego. Wersja psychologiczna ma już własne `wspolne/ms-tokeny-psycho.css`, więc decyzja o podmianie jest opcjonalna.

## 7. Jak pracować (dla Claude w nowym projekcie)

- Pętla Rozmowy na laptopie: w folderze `ms-psycho` uruchamiasz Claude z poleceniem z `START-TUTAJ.md`. Kolejne kroki to `python skrypty/rozmowa.py czekaj`, szybka odpowiedź wstępna, `pracuje`, panel agentów, prowadzący, klient‑sędzia, `odpowiedz` i co 4–5 tur `pamiec`.
- Konsylium uruchamia **tylko Michał** (przyciskiem). Operator nie startuje Claude ani konsylium.
- Po każdej zmianie: zbuduj, przetestuj (e2e, test_frazy), skopiuj `build/` do `aplikacja/gotowe/` (README z numerem wersji), zrób commit i push na gałąź, a paczkę zip zostaw w plikach projektu.
- Commity bez identyfikatora modelu.
