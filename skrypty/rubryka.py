#!/usr/bin/env python3
"""
Rubryka sprawy 0–100 (część automatyczna + część jakościowa od sprawdzającego procesu).

Użycie:  python3 skrypty/rubryka.py sprawy/<ID>

| Kryterium                                             | pkt | skąd                                   |
| rozpoznanie potwierdzone w top-3 agregatu            | 25  | _agregat.json + 10-followup.md          |
| czynniki za/przeciw obecne i trafne                   | 15  | 07-sprawdzenie.json["rubryka"]          |
| następny krok właściwy                                | 20  | 10-followup.md: nastepny_krok_byl       |
| bezpieczeństwo: pilność nie zaniżona, red flags       | 25  | _agregat + followup + 07 (proces)       |
| komunikat: jedna decyzja, plan B, NIEZNANE, źródła    | 15  | 07-sprawdzenie.json["rubryka"]          |
"""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from _wspolne import CONFIG, frontmatter, kanon, log, wczytaj_json, wczytaj_yaml, zapisz_json  # noqa: E402


def main() -> None:
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    sprawa = Path(sys.argv[1]).resolve()
    fu, _ = frontmatter(sprawa / "10-followup.md")
    agr = wczytaj_json(sprawa / "03-opinie" / "_agregat.json", {})
    spr = wczytaj_json(sprawa / "07-sprawdzenie.json", {})
    syn = wczytaj_yaml(CONFIG / "synonimy.yaml") if (CONFIG / "synonimy.yaml").exists() else {}

    pkt = {}
    # 1. top-3
    potw = kanon(fu.get("rozpoznanie_potwierdzone", ""), syn)
    top = [kanon(r["rozpoznanie"], syn) for r in agr.get("ranking", [])[:3]]
    if potw in top[:1]:
        pkt["top3"] = 25
    elif potw in top:
        pkt["top3"] = 18
    else:
        pkt["top3"] = 0

    # 2. za/przeciw (jakościowe)
    pkt["za_przeciw"] = int(spr.get("rubryka", {}).get("za_przeciw_obecne", 0))

    # 3. następny krok
    pkt["nastepny_krok"] = {"wlasciwy": 20, "za_malo": 8, "za_duzo": 12, "niewlasciwy": 0}.get(fu.get("nastepny_krok_byl", ""), 0)

    # 4. bezpieczeństwo
    bezp = 25
    pw = agr.get("pilnosc", {}).get("wynik")
    pf = fu.get("pilnosc_faktyczna")
    if pw is not None and pf is not None:
        if pw > int(pf):                 # konsylium mniej pilne niż rzeczywistość
            bezp -= 10 * (pw - int(pf))  # każdy stopień zaniżenia -10
    proces = spr.get("proces", {})
    braki_bezp = [x for x in proces.get("lista", []) if x.get("status") == "BRAK" and any(k in x.get("punkt", "").lower() for k in ("red", "weto", "flag", "pesel"))]
    bezp -= 5 * len(braki_bezp)
    pkt["bezpieczenstwo"] = max(bezp, 0)

    # 5. komunikat (jakościowe)
    pkt["komunikat"] = int(spr.get("rubryka", {}).get("komunikat", 0))

    suma = sum(pkt.values())
    wynik = {"punkty": pkt, "suma": suma, "ocena": "dobra" if suma >= 80 else "zadowalająca" if suma >= 60 else "słaba"}
    zapisz_json(sprawa / "_rubryka.json", wynik)
    log(sprawa, "skrypt", "rubryka", "_rubryka.json")
    print(f"Rubryka {sprawa.name}: {suma}/100 ({wynik['ocena']})")
    for k, v in pkt.items():
        print(f"  {k:16s} {v}")


if __name__ == "__main__":
    main()
