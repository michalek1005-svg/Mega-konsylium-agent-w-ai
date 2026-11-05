# Punktacja — specyfikacja

## Trzy niezależne punktacje
| # | Co mierzy | Kiedy | Kto liczy | Do czego służy |
|---|---|---|---|---|
| P1 | agregat opinii w sprawie | po ślepej turze | `agregacja.py` | wynik rozpoznania i pilności |
| P2 | kalibracja agenta w czasie | po follow-upie | `kalibracja.py` | współczynnik `k` w wagach |
| P3 | jakość całej sprawy (0–100) | po follow-upie | `rubryka.py` + sprawdzający procesu | ewaluacja systemu, triage |

## P1 — agregat
Wejście: `03-opinie/<rola>.json` wg `schemas/opinia.schema.json`:
```json
{ "rola": "hipotezujacy",
  "rozpoznania": [ {"nazwa": "kamica żółciowa", "p": 0.55, "za": ["..."], "przeciw": ["..."]},
                   {"nazwa": "choroba wrzodowa", "p": 0.25} ],
  "pilnosc": 3, "pewnosc": "srednia",
  "red_flags_wykluczone": ["perforacja"], "red_flags_otwarte": ["zapalenie trzustki"],
  "nastepny_krok": "USG jamy brzusznej, lipaza, ALT/AST/bilirubina",
  "zrodla": ["zrodla/..."] }
```
Waga lekarza w torze: `w = waga_roli[tor] × k[rola]` (`config/wagi.yaml` × `pamiec/kalibracja.json`).
- Rozpoznanie: ważona pula logitów, ε = 0,02 dla niewymienionych, softmax na końcu. Wyjście: ranking z p.
- Pilność: ważona mediana; następnie `max(mediana, pilnosc[najgorszy_scenariusz])` **jeśli** ma on `red_flags_otwarte` niepuste. Pilność 1 = najpilniejsza, więc „max pilności" = `min()` wartości liczbowej.
- Zgoda zespołu: entropia rozkładu top-5 → `zgoda ∈ [0,1]`. `zgoda < 0.5` → flaga `NISKA_ZGODA` do ordynatora (dodatkowa runda dyskusji).

## P2 — kalibracja
Wejście: `10-followup.md` wg `schemas/followup.schema.json` (front-matter YAML):
```yaml
rozpoznanie_potwierdzone: "kamica żółciowa"
pilnosc_faktyczna: 3
czy_decyzja_byla_wlasciwa: tak | czesciowo | nie
komentarz: "..."
```
Dla każdej opinii: `brier_i = Σ_d (p_i(d) − y_d)²`, dopasowanie nazw rozpoznań: normalizacja + tabela synonimów `config/synonimy.yaml` (ordynator uzupełnia).
`k_i ← clip(k_i·0.9 + 0.1·(1 + 2·(brier_ref − brier_i)), 0.5, 1.5)`.
Rezydenci: liczniki, bez `k`.

## P3 — rubryka
Patrz ARCHITEKTURA.md §6. `rubryka.py` liczy część automatyczną (top-3, pilność vs faktyczna, obecność pól FINAL);
część jakościową (za/przeciw, właściwość kroku) wpisuje sprawdzający procesu do `07-sprawdzenie.json["rubryka"]`.

## Czego punktacja celowo nie robi
- Nie podnosi wagi roli powyżej 1,5× — żeby żaden agent nie stał się „wyrocznią", bo wtedy wracamy do jednego modelu.
- Nie daje wag rezydentom — ich wartość to różnorodność, a waga by ją zabiła (uczyliby się zgadzać).
- Nie wlicza sprawdzających — oni nie mają zdania, mają tylko kartki: zielona / czerwona.
