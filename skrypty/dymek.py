#!/usr/bin/env python3
"""
Dymek do Pokoju lekarskiego → dopisuje zdarzenie "wypowiedz" do sprawy/<ID>/_log.jsonl (format: docs/DYMKI.md).

Użycie (ordynator, po każdej wypowiedzi albo zbiorczo po kroku):
  python3 skrypty/dymek.py sprawy/<ID> --rola bayes --faza "Ślepa tura" --skrot "Tabletka widmo 0,70, pilność 4." [--temat "..."] [--plik 03-opinie/bayes.json] [--persona "..."]
  python3 skrypty/dymek.py sprawy/<ID> --wiele dymki.jsonl     # wiele naraz: jedna linia JSON = jeden dymek (te same pola)

Skrót: 1–2 pełne zdania językiem medycznym, najwyżej 400 znaków, bez markdownu. Dłuższy jest skracany do pełnych słów z „…”.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

ROLE = {"ordynator", "z_zlozonosc", "z_bezpieczenstwo", "z_niepewnosc", "hipotezujacy", "bayes", "najgorszy_scenariusz",
        "poz_pragmatyk", "farmakolog", "gospodarz_kosztow", "s_fakty", "s_proces", "R1", "R2", "R3"}
ALIASY = {"zastepca_zlozonosc": "z_zlozonosc", "zastepca_bezpieczenstwo": "z_bezpieczenstwo", "zastepca_niepewnosc": "z_niepewnosc",
          "sprawdzajacy_faktow": "s_fakty", "sprawdzajacy_procesu": "s_proces"}
FAZY = ["Wywiad", "Triage", "Ślepa tura", "Agregacja", "Konsylium · runda", "Projekt", "Rezydenci", "Sprawdzenie",
        "Odpowiedź rezydentom", "Werdykt", "Follow-up"]
MAX = 400


def rola(r: str) -> str:
    n = re.sub(r"[-\s]+", "_", r.strip()).removeprefix("lekarz_")
    if re.fullmatch(r"[rR]\d", n):
        return n.upper()
    n = n.lower()
    n = ALIASY.get(n, n)
    if n not in ROLE:
        sys.exit(f"Nieznana rola: {r!r}. Dozwolone: {', '.join(sorted(ROLE))}")
    return n


def faza(f: str) -> str:
    if not any(f.lower().startswith(k.lower().split(" ·")[0].lower()) for k in FAZY):
        sys.exit(f"Nieznana faza: {f!r}. Dozwolone: {', '.join(FAZY)} (runda z numerem: „Konsylium · runda 1”)")
    return f


def skroc(t: str, n: int = MAX) -> str:
    t = re.sub(r"[*`#]+", "", t)
    t = re.sub(r"\s+", " ", t).strip()
    if len(t) <= n:
        return t
    cut = t[: n - 1]
    sp = cut.rfind(" ")
    return (cut[:sp] if sp > n * 0.6 else cut).rstrip(",;:. —-") + "…"


def wpis(d: dict) -> dict:
    if not d.get("skrot"):
        sys.exit(f"Brak pola skrot: {d}")
    w = {"ts": datetime.now(timezone.utc).isoformat(timespec="seconds"), "zdarzenie": "wypowiedz",
         "rola": rola(d["rola"]), "faza": faza(d["faza"]), "skrot": skroc(d["skrot"])}
    for k in ("temat", "plik", "persona"):
        if d.get(k):
            w[k] = skroc(d[k], 160) if k == "temat" else d[k]
    return w


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("sprawa", type=Path)
    ap.add_argument("--rola"); ap.add_argument("--faza"); ap.add_argument("--skrot")
    ap.add_argument("--temat"); ap.add_argument("--plik"); ap.add_argument("--persona")
    ap.add_argument("--wiele", type=Path, help="plik JSONL z wieloma dymkami")
    a = ap.parse_args()
    if not a.sprawa.is_dir():
        sys.exit(f"Nie ma katalogu sprawy: {a.sprawa}")
    if a.wiele:
        dane = [json.loads(l) for l in a.wiele.read_text(encoding="utf-8").splitlines() if l.strip()]
    else:
        if not (a.rola and a.faza and a.skrot):
            sys.exit("Podaj --rola, --faza i --skrot (albo --wiele).")
        dane = [{"rola": a.rola, "faza": a.faza, "skrot": a.skrot, "temat": a.temat, "plik": a.plik, "persona": a.persona}]
    wpisy = [wpis(d) for d in dane]
    with open(a.sprawa / "_log.jsonl", "a", encoding="utf-8") as f:
        for w in wpisy:
            f.write(json.dumps(w, ensure_ascii=False) + "\n")
    print(f"Dopisano dymków: {len(wpisy)}")


if __name__ == "__main__":
    main()
