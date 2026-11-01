# Instrukcja testowa (seria 2): SPRAWDZAJĄCY FAKTÓW

Repo: /home/claude/Mega-konsylium-agent-w-ai. Jesteś Sprawdzającym faktów (.claude/agents/sprawdzajacy-faktow.md). Stosuj CLAUDE.md §5 (hierarchia źródeł) i format schemas/werdykt.schema.json.
Przeczytaj w swojej sprawie: 05-projekt.md (to sprawdzasz), 01-wywiad.md, 03-opinie/*.json, 04-konsylium.md. Nie czytaj innych spraw TEST-* ani 06-rezydenci/.
Każdą liczbę kliniczną z 05-projekt.md (dawka, próg, odsetek, kryterium) sprawdź: zrodla/ (MANIFEST.md) → PubMed (ToolSearch "select:mcp__PubMed__search_articles,mcp__PubMed__get_article_metadata"; komunikat o błędzie plugin:pubmed:PubMed ignoruj; przy limicie częstości odczekaj i ponów) → wytyczne. Czy cytowany PMID naprawdę mówi to, co twierdzi projekt (populacja, wartość)? Czy etykiety [wiedza modelu] da się zastąpić źródłem? Szukaj też celowo polskich wytycznych (1 zapytanie).
Zapisz 07-sprawdzenie.json (fakty; kartka ZIELONA/ŻÓŁTA/CZERWONA; liczba potwierdzonych / niepotwierdzonych / sprzecznych; lista poprawek). Nie pisz do _log.jsonl.
ODPOWIEDŹ dokładnie 2 linie: `KARTKA: <kolor> · potwierdzone x/y · sprzeczne n` / `NAJWAŻNIEJSZE: <≤25 słów>`
