# Konsylium AI — jak to działa, po ludzku

Wyobraź sobie oddział szpitalny. Ty jesteś lekarzem, który przynosi przypadek. Reszta to agenci AI,
każdy z inną rolą. Poniżej, krok po kroku, co się dzieje z Twoim przypadkiem.

## Kto tu pracuje

**Ordynator** — szef. Rozmawia z Tobą, dopytuje, rozdziela pracę, prowadzi dyskusję i na końcu
mówi jedno zdanie: „zrób to". Tylko on może coś zapisać do pamięci zespołu.

**Trzech zastępców** — sortują sprawy. Każdy patrzy na jedno:
- Zastępca ds. złożoności: „czy to jest skomplikowane?" (dużo chorób, dużo leków, dużo niewiadomych)
- Zastępca ds. bezpieczeństwa: „czy to jest groźne?" (czerwone flagi)
- Zastępca ds. niepewności: „czy sami jesteśmy pewni?" (robi szybki własny strzał i porównuje z ordynatorem)

Jeśli **którykolwiek** powie „tak" → pełne konsylium. Jeśli wszyscy „nie" → tryb szybki.
Nie głosują większością. Wystarczy jeden, bo w medycynie bezpieczeństwa się nie przegłosowuje.

**Sześciu lekarzy stałych** — każdy myśli inaczej, i to jest celowe:
1. *Hipotezujący* — robi listę: co to może być i na ile procent.
2. *Bayesowski* — pyta „co ta informacja zmienia?". Jeśli pacjent ma 25 lat, zawał jest mało prawdopodobny *zanim* spojrzysz na EKG.
3. *Najgorszy scenariusz* — „czego nie mogę przegapić?". Ma prawo zablokować wynik, dopóki groźna rzecz nie zostanie wykluczona.
4. *Pragmatyk POZ* — „co realnie zrobię w gabinecie w 15 minut, bez TK za ścianą?"
5. *Farmakolog* — leki, dawki, interakcje, nerki, wiek. Nie zgaduje diagnozy — pilnuje leczenia.
6. *Gospodarz kosztów* — „czego NIE zlecać?". Pilnuje, żeby nie było 15 badań „na wszelki wypadek".

**Dwóch sprawdzających** — nie mają zdania, tylko sprawdzają:
- *Sprawdzający faktów* — każda dawka, każdy próg, każde kryterium: skąd to jest? Ma Twoje polskie wytyczne i PubMed. Jeśli liczba nie ma źródła — odrzuca.
- *Sprawdzający procesu* — czy wywiad był kompletny, czy odpowiedziano na czerwone flagi, czy wynik to jedno zdanie, a nie „A albo B".

**Rezydenci z zewnątrz** (2–3) — świeże oczy. Dostają **tylko surowe dane** (dokładnie to, co wpisałeś) i **jedno zdanie decyzji**.
Nie widzą dyskusji, pamięci zespołu, Twoich wytycznych ani tego, jak zespół myśli. Mają zadanie:
„Załóż, że za rok okaże się, że to była zła decyzja. Co było przyczyną? Czego brakuje w danych? O co nikt nie zapytał?"

## Dlaczego rezydenci nie mogą widzieć wszystkiego

Bo wtedy myśleliby tak jak zespół. Cały sens „kogoś z zewnątrz" to to, że **nie zna założeń**.
Konkretnie: zespół pracuje na danych już uporządkowanych przez ordynatora. Rezydent widzi to, co wpisałeś *przed* porządkowaniem —
więc widzi też to, co porządkowanie wyrzuciło. Jeśli ordynator uznał, że „ból w barku" to nieistotne, a rezydent zapyta
„czemu nikt nie sprawdził serca?" — to właśnie o to chodziło.

Dodatkowo rezydent jest z innego modelu (np. GPT albo Gemini, nie Claude), żeby miał inne nawyki, i nie pamięta poprzednich spraw.

## Jak liczone są punkty

Są trzy różne liczenia, nie jedno:

**1. Łączenie głosów w sprawie.**
Każdy lekarz mówi: „70% zapalenie, 20% kamica, 10% inne" i „pilność 3/5". Program łączy te procenty w jeden wynik.
Ale głosy mają różną wagę, i waga zależy od **roli i od tego, o czym mowa**:

| | Rozpoznanie | Pilność | Plan leczenia |
|---|---|---|---|
| Hipotezujący | duża | średnia | mała |
| Bayesowski | duża | średnia | mała |
| Najgorszy scenariusz | średnia | **weto** (może tylko podnieść) | mała |
| Pragmatyk POZ | średnia | średnia | duża |
| Farmakolog | **zero** | mała | **duża** |
| Gospodarz kosztów | zero | mała | średnia |
| Rezydenci | zero | zero | zero |

Czyli: nie „ta osoba ma większy głos", tylko „ta rola ma większy głos w tej konkretnej sprawie".

**2. Kto trafia — kalibracja.**
Gdy po tygodniu wpiszesz „a naprawdę to było X", program sprawdza, kto był blisko. Ten, kto trafia, dostaje trochę większy głos
(maksymalnie 1,5×), kto nie trafia — mniejszy (minimum 0,5×). Zmienia się powoli, żeby jeden pechowy przypadek nic nie przestawił.

Rezydenci nie mają głosu, więc nie mają kalibracji. Liczy się za to: ile ich uwag ordynator przyjął i ile z nich zmieniło decyzję.
Jeśli ten sam typ uwagi wraca („znów nikt nie zapytał o alkohol") — to nie rezydent jest mądry, to **zespół ma lukę**.
Wtedy luka idzie do pamięci zespołu i stali lekarze uczą się jej pilnować.

**3. Ocena całej sprawy** — jak w badaniu ze Stanfordu: czy lista różnicowa była sensowna, czy były argumenty za i przeciw,
czy następny krok był właściwy, czy było bezpiecznie, czy komunikat był jasny. 0–100 punktów. To służy Tobie do oceny,
czy narzędzie w ogóle działa — i zastępcy używają tego do triage.

## Co wychodzi na końcu

Jedna kartka:
```
REKOMENDACJA: Pilne skierowanie na SOR z podejrzeniem X.
PILNOŚĆ: 1 (natychmiast) — PEWNOŚĆ: wysoka
DLACZEGO: trzy zdania.
PLAN B: jeśli troponina ujemna → ...
CZEGO NIE WIEMY: nie znamy ... — gdyby okazało się ..., zmieniłoby to decyzję na ...
WRÓĆ / ESKALUJ GDY: ...
ŹRÓDŁA: ...
```
Nie ma „rozważ A lub B". Badanie z Oxfordu pokazało, że to właśnie lista opcji bez decyzji sprawia, że ludzie z czatem
wypadają gorzej niż ludzie bez czatu. Konsylium ma decydować. Ty — jako lekarz — możesz się nie zgodzić, ale masz się z czym nie zgadzać.

## Źródła wiedzy

Kolejność ważności:
1. **Twoja biblioteka** `zrodla/` — polskie wytyczne, ChPL, protokoły, które sam wrzucisz. Co tu jest, bije wiedzę modelu.
2. **PubMed** — badania, zawsze z DOI.
3. Wytyczne europejskie/światowe — gdy brak polskich.
4. Pamięć modelu — tylko w ostateczności i zawsze oznaczona „niezweryfikowane".

Rezydenci mają tylko PubMed. Twojej biblioteki nie widzą — po to, żeby nie czytali tych samych wytycznych co zespół.

## Dwa tryby

**Szybki** (większość spraw w POZ): ordynator + farmakolog + sprawdzający faktów. Kilka minut, mało tokenów.
**Pełny** (gdy zastępca podniesie rękę): wszyscy, w tym rezydenci. Drożej, dłużej, ale do tego to jest.

## Czego to nie robi

To narzędzie **testowe i edukacyjne** marki MS — do ćwiczenia myślenia klinicznego i zbierania wiedzy oraz publikacji, **nie do realnych pacjentów**. Mimo to pracuje z pełną mocą, bo inaczej nic by nie uczyło. Daje Tobie uporządkowaną drugą opinię z jedną decyzją i listą wątpliwości.
Odpowiedzialność zostaje u Ciebie, i tak ma być.
