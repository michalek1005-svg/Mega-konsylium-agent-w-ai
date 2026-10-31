# Pokój lekarski — widok konsylium

Graficzny pokój lekarski, w którym widać przebieg konsylium. Przy stole siedzą ordynator i sześciu lekarzy stałych. Przy ścianie stoją trzej zastępcy, a przy biurku z monitorami siedzą dwaj sprawdzający. Rezydenci stoją za szybą w drzwiach z napisem „staż zewnętrzny”, bo nie widzą dyskusji (firewall rezydenta, `docs/FIREWALL-REZYDENTA.md`).

- Kto się odzywa, nad tym pojawia się **dymek ze skrótem** wypowiedzi. Postać lekko się porusza, a reszta przygasa.
- **Tablica na ścianie** pokazuje, o czym jest dyskusja teraz: fazę, temat i aktualny ranking rozpoznań z agregatu. W werdykcie tablica pokazuje rekomendację.
- **Zegar** na ścianie pokazuje godzinę bieżącej fazy z `_log.jsonl`.
- **Protokół** po prawej to cała rozmowa jak w czacie. Kliknięcie wpisu albo postaci pokazuje pełny tekst i plik źródłowy.
- Na dole jest oś faz (wywiad → triage → ślepa tura → agregacja → rundy → projekt → rezydenci → sprawdzenie → odpowiedź → werdykt → follow-up) z odtwarzaniem, krokami i tempem.

Wygląd: marka MS, paleta „Laguna” z Nawigatora Medycznego, domyślnie tryb ciemny, logo z literą K. Tokeny są kopią `narzedzia/wspolne/ms-tokeny.css` (PR #3) z dopisanymi kolorami pokoju.

## Uruchomienie

```
npm install          # tylko krój Plus Jakarta Sans do osadzenia
npm run build        # → POKOJ-LEKARSKI-0.1.0.html (jeden plik, ok. 150 KB, offline)
npm test             # parser na sprawach 2026-10-31-01 i -02
npm run test:e2e     # Playwright: rysunek, dymek nad mówiącym, wczytanie folderu, zero żądań sieciowych
```

Otwórz plik HTML w przeglądarce. Na start odtwarza się osadzona sprawa `2026-10-31-02` (dane fikcyjne). Przycisk **Wczytaj sprawę…** albo przeciągnięcie folderu z `sprawy/` odtwarza dowolną inną sprawę. Nic nie wychodzi z komputera: strona ma CSP `default-src 'none'`, a build przerywa się, jeśli w kodzie jest adres sieciowy.

Inna sprawa startowa: `node build.mjs --sprawa ../../sprawy/2026-10-31-01`.

## Skąd biorą się dymki

`src/scenariusz.mjs` zamienia folder sprawy na „scenariusz” (sceny z tematem i listą wypowiedzi). Ten sam kod działa w Node i w przeglądarce.

1. **Dziś (z plików 01–10):** skróty są wyliczane heurystycznie. Ślepa tura bierze najwyższe rozpoznanie z `03-opinie/<rola>.json`, rundy biorą pierwsze zdanie po „Decyzja / Zmiany / Top-2” z `04-konsylium.md`, rezydenci „hipotezę niewypowiedzianą”, sprawdzający kolor kartki i pierwszą uwagę, a werdykt pole REKOMENDACJA z `09-FINAL.md`.
2. **Proponowany format na żywo:** każdy agent po swojej wypowiedzi dopisuje do `_log.jsonl` jedną linię:

   ```json
   {"ts":"2026-11-01T10:05:00Z","zdarzenie":"wypowiedz","rola":"bayes","faza":"Ślepa tura","temat":"Ból w klatce od rana","skrot":"ACS p 0,30, pilność 1.","plik":"03-opinie/bayes.json"}
   ```

   `skrot` ma do 150 znaków i jest napisany przez samego agenta, więc jest trafniejszy od heurystyki. Gdy w logu są takie zdarzenia, pokój używa wyłącznie ich. Wymaga to dopisania jednego zdania do instrukcji agentów i do `PROMPT-NADZORCA.md`. Te pliki zmienia tylko Michał, więc to czeka na jego decyzję.

## Dwie drogi: mod w Claude Code czy widok w aplikacji Konsylium

| | **A. Mod (panel) w Claude Code** | **B. Widok w aplikacji Konsylium (ten prototyp)** |
|---|---|---|
| Gdzie widać | Panel obok czatu w Claude Code (desktop, VS Code, telefon), w tej sesji, w której biegnie konsylium | Plik HTML / moduł powłoki Windows obok Wywiadu i Anonimizatora |
| Na żywo | Tak: hak na wywołania subagentów (`tool.call` dla Agent) widzi, kto startuje i kto skończył, bez zmian w agentach | Odtwarzanie gotowej sprawy; na żywo dopiero, gdy powłoka Electron będzie obserwować folder sprawy |
| Grafika | Prosta: elementy panelu (Box, Text, Svg); bez CSS i animacji jak w przeglądarce | Pełna: SVG, animacje, tryb ciemny, wygląd Nawigatora |
| Wątki projektu w claude.ai | Nie: interfejsu wątków projektu nie da się modyfikować, mod działa tylko w Claude Code | Nie bezpośrednio; Michał otwiera plik obok |
| Trwałość | Mod napisany w chmurowej sesji znika z kontenerem; trzeba go opublikować z repo jako wtyczkę (`/plugin install`) | Plik w repo, działa offline na każdym komputerze |
| Dane pacjenta | Zostają w sesji Claude | Zostają na komputerze |

**Rekomendacja:** B jako główny widok (to, co Michał pokazuje i ogląda), a A jako lekki dodatek później. Mod może czytać ten sam `_log.jsonl` i tę samą funkcję `zbudujScenariusz`, więc nie trzeba niczego pisać dwa razy.

## Pliki

- `src/scenariusz.mjs` — parser sprawy → scenariusz (role, skróty, temat, tablica)
- `src/pokoj.js` — rysunek pokoju (SVG), postacie, dymki, odtwarzanie, wczytanie folderu
- `src/pokoj.css` — wygląd marki MS i tokeny pokoju
- `src/szablon.html` — układ strony
- `build.mjs` — skleja wszystko w jeden plik HTML z osadzoną sprawą startową
- `test/fixtura/` — kopie spraw `2026-10-31-01` i `-02` (dane fikcyjne, z PR #1)

— Narzędzie testowe i edukacyjne marki MS. Nie służy do podejmowania decyzji u realnych pacjentów.
