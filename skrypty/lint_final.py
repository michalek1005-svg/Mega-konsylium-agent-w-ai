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
- CO BY TO OBALIŁO: jedna linia (ankieta innowacji 2.11.2026, zmiana CLAUDE.md §6);
- WNIOSKI WG PROBLEMU: obowiązkowe, gdy _agregat.json ma osobne problemy; jedno zdanie na problem (+40 słów limitu na problem);
- stopka „Narzędzie testowe i edukacyjne marki MS…”.
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

ETYKIETY = ["REKOMENDACJA", "CO BY TO OBALIŁO", "PILNOŚĆ", "DLACZEGO", "PLAN B", "CZEGO NIE WIEMY", "WRÓĆ / ESKALUJ GDY", "ŹRÓDŁA"]
MAX_SLOW = 350
OPCJONALNE = ["WNIOSKI WG PROBLEMU"]


def sekcje(txt: str) -> dict[str, str]:
    wz = re.compile(r"^\**(" + "|".join(re.escape(e) for e in ETYKIETY + OPCJONALNE) + r")\**\s*:", re.M)
    out, pozycje = {}, [(m.group(1), m.start(), m.end()) for m in wz.finditer(txt)]
    for n, (e, _, k) in enumerate(pozycje):
        koniec = pozycje[n + 1][1] if n + 1 < len(pozycje) else len(txt)
        out[e] = txt[k:koniec].strip()
    return out


def zdania(t: str) -> int:
    t = re.sub(r"\[[^\]]*\]|\([^)]*\)", "", t)
    t = re.sub(r"\b(np|m\.in|tj|tzn|ok|godz|mg|dr|r|l|pkt|ryc|tab|wg|ż|ur|zał|tzw|itd|itp|ew|ang|łac|przyp|ml|kg|mmol|min|tyg|mies|wyd|red|s|t|nr|al|et)\.", r"\1", t)
    t = re.sub(r"(\d)\.(?=\s*[a-ząćęłńóśźż0-9(])", r"\1", t)          # „70. r.ż.”, „1. dawka” – liczba z kropką nie kończy zdania
    t = re.sub(r"(?<=\s)([A-ZĄĆĘŁŃÓŚŹŻa-ząćęłńóśźż])\.(?=\s*[a-ząćęłńóśźż])", r"\1", t)   # pojedyncza litera z kropką (inicjał, skrót)
    return len([z for z in re.split(r"[.!?]+(?:\s|$)", t) if len(z.split()) >= 3])


def punkty(t: str) -> int:
    p = [l for l in t.splitlines() if re.match(r"^\s*(?:[-•*]|\d+[.)])\s+", l)]
    if p:
        return len(p)
    return max(1, len(re.findall(r"(?:^|\s)\(?\d\)\s", t))) if t else 0


def lint(txt: str, problemy: list[str] | None = None) -> list[str]:
    bledy = []
    problemy = problemy or []
    s = sekcje(txt)
    for e in ETYKIETY:
        if e not in s:
            bledy.append(f"brak etykiety {e}:")
    if "PILNOŚĆ" in s and "PEWNOŚĆ" not in s["PILNOŚĆ"]:
        bledy.append("PILNOŚĆ bez PEWNOŚĆ (format: PILNOŚĆ: 2 dziś — PEWNOŚĆ: średnia)")
    bez_zrodel = txt.split("ŹRÓDŁA:")[0] if "ŹRÓDŁA:" in txt else txt
    slowa = len(re.findall(r"\w+", bez_zrodel))
    limit = MAX_SLOW + 40 * len(problemy)
    if slowa > limit:
        bledy.append(f"za długi: {slowa} słów bez ŹRÓDEŁ (najwyżej {limit}) – skróć DLACZEGO i CZEGO NIE WIEMY, szczegóły zostają w protokole")
    if "REKOMENDACJA" in s and zdania(s["REKOMENDACJA"]) > 1:
        bledy.append("REKOMENDACJA ma więcej niż jedno zdanie")
    if "CO BY TO OBALIŁO" in s and len([l for l in s["CO BY TO OBALIŁO"].splitlines() if l.strip()]) > 1:
        bledy.append("CO BY TO OBALIŁO ma być jedną linią")
    if problemy:
        if "WNIOSKI WG PROBLEMU" not in s:
            bledy.append("brak WNIOSKI WG PROBLEMU: (agregat ma osobne problemy: " + ", ".join(problemy) + ")")
        else:
            for pid in problemy:
                if not re.search(r"\b" + re.escape(pid) + r"\b", s["WNIOSKI WG PROBLEMU"]):
                    bledy.append(f"WNIOSKI WG PROBLEMU: brak zdania dla {pid}")
    if "DLACZEGO" in s and zdania(s["DLACZEGO"]) > 3:
        bledy.append(f"DLACZEGO ma {zdania(s['DLACZEGO'])} zdań (najwyżej 3)")
    if "PLAN B" in s and punkty(s["PLAN B"]) > 3:
        bledy.append(f"PLAN B ma {punkty(s['PLAN B'])} punktów (najwyżej 3)")
    if "ŹRÓDŁA" in s:
        # odcinamy tylko stopkę („— Narzędzie testowe…”), nie każdy myślnik w opisie źródła (pomiar 2.11: gubiło [4]–[5])
        zr = re.split(r"[—–-]+\s*Narzędzie testowe", s["ŹRÓDŁA"], maxsplit=1)[0]
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
    problemy: list[str] = []
    agr = p.parent / "03-opinie" / "_agregat.json"
    if agr.exists():
        import json
        try:
            a = json.loads(agr.read_text(encoding="utf-8"))
            if a.get("problemy"):
                problemy = [a.get("problem_glowny") or "P1"] + sorted(a["problemy"])
        except (ValueError, json.JSONDecodeError):
            pass
    bledy = lint(p.read_text(encoding="utf-8"), problemy)
    # pomiar 2.11.2026: 07-sprawdzenie.json miał tylko „fakty” – Sprawdzający procesu jest obowiązkowy przed FINAL
    spr = p.parent / "07-sprawdzenie.json"
    if spr.exists():
        import json
        try:
            d = json.loads(spr.read_text(encoding="utf-8"))
            for czesc in ("fakty", "proces"):
                if not d.get(czesc):
                    bledy.append(f"07-sprawdzenie.json bez części „{czesc}” – uruchom {'sprawdzajacy-faktow' if czesc == 'fakty' else 'sprawdzajacy-procesu'}")
        except (ValueError, json.JSONDecodeError):
            bledy.append("07-sprawdzenie.json nie jest poprawnym JSON-em")
    if bledy:
        print(f"FINAL do poprawy ({len(bledy)}):")
        for b in bledy:
            print("  - " + b)
        sys.exit(1)
    print("FINAL OK")


if __name__ == "__main__":
    main()
