#!/usr/bin/env python3
"""
Agregacja opinii ślepej tury → 03-opinie/_agregat.json

Użycie:  python3 skrypty/agregacja.py sprawy/<ID>

Rozpoznanie: ważona pula logitów (waga = waga_roli[rozpoznanie] × k[rola]), ε dla niewymienionych, softmax.
Pilność:     ważona mediana (tor pilnosc) + WETO lekarza 'najgorszy_scenariusz' (gdy ma red_flags_otwarte).
Zgoda:       1 − entropia_znormalizowana(top_n) → flaga NISKA_ZGODA.
"""
from __future__ import annotations

import math
import sys
from collections import defaultdict
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from _wspolne import (CONFIG, k_roli, kalibracja, kanon, log, wagi, wczytaj_opinie,  # noqa: E402
                      wczytaj_yaml, zapisz_json)


def logit(p: float) -> float:
    p = min(max(p, 1e-4), 1 - 1e-4)
    return math.log(p / (1 - p))


def waga_w_torze(rola: str, tor: str, cfg: dict, kal: dict, nazwa_rozp: str | None = None) -> float:
    w = float(cfg["role"].get(rola, {}).get(tor, 0.0))
    if tor == "rozpoznanie" and rola == "farmakolog" and nazwa_rozp:
        pref = cfg.get("wyjatki", {}).get("farmakolog_prefiks_polekowe", "objawy polekowe")
        if nazwa_rozp.lower().startswith(pref.lower()):
            w = float(cfg["wyjatki"].get("farmakolog_waga_polekowe", 1.0))
    return w * k_roli(rola, kal)


def wazona_mediana(pary: list[tuple[float, float]]) -> float:
    """pary = [(wartosc, waga)]"""
    pary = sorted(p for p in pary if p[1] > 0)
    if not pary:
        return float("nan")
    suma = sum(w for _, w in pary)
    akum = 0.0
    for v, w in pary:
        akum += w
        if akum >= suma / 2:
            return v
    return pary[-1][0]


def agreguj(sprawa: Path) -> dict:
    cfg = wagi()
    kal = kalibracja()
    syn = wczytaj_yaml(CONFIG / "synonimy.yaml") if (CONFIG / "synonimy.yaml").exists() else {}
    eps = float(cfg["agregacja"]["epsilon_niewymienione"])
    top_n = int(cfg["agregacja"]["top_n"])

    opinie = wczytaj_opinie(sprawa)
    if not opinie:
        sys.exit(f"Brak opinii w {sprawa/'03-opinie'}")

    # --- rozpoznania -------------------------------------------------------
    nazwy_wyswietlane: dict[str, str] = {}
    kanon_do_wyswietlenia = {kanon(k, syn): k for k in syn}   # forma kanoniczna z synonimy.yaml
    p_lekarza: dict[str, dict[str, float]] = {}
    for rola, op in opinie.items():
        p_lekarza[rola] = {}
        for r in op.get("rozpoznania", []):
            k = kanon(r["nazwa"], syn)
            nazwy_wyswietlane.setdefault(k, kanon_do_wyswietlenia.get(k, r["nazwa"]))
            p_lekarza[rola][k] = max(p_lekarza[rola].get(k, 0.0), float(r["p"]))

    wszystkie = set().union(*p_lekarza.values()) if p_lekarza else set()
    suma_logit: dict[str, float] = defaultdict(float)
    suma_wag: dict[str, float] = defaultdict(float)
    kto_wymienil: dict[str, list[str]] = defaultdict(list)
    for d in wszystkie:
        for rola in opinie:
            w = waga_w_torze(rola, "rozpoznanie", cfg, kal, nazwy_wyswietlane[d])
            if w <= 0:
                continue
            p = p_lekarza[rola].get(d)
            if p is None:
                p = eps
            else:
                kto_wymienil[d].append(rola)
            suma_logit[d] += w * logit(p)
            suma_wag[d] += w

    # pula logarytmiczna → score, softmax
    score = {d: (suma_logit[d] / suma_wag[d]) if suma_wag[d] > 0 else -math.inf for d in wszystkie}
    mx = max(score.values()) if score else 0.0
    ex = {d: math.exp(s - mx) if s > -math.inf else 0.0 for d, s in score.items()}
    z = sum(ex.values()) or 1.0
    p_agr = {d: ex[d] / z for d in wszystkie}
    ranking = sorted(p_agr.items(), key=lambda x: -x[1])[:top_n]

    # zgoda = 1 - entropia znormalizowana top_n
    ps = [p for _, p in ranking]
    zs = sum(ps) or 1.0
    ps = [p / zs for p in ps]
    H = -sum(p * math.log(p) for p in ps if p > 0)
    Hmax = math.log(len(ps)) if len(ps) > 1 else 1.0
    zgoda = 1.0 - (H / Hmax if Hmax > 0 else 0.0)

    # --- pilność -------------------------------------------------------------
    pary = [(float(op["pilnosc"]), waga_w_torze(rola, "pilnosc", cfg, kal)) for rola, op in opinie.items() if "pilnosc" in op]
    mediana = wazona_mediana(pary)
    pilnosc = mediana
    weto = None
    for rola, op in opinie.items():
        if cfg["role"].get(rola, {}).get("weto_pilnosci") and op.get("red_flags_otwarte"):
            if float(op["pilnosc"]) < pilnosc:          # 1 = najpilniejsza, więc "podnieś" = min()
                weto = {"rola": rola, "pilnosc": op["pilnosc"], "red_flags_otwarte": op["red_flags_otwarte"],
                        "zamiast": mediana}
                pilnosc = float(op["pilnosc"])

    # --- czerwone flagi zbiorczo ---------------------------------------------
    otwarte = sorted({f for op in opinie.values() for f in op.get("red_flags_otwarte", [])})
    wykluczone = sorted({f for op in opinie.values() for f in op.get("red_flags_wykluczone", [])})
    sporne = sorted(set(otwarte) & set(wykluczone))   # jeden mówi wykluczone, drugi otwarte → do dyskusji

    wynik = {
        "ranking": [{"rozpoznanie": nazwy_wyswietlane[d], "p": round(p, 3), "wymienili": kto_wymienil[d]} for d, p in ranking],
        "zgoda": round(zgoda, 3),
        "flagi": (["NISKA_ZGODA"] if zgoda < float(cfg["agregacja"]["prog_niskiej_zgody"]) else []),
        "pilnosc": {"wynik": int(round(pilnosc)) if not math.isnan(pilnosc) else None,
                    "mediana_wazona": mediana, "weto": weto},
        "red_flags": {"otwarte": otwarte, "wykluczone": wykluczone, "sporne_do_dyskusji": sporne},
        "pewnosc_lekarzy": {rola: op.get("pewnosc") for rola, op in opinie.items()},
        "wagi_uzyte": {rola: {"rozpoznanie": round(waga_w_torze(rola, "rozpoznanie", cfg, kal), 3),
                              "pilnosc": round(waga_w_torze(rola, "pilnosc", cfg, kal), 3),
                              "k": k_roli(rola, kal)} for rola in opinie},
        "liczba_opinii": len(opinie),
    }
    if sporne:
        wynik["flagi"].append("SPORNE_RED_FLAGS")
    return wynik


def main() -> None:
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    sprawa = Path(sys.argv[1]).resolve()
    wynik = agreguj(sprawa)
    out = sprawa / "03-opinie" / "_agregat.json"
    zapisz_json(out, wynik)
    log(sprawa, "skrypt", "agregacja", str(out.relative_to(sprawa)))
    print(f"Zapisano {out}")
    print("Ranking:")
    for r in wynik["ranking"]:
        print(f"  {r['p']:.3f}  {r['rozpoznanie']}   ({', '.join(r['wymienili']) or 'nikt — tylko ε'})")
    print(f"Zgoda: {wynik['zgoda']}  Flagi: {wynik['flagi'] or '-'}")
    pil = wynik["pilnosc"]
    print(f"Pilność: {pil['wynik']}  (mediana ważona {pil['mediana_wazona']}" + (f", WETO {pil['weto']['rola']} → {pil['weto']['pilnosc']})" if pil["weto"] else ")"))
    if wynik["red_flags"]["otwarte"]:
        print("Red flags otwarte:", "; ".join(wynik["red_flags"]["otwarte"]))


if __name__ == "__main__":
    main()
