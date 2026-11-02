# Konsylium AI

**Narzędzie testowe i edukacyjne marki MS** (rodzeństwo Nawigatora Medycznego) — nie służy do decyzji u realnych pacjentów.

Wieloagentowe konsylium lekarskie: ordynator, 3 zastępców (triage), 6 lekarzy o różnych podejściach,
asystenci dowodów, 2 sprawdzających i rezydenci z zewnątrz, którzy celowo widzą tylko surowe dane.

## Stan na 2.11.2026
- **Aplikacja MS Konsylium 0.6.0** (Windows, Electron, styl Nawigatora Medycznego, tryb jasny domyślnie) prowadzi cały przebieg:
  klikalny wywiad → pytania AI na żywo → konsylium w **Pokoju lekarskim** (dymki z opiniami lekarzy) → Wnioski z PMID/DOI.
  Ta sama aplikacja działa na **iPadzie** w Safari przez domową sieć Wi‑Fi (`docs/IPAD.md`). Konsylium uruchamia sam Michał.
- Kod aplikacji: `narzedzia/` (powłoka, Pokój lekarski, wywiad, anonimizator Synevo). Tryb na żywo: `docs/NA-ZYWO.md`.
- **Zespół asystentów (wątki-role projektu)** i ich prompty startowe: [`docs/ZESPOL/`](docs/ZESPOL/README.md).
- Aplikacja psychologiczna (`ms-psycho/`) to **osobny projekt** z własnym zespołem (osobna gałąź); tu nie wprowadzamy w niej zmian.

Wyjaśnienie bez żargonu: `docs/PO-LUDZKU.md`. Pierwotna instrukcja budowy (historyczna): `PROMPT-NADZORCA.md`.

## Szybki start z terminala (bez aplikacji)
```bash
cd konsylium-ai
claude                       # Claude Code w tym katalogu wczyta CLAUDE.md i .claude/agents/
> Nowa sprawa: kobieta 54 l., od 3 dni ból w nadbrzuszu po posiłkach, nudności, bez gorączki...
```
Ordynator dopyta, zastępcy zdecydują o trybie, reszta pójdzie sama. Wynik: `sprawy/<ID>/09-FINAL.md`.

Po czasie, gdy wiesz, co było naprawdę:
```bash
# wpisz sprawy/<ID>/10-followup.md wg szablonu, potem:
python3 skrypty/kalibracja.py sprawy/<ID>
```

## Dodawanie źródeł
Wrzuć PDF/MD/TXT do `zrodla/` i dopisz wiersz do `zrodla/MANIFEST.md` (co to, rok, kto wydał).
Co jest w `zrodla/`, ma pierwszeństwo przed wiedzą modelu.

## PubMed
Agenci wołają narzędzia `mcp__PubMed__search_articles`, `get_article_metadata`, `get_full_text_article`, `lookup_article_by_citation`.
Jeśli masz PubMed podłączony jako konektor w koncie claude.ai (tak jak w sesji, w której powstał ten projekt) — nic nie rób, działa.
Jeśli nie — dodaj serwer PubMed MCP przez `claude mcp add` i sprawdź, czy nazwy narzędzi się zgadzają; jeśli nie, popraw pole `tools:` w `.claude/agents/*.md`.

## Struktura
```
CLAUDE.md                 konstytucja zespołu (czyta każdy agent stały)
.claude/agents/           14 ról konsylium (w tym asystent-dowodow)
.claude/settings.json     uprawnienia
config/wagi.yaml          wagi ról per tor, progi triage
schemas/                  JSON Schema opinii, triage, werdyktu, follow-upu
skrypty/                  agregacja, kalibracja, pakiet rezydenta, rubryka
pamiec/                   pamięć zespołu (pisze tylko ordynator)
zrodla/                   Twoja biblioteka wytycznych (karty źródłowe + MANIFEST.md)
merytoryka/               recenzje spraw, propozycje definicji ról, katalog polskich wytycznych
sprawy/                   jedna sprawa = jeden katalog (PRZYKLAD-001 w środku)
narzedzia/                aplikacja: powloka (Windows + iPad), pokoj-lekarski, wywiad, anonimizator, wspolne
docs/                     PO-LUDZKU, ARCHITEKTURA, NA-ZYWO, IPAD, DYMKI, SPOR, FIREWALL-REZYDENTA, PUNKTACJA
docs/ZESPOL/              instrukcje i prompty ról asystentów projektu
```

## Skąd to się wzięło
- Bean i wsp. 2025 (Oxford): LLM sam 94,9 % trafnych rozpoznań, człowiek z LLM 34,5 %, człowiek bez LLM 47 %.
  Wniosek: model musi **sam prowadzić wywiad** i kończyć **jedną decyzją**. → intake ordynatora, format FINAL.
- Goh i wsp. 2024 (Stanford, JAMA Netw Open): lekarze z GPT-4 76 % vs bez 74 %; GPT-4 sam o 16 pkt lepiej. → rubryka oceny.
- Microsoft MAI-DxO 2025: panel agentów o różnych podejściach 85,5 % vs lekarze 20 % na przypadkach NEJM. → role lekarzy, gospodarz kosztów.
- Oxford: symulowani pacjenci nie przewidują ludzi. → nie testuj tego tylko na syntetycznych przypadkach.
