# MS Konsylium Psychologiczne – koncepcje rozwoju po wersji testowej 0.1.0 (do oceny 2.11.2026)

Wątek Psycholog (Opus), 1.11.2026 ~05:20. Wersja 0.1.0 jest w paczce (`narzedzia/psycho/`). Poniżej to, czego w niej **nie ma** albo co jest uproszczone, w kolejności, w jakiej polecam robić. Każdy punkt: co, dlaczego, koszt, decyzja dla Michała.

## A. Najpierw (przed pokazaniem komukolwiek poza nami)

1. **Pomiar na 10 przypadkach PSY i baterii bezpieczeństwa.** _(Częściowo zrobione 1.11 05:25–05:40: PSY‑03, PSY‑10 i sytuacja z szefową, oceny 7,5 / 7 / 8,5 na 10 – narzedzia/psycho/RAPORT-PROB-ROZMOWY-2026-11-01.md; zostaje 7 przypadków i bateria 20 sygnałów pośrednich.)_ Aplikacja ma test techniczny (e2e), ale nikt jeszcze nie przeprowadził prawdziwej Rozmowy z zespołem agentów na komputerze. Propozycja: Testowy prowadzi PSY‑01…10 w Rozmowie (tury z `ROZMOWA-tury-uzytkownika.md`) i ocenia wg `KRYTERIA-OCENY.md`; osobno 20 wiadomości z sygnałami pośrednimi ryzyka (beznadzieja, bycie ciężarem, pożegnania, „gdybym się nie obudziła”). Cel z `PSYCHO-SIEC-AGENTOW.md`: ≥93% właściwych reakcji i **zero zaniżeń ryzyka**. Koszt: 1 wieczór pracy wątku Testowego. *Decyzja: tak/nie.*
2. **Weryfikacja numerów pomocy.** _(Zrobione 1.11: gov.pl i NASK – 116 123 całodobowo.)_ `config/pomoc-pl.json` ma 112, 800 70 2222, 116 123, 800 120 002 – godziny 116 123 są oznaczone „sprawdź”. Michał lub Merytoryczny potwierdza raz, data w pliku. *Decyzja: kto sprawdza.*
3. **Czas odpowiedzi.** Jedna tura Rozmowy to strażnik + 2–3 podejścia + scalenie + klient‑sędzia = 5–6 wywołań na Fable high; szacuję 60–120 s. W komunikatorze to długo. Opcje: (a) zostawić, bo pasek „zespół pracuje” pokazuje, kto myśli; (b) strażnik i klient‑sędzia na Opus medium, terapeuci na Fable – ok. 40–70 s; (c) tryb „szybka odpowiedź” bez panelu dla krótkich wiadomości („dzięki 🙂”). **Polecam (b)+(c).** *Decyzja: a / b / c / b+c.*

## B. Rozmowa – uatrakcyjnienie

4. **Odpowiedź pisana na żywo.** Dziś tekst pojawia się w całości. Animacja pisania słowo po słowie (tylko wizualnie, tekst jest już gotowy) daje wrażenie rozmowy. Koszt: mały (sam front). *Polecam.*
5. **Szybkie odpowiedzi pod wiadomością terapeuty** (2–3 klikalne propozycje: „Opowiem więcej”, „To nie o to chodzi”, „Co mogę zrobić dziś?”). Zgodne z zasadą Michała „nie chcę dużo pisać”. Prowadzący dopisuje je w polu `podpowiedzi`. Koszt: mały. *Polecam.*
6. **Plan bezpieczeństwa jako klikalny formularz** (Stanley–Brown, 6 kroków) – otwierany przez terapeutę AI przy ryzyku ≥1, zapisywany w rozmowie i pokazywany na żądanie. Dowód: plan + kontakt kontrolny wiązał się z mniejszą liczbą zachowań samobójczych (Stanley 2018, JAMA Psychiatry, PMID 29998307). Koszt: średni. *Polecam po punkcie 1.*
7. **Krótkie kwestionariusze w czacie** (PHQ‑9, GAD‑7 jako karty z przyciskami), gdy zespół uzna, że warto zmierzyć nasilenie. Wynik idzie do formulacji roboczej, nie jako „diagnoza”. Koszt: średni (wykorzystać silnik ankiety z Wywiadu).
8. **„Jak to rozumiemy” jako żywa karta** z 5P (problem, predysponujące, wyzwalające, podtrzymujące, chroniące) zamiast zwykłego tekstu, z historią zmian. Koszt: mały–średni.
9. **Głos (mowa → tekst) na iPadzie** – Michał pisze mało; dyktowanie w Safari działa bez sieci po stronie aplikacji. Koszt: mały, wymaga testu na iPadzie.

## C. Pokój psychologiczny

10. **Ekran „Mapa zgody” zamiast wykresu prognoz** – na ścianie wideo trzy kolumny: wspólne (≥2 podejścia), różnice zmieniające postępowanie, zdanie odrębne. Dziś przycisk nazywa się „Zgodność %” i korzysta z mechanizmu prognoz medycznych. Wymaga skryptu `agregacja_formulacji.py` (kody wspólne z tabeli tłumaczeń, `docs/SIEC-AGENTOW.md` §2). Koszt: średni. *Polecam jako następny krok w Pokoju.*
11. **Postacie z własnymi gestami szkoły** (CBT notuje na tablecie, psychodynamiczny słucha z ręką przy brodzie, systemowy rysuje genogram na stoliku, ACT robi pauzę uważności) – Graficzny ma bazę postaci. Koszt: średni, tylko grafika.
12. **Rozmowa ↔ Pokój w obie strony:** po Wnioskach terapeuta AI w Rozmowie streszcza je językiem rozmowy (protokół już to przewiduje, docs/ROZMOWA.md §2) i proponuje jedno działanie. Brakuje tylko przycisku „Wróć do rozmowy” w Pokoju. Koszt: mały.

## D. Źródła i jakość

13. **Biblioteka `zrodla-psycho/`** z pełnymi tekstami wytycznych: NICE NG225 (samookaleczenia), NG222 (depresja), CG113 (lęk), WHO mhGAP 2.0, Kodeks etyczny psychologa PTP, karta przesiewowa C‑SSRS. Z chmury nie pobierzemy (NICE tylko strony, PsycNet i Cochrane zablokowane) – pliki PDF ściąga Michał, Merytoryczny zamienia na .md z sekcjami. Analogicznie do polskich wytycznych w medycynie. *Decyzja: czy Michał pobiera.*
14. **Europe PMC jako drugi silnik** (działa z chmury przez WebFetch, ma preprinty i pełne teksty OA) – dopisać do definicji terapeutów jako obowiązkowe drugie źródło, gdy PubMed daje <3 trafień.
15. **Sędzia na innym modelu** (ślepa ocena „jednego głosu” po sesji, `PSYCHO-SIEC-AGENTOW.md` §4.2) – mierzy, czy odpowiedź nie ma „szwów” i czy nie pochlebia. Detektor szwów w `rozmowa.py` jest już prosty (lista zwrotów); sędzia byłby drugim, poważnym poziomem.

## E. Porządki

16. **Wersja 0.2.0 bez prezentu** (`const PREZENT = false;` w `zbuduj.mjs`) po pokazie dla Halusi.
17. **Wspólna powłoka z MS Konsylium** (profil `medycyna | psychologia` zamiast dwóch kopii) – dopiero, gdy obie aplikacje się ustabilizują; dziś osobna kopia chroni kod konsylium medycznego. Uzgodnić z Kodującym.

---
**Moja kolejność:** 1 → 2 → 3 (b+c) → 4 → 5 → 10 → 6 → 13. Reszta po pierwszych prawdziwych rozmowach.
