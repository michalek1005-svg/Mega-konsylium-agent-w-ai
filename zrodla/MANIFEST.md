# Biblioteka źródeł — manifest

Co tu jest, ma **pierwszeństwo przed wiedzą modelu** (CLAUDE.md §5, poziom 1). Lekarze stali i Sprawdzający faktów
zaczynają od tego pliku. Rezydenci **nie mają** tu dostępu.

Jak dodać źródło: wrzuć plik (PDF/MD/TXT) do tego katalogu i dopisz wiersz. PDF-y > 50 stron warto skonwertować do MD
(`pdftotext -layout plik.pdf plik.md`), żeby agenci mogli przeszukiwać tekst grep-em.

| plik | co to | wydawca | rok | zakres | uwagi |
|---|---|---|---|---|---|
| _(przykład)_ `ptnt-2024-nadcisnienie.md` | Zasady postępowania w nadciśnieniu tętniczym | PTNT | 2024 | HA dorośli | — |
| _(przykład)_ `ptd-2026-zalecenia.md` | Zalecenia kliniczne dotyczące postępowania u osób z cukrzycą | PTD | 2026 | DM1/DM2 | aktualizowane co rok |
| _(przykład)_ `chpl-paracetamol-500.pdf` | ChPL | URPL | 20xx | dawkowanie | — |
| _(przykład)_ `koszyk-poz-badania.md` | Wykaz badań diagnostycznych w POZ / opieka koordynowana | MZ/NFZ | 20xx | zlecanie | pragmatyk POZ czyta zawsze |

## Konwencje nazw
`<wydawca>-<rok>-<temat>.<ext>` — małe litery, bez polskich znaków w nazwie pliku.

## Hierarchia, gdy źródła się różnią
1. Nowsze polskie > starsze polskie.
2. Polskie towarzystwo właściwe dla problemu > polskie ogólne (np. PTNT dla HA > KLRwP ogólne).
3. ChPL dla dawkowania konkretnego preparatu > wytyczna dla klasy leku.
4. Gdy polskie milczą → europejskie (ESC/ESH/EASD…) → NICE → amerykańskie.
Sprawdzający faktów oznacza werdyktem `NIEAKTUALNE` każde twierdzenie z pamięci modelu sprzeczne z plikiem stąd.
