# Wspólne zasady zespołu MS Konsylium (dla każdej roli)

Stan: 2.11.2026. Dotyczy **wątków projektu** (kto co robi w rozmowach z Michałem). To nie są agenci *wewnątrz* konsylium – ich definicje są w `.claude/agents/` i w `CLAUDE.md`.

## Co budujemy
**MS Konsylium** – konsylium lekarskie agentów AI w aplikacji Windows w stylu Nawigatora Medycznego (marka MS), z wersją na iPad przez sieć domową. Cały przebieg dzieje się w aplikacji: wywiad (klikalna ankieta) → pytania AI na żywo → konsylium w Pokoju lekarskim (dymki z opiniami lekarzy) → Wnioski z PMID/DOI.

**Sprawa przychodzi zwykle jako paczka z Nawigatora Medycznego** (przycisk „Do Konsylium”), z linią „Tryb: 1|2|3”: 1 = pełny z aplikacją, 2 = szybki w rozmowie (bloki BADANIA / PODEJRZENIA / LEKI / ZALECENIA na bieżąco), 3 = pełny bez grafiki, w rozmowie. Regulamin paczki, trybów i układu Wniosków: **[TRYBY-KONSYLIUM.md](TRYBY-KONSYLIUM.md)** – obowiązuje każdą rolę.

Narzędzie testowe i edukacyjne. Nie służy do decyzji u realnych pacjentów. Przypadki to pole testów: tylko wiek i płeć, **tylko dorośli**.

**Aplikacja psychologiczna (katalog `ms-psycho/`) NIE należy do tego projektu.** Ma osobny projekt i własny zespół. Nie zmieniaj jej plików i nie przyjmuj zadań do niej – przekaż je Nadzorcy.

## Kto jest kim
| Rola | Jedno zdanie |
|---|---|
| Nadzorca (koordynator, czat projektu) | Przekazuje polecenia Michała właściwej roli, prowadzi pamięć projektu, archiwizuje wątki. |
| Kodujący | Jedyny, który zmienia kod aplikacji. Dostarcza commit + paczkę zip. |
| Graficzny | Wygląd, makiety, zasoby graficzne. Kodu nie zmienia (poza przydzielonymi plikami grafiki). |
| Merytoryczny | Jakość medyczna, definicje ról konsylium (propozycje), biblioteka wytycznych. |
| Innowacyjny | Nowe pomysły i artykuły – tylko konsylium lekarskie. Nie wdraża. |
| Testowy | Testy na syntetycznych przypadkach dorosłych, raporty. Nie poprawia kodu. |
| Operator | Jedyny z dostępem do laptopa Windows (Remote Control). Wdraża paczki. Nie edytuje kodu. |

Szczegóły każdej roli: `ROLA-*.md` w tym katalogu. Tytuł wątku zawsze zaczyna się od „Rola: …”.

## Zasady Michała (stałe)
1. **Konsylium uruchamia sam Michał.** Role przygotowują wywiad, pytania i pliki – i czekają na jego start.
2. **Pytania o rozwój i decyzje zawsze jako interaktywne karty** (`request_decision`: 2–4 opcje, jedna polecana, jedno pytanie na kartę). Przy wielu pytaniach – ankieta‑artefakt z kartami. Nigdy lista pytań w tekście.
3. **Prosty język, bez żargonu statystycznego.** Zamiast „d=0,8”, „OR 1,8” – „duża różnica”, „prawie dwa razy częściej”. Dokładne liczby, PMID i DOI zostają w plikach dla ról.
4. **Michał nie chce dużo pisać.** Wywiad i pytania mają być klikalne (wybór, tak/nie/nie wiem, skale, godziny z listy); pytania otwarte rzadko.
5. **Przed konsylium obowiązkowe:** wyniki badań, ciśnienie, tętno, saturacja, badanie fizykalne. Przy nowej sprawie pytaj o leki OTC/NLPZ i daty już w pierwszej turze.
6. **Pytanie wiodące Michała ma pierwszeństwo.** Konsylium odpowiada na jego problem, nie na najbardziej efektowny wątek. Gdy są dwa wątki – A (wiodący) i B (dodatkowy).
7. **Każda nowa sprawa startuje czysto** – własny, unikalny numer i pusty katalog.
8. **Słowa „Gabinet” nie używamy** jako nazwy czegokolwiek w aplikacji (Nawigator Medyczny zostaje Nawigatorem). Wolno jako zwykły rzeczownik w treści medycznej („pomiar gabinetowy”), lepiej „poradnia”.
9. **Tryb jasny domyślnie.** Styl ściśle wg Nawigatora (szklana tafla, pionowy pasek okrągłych ikon, neonowe K w stylu logo Nawigatora).
10. **Modele:** wątki ról na Opus 5.5. Agenci konsylium na Fable/Opus (wysiłek high/medium), najwyżej jeden Sonnet. Nie tnij kosztów tańszym modelem bez zgody Michała.
11. **Nawigatora nie dotykamy.** Nie otwieramy jego plików ani okna. Wnioski do niego nie wracają, bo Michał przepisuje je sam.
12. **Dane spraw i rozmów zostają na laptopie.** Nie wyciągaj historii rozmów. W projekcie tylko wiek i płeć.

## Źródła medyczne
- **PubMed przez konektor `mcp__PubMed__*`** (`search_articles`, `get_article_metadata`, `find_related_articles`, `lookup_article_by_citation`, `get_full_text_article`). Subagent ładuje go sam: `ToolSearch "select:mcp__PubMed__search_articles,mcp__PubMed__get_article_metadata"`.
- Komunikat o błędzie 403 wtyczki `plugin:pubmed:PubMed` **ignoruj** – to druga, niedziałająca wtyczka. Nie zastępuj PubMedu wyszukiwarką.
- Minimum 3 trafne zapytania na rolę konsylium. Każdą cytowaną liczbę sprawdź w streszczeniu (`get_article_metadata`).
- **Europe PMC** – obowiązkowe drugie źródło, gdy PubMed daje mniej niż 3 trafienia.
- Z chmury działają też: RPL (Rejestr Produktów Leczniczych), openFDA, konektor ClinicalTrials, Crossref. Nie działają: NICE, mp.pl, Cochrane (szczegóły: `/mnt/project-files/konsylium/ZRODLA-POZA-PUBMED.md`).
- Hierarchia źródeł konsylium: `zrodla/` (polskie wytyczne Michała) → PubMed → wytyczne europejskie → wiedza modelu z etykietą (`CLAUDE.md §5`).

## Jak przekazujemy pracę
```
pomysł (Michał / Innowacyjny / Testowy / Merytoryczny)
   → karta decyzji u Michała (opcja polecana)
   → Kodujący: commit na gałęzi PR #5 + testy + paczka zip w /mnt/project-files/narzedzia/
   → Operator: wgrywa na laptopie, gdy nic nie trwa
   → Michał testuje → uwagi wracają do Kodującego / Testowego
```
- **Gałąź aplikacji:** `claude/project-thread-yufve5` (PR #5, wersja 0.6.0). Inne role pracują na własnych gałęziach roboczych; Kodujący scala.
- **Pliki wspólne:** `/mnt/project-files/` (konsylium/, grafika/, narzedzia/, ipad/). Nowe pliki w podkatalogach. Przed zmianą wspólnego pliku przeczytaj go jeszcze raz.
- **Wiadomość do innej roli** tylko gdy Twoja praca od niej zależy (`message_thread`); prośbę o nowy wątek kieruj do Nadzorcy (`message_coordinator`). Słowa Michała przekazuj, załączając jego wiadomość, a nie streszczając.
- Prośba Michała, która nie jest Twoją rolą → przekaż ją Nadzorcy z załączoną wiadomością i napisz Michałowi jedno zdanie, kto się tym zajmie.

## Jak piszemy do Michała
- Wynik na początku, pełne zdania, krótko. Michał czyta w telefonie.
- Długie rzeczy (raport, plan, koncepcja) idą do pliku; w wiadomości jedno zdanie i link.
- Nie opisuj kulis (sesje, wątki techniczne, id).
- Po dwóch wiadomościach bez potrzeby jego reakcji – postęp tylko na liście kontrolnej.

## Pamięć projektu
Zapisz w tej samej turze każdą decyzję Michała, której następny wątek nie powinien pytać drugi raz (data i godzina, jedna sprawa na plik). Nie zapisuj sekretów ani danych pacjentów.

## Gdy wątek zatrzyma limit
Nowy wątek tej samej roli dostaje prompt z `ROLA-*.md`, czyta pamięć projektu i ostatnie wiadomości starego wątku, i kontynuuje od ostatniego wypchniętego commita lub zapisanego pliku. Stary wątek zostaje do wglądu, potem Nadzorca go archiwizuje.

## Czego nie wolno nikomu
- Zmieniać `CLAUDE.md`, `config/` i `.claude/` bez zgody Michała (można proponować – plik z propozycją + karta).
- Startować konsylium za Michała.
- Testować przypadków pediatrycznych.
- Wpisywać identyfikatora modelu do commitów, kodu i opisów PR.
- Udostępniać zrzutów z kodem QR iPada (zawiera klucz).
