# Architektura Konsylium AI

## 1. Przepływ sprawy

```
użytkownik (lekarz) ──► ORDYNATOR: intake (≤3 tury) ──► 00-surowe.md, 01-wywiad.md
                                   │
                                   ▼
                    PANEL TRIAGE (3 zastępców, równolegle, niezależnie)
                    Z-ZŁOŻONOŚĆ | Z-BEZPIECZEŃSTWO | Z-NIEPEWNOŚĆ  ──► 02-triage.json
                                   │  reguła OR
               ┌───────────────────┴───────────────────┐
               ▼                                       ▼
        TRYB SZYBKI                               TRYB PEŁNY
   ordynator + farmakolog                 6 lekarzy: ŚLEPA TURA ──► 03-opinie/*.json
   + sprawdzający faktów                  skrypty/agregacja.py ──► 03-opinie/_agregat.json
               │                          04-konsylium.md (dyskusja, weto pilności)
               │                          05-projekt.md (ordynator)
               │                                       │
               │                          skrypty/pakiet_rezydenta.py ──► pakiet (prompt-only)
               │                          REZYDENCI (2–3, inny model, bez pamięci) ──► 06-rezydenci/*.md
               │                                       │
               └──────────────────┬────────────────────┘
                                  ▼
                 SPRAWDZAJĄCY FAKTÓW + SPRAWDZAJĄCY PROCESU ──► 07-sprawdzenie.json
                                  │ czerwona karta → zwrot do ordynatora (max 2 pętle)
                                  ▼
                 ORDYNATOR: 08-odpowiedz-rezydentom.md (każda uwaga: przyjmuję/odrzucam + powód)
                                  ▼
                 09-FINAL.md ──► użytkownik
                                  ⋮ (dni/tygodnie)
                 użytkownik: 10-followup.md ──► skrypty/kalibracja.py ──► pamiec/kalibracja.json
                 ordynator ──► pamiec/zespol.md, pamiec/luki.md
```

## 2. Panel triage — 3 zastępców

| Zastępca | Oś | Wejście | Wyjście (0–10) | Próg eskalacji |
|---|---|---|---|---|
| Z-ZŁOŻONOŚĆ | ile układów, chorób, leków (≥5 = polipragmazja), niewiadomych | 01-wywiad.md | `zlozonosc` | ≥ 5 |
| Z-BEZPIECZEŃSTWO | red flags dla prezentacji, pilność wstępna, grupy ryzyka | 01-wywiad.md | `ryzyko` | ≥ 4 |
| Z-NIEPEWNOŚĆ | robi własną 60-sekundową hipotezę roboczą; porównuje z roboczą hipotezą ordynatora | 01-wywiad.md + hipoteza ordynatora | `niepewnosc` | ≥ 5 **lub** rozpoznania różne |

Reguła: `PEŁNY` jeśli którykolwiek próg przekroczony. W przeciwnym razie `SZYBKI`.
Użytkownik może wymusić `PEŁNY` słowem `pełne konsylium`. Nie może wymusić `SZYBKI` przy `ryzyko ≥ 4`.

Zastępcy pełnią też **sukcesję**: gdy kontekst ordynatora przekracza 70 % limitu, ordynator zapisuje `_handoff.md`
(stan sprawy, decyzje, otwarte pytania) i zastępca ds. niepewności przejmuje prowadzenie na podstawie plików, nie rozmowy.

## 3. Ślepa tura i kaskada
Każdy lekarz stały dostaje ten sam pakiet (`01-wywiad.md` + `00-surowe.md` + dostęp do `zrodla/`, PubMed, `pamiec/zespol.md`)
i zapisuje `03-opinie/<rola>.json` **nie czytając** innych opinii. Dopiero potem ordynator otwiera `04-konsylium.md`,
wkleja agregat i prowadzi 1–2 rundy: sprzeczności, red flags, co by zmieniło zdanie każdego.

## 4. Agregacja (skrypty/agregacja.py)
Dla każdego rozpoznania `d` i każdego lekarza `i` z wagą `w_i(tor)`:
```
logit_d = Σ_i w_i · logit(p_i(d))  /  Σ_i w_i        (pula logarytmiczna, ważona)
p(d) = softmax po rozpoznaniach (normalizacja)
```
`p_i(d)` brakujące → lekarz nie wymienił → traktujemy jako `ε = 0.02` (nie 0, żeby nie zerować pul).
Pilność: `max( ważona mediana pilności , pilność lekarza „najgorszy scenariusz" )` — to jest weto.
Plan: agregat nie liczy planu; plan pisze ordynator na podstawie opinii ważonych torem `plan` (farmakolog, pragmatyk).

## 5. Kalibracja (skrypty/kalibracja.py)
Po `10-followup.md` (pole `rozpoznanie_potwierdzone`, `pilnosc_faktyczna`):
- Brier lekarza w sprawie: `Σ_d (p_i(d) − y_d)²` (y=1 dla potwierdzonego).
- Brier roli referencyjny: średnia Brier wszystkich lekarzy w tej sprawie.
- `k_i ← clip( k_i · (1 − α) + α · (1 + (Brier_ref − Brier_i)·β) , 0.5, 1.5 )`, `α = 0.1`, `β = 2`.
  Powolna aktualizacja (α) chroni przed pojedynczym pechem.
- Zapis: `pamiec/kalibracja.json` `{rola: {k, n_spraw, brier_sredni}}`.
Rezydenci: `pamiec/kalibracja.json["rezydenci"]` = `{uwag, przyjetych, zmienily_decyzje, kategorie: {...}}` — bez `k`.

## 6. Rubryka sprawy (skrypty/rubryka.py) — 0–100
| Kryterium | pkt | Źródło oceny |
|---|---|---|
| Lista różnicowa zawiera rozpoznanie potwierdzone w top-3 | 25 | followup |
| Czynniki za/przeciw dla top-3 obecne i trafne | 15 | sprawdzający procesu |
| Następny krok właściwy (nie za mało, nie za dużo) | 20 | followup + gospodarz kosztów |
| Bezpieczeństwo: red flags zaadresowane, pilność nie zaniżona | 25 | sprawdzający procesu + followup |
| Komunikat: jedna decyzja, plan B, NIEZNANE, źródła | 15 | sprawdzający procesu |
Wynik < 60 w ≥ 3 sprawach z rzędu → ordynator musi otworzyć `pamiec/luki.md` i zaproponować zmianę reguł.

## 7. Sukcesja, limity, koszty
- Tryb SZYBKI: 3 agenty, bez rezydentów, bez ślepej tury. Cel: < 5 min.
- Tryb PEŁNY: 13 agentów (1+3+6+2+≥1 rezydent). Rezydentów 2 domyślnie, 3 gdy `ryzyko ≥ 7`.
- Pętla sprawdzający → ordynator: max 2. Po drugiej czerwonej karcie FINAL wychodzi z adnotacją `NIEROZSTRZYGNIĘTE` i listą sporów.

## 8. Integracja z Panelem zespołu agentów
Każdy agent loguje start/stop i nazwę pliku wyjściowego do `sprawy/<ID>/_log.jsonl` (`{ts, rola, zdarzenie, plik}`).
Panel czyta ten plik; nie trzeba nic więcej.

## 9. Co jest celowo niedokończone
- Follow-up wymaga dyscypliny użytkownika; bez niego kalibracja stoi na wagach ról (to jest OK, tylko nie uczy się).
- Rezydent na innym modelu wymaga zewnętrznego CLI (patrz FIREWALL-REZYDENTA.md §4). Bez tego rezydent = Claude z pustym kontekstem — słabsza, ale nadal sensowna „zewnętrzność".
- Walidacja z prawdziwymi lekarzami (Oxford: symulowani pacjenci nie przewidują ludzi) — poza zakresem kodu.
