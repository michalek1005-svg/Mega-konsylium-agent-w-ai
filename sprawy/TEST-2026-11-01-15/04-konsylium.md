# 04 — Protokół konsylium (ordynator)

Sprawa TEST-2026-11-01-15 · kobieta 32 l., 10. doba połogu · pytanie lekarza: „Migrena po porodzie – co bezpieczne przy karmieniu?”

Runda dyskusji pominięta (`_runda-pominieta.md`): wszystkie 6 ról podało to samo rozpoznanie nr 1 i pilność 1. Flaga `NISKA_ZGODA` (zgoda 0,07) w `_agregat.json` jest artefaktem: agregacja.py traktowała cztery brzmienia tej samej jednostki jako cztery rozpoznania. Poniżej ranking po ręcznym połączeniu synonimów.

## Połączony ranking rozpoznań

| # | Rozpoznanie (po połączeniu synonimów) | Kto wymienił | p (zakres w opiniach z wagą w torze rozpoznanie) |
|---|---|---|---|
| 1 | **Stan przedrzucawkowy poporodowy o późnym początku z cechami ciężkimi** (synonimy połączone: „…z podejrzeniem zajęcia wątroby / HELLP do wykluczenia” [bayes], „…podejrzenie HELLP, zagrożenie rzucawką” [hipotezujacy], „…zagrażająca rzucawka” [najgorszy_scenariusz], „…o późnym początku” [poz_pragmatyk]; farmakolog i gospodarz_kosztow wymienili z p=0, bo nie mają wagi w torze) | 6/6 ról | 0,62–0,80 → po połączeniu suma agregatu ≈ 0,45 z 0,51 masy rankingu; faktyczny konsensus ≈ 0,7 |
| 2 | **Zespół HELLP** jako składowa/powikłanie poz. 1 (osobno wymieniony przez najgorszy_scenariusz 0,18, poz_pragmatyk 0,10, gospodarz_kosztow; bayes i hipotezujacy wliczyli go w poz. 1) | 5/6 | 0,10–0,18 jako osobna pozycja; klinicznie to ten sam tor postępowania |
| 3 | **Zespół tylnej odwracalnej encefalopatii (PRES)** jako powikłanie poz. 1 | hipotezujacy 0,10, poz_pragmatyk 0,05, gospodarz_kosztow | ≈ 0,06 |
| 4 | **Zakrzepica żył i zatok mózgowych** | bayes 0,06, hipotezujacy 0,07, najgorszy_scenariusz 0,06, poz_pragmatyk 0,04, gospodarz_kosztow | ≈ 0,06 |
| 5 | **Migrena z aurą (nawrót w połogu)** | bayes 0,04, hipotezujacy 0,04, najgorszy_scenariusz 0,02, poz_pragmatyk 0,03, gospodarz_kosztow | ≈ 0,03 |
| 6 | **Zespół odwracalnego skurczu naczyń mózgowych (RCVS)** | bayes 0,03, hipotezujacy 0,03, najgorszy_scenariusz 0,05 | ≈ 0,03 |
| 7 | Nadciśnienie poporodowe bez stanu przedrzucawkowego | bayes 0,03 | 0,03 |

Pozycje 2–3 nie konkurują z poz. 1 — są jej cechami ciężkości/powikłaniami i wymagają tego samego kroku (szpital, laboratorium, obrazowanie wg decyzji szpitala). Pozycje 4–6 to różnicowanie **wewnątrzszpitalne** po opanowaniu ciśnienia.

## Sprzeczności między opiniami
Brak sprzeczności co do rozpoznania nr 1, pilności (1 u wszystkich sześciu) i następnego kroku (112, izba przyjęć położnicza, nie POZ). Różnice tylko w rozkładzie masy między „stan przedrzucawkowy z cechami ciężkimi” a „HELLP jako osobne rozpoznanie” — bez wpływu na decyzję.

Jedna różnica w planie leków: farmakolog dopuszcza ibuprofen 600 mg co 6 h **po** wykluczeniu małopłytkowości i uszkodzenia nerek (RCT Penfield 2025, PMID 39938855 — NLPZ nie nasilały ciężkiego nadciśnienia); poz_pragmatyk i bayes mówią „nie dokładać NLPZ”. Rozstrzygam: do czasu wyników morfologii i kreatyniny — tylko paracetamol; decyzja o NLPZ należy do szpitala. Bez wpływu na rekomendację POZ.

## Otwarte red flags i rozstrzygnięcie (weto najgorszego scenariusza)
`lekarz-najgorszy-scenariusz` ma pilność 1 i sześć otwartych red flags. Żadna nie została wykluczona w protokole, więc **weto obowiązuje: pilność = 1**.

| Red flag | Status | Rozstrzygnięcie |
|---|---|---|
| Ciężkie nadciśnienie 162/106 mmHg + ból głowy + zaburzenia widzenia w połogu (reguła ankiety: NATYCHMIAST 112) | OTWARTA | Nie do wykluczenia w POZ; wymaga leczenia hipotensyjnego w ciągu 30–60 min od potwierdzenia (ACOG CO 767, PMID 30681541). Decyduje o pilności 1. |
| Zagrażająca rzucawka (objawy mózgowe przy ciężkim RR) | OTWARTA | Rzucawka >48 h po porodzie = 16% przypadków, zwykle poprzedzona bólem głowy (PMID 37467840). Siarczan magnezu — decyzja szpitala. |
| Zespół HELLP / krwiak podtorebkowy wątroby (ból w prawym podżebrzu) | OTWARTA | Wyklucza tylko laboratorium cito w szpitalu. |
| Obrzęk płuc / kardiomiopatia okołoporodowa przy szybko narastających obrzękach | OTWARTA (duszność NIEZNANE) | Osłuchiwanie, saturacja — ZRM/szpital. |
| Utrata wzroku w PRES | OTWARTA | Ustąpienie po kontrolowaniu RR lub MR — szpital. |
| Zakrzepica zatok / rozwarstwienie tętnic | OTWARTA, drugorzędna | Obrazowanie, jeśli ból utrzyma się mimo kontroli RR — szpital. |

Wykluczone zgodnie u wszystkich ról: popunkcyjny ból głowy (brak znieczulenia neuraksjalnego), infekcja (brak gorączki), piorunujący początek (ból narastał przez godziny), przyczyna polekowa z podanej listy (paracetamol, żelazo/witaminy). Lista leków pozostaje niepełna (metyloergometryna przy porodzie? NIEZNANE) — nie zmienia decyzji.

## Odpowiedź na pytanie lekarza (ustalenie konsylium)
Wszystkie role zgodnie: to nie jest migrena do leczenia w domu; pytanie o lek przeciwmigrenowy jest drugorzędne wobec rozpoznania roboczego. Co do karmienia: kontynuować; leki, których użyje szpital (nifedypina, labetalol, enalapryl, amlodypina) są zgodne z laktacją (PMID 41077107, 33632659). Nie podawać tryptanów ani pochodnych sporyszu (przeciwwskazanie krążeniowe, nie laktacyjne; PMID 40755978, 38563407).

## Decyzja ordynatora
Pilność 1, jedna rekomendacja: 112 → izba przyjęć położnicza. Projekt w `05-projekt.md`.
