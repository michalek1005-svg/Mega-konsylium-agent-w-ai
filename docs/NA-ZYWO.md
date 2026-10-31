# Na żywo: wywiad i konsylium na komputerze Michała

Aplikacja **MS Konsylium Narzędzia** (Windows, offline) i Claude pracują na jednym folderze na dysku: **folderze Konsylium**, czyli kopii tego repo. Aplikacja nie łączy się z siecią. Claude czyta i pisze pliki w tym folderze:

- przez **Claude Code na tym komputerze** (sesja Remote Control uruchomiona z wątku projektu albo `claude` w terminalu w folderze Konsylium) — zalecane, bo konsylium biegnie wtedy lokalnie i od razu pisze `_log.jsonl`;
- albo przez **dostęp do folderu** z wątku projektu w claude.ai.

Do Claude trafiają tylko teksty po anonimizacji (PESEL, imię i nazwisko, adres, kontakt są usuwane w aplikacji przed zapisem). Mimo to to są dane o zdrowiu: przed użyciem u prawdziwych pacjentów potrzebna jest lista RODO z `narzedzia/wywiad/README.md`.

```
<folder Konsylium>/                 kopia repo Konsylium
  wywiad-na-zywo/<KOD>/             jeden wywiad (KOD np. QWE-7K2), poza gitem (.gitignore)
    stan.json      aplikacja → Claude   zanonimizowany stan wywiadu, nadpisywany po każdej odpowiedzi
    ankieta.json   Claude → aplikacja   pytania (ms-ankieta-1 + "wersja", "koniec"), tylko dopisywane
    bledy.json     aplikacja → Claude   dlaczego aplikacja odrzuciła ankieta.json (pusta lista = OK)
    01-wywiad.md   aplikacja → Claude   gotowy wywiad po kliknięciu „Wyślij do Konsylium”
  sprawy/<ID>/                      konsylium jak zwykle; _log.jsonl czyta Pokój lekarski co 3 s
```

## 1. Przebieg

1. Lekarz w aplikacji wybiera **Folder Konsylium** (menu po lewej, raz).
2. Wywiad → **Na żywo z Konsylium**. Pacjent opisuje dolegliwości własnymi słowami. Aplikacja zapisuje `stan.json` z etapem `czeka-na-pytania` i pokazuje pacjentowi „Dobieram kolejne pytania…”.
3. Claude czyta stan, dopisuje 2–4 pytania do `ankieta.json`. Aplikacja sprawdza plik co 1,5 s i od razu pokazuje pytanie. Po każdej odpowiedzi nadpisuje `stan.json`. Gdy pytania się skończą, pacjent znowu widzi „Dobieram…”, a Claude dopisuje kolejne. Ostatnia partia ma `"koniec": true`.
4. Lekarz w trakcie może kliknąć **Dołącz wyniki badań**: otwiera się anonimizator, a **Dołącz do wywiadu** wraca z zanonimizowanym tekstem. Wyniki są w `stan.json` (`wyniki`) i w `01-wywiad.md`.
5. Na końcu **Wyślij do Konsylium** zapisuje `01-wywiad.md`. Claude zakłada `sprawy/<ID>/`, kopiuje wywiad i prowadzi konsylium, zapisując dymki skryptem `skrypty/dymek.py`.
6. Zakładka **Pokój lekarski** sama pokazuje najnowszą sprawę z `sprawy/` i dociąga dymki na żywo. Gdy konsylium zapisze `09-FINAL.md`, pokój sam otwiera ekran **Wnioski** (rekomendacja, pilność, plan B, czego nie wiemy, kiedy wrócić, źródła); przycisk „Wnioski” otwiera go ponownie.

## 2. Instrukcja dla Claude (pętla wywiadu)

Pracuj w katalogu głównym folderu Konsylium. Na Windows uruchamiaj skrypty jako `python`, gdzie indziej `python3`.

```
python skrypty/wywiad_na_zywo.py czekaj                     # czeka do 9 min na nowy stan; wypisuje podsumowanie
python skrypty/wywiad_na_zywo.py dodaj --kod KOD --pytania nowe.json [--koniec]
python skrypty/wywiad_na_zywo.py czekaj --kod KOD --po <numer stanu z podsumowania>
python skrypty/wywiad_na_zywo.py zakoncz --kod KOD          # koniec bez nowych pytań
```

Zasady:

- **Szybko.** Pacjent czeka przy komputerze. Odpowiadaj na stan w kilkanaście sekund. Pierwsza partia: 3–4 pytania wykluczające stany nagłe dla tego opisu. Potem partie po 2–3 pytania, dopisywane, zanim pacjent skończy poprzednie (podsumowanie mówi, ile zostało w kolejce).
- Format pytań i flag: `narzedzia/wywiad/FORMAT-ANKIETY.md` (per „Ty”, formy „zauważyłaś/zauważyłeś”, bez sugerowania rozpoznania, uzasadnienie w `bo`, flaga `112`/`pilne` przy każdym pytaniu o zagrożenie). Plik `--pytania` to lista pytań albo `{"pytania": […], "flagi": […]}`.
- **Tylko dopisuj.** Nie zmieniaj ani nie usuwaj pytań, na które pacjent mógł już odpowiedzieć. Nowe pytanie ważniejsze od czekających oznacz wyższym `priorytet` (np. 95).
- Nie pytaj o to, co jest już w odpowiedziach albo w `zOpisu`. Pytania warunkowe opieraj na `gdy`.
- Gdy w `stan.json` jest flaga `112`, aplikacja już pokazała pacjentowi alarm. Nie dopisuj dalszych pytań bez potrzeby: `zakoncz`.
- Razem zwykle 8–20 pytań, najwyżej 3–4 minuty pacjenta. Na końcu pytanie o obawy i oczekiwania (`bezNieznanych: true`) i `--koniec`.
- Jeśli podsumowanie pokazuje „Aplikacja odrzuciła ankieta.json”, popraw błąd i dopisz ponownie.
- Nie zapisuj hipotezy w ankiecie ani w plikach wywiadu (ślepa tura). Swoje przemyślenia trzymaj dla siebie.

## 3. Instrukcja dla Claude (konsylium na żywo)

Gdy podsumowanie mówi „Wywiad wysłany”:

1. Załóż `sprawy/<RRRR-MM-DD-NN>/`, skopiuj `wywiad-na-zywo/<KOD>/01-wywiad.md` jako `00-surowe.md` i `01-wywiad.md` (wywiad już jest zamknięty: lista NIEZNANE jedzie dalej, bez dodatkowych tur pytań, chyba że lekarz dopisze odpowiedzi w czacie).
2. Prowadź konsylium według `CLAUDE.md` i `PROMPT-NADZORCA.md`, z modelami jak w `.claude/agents/`.
3. **Dymki od razu po każdej wypowiedzi**, nie po całym kroku: `python skrypty/dymek.py sprawy/<ID> --rola … --faza "…" --skrot "…" [--info "…"]`. Skrót to 1–2 pełne zdania językiem medycznym (do 400 znaków), a `--info` to linia z liczbami, skalami i wytycznymi (docs/DYMKI.md). Na początku każdej fazy dymek ordynatora z `--temat`.
4. Na końcu `09-FINAL.md` jak zwykle. Lekarz widzi przebieg w zakładce Pokój lekarski.

## 4. Co zainstalować na Windows

1. **MS Konsylium Narzędzia 0.5.0** (zip z projektu): rozpakuj i uruchom `MS Konsylium Narzedzia.exe`.
2. **Folder Konsylium**: kopia repo (zip z GitHub albo z paczki projektu) rozpakowana np. do `Dokumenty\MS-Konsylium`. W aplikacji: Folder Konsylium → Wybierz folder….
3. **Python 3** (dla `dymek.py` i `wywiad_na_zywo.py`): w PowerShell `winget install Python.Python.3.12` albo instalator z python.org z zaznaczonym „Add python.exe to PATH”.
4. **Claude na tym komputerze**: aplikacja Claude Desktop z włączonym Remote Control (sesja startowana z wątku projektu w tym folderze) albo Claude Code (`claude` w terminalu w folderze Konsylium).
