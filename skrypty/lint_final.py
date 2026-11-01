#!/usr/bin/env python3
"""
Lint krótszego FINAL (ankieta zmian 1.11.2026: „Tak”): sprawdza sprawy/<ID>/09-FINAL.md przed zapisaniem werdyktu.

  python skrypty/lint_final.py sprawy/<ID>          # kod wyjścia 1 = są błędy (popraw i uruchom ponownie)

Zasady (CLAUDE.md §6 + testy serii 1 i 2: konsylium pisało 445–528 słów, pojedynczy agent 317–352):
- wszystkie etykiety: REKOMENDACJA, PILNOŚĆ (+ PEWNOŚĆ), DLACZEGO, PLAN B, CZEGO NIE WIEMY, WRÓĆ / ESKALUJ GDY, ŹRÓDŁA;
- najwyżej 350 słów bez sekcji ŹRÓDŁA;
- REKOMENDACJA = jedno zdanie; DLACZEGO ≤ 3 zdania; PLAN B najwyżej 3 punkty;
- ŹRÓDŁA: przypisy [1]–[5] (najwyżej 5 pozycji); każdy przypis [n] w tekście ma pozycję w ŹRÓDŁACH; reszta źródeł zostaje w protokole (04-konsylium.md);
- bez równorzędnych alternatyw („rozważ A lub B”);
- stopka „Narzędzie testowe i edukacyjne marki MS…”.
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

ETYKIETY = ["REKOMENDACJA", "PILNOŚĆ", "DLACZEGO", "PLAN B", "CZEGO NIE WIEMY", "WRÓĆ / ESKALUJ GDY", "ŹRÓDŁA"]
MAX_SLOW = 350


def sekcje(txt: str) -> dict[str, str]:
    wz = re.compile(r"^\**(" + "|".join(re.escape(e) for e in ETYKIETY) + r")\**\s*:", re.M)
    out, pozycje = {}, [(m.group(1), m.start(), m.end()) for m in wz.finditer(txt)]
    for n, (e, _, k) in enumerate(pozycje):
        koniec = pozycje[n + 1][1] if n + 1 < len(pozycje) else len(txt)
        out[e] = txt[k:koniec].strip()
    return out


def zdania(t: str) -> int:
    t = re.sub(r"\[[^\]]*\]|\([^)]*\)", "", t)
    t = re.sub(r"\b(np|m\.in|tj|tzn|ok|godz|mg|dr|r|l|pkt|ryc|tab|wg)\.", r"\1", t)
    return len([z for z in re.split(r"[.!?]+(?:\s|$)", t) if len(z.split()) >= 3])


def punkty(t: str) -> int:
    p = [l for l in t.splitlines() if re.match(r"^\s*(?:[-•*]|\d+[.)])\s+", l)]
    if p:
        return len(p)
    return max(1, len(re.findall(r"(?:^|\s)\(?\d\)\s", t))) if t else 0


def lint(txt: str) -> list[str]:
    bledy = []
    s = sekcje(txt)
    for e in ETYKIETY:
        if e not in s:
            bledy.append(f"brak etykiety {e}:")
    if "PILNOŚĆ" in s and "PEWNOŚĆ" not in s["PILNOŚĆ"]:
        bledy.append("PILNOŚĆ bez PEWNOŚĆ (format: PILNOŚĆ: 2 dziś — PEWNOŚĆ: średnia)")
    bez_zrodel = txt.split("ŹRÓDŁA:")[0] if "ŹRÓDŁA:" in txt else txt
    slowa = len(re.findall(r"\w+", bez_zrodel))
    if slowa > MAX_SLOW:
        bledy.append(f"za długi: {slowa} słów bez ŹRÓDEŁ (najwyżej {MAX_SLOW}) – skróć DLACZEGO i CZEGO NIE WIEMY, szczegóły zostają w protokole")
    if "REKOMENDACJA" in s and zdania(s["REKOMENDACJA"]) > 1:
        bledy.append("REKOMENDACJA ma więcej niż jedno zdanie")
    if "DLACZEGO" in s and zdania(s["DLACZEGO"]) > 3:
        bledy.append(f"DLACZEGO ma {zdania(s['DLACZEGO'])} zdań (najwyżej 3)")
    if "PLAN B" in s and punkty(s["PLAN B"]) > 3:
        bledy.append(f"PLAN B ma {punkty(s['PLAN B'])} punktów (najwyżej 3)")
    if "ŹRÓDŁA" in s:
        zr = s["ŹRÓDŁA"].split("—")[0] if "Narzędzie testowe" in s["ŹRÓDŁA"] else s["ŹRÓDŁA"]
        poz = [l for l in zr.splitlines() if re.match(r"^\s*(?:\[\d+\]|[-•*]|\d+[.)])\s*\S", l)]
        if len(poz) > 5:
            bledy.append(f"ŹRÓDŁA mają {len(poz)} pozycji (najwyżej 5, jako [1]–[5]); resztę przenieś do 04-konsylium.md")
        numery = {int(x) for x in re.findall(r"^\s*\[(\d+)\]", zr, re.M)}
        uzyte = {int(x) for x in re.findall(r"\[(\d+)\]", bez_zrodel)}
        for n in sorted(uzyte - numery):
            bledy.append(f"przypis [{n}] w tekście nie ma pozycji w ŹRÓDŁACH")
        if any(n > 5 for n in numery | uzyte):
            bledy.append("przypisy tylko [1]–[5]")
    if re.search(r"\brozważ\w*\s+[^.]{0,60}\s+lub\s+", txt, re.I):
        bledy.append("równorzędne alternatywy („rozważ A lub B”) – jedna rekomendacja + plan B")
    if "Narzędzie testowe i edukacyjne marki MS" not in txt:
        bledy.append("brak stopki „Narzędzie testowe i edukacyjne marki MS. Nie służy do podejmowania decyzji u realnych pacjentów.”")
    return bledy


def main() -> None:
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    p = Path(sys.argv[1])
    if p.is_dir():
        p = p / "09-FINAL.md"
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    bledy = lint(p.read_text(encoding="utf-8"))
    if bledy:
        print(f"FINAL do poprawy ({len(bledy)}):")
        for b in bledy:
            print("  - " + b)
        sys.exit(1)
    print("FINAL OK")


if __name__ == "__main__":
    main()
