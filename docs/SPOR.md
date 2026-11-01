# Spór z regułami (ankieta zmian 1.11.2026: „Tak, w całości”; ZRODLA-POZA-PUBMED.md §3)

Rozmowa bez reguł utrwala pierwsze zdanie (98% agentów powtarzało swoje), a dociskanie „czy jesteś pewien?” częściej psuje dobre odpowiedzi niż naprawia złe (MedAgentAudit 2025; Choi 2025). Dlatego spór ma reguły, a Sprawdzający procesu stosuje je mechanicznie.

## Kiedy
- `03-opinie/_agregat.json` → `runda.potrzebna = true` (różne rozpoznanie nr 1, spór o czerwoną flagę albo farmakolog widzi przyczynę polekową, której nikt nie ma na 1. miejscu). Sama różnica pilności rundy NIE otwiera (testy serii 2: raz oddaliła wynik od klucza).
- Przy pełnej zgodzie: **minimalny test zgody** – ordynator wyznacza rotacyjnie jedną rolę-adwokata (zapis w `_log.jsonl`: `{"zdarzenie":"test_zgody","adwokat":"…"}`), która w ≤80 słowach podaje najmocniejszy kontrargument z faktem albo źródłem; druga rola ocenia, czy obalony. Nieobalony → runda dla tego punktu.

## Jak (jedna runda, każda rola osobnym wywołaniem)
1. **Mapa sporu** – ordynator (nie ujawnia własnej hipotezy, w każdej rundzie mówi ostatni): które hipotezy, kto za którą, jakie fakty sporne.
2. **Steelman** – każda rola najpierw streszcza najmocniej stanowisko przeciwne (1 zdanie), potem odpowiada.
3. **Turniej par** – dla dwóch czołowych hipotez tabela faktów z wywiadu w `04-konsylium.md`: `fakt | H1: tłumaczy / nie / neutralny | H2: …`. Fakty, które nie pasują do żadnej, to kandydaci na pytanie rozstrzygające.
4. **Zmiana zdania tylko z nowym argumentem**: fakt z wywiadu nieprzywołany wcześniej, wynik badania, wpis Lekarza prowadzącego, źródło z biblioteki sprawy (`id`). Powtórzenie tezy innymi słowami nie jest argumentem i nie trafia do dymka. Każdą zmianę ordynator loguje: `{"zdarzenie":"zmiana_zdania","rola":"…","z":"…","na":"…","nowy_argument_id":"…"}`.
5. **Ochrona mniejszości** (`mniejszosc_chroniona` w agregacie: p ≥ 0,15 u kogokolwiek albo wniesione przez Najgorszy scenariusz): rozpoznanie nie znika przez głosowanie – obalić dowodem (zdanie w protokole z `id`) albo przenieść do PLANU B. W debatach 2:1 mniejszość miała rację w co czwartym przypadku (Minority Sentinel 2026).
6. **Pytanie rozstrzygające** – gdy spór trwa, a lekarze wskazują jedną informację, która go rozstrzygnie: `python skrypty/pytanie_lekarza.py sprawy/<ID> --id P1 --tekst "…" --bo "jeśli tak → H1, jeśli nie → H2" --czekaj 600`. Najwyżej 2 na sprawę. Bez rozwidlenia „jeśli A → H1, jeśli B → H2” pytanie wraca do autora. Brak odpowiedzi = NIEZNANE.
7. **Wspólne rozwiązanie** – ordynator zamyka rundę jednym zdaniem: co ustalono, co odrzucono (z `--skresl … --powod`), co idzie do PLANU B.

Weto pilności Najgorszego scenariusza zostaje; obniżenie pilności wymaga zdania „red flag X wykluczona, bo [fakt/badanie]”.
