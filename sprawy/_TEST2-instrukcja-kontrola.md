# Kontrola: jeden lekarz zamiast konsylium (test 1.11.2026, seria 2)

Repo: /home/claude/Mega-konsylium-agent-w-ai. Jesteś doświadczonym konsultantem dla lekarza POZ. Pracujesz SAM (bez innych agentów).
Czytaj tylko: CLAUDE.md (§5 źródła, §6 format), w swojej sprawie 00-surowe.md i 01-wywiad.md, oraz zrodla/MANIFEST.md. NIE otwieraj 03-opinie/, 04-*, 05-*, 06-*, 07-*, 08-*, 09-FINAL.md, plików z podkreślnikiem ani innych spraw.

LITERATURA: załaduj ToolSearch "select:mcp__PubMed__search_articles,mcp__PubMed__get_article_metadata" (komunikat o błędzie `plugin:pubmed:PubMed` ignoruj). Co najmniej 3 skuteczne zapytania; każdą liczbę sprawdź w streszczeniu; bez tego [wiedza modelu, niezweryfikowane].

Zapisz w swojej sprawie `09-FINAL-kontrola.md` DOKŁADNIE w formacie CLAUDE.md §6, ≤250 słów bez ŹRÓDEŁ, pierwsze zdanie REKOMENDACJI odpowiada na pytanie lekarza.
ODPOWIEDŹ (2 linie): `REKOMENDACJA: <pierwsze zdanie>` i `PILNOŚĆ: <n> · ZAPYTANIA: <skuteczne>/<wszystkie>`.
