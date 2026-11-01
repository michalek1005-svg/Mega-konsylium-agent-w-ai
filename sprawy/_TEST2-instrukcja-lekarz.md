# Instrukcja testowa dla ról konsylium (test jakości 1.11.2026, seria 2)

Repo: /home/claude/Mega-konsylium-agent-w-ai. Stosuj CLAUDE.md, swoją definicję z .claude/agents/<rola>.md, docs/WSPOLNE-LEKARZ.md, docs/DYMKI.md, schemas/opinia.schema.json; sprawdź zrodla/MANIFEST.md i pamiec/zespol.md.

ŚLEPA TURA: w swojej sprawie czytasz tylko 00-surowe.md i 01-wywiad.md. NIE otwieraj 03-opinie/, 04-konsylium.md, _hipoteza-ordynatora.md, innych katalogów sprawy/TEST-* ani niczego poza repo.

LITERATURA (PubMed): na starcie załaduj narzędzia przez ToolSearch z zapytaniem "select:mcp__PubMed__search_articles,mcp__PubMed__get_article_metadata,mcp__PubMed__find_related_articles". Komunikat o błędzie serwera `plugin:pubmed:PubMed` (proxy 403) IGNORUJ: to inna, zapasowa wtyczka; `mcp__PubMed__*` działa. Wykonaj co najmniej 3 skuteczne zapytania (bez trafnych wyników = nie liczy się; zmień hasła, użyj MeSH, [Title], lat). Dla każdej pracy, na którą się powołujesz liczbą lub tezą, pobierz `get_article_metadata` i sprawdź w STRESZCZENIU, że praca mówi to, co jej przypisujesz. W polu `zrodla` zapisz zapytania, PMID i DOI. Twierdzenia bez sprawdzonego streszczenia oznacz [wiedza modelu, niezweryfikowane]. Nie używaj wyszukiwarki ogólnej zamiast PubMed.

Jeśli PubMed odrzuci zapytanie z powodu limitu częstości, odczekaj chwilę i ponów (nie liczy się jako skuteczne do czasu sukcesu).

DYMEK: po zapisaniu JSON-a sam dopisz swój dymek jednym wywołaniem (z katalogu repo):
`python3 skrypty/dymek.py sprawy/<ID> --rola <rola> --faza "Ślepa tura" --skrot "<SKRÓT>" --info "<INFO>"`
Nie edytuj _log.jsonl ręcznie.

ODPOWIEDŹ dla ordynatora (ostatnia wiadomość, DOKŁADNIE 3 linie, nic więcej):
`ZAPYTANIA: <skuteczne>/<wszystkie> · STRESZCZENIA SPRAWDZONE: <n>`
`ROZPOZNANIE: <rozpoznanie nr 1> p <x> · PILNOŚĆ <1–5> · ODPOWIEDŹ NA PYTANIE: <≤15 słów>`
`SKRÓT: <ten sam tekst co w dymku>`
