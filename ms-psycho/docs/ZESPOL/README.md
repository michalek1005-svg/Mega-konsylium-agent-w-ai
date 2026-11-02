# Zespół MS Konsylium Psychologiczne – instrukcje ról

Stan: 2.11.2026. Ten katalog opisuje **wątki projektu** „Konsylium agentow AI wersja psychologiczna” (role asystentów, z którymi pracuje Michał). Agenci *wewnątrz* aplikacji (prowadzący, terapeuci szkół, strażnik ryzyka, stażysta, klient‑sędzia…) są opisani w `ms-psycho/CLAUDE.md` i `ms-psycho/.claude/agents/`.

Wzorzec: `docs/ZESPOL/` konsylium lekarskiego (PR #9). Tamte pliki dotyczą konsylium lekarskiego; ten katalog – tylko aplikacji psychologicznej.

## Jak użyć
1. Nadzorca zakłada nowy wątek o tytule „Rola: <nazwa> – <cel>”.
2. Pierwsza wiadomość = blok **„Prompt startowy”** z pliku roli + konkretne zadanie + gdzie jest stan (commit, pliki, poprzedni wątek).
3. Rola na starcie czyta `WSPOLNE-ZASADY.md`, swój plik `ROLA-*.md`, `ms-psycho/CLAUDE.md` i pamięć projektu.

## Pliki
| Plik | Dla kogo |
|---|---|
| [WSPOLNE-ZASADY.md](WSPOLNE-ZASADY.md) | wszystkie role: cel, zasady Michała, bezpieczeństwo, źródła, testy, przekazywanie pracy |
| [ROLA-NADZORCA.md](ROLA-NADZORCA.md) | koordynator w czacie projektu |
| [ROLA-KODUJACY.md](ROLA-KODUJACY.md) | jedyny właściciel kodu aplikacji psychologicznej |
| [ROLA-GRAFICZNY.md](ROLA-GRAFICZNY.md) | wygląd, makiety, Pokój psychologiczny |
| [ROLA-MERYTORYCZNY.md](ROLA-MERYTORYCZNY.md) | jakość psychologiczna, bezpieczeństwo treści, definicje agentów, `zrodla-psycho/` |
| [ROLA-INNOWACYJNY.md](ROLA-INNOWACYJNY.md) | nowe pomysły i artykuły o psychoterapii i AI |
| [ROLA-TESTOWY.md](ROLA-TESTOWY.md) | testy na syntetycznych przypadkach dorosłych, realizm rozmowy |
| [ROLA-OPERATOR.md](ROLA-OPERATOR.md) | laptop Windows, wdrażanie paczek |

## Przepływ w skrócie
```
Michał ──► Nadzorca ──► właściwa rola (z załączoną wiadomością Michała)
pomysł ──► karta decyzji ──► Kodujący (commit + testy + paczka) ──► scalenie PR ──► Operator / Michał (aktualizacja laptopa) ──► Michał testuje
```

## Aktualizacja
Gdy Michał zmieni stałą zasadę albo podział ról, Nadzorca prosi o poprawkę tych plików (dowolna rola może je poprawić – to dokumentacja, nie kod) i zapisuje zmianę w pamięci projektu.
