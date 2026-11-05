#!/usr/bin/env python3
"""
Kalibracja po follow-upie → aktualizuje pamiec/kalibracja.json

Użycie:  python3 skrypty/kalibracja.py sprawy/<ID>

Dla każdego lekarza: Brier_i = Σ_d (p_i(d) − y_d)²  (y=1 dla rozpoznania potwierdzonego, 0 dla innych wymienionych).
Brier_ref = średnia Brier wszystkich lekarzy z wagą rozpoznanie > 0 w tej sprawie.
k_i ← clip( k_i·(1−α) + α·(1 + β·(Brier_ref − Brier_i)), k_min, k_max )
Rezydenci: liczniki z 08-odpowiedz-rezydentom.md (PRZYJMUJĘ/ODRZUCAM, kategoria, hasło) → pamiec/luki.md.
Nie dotyka wag ról (config/wagi.yaml) — tylko k.
"""
from __future__ import annotations

import re
import sys
from datetime import date
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from _wspolne import (CONFIG, PAMIEC, frontmatter, kalibracja, kanon, log, wagi,  # noqa: E402
                      wczytaj_opinie, wczytaj_yaml, zapisz_json)


def brier(op: dict, potwierdzone_kanon: str, syn: dict) -> float:
    s = 0.0
    trafione = False
    for r in op.get("rozpoznania", []):
        y = 1.0 if kanon(r["nazwa"], syn) == potwierdzone_kanon else 0.0
        trafione |= y == 1.0
        s += (float(r["p"]) - y) ** 2
    if not trafione:
        s += 1.0   # potwierdzone rozpoznanie w ogóle niewymienione → kara jak p=0
    return s


def aktualizuj_rezydentow(sprawa: Path, kal: dict) -> list[dict]:
    """Parsuje 08-odpowiedz-rezydentom.md. Oczekiwany format linii:
       PRZYJMUJĘ | ODRZUCAM — <powód> — kategoria: brak_danych|hipoteza|zalozenie — hasło: <słowo> [— ZMIENIA DECYZJĘ]
    """
    p = sprawa / "08-odpowiedz-rezydentom.md"
    rez = kal.setdefault("rezydenci", {})
    for klucz, dom in (("uwag", 0), ("przyjetych", 0), ("zmienily_decyzje", 0), ("kategorie", {}), ("hasla", {})):
        rez.setdefault(klucz, dom)
    przyjete = []
    if not p.exists():
        return przyjete
    for linia in p.read_text(encoding="utf-8").splitlines():
        m = re.search(r"\b(PRZYJMUJ[ĘE]|ODRZUCAM)\b", linia, re.I)
        if not m:
            continue
        rez["uwag"] += 1
        kat = re.search(r"kategoria:\s*([a-z_]+)", linia, re.I)
        has = re.search(r"has[łl]o:\s*([^\n—\-|]+)", linia, re.I)
        kat = kat.group(1).lower() if kat else "nieokreslona"
        has = has.group(1).strip().lower() if has else "?"
        if m.group(1).upper().startswith("PRZYJMUJ"):
            rez["przyjetych"] += 1
            zmiana = bool(re.search(r"ZMIENIA DECYZJ", linia, re.I))
            if zmiana:
                rez["zmienily_decyzje"] += 1
            rez["kategorie"][kat] = rez["kategorie"].get(kat, 0) + 1
            klucz = f"{kat}:{has}"
            rez["hasla"][klucz] = rez["hasla"].get(klucz, 0) + 1
            przyjete.append({"kategoria": kat, "haslo": has, "zmiana": zmiana, "linia": linia.strip()})
    return przyjete


def dopisz_luki(sprawa: Path, przyjete: list[dict], kal: dict) -> None:
    if not przyjete:
        return
    p = PAMIEC / "luki.md"
    p.parent.mkdir(exist_ok=True)
    if not p.exists():
        p.write_text("# Luki wskazane przez rezydentów (przyjęte przez ordynatora)\n\n| data | sprawa | kategoria | hasło | zmieniła decyzję | treść |\n|---|---|---|---|---|---|\n", encoding="utf-8")
    with open(p, "a", encoding="utf-8") as f:
        for u in przyjete:
            f.write(f"| {date.today()} | {sprawa.name} | {u['kategoria']} | {u['haslo']} | {'TAK' if u['zmiana'] else 'nie'} | {u['linia'][:160].replace('|', '/')} |\n")
    # alert: ta sama kategoria+hasło ≥3 razy → propozycja zmiany intake
    powtarzajace = {k: v for k, v in kal["rezydenci"]["hasla"].items() if v >= 3}
    if powtarzajace:
        print("UWAGA — powtarzające się luki (≥3):", ", ".join(f"{k} ×{v}" for k, v in powtarzajace.items()))
        print("→ Ordynator: zaproponuj użytkownikowi nowe pytanie obowiązkowe w CLAUDE.md §2.")


def main() -> None:
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    sprawa = Path(sys.argv[1]).resolve()
    fu_path = sprawa / "10-followup.md"
    if not fu_path.exists():
        sys.exit(f"Brak {fu_path} — kalibracja wymaga follow-upu.")
    fu, _ = frontmatter(fu_path)
    potw = fu.get("rozpoznanie_potwierdzone", "")
    if not potw or potw.lower().startswith("nieustal"):
        print("Rozpoznanie nieustalone — kalibracja rozpoznań pominięta, liczę tylko rezydentów.")
        kal = kalibracja()
        przyjete = aktualizuj_rezydentow(sprawa, kal)
        dopisz_luki(sprawa, przyjete, kal)
        zapisz_json(PAMIEC / "kalibracja.json", kal)
        return

    cfg = wagi()
    kal = kalibracja()
    syn = wczytaj_yaml(CONFIG / "synonimy.yaml") if (CONFIG / "synonimy.yaml").exists() else {}
    a, b = float(cfg["kalibracja"]["alpha"]), float(cfg["kalibracja"]["beta"])
    kmin, kmax = float(cfg["kalibracja"]["k_min"]), float(cfg["kalibracja"]["k_max"])
    potw_k = kanon(potw, syn)

    opinie = wczytaj_opinie(sprawa)
    oceniane = {r: op for r, op in opinie.items() if float(cfg["role"].get(r, {}).get("rozpoznanie", 0)) > 0}
    if not oceniane:
        sys.exit("Brak opinii z wagą rozpoznania > 0.")
    briery = {r: brier(op, potw_k, syn) for r, op in oceniane.items()}
    ref = sum(briery.values()) / len(briery)

    role = kal.setdefault("role", {})
    print(f"Potwierdzone: {potw}  (kanon: {potw_k})   Brier_ref = {ref:.3f}")
    for r, br in briery.items():
        st = role.setdefault(r, {"k": 1.0, "n_spraw": 0, "brier_sredni": None})
        k_stare = float(st["k"])
        k_nowe = min(max(k_stare * (1 - a) + a * (1 + b * (ref - br)), kmin), kmax)
        n = int(st["n_spraw"])
        st["brier_sredni"] = br if st["brier_sredni"] is None else (st["brier_sredni"] * n + br) / (n + 1)
        st["n_spraw"] = n + 1
        st["k"] = round(k_nowe, 4)
        print(f"  {r:22s} Brier {br:.3f}  k {k_stare:.3f} → {k_nowe:.3f}")

    # pilność: zapis różnicy (informacyjnie, nie wpływa na k)
    pf = fu.get("pilnosc_faktyczna")
    agr = (sprawa / "03-opinie" / "_agregat.json")
    if pf is not None and agr.exists():
        import json
        with open(agr, encoding="utf-8") as f:
            pw = json.load(f).get("pilnosc", {}).get("wynik")
        if pw is not None:
            hist = kal.setdefault("pilnosc_historia", [])
            hist.append({"sprawa": sprawa.name, "wynik": pw, "faktyczna": int(pf)})
            if pw > int(pf):
                print(f"  ! pilność ZANIŻONA: konsylium {pw}, faktycznie {pf}")

    przyjete = aktualizuj_rezydentow(sprawa, kal)
    dopisz_luki(sprawa, przyjete, kal)
    kal["ostatnia_aktualizacja"] = str(date.today())
    zapisz_json(PAMIEC / "kalibracja.json", kal)
    log(sprawa, "skrypt", "kalibracja", "pamiec/kalibracja.json")
    print(f"Zapisano {PAMIEC/'kalibracja.json'}; rezydenci: {kal['rezydenci']['przyjetych']}/{kal['rezydenci']['uwag']} przyjętych, {kal['rezydenci']['zmienily_decyzje']} zmieniło decyzję.")


if __name__ == "__main__":
    main()
