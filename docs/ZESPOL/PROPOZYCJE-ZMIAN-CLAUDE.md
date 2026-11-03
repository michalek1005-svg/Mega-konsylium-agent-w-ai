# Propozycje zmian w `.claude/` (do decyzji Michała)

`CLAUDE.md`, `config/` i `.claude/` zmienia tylko Michał (albo Kodujący na jego wyraźne polecenie). Poniżej drobne niespójności znalezione przy pisaniu instrukcji ról 2.11.2026. Nic z tego nie zostało zmienione. Numeracja kontynuuje `merytoryka/PROPOZYCJE-DEFINICJI-ROL.md` (P1–P7).

## P8. Jedno polecenie Pythona w `ordynator.md`
**Status: PRZYJĘTE (Michał, ankieta 3.11.2026 13:48) – wdraża Kodujący.**
**Co jest:** ordynator wywołuje skrypty raz jako `python3 skrypty/…` (dymki, agregacja), raz jako `python skrypty/…` (alarm, pytanie lekarza, asystenci). Na laptopie Michała działa tylko Python 3.12 pełną ścieżką lub `python`, a `python3` nie.
**Propozycja:** wszędzie `python skrypty/…` z dopiskiem raz na górze: „na Windows `python` (lub pełna ścieżka do Pythona 3.12), w chmurze `python3`”.
**Po co:** mniej błędów przy konsylium na żywo.

## P9. Uprawnienia w `.claude/settings.json`
**Status: PRZYJĘTE (Michał, ankieta 3.11.2026 13:48) – wdraża Kodujący.**
**Co jest:** lista `allow` przepuszcza tylko `Bash(python3 skrypty/*)`. Wywołania `python skrypty/*` (Windows) wymagają osobnej zgody.
**Propozycja:** dopisać `"Bash(python skrypty/*)"` obok istniejącego wpisu.
**Po co:** konsylium na laptopie nie zatrzymuje się na pytaniach o zgodę.

## P10. Liczba agentów w opisach
**Co jest:** opisy mówią o „13 agentach”, a w `.claude/agents/` jest 14 plików (doszedł `asystent-dowodow`).
**Stan:** opisy w `README.md` i `START-TUTAJ.md` poprawione w tej zmianie (to dokumentacja, nie definicje). `docs/ARCHITEKTURA.md` liczy skład trybu pełnego (13) – zostaje, bo asystenci są dodatkowi.

## P11. Ordynator zna tryby 1–3 i paczkę z Nawigatora
**Status: czeka na decyzję (karta w ankiecie decyzji).**
**Co jest:** `.claude/agents/ordynator.md` i `CLAUDE.md` nie wspominają o paczce z Nawigatora ani o trybach 2 (szybki) i 3 (pełny bez grafiki). Regulamin jest na razie w `docs/ZESPOL/TRYBY-KONSYLIUM.md` i w `docs/NA-ZYWO.md`.
**Propozycja:** dopisać w `ordynator.md` krótki akapit: „Gdy sprawa jest paczką z Nawigatora, przeczytaj `docs/ZESPOL/TRYBY-KONSYLIUM.md` i działaj wg linii „Tryb:”. W trybie 2 – skład ordynator + 1–3 role, wiadomości w blokach BADANIA/PODEJRZENIA/LEKI/ZALECENIA, na końcu Wnioski. W trybie 3 – pełny przebieg bez dymków i folderu wymiany. Jeśli role nie były osobnymi wywołaniami, powiedz to.” Opcjonalnie w `CLAUDE.md §0` jedno zdanie o trzech trybach.
**Po co:** ordynator uruchomiony bez wątku-roli też zna tryby.
