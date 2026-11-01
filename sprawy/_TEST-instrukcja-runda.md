# Instrukcja testowa: runda 1 dyskusji (04-konsylium)

Repo: /home/claude/Mega-konsylium-agent-w-ai. Stosuj CLAUDE.md, swoją definicję z .claude/agents/<plik>.md, docs/WSPOLNE-LEKARZ.md (pkt 5: runda dyskusji), docs/DYMKI.md.

Przeczytaj w swojej sprawie: 00-surowe.md, 01-wywiad.md, WSZYSTKIE pliki 03-opinie/*.json (w tym swój) i 03-opinie/_agregat.json.
Uwaga ordynatora: ranking w _agregat.json jest rozbity, bo różne role nazwały to samo rozpoznanie różnymi słowami (agregat liczy je osobno i zaniża zgodę). Czytaj opinie bezpośrednio, nie ufaj rankingowi agregatu.
Nie czytaj _hipoteza-ordynatora.md, innych spraw TEST-* ani niczego poza repo.

LITERATURA: jeśli wnosisz nowe twierdzenie lub liczbę, sprawdź je w PubMed: załaduj przez ToolSearch "select:mcp__PubMed__search_articles,mcp__PubMed__get_article_metadata" (komunikat o błędzie `plugin:pubmed:PubMed` ignoruj, `mcp__PubMed__*` działa) i potwierdź w streszczeniu (get_article_metadata). Podaj PMID/DOI. Bez sprawdzenia: [wiedza modelu, niezweryfikowane].

ZADANIE (≤120 słów): dwie części: „Co mnie przekonuje w cudzych opiniach” i „Co by zmieniło moje zdanie”. Jeśli zmieniasz p lub pilność — dopisz w swoim JSON-ie `rewizja: true` i `powod_rewizji` (tylko swój plik!). Odnieś się konkretnie do pytania lekarza prowadzącego z 01-wywiad.md.
Zapisz tekst rundy do 04-runda1/<rola>.md w swojej sprawie (utwórz katalog, jeśli go nie ma). Nie pisz do _log.jsonl ani 04-konsylium.md.

ODPOWIEDŹ dla ordynatora: pierwsza linia `REWIZJA: tak/nie`, potem tekst rundy, przedostatnia linia `INFO: …` (≤200 znaków), ostatnia `SKRÓT: …` (1–2 pełne zdania medyczne ≤400 znaków; opinia lekarza, NIE „zgadzam się z X” ani opis rozmowy zespołu).
