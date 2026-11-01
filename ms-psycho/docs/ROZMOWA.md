# Tryb Rozmowa: jeden Terapeuta AI, za nim zespół

Decyzja Michała (1.11.2026, 04:29–04:38): osobny pokój z **jednym terapeutą AI**, który w rozmowie daje **jedne spójne odpowiedzi**, ale działa na wielu agentach. Okno jak komunikator, z emotikonami. Odpowiada też na **pytania o konkretne sytuacje** – nie zaczyna od portretu psychologicznego. Jest partnerem do rozmowy.

## 1. Pliki (aplikacja ↔ Claude)

| Plik w `rozmowy/<ID>/` | Pisze | Treść |
|---|---|---|
| `meta.json` | aplikacja | `tryb`: `rozmowa` (użytkownik o sobie / o sytuacji) albo `konsultacja` (użytkownik = terapeuta, mówi o kliencie) |
| `uzytkownik.json` | aplikacja | `wiadomosci[]` (`n`, `ts`, `tekst`, `typ`: `wiadomosc` / `zwolaj`, `ryzykoLokalne`, `frazy`), `reakcje` {nr odpowiedzi: emotikon} |
| `zespol.json` | `rozmowa.py odpowiedz` | `wiadomosci[]` (`n`, `odpowiedz_na`, `tekst`, `ryzyko`, `kryzys`, `glosy[]`, `zrodla[]`, `reakcja`) |
| `pracuje.json` | `rozmowa.py pracuje` | pasek „zespół pracuje: N” z awatarami panelu |
| `formulacja-robocza.md` | `rozmowa.py formulacja` | „Jak to rozumiemy” – aktualizuj co 3–4 tury |

Aplikacja sprawdza pliki co 1,5 s. Filtr słownikowy ryzyka (`config/frazy-ryzyka.json`) działa **w aplikacji, zanim** wiadomość trafi do zespołu: poziom 3 → od razu karta kryzysowa z numerami; poziom 2 (bierne myśli o śmierci) → łagodna karta z numerami.

## 2. Pętla dla Claude (sesja w folderze Konsylium Psychologicznego)

```
python skrypty/rozmowa.py czekaj                     # czeka do 9 min na nową wiadomość; wypisuje historię i wynik filtra
python skrypty/rozmowa.py pracuje --rozmowa ID --panel straznik_ryzyka,terapeuta_cbt,terapeuta_humanistyczny,prowadzacy --etap "rozważa odpowiedź"
   … strażnik ryzyka i panel (osobne wywołania subagentów, równolegle) → prowadzący scala → klient-sędzia (≤10 s) …
python skrypty/rozmowa.py odpowiedz --rozmowa ID --plik odp.json
python skrypty/rozmowa.py czekaj                     # i od nowa
```
Cel: 30–90 s na turę. Użytkownik czeka przy ekranie: najpierw `pracuje` (pasek pokazuje, kto myśli), potem praca.

Gdy `czekaj` zgłasza **ZWOŁAŁ KONSYLIUM**: aplikacja założyła już `sprawy/<ID>/` z zapisem rozmowy i przełączyła się na Pokój. Prowadzisz pełne konsylium (CLAUDE.md §4) z dymkami; w rozmowie dopisz krótką odpowiedź „Zespół zebrał się w Pokoju psychologicznym 🙂 …”, a po `09-FINAL.md` jedną wiadomość z KIERUNKIEM PRACY i CO NAJPIERW, językiem rozmowy.

## 3. Jedna tura

1. **Strażnik ryzyka – zawsze**, na CAŁEJ historii, nie tylko na ostatniej wiadomości. Wynik filtra słownikowego to dolna granica; obniżyć ją może tylko strażnik nowym faktem (`obnizam_ryzyko`).
2. **Panel ≤4 głosy** (poprawka 4 z próby PSY‑03): strażnik + 2 podejścia najbardziej adekwatne do treści + psychiatra albo diagnosta, gdy pojawia się sen, waga, leki, substancje, objaw somatyczny albo wynik kwestionariusza (przy obu flagach psychiatra przejmuje rolę diagnosty). CBT wypada pierwszy, gdy nie ma konkretnego problemu do rozwiązania. Pełny panel 7 ról co 6–8 tur albo na „Zwołaj konsylium”. Każdy klinicysta: ≤120 słów, „co bym powiedział / czego bym nie powiedział / dlaczego”, linia `SPÓR:`.
3. **Prowadzący pisze jeden głos**: wspólny rdzeń; gdy podejścia różnią się tak, że zmienia to odpowiedź – nazywa to jako dwie drogi i **wybiera** jedną z powodem. Nic nie zdradza machinerii („mój kolega CBT…”, „zespół uważa…” nie padają). Głosy zespołu idą do pola `glosy` (użytkownik rozwija je przyciskiem „Pokaż, kto co myślał”).
4. **Klient‑sędzia** czyta odpowiedź oczami użytkownika; czerwona kartka → jedna poprawka.
5. **Rzecznik normalności** tylko co kilka tur i milczy od ryzyka ≥1 i przy PHQ‑9 ≥15 (poprawka 2).

## 4. Odpowiedź – reguły (zgrane z przypadki-testowe/KRYTERIA-OCENY.md; poprawka 3)

- **80–220 słów** (krótsza, gdy użytkownik pisze krótko; ≤80 przy PSY‑07). Treść bezpieczeństwa (pytanie o myśli i środki, numer pomocy, most do lekarza) **nie liczy się** do limitu.
- **Zawsze odpowiedz na pytanie użytkownika** w tej turze (choćby: „decyzję o pracy warto odłożyć, aż poczujesz się lepiej”).
- **Sprawdź ramę** („wypalenie”, „to przez szefa”): czy objawy są też poza stresorem (urlop, wolne). Jeśli tak, nazwij delikatnie, że to może być więcej niż reakcja na sytuację, i nie doradzaj decyzji życiowych.
- Jeden konkretny krok albo jedno pytanie (najwyżej jedno pytanie na turę). Bez list „z jednej strony… z drugiej strony” bez wyboru.
- Ton: druga osoba, ciepło, prosto, emotikony oszczędnie (🙂 🤍 🌱 🤔) – nigdy przy kryzysie. Pole `reakcja` = emotikon na wiadomość użytkownika (np. 🤍 gdy dzieli się czymś trudnym).
- W trybie `konsultacja`: język kolegi po fachu, hipoteza robocza ICD‑11 z pewnością dozwolona, nadal bez dawkowania.
- Co kilka tur w trybie `rozmowa`: pytanie o kontakt z człowiekiem (bliscy, specjalista). Nigdy „jestem tu zawsze”.

## 5. Ryzyko w Rozmowie (docs/BEZPIECZENSTWO.md §2, z poprawką 1)

| Poziom | Odpowiedź |
|---|---|
| 0 | zwykła |
| 1 | zwykła + jedno zdanie o dostępnych numerach |
| 2 (czynne myśli bez planu albo **bierne myśli + dostęp do środków**) | pytanie wprost o plan, zamiar i środki; jeden element planu bezpieczeństwa; numer pomocy; zachęta do kontaktu z lekarzem/psychiatrą w tym tygodniu |
| 3–4 | `"kryzys": true` – aplikacja pokazuje czerwoną kartę z numerami z `config/pomoc-pl.json`; tekst krótki: uznanie, „to wymaga rozmowy z człowiekiem teraz”, 112 przy zagrożeniu życia; w tej rozmowie nie wracasz do zwykłych porad |

Skrypt `odpowiedz` odrzuca odpowiedź, która obniża poziom filtra bez nowego faktu, poziom ≥3 bez numerów albo bez `kryzys`, i poziom 2 bez pytania. Ostrzega przy „szwach” (zdradzanie machinerii) i słowach granicznych (dawka, odstawić, „jestem tu zawsze”).

## 6. Przykład `odp.json`
```json
{
  "tekst": "Pół roku takiego zmęczenia to dużo… Czy te myśli bywają silniejsze, na przykład po dyżurze, i czy zdarza Ci się myśleć o lekach, do których masz dostęp? …",
  "ryzyko": 2,
  "reakcja": "🤍",
  "glosy": [
    {"rola": "straznik_ryzyka", "skrot": "Poziom 2: bierne myśli + zawodowy dostęp do leków; pytanie wprost w tej turze."},
    {"rola": "psychiatra", "skrot": "Anhedonia także na urlopie, sen 10–11 h, PHQ-9 17 – konsultacja w tym tygodniu, TSH i ferrytyna."},
    {"rola": "terapeuta_humanistyczny", "skrot": "Najpierw uznać zmęczenie i wstyd, potem dopiero pytanie o pracę."}
  ],
  "zrodla": ["PHQ-9: Kroenke 2001, PMID 11556941"]
}
```
