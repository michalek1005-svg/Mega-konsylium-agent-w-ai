# Na żywo: wywiad i konsylium psychologiczne na komputerze

Działa jak w MS Konsylium (docs/NA-ZYWO.md w głównym repo), w folderze `ms-psycho`:

- **Wywiad** (zakładka Wywiad → „Na żywo z Konsylium”): `python skrypty/wywiad_na_zywo.py czekaj` / `dodaj --kod KOD --pytania nowe.json [--koniec]` / `zakoncz`. Format pytań: docs/FORMAT-ANKIETY.md. **Pierwsza partia zawsze bezpieczeństwo**: przesiew C‑SSRS (klikalnie, tak/nie) i bezpieczeństwo w domu, z flagą `112` przy odpowiedziach wysokiego ryzyka; potem PHQ‑9, GAD‑7, AUDIT‑C, sen, substancje, leki, choroby, wcześniejsze terapie, wsparcie, cel, gotowość 0–10 i pytanie wiodące (CLAUDE.md §4). Pytania per „Ty”, bez sugerowania rozpoznania, otwarte najwyżej 2–3.
- **Konsylium**: sprawę zakłada aplikacja (`sprawy/<RRRR-MM-DD-NN>/`), z Wywiadu albo z Rozmowy („Zwołaj konsylium”). Pokój pokazuje najnowszą sprawę sam. Dymki: `python skrypty/dymek.py sprawy/<ID> --rola <rola psychologiczna> --faza "<faza>" --skrot "…"`. Role: prowadzacy, terapeuta-cbt, terapeuta-psychodynamiczny, terapeuta-systemowy, terapeuta-act, terapeuta-humanistyczny, diagnosta, psychiatra, straznik-ryzyka, zastepca-zlozonosc, zastepca-niepewnosc, sprawdzajacy-zrodel, sprawdzajacy-etyki, stazysta, klient-sedzia, rzecznik-normalnosci.
- **Terapeuta prowadzący** (użytkownik) pisze w Pokoju; `python skrypty/uwagi_lekarza.py sprawy/<ID>` przed każdą rundą.
- **Rozmowa**: docs/ROZMOWA.md.

## Sygnał „AI pracuje”

Gdy Claude (Remote Control) pracuje na komputerze, aplikacja pokazuje w lewym dolnym rogu pulsującą kropkę „AI pracuje”, a logo K świeci. Źródłem jest plik `_ai-aktywnosc.json` w folderze Konsylium (`{"stan":"pracuje"|"czeka","czas":<ms>}`); sygnał gaśnie po stanie `czeka` albo po 90 s bez odświeżenia.

Plik zapisuje `skrypty/ai_aktywnosc.ps1`, wywoływany przez hooki Claude Code w `.claude/settings.local.json` folderu Konsylium (plik lokalny, nie trafia do repo):

```json
{ "hooks": {
  "UserPromptSubmit": [{ "hooks": [{ "type": "command", "command": "powershell -NoProfile -ExecutionPolicy Bypass -File skrypty\\ai_aktywnosc.ps1 -Stan pracuje -Dioda" }] }],
  "PreToolUse":       [{ "matcher": "*", "hooks": [{ "type": "command", "command": "powershell -NoProfile -ExecutionPolicy Bypass -File skrypty\\ai_aktywnosc.ps1 -Stan pracuje -Dioda" }] }],
  "Stop":             [{ "hooks": [{ "type": "command", "command": "powershell -NoProfile -ExecutionPolicy Bypass -File skrypty\\ai_aktywnosc.ps1 -Stan czeka -Dioda" }] }]
} }
```

`-Dioda` zapala diodę **Scroll Lock** na czas pracy i gasi ją po zakończeniu (jeśli klawiatura ma tę diodę). Caps Lock celowo nie: jego przełączenie zmienia pisanie na wielkie litery.

