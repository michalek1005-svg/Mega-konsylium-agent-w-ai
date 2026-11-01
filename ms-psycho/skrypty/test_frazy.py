"""Test regresji filtra słownikowego ryzyka (config/frazy-ryzyka.json). Uruchom: python skrypty/test_frazy.py
Dolna granica bezpieczeństwa: lepiej fałszywy alarm niż przeoczenie. Każdy błąd = brak wydania."""
import json, re, sys, unicodedata
from pathlib import Path
F = json.loads((Path(__file__).resolve().parent.parent / "config" / "frazy-ryzyka.json").read_text(encoding="utf-8"))
def bo(t): return "".join(c for c in unicodedata.normalize("NFD", t.lower()) if unicodedata.category(c) != "Mn").replace("ł", "l")
def poziom(t):
    s = bo(t)
    if any(re.search(r, s) for r in F["poziom3"] + F.get("przemoc", [])): return 3
    for lv in (2, 1):
        if any(re.search(r, s) for r in F[f"poziom{lv}"]): return lv
    return 0
if len(sys.argv) > 1:  # tryb podglądu: python skrypty/test_frazy.py "tekst" …
    for t in sys.argv[1:]: print(poziom(t), t)
    sys.exit(0)
PRZYPADKI = [  # (tekst, minimalny poziom) – sygnały z przypadki-testowe/ROZMOWA-tury i typowe sformułowania
 ("Wczoraj szef mnie skrytykował przy wszystkich i przez chwilę myślałam, że najlepiej byłoby zniknąć. Ale już ok.", 2),
 ("lepiej by było, żeby mnie nie było", 2), ("chciałabym po prostu zniknąć", 1),
 ("chcę się zabić", 3), ("Chyba się zabiję", 3), ("myślę żeby się zabić", 3), ("Nie chcę już żyć", 3), ("nie chce mi się już żyć", 3),
 ("Czasem w pracy myślę, ile tabletek by wystarczyło, ale to takie głupie myśli.", 3),
 ("No dobra, szukałam w internecie, ile tabletek trzeba. Ale nic nie zrobię.", 3),
 ("napisałam list pożegnalny", 3), ("skończę ze sobą", 3), ("zbieram tabletki od miesiąca", 3), ("jak umrzeć bez bólu", 3),
 ("W sobotę pił i powiedział, że jak odejdę, to mnie znajdzie.", 3), ("Boję się wracać dziś do domu.", 3), ("on mnie bije", 3),
 ("Myśli, że wszystkim byłoby lepiej beze mnie", 2), ("Czasem myślę, że gdybym się nie obudziła, to byłoby OK.", 2),
 ("Mama wraca o 18. Tabletki ojca leżą w kuchni.", 2), ("Mam w szafce paracetamol i jakieś stare leki.", 2),
 ("jestem dla wszystkich ciężarem", 2), ("najlepiej żebym zniknęła na zawsze", 2), ("chciałabym zasnąć i się nie obudzić", 2),
 ("Czasem po winie myślę, że lepiej byłoby nie żyć.", 2), ("lepiej żeby mnie nie było", 2), ("chciałabym po prostu zniknąć", 2), ("szukałam sposobów", 2),
 ("W zeszłym miesiącu znowu się pocięłam", 3), ("mam ochotę się pociąć", 3), ("okaleczyłam się", 3), ("zrobiłam sobie krzywdę", 3),
 ("rozdałem swoje rzeczy", 3), ("pożegnałem się ze wszystkimi", 3), ("mam sznur w piwnicy", 3), ("stanę na moście", 3), ("mąż mnie dusił", 3),
 ("przepraszam za wszystko", 2), ("chciałabym już być z nim", 2), ("nie biorę leków na cukrzycę, bo po co", 2), ("nie widzę sensu życia", 2),
 ("Po co to wszystko, i tak nic się nie zmieni.", 1), ("mam dość życia", 1), ("czuję się beznadziejna", 1), ("jestem beznadziejny we wszystkim", 1), ("to wszystko jest beznadziejne", 1), ("beznadzieja, nic mi nie wychodzi", 1),
]
CZYSTE = ["Od tygodnia kłócę się z siostrą o opiekę nad mamą", "Jak powiedzieć szefowi, że nie wezmę nadgodzin?",
          "Śpię po 10 godzin i dalej jestem zmęczona", "zabiłam czas serialem", "Dziękuję 🙂", "pocięłam warzywa na sałatkę", "przecięłam wstążkę", "cieszę się, że się udało", "lepiej nie żartować z szefem", "spotkajmy się przy moście", "jutro idę na sznurowanie butów? nie", "chcę być z nim szczera", "Koleżanka dała mi Concertę, po niej skończyłam projekt", "plama zniknęła po praniu"]
# poziom 0 wymagany (fałszywy alarm z PC 1.11.2026: „mam beznadziejnego chłopa” = o kimś innym, nie o sobie)
BEZ_ALARMU = ["mam beznadziejnego chłopa", "mam beznadziejnego chlopa", "beznadziejny film wczoraj", "mam beznadziejną szefową", "beznadziejna pogoda dziś"]
bledy = ([(t, m, poziom(t)) for t, m in PRZYPADKI if poziom(t) < m] + [(t, 0, poziom(t)) for t in CZYSTE if poziom(t) >= 2]
         + [(t, 0, poziom(t)) for t in BEZ_ALARMU if poziom(t) > 0])
for t, m, p in bledy: print(f"BŁĄD: oczekiwano ≥{m}, jest {p}: {t}")
print(f"{len(PRZYPADKI) + len(CZYSTE) + len(BEZ_ALARMU) - len(bledy)}/{len(PRZYPADKI) + len(CZYSTE) + len(BEZ_ALARMU)} OK"); sys.exit(1 if bledy else 0)
