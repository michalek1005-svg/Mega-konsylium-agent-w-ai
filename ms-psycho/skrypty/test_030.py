#!/usr/bin/env python3
"""Test 0.3.0 bez aplikacji: ćwiczenie krok po kroku, cel pracy, styl terapeuty, superwizja, notatka, realizm.py.
Pracuje na kopii skryptów i config w katalogu tymczasowym (dane prawdziwych rozmów nie są dotykane).
Użycie: python3 skrypty/test_030.py"""
import json
import shutil
import subprocess
import sys
import tempfile
from datetime import datetime, timedelta, timezone
from pathlib import Path

TU = Path(__file__).resolve().parent
TMP = Path(tempfile.mkdtemp(prefix="ms-psycho-030-"))
for k in ("skrypty", "config"):
    shutil.copytree(TU.parent / k, TMP / k)
KONTO, RID = "ktest1", "ktest1-2026-11-02-1000-abc"
K, R = TMP / "konta" / KONTO, TMP / "rozmowy" / RID
K.mkdir(parents=True)
R.mkdir(parents=True)
(K / "profil.json").write_text(json.dumps({"konto": KONTO, "pseudonim": "Test", "wiek": 34, "plec": "kobieta"}), encoding="utf-8")
(K / "terapeuta.json").write_text(json.dumps({"styl": "wprost"}), encoding="utf-8")
(R / "meta.json").write_text(json.dumps({"rozmowa": RID, "konto": KONTO, "tryb": "rozmowa"}), encoding="utf-8")
T0 = datetime.now(timezone.utc) - timedelta(minutes=20)
ja: list = []
bledy: list = []


def ts(m):
    return (T0 + timedelta(minutes=m)).isoformat()


def osoba(tekst, **kw):
    ja.append({"n": len(ja) + 1, "ts": ts(len(ja)), "tekst": tekst, "typ": "wiadomosc", **kw})
    (R / "uzytkownik.json").write_text(json.dumps({"rozmowa": RID, "wiadomosci": ja}, ensure_ascii=False), encoding="utf-8")


def py(*a, ok=True):
    r = subprocess.run([sys.executable, str(TMP / "skrypty" / a[0]), *a[1:]], cwd=TMP, capture_output=True, text=True, encoding="utf-8")
    if ok and r.returncode:
        raise SystemExit(f"BŁĄD {a}: {r.stdout}{r.stderr}")
    return r.returncode, r.stdout + r.stderr


def odp(d, ok=True):
    (TMP / "odp.json").write_text(json.dumps(d, ensure_ascii=False), encoding="utf-8")
    return py("rozmowa.py", "odpowiedz", "--rozmowa", RID, "--plik", str(TMP / "odp.json"), ok=ok)


def sprawdz(war, opis):
    print(("OK   " if war else "BŁĄD ") + opis)
    if not war:
        bledy.append(opis)


# sesja: start → otwarcie z celem
osoba("▶ Zaczynam sesję", typ="sesja", akcja="start")
_, out = py("rozmowa.py", "czekaj", "--rozmowa", RID, "--limit", "2")
sprawdz("STYL TERAPEUTY" in out and "Wprost i konkretnie" in out, "czekaj pokazuje kartę stylu z konta")
sprawdz("CEL PRACY (docs/ROZMOWA.md §0d): jeszcze go nie ma" in out, "otwarcie sesji bez celu → wskazówka, by go uzgodnić")
odp({"tekst": "Dobrze, że jesteś. O czym dziś najważniejsze?", "ryzyko": 0, "tempo": "krotko"})
osoba("Chcę przestać się zadręczać tym, co mówi szefowa. Wczoraj znowu skrytykowała mnie przy wszystkich.")
odp({"tekst": "Rozumiem, to boli. Zapiszmy, nad czym pracujemy: żeby krytyka szefowej nie zabierała Ci całego wieczoru. Czy tak to brzmi?", "ryzyko": 0, "cel": "Żeby krytyka szefowej nie zabierała mi całego wieczoru."})
cel = json.loads((K / "cel.json").read_text(encoding="utf-8"))
sprawdz(cel["status"] == "propozycja" and "szefowej" in cel["tekst"], "pole cel → konta/…/cel.json jako propozycja")
_, out = odp({"tekst": "Ok.", "ryzyko": 0, "cel_przeglad": True}, ok=False)
sprawdz("wymaga uzgodnionego celu" in out, "przegląd celu przed uzgodnieniem odrzucony")

# ćwiczenie: bez zgody odrzucone, ze zgodą – krok po kroku do karty wyniku
osoba("Tak, to jest to. Co mogę z tym zrobić?")
_, out = py("rozmowa.py", "czekaj", "--rozmowa", RID, "--limit", "2")
sprawdz("ĆWICZENIA (za zgodą" in out and "zapis_mysli" in out, "czekaj podpowiada listę ćwiczeń w fazie pracy")
_, out = odp({"tekst": "Zróbmy zapis myśli. Gdzie to było i co się działo?", "ryzyko": 0, "cwiczenie": {"start": "zapis_mysli", "zgoda": "chętnie"}}, ok=False)
sprawdz("tylko za zgodą" in out, "start ćwiczenia bez cytatu zgody osoby odrzucony")
odp({"tekst": "Mam pomysł: zapis myśli, kilka minut, krok po kroku. Chcesz spróbować?", "ryzyko": 0})
osoba("tak, spróbujmy")
_, out = odp({"tekst": "Zaczynamy 🙂 Gdzie to było i co się wtedy działo?", "ryzyko": 0, "cwiczenie": {"start": "zapis_mysli", "zgoda": "tak, spróbujmy"}})
sprawdz("styl „Wprost i konkretnie”: bez emotikonów" in out, "styl „wprost” ostrzega przed emotikonami")
cw = json.loads((R / "cwiczenie.json").read_text(encoding="utf-8"))
sprawdz(cw["status"] == "trwa" and cw["krok"] == 0 and cw["liczba_krokow"] == 7, "cwiczenie.json: trwa, krok 0 z 7")
odpowiedzi = ["Zebranie, szefowa powiedziała, że raport jest słaby.", "Jestem do niczego.", "wstyd, 80", "Raport miał błędy w tabeli.",
              "Dwa poprzednie raporty pochwaliła.", "Ten raport miał błędy, ale ja nie jestem do niczego.", "40"]
for i, a_ in enumerate(odpowiedzi):
    osoba(a_)
    _, out = py("rozmowa.py", "czekaj", "--rozmowa", RID, "--limit", "2")
    if i == 0:
        sprawdz("ĆWICZENIE „Zapis myśli” · krok 1/7" in out and "SZYBKO NAJPIERW" not in out, "czekaj prowadzi krok 1/7 bez odpowiedzi wstępnej")
    ost = i == len(odpowiedzi) - 1
    if i == 1:
        _, o2 = odp({"tekst": "Dzięki.", "ryzyko": 1, "cwiczenie": {"krok": a_}}, ok=False)
        sprawdz("Następny krok ćwiczenia" in o2, "krok bez pytania następnego kroku odrzucony")
    odp({"tekst": "Podsumowując: myśl „jestem do niczego” osłabła z 80 do 40." if ost else "Zapisuję. Następne pytanie?", "ryzyko": 1 if i else 0, "cwiczenie": {"krok": a_}})  # „jestem do niczego” = poziom 1 filtra
cw = json.loads((R / "cwiczenie.json").read_text(encoding="utf-8"))
z = json.loads((R / "zespol.json").read_text(encoding="utf-8"))["wiadomosci"]
sprawdz(cw["status"] == "zakonczone" and cw["odpowiedzi"]["emocja_po"] == "40", "ćwiczenie zakończone, odpowiedzi zapisane")
sprawdz(z[-1].get("wynik_cwiczenia", {}).get("pola", [[None]])[0][0] == "Sytuacja", "ostatnia odpowiedź niesie kartę wyniku dla aplikacji")
sprawdz(json.loads((K / "cwiczenia.json").read_text(encoding="utf-8"))[-1]["id"] == "zapis_mysli", "wynik w konta/…/cwiczenia.json")

# drugie ćwiczenie przerwane przyciskiem; przy ryzyku 3 ćwiczenie nie startuje
osoba("ok, a możemy jeszcze uziemienie?")
odp({"tekst": "Jasne. Jak silne jest napięcie teraz, od 0 do 10?", "ryzyko": 1, "cwiczenie": {"start": "uziemienie", "zgoda": "możemy jeszcze uziemienie"}})
osoba("⏸ Przerywam ćwiczenie", typ="cwiczenie", akcja="przerwij")
_, out = py("rozmowa.py", "czekaj", "--rozmowa", RID, "--limit", "2")
sprawdz("ĆWICZENIE PRZERWANE przyciskiem" in out, "przycisk „Przerwij” → czekaj prosi o krótkie przyjęcie")
odp({"tekst": "Jasne, zostawiamy to – możemy wrócić, kiedy zechcesz.", "ryzyko": 1, "tempo": "krotko", "cwiczenie": {"przerwij": True}})
cw = json.loads((R / "cwiczenie.json").read_text(encoding="utf-8"))
sprawdz(cw["status"] == "przerwane", "ćwiczenie przerwane przyciskiem → status przerwane")

# superwizja i notatka
(TMP / "str.md").write_text("Osoba pracowała nad krytyką szefowej. Zrobiliśmy zapis myśli. Klient-sędzia: zielona kartka, za szybko do techniki.", encoding="utf-8")
osoba("■ Kończę sesję", typ="sesja", akcja="koniec", suwaki={"samopoczucie": 6, "trafnosc": 8}, termin="za tydzień")
_, out = py("rozmowa.py", "czekaj", "--rozmowa", RID, "--limit", "2")
sprawdz("rozmowa.py superwizja" in out, "koniec sesji → wskazówka superwizji")
_, out = py("rozmowa.py", "superwizja", "--rozmowa", RID, "--plik", str(TMP / "str.md"))
pliki = list((TMP / "superwizja" / KONTO).glob("*-s1.md"))
sprawdz(bool(pliki) and "udział słów terapeuty" in pliki[0].read_text(encoding="utf-8"), "superwizja/<konto>/<data>-s1.md z liczbami sesji")
code, out = py("rozmowa.py", "notatka", "--konto", "kzzzzz", "--tekst", "x", ok=False)
sprawdz(code != 0, "notatka dla nieistniejącego konta odrzucona")
py("rozmowa.py", "notatka", "--konto", KONTO, "--tekst", "Za szybko do rad; w następnej sesji więcej słuchania.")
osoba("▶ Zaczynam sesję", typ="sesja", akcja="start")
_, out = py("rozmowa.py", "czekaj", "--rozmowa", RID, "--limit", "2")
sprawdz("NOTATKA SUPERWIZORA" in out and "więcej słuchania" in out, "notatka superwizora widoczna w następnej sesji")
sprawdz("CEL PRAC" in out, "cel pracy widoczny w czekaj")

# ryzyko: ćwiczenie nie startuje przy poziomie 3
odp({"tekst": "Dobrze Cię widzieć. O czym dziś?", "ryzyko": 1, "tempo": "krotko"})
osoba("tak, spróbujmy, chociaż czasem myślę, żeby skończyć ze sobą", ryzykoLokalne=3)
_, out = odp({"tekst": "Dziękuję, że to piszesz. Zadzwoń teraz pod 800 70 2222. Jesteś teraz bezpieczna?", "ryzyko": 3, "kryzys": True,
              "cwiczenie": {"start": "uziemienie", "zgoda": "tak, spróbujmy"}}, ok=False)
sprawdz("najpierw bezpieczeństwo" in out, "przy ryzyku 3 ćwiczenie nie startuje")

# realizm
_, out = py("realizm.py", "--konto", KONTO)
sprawdz("Udział słów terapeuty" in out and "| 1 |" in out, "realizm.py: raport z tabelą sesji")
if "--pokaz" in sys.argv:
    print(out)
    print((pliki[0].read_text(encoding="utf-8")))
_, out = py("realizm.py", "--json")
j = json.loads(out)
sprawdz(j[0]["cwiczenia_koniec"] == 1 and j[0]["cwiczenia_start"] == 2 and j[0]["suwaki"]["trafnosc"] == 8, "realizm.py: ćwiczenia i suwaki policzone")
_, out = py("realizm.py", "--zapisz")
sprawdz((TMP / "raporty").is_dir() and any((TMP / "raporty").glob("REALIZM-*.md")), "realizm.py --zapisz → raporty/REALIZM-<data>.md")

shutil.rmtree(TMP, ignore_errors=True)
print(f"\n{'WSZYSTKO OK' if not bledy else f'{len(bledy)} BŁĘDÓW'} (test 0.3.0)")
sys.exit(1 if bledy else 0)
