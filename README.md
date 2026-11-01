# Konsylium AI

**Narzędzie testowe i edukacyjne marki MS** (rodzeństwo Nawigatora Medycznego) — nie służy do decyzji u realnych pacjentów.

Wieloagentowe konsylium lekarskie w Claude Code: ordynator, 3 zastępców (triage), 6 lekarzy o różnych podejściach,
2 sprawdzających i rezydenci z zewnątrz, którzy celowo widzą tylko surowe dane.

**Zacznij od `START-TUTAJ.md`.** Wyjaśnienie bez żargonu: `docs/PO-LUDZKU.md`. Instrukcja rozbudowy dla Claude Code: `PROMPT-NADZORCA.md`.

## Szybki start
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
.claude/agents/           13 ról
.claude/settings.json     uprawnienia
config/wagi.yaml          wagi ról per tor, progi triage
schemas/                  JSON Schema opinii, triage, werdyktu, follow-upu
skrypty/                  agregacja, kalibracja, pakiet rezydenta, rubryka
pamiec/                   pamięć zespołu (pisze tylko ordynator)
zrodla/                   Twoja biblioteka wytycznych
sprawy/                   jedna sprawa = jeden katalog (PRZYKLAD-001 w środku)
docs/                     PO-LUDZKU, ARCHITEKTURA, FIREWALL-REZYDENTA, PUNKTACJA
```

## Skąd to się wzięło
- Bean i wsp. 2025 (Oxford): LLM sam 94,9 % trafnych rozpoznań, człowiek z LLM 34,5 %, człowiek bez LLM 47 %.
  Wniosek: model musi **sam prowadzić wywiad** i kończyć **jedną decyzją**. → intake ordynatora, format FINAL.
- Goh i wsp. 2024 (Stanford, JAMA Netw Open): lekarze z GPT-4 76 % vs bez 74 %; GPT-4 sam o 16 pkt lepiej. → rubryka oceny.
- Microsoft MAI-DxO 2025: panel agentów o różnych podejściach 85,5 % vs lekarze 20 % na przypadkach NEJM. → role lekarzy, gospodarz kosztów.
- Oxford: symulowani pacjenci nie przewidują ludzi. → nie testuj tego tylko na syntetycznych przypadkach.
