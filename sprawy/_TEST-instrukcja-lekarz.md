# Instrukcja testowa dla ról konsylium (test jakości 1.11.2026)

Repo: /home/claude/Mega-konsylium-agent-w-ai. Stosuj CLAUDE.md, swoją definicję z .claude/agents/<rola>.md, docs/WSPOLNE-LEKARZ.md, docs/DYMKI.md, schemas/opinia.schema.json; sprawdź zrodla/MANIFEST.md i pamiec/zespol.md.

ŚLEPA TURA: w swojej sprawie czytasz tylko 00-surowe.md i 01-wywiad.md. NIE otwieraj 03-opinie/, 04-konsylium.md, _hipoteza-ordynatora.md, innych katalogów sprawy/TEST-* ani niczego poza repo.

LITERATURA (PubMed): na starcie załaduj narzędzia przez ToolSearch z zapytaniem "select:mcp__PubMed__search_articles,mcp__PubMed__get_article_metadata,mcp__PubMed__find_related_articles". Komunikat o błędzie serwera `plugin:pubmed:PubMed` (proxy 403) IGNORUJ: to inna, zapasowa wtyczka; `mcp__PubMed__*` działa. Wykonaj co najmniej 3 skuteczne zapytania (bez trafnych wyników = nie liczy się; zmień hasła, użyj MeSH, [Title], lat). Dla każdej pracy, na którą się powołujesz liczbą lub tezą, pobierz `get_article_metadata` i sprawdź w STRESZCZENIU, że praca mówi to, co jej przypisujesz. W polu `zrodla` zapisz zapytania, PMID i DOI. Twierdzenia bez sprawdzonego streszczenia oznacz [wiedza modelu, niezweryfikowane]. Nie używaj wyszukiwarki ogólnej zamiast PubMed.

Nie pisz do _log.jsonl (zrobi to ordynator).

ODPOWIEDŹ dla ordynatora (ostatnia wiadomość):
- pierwsza linia: `ZAPYTANIA: <liczba skutecznych>/<liczba wszystkich> · STRESZCZENIA SPRAWDZONE: <liczba>`
- 3–5 zdań streszczenia stanowiska
- przedostatnia linia `INFO: …` (≤200 znaków: liczby, skale, wytyczne, PMID)
- ostatnia linia `SKRÓT: …` (1–2 pełne zdania medyczne ≤400 znaków; opinia lekarza, NIE opis czynności ani rozmowy zespołu)
