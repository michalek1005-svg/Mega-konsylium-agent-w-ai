#!/usr/bin/env python3
"""
Uwagi lekarza prowadzącego dopisane z Pokoju lekarskiego (sprawy/<ID>/uwagi-lekarza.jsonl).

Ordynator wywołuje przed każdą wypowiedzią roli i przed każdą rundą:
  python3 skrypty/uwagi_lekarza.py sprawy/<ID>            # nowe uwagi od ostatniego wywołania (znacznik _uwagi-przeczytane.json)
  python3 skrypty/uwagi_lekarza.py sprawy/<ID> --wszystkie
  python3 skrypty/uwagi_lekarza.py sprawy/<ID> --czekaj 600  # czeka do 600 s na pierwszą nową uwagę (0 = nie czekaj)

OBOWIĄZKOWO tuż przed zapisem 09-FINAL.md: python3 skrypty/uwagi_lekarza.py sprawy/<ID> (bez --czekaj)
— każda zgłoszona tu uwaga musi trafić do FINAL albo do 08 z powodem odrzucenia.

Znacznik pamięta KLUCZE przeczytanych uwag (czas + skrót treści), nie ich liczbę — uszkodzony
lub skrócony plik nie ukrywa nowych wpisów. Wiersze, które nie są JSON-em (np. „[object Object]”), są pomijane
z ostrzeżeniem na stderr.

Wyjście: linie „#<nr> <HH:MM> [<faza>] <tekst>” albo „Brak nowych uwag.” Kod wyjścia 0.
Każdą nową uwagę ordynator przekazuje właściwym rolom w następnej wypowiedzi i potwierdza dymkiem
(docs/NA-ZYWO.md, sekcja „Lekarz prowadzący w dyskusji”). Na Windows: python skrypty/uwagi_lekarza.py …
"""
from __future__ import annotations

import argparse
import hashlib
import json
import sys
import time
from pathlib import Path

PLIK = "uwagi-lekarza.jsonl"
ZNACZNIK = "_uwagi-przeczytane.json"
_OSTRZEZONO = False


def wczytaj(sprawa: Path) -> list[dict]:
    p = sprawa / PLIK
    if not p.exists():
        return []
    out, zle = [], 0
    for l in p.read_text(encoding="utf-8", errors="replace").splitlines():
        l = l.strip()
        if not l:
            continue
        try:
            u = json.loads(l)
        except json.JSONDecodeError:
            zle += 1
            continue
        if isinstance(u, dict):
            out.append(u)
        else:
            zle += 1
    global _OSTRZEZONO
    if zle and not _OSTRZEZONO:
        _OSTRZEZONO = True
        print(f"Uwaga: pominięto {zle} uszkodzonych wierszy w {PLIK}.", file=sys.stderr)
    return out


def tekst(u: dict) -> str:
    return str(u.get("pelny") or u.get("tresc") or u.get("skrot") or "")


def klucz(u: dict) -> str:
    h = hashlib.sha1(tekst(u).encode("utf-8")).hexdigest()[:12]
    return f"{u.get('ts', '')}|{h}"


def wczytaj_znacznik(zn: Path, uwagi: list[dict]) -> set[str]:
    if not zn.exists():
        return set()
    try:
        d = json.loads(zn.read_text(encoding="utf-8"))
    except (ValueError, json.JSONDecodeError):
        return set()
    if isinstance(d.get("widziane"), list):
        return {str(x) for x in d["widziane"]}
    # stary znacznik (sama liczba): ufamy mu tylko, gdy plik nie jest krótszy — inaczej pokazujemy wszystko
    try:
        n = int(d.get("przeczytane", 0))
    except (TypeError, ValueError):
        n = 0
    if n > len(uwagi):
        return set()
    return {klucz(u) for u in uwagi[:n]}


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
    widziane = set() if a.wszystkie else wczytaj_znacznik(zn, wczytaj(a.sprawa))
    koniec = time.time() + max(0, a.czekaj)
    while True:
        uwagi = wczytaj(a.sprawa)
        nowe = [(n, u) for n, u in enumerate(uwagi, start=1) if klucz(u) not in widziane]
        if nowe or time.time() >= koniec:
            break
        time.sleep(3)
    if not nowe:
        print("Brak nowych uwag.")
        return
    for n, u in nowe:
        ts = str(u.get("ts", ""))
        hhmm = ts[11:16] if len(ts) >= 16 else ""
        print(f"#{n} {hhmm} [{u.get('faza', '')}] {tekst(u)}")
    wszystkie = {klucz(u) for u in uwagi} | (set() if a.wszystkie else widziane)
    zn.write_text(json.dumps({"przeczytane": len(uwagi), "widziane": sorted(wszystkie)}, ensure_ascii=False), encoding="utf-8")


if __name__ == "__main__":
    main()
