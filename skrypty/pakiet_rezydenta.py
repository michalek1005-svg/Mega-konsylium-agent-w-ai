#!/usr/bin/env python3
"""
Firewall rezydenta: buduje pakiet dla konsultanta zewnętrznego i wypisuje go na stdout.
Ordynator przekazuje rezydentowi WYŁĄCZNIE ten stdout.

Użycie:  python3 skrypty/pakiet_rezydenta.py sprawy/<ID> [--persona losowa|<nazwa>|brak] [--seed N]

Do pakietu wchodzi:
  [A] 00-surowe.md — dosłownie
  [B] odpowiedzi użytkownika z 01-wywiad.md — bez pytań, bez komentarzy ordynatora, bez sekcji NIEZNANE i hipotezy roboczej
  [C] jedno zdanie decyzji (REKOMENDACJA + PILNOŚĆ z 05-projekt.md) — bez uzasadnienia
  [D] zadanie (stały tekst)
Nie wchodzi nic innego. Skrypt ostrzega na stderr przy wykryciu wzorca PESEL.
"""
from __future__ import annotations

import argparse
import random
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from _wspolne import log  # noqa: E402

PERSONY = [
    "geriatra z małego szpitala powiatowego",
    "pediatra (patrzysz na dorosłych oczami kogoś, kto zwykle leczy dzieci i pyta rodziców)",
    "lekarz SOR z dużego miasta",
    "lekarz rodzinny z Wielkiej Brytanii pracujący wg NICE",
    "internista z USA (inne progi, inne odruchy diagnostyczne)",
    "lekarz medycyny paliatywnej",
    "lekarz chorób zakaźnych",
    "psychiatra konsultujący na oddziale internistycznym",
]

ZADANIE = """[D] ZADANIE
Jesteś lekarzem z innego ośrodka, na miesięcznym stażu w zespole, którego nie znasz. Nie znasz jego zwyczajów, narzędzi ani wytycznych, którymi się posługuje.
Załóż, że za rok okaże się, że decyzja z sekcji [C] była błędna. Co było przyczyną?
Odpowiedz w ≤150 słowach, dokładnie w trzech punktach:
1. CZEGO BRAKUJE W DANYCH — o co nikt nie zapytał, a Ty byś zapytał (konkretne pytanie).
2. HIPOTEZA NIEWYPOWIEDZIANA — rozpoznanie lub mechanizm, którego decyzja zdaje się nie uwzględniać (jedno).
3. PODEJRZANE ZAŁOŻENIE — co w decyzji wygląda na nawyk zespołu lub ograniczenie jego narzędzi, a nie wynik danych.
Pod punktami dopisz jedną linię: SKRÓT: <najważniejsza z Twoich uwag, jedno zdanie ≤150 znaków>.
Nie diagnozuj. Nie proponuj leczenia. Nie oceniaj, czy decyzja jest dobra. Jeśli odpowiedzi w [B] są niezrozumiałe bez pytań — zgłoś to w pkt 3.
Jeśli uczciwie nie widzisz braków — napisz to jednym zdaniem w każdym punkcie."""


def odpowiedzi_bez_pytan(wywiad: str) -> list[str]:
    """Wyciąga linie 'O:' / 'Odpowiedź:' z 01-wywiad.md; pomija wszystko inne."""
    odp = []
    for linia in wywiad.splitlines():
        s = linia.strip()
        if s.lower().startswith("## nieznane") or s.lower().startswith("## hipoteza"):
            break   # sekcje poniżej są poza pakietem
        m = re.match(r"^(?:O|Odp|Odpowied[źz])\s*[:\-–]\s*(.+)$", s, re.I)
        if m:
            odp.append(m.group(1).strip())
            continue
        # format 'P: ... O: ...' w jednej linii
        m2 = re.search(r"\bO\s*:\s*(.+)$", s)
        if m2 and re.match(r"^P\s*:", s):
            odp.append(m2.group(1).strip())
    return odp


def decyzja(projekt: str) -> str:
    rek = re.search(r"^REKOMENDACJA:\s*(.+)$", projekt, re.M)
    pil = re.search(r"^PILNOŚĆ:\s*([^\n—\-]+)", projekt, re.M)
    r = rek.group(1).strip() if rek else "(brak linii REKOMENDACJA w 05-projekt.md)"
    p = pil.group(1).strip() if pil else "?"
    return f"{r}  [pilność: {p}]"


def ostrzez_pesel(txt: str) -> None:
    if re.search(r"\b\d{11}\b", txt):
        print("OSTRZEŻENIE: w 00-surowe.md wykryto ciąg 11 cyfr (możliwy PESEL). Zanonimizuj przed przekazaniem rezydentowi.", file=sys.stderr)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("sprawa")
    ap.add_argument("--persona", default="losowa")
    ap.add_argument("--seed", type=int, default=None)
    a = ap.parse_args()
    sprawa = Path(a.sprawa).resolve()

    surowe = (sprawa / "00-surowe.md").read_text(encoding="utf-8").strip()
    wywiad_p = sprawa / "01-wywiad.md"
    wywiad = wywiad_p.read_text(encoding="utf-8") if wywiad_p.exists() else ""
    projekt_p = sprawa / "05-projekt.md"
    projekt = projekt_p.read_text(encoding="utf-8") if projekt_p.exists() else ""
    ostrzez_pesel(surowe)

    if a.persona == "brak":
        persona = None
    elif a.persona == "losowa":
        rng = random.Random(a.seed)
        persona = rng.choice(PERSONY)
    else:
        persona = a.persona

    czesci = ["=== PAKIET DLA KONSULTANTA ZEWNĘTRZNEGO ==="]
    if persona:
        czesci.append(f"PERSONA: {persona}")
    czesci.append("\n[A] SUROWE DANE — dosłownie to, co wpisał lekarz prowadzący, bez redakcji:\n" + surowe)
    odp = odpowiedzi_bez_pytan(wywiad)
    czesci.append("\n[B] ODPOWIEDZI LEKARZA PROWADZĄCEGO NA DOPYTANIA (same odpowiedzi, bez pytań):\n" +
                  ("\n".join(f"- {o}" for o in odp) if odp else "- (brak)"))
    czesci.append("\n[C] DECYZJA ZESPOŁU (jedno zdanie, bez uzasadnienia):\n" + decyzja(projekt))
    czesci.append("\n" + ZADANIE)
    print("\n".join(czesci))
    try:
        log(sprawa, "skrypt", "pakiet_rezydenta", f"persona={persona or 'brak'} seed={a.seed}")
    except Exception:
        pass


if __name__ == "__main__":
    main()
