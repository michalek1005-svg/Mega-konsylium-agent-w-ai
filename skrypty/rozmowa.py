#!/usr/bin/env python3
"""
Tryb ROZMOWA (okno komunikatora w aplikacji ↔ Claude) — protokół: docs/ROZMOWA.md.

Aplikacja dopisuje wiadomości użytkownika do  rozmowa/<KOD>/wiadomosci.jsonl  i nadpisuje  stan.json.
Claude (prowadzący) odpowiada jednym głosem, dopisując linię {"od":"zespol", …} tym skryptem.

Użycie (z katalogu głównego folderu Konsylium; na Windows „python”):
  python skrypty/rozmowa.py czekaj [--kod KOD] [--po N] [--limit 540]   # czeka na nową wiadomość użytkownika
  python skrypty/rozmowa.py pokaz --kod KOD                             # cała rozmowa + formulacja robocza
  python skrypty/rozmowa.py panel --kod KOD --role cbt,systemowy,straznik  # pasek „zespół pracuje: 3” w aplikacji
  python skrypty/rozmowa.py odpowiedz --kod KOD --plik odp.json [--tekst "…"]
Plik odp.json: {"tekst": "…", "panel": [...], "ryzyko": 0, "glosy": [{"rola": "cbt", "skrot": "…"}], "spor": "…",
                "odbiorca": "klient|terapeuta", "plan_bezpieczenstwa": "…", "przerwanie": false}
"""
from __future__ import annotations

import argparse
import json
import os
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

KATALOG = "rozmowa"
ROLE = {"prowadzacy", "cbt", "psychodynamiczny", "systemowy", "act", "humanistyczny", "diagnosta", "psychiatra",
        "straznik", "straznik_ryzyka", "klient_sedzia", "sprawdzajacy_etyki", "sprawdzajacy_zrodel"}
MAX_SLOW = 220


def korzen() -> Path:
    tu = Path.cwd()
    for p in [tu, *tu.parents]:
        if (p / KATALOG).is_dir() or (p / "CLAUDE.md").is_file():
            return p
    return tu


def katalog(kod: str | None) -> Path | None:
    baza = korzen() / KATALOG
    if kod:
        return baza / kod
    if not baza.is_dir():
        return None
    kand = [d for d in baza.iterdir() if d.is_dir() and (d / "wiadomosci.jsonl").is_file()]
    return max(kand, key=lambda d: (d / "wiadomosci.jsonl").stat().st_mtime) if kand else None


def linie(p: Path) -> list[dict]:
    if not p.is_file():
        return []
    out = []
    for _ in range(5):
        try:
            for l in p.read_text(encoding="utf-8").splitlines():
                l = l.strip()
                if l:
                    try:
                        out.append(json.loads(l))
                    except json.JSONDecodeError:
                        pass
            return out
        except PermissionError:
            time.sleep(0.2)
    return out


def czytaj_json(p: Path):
    try:
        return json.loads(p.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return None


def zapisz_json(p: Path, dane) -> None:
    p.parent.mkdir(parents=True, exist_ok=True)
    tmp = p.with_name(p.name + f".{os.getpid()}.tmp")
    tmp.write_text(json.dumps(dane, ensure_ascii=False, indent=2), encoding="utf-8")
    for i in range(10):
        try:
            os.replace(tmp, p)
            return
        except PermissionError:
            time.sleep(0.1 * (i + 1))
    os.replace(tmp, p)


def dopisz(p: Path, wpis: dict) -> None:
    p.parent.mkdir(parents=True, exist_ok=True)
    for i in range(10):
        try:
            with p.open("a", encoding="utf-8") as f:
                f.write(json.dumps(wpis, ensure_ascii=False) + "\n")
            return
        except PermissionError:
            time.sleep(0.1 * (i + 1))


def sygnal_ai(stan: str) -> None:
    try:
        zapisz_json(korzen() / "_ai-aktywnosc.json", {"stan": stan, "czas": int(time.time() * 1000)})
    except OSError:
        pass


def uzytkownika(w: list[dict]) -> list[dict]:
    return [x for x in w if x.get("od") == "uzytkownik"]


def podsumuj(kat: Path, w: list[dict]) -> str:
    stan = czytaj_json(kat / "stan.json") or {}
    u = uzytkownika(w)
    l = [f"# Rozmowa {kat.name} · wiadomości użytkownika: {len(u)} · odbiorca: {stan.get('odbiorca') or 'terapeuta'}",
         f"katalog: {kat}"]
    if stan.get("filtr"):
        l.append(f"!! FILTR SŁOWNIKOWY APLIKACJI: {stan['filtr']} — traktuj jako co najmniej poziom 3 do oceny strażnika (docs/BEZPIECZENSTWO.md §3).")
    if u and (not w or w[-1].get("od") == "uzytkownik"):
        l.append("!! UŻYTKOWNIK CZEKA NA ODPOWIEDŹ — strażnik + panel, potem `odpowiedz`.")
    if any(x.get("polecenie") == "konsylium" for x in u[-1:]):
        l.append("!! Użytkownik kliknął „Zwołaj konsylium”: załóż sprawę sprawy/<ID>/ z całą rozmową w 00-surowe.md (docs/ROZMOWA.md §2).")
    l.append("")
    l.append("## Rozmowa")
    for x in w:
        kto = "UŻYTKOWNIK" if x.get("od") == "uzytkownik" else "ZESPÓŁ"
        dod = f" [panel: {', '.join(x.get('panel') or [])}; ryzyko {x.get('ryzyko')}]" if x.get("od") == "zespol" else ""
        l.append(f"- {x.get('ts', '')[11:16]} {kto}{dod}: {x.get('tekst') or x.get('polecenie') or ''}")
    f = kat / "formulacja-robocza.md"
    l.append("")
    l.append("## Formulacja robocza")
    l.append(f.read_text(encoding="utf-8").strip() if f.is_file() else "(brak — pierwsza tura; zapisz po odpowiedzi)")
    return "\n".join(l)


def cmd_czekaj(a) -> int:
    koniec = time.time() + a.limit
    sygnal_ai("czeka")
    while True:
        kat = katalog(a.kod)
        w = linie(kat / "wiadomosci.jsonl") if kat else []
        u = uzytkownika(w)
        if u and len(u) > a.po and w[-1].get("od") == "uzytkownik":
            sygnal_ai("pracuje")
            print(podsumuj(kat, w))
            return 0
        if time.time() > koniec:
            print(f"Brak nowej wiadomości w czasie {a.limit} s. Uruchom „czekaj” ponownie." +
                  (f" Wiadomości użytkownika: {len(u)}." if kat else " Nie ma jeszcze żadnej rozmowy."))
            return 2
        time.sleep(0.7)


def cmd_pokaz(a) -> int:
    kat = katalog(a.kod)
    if not kat:
        print("Nie ma jeszcze rozmowy.")
        return 1
    print(podsumuj(kat, linie(kat / "wiadomosci.jsonl")))
    return 0


def cmd_panel(a) -> int:
    kat = katalog(a.kod)
    if not kat:
        sys.exit("Nie ma rozmowy. Podaj --kod.")
    role = [r.strip() for r in a.role.split(",") if r.strip()]
    zle = [r for r in role if r not in ROLE]
    if zle:
        sys.exit(f"Nieznane role: {zle}. Dozwolone: {', '.join(sorted(ROLE))}")
    zapisz_json(kat / "panel.json", {"pracuja": role, "od": int(time.time() * 1000)})
    sygnal_ai("pracuje")
    print(f"panel.json: {', '.join(role)}")
    return 0


def cmd_odpowiedz(a) -> int:
    kat = katalog(a.kod)
    if not kat:
        sys.exit("Nie ma rozmowy. Podaj --kod.")
    d = json.loads(Path(a.plik).read_text(encoding="utf-8")) if a.plik else {}
    if a.tekst:
        d["tekst"] = a.tekst
    tekst = str(d.get("tekst") or "").strip()
    if not tekst:
        sys.exit("Brak pola tekst.")
    slow = len(tekst.split())
    if slow > MAX_SLOW and not d.get("przerwanie"):
        sys.exit(f"Odpowiedź ma {slow} słów; limit {MAX_SLOW} (docs/ROZMOWA.md: jeden głos, ≤180 słów). Skróć.")
    for r in d.get("panel") or []:
        if r not in ROLE:
            sys.exit(f"Nieznana rola w panel: {r!r}")
    wpis = {"ts": datetime.now(timezone.utc).isoformat(timespec="seconds"), "od": "zespol", "tekst": tekst}
    for k in ("panel", "ryzyko", "glosy", "spor", "odbiorca", "plan_bezpieczenstwa", "przerwanie"):
        if d.get(k) not in (None, "", [], False):
            wpis[k] = d[k]
    if "ryzyko" in d:
        wpis["ryzyko"] = int(d["ryzyko"])
    dopisz(kat / "wiadomosci.jsonl", wpis)
    try:
        (kat / "panel.json").unlink()
    except OSError:
        pass
    sygnal_ai("czeka")
    print(f"Dopisano odpowiedź zespołu ({slow} słów, panel {', '.join(wpis.get('panel') or [])}, ryzyko {wpis.get('ryzyko', '?')}).")
    return 0


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    c = sub.add_parser("czekaj"); c.add_argument("--kod"); c.add_argument("--po", type=int, default=0); c.add_argument("--limit", type=int, default=540)
    p = sub.add_parser("pokaz"); p.add_argument("--kod")
    n = sub.add_parser("panel"); n.add_argument("--kod"); n.add_argument("--role", required=True)
    o = sub.add_parser("odpowiedz"); o.add_argument("--kod"); o.add_argument("--plik"); o.add_argument("--tekst")
    a = ap.parse_args()
    return {"czekaj": cmd_czekaj, "pokaz": cmd_pokaz, "panel": cmd_panel, "odpowiedz": cmd_odpowiedz}[a.cmd](a)


if __name__ == "__main__":
    sys.exit(main())
