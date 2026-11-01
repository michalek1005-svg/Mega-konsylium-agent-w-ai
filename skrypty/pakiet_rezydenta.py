#!/usr/bin/env python3
"""
Firewall rezydenta: buduje pakiet dla konsultanta zewnętrznego i wypisuje go na stdout.
Ordynator przekazuje rezydentowi WYŁĄCZNIE ten stdout.

Użycie:  python3 skrypty/pakiet_rezydenta.py sprawy/<ID> [--persona dobrana|losowa|<nazwa>|brak] [--n 1] [--seed N] [--pubmed mcp__PubMed__]

Do pakietu wchodzi (zmiany po testach 1.11.2026, ankieta zmian „Tak, wszystko”):
  [A] 00-surowe.md — dosłownie
  [B] pytania z odpowiedziami z 01-wywiad.md (P: … → O: …) — bez komentarzy ordynatora, bez sekcji NIEZNANE i hipotezy roboczej
  [B2] wyniki badań i parametry (sekcja „Wyniki badań” wywiadu; dopiski lekarza prowadzącego) — rezydent bez wyników krytykował braki, których nie było
  [C] decyzja zespołu: REKOMENDACJA + PILNOŚĆ + PLAN B z 05-projekt.md — bez uzasadnienia
  [D] zadanie (stały tekst) z wprost podaną nazwą narzędzia PubMed
Persona: domyślnie DOBRANA do problemu (SOR / internista / lekarz rodzinny…), a nie losowa – trafiał się geriatra przy 19-latku.
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
    "lekarz SOR z dużego miasta",
    "lekarz rodzinny z Wielkiej Brytanii pracujący wg NICE",
    "internista z USA (inne progi, inne odruchy diagnostyczne)",
    "lekarz medycyny paliatywnej",
    "lekarz chorób zakaźnych",
    "psychiatra konsultujący na oddziale internistycznym",
]

# persona dobrana do problemu: (wzorzec w surowych danych + odpowiedziach, persona); pierwsza pasująca, potem kolejne dla R2, R3
DOBOR = [
    (r"b[oó]l (w )?klat|duszno|omdle|ko[lł]atani|zawa[lł]|udar|niedow[lł]ad|krwotok|wymiot.*krw|smolist|nag[lł]y", "lekarz SOR z dużego miasta"),
    (r"gor[aą]czk|infekc|zaka[zż]|kaszel|antybiot|dreszcz|sepsa|wysypk", "lekarz chorób zakaźnych"),
    (r"lek[iów]* |tabletk|dawk|interakc|polekow|uczul|alergi", "internista z USA (inne progi, inne odruchy diagnostyczne)"),
    (r"nastr[oó]j|l[eę]k|bezsenn|depres|panik|samob", "psychiatra konsultujący na oddziale internistycznym"),
    (r"stawu?|kolan|kr[eę]gos|plec[oó]w|b[oó]l (w )?krzy", "lekarz rodzinny z Wielkiej Brytanii pracujący wg NICE"),
]
DOMYSLNE = ["internista z USA (inne progi, inne odruchy diagnostyczne)", "lekarz rodzinny z Wielkiej Brytanii pracujący wg NICE", "lekarz SOR z dużego miasta"]


def wiek(txt: str) -> int | None:
    m = re.search(r"(\d{2})\s*(?:l\.|lat|lata|r\.ż|-letn)", txt)
    return int(m.group(1)) if m else None


def dobierz_persone(txt: str, n: int = 1) -> str:
    """n = numer rezydenta (1, 2, 3): kolejne pasujące persony, bez powtórzeń."""
    low = txt.lower()
    kand = [p for wz, p in DOBOR if re.search(wz, low)]
    w = wiek(low)
    if w is not None and w >= 75:
        kand.insert(0, "geriatra z małego szpitala powiatowego")
    for p in DOMYSLNE:
        if p not in kand:
            kand.append(p)
    uniq = list(dict.fromkeys(kand))
    return uniq[(max(1, n) - 1) % len(uniq)]


ZADANIE = """[D] ZADANIE
Jesteś lekarzem z innego ośrodka, na miesięcznym stażu w zespole, którego nie znasz. Nie znasz jego zwyczajów, narzędzi ani wytycznych, którymi się posługuje.
Załóż, że za rok okaże się, że decyzja z sekcji [C] była błędna. Co było przyczyną?
Odpowiedz w ≤150 słowach, dokładnie w trzech punktach:
1. CZEGO BRAKUJE W DANYCH — o co nikt nie zapytał, a Ty byś zapytał (konkretne pytanie).
2. HIPOTEZA NIEWYPOWIEDZIANA — rozpoznanie lub mechanizm, którego decyzja zdaje się nie uwzględniać (jedno).
3. PODEJRZANE ZAŁOŻENIE — co w decyzji wygląda na nawyk zespołu lub ograniczenie jego narzędzi, a nie wynik danych.
Pod punktami dopisz jedną linię: SKRÓT: <najważniejsza z Twoich uwag z uzasadnieniem, 1–2 pełne zdania ≤400 znaków, językiem medycznym>.
Nie diagnozuj. Nie proponuj leczenia. Nie oceniaj, czy decyzja jest dobra. Jeśli pytania w [B] wyglądają na sugerujące — zgłoś to w pkt 3.
Zanim napiszesz „brakuje X”, sprawdź [B] i [B2]: wyniki i parametry tam podane SĄ znane.
Możesz sprawdzić jedną konkretną rzecz w PubMed narzędziem {pubmed}search_articles (i {pubmed}get_article_metadata dla streszczenia); podaj PMID przy uwadze.
Jeśli uczciwie nie widzisz braków — napisz to jednym zdaniem w każdym punkcie."""


def pytania_i_odpowiedzi(wywiad: str) -> list[str]:
    """Linie 'P: … O: …' (albo osobne 'P:'/'O:') z 01-wywiad.md → 'pytanie → odpowiedź'; bez sekcji NIEZNANE/hipotezy/uwag ordynatora."""
    out, pyt = [], None
    pomijaj = False
    for linia in wywiad.splitlines():
        s = linia.strip()
        lo = s.lower()
        if lo.startswith("## "):
            pomijaj = any(lo.startswith(x) for x in ("## nieznane", "## hipoteza", "## uwagi ordynatora", "## wstępna analiza", "## wyniki badań", "## czerwone flagi", "## pytanie lekarza"))
            continue
        if pomijaj:
            continue
        m = re.match(r"^P\s*:\s*(.+?)\s+O\s*:\s*(.*)$", s)
        if m:
            out.append(f"{m.group(1).strip()} → {m.group(2).strip() or '(brak odpowiedzi)'}")
            pyt = None
            continue
        m = re.match(r"^P\s*:\s*(.+)$", s)
        if m:
            pyt = m.group(1).strip()
            continue
        m = re.match(r"^(?:O|Odp|Odpowied[źz])\s*[:\-–]\s*(.+)$", s, re.I)
        if m:
            out.append(f"{pyt} → {m.group(1).strip()}" if pyt else m.group(1).strip())
            pyt = None
    return out


def sekcja(wywiad: str, *naglowki: str) -> str:
    """Treść sekcji '## <nagłówek…>' (do następnego '## ')."""
    out, w = [], False
    for linia in wywiad.splitlines():
        lo = linia.strip().lower()
        if lo.startswith("## "):
            w = any(lo.startswith("## " + n.lower()) for n in naglowki)
            continue
        if w:
            out.append(linia.rstrip())
    return "\n".join(out).strip()


def decyzja(projekt: str) -> str:
    rek = re.search(r"^REKOMENDACJA:\s*(.+)$", projekt, re.M)
    pil = re.search(r"^PILNOŚĆ:\s*([^\n—\-]+)", projekt, re.M)
    pb = re.search(r"^PLAN B:\s*(.+?)(?=^\S[A-ZĄĆĘŁŃÓŚŹŻ ]+:|\Z)", projekt, re.M | re.S)
    r = rek.group(1).strip() if rek else "(brak linii REKOMENDACJA w 05-projekt.md)"
    p = pil.group(1).strip() if pil else "?"
    wynik = f"REKOMENDACJA: {r}  [pilność: {p}]"
    if pb:
        wynik += "\nPLAN B: " + re.sub(r"\s+", " ", pb.group(1)).strip()
    return wynik


def ostrzez_pesel(txt: str) -> None:
    if re.search(r"\b\d{11}\b", txt):
        print("OSTRZEŻENIE: w 00-surowe.md wykryto ciąg 11 cyfr (możliwy PESEL). Zanonimizuj przed przekazaniem rezydentowi.", file=sys.stderr)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("sprawa")
    ap.add_argument("--persona", default="dobrana", help="dobrana (domyślnie) | losowa | brak | <własny opis>")
    ap.add_argument("--n", type=int, default=1, help="numer rezydenta (1–3): przy 'dobrana' kolejna pasująca persona")
    ap.add_argument("--seed", type=int, default=None)
    ap.add_argument("--pubmed", default="mcp__PubMed__", help="prefiks narzędzi PubMed (na PC Michała: mcp__plugin_pubmed_PubMed__)")
    a = ap.parse_args()
    sprawa = Path(a.sprawa).resolve()

    surowe = (sprawa / "00-surowe.md").read_text(encoding="utf-8").strip()
    wywiad_p = sprawa / "01-wywiad.md"
    wywiad = wywiad_p.read_text(encoding="utf-8") if wywiad_p.exists() else ""
    projekt_p = sprawa / "05-projekt.md"
    projekt = projekt_p.read_text(encoding="utf-8") if projekt_p.exists() else ""
    ostrzez_pesel(surowe + wywiad)

    if a.persona == "brak":
        persona = None
    elif a.persona == "losowa":
        persona = random.Random(a.seed).choice(PERSONY)
    elif a.persona == "dobrana":
        persona = dobierz_persone(surowe + "\n" + wywiad, a.n)
    else:
        persona = a.persona

    czesci = ["=== PAKIET DLA KONSULTANTA ZEWNĘTRZNEGO ==="]
    if persona:
        czesci.append(f"PERSONA: {persona}")
    czesci.append("\n[A] SUROWE DANE — dosłownie to, co wpisał lekarz prowadzący, bez redakcji:\n" + surowe)
    qa = pytania_i_odpowiedzi(wywiad)
    czesci.append("\n[B] DOPYTANIA I ODPOWIEDZI (pytanie → odpowiedź):\n" + ("\n".join(f"- {o}" for o in qa) if qa else "- (brak)"))
    wyniki = "\n\n".join(x for x in (sekcja(wywiad, "Wyniki badań", "Parametry", "Badanie fizykalne"), sekcja(wywiad, "Dopowiedzenie lekarza", "Dopisek lekarza")) if x)
    czesci.append("\n[B2] WYNIKI BADAŃ, PARAMETRY I DOPISKI LEKARZA PROWADZĄCEGO:\n" + (wyniki or "(brak – lekarz prowadzący zaznaczył, że wyników nie ma)"))
    czesci.append("\n[C] DECYZJA ZESPOŁU (bez uzasadnienia):\n" + decyzja(projekt))
    czesci.append("\n" + ZADANIE.replace("{pubmed}", a.pubmed))
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    print("\n".join(czesci))
    try:
        log(sprawa, "skrypt", "pakiet_rezydenta", f"persona={persona or 'brak'} n={a.n}")
    except Exception:
        pass


if __name__ == "__main__":
    main()
