#!/usr/bin/env python3
"""
Agregacja opinii ślepej tury → 03-opinie/_agregat.json

Użycie:  python3 skrypty/agregacja.py sprawy/<ID>

Rozpoznanie: ważona pula logitów (waga = waga_roli[rozpoznanie] × k[rola]), ε dla niewymienionych, softmax.
Pilność:     ważona mediana (tor pilnosc) + WETO lekarza 'najgorszy_scenariusz' (gdy ma red_flags_otwarte).
Zgoda:       ważony udział lekarzy z tym samym rozpoznaniem nr 1 co lider → flaga NISKA_ZGODA (< próg).
             (dawna miara 1 − entropia top_n zostaje jako zgoda_entropia)

Zmiany po testach 1.11.2026 (ankieta zmian, opcje polecane):
- ICD-10: rozpoznania z tym samym kodem (pole "icd10", liczy się kategoria 3-znakowa, np. "M10") łączą się w jedno,
  zanim zadziała słownik synonimów. Ta sama choroba zapisana na 4 sposoby nie daje już fałszywej NISKIEJ_ZGODY.
- Farmakolog nie układa rankingu: jego "rozpoznania" są pomijane, liczy się "przyczyna_polekowa": tak | nie | mozliwa.
- Runda dyskusji: "runda.potrzebna" = true tylko przy RÓŻNICY ROZPOZNANIA NR 1 między lekarzami z wagą w torze
  rozpoznania (albo przy sporze o czerwoną flagę, albo gdy farmakolog widzi przyczynę polekową, a nikt jej nie ma na 1. miejscu). Sama różnica pilności rundy nie otwiera.
- Ochrona mniejszości: rozpoznanie z p ≥ 0,15 u któregokolwiek lekarza albo wniesione przez Najgorszy scenariusz (p ≥ 0,05)
  trafia do "mniejszosc_chroniona" – nie może zniknąć przez głosowanie; trzeba je obalić dowodem albo przenieść do planu B.
"""
from __future__ import annotations

import math
import re
import sys
from collections import defaultdict
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from _wspolne import (CONFIG, k_roli, kalibracja, kanon, log, normalizuj, wagi, wczytaj_opinie,  # noqa: E402
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
    def klucz(r: dict) -> str:
        icd = re.sub(r"[^A-Z0-9]", "", str(r.get("icd10") or "").upper())
        if re.fullmatch(r"[A-Z]\d{2}[0-9A-Z]*", icd):
            return "icd:" + icd[:3]
        return kanon(r["nazwa"], syn)

    STOP = {"lub", "oraz", "albo", "przebiegu", "bez", "przy", "pod", "nad", "jako", "typu", "postac", "postaci"}

    def rdzenie(n: str) -> frozenset:
        return frozenset(w[:5] for w in normalizuj(n).split() if len(w) >= 3 and w not in STOP)

    # ta sama choroba opisana innymi słowami (bez kodu ICD-10): łączymy, gdy rdzenie słów pokrywają się ≥ 0,75 (Jaccard)
    reprezentanci: list[tuple[str, frozenset]] = []

    def scal(k: str, nazwa: str) -> str:
        if k.startswith("icd:"):
            return k
        r = rdzenie(nazwa)
        if len(r) >= 2:
            for k2, r2 in reprezentanci:
                if len(r & r2) / len(r | r2) >= 0.75:
                    return k2
        reprezentanci.append((k, r))
        return k

    nazwy_wyswietlane: dict[str, str] = {}
    kanon_do_wyswietlenia = {kanon(k, syn): k for k in syn}   # forma kanoniczna z synonimy.yaml
    p_lekarza: dict[str, dict[str, float]] = {}
    for rola, op in opinie.items():
        p_lekarza[rola] = {}
        if rola == "farmakolog":          # bez rankingu (testy seria 2 pkt 4)
            continue
        for r in op.get("rozpoznania", []):
            k = scal(klucz(r), r["nazwa"])
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

    # --- runda dyskusji tylko przy różnicy rozpoznania nr 1 ------------------
    top1 = {}
    for rola, d in p_lekarza.items():
        if d and waga_w_torze(rola, "rozpoznanie", cfg, kal) > 0:
            top1[rola] = max(d.items(), key=lambda x: x[1])[0]
    rozne_top1 = sorted({nazwy_wyswietlane[k] for k in top1.values()})
    lider = ranking[0][0] if ranking else None
    # zgoda (od 1.11.2026) = ważony udział lekarzy, których rozpoznanie nr 1 to lider rankingu;
    # entropia top_n zostaje informacyjnie (zgoda_entropia) – przy synonimach dawała fałszywe 0,03–0,11
    w_all = sum(waga_w_torze(r, "rozpoznanie", cfg, kal) for r in top1)
    w_lid = sum(waga_w_torze(r, "rozpoznanie", cfg, kal) for r, k in top1.items() if k == lider)
    zgoda_entropia = zgoda
    zgoda = (w_lid / w_all) if w_all > 0 else 0.0

    # --- ochrona mniejszości --------------------------------------------------
    chronione = []
    for d in wszystkie:
        if d == lider:
            continue
        kto = [r for r in p_lekarza if p_lekarza[r].get(d, 0) >= 0.15]
        # czerwona flaga = rozpoznanie zagrażające, które wniósł lekarz z wetem pilności (Najgorszy scenariusz), p ≥ 0,05
        z_flaga = [r for r in p_lekarza if p_lekarza[r].get(d, 0) >= 0.05 and cfg["role"].get(r, {}).get("weto_pilnosci")
                   and opinie[r].get("red_flags_otwarte")]
        if kto or z_flaga:
            chronione.append({"rozpoznanie": nazwy_wyswietlane[d], "p_max": round(max(p_lekarza[r].get(d, 0) for r in p_lekarza), 3),
                              "kto": sorted(set(kto) | set(z_flaga)), "czerwona_flaga": bool(z_flaga)})
    chronione.sort(key=lambda x: (not x["czerwona_flaga"], -x["p_max"]))
    chronione = chronione[:5]

    polekowe = {r: op.get("przyczyna_polekowa") for r, op in opinie.items() if op.get("przyczyna_polekowa")}
    powody = []
    if len(rozne_top1) > 1:
        powody.append("różne rozpoznanie nr 1: " + " / ".join(rozne_top1))
    if sporne:
        powody.append("spór o czerwoną flagę: " + "; ".join(sporne))
    if any(v == "tak" for v in polekowe.values()) and not any("polek" in n.lower() for n in rozne_top1):
        powody.append("farmakolog: przyczyna polekowa TAK")
    runda = {"potrzebna": bool(powody), "powody": powody,
             "test_zgody": None if powody else "pełna zgoda: jeden adwokat diabła z jednym kontrargumentem, bez rundy"}

    wynik = {
        "ranking": [{"rozpoznanie": nazwy_wyswietlane[d], "p": round(p, 3), "wymienili": kto_wymienil[d]} for d, p in ranking],
        "zgoda": round(zgoda, 3),
        "zgoda_entropia": round(zgoda_entropia, 3),
        "flagi": (["NISKA_ZGODA"] if zgoda < float(cfg["agregacja"]["prog_niskiej_zgody"]) else []),
        "pilnosc": {"wynik": int(round(pilnosc)) if not math.isnan(pilnosc) else None,
                    "mediana_wazona": mediana, "weto": weto},
        "red_flags": {"otwarte": otwarte, "wykluczone": wykluczone, "sporne_do_dyskusji": sporne},
        "pewnosc_lekarzy": {rola: op.get("pewnosc") for rola, op in opinie.items()},
        "wagi_uzyte": {rola: {"rozpoznanie": round(waga_w_torze(rola, "rozpoznanie", cfg, kal), 3),
                              "pilnosc": round(waga_w_torze(rola, "pilnosc", cfg, kal), 3),
                              "k": k_roli(rola, kal)} for rola in opinie},
        "liczba_opinii": len(opinie),
        "rozpoznanie_nr1_lekarzy": {r: nazwy_wyswietlane[k] for r, k in top1.items()},
        "runda": runda,
        "mniejszosc_chroniona": chronione,
        "przyczyna_polekowa": polekowe,
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
    r = wynik["runda"]
    print("Runda dyskusji: " + ("TAK – " + "; ".join(r["powody"]) if r["potrzebna"] else "NIE – " + r["test_zgody"]))
    if wynik["mniejszosc_chroniona"]:
        print("Mniejszość chroniona (obalić dowodem albo plan B): " + "; ".join(f"{m['rozpoznanie']} ({m['p_max']:.2f}{', czerwona flaga' if m['czerwona_flaga'] else ''})" for m in wynik["mniejszosc_chroniona"]))
    pil = wynik["pilnosc"]
    print(f"Pilność: {pil['wynik']}  (mediana ważona {pil['mediana_wazona']}" + (f", WETO {pil['weto']['rola']} → {pil['weto']['pilnosc']})" if pil["weto"] else ")"))
    if wynik["red_flags"]["otwarte"]:
        print("Red flags otwarte:", "; ".join(wynik["red_flags"]["otwarte"]))


if __name__ == "__main__":
    main()
