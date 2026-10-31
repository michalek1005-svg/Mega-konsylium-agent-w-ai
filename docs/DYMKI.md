# Dymki — skróty wypowiedzi dla Pokoju lekarskiego

Pokój lekarski (`narzedzia/pokoj-lekarski/`) pokazuje konsylium jako szpitalny pokój. Nad tym, kto mówi, wyświetla dymek, a na tablicy pokazuje, o czym jest dyskusja teraz. Dymki biorą się z jednego miejsca: zdarzeń `"wypowiedz"` w `sprawy/<ID>/_log.jsonl`.

## Kto co robi

1. **Każdy agent** kończy swoją odpowiedź dla ordynatora liniami dla dymku:
   - agenci, którzy odpowiadają tekstem (lekarze, sprawdzający, rezydent, zastępca niepewności): `INFO: …` (opcjonalnie), `DYMEK: …`, a na końcu `SKRÓT: …`;
   - zastępcy złożoności i bezpieczeństwa (odpowiadają wyłącznie JSON-em): pola `"dymek"`, `"info"` i `"skrot"` w tym JSON-ie.
2. **Ordynator** po każdym kroku zapisuje dymki skryptem, bo tylko on ma Bash i zna czas:
   ```
   python3 skrypty/dymek.py sprawy/<ID> --rola bayes --faza "Ślepa tura" --skrot "…" --tresc "…" [--info "…"] [--plik 03-opinie/bayes.json]
   python3 skrypty/dymek.py sprawy/<ID> --wiele /tmp/dymki.jsonl   # cały krok naraz
   ```
   Na początku każdej fazy ordynator zapisuje też **swój** dymek z `--temat`: jedno zdanie o tym, o czym teraz jest dyskusja. Ten temat trafia na tablicę.
3. Gdy agent nie podał skrótu, ordynator go nie wymyśla. Pokój sam wyliczy skrót z plików sprawy.

## Treść dymku (od 31.10.2026, prośba Michała: „pełniejsze zdania, medyczny język i dodatkowe info”)

- `tresc` (linia `DYMEK:`) to to, co widać w dymku: **2–4 pełne zdania językiem medycznym**, najwyżej 600 znaków, bez markdownu. Co stwierdzam, na jakiej podstawie i co z tego wynika, np. „Najbardziej prawdopodobna jest kolka żółciowa (p≈0,55) w przebiegu kamicy pęcherzyka żółciowego. Brak gorączki i żółtaczki obniża prawdopodobieństwo zapalenia dróg żółciowych. Proponuję USG jamy brzusznej w trybie pilnym.”
- `info` (linia `INFO:`) to dodatkowa linia pod treścią: liczby, skale, kryteria, wytyczne, np. „p=0,55 · Tokio 2018: kryteria niespełnione · USG w 24 h”. Najwyżej 200 znaków.
- `skrot` zostaje: krótka wersja do protokołu i na wąskie ekrany. Gdy go brak, skrypt bierze pierwsze zdanie treści.

## Zasady skrótu

- Jedno zdanie, najwyżej 150 znaków, po polsku, bez markdownu.
- Treść, nie opis czynności: „Tabletka widmo 0,70, pilność 4”, a nie „Napisałem opinię”.
- Rezydent: najważniejsza z trzech uwag. Firewall zostaje: rezydent nie widzi dymków innych, a ordynator przepisuje tylko jego własne zdanie.
- Bez danych identyfikujących pacjenta (jak w całej sprawie).

## Fazy (pole `faza`)

`Wywiad`, `Triage`, `Ślepa tura`, `Agregacja`, `Konsylium · runda 1` (2, …), `Projekt`, `Rezydenci`, `Sprawdzenie`, `Odpowiedź rezydentom`, `Werdykt`, `Follow-up`.

## Format linii

```json
{"ts":"2026-11-01T10:05:00+00:00","zdarzenie":"wypowiedz","rola":"bayes","faza":"Ślepa tura","skrot":"ACS p 0,30, pilność 1.","tresc":"Wiodącym rozpoznaniem jest ostry zespół wieńcowy (p≈0,30)…","info":"HEART 5 pkt · ESC 2023","temat":"…","plik":"03-opinie/bayes.json","persona":"…"}
```

`rola`: `ordynator`, `z_zlozonosc`, `z_bezpieczenstwo`, `z_niepewnosc`, `hipotezujacy`, `bayes`, `najgorszy_scenariusz`, `poz_pragmatyk`, `farmakolog`, `gospodarz_kosztow`, `s_fakty`, `s_proces`, `R1`–`R3`. Skrypt przyjmuje też nazwy agentów (`lekarz-bayes`, `zastepca-bezpieczenstwo`). `tresc`, `info`, `temat` i `persona` (tylko u rezydentów) są opcjonalne. W trybie na żywo (docs/NA-ZYWO.md) dymki zapisuje się od razu po każdej wypowiedzi.

Faza, która ma dymki, jest w pokoju pokazana z dymków. Faza bez dymków jest wyliczana z plików 01–10, więc starsze sprawy też działają.
