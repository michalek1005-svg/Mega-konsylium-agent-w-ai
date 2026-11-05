---
rozpoznanie_potwierdzone: ""        # jak ustalono ostatecznie; "nieustalone" jeśli nie wiadomo
pilnosc_faktyczna: 3                 # 1 natychmiast / 2 dziś / 3 ten tydzień / 4 planowo / 5 obserwacja — jaka BYŁA właściwa
czy_decyzja_byla_wlasciwa: tak       # tak | czesciowo | nie
nastepny_krok_byl: wlasciwy          # wlasciwy | za_malo | za_duzo | niewlasciwy
data: 2026-01-01
komentarz: ""
---
Skopiuj ten plik jako `sprawy/<ID>/10-followup.md`, wypełnij nagłówek i uruchom:
```
python3 skrypty/kalibracja.py sprawy/<ID>
python3 skrypty/rubryka.py sprawy/<ID>
```
Potem poproś ordynatora o aktualizację pamięci zespołu („zaktualizuj pamięć po sprawie <ID>").
