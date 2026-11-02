# Propozycje zmian w `.claude/` (do decyzji Michała)

`CLAUDE.md`, `config/` i `.claude/` zmienia tylko Michał (albo Kodujący na jego wyraźne polecenie). Poniżej drobne niespójności znalezione przy pisaniu instrukcji ról 2.11.2026. Nic z tego nie zostało zmienione. Numeracja kontynuuje `merytoryka/PROPOZYCJE-DEFINICJI-ROL.md` (P1–P7).

## P8. Jedno polecenie Pythona w `ordynator.md`
**Co jest:** ordynator wywołuje skrypty raz jako `python3 skrypty/…` (dymki, agregacja), raz jako `python skrypty/…` (alarm, pytanie lekarza, asystenci). Na laptopie Michała działa tylko Python 3.12 pełną ścieżką lub `python`, a `python3` nie.
**Propozycja:** wszędzie `python skrypty/…` z dopiskiem raz na górze: „na Windows `python` (lub pełna ścieżka do Pythona 3.12), w chmurze `python3`”.
**Po co:** mniej błędów przy konsylium na żywo.

## P9. Uprawnienia w `.claude/settings.json`
**Co jest:** lista `allow` przepuszcza tylko `Bash(python3 skrypty/*)`. Wywołania `python skrypty/*` (Windows) wymagają osobnej zgody.
**Propozycja:** dopisać `"Bash(python skrypty/*)"` obok istniejącego wpisu.
**Po co:** konsylium na laptopie nie zatrzymuje się na pytaniach o zgodę.

## P10. Liczba agentów w opisach
**Co jest:** opisy mówią o „13 agentach”, a w `.claude/agents/` jest 14 plików (doszedł `asystent-dowodow`).
**Stan:** opisy w `README.md` i `START-TUTAJ.md` poprawione w tej zmianie (to dokumentacja, nie definicje). `docs/ARCHITEKTURA.md` liczy skład trybu pełnego (13) – zostaje, bo asystenci są dodatkowi.
