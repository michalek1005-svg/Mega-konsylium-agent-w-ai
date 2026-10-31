# START TUTAJ

## Jeśli jesteś Michałem
1. Rozpakuj ten katalog gdzieś na dysku (np. `C:\konsylium-ai`).
2. Otwórz terminal w tym katalogu i wpisz `claude`.
3. Wklej jedno zdanie:
   ```
   Przeczytaj PROMPT-NADZORCA.md w całości i działaj zgodnie z nim. Mów do mnie prosto.
   ```
4. Odpowiedz na jego 3 pytania (ścieżka do Nawigatora, ciemny motyw czy wierność Nawigatorowi, jakie masz inne modele dla rezydenta).
5. Resztę prowadzi nadzorca, fazami. Po każdej fazie dostajesz zrzuty ekranu i krótki raport. Dziennik: `docs/DZIENNIK-BUDOWY.md`.

Co czytać, żeby rozumieć projekt bez żargonu: `docs/PO-LUDZKU.md`.

## Jeśli jesteś Claude Code (nadzorcą budowy)
Twoja instrukcja to `PROMPT-NADZORCA.md`. Zanim cokolwiek zrobisz, przeczytaj ją w całości, potem `docs/ZAPIS-ROZMOWY.md`.
Nie buduj niczego, zanim nie napiszesz do Michała pierwszej wiadomości opisanej w `PROMPT-NADZORCA.md §0`.

## Mapa katalogu
```
START-TUTAJ.md            ten plik
RADY-DLA-MICHALA.md       rady dla Michała, prostym językiem
PROMPT-NADZORCA.md        instrukcja rozbudowy (adresat: Claude Code — nadzorca Konsylium)
DLA-NADZORCY-NAWIGATORA.md  przekaz dla nadzorcy Nawigatora: marka MS, dwie aplikacje (Nawigator Medyczny + Konsylium agentów AI)
CLAUDE.md                 konstytucja konsylium (czytają agenci kliniczni) — nie zmieniać znaczenia bez zgody Michała
README.md                 szybki start konsylium z terminala
.claude/agents/           13 agentów klinicznych
.claude/settings.json     uprawnienia
config/                   wagi ról, synonimy rozpoznań
schemas/                  JSON Schema: opinia, triage, werdykt, follow-up
skrypty/                  agregacja, kalibracja, pakiet rezydenta, rubryka (przetestowane)
pamiec/                   pamięć zespołu (pisze tylko ordynator)
zrodla/                   biblioteka wytycznych Michała (MANIFEST.md)
sprawy/PRZYKLAD-001/      kompletna przykładowa sprawa, wszystkie pliki 00–10
docs/
  PO-LUDZKU.md            całość bez żargonu
  ZAPIS-ROZMOWY.md        pełny zapis rozmowy, w której powstał projekt — źródło intencji
  ARCHITEKTURA.md         przepływ, triage, agregacja, kalibracja, rubryka
  PUNKTACJA.md            trzy punktacje
  FIREWALL-REZYDENTA.md   co widzi rezydent i jak to wymusić
  WSPOLNE-LEKARZ.md       zasady wspólne lekarzy stałych
  architektura.png/.mmd   diagram
```
