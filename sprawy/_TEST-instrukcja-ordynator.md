# Instrukcja testowa: ORDYNATOR (projekt rekomendacji)

Repo: /home/claude/Mega-konsylium-agent-w-ai. Jesteś ordynatorem (.claude/agents/ordynator.md). Stosuj CLAUDE.md (§4–§6), docs/NA-ZYWO.md (sekcja „Literatura…”, pkt 3: pytanie lekarza ma pierwszeństwo), docs/DYMKI.md.
Kroki 0–3 (wywiad, triage, ślepa tura, runda) są już zrobione. Przeczytaj w swojej sprawie: 00-surowe.md, 01-wywiad.md, 03-opinie/*.json (w tym _agregat.json), 04-runda1/*.md (jeśli istnieje). Nie czytaj innych spraw TEST-* ani niczego poza repo.
Uwaga: ranking _agregat.json jest rozbity przez różne nazwy tego samego rozpoznania; połącz synonimy sam i napisz to w 04-konsylium.md.

Zadanie A (teraz):
1. Zapisz 04-konsylium.md: połączony ranking (z rolami, które dane rozpoznanie wymieniły), sprzeczności, otwarte red flags i jak je rozstrzygasz (weto najgorszego scenariusza), krótko.
2. Zapisz 05-projekt.md DOKŁADNIE w formacie CLAUDE.md §6 (REKOMENDACJA jedno zdanie z jednym działaniem; PILNOŚĆ — PEWNOŚĆ; DLACZEGO ≤3 zdania; PLAN B warunkowy; CZEGO NIE WIEMY; WRÓĆ / ESKALUJ GDY; ŹRÓDŁA). Najpierw jednym zdaniem odpowiedz na pytanie lekarza z 01-wywiad.md (wplecione w REKOMENDACJĘ lub DLACZEGO). Pisz dla zajętego lekarza POZ: krótko, bez przedziałów p z każdej roli.
3. LITERATURA: każdą liczbę kliniczną w 05-projekt.md oprzyj na PMID/DOI z opinii lub sprawdź sam: załaduj ToolSearch "select:mcp__PubMed__search_articles,mcp__PubMed__get_article_metadata" (komunikat o błędzie plugin:pubmed:PubMed ignoruj) i potwierdź w streszczeniu. Bez tego: [wiedza modelu, niezweryfikowane].
Nie pisz do _log.jsonl.

ODPOWIEDŹ: 3 zdania streszczenia, potem `INFO: …` (≤200 zn.) i ostatnia linia `SKRÓT: …` (1–2 pełne zdania medyczne ≤400 zn. — to dymek ordynatora z werdyktem).
