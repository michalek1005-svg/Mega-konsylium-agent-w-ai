#!/usr/bin/env python3
"""
Uwagi lekarza prowadzącego dopisane z Pokoju lekarskiego (sprawy/<ID>/uwagi-lekarza.jsonl).

Ordynator wywołuje przed każdą wypowiedzią roli i przed każdą rundą:
  python3 skrypty/uwagi_lekarza.py sprawy/<ID>            # nowe uwagi od ostatniego wywołania (znacznik _uwagi-przeczytane.json)
  python3 skrypty/uwagi_lekarza.py sprawy/<ID> --wszystkie
  python3 skrypty/uwagi_lekarza.py sprawy/<ID> --czekaj 600  # czeka do 600 s na pierwszą nową uwagę (0 = nie czekaj)

Wyjście: linie „#<nr> <HH:MM> [<faza>] <tekst>” albo „Brak nowych uwag.” Kod wyjścia 0.
Każdą nową uwagę ordynator przekazuje właściwym rolom w następnej wypowiedzi i potwierdza dymkiem
(docs/NA-ZYWO.md, sekcja „Lekarz prowadzący w dyskusji”). Na Windows: python skrypty/uwagi_lekarza.py …
"""
from __future__ import annotations

import argparse
import json
import sys
import time
from pathlib import Path

PLIK = "uwagi-lekarza.jsonl"
ZNACZNIK = "_uwagi-przeczytane.json"


def wczytaj(sprawa: Path) -> list[dict]:
    p = sprawa / PLIK
    if not p.exists():
        return []
    out = []
    for l in p.read_text(encoding="utf-8").splitlines():
        l = l.strip()
        if not l:
            continue
        try:
            out.append(json.loads(l))
        except json.JSONDecodeError:
            continue
    return out


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("sprawa", type=Path)
    ap.add_argument("--wszystkie", action="store_true", help="pokaż wszystkie, nie tylko nowe")
    ap.add_argument("--czekaj", type=int, default=0, help="sekundy oczekiwania na nową uwagę")
    a = ap.parse_args()
    if not a.sprawa.is_dir():
        sys.exit(f"Nie ma katalogu sprawy: {a.sprawa}")
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    zn = a.sprawa / ZNACZNIK
    przeczytane = 0
    if zn.exists() and not a.wszystkie:
        try:
            przeczytane = int(json.loads(zn.read_text(encoding="utf-8")).get("przeczytane", 0))
        except (ValueError, json.JSONDecodeError):
            przeczytane = 0
    koniec = time.time() + max(0, a.czekaj)
    while True:
        uwagi = wczytaj(a.sprawa)
        nowe = uwagi[przeczytane:]
        if nowe or time.time() >= koniec:
            break
        time.sleep(3)
    if not nowe:
        print("Brak nowych uwag.")
        return
    for n, u in enumerate(nowe, start=przeczytane + 1):
        ts = str(u.get("ts", ""))
        hhmm = ts[11:16] if len(ts) >= 16 else ""
        tekst = u.get("pelny") or u.get("tresc") or u.get("skrot") or ""
        print(f"#{n} {hhmm} [{u.get('faza', '')}] {tekst}")
    zn.write_text(json.dumps({"przeczytane": len(uwagi)}), encoding="utf-8")


if __name__ == "__main__":
    main()
