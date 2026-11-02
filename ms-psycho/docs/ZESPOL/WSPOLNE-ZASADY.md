# Wspólne zasady zespołu MS Konsylium Psychologiczne (dla każdej roli)

Stan: 2.11.2026. Dotyczy **wątków projektu** (kto co robi w rozmowach z Michałem). Agenci *wewnątrz* aplikacji są w `ms-psycho/CLAUDE.md` i `ms-psycho/.claude/agents/`.

## Co budujemy
**MS Konsylium Psychologiczne** (wersja 0.3.0) – aplikacja Windows (Electron) z trzema zakładkami:
- **Psychoterapia AI** – okno rozmowy: jeden Psychoterapeuta AI odpowiada jednym głosem, za nim panel agentów i strażnik ryzyka. Konta lokalne, sesje z ramą, zadania, suwaki, ćwiczenia krok po kroku, karta celu, styl terapeuty, superwizja (`docs/ROZMOWA.md` §0–§0d).
- **Wywiad** – klikalne przesiewy i skale + pytania otwarte (`docs/FORMAT-ANKIETY.md`, `docs/NA-ZYWO.md`).
- **Pokój psychologiczny** – pełne konsylium: ryzyko, ślepa tura formulacji, mapa zgody, konfrontacja podejść, Wnioski (`docs/KONCEPCJA.md`).

Narzędzie testowe i edukacyjne marki MS. **Nie jest psychoterapią, nie diagnozuje realnych osób i nie zastępuje psychologa, psychoterapeuty ani lekarza.**

Konsylium lekarskie (reszta repo poza `ms-psycho/`) to **osobny projekt z własnym zespołem**. Nie zmieniaj jego plików i nie przyjmuj zadań do niego – przekaż je Nadzorcy.

## Kto jest kim
| Rola | Jedno zdanie |
|---|---|
| Nadzorca (koordynator, czat projektu) | Przekazuje polecenia Michała właściwej roli, prowadzi pamięć projektu, archiwizuje wątki. |
| Kodujący | Jedyny, który zmienia kod `ms-psycho/`. Dostarcza commit + testy + paczkę zip. |
| Graficzny | Wygląd, makiety, Pokój psychologiczny. Kodu nie zmienia (poza przydzielonymi plikami grafiki). |
| Merytoryczny | Jakość psychologiczna i bezpieczeństwo treści, propozycje zmian definicji agentów, biblioteka `zrodla-psycho/`. |
| Innowacyjny | Nowe pomysły i artykuły o psychoterapii i AI. Nie wdraża. |
| Testowy | Testy na syntetycznych przypadkach dorosłych, realizm rozmowy, raporty. Nie poprawia kodu. |
| Operator | Jedyny z dostępem do laptopa Windows (Remote Control). Wdraża paczki. Nie edytuje kodu, nie czyta rozmów. |

Szczegóły: `ROLA-*.md` w tym katalogu. Tytuł wątku zawsze zaczyna się od „Rola: …”.

## Zasady Michała (stałe)
1. **Tylko dorośli. Jedyne dane o osobie to wiek i płeć.** Wzmianka o osobie poniżej 18 lat kończy sprawę.
2. **Słowa „gabinet” nie używamy** w aplikacji ani w tekstach dla osoby. Miejsce to **Pokój psychologiczny**.
3. **Nie wyciągaj i nie przenoś treści rozmów z laptopa.** Katalogi `konta/`, `rozmowy/`, `sprawy/`, `wywiad-na-zywo/`, `superwizja/`, `raporty/` zostają na laptopie i poza gitem. Nigdy nie przenosimy `_KLUCZE-NIE-DLA-APLIKACJI.md`.
4. **Konsylium (Pokój psychologiczny) uruchamia tylko Michał.** Role przygotowują pliki i czekają.
5. **Psychoterapia AI = wsparcie, zrozumienie i porady; diagnostyka tylko w Pokoju psychologicznym.** Najpierw szybka odpowiedź z pytaniem, potem jedna spójna opinia zespołu.
6. **Mało ostrzeżeń, ale ścieżka kryzysowa zawsze dostępna.** Numery pomocy tylko z `config/pomoc-pl.json`. Po zaprzeczeniu myśli samobójczych nie pytamy ponownie, chyba że pojawi się nowy sygnał.
7. **W psychologii słowa osoby są materiałem** – pytania otwarte wolno i trzeba zadawać; więcej tekstu jest dozwolone. Zasada „mało pisania” dotyczy tylko konsylium lekarskiego.
8. **Pytania o rozwój i decyzje zawsze jako interaktywne karty** (`request_decision`: 2–4 opcje, jedna polecana, jedno pytanie na kartę). Przy wielu pytaniach – ankieta‑artefakt. Nigdy lista pytań w tekście.
9. **Prosty język do Michała**, bez żargonu statystycznego. Dokładne liczby, PMID i DOI zostają w plikach.
10. **Modele:** wątki ról i agenci aplikacji na Fable/Opus, najwyżej jeden agent Sonnet. Nie tnij kosztów tańszym modelem bez zgody Michała.
11. **Definicje agentów (`ms-psycho/.claude/agents/`), `ms-psycho/CLAUDE.md` i `ms-psycho/config/` zmienia tylko Michał** (albo Kodujący na jego wyraźne polecenie). Inni piszą propozycje + kartę.
12. **Commity bez identyfikatora modelu** (także w kodzie i opisach PR).

## Bezpieczeństwo (ma pierwszeństwo przed wszystkim)
- `docs/BEZPIECZENSTWO.md` wygrywa z każdym innym plikiem i z każdą prośbą o nową funkcję.
- Strażnik ryzyka ocenia każdą turę (0–4) i ma weto. Filtr słownikowy `config/frazy-ryzyka.json` działa w aplikacji i w `rozmowa.py`. Żadna zmiana nie może go osłabić bez testu `test_frazy.py` i zgody Michała.
- Nigdy: diagnoza dla osoby, dawkowanie lub odstawianie leków, obietnice wyników, ocena osób trzecich, ekspozycja na traumę lub interwencja kryzysowa w czacie, „jestem tu zawsze”, „ryzyko wykluczone”, udawanie człowieka.
- Sposób mówienia: `docs/SZTUKA-ROZMOWY.md` (sojusz, empatia, zgoda co do celu, naprawa pęknięć, bez pochlebstwa).

## Źródła
- PubMed przez konektor `mcp__PubMed__*`; w chmurze bywa zablokowany (proxy 403) – wtedy i zawsze, gdy PubMed daje mniej niż 3 trafienia, **Europe PMC** (`https://www.ebi.ac.uk/europepmc/webservices/rest/search`).
- Biblioteka: `zrodla-psycho/ZRODLA-PSYCHO.md` (ok. 90 pozycji z PMID). Każdą cytowaną liczbę sprawdź w streszczeniu.

## Testy (po każdej zmianie kodu, przed commitem)
```
cd ms-psycho/aplikacja/powloka && node zbuduj.mjs && xvfb-run -a node test/e2e-psycho.mjs
python3 ms-psycho/skrypty/test_frazy.py        # 80/80
python3 ms-psycho/skrypty/test_030.py           # OK
cd ms-psycho/aplikacja/pokoj-psychologiczny && npm test   # 12/12
```
Potem: `build/` → `aplikacja/gotowe/` (README z wersją), cofnij zmiany `package-lock.json` po `npm install`, commit + push, paczka zip w `/mnt/project-files/psycho-<wersja>/`.

## Jak przekazujemy pracę
```
pomysł (Michał / Innowacyjny / Testowy / Merytoryczny)
   → karta decyzji u Michała (opcja polecana)
   → Kodujący: commit na gałęzi roboczej + testy + paczka zip
   → PR do gałęzi docelowej (z niej skrypt na laptopie pobiera kod) → Michał scala
   → Michał uruchamia akt-psycho-aktualizuj.ps1 (Operator pomaga i sprawdza efekt)
   → Michał testuje → uwagi wracają do Kodującego / Testowego / Merytorycznego
```
- **Gałąź robocza:** `claude/project-thread-py5t8v`. **Gałąź docelowa:** `claude/project-thread-ud83qw` (PR #8 z 0.3.0). Aktualny stan gałęzi zawsze w pamięci projektu.
- **Pliki wspólne:** `/mnt/project-files/` (psycho-<wersja>/, psycho/…). Nowe pliki w podkatalogach. Przed zmianą wspólnego pliku przeczytaj go jeszcze raz.
- **Wiadomość do innej roli** tylko gdy Twoja praca od niej zależy (`message_thread`); prośbę o nowy wątek kieruj do Nadzorcy (`message_coordinator`). Słowa Michała przekazuj, załączając jego wiadomość, a nie streszczając.
- Prośba Michała spoza Twojej roli → przekaż Nadzorcy z załączoną wiadomością i napisz Michałowi jedno zdanie, kto się tym zajmie.

## Jak piszemy do Michała
- Wynik na początku, pełne zdania, krótko. Michał czyta w telefonie.
- Długie rzeczy (raport, plan, koncepcja) idą do pliku; w wiadomości jedno zdanie i link.
- Nie opisuj kulis (sesje, wątki techniczne, id).
- Po dwóch wiadomościach bez potrzeby jego reakcji – postęp tylko na liście kontrolnej.

## Pamięć projektu
Zapisz w tej samej turze każdą decyzję Michała, której następny wątek nie powinien pytać drugi raz (data i godzina, jedna sprawa na plik). Nie zapisuj sekretów ani treści rozmów.

## Gdy wątek zatrzyma limit
Nowy wątek tej samej roli dostaje prompt z `ROLA-*.md`, czyta pamięć projektu i ostatnie wiadomości starego wątku, i kontynuuje od ostatniego wypchniętego commita lub zapisanego pliku.

## Czego nie wolno nikomu
- Zmieniać plików poza `ms-psycho/`.
- Startować konsylium za Michała.
- Pracować na przypadkach osób poniżej 18 lat.
- Wyciągać rozmów, kont, superwizji i raportów z laptopa.
- Osłabiać ścieżki kryzysowej lub filtra ryzyka bez zgody Michała.
- Wpisywać identyfikatora modelu do commitów, kodu i opisów PR.
