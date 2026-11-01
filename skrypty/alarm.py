#!/usr/bin/env python3
"""
Wczesny alarm 112 w Pokoju lekarskim (ankieta zmian 1.11.2026: „Tak”).

Ordynator wywołuje go ZARAZ po triage, gdy którykolwiek zastępca albo „Najgorszy scenariusz” daje pilność 1
(podejrzenie stanu zagrożenia życia: OZW, SAH, zatorowość płucna, pękający tętniak, sepsa, anafilaksja…).
Aplikacja od razu pokazuje czerwony pasek nad sceną, a konsylium pracuje dalej w tle.

  python skrypty/alarm.py sprawy/<ID> --tekst "Podejrzenie ostrego zespołu wieńcowego – rozważ 112 teraz"
  python skrypty/alarm.py sprawy/<ID> --odwolaj     # gdy konsylium jawnie wykluczy stan nagły (wpis w 04-konsylium.md)

Tekst: „Podejrzenie <stan> – rozważ 112 teraz”, do 140 znaków, bez procentów.
"""
from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("sprawa", type=Path)
    g = ap.add_mutually_exclusive_group(required=True)
    g.add_argument("--tekst")
    g.add_argument("--odwolaj", action="store_true")
    a = ap.parse_args()
    if not a.sprawa.is_dir():
        raise SystemExit(f"Nie ma katalogu sprawy: {a.sprawa}")
    w = {"ts": datetime.now(timezone.utc).isoformat(timespec="seconds"), "zdarzenie": "alarm"}
    if a.odwolaj:
        w["koniec"] = True
    else:
        t = " ".join(a.tekst.split())
        w["tekst"] = t if len(t) <= 140 else t[:139].rsplit(" ", 1)[0] + "…"
    with open(a.sprawa / "_log.jsonl", "a", encoding="utf-8") as f:
        f.write(json.dumps(w, ensure_ascii=False) + "\n")
    print("Alarm odwołany." if a.odwolaj else f"Alarm w Pokoju: {w['tekst']}")


if __name__ == "__main__":
    main()
