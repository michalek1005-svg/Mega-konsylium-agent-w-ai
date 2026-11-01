#!/usr/bin/env python3
"""
Dymek do Pokoju lekarskiego → dopisuje zdarzenie "wypowiedz" do sprawy/<ID>/_log.jsonl (format: docs/DYMKI.md).

Użycie (ordynator, po każdej wypowiedzi albo zbiorczo po kroku):
  python3 skrypty/dymek.py sprawy/<ID> --rola bayes --faza "Ślepa tura" --skrot "Tabletka widmo 0,70, pilność 4." [--info "p=0,70 · Bristol 6"] [--temat "..."] [--plik 03-opinie/bayes.json] [--persona "..."]
  python3 skrypty/dymek.py sprawy/<ID> --rola ordynator --faza "Konsylium runda 1" --tablica "Lider: tabletka widmo (0,70)" --skresl "OZW — troponina ujemna ×2"
    (--tablica zapisuje na tablicy w Pokoju najważniejsze ustalenie; --skresl skreśla odrzuconą hipotezę; można łączyć z dymkiem)
  python3 skrypty/dymek.py sprawy/<ID> --rola bayes --asystenci 2     # plakietka na drzwiach „konsultuje się (n)”; 0 = asystenci skończyli
  python3 skrypty/dymek.py sprawy/<ID> --wiele dymki.jsonl     # wiele naraz: jedna linia JSON = jeden dymek (te same pola)

Skrót: 1–2 pełne zdania językiem medycznym, najwyżej 400 znaków, bez markdownu. Dłuższy jest skracany do pełnych słów z „…”.
Info (opcjonalnie): dodatkowa linia pod dymkiem — liczby, skale, kryteria, wytyczne; najwyżej 200 znaków.
Tresc (opcjonalnie): dłuższa wersja do dymku (2–4 zdania, do 600 znaków), gdy skrót ma zostać krótki.
Na Windows: python skrypty/dymek.py …
"""
from __future__ import annotations

import argparse
import json
import re
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

ROLE = {"ordynator", "z_zlozonosc", "z_bezpieczenstwo", "z_niepewnosc", "hipotezujacy", "bayes", "najgorszy_scenariusz",
        "poz_pragmatyk", "farmakolog", "gospodarz_kosztow", "s_fakty", "s_proces", "R1", "R2", "R3", "lekarz_prowadzacy"}
ALIASY = {"zastepca_zlozonosc": "z_zlozonosc", "zastepca_bezpieczenstwo": "z_bezpieczenstwo", "zastepca_niepewnosc": "z_niepewnosc",
          "sprawdzajacy_faktow": "s_fakty", "sprawdzajacy_procesu": "s_proces"}
FAZY = ["Wywiad", "Triage", "Ślepa tura", "Agregacja", "Konsylium · runda", "Projekt", "Rezydenci", "Sprawdzenie",
        "Odpowiedź rezydentom", "Werdykt", "Follow-up"]
MAX = 400
MAX_TRESC = 600
MAX_INFO = 200


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
    if not d.get("skrot") and (d.get("tresc") or d.get("dymek")):
        d = {**d, "skrot": d.get("tresc") or d.get("dymek")}
    if not d.get("skrot"):
        sys.exit(f"Brak pola skrot: {d}")
    w = {"ts": datetime.now(timezone.utc).isoformat(timespec="seconds"), "zdarzenie": "wypowiedz",
         "rola": rola(d["rola"]), "faza": faza(d["faza"]), "skrot": skroc(d["skrot"])}
    if d.get("tresc") or d.get("dymek"):
        w["tresc"] = skroc(d.get("tresc") or d.get("dymek"), MAX_TRESC)
    if d.get("info"):
        w["info"] = skroc(d["info"], MAX_INFO)
    for k in ("temat", "plik", "persona"):
        if d.get(k):
            w[k] = skroc(d[k], 160) if k == "temat" else d[k]
    return w


def wpisy_tablicy(a) -> list:
    """Zdarzenia 'tablica' z --tablica / --skresl (ustalenia i skreślenia) oraz 'prognoza' z --prognoza (wykres rozpoznań)."""
    out = []
    if a.prognoza:
        roz = []
        for czesc in re.split(r"[;\n]", a.prognoza):
            m = re.match(r"^\s*(.+?)\s*[=:]\s*([\d.,]+)\s*%?\s*$", czesc)
            if not m:
                continue
            p = float(m.group(2).replace(",", "."))
            roz.append({"nazwa": skroc(m.group(1), 60), "p": round(p / 100 if p > 1 else p, 3)})
        if not roz:
            sys.exit('--prognoza: podaj "Rozpoznanie=0,40;Inne=0,25"')
        w = {"ts": datetime.now(timezone.utc).isoformat(timespec="seconds"), "zdarzenie": "prognoza", "faza": faza(a.faza), "rozpoznania": roz[:5]}
        if a.rola:
            w["rola"] = rola(a.rola)
        out.append(w)
    for tekst, skreslone in [(x, False) for x in (a.tablica or [])] + [(x, True) for x in (a.skresl or [])]:
        w = {"ts": datetime.now(timezone.utc).isoformat(timespec="seconds"), "zdarzenie": "tablica",
             "faza": faza(a.faza), "tekst": skroc(tekst, 140), "skreslone": skreslone}
        if a.rola:
            w["rola"] = rola(a.rola)
        if skreslone and a.powod:
            w["powod"] = skroc(a.powod, 120)
        out.append(w)
    return out


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("sprawa", type=Path)
    ap.add_argument("--rola"); ap.add_argument("--faza"); ap.add_argument("--skrot")
    ap.add_argument("--info", help="liczby, skale, wytyczne (≤200 znaków)"); ap.add_argument("--tresc", help="dłuższa treść dymku (≤600 znaków)")
    ap.add_argument("--temat"); ap.add_argument("--plik"); ap.add_argument("--persona")
    ap.add_argument("--wiele", type=Path, help="plik JSONL z wieloma dymkami")
    ap.add_argument("--tablica", action="append", help="zapisz na tablicy w Pokoju najważniejsze ustalenie (≤140 znaków; można podać kilka razy)")
    ap.add_argument("--skresl", action="append", help="skreśl na tablicy odrzuconą hipotezę/ustalenie (ten sam tekst co wcześniej albo nowy, od razu skreślony)")
    ap.add_argument("--powod", help="dlaczego odrzucono (≤120 znaków) – pokazuje się pod skreślonym wpisem")
    ap.add_argument("--prognoza", help='bieżące prawdopodobieństwa rozpoznań dla wykresu Lekarza prowadzącego: "Rozpoznanie=0,40;Inne=0,25" (do 5 pozycji)')
    ap.add_argument("--asystenci", type=int, help="ilu niewidocznych asystentów tej roli pracuje teraz (0 = skończyli) – plakietka na drzwiach Pokoju")
    a = ap.parse_args()
    if not a.sprawa.is_dir():
        sys.exit(f"Nie ma katalogu sprawy: {a.sprawa}")
    if a.asystenci is not None:
        if not a.rola:
            sys.exit("--asystenci wymaga --rola (czyi asystenci pracują).")
        with open(a.sprawa / "_log.jsonl", "a", encoding="utf-8") as f:
            f.write(json.dumps({"ts": datetime.now(timezone.utc).isoformat(timespec="seconds"), "zdarzenie": "asystenci",
                                "rola": rola(a.rola), "liczba": max(0, min(9, a.asystenci))}, ensure_ascii=False) + "\n")
        sygnal_ai(a.sprawa, "pracuje")
        if not (a.skrot or a.tresc or a.wiele or a.tablica or a.skresl or a.prognoza):
            return
    if (a.tablica or a.skresl or a.prognoza) and not (a.skrot or a.tresc or a.wiele):
        # same wpisy na tablicę, bez dymka
        if not a.faza:
            sys.exit("Podaj --faza (etap, od którego wpis jest widoczny na tablicy).")
        with open(a.sprawa / "_log.jsonl", "a", encoding="utf-8") as f:
            for w in wpisy_tablicy(a):
                f.write(json.dumps(w, ensure_ascii=False) + "\n")
        sygnal_ai(a.sprawa, "pracuje")
        return
    if a.wiele:
        dane = [json.loads(l) for l in a.wiele.read_text(encoding="utf-8").splitlines() if l.strip()]
    else:
        if not (a.rola and a.faza and (a.skrot or a.tresc)):
            sys.exit("Podaj --rola, --faza i --skrot (albo --wiele).")
        dane = [{"rola": a.rola, "faza": a.faza, "skrot": a.skrot, "tresc": a.tresc, "info": a.info, "temat": a.temat, "plik": a.plik, "persona": a.persona}]
    wpisy = [wpis(d) for d in dane]
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    with open(a.sprawa / "_log.jsonl", "a", encoding="utf-8") as f:
        for w in wpisy:
            f.write(json.dumps(w, ensure_ascii=False) + "\n")
        for w in wpisy_tablicy(a):
            f.write(json.dumps(w, ensure_ascii=False) + "\n")
    print(f"Dopisano dymków: {len(wpisy)}")
    sygnal_ai(a.sprawa, "pracuje" if not any(w.get("faza", "").lower().startswith(("werdykt", "follow")) for w in wpisy) else "czeka")


def sygnal_ai(sprawa: Path, stan: str) -> None:
    """Sygnał „AI pracuje” dla aplikacji (_ai-aktywnosc.json w folderze Konsylium = dwa poziomy nad sprawą).
    Pokój po dymku wie, że konsylium dalej pracuje (lekarze wychodzą z pokoju i wracają z kolejną wypowiedzią);
    po werdykcie sygnał gaśnie. Działa bez hooków Claude Code."""
    try:
        korzen = sprawa.resolve().parent.parent
        (korzen / "_ai-aktywnosc.json").write_text(json.dumps({"stan": stan, "czas": int(time.time() * 1000), "sprawa": sprawa.name}), encoding="utf-8")
    except OSError:
        pass


if __name__ == "__main__":
    main()
