#!/usr/bin/env python3
"""
„Co było dalej” (ankieta innowacji 2.11.2026, pkt 9): wynik sprawy po kilku dniach i zestawienie trafności ról.

  python skrypty/wynik.py sprawy/<ID> --ocena trafne|czesciowo|nietrafne --zdanie "…" [--mieli-racje bayes,hipotezujacy]
  python skrypty/wynik.py --zestawienie [--katalog sprawy]          # trafność ról ze wszystkich 11-wynik.json

Zwykle 11-wynik.json zapisuje aplikacja (Wnioski → „Co było dalej?”). Plik nie zastępuje 10-followup.md (kalibracja wag),
tylko daje szybki sygnał: jak często rozpoznanie nr 1 danej roli pokrywało się z rekomendacją, która okazała się trafna.

Trafność roli w sprawie:
- rola wskazana w „mieli_racje” → 1,0;
- inaczej, gdy jej rozpoznanie nr 1 = rozpoznanie nr 1 konsylium: trafne 1,0 / częściowo 0,5 / nietrafne 0,0;
- inaczej (rola miała inne nr 1): trafne 0,0 / częściowo 0,5 / nietrafne bez oceny (nie wiadomo, czy miała rację).
"""
from __future__ import annotations

import argparse
import json
import sys
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OCENY = {"trafne": 1.0, "czesciowo": 0.5, "nietrafne": 0.0}


def czytaj(p: Path) -> dict | None:
    try:
        return json.loads(p.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return None


def zapisz(sprawa: Path, ocena: str, zdanie: str, mieli: list[str]) -> Path:
    agr = czytaj(sprawa / "03-opinie" / "_agregat.json") or {}
    w = {"format": "ms-wynik-1", "ts": datetime.now(timezone.utc).isoformat(timespec="seconds"), "ocena": ocena,
         "zdanie": zdanie.strip()[:240], "mieli_racje": mieli, "nr1_lekarzy": agr.get("rozpoznanie_nr1_lekarzy", {})}
    out = sprawa / "11-wynik.json"
    out.write_text(json.dumps(w, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return out


def zestawienie(katalog: Path) -> dict:
    role: dict[str, list[float]] = defaultdict(list)
    sprawy, oceny = 0, defaultdict(int)
    for p in sorted(katalog.glob("*/11-wynik.json")):
        w = czytaj(p)
        if not w or w.get("ocena") not in OCENY:
            continue
        sprawy += 1
        oceny[w["ocena"]] += 1
        nr1 = w.get("nr1_lekarzy") or (czytaj(p.parent / "03-opinie" / "_agregat.json") or {}).get("rozpoznanie_nr1_lekarzy", {})
        agr = czytaj(p.parent / "03-opinie" / "_agregat.json") or {}
        lider = (agr.get("ranking") or [{}])[0].get("rozpoznanie")
        if not lider and nr1:  # bez agregatu: najczęstsze nr 1
            licz = defaultdict(int)
            for v in nr1.values():
                licz[v] += 1
            lider = max(licz, key=licz.get)
        mieli = set(w.get("mieli_racje") or [])
        for rola, rozp in nr1.items():
            if rola in mieli:
                role[rola].append(1.0)
            elif rozp == lider:
                role[rola].append(OCENY[w["ocena"]])
            elif w["ocena"] == "trafne":       # konsylium miało rację, ta rola nie
                role[rola].append(0.0)
            elif w["ocena"] == "czesciowo":
                role[rola].append(0.5)
            # nietrafne + inne nr 1: nie wiadomo, czy rola miała rację – bez oceny
        for rola in mieli - set(nr1):
            role[rola].append(1.0)
    return {"sprawy": sprawy, "oceny": dict(oceny),
            "role": {r: {"n": len(v), "trafnosc": round(sum(v) / len(v), 2)} for r, v in sorted(role.items(), key=lambda x: -sum(x[1]) / len(x[1]))}}


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("sprawa", type=Path, nargs="?")
    ap.add_argument("--ocena", choices=sorted(OCENY))
    ap.add_argument("--zdanie", default="")
    ap.add_argument("--mieli-racje", default="")
    ap.add_argument("--zestawienie", action="store_true")
    ap.add_argument("--katalog", type=Path, default=ROOT / "sprawy")
    a = ap.parse_args()
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    if a.zestawienie:
        z = zestawienie(a.katalog)
        if not z["sprawy"]:
            print("Brak spraw z 11-wynik.json.")
            return
        print(f"Spraw z wynikiem: {z['sprawy']}  ({', '.join(f'{k} {v}' for k, v in z['oceny'].items())})")
        for r, d in z["role"].items():
            print(f"  {r:22} trafność {d['trafnosc']:.2f}  (spraw: {d['n']})")
        return
    if not (a.sprawa and a.ocena):
        sys.exit("Podaj sprawę i --ocena (albo --zestawienie).")
    if not a.sprawa.is_dir():
        sys.exit(f"Nie ma katalogu sprawy: {a.sprawa}")
    print(f"Zapisano {zapisz(a.sprawa, a.ocena, a.zdanie, [x.strip() for x in a.mieli_racje.split(',') if x.strip()])}")


if __name__ == "__main__":
    main()
