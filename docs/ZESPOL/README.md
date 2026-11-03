# Zespół MS Konsylium – instrukcje ról

Stan: 2.11.2026. Ten katalog opisuje **wątki projektu** (role asystentów, z którymi pracuje Michał). Agenci *wewnątrz* konsylium (ordynator, zastępcy, lekarze, sprawdzający, rezydent, asystent dowodów) są opisani w `CLAUDE.md` i `.claude/agents/`.

## Jak użyć
1. Nadzorca zakłada nowy wątek o tytule „Rola: <nazwa> – <cel>”.
2. Pierwsza wiadomość = blok **„Prompt startowy”** z pliku roli + konkretne zadanie + gdzie jest stan (commit, pliki, poprzedni wątek).
3. Rola na starcie czyta `WSPOLNE-ZASADY.md`, swój plik `ROLA-*.md` i pamięć projektu.

## Pliki
| Plik | Dla kogo |
|---|---|
| [WSPOLNE-ZASADY.md](WSPOLNE-ZASADY.md) | wszystkie role: cel, zasady Michała, źródła, przekazywanie pracy |
| [TRYBY-KONSYLIUM.md](TRYBY-KONSYLIUM.md) | wszystkie role: paczka z Nawigatora, tryby 1–3, układ Wniosków |
| [ROLA-NADZORCA.md](ROLA-NADZORCA.md) | koordynator w czacie projektu |
| [ROLA-KODUJACY.md](ROLA-KODUJACY.md) | jedyny właściciel kodu aplikacji |
| [ROLA-GRAFICZNY.md](ROLA-GRAFICZNY.md) | wygląd, makiety, scena Pokoju |
| [ROLA-MERYTORYCZNY.md](ROLA-MERYTORYCZNY.md) | jakość medyczna, definicje ról, biblioteka `zrodla/` |
| [ROLA-INNOWACYJNY.md](ROLA-INNOWACYJNY.md) | nowe pomysły i artykuły |
| [ROLA-TESTOWY.md](ROLA-TESTOWY.md) | testy na syntetycznych przypadkach dorosłych |
| [ROLA-OPERATOR.md](ROLA-OPERATOR.md) | laptop Windows, wdrażanie paczek |
| [PROPOZYCJE-ZMIAN-CLAUDE.md](PROPOZYCJE-ZMIAN-CLAUDE.md) | propozycje poprawek w `.claude/` do decyzji Michała |

## Przepływ w skrócie
```
Michał ──► Nadzorca ──► właściwa rola (z załączoną wiadomością Michała)
pomysł ──► karta decyzji ──► Kodujący (commit + paczka) ──► Operator (laptop) ──► Michał testuje
```

## Poza tym projektem
Aplikacja psychologiczna (`ms-psycho/`, role Psycholog i Innowacyjny psychoterapii) ma osobny projekt „Konsylium agentow AI wersja psychologiczna” i własny opis struktury (`ms-psycho/STRUKTURA-AGENTOW.md` na gałęzi tej aplikacji).

## Aktualizacja
Gdy Michał zmieni stałą zasadę albo podział ról, Nadzorca prosi o poprawkę tych plików (dowolna rola może je poprawić – to dokumentacja, nie kod) i zapisuje zmianę w pamięci projektu.
