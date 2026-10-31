# Rady dla Michała — prosto, bez żargonu

To nie jest instrukcja dla agentów. To moje rady dla Ciebie na dalszą drogę z Konsylium i marką MS.

## Jak zacząć (jutro, nie dziś w nocy)
1. Rozpakuj `konsylium-ai.zip` np. do `C:\MS\konsylium-ai`.
2. Otwórz tam Claude Code i wklej: *„Przeczytaj PROMPT-NADZORCA.md w całości i działaj zgodnie z nim. Mów do mnie prosto."*
3. Osobno, w projekcie Nawigatora, wklej treść `DLA-NADZORCY-NAWIGATORA.md` z dopiskiem: *„Przeczytaj i potwierdź, co to zmienia w Twojej pracy."*
4. Oba nadzorcy odpowiedzą pytaniami. Przygotuj sobie odpowiedzi na trzy: gdzie na dysku jest Nawigator; czy Konsylium ma być ciemne, czy wierne Nawigatorowi; czy masz klucz do innego modelu niż Claude (OpenAI, Gemini, Ollama) — dla rezydentów.

## Dziesięć rad

1. **Odbieraj fazami, nie całością.** Nadzorca ma plan w 6 fazach. Po każdej dostaniesz zrzuty ekranu. Nie mów „ok, dalej", dopóki nie obejrzysz. Najważniejszy moment: po Fazie 2 — nagłówek z „K" obok nagłówka Nawigatora. Jeśli nie wyglądają jak jedno, tam to naprawiaj, nie później.

2. **Nie daj się namówić na „pokażmy rezydentowi trochę więcej".** To najczęstsza pokusa — agent powie, że rezydent byłby trafniejszy z kontekstem. Trafniejszy rezydent = taki sam jak zespół = bezużyteczny. Cała wartość jest w tym, że nie wie.

3. **Pierwsze pliki do `zrodla/`:** aktualne wytyczne nadciśnienia (PTNT), cukrzycy (PTD), wykaz badań POZ / opieka koordynowana, ChPL 10 leków, które najczęściej wypisujesz. Bez tego sprawdzający faktów będzie ciągle dawał żółte kartki „brak źródła". Wrzucaj sam — nie pozwól agentowi ściągać z internetu, bo nie będziesz wiedział, która wersja jest w środku.

4. **Follow-up to paliwo.** Konsylium uczy się tylko wtedy, gdy wpiszesz „a naprawdę było X". Bez tego działa, ale stoi w miejscu. Przy sprawach fikcyjnych/podręcznikowych „prawdziwy wynik" to wynik z podręcznika lub publikacji — też się liczy.

5. **Sprawy do testów:** skoro to narzędzie teoretyczne, najlepsze są **case reports z publikacji** (znany wynik, opisana droga) i **zagadki z podręczników**. 10–20 takich spraw powie Ci więcej niż jakakolwiek demonstracja. Dołóż kilka **nudnych, typowych** z POZ — tam konsylium powinno samo wybierać tryb szybki; jeśli uruchamia pełny skład do przeziębienia, triage jest źle ustawiony.

6. **Koszt.** Pełne konsylium to kilkanaście wywołań modelu. Po Fazie 1 poproś o szacunek kosztu jednej pełnej sprawy. Jeśli za drogo — pierwsza oszczędność to tańszy model dla zastępców i pragmatyka, **nie** wycinanie rezydentów ani sprawdzających.

7. **Bibliotekarz kliniczny** — nadzorca zaproponuje nową rolę, która do każdej sprawy dociąga najnowsze publikacje z PubMed i trwające badania z ClinicalTrials.gov. Skoro celem jest zbieranie wiedzy — moim zdaniem warto powiedzieć „tak". Ale to Twoja decyzja, dlatego nadzorca ma zapytać, nie dodać sam.

8. **Marka MS — zdecyduj trzy rzeczy wcześnie:** (a) czy obok litery w logo ma być widoczny znak „MS", (b) czy Nawigator ma przejść na wspólny pakiet `ms-ui` od razu, czy dopiero gdy Konsylium będzie gotowe (radzę: dopiero potem — nie psuj działającej rzeczy w trakcie budowy drugiej), (c) tryb ciemny w obu czy tylko w Konsylium.

9. **Trzecia aplikacja.** Nie mów jeszcze nadzorcy, co to będzie — ma zostawić po sobie szkielet i instrukcję `JAK-ZROBIC-TRZECIA.md`. Gdy przyjdzie czas, zaczniesz od gotowego nagłówka z własną literą w jeden dzień.

10. **Gdy agent kręci się w kółko** (ten sam błąd 3 razy) — przerwij i każ opisać problem prostym językiem. W prompcie nadzorcy jest ta zasada, ale Ty też ją pilnuj. I pamiętaj: Panel zespołu agentów, który budujesz, czyta ten sam log co Konsylium (`_log.jsonl`) — możesz patrzeć, kto co robi, na żywo.

## Jedna rzecz, o której pamiętaj zawsze
To jest narzędzie **do ćwiczenia myślenia i zbierania wiedzy**, nie do pacjentów. Sam tak zdecydowałeś i słusznie. Ale ćwicz na nim tak, jakby było prawdziwe — tylko wtedy czegoś uczy. Dlatego w środku nic nie jest uproszczone.

## Co jest w paczce
| Plik | Dla kogo | Po co |
|---|---|---|
| `START-TUTAJ.md` | Ty | 5 kroków na start |
| `RADY-DLA-MICHALA.md` | Ty | ten plik |
| `docs/PO-LUDZKU.md` | Ty | jak działa konsylium, bez żargonu |
| `PROMPT-NADZORCA.md` | Claude Code w Konsylium | instrukcja rozbudowy: Twoje plany, marka MS, zespół agentów budowy, fazy, zakazy |
| `DLA-NADZORCY-NAWIGATORA.md` | Claude Code w Nawigatorze | żeby wiedział o marce MS i dwóch aplikacjach (Nawigator Medyczny + Konsylium agentów AI) |
| `docs/ZAPIS-ROZMOWY.md` | obaj nadzorcy, Ty | cała nasza rozmowa — źródło „dlaczego tak" |
| `CLAUDE.md`, `.claude/agents/`, `skrypty/`, `config/`, `schemas/`, `sprawy/PRZYKLAD-001/` | Konsylium | działający rdzeń |
| `docs/ARCHITEKTURA.md`, `PUNKTACJA.md`, `FIREWALL-REZYDENTA.md`, `architektura.png` | agenci | specyfikacje i diagram |
