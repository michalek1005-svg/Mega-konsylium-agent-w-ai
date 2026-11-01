# Dymki — skróty wypowiedzi dla Pokoju lekarskiego

Pokój lekarski (`narzedzia/pokoj-lekarski/`) pokazuje konsylium jako szpitalny pokój. Nad tym, kto mówi, wyświetla dymek, a na tablicy pokazuje, o czym jest dyskusja teraz. Dymki biorą się z jednego miejsca: zdarzeń `"wypowiedz"` w `sprawy/<ID>/_log.jsonl`.

## Kto co robi

1. **Każdy agent** kończy swoją odpowiedź dla ordynatora skrótem (1–2 pełne zdania, ≤400 znaków):
   - agenci, którzy odpowiadają tekstem (lekarze, sprawdzający, rezydent, zastępca niepewności): ostatnia linia `SKRÓT: …`;
   - zastępcy złożoności i bezpieczeństwa (odpowiadają wyłącznie JSON-em): pole `"skrot"` w tym JSON-ie.
2. **Ordynator** po każdym kroku zapisuje dymki skryptem, bo tylko on ma Bash i zna czas:
   ```
   python3 skrypty/dymek.py sprawy/<ID> --rola bayes --faza "Ślepa tura" --skrot "…" [--plik 03-opinie/bayes.json]
   python3 skrypty/dymek.py sprawy/<ID> --wiele /tmp/dymki.jsonl   # cały krok naraz
   ```
   Na początku każdej fazy ordynator zapisuje też **swój** dymek z `--temat`: jedno zdanie o tym, o czym teraz jest dyskusja. Ten temat trafia na tablicę.
3. Gdy agent nie podał skrótu, ordynator go nie wymyśla. Pokój sam wyliczy skrót z plików sprawy.

## Zasady skrótu

**Decyzja Michała 1.11.2026:** dymek to **medyczne zdanie albo opinia lekarza**, nie zapis rozmowy między agentami. Uzgodnienia zespołu (wagi ról, log-odds, agregacja, „zgadzam się z Bayesem”, „przyjmuję uwagę”, opis własnych czynności, numer rundy, sprawdzenie procesu) zostają w plikach sprawy i w protokole, nie w dymkach. Liczby kliniczne (p, pilność, progi, PMID) tylko w linii INFO. Dymek bez treści medycznej nie powstaje.

- 1–2 pełne zdania, najwyżej 400 znaków, po polsku, bez markdownu (decyzja Michała z 31.10.2026: pełniejsze zdania i dodatkowe informacje).
- Język medyczny i treść, nie opis czynności. Podaj stanowisko, kluczową liczbę (p, pilność, wynik badania) i najważniejszy argument albo warunek zmiany zdania.
  Przykład: „Najbardziej prawdopodobna jest wydalona matryca tabletki metforminy o przedłużonym uwalnianiu (p 0,70), bo kulka pojawia się raz na dobę po dawce leku. Zmieniłaby to kulka twarda, warstwowa lub obecna w dni bez metforminy.”
  Zamiast: „Napisałem opinię” albo „Tabletka widmo”.
- Rezydent: najważniejsza z trzech uwag, z krótkim uzasadnieniem. Firewall zostaje: rezydent nie widzi dymków innych, a ordynator przepisuje tylko jego własne zdanie.
- Bez danych identyfikujących pacjenta (jak w całej sprawie).

## Fazy (pole `faza`)

`Wywiad`, `Triage`, `Ślepa tura`, `Agregacja`, `Konsylium · runda 1` (2, …), `Projekt`, `Rezydenci`, `Sprawdzenie`, `Odpowiedź rezydentom`, `Werdykt`, `Follow-up`.

## Format linii

```json
{"ts":"2026-11-01T10:05:00+00:00","zdarzenie":"wypowiedz","rola":"bayes","faza":"Ślepa tura","skrot":"Ostry zespół wieńcowy jest realny (p 0,30): ból zamostkowy od rana u palacza z cukrzycą. Pilność 1 do czasu EKG i troponiny.","temat":"…","plik":"03-opinie/bayes.json","persona":"…"}
```

`rola`: `ordynator`, `lekarz_prowadzacy` (użytkownik; wpisy z Pokoju trafiają do `uwagi-lekarza.jsonl`, nie do `_log.jsonl`), `z_zlozonosc`, `z_bezpieczenstwo`, `z_niepewnosc`, `hipotezujacy`, `bayes`, `najgorszy_scenariusz`, `poz_pragmatyk`, `farmakolog`, `gospodarz_kosztow`, `s_fakty`, `s_proces`, `R1`–`R3`. Skrypt przyjmuje też nazwy agentów (`lekarz-bayes`, `zastepca-bezpieczenstwo`). `temat` i `persona` (tylko u rezydentów) są opcjonalne.

Faza, która ma dymki, jest w pokoju pokazana z dymków. Faza bez dymków jest wyliczana z plików 01–10, więc starsze sprawy też działają.

## Linia INFO (opcjonalnie)

Pod treścią dymku może stać krótka linia z liczbami: skale, kryteria, wartości, wytyczne, np. „p=0,55 · Tokio 2018: kryteria niespełnione · USG w 24 h”. Agent podaje ją przed skrótem jako `INFO: …` (zastępcy JSON-owi: pole `"info"`), a ordynator zapisuje `--info "…"` (w `--wiele` pole `info`). Najwyżej 200 znaków. Pole `tresc` (do 600 znaków) jest dla dłuższej wersji, gdy skrót ma zostać krótki. W trybie na żywo (docs/NA-ZYWO.md) dymki zapisuje się od razu po każdej wypowiedzi.
