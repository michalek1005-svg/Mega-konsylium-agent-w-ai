# 08 — Odpowiedź ordynatora rezydentom i Sprawdzającemu faktów

## Rezydent 1 (06-rezydenci/1.md)

**R1.1 — „Badanie krwi” bez liczb; brak kreatyniny, morfologii, ALT.**
PRZYJMUJĘ (częściowo) — kategoria: brak_danych, hasło: `pakiet_bez_wynikow`. Wyniki istniały w `01-wywiad.md` (WBC 14,2; eozynofile 2,1 G/l; ALT 186; kreatynina 1,6 vs 1,0 mg/dl) i stanowiły podstawę rozpoznania, ale pakiet rezydenta ich nie zawierał — uwaga jest trafna wobec pakietu, nie wobec sprawy. Zmienia decyzję: NIE. Wniosek procesowy: `skrypty/pakiet_rezydenta.py` ma włączać sekcję „Wyniki badań” z 01-wywiad.md; pytania o nalot na migdałkach i śledzionę trafiają do CZEGO NIE WIEMY.

**R1.2 — Mononukleoza EBV z osutką po aminopenicylinie, AKI przednerkowe na ramiprylu.**
ODRZUCAM — kategoria: hipoteza, hasło: `mononukleoza`. Hipoteza była wypowiedziana (wszystkie role, miejsce 3); przeciw niej: eozynofilia 2,1 G/l (15%) nietypowa dla EBV, wiek 71 lat, latencja allopurynolu w oknie DRESS (PMID 23855313), narastanie po odstawieniu antybiotyku. Składowa przednerkowa AKI jest uwzględniona (wstrzymanie ramiprylu). Zmienia decyzję: NIE — serologia EBV zostaje w planie szpitalnym, nie zmienia postępowania dziś.

**R1.3 — Zajęcie wątroby i nerek „wywnioskowane” z ciemnego moczu; odpowiedzi ankiety nieinterpretowalne.**
ODRZUCAM co do zajęcia narządów (oparte na ALT 186 U/l i kreatyninie 1,6 mg/dl z laboratorium, nie na objawach) — ta część wynika z braku wyników w pakiecie (patrz R1.1). PRZYJMUJĘ co do ankiety — kategoria: zalozenie, hasło: `ankieta_bez_tresci_pytan`: odpowiedzi „Nic z tych rzeczy” bez listy pytań nie pozwalają zweryfikować wykluczenia SJS/TEN; dlatego w FINAL zajęcie śluzówek i pęcherze pozostają NIEZNANE do badania lekarskiego. Zmienia decyzję: NIE.

## Sprawdzający faktów (07-sprawdzenie.json, kartka ŻÓŁTA)

- Steroid w szpitalu po posiewie, nie w POZ — BEZ_ZRODLA → PRZYJMUJĘ: etykieta [wiedza modelu, niezweryfikowane] w FINAL. Nie zmienia decyzji.
- Zakaz NLPZ i nowego antybiotyku w POZ — BEZ_ZRODLA → PRZYJMUJĘ: etykieta. Nie zmienia decyzji.
- Progi PLAN B (RR <90, SpO2 <92%, K >5,5, ≥39 °C) — BEZ_ZRODLA → PRZYJMUJĘ: etykieta. Nie zmienia decyzji.
- KDIGO: cytować PMID 23394211 zamiast pracy o cisplatynie → PRZYJMUJĘ (zamiana źródła).
- ACEi po AKI (PMID 41387369): populacja ≥85 lat po dializowanym AKI → PRZYJMUJĘ: w FINAL liczby z zastrzeżeniem populacji; wstrzymanie ramiprylu oparte na AKI/hipowolemii, nie na tym PMID.
- Paracetamol 2 g/d: PMID 24309482 (marskość) → PRZYJMUJĘ z zastrzeżeniem ekstrapolacji.
- Dawka startowa allopurynolu 100 mg przy eGFR ~60 = ~1,67 mg/ml/min, powyżej progu Stamp → PRZYJMUJĘ: usuwam zdanie „dawkowanie poprawne”; to czynnik ryzyka, nie argument przeciw.
- RegiSCAR progi, harmonogram kontroli — etykiety zostają → PRZYJMUJĘ.

## Wynik
Żadna uwaga nie zmienia decyzji (odstawić allopurynol, wstrzymać ramipryl, szpital dziś, pilność 1). FINAL różni się od 05 tylko etykietami, źródłami i zastrzeżeniami wymienionymi wyżej. Powrót do kroku 4 niepotrzebny.
