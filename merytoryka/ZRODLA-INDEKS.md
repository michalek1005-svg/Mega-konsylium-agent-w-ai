# Biblioteka wytycznych dla `zrodla/` — indeks (szkic 1, 1.11.2026)

Cel: wypełnić poziom 1 hierarchii źródeł (CLAUDE.md §5). Dziś `zrodla/` zawiera tylko przykładowy MANIFEST, więc każda dawka w Wnioskach dostaje żółtą lub czerwoną kartkę.

**Jak to działa (podział pracy):**
1. **Michał** pobiera pliki PDF (część wymaga zalogowania jako lekarz lub członek towarzystwa — nie obchodzimy tego) i wrzuca do folderu Konsylium `zrodla/` na swoim PC albo do wątku.
2. **Kodujący** konwertuje PDF → MD (`pdftotext -layout`), nadaje nazwę wg konwencji `<wydawca>-<rok>-<temat>.md` i dopisuje wiersze do `zrodla/MANIFEST.md` (gotowe wiersze na końcu tego pliku).
3. **Merytoryczny** sprawdza, czy plik to aktualna wersja, i oznacza zakres.

Priorytet: **P1** = potrzebne w sprawach, które już były (infekcje dróg oddechowych, reakcje polekowe); **P2** = najczęstsze problemy POZ u dorosłych; **P3** = uzupełnienie. Rok podany wg mojej wiedzy — przy pobieraniu sprawdzić, czy nie ma nowszej wersji (kolumna „sprawdź”).

## 1. Polskie — P1 (zakażenia, leki, alergia)

| plik docelowy | dokument | wydawca | rok | gdzie szukać |
|---|---|---|---|---|
| `npoa-2016-zakazenia-oddechowe.md` | Rekomendacje postępowania w pozaszpitalnych zakażeniach układu oddechowego | Narodowy Program Ochrony Antybiotyków (Hryniewicz i wsp.) | 2016 (sprawdź nowszą) | antybiotyki.edu.pl → Rekomendacje; omówienie: [mp.pl](https://www.mp.pl/medycynarodzinna/wytyczne/151730,pozaszpitalne-zakazenia-ukladu-oddechowego-zakazenia-gornych-drog-oddechowych-zapalenie-oskrzeli-ioskrzelikow), [termedia — NPOA w POZ](https://www.termedia.pl/Racjonalna-antybiotykoterapia-wedlug-Narodowego-Programu-Ochrony-Antybiotykow-wybrane-zagadnienia,98,28954,0,0.html) |
| `npoa-20xx-zum.md` | Rekomendacje diagnostyki i leczenia zakażeń układu moczowego | NPOA | sprawdź | antybiotyki.edu.pl |
| `pteilchz-20xx-covid19.md` | Zalecenia diagnostyki i terapii zakażeń SARS‑CoV‑2 (aktualizowane co sezon) | PTEiLChZ | najnowsze | pteilchz.org.pl |
| `opzg-20xx-grypa.md` | Rekomendacje diagnostyki, leczenia i profilaktyki grypy | Ogólnopolski Program Zwalczania Grypy / PTEiLChZ | sprawdź | opzg.pl |
| `pzh-20xx-pso.md` | Program Szczepień Ochronnych (część dla dorosłych i pracowników ochrony zdrowia) | GIS / MZ | rok bieżący | gis.gov.pl, szczepienia.pzh.gov.pl |
| `pta-20xx-anafilaksja.md` | Stanowisko PTA dot. anafilaksji / alergii na leki | Polskie Towarzystwo Alergologiczne | sprawdź | Alergologia Polska (termedia.pl) |
| `ptd-dermatologia-20xx-pokrzywka.md` | Pokrzywka — rekomendacje diagnostyczno‑terapeutyczne | PTD (dermatologiczne) / PTA | sprawdź | Dermatology Review (termedia.pl) |
| `chpl-*.md` | ChPL leków z dotychczasowych spraw: cefuroksym, amoksycylina, doksycyklina, azytromycyna, oseltamiwir, bilastyna, paracetamol, ibuprofen, budezonid do nebulizacji, erdosteina, bisoprolol, adrenalina i.m. | URPL | aktualne | [Rejestr Produktów Leczniczych](https://rejestry.ezdrowie.gov.pl/rpl/search/public) (PDF ChPL przy każdym produkcie); leki centralne: ema.europa.eu |

## 2. Polskie — P2 (najczęstsze problemy POZ u dorosłych)

| plik docelowy | dokument | wydawca | rok | gdzie szukać |
|---|---|---|---|---|
| `ptnt-2024-nadcisnienie.md` | Zasady postępowania w nadciśnieniu tętniczym | PTNT (z KLRwP i in.) | 2024 (sprawdź) | Nadciśnienie Tętnicze w Praktyce, [journals.viamedica.pl](https://journals.viamedica.pl/nadcisnienie_tetnicze_w_praktyce) |
| `ptd-2025-cukrzyca.md` | Zalecenia kliniczne dotyczące postępowania u osób z cukrzycą | Polskie Towarzystwo Diabetologiczne | co rok (2025/2026) | ptdiab.pl, Current Topics in Diabetes; omówienie 2024: [termedia](https://www.termedia.pl/Wytyczne-Polskiego-Towarzystwa-Diabetologicznego-2024-czyli-ochrona-sercowo-naczyniowo-nerkowa-z-metabolika-w-tle,98,52566,0,1.html) |
| `ptl-20xx-dyslipidemie.md` | Wytyczne PTL/KLRwP/PTK postępowania w zaburzeniach lipidowych | PTL | 2024 (sprawdź) | ptlipid.pl |
| `ptchp-20xx-pochp.md`, `ptchp-20xx-astma.md` | Zalecenia rozpoznawania i leczenia POChP / astmy | PTChP | sprawdź | ptchp.org, Pneumonologia i Alergologia Polska |
| `ptk-20xx-*.md` | Polskie tłumaczenia/komentarze wytycznych ESC (migotanie przedsionków, niewydolność serca, przewlekłe zespoły wieńcowe) | PTK | wg ESC | Kardiologia Polska (journals.viamedica.pl), ptkardio.pl |
| `ptg-20xx-*.md` | Rekomendacje PTG‑E (dyspepsja/H. pylori, GERD, IBS) | Polskie Towarzystwo Gastroenterologii | sprawdź | ptg-e.org.pl |
| `ptp-20xx-depresja.md` | Zalecenia leczenia depresji (w tym w POZ) | Polskie Towarzystwo Psychiatryczne | sprawdź | Psychiatria Polska |
| `pte-20xx-tarczyca.md` | Rekomendacje dot. niedoczynności / nadczynności tarczycy | Polskie Towarzystwo Endokrynologiczne | sprawdź | Endokrynologia Polska (journals.viamedica.pl) |
| `nfz-20xx-koszyk-poz.md` | Wykaz badań diagnostycznych w POZ i budżet powierzony opieki koordynowanej | MZ / NFZ (rozporządzenie, zarządzenie Prezesa NFZ) | aktualne | isap.sejm.gov.pl, nfz.gov.pl — **pragmatyk POZ czyta zawsze** |
| `mp-*.md` | Interna Szczeklika / mp.pl — zbiór aktualnych wytycznych z omówieniami | Medycyna Praktyczna | — | [mp.pl/artykuly/wytyczne](https://www.mp.pl/artykuly/wytyczne?spec_id=95) (subskrypcja; traktować jako indeks, nie źródło pierwotne) |

## 3. Europejskie i międzynarodowe — poziom 3 (gdy polskie milczą)

| plik docelowy | dokument | wydawca | rok | PMID / DOI (sprawdzone w PubMed) |
|---|---|---|---|---|
| `eaaci-2020-beta-laktamy.md` | Towards a more precise diagnosis of hypersensitivity to beta-lactams | EAACI | 2020 | PMID 31749148, doi 10.1111/all.14122 |
| `aaaai-2022-alergia-na-leki.md` | Drug allergy: a 2022 practice parameter update | AAAAI/ACAAI | 2022 | PMID 36122788, doi 10.1016/j.jaci.2022.08.028 |
| `wao-2020-anafilaksja.md` | WAO anaphylaxis guidance 2020 | WAO | 2020 | PMID 33204386, doi 10.1016/j.waojou.2020.100472 |
| `eaaci-2022-pokrzywka.md` | EAACI/GA²LEN/EuroGuiDerm/APAAACI guideline for urticaria | EAACI i in. | 2022 | PMID 34536239 |
| `who-2024-grypa.md` | WHO clinical practice guidelines for influenza (streszczenie BMJ) | WHO | 2024 (BMJ 2026) | PMID 41760115, doi 10.1136/bmj-2025-087397 |
| `atsidsa-2019-pzp.md` | Diagnosis and treatment of adults with CAP | ATS/IDSA | 2019 | PMID 31573350, doi 10.1164/rccm.201908-1581ST |
| `ers-escmid-2011-lrti.md` | Guidelines for the management of adult lower respiratory tract infections | ERS/ESCMID | 2011 (sprawdź aktualizację) | wyszukać w PubMed przed dodaniem |
| `nice-ng138-pzp.md`, `nice-ng120-kaszel.md` | Pneumonia (community-acquired): antimicrobial prescribing; Cough (acute): antimicrobial prescribing | NICE | 2019 | nice.org.uk/guidance/ng138, ng120 |
| `ecdc-*.md` | Wytyczne ECDC (kontrola zakażeń, szczepienia personelu) | ECDC | — | ecdc.europa.eu |
| `esc-*.md`, `esh-2023-nadcisnienie.md` | Wytyczne ESC (AF 2024, HF 2021/2023, CCS 2024) i ESH 2023 | ESC/ESH | wg dokumentu | escardio.org (bezpłatne PDF) |
| `gina-20xx.md`, `gold-20xx.md` | Astma / POChP | GINA / GOLD | co rok | ginasthma.org, goldcopd.org |
| `kdigo-2024-pchn.md` | Przewlekła choroba nerek (dawkowanie wg eGFR) | KDIGO | 2024 | kdigo.org |

## 4. Uwagi prawne i praktyczne

- Do `zrodla/` trafiają tylko pliki pobrane legalnie przez Michała (wiele polskich wytycznych to artykuły w czasopismach, często w otwartym dostępie; mp.pl jest płatne). Repozytorium jest prywatne — nie udostępniać plików dalej.
- ChPL z Rejestru URPL są publiczne i najważniejsze dla dawkowania (reguła 3 w MANIFEST: ChPL > wytyczna przy dawce konkretnego preparatu).
- Każdy plik z datą pobrania w MANIFEST; przy wytycznych corocznych (PTD, GINA, GOLD, szczepienia) — przypomnienie raz w roku.

## 5. Gotowe wiersze do `zrodla/MANIFEST.md` (dla Kodującego, po wrzuceniu plików)

```
| `npoa-2016-zakazenia-oddechowe.md` | Rekomendacje postępowania w pozaszpitalnych zakażeniach układu oddechowego | NPOA | 2016 | zakażenia dróg oddechowych dorośli, antybiotyki | P1 |
| `who-2024-grypa.md` | WHO clinical practice guidelines for influenza | WHO | 2024 | grypa: leki przeciwwirusowe, testy | P1, poziom 3 |
| `eaaci-2020-beta-laktamy.md` | Diagnosis of hypersensitivity to beta-lactams | EAACI | 2020 | alergia na beta-laktamy, reaktywność krzyżowa R1 | P1, poziom 3 |
| `aaaai-2022-alergia-na-leki.md` | Drug allergy practice parameter | AAAAI/ACAAI | 2022 | alergia na leki, NLPZ, cefalosporyny | P1, poziom 3 |
| `wao-2020-anafilaksja.md` | WAO anaphylaxis guidance | WAO | 2020 | anafilaksja: kryteria, adrenalina | P1, poziom 3 |
| `eaaci-2022-pokrzywka.md` | Guideline for urticaria | EAACI/GA2LEN | 2022 | pokrzywka: leki przeciwhistaminowe | P1, poziom 3 |
| `chpl-<substancja>-<postac>.md` | ChPL | URPL | <data> | dawkowanie | P1 |
| `nfz-<rok>-koszyk-poz.md` | Wykaz badań POZ / opieka koordynowana | MZ/NFZ | <rok> | zlecanie badań | pragmatyk POZ czyta zawsze |
```

Kolejny krok Merytorycznego: po decyzji Michała uzupełnię kolumnę „sprawdź” (aktualne wersje i bezpośrednie linki do PDF) dla pozycji P1.
