# Tryb ROZMOWA: jeden terapeuta AI, za nim zespół agentów

Michał (1.11.2026): „Ma to działać też w formie pytania o konkretne sytuacje, a nie od razu tworzenia portretu psychologicznego. To ma być jak partner do rozmowy, który radzi na podstawie konsylium agentów i wyraża opinię w postaci jednej spójnej odpowiedzi tekstowej; forma i okno jak w komunikatorze, emotikonki też.” Oraz: „Odrębnie konsylium i odrębnie pokój z jednym terapeutą AI dającym jedne odpowiedzi w rozmowie, ale działający na wielu agentach.”

Zakładka **Rozmowa** w aplikacji to okno komunikatora. Użytkownik pisze o konkretnej sytuacji. Odpowiada jeden głos („Terapeuta MS”), ale każdą odpowiedź przygotowuje panel agentów: strażnik ryzyka + 2 podejścia terapeutyczne (+ diagnosta albo psychiatra, gdy pojawi się objaw somatyczny, lek, substancja, pytanie o rozpoznanie). Prowadzący scala głosy w jeden tekst. Reguły routingu i scalania: docs/SIEC-AGENTOW.md §1 i docs/KONCEPCJA.md §5.

## 1. Pliki (folder Konsylium = kopia tego repo)

```
rozmowa/<KOD>/                 jedna rozmowa (KOD np. R7K-2QX), poza gitem
  wiadomosci.jsonl             aplikacja ↔ Claude: jedna linia = jedna wiadomość
  stan.json                    aplikacja → Claude: {"kod","numer","czekaNaOdpowiedz":true,"ostatnia":"…","odbiorca":"klient|terapeuta"}
  formulacja-robocza.md        Claude: narastające streszczenie (fakty, cel, podejście wiodące, ryzyko) — czyta je strażnik w każdej turze
  panel.json                   Claude → aplikacja: {"pracuja":["cbt","systemowy","straznik"],"od":<ms>} — pasek „zespół pracuje”
```

Linia w `wiadomosci.jsonl`:
```json
{"ts":"2026-11-01T06:10:00+00:00","od":"uzytkownik","tekst":"Od tygodnia nie śpię przed rozmowami z szefem…"}
{"ts":"2026-11-01T06:10:48+00:00","od":"zespol","tekst":"…jeden głos…","panel":["cbt","act","straznik"],"ryzyko":0,
 "glosy":[{"rola":"cbt","skrot":"…"},{"rola":"act","skrot":"…"}],"spor":"ACT: nie planować ekspozycji, zanim…","odbiorca":"terapeuta"}
```
Pola odpowiedzi zespołu: `tekst` (jeden głos, ≤180 słów), `panel` (role, które pracowały), `ryzyko` (0–4 wg strażnika), `glosy` (SKRÓT każdej roli; aplikacja pokazuje je w rozwijanym „Kto co myślał”), `spor` (jedno zdanie, z czym które podejście się nie zgodziło), `odbiorca`, opcjonalnie `plan_bezpieczenstwa` (tekst) i `przerwanie: true` (tor kryzysowy).

## 2. Instrukcja dla Claude (prowadzący)

Pracuj w katalogu głównym folderu Konsylium (Windows: `python`, inaczej `python3`).

```
python skrypty/rozmowa.py czekaj                      # czeka (do 9 min) na nową wiadomość użytkownika w najnowszej rozmowie
python skrypty/rozmowa.py czekaj --kod R7K-2QX --po 3
python skrypty/rozmowa.py pokaz --kod R7K-2QX         # cała rozmowa + formulacja robocza
python skrypty/rozmowa.py panel --kod R7K-2QX --role cbt,systemowy,straznik   # pasek „zespół pracuje” w aplikacji
python skrypty/rozmowa.py odpowiedz --kod R7K-2QX --plik odp.json             # dopisuje odpowiedź zespołu
```
`odp.json` = obiekt z polami z §1 (`tekst` obowiązkowe). Skrypt dopisuje `ts`, `od: "zespol"`, czyści `panel.json` i ustawia sygnał „AI czeka”.

Na każdą turę:
1. `czekaj` → wypisuje nową wiadomość, całą dotychczasową rozmowę i `formulacja-robocza.md`.
2. **Strażnik ryzyka** (`straznik-ryzyka`) dostaje skumulowane streszczenie + bieżącą wiadomość, równolegle z panelem. `eskaluj: true` → odpowiedź jest WYŁĄCZNIE torem bezpieczeństwa (docs/BEZPIECZENSTWO.md §2, numery z `config/pomoc-pl.yaml`), `przerwanie: true`, bez zwykłej porady.
3. Flagi twarde (docs/SIEC-AGENTOW.md §1.2) wymuszają role; prowadzący dobiera panel: podejście wiodące + drugie wg treści tury (+ rola kliniczna z flagi). Zapisz `panel` skryptem, żeby użytkownik widział, kto pracuje.
4. Każda rola panelu = **osobne wywołanie subagenta** (nie pisz za nich): ≤120 słów „co bym powiedział / czego nie / dlaczego” + linia `SPÓR:` + linia `SKRÓT:`.
5. Prowadzący pisze **jeden głos** (docs/KONCEPCJA.md §5.3): rdzeń wspólny; różnicę zmieniającą odpowiedź nazywa jako dwie drogi z własnym wyborem i powodem; najwyżej jedno pytanie; ton wg §8 koncepcji; co 3–4 tury zdanie o kontakcie z człowiekiem; nigdy „jestem tu zawsze”. Odbiorca `klient` → prościej, ciepło, bez żargonu; `terapeuta` → język kliniczny, z PMID.
6. `klient-sedzia` czyta odpowiedź (czerwona kartka → jedna poprawka). Zapis `odpowiedz`.
7. Dopisz `formulacja-robocza.md` (fakty, cel klienta jego słowami, podejście wiodące, ryzyko, NIEZNANE). Wróć do `czekaj`.

Przycisk **„Zwołaj konsylium”** w oknie Rozmowy dopisuje wiadomość `{"od":"uzytkownik","polecenie":"konsylium"}`: wtedy prowadzący zakłada sprawę `sprawy/<ID>/` z `00-surowe.md` = cała rozmowa, prosi o brakujące dane wywiadu (ankieta na żywo) i prowadzi pełne konsylium w Pokoju psychologicznym.

## 3. Bezpieczeństwo w kodzie aplikacji (niezależnie od modelu)

Aplikacja ma filtr słownikowy fraz wysokiego ryzyka (docs/BEZPIECZENSTWO.md §3). Gdy wiadomość użytkownika pasuje, okno od razu pokazuje pasek z numerami pomocy (z `config/pomoc-pl.yaml` wkompilowanymi do modułu) i zapisuje w `stan.json` pole `filtr: ["fraza"]`, które strażnik traktuje jako co najmniej poziom 3 do czasu własnej oceny. Odpowiedź zespołu z `ryzyko ≥ 3` wyświetla się na czerwonym tle z numerami, a pole pisania zostaje aktywne (rozmowa nie zostaje przerwana po stronie człowieka).

## 4. Granice

- To nie jest terapia; okno pokazuje to przy starcie i w stopce.
- Bez diagnozy dla klienta, bez dawkowania i odstawiania leków, bez oceniania osób trzecich, bez technik wymagających relacji i nadzoru (docs/BEZPIECZENSTWO.md §6).
- Tylko dorośli; wzmianka o wieku <18 kończy rozmowę informacją o zakresie testów.
