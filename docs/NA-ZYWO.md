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
- **Klikalnie, nie pisemnie (Michał 1.11.2026).** Pacjent nie ma dużo pisać: pytania `jeden`, `wiele`, `skala`, tak/nie/nie wiem, godziny i czasy z listy opcji. Pytanie `tekst` tylko wtedy, gdy nie da się go zamknąć w opcjach (np. nazwa leku z opakowania), najwyżej 2–3 na całą ankietę.
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
4. **Dymki tylko z treścią medyczną** (docs/DYMKI.md): opinie i zdania lekarzy, bez wag, agregacji i opisu procesu. Etapy techniczne dostają najwyżej jeden dymek ordynatora z `--temat`.
5. Na końcu `09-FINAL.md` jak zwykle. Lekarz widzi przebieg w zakładce Pokój lekarski.

## Lekarz prowadzący w dyskusji (Michał 1.11.2026)

Użytkownik ma w Pokoju lekarskim rolę **Lekarz prowadzący** i pole „Dopisz do dyskusji”. Każdy wpis aplikacja dopisuje do `sprawy/<ID>/uwagi-lekarza.jsonl` (linia JSON: `ts`, `rola: lekarz_prowadzacy`, `faza`, `skrot`, `pelny`) i od razu pokazuje jako dymek nad jego postacią.

Ordynator **przed każdą wypowiedzią roli i przed każdą rundą** sprawdza nowe wpisy:
```
python skrypty/uwagi_lekarza.py sprawy/<ID>          # tylko nowe (znacznik _uwagi-przeczytane.json)
python skrypty/uwagi_lekarza.py sprawy/<ID> --czekaj 600   # czeka do 10 min, np. przed werdyktem
```
Każdą uwagę przekazuje właściwym rolom w treści ich promptu („Lekarz prowadzący dopisał: …”), a one odnoszą się do niej w najbliższej wypowiedzi (medycznie, nie „dziękuję za uwagę”). Fakt podany przez lekarza prowadzącego ma rangę odpowiedzi z wywiadu: trafia do `01-wywiad.md` jako dopisek z godziną i może zmienić ranking. Po `09-FINAL.md` ordynator czeka jeszcze 10 minut na uwagi (`--czekaj 600`); nowa uwaga otwiera dodatkową rundę i poprawkę werdyktu.

## 4. Co zainstalować na Windows

1. **MS Konsylium Narzędzia 0.5.0** (zip z projektu): rozpakuj i uruchom `MS Konsylium Narzedzia.exe`.
2. **Folder Konsylium**: kopia repo (zip z GitHub albo z paczki projektu) rozpakowana np. do `Dokumenty\MS-Konsylium`. W aplikacji: Folder Konsylium → Wybierz folder….
3. **Python 3** (dla `dymek.py` i `wywiad_na_zywo.py`): w PowerShell `winget install Python.Python.3.12` albo instalator z python.org z zaznaczonym „Add python.exe to PATH”.
4. **Claude na tym komputerze**: aplikacja Claude Desktop z włączonym Remote Control (sesja startowana z wątku projektu w tym folderze) albo Claude Code (`claude` w terminalu w folderze Konsylium).

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

## Literatura w konsylium na żywo (wniosek z 1.11.2026)

W pierwszym przebiegu na żywo lekarze mieli PubMed, ale korzystali z niego słabo: ordynator ograniczył każdą rolę do 3 wyszukiwań „bo lekarz czeka”, w rundzie 2 zakazał wyszukiwań, a wiele zapytań dało 0 wyników. Od teraz:

1. **Bez limitu wyszukiwań.** Czas konsylium nie jest ważniejszy od źródeł. Każda rola lekarska i Sprawdzający faktów wykonuje **co najmniej 3 skuteczne zapytania** do PubMed (zapytanie bez wyników nie liczy się; wtedy zmienić hasła, użyć MeSH, rozszerzyć lata). Zapytania i PMID zapisać w polu `zrodla` opinii.
2. **Nazwa narzędzia.** Na komputerze użytkownika wtyczka PubMed nazywa się `mcp__plugin_pubmed_PubMed__*` (w chmurze `mcp__PubMed__*`). Ordynator sprawdza na starcie, która istnieje, i podaje właściwą nazwę każdej roli. Gdy wtyczki nie ma, zostaje E-utilities (`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=…`) przez WebFetch.
3. **Pytanie użytkownika ma pierwszeństwo przed torem.** Jeśli lekarz pyta o czynnik etiologiczny, ordynator w `01-wywiad.md` zapisuje „Pytanie: czynnik etiologiczny”, a konsylium odpowiada rankingiem czynników (leki, składniki, ekspozycje) z mechanizmem i uzasadnieniem; pilność jest wtedy tylko dopiskiem. Rekomendacja „oceń dziś” bez odpowiedzi na pytanie jest błędem procesu.
4. **Każde twierdzenie w dymku INFO i w 09-FINAL** ma PMID/DOI albo etykietę `[wiedza modelu, niezweryfikowane]`; etykieta na tezie głównej oznacza, że opinia jest niekompletna i wraca do roli.
5. **Każda runda dyskusji to osobne wywołanie dla każdej roli** (z lekturą `03-opinie/` i poprzednich rund). Ordynator nie spisuje rundy sam „za wszystkich”; taki wpis Sprawdzający procesu odrzuca. Modele ról wg definicji w `.claude/agents/`, bez samowolnej zamiany na tańsze. Rezydent dostaje pakiet w treści promptu, nie przez ścieżkę pliku.
