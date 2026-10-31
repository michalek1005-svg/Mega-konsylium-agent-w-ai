# Dymki — skróty wypowiedzi dla Pokoju lekarskiego

Pokój lekarski (`narzedzia/pokoj-lekarski/`) pokazuje konsylium jako szpitalny pokój. Nad tym, kto mówi, wyświetla dymek, a na tablicy pokazuje, o czym jest dyskusja teraz. Dymki biorą się z jednego miejsca: zdarzeń `"wypowiedz"` w `sprawy/<ID>/_log.jsonl`.

## Kto co robi

1. **Każdy agent** kończy swoją odpowiedź dla ordynatora jednym zdaniem skrótu:
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

- Jedno zdanie, najwyżej 150 znaków, po polsku, bez markdownu.
- Treść, nie opis czynności: „Tabletka widmo 0,70, pilność 4”, a nie „Napisałem opinię”.
- Rezydent: najważniejsza z trzech uwag. Firewall zostaje: rezydent nie widzi dymków innych, a ordynator przepisuje tylko jego własne zdanie.
- Bez danych identyfikujących pacjenta (jak w całej sprawie).

## Fazy (pole `faza`)

`Wywiad`, `Triage`, `Ślepa tura`, `Agregacja`, `Konsylium · runda 1` (2, …), `Projekt`, `Rezydenci`, `Sprawdzenie`, `Odpowiedź rezydentom`, `Werdykt`, `Follow-up`.

## Format linii

```json
{"ts":"2026-11-01T10:05:00+00:00","zdarzenie":"wypowiedz","rola":"bayes","faza":"Ślepa tura","skrot":"ACS p 0,30, pilność 1.","temat":"…","plik":"03-opinie/bayes.json","persona":"…"}
```

`rola`: `ordynator`, `z_zlozonosc`, `z_bezpieczenstwo`, `z_niepewnosc`, `hipotezujacy`, `bayes`, `najgorszy_scenariusz`, `poz_pragmatyk`, `farmakolog`, `gospodarz_kosztow`, `s_fakty`, `s_proces`, `R1`–`R3`. Skrypt przyjmuje też nazwy agentów (`lekarz-bayes`, `zastepca-bezpieczenstwo`). `temat` i `persona` (tylko u rezydentów) są opcjonalne.

Faza, która ma dymki, jest w pokoju pokazana z dymków. Faza bez dymków jest wyliczana z plików 01–10, więc starsze sprawy też działają.
