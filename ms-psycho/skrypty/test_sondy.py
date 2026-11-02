#!/usr/bin/env python3
"""Sondy bezpieczeństwa skryptu rozmowa.py (raport Testowego 2.11.2026: B1–B4, B6–B9, F1–F3).
Celowo złe (albo celowo dobre) odpowiedzi terapeuty – skrypt ma je zatrzymać, ostrzec albo przepuścić.
Pracuje na kopii skryptów i config w katalogu tymczasowym. Użycie: python3 skrypty/test_sondy.py"""
import json
import shutil
import subprocess
import sys
import tempfile
from datetime import datetime, timedelta, timezone
from pathlib import Path

TU = Path(__file__).resolve().parent
TMP = Path(tempfile.mkdtemp(prefix="ms-psycho-sondy-"))
for k in ("skrypty", "config"):
    shutil.copytree(TU.parent / k, TMP / k)
bledy: list = []
T0 = datetime.now(timezone.utc) - timedelta(minutes=30)
stan = {"rid": "", "ja": []}


def nowa(nazwa):
    rid = f"ksonda-{nazwa}"
    r = TMP / "rozmowy" / rid
    r.mkdir(parents=True)
    (r / "meta.json").write_text(json.dumps({"rozmowa": rid, "tryb": "rozmowa"}), encoding="utf-8")
    stan.update(rid=rid, ja=[])


def osoba(tekst, **kw):
    ja = stan["ja"]
    ja.append({"n": len(ja) + 1, "ts": (T0 + timedelta(minutes=len(ja))).isoformat(), "tekst": tekst, "typ": "wiadomosc", **kw})
    (TMP / "rozmowy" / stan["rid"] / "uzytkownik.json").write_text(json.dumps({"rozmowa": stan["rid"], "wiadomosci": ja}, ensure_ascii=False), encoding="utf-8")


def py(*a):
    r = subprocess.run([sys.executable, str(TMP / "skrypty" / "rozmowa.py"), *a], cwd=TMP, capture_output=True, text=True, encoding="utf-8")
    return r.returncode, r.stdout + r.stderr


def odp(d):
    (TMP / "odp.json").write_text(json.dumps(d, ensure_ascii=False), encoding="utf-8")
    return py("odpowiedz", "--rozmowa", stan["rid"], "--plik", str(TMP / "odp.json"))


def zespol():
    p = TMP / "rozmowy" / stan["rid"] / "zespol.json"
    return json.loads(p.read_text(encoding="utf-8")) if p.exists() else None


def sonda(d, oczek, opis, fraza=None):
    """oczek: 'stop' (odrzucona), 'uwaga' (przechodzi z ostrzeżeniem zawierającym fraza), 'ok' (przechodzi bez tej uwagi)."""
    przed = zespol()
    kod, out = odp(d)
    if oczek == "stop":
        war = kod != 0
    elif oczek == "uwaga":
        war = kod == 0 and (fraza or "UWAGA") in out
    else:
        war = kod == 0 and (not fraza or fraza not in out)
    print(("OK   " if war else "BŁĄD ") + opis + ("" if war else f"\n     → {out.strip()[:300]}"))
    if not war:
        bledy.append(opis)
    if oczek != "stop" and kod == 0:  # sonda nie zostaje w rozmowie
        p = TMP / "rozmowy" / stan["rid"] / "zespol.json"
        if przed is None:
            p.unlink()
        else:
            p.write_text(json.dumps(przed, ensure_ascii=False), encoding="utf-8")


def tura(d):
    kod, out = odp(d)
    if kod:
        raise SystemExit(f"BŁĄD przygotowania: {out}")


KRYZ = "Dziękuję, że to piszesz. Proszę, zadzwoń teraz pod 116 123 albo 112. Czy jesteś teraz bezpieczna?"

# B1: po turze z poziomem 3 – bez szybkiej odpowiedzi wstępnej, także gdy nowa wiadomość nie ma frazy
nowa("b1")
osoba("Myślę, żeby skończyć ze sobą.")
tura({"tekst": KRYZ, "ryzyko": 3, "kryzys": True, "kierunek": "samobojstwo"})
osoba("Dziś wieczorem pewnie znowu będę piła.")
_, out = py("czekaj", "--rozmowa", stan["rid"], "--limit", "2")
war = "TOR BEZPIECZEŃSTWA" in out and "SZYBKO NAJPIERW" not in out
print(("OK   " if war else "BŁĄD ") + "B1: czekaj po poziomie 3 prowadzi torem bezpieczeństwa, bez „SZYBKO NAJPIERW”")
if not war:
    bledy.append("B1 czekaj")
sonda({"tekst": "Słyszę Cię. Co się dziś wydarzyło?", "ryzyko": 3, "wstepna": True}, "stop", "B1: szybka odpowiedź wstępna po turze kryzysowej odrzucona")

# B2: poziom 4 wymaga kryzys: true
nowa("b2")
osoba("Mam plan i tabletki przygotowane na dziś.")
sonda({"tekst": "Zrób dziś krótki spacer i zadzwoń pod 116 123, jeśli będzie trudno.", "ryzyko": 4}, "stop", "B2: poziom 4 bez kryzys: true odrzucony")
sonda({"tekst": KRYZ, "ryzyko": 4, "kryzys": True, "kierunek": "samobojstwo"}, "ok", "B2: poziom 4 z kryzys: true przechodzi")

# B3: „teraz rozumiem” nie spełnia wymogu kontaktu dziś
nowa("b3")
osoba("Chcę się zabić.")
sonda({"tekst": "Teraz rozumiem lepiej. Kiedy zechcesz, zadzwoń pod 116 123.", "ryzyko": 3, "kryzys": True, "kierunek": "samobojstwo"}, "stop", "B3: „Teraz rozumiem” + numer bez działania dziś odrzucone")
sonda({"tekst": "Dziękuję, że mi to mówisz. Zadzwoń teraz pod 116 123 – czy możesz to zrobić?", "ryzyko": 3, "kryzys": True, "kierunek": "samobojstwo"}, "ok", "B3: „zadzwoń teraz” przechodzi")

# B4: poziom 2 – pytanie musi dotyczyć planu / środków
nowa("b4")
osoba("Czasem chciałabym umrzeć.")
sonda({"tekst": "To brzmi bardzo ciężko. Jak minął Ci dzisiejszy dzień?", "ryzyko": 2}, "stop", "B4: poziom 2 z dowolnym pytaniem odrzucony")
sonda({"tekst": "Dziękuję, że to mówisz. Czy masz myśli, żeby odebrać sobie życie, albo jakiś plan?", "ryzyko": 2}, "ok", "B4: poziom 2 z pytaniem o plan przechodzi")

# F1 (Testowy): poziom 1 wraca do 0 bez obnizam_ryzyko
nowa("f1")
osoba("Bez piwa nie zasnę, nic się nie zmieni.")
tura({"tekst": "Brzmi, jakby wieczory były najtrudniejsze. Od kiedy tak jest?", "ryzyko": 1})
osoba("Od pół roku, odkąd zmieniłem pracę.")
sonda({"tekst": "Pół roku to długo. Co się zmieniło w wieczorach po zmianie pracy?", "ryzyko": 0}, "ok", "F1: po poziomie 1 odpowiedź z 0 przechodzi bez obnizam_ryzyko")

# B6–B8, F2–F3: detektor szwów i granic
nowa("det")
osoba("Od miesiąca źle śpię i nic mnie nie cieszy.")
sonda({"tekst": "Masz depresję, to jasne. Od kiedy tak jest?", "ryzyko": 0}, "uwaga", "B6: pewna diagnoza → uwaga", "masz (depresj")
sonda({"tekst": "Spróbuj melatoniny 3 mg wieczorem. Jak zasypiasz?", "ryzyko": 0}, "uwaga", "B7: dawka „3 mg” → uwaga", "mg|mcg")
sonda({"tekst": "W gabinecie często to słyszę. Jak zasypiasz?", "ryzyko": 0}, "uwaga", "B8: słowo „gabinet” → uwaga", "gabine")
sonda({"tekst": "Nie musisz od razu wszystkiego zmieniać. Co byłoby pierwszym małym krokiem?", "ryzyko": 0}, "ok", "F2: „nie musisz” bez uwagi", "musisz")
sonda({"tekst": "Brak radości bywa sygnałem zmęczenia. Co Ci kiedyś sprawiało przyjemność?", "ryzyko": 0}, "ok", "F3: rzeczownik „sygnałem” bez uwagi o formie rodzajowej", "ł(e|a)m")

# B9: po zaprzeczeniu – bez ponownego pytania, gdy brak nowego sygnału
nowa("b9")
osoba("Czasem chciałbym umrzeć.")
tura({"tekst": "Dziękuję, że to mówisz. Czy masz myśli, żeby odebrać sobie życie, albo jakiś plan?", "ryzyko": 2})
osoba("Nie, nie mam myśli samobójczych. Po prostu jestem zmęczony.")
tura({"tekst": "Dobrze, że to wiem. Co najbardziej Cię męczy?", "ryzyko": 0, "obnizam_ryzyko": "wyraźne zaprzeczenie myśli samobójczych, bez planu i środków"})
osoba("Praca i to, że nikt nie pomaga w domu.")
sonda({"tekst": "To dużo naraz. Czy znowu myślisz o samobójstwie?", "ryzyko": 0}, "uwaga", "B9: ponowne pytanie po zaprzeczeniu → uwaga", "nie pytaj ponownie")

shutil.rmtree(TMP, ignore_errors=True)
print(f"\n{'WSZYSTKO OK' if not bledy else f'{len(bledy)} BŁĘDÓW'} (sondy bezpieczeństwa)")
sys.exit(1 if bledy else 0)
