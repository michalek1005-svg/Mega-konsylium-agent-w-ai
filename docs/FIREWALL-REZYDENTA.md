# Firewall rezydenta — co widzi, czego nie widzi, jak to wymusić

Cel: rezydent ma ocenić, czy **założenia zespołu i aplikacji** nie przesłaniają czegoś istotnego.
Żeby to zrobić, nie może tych założeń odziedziczyć. Firewall jest więc **inny przekrój informacji**, nie „mniej informacji".

## 1. Pakiet rezydenta (generuje `skrypty/pakiet_rezydenta.py`)

```
=== PAKIET DLA KONSULTANTA ZEWNĘTRZNEGO ===
[A] SUROWE DANE — dosłownie to, co wpisał lekarz prowadzący, bez redakcji:
<zawartość 00-surowe.md>

[B] ODPOWIEDZI NA DOPYTANIA — tylko odpowiedzi, bez pytań zespołu*:
<odpowiedzi użytkownika z 01-wywiad.md, bez pytań, bez komentarzy ordynatora, bez listy NIEZNANE>

[C] DECYZJA ZESPOŁU (jedno zdanie, bez uzasadnienia):
<linia REKOMENDACJA i PILNOŚĆ z 05-projekt.md>

[D] ZADANIE: patrz §2
```
\* Pytania ordynatora zdradzają, o czym zespół myślał. Rezydent dostaje same odpowiedzi — jeśli odpowiedź bez pytania
jest niezrozumiała, to sygnał, że wywiad był sugerujący, i rezydent ma to zgłosić.

**Nie trafia do pakietu:** `01-wywiad.md` (pytania, komentarze, NIEZNANE), `02-triage.json`, `03-opinie/`, `04-konsylium.md`,
uzasadnienie z `05-projekt.md`, `pamiec/`, `zrodla/`, `CLAUDE.md`, nazwy i liczba agentów, tryb sprawy, model zespołu.

## 2. Zadanie rezydenta (stały tekst)
> Jesteś lekarzem z innego ośrodka, na miesięcznym stażu. Nie znasz tego zespołu, jego zwyczajów ani narzędzi.
> Dostałeś dane pacjenta i jedno zdanie decyzji. **Załóż, że za rok okaże się, że ta decyzja była błędna.**
> Odpowiedz w ≤150 słowach, dokładnie w trzech punktach:
> 1. CZEGO BRAKUJE W DANYCH — o co nikt nie zapytał, a Ty byś zapytał.
> 2. HIPOTEZA NIEWYPOWIEDZIANA — rozpoznanie lub mechanizm, którego decyzja zdaje się nie uwzględniać.
> 3. PODEJRZANE ZAŁOŻENIE — co w tej decyzji wygląda, jakby wynikało z nawyku lub ograniczenia narzędzia, a nie z danych.
> Pod punktami jedna linia: SKRÓT: najważniejsza z Twoich uwag, jedno zdanie ≤150 znaków (do dymku w Pokoju lekarskim, docs/DYMKI.md; ordynator przepisuje tylko to zdanie).
> Nie stawiaj diagnozy. Nie proponuj leczenia. Nie oceniaj, czy decyzja jest dobra — szukaj, co mogło zostać pominięte.

## 3. Mechanika wymuszenia (Claude Code)

| Warstwa | Jak |
|---|---|
| Narzędzia | `.claude/agents/rezydent.md`: `tools: WebSearch, WebFetch, mcp__PubMed__search_articles, mcp__PubMed__get_article_metadata` — **bez Read/Glob/Grep/Bash**. Rezydent fizycznie nie może otworzyć żadnego pliku projektu. |
| Kontekst | Pakiet jest wklejany do promptu wywołania przez ordynatora. Ordynator wywołuje `pakiet_rezydenta.py` i przekazuje **wyłącznie** jego stdout. |
| Pamięć | Rezydent nie ma dostępu do `pamiec/`; każde wywołanie to świeży kontekst (subagent). |
| Źródła | PubMed tak (wiedza publiczna), `zrodla/` nie (kuratorowana selekcja zespołu — zakotwiczyłaby go na tych samych wytycznych). |
| Persona | `pakiet_rezydenta.py --persona losowa` dokleja jedną z: geriatra z małego szpitala, pediatra, lekarz SOR, lekarz z kraju o innych wytycznych (NICE/USA), lekarz medycyny paliatywnej. Rotacja per sprawa. |
| Temperatura | Rezydenci: różnorodność > powtarzalność. Jeśli uruchamiany zewnętrznie (§4) — `temperature 0.9`. |
| Jawna odpowiedź | Ordynator musi w `08-odpowiedz-rezydentom.md` odpowiedzieć na **każdy** z 3 punktów każdego rezydenta: `PRZYJMUJĘ` / `ODRZUCAM` + jeden powód. Sprawdzający procesu blokuje FINAL bez tego pliku. |

## 4. Inny model (zalecane, opcjonalne)
Prawdziwa zewnętrzność = inne uprzedzenia treningowe. Ordynator może uruchomić rezydenta przez zewnętrzny CLI:
```
python3 skrypty/pakiet_rezydenta.py sprawy/<ID> --persona losowa \
  | <cli-innego-modelu> --temperature 0.9 > sprawy/<ID>/06-rezydenci/R1.md
```
(np. `codex exec`, `gemini -p`, `ollama run <model>` — każdy, który czyta stdin). Wymaga wpisu w `.claude/settings.json` zezwalającego na tę komendę.
Bez tego: rezydent = subagent Claude z `model: haiku` lub `sonnet` (inny rozmiar niż zespół = minimalna, ale realna różnorodność).

## 5. Co robimy z uwagami rezydentów
- `PRZYJMUJĘ` + zmiana decyzji → sprawa wraca do kroku 05, licznik `zmienily_decyzje++`.
- `PRZYJMUJĘ` bez zmiany decyzji → dopisek do `CZEGO NIE WIEMY` w FINAL.
- `ODRZUCAM` → tylko log.
- Kategoria uwagi (brak danych / hipoteza / założenie) + hasło (np. „alkohol", „leki OTC", „ciąża") → `pamiec/luki.md`.
  Ta sama kategoria+hasło ≥ 3 razy w 20 sprawach → ordynator dopisuje pytanie do obowiązkowego intake w `CLAUDE.md §2`.
  **To jest właściwy mechanizm uczenia się z rezydentów: nie waga, lecz zmiana procedury.**

## 6. Czego firewall nie załatwia
- Rezydent może trafić w dokładnie to samo, co zespół — wtedy po prostu potwierdza. To też informacja.
- Rezydent widzi surowe dane, więc widzi też dane osobowe, jeśli użytkownik je wpisał. **Użytkownik anonimizuje przed wpisaniem** — `00-surowe.md` nie powinien zawierać PESEL, nazwisk, adresów. Skrypt ostrzega przy wykryciu wzorca PESEL, ale nie zastępuje dyscypliny.
