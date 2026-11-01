#!/usr/bin/env python3
"""
Tryb ROZMOWA (MS Konsylium Psychologiczne): wymiana plików między aplikacją a zespołem agentów.
Protokół i zasady: docs/ROZMOWA.md. Na Windows: python skrypty/rozmowa.py …

  python skrypty/rozmowa.py czekaj [--rozmowa ID] [--limit 540]
        czeka na nową wiadomość użytkownika (w dowolnej rozmowie albo w ID); wypisuje historię,
        nowe wiadomości, wynik filtra słownikowego ryzyka i reakcje (emotikony)
  python skrypty/rozmowa.py pracuje --rozmowa ID --panel straznik_ryzyka,terapeuta_cbt,prowadzacy [--etap "rozważa odpowiedź"]
        pasek „zespół pracuje” w aplikacji (awatary panelu); wywołuj na starcie tury i przy zmianie etapu
  python skrypty/rozmowa.py odpowiedz --rozmowa ID --plik odp.json
        dopisuje JEDNĄ odpowiedź terapeuty AI. odp.json: {"tekst": "...", "ryzyko": 0-4, "glosy": [{"rola": "...", "skrot": "..."}],
        "zrodla": ["PMID 123"], "reakcja": "🤍", "kryzys": false, "obnizam_ryzyko": "<nowy fakt, gdy poziom niższy niż filtr>"}
        albo krócej: --tekst "..." --ryzyko 0 [--reakcja "🙂"] [--kryzys]
  python skrypty/rozmowa.py formulacja --rozmowa ID --plik formulacja.md    robocza formulacja (przycisk „Jak to rozumiemy”)
  python skrypty/rozmowa.py historia --rozmowa ID                           cała rozmowa
"""
from __future__ import annotations

import argparse
import json
import os
import re
import sys
import tempfile
import time
import unicodedata
from datetime import datetime, timezone
from pathlib import Path

KORZEN = Path(__file__).resolve().parent.parent
ROZMOWY = KORZEN / "rozmowy"
WYWIADY = KORZEN / "wywiad-na-zywo"


def bez_cytatow(t: str) -> str:
    """Tekst bez cytatów „…” i "…" – gotowe zdanie do wysłania komuś nie jest pytaniem do użytkownika."""
    return re.sub(r"„[^”]*”|\"[^\"]*\"|«[^»]*»", " ", t or "")


def wywiady_flagi(dni: int = 7) -> list[str]:
    """Flagi z wywiadów z ostatnich dni (wywiad-na-zywo/<KOD>/stan.json) – Rozmowa sama ich nie widzi."""
    if not WYWIADY.exists():
        return []
    lin, granica = [], time.time() - dni * 86400
    for p in sorted(WYWIADY.glob("*/stan.json"), key=lambda x: x.stat().st_mtime, reverse=True)[:3]:
        if p.stat().st_mtime < granica:
            continue
        try:
            st = json.loads(p.read_text(encoding="utf-8"))
        except Exception:
            continue
        for f in st.get("flagi") or []:
            if isinstance(f, dict):
                lin.append(f"[{p.parent.name} · {f.get('poziom')}] {f.get('dlaLekarza') or f.get('tekst') or ''}".strip())
    return lin
FRAZY = json.loads((KORZEN / "config" / "frazy-ryzyka.json").read_text(encoding="utf-8"))
POMOC = json.loads((KORZEN / "config" / "pomoc-pl.json").read_text(encoding="utf-8"))
ROLE = {"prowadzacy", "terapeuta_cbt", "terapeuta_psychodynamiczny", "terapeuta_systemowy", "terapeuta_act", "terapeuta_humanistyczny",
        "diagnosta", "psychiatra", "straznik_ryzyka", "klient_sedzia", "sprawdzajacy_etyki", "sprawdzajacy_zrodel", "rzecznik_normalnosci"}
# zwroty zdradzające „machinerię” w jednym głosie (docs/ROZMOWA.md §4) i granice (docs/BEZPIECZENSTWO.md)
SZWY = [r"\bm[oó]j koleg", r"\bterapeut(a|ka) (cbt|act|systemow|psychodynam|humanist)", r"\bzesp[oó]ł uwa[zż]a", r"\bz jednej strony\b(?=.{0,60}(terapeut|podej[sś]|zesp[oó][lł]|szko[lł]|cbt|act))",
        r"\bjako model\b", r"\bjestem tu zawsze\b", r"\bzawsze (tu )?b[eę]d[eę]\b", r"\bdawk", r"\bodstaw", r"\bwierz[eę],? [zż]e nie\b", r"\bpo prostu\b", r"\bpowinie(ne)?(ś|s|nes|naś|nas)\b", r"\bnie martw si", r"\bto normalne\b", r"\bna pewno si[eę] uda", r"\b\w+(ł|l)(a)?bym\b", r"\b\w+[aeiuyę]ł(e|a)m\b", r"\b\w*(szed|sz|mog|jad|nios|wiod)ł(e|a)m\b",
        r"\bz (mojego |w[łl]asnego )?do[sś]wiadczenia\b", r"\bw mojej praktyce\b", r"\bmoi (pacjenci|klienci)\b",
        r"\brozumiem dok[lł]adnie", r"\bwszystko (b[eę]dzie dobrze|si[eę] u[lł]o[zż]y)", r"\bka[zż]dy tak ma\b", r"\bmusisz\b", r"\bg[lł]owa do g[oó]ry", r"\bmnie te[zż] (si[eę] )?(to|tak)", r"\bdlaczego (jeszcze )?nie\b", r"\bmiałe?m (kiedy[sś] )?(pacjent|klient)"]

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")


def teraz() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def bez_ogonkow(t: str) -> str:
    t = unicodedata.normalize("NFD", t.lower())
    return "".join(c for c in t if unicodedata.category(c) != "Mn").replace("ł", "l")


def ryzyko_slownik(t: str) -> tuple[int, list[str]]:
    s = bez_ogonkow(t)
    for poziom, klucz in ((3, "poziom3"), (3, "przemoc"), (2, "poziom2"), (1, "poziom1")):
        traf = [m.group(0) for re_ in FRAZY.get(klucz, []) if (m := re.search(re_, s))]
        if traf:
            return poziom, traf
    return 0, []


def czytaj(p: Path, dom=None):
    try:
        return json.loads(p.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return dom


def zapisz(p: Path, dane) -> None:
    p.parent.mkdir(parents=True, exist_ok=True)
    fd, tmp = tempfile.mkstemp(dir=p.parent, suffix=".tmp")
    with os.fdopen(fd, "w", encoding="utf-8") as f:
        json.dump(dane, f, ensure_ascii=False, indent=2)
    for i in range(10):
        try:
            os.replace(tmp, p)
            return
        except PermissionError:
            time.sleep(0.08)
    os.replace(tmp, p)


def kat(rid: str) -> Path:
    if not re.fullmatch(r"[\w-]{3,60}", rid or ""):
        sys.exit(f"Zły identyfikator rozmowy: {rid!r}")
    return ROZMOWY / rid


def stan(rid: str) -> dict:
    k = kat(rid)
    u = czytaj(k / "uzytkownik.json", {}) or {}
    z = czytaj(k / "zespol.json", {}) or {}
    m = czytaj(k / "meta.json", {}) or {}
    ja = [w for w in u.get("wiadomosci", []) if isinstance(w, dict)]
    ze = [w for w in z.get("wiadomosci", []) if isinstance(w, dict)]
    odp = max([w.get("odpowiedz_na", 0) for w in ze] or [0])
    nowe = [w for w in ja if w.get("n", 0) > odp and w.get("typ") != "zwolaj"]
    zwolania = [w for w in ja if w.get("typ") == "zwolaj" and w.get("n", 0) > odp]
    return {"id": rid, "tryb": u.get("tryb") or m.get("tryb") or "rozmowa", "ja": ja, "zespol": ze, "nowe": nowe,
            "zwolania": zwolania, "reakcje": u.get("reakcje", {}), "odp": odp}


def rozmowy() -> list[str]:
    if not ROZMOWY.exists():
        return []
    return sorted([d.name for d in ROZMOWY.iterdir() if d.is_dir() and not d.name.startswith((".", "_"))])


def historia_txt(s: dict, ile: int = 30) -> str:
    w = [("Użytkownik", x) for x in s["ja"]] + [("Psychoterapeuta AI", x) for x in s["zespol"]]
    w.sort(key=lambda p: str(p[1].get("ts", "")))
    lin = []
    for kto, x in w[-ile:]:
        g = str(x.get("ts", ""))[11:16]
        if x.get("typ") == "zwolaj":
            lin.append(f"[{g}] — zwołano konsylium, sprawa {x.get('sprawa')}")
            continue
        dop = ""
        if kto == "Psychoterapeuta AI":
            dop = f"  (ryzyko {x.get('ryzyko', '?')}{', KRYZYS' if x.get('kryzys') else ''})"
        lin.append(f"[{g}] {kto} #{x.get('n')}: {x.get('tekst', '')}{dop}")
    return "\n".join(lin)


def podsumuj(s: dict) -> None:
    print(f"=== ROZMOWA {s['id']} · tryb: {s['tryb']} ({'użytkownik = terapeuta, konsultacja przypadku' if s['tryb'] == 'konsultacja' else 'użytkownik mówi o sobie / o konkretnej sytuacji'})")
    print("--- historia (najstarsze u góry) ---")
    print(historia_txt(s) or "(pusta)")
    if s["reakcje"]:
        print("--- reakcje użytkownika na odpowiedzi: " + ", ".join(f"#{k}: {v}" for k, v in s["reakcje"].items()))
    fl = wywiady_flagi()
    if fl:
        print("--- flagi z wywiadów z ostatnich 7 dni (zakładka Wywiad; Rozmowa ich nie pokazuje – strażnik bierze je pod uwagę, w turze 1 zapytaj, czy to ta sama osoba) ---")
        for x in fl[:8]:
            print("   " + x)
    print("--- NOWE wiadomości do odpowiedzi ---")
    maks = 0
    for w in s["nowe"]:
        p_app = int(w.get("ryzykoLokalne") or 0)
        p_sl, traf = ryzyko_slownik(w.get("tekst", ""))
        p = max(p_app, p_sl)
        maks = max(maks, p)
        print(f"#{w.get('n')}: {w.get('tekst')}")
        if p:
            print(f"   ! FILTR RYZYKA: poziom ≥{p} (frazy: {', '.join(traf or w.get('frazy') or [])})")
    for z in s["zwolania"]:
        print(f"*** Użytkownik ZWOŁAŁ KONSYLIUM: sprawa sprawy/{z.get('sprawa')}/ (aplikacja już ją założyła, Pokój ją pokazuje). Poprowadź konsylium wg CLAUDE.md §4.")
    print("--- co teraz ---")
    if maks >= 3:
        print("Filtr słownikowy: poziom ≥3. Aplikacja już pokazała kartę kryzysową z numerami. Strażnik ryzyka NAJPIERW; odpowiedź wg docs/BEZPIECZENSTWO.md (pytanie wprost, numery, kontakt z człowiekiem teraz). Obniżyć poziom można tylko z nowym faktem (pole obnizam_ryzyko).")
    elif maks == 2:
        print("Filtr słownikowy: sygnał pośredni poziomu 2 (bierne myśli o śmierci, pożegnanie, pragnienie połączenia ze zmarłym, zaniechanie leczenia „bo po co”, dostęp do środków). Strażnik ustala, o co chodzi; w odpowiedzi OBOWIĄZKOWO łagodne pytanie wprost o myśli samobójcze, plan i środki, jeden element planu bezpieczeństwa i numer pomocy. To nie jest skrypt kryzysowy.")
    odp_zesp = len({w.get("odpowiedz_na") for w in s["zespol"]})
    if odp_zesp and odp_zesp % 5 == 0 and maks < 2:
        print(f"INFORMACJA ZWROTNA (docs/SZTUKA-ROZMOWY.md §3): to {odp_zesp + 1}. tura – jeśli pasuje, na końcu krótko: „W skali 0–10: jak minął tydzień?” albo „Na ile te rozmowy pomagają?” (zamiast innego pytania).")
    if maks < 2 and s["zespol"] and int(s["zespol"][-1].get("ryzyko") or 0) >= 2:
        print(f"PAMIĘTAJ: poziom ryzyka z poprzedniej tury = {s['zespol'][-1].get('ryzyko')} – to dolna granica tej tury (obniża tylko nowy fakt). Jeśli pytanie o plan i środki nie dostało jeszcze odpowiedzi, wróć do niego (łagodnie, jednym zdaniem).")
    # krótka ścieżka (decyzja Michała 1.11.2026 07:45): krótka wiadomość bez treści do pracy przy ryzyku 0 → strażnik + prowadzący, bez panelu i sędziego
    ostatni = int((s["zespol"][-1].get("ryzyko") if s["zespol"] else 0) or 0)
    tekst_nowych = " ".join(w.get("tekst", "") for w in s["nowe"])
    GRZECZNOSCI = {"dzieki", "dziekuje", "dzieks", "ok", "okej", "okey", "dobrze", "jasne", "super", "sprobuje", "hej", "czesc", "pa",
                   "do", "jutra", "rozumiem", "bardzo", "wielkie", "tak", "to", "zrobie", "fajnie", "milo"}
    slowa = re.findall(r"[a-z]+", bez_ogonkow(tekst_nowych))
    krotka = (bool(s["nowe"]) and maks == 0 and ostatni == 0 and "?" not in tekst_nowych and len(slowa) <= 8
              and len([x for x in slowa if x not in GRZECZNOSCI]) <= 1)
    if not krotka and s["nowe"]:
        slow_n = len(tekst_nowych.split())
        pytan = tekst_nowych.count("?")
        namysl = (slow_n > 120 or pytan >= 2 or s["tryb"] == "konsultacja"
                  or (slow_n > 25 and re.search(r"\b(dlaczego|czemu|pomoz mi zrozumiec|jak to rozumiec|co o tym myslisz|nie wiem co (robic|zrobic)|nie wiem,? czy|decyzj)", bez_ogonkow(tekst_nowych))))
        leki = re.search(r"\b(lek|leki|lekow|tablet|concert|medikinet|elvanse|atomoks|strattera|dawk|recept|stymul|psychiatr|antydepres|pigul|marihuan|alkohol)", bez_ogonkow(tekst_nowych))
        if maks == 0 and ostatni == 0 and not namysl and not leki and slow_n <= 30 and pytan == 1:
            print(f"TEMPO: SZYBKO (docs/ROZMOWA.md §3a) – jedno proste pytanie przy ryzyku 0: strażnik + 1 podejście, odpowiedź 40–120 słów, bez sędziego. W odp.json \"tempo\": \"szybko\".")
        elif namysl:
            print(f"TEMPO: DO NAMYSŁU (docs/ROZMOWA.md §3a) – strażnik + panel 4–5 + źródła (PubMed, Europe PMC) + klient-sędzia; odpowiedź do ok. 450 słów. Pasek: rozmowa.py pracuje … --etap \"przemyśla dokładniej\". W odp.json \"tempo\": \"namysl\".")
        else:
            print("TEMPO: NORMALNIE (docs/ROZMOWA.md §3a) – strażnik + panel ≤4 + klient-sędzia, 80–220 słów.")
    if krotka:
        print(f"KRÓTKA ŚCIEŻKA (docs/ROZMOWA.md §3): krótka wiadomość bez nowej treści przy ryzyku 0 – tylko strażnik ryzyka (szybko) i prowadzący, bez panelu i klienta‑sędziego; odpowiedź 1–3 zdania.\n1) rozmowa.py pracuje --rozmowa {s['id']} --panel straznik_ryzyka,prowadzacy   2) strażnik   3) prowadzący pisze krótko   4) rozmowa.py odpowiedz --rozmowa {s['id']} --plik odp.json")
        return
    print(f"1) rozmowa.py pracuje --rozmowa {s['id']} --panel straznik_ryzyka,<2–3 podejścia>,prowadzacy   2) strażnik + panel (osobne wywołania)   3) scalenie w jeden głos   4) klient-sędzia   5) rozmowa.py odpowiedz --rozmowa {s['id']} --plik odp.json")


def cmd_czekaj(a) -> None:
    koniec = time.time() + a.limit
    while True:
        ids = [a.rozmowa] if a.rozmowa else rozmowy()
        gotowe = [stan(i) for i in ids if (kat(i) / "uzytkownik.json").exists()]
        gotowe = [s for s in gotowe if s["nowe"] or s["zwolania"]]
        if gotowe:
            for s in gotowe:
                podsumuj(s)
            return
        if time.time() > koniec:
            print(f"Brak nowych wiadomości przez {a.limit} s. Uruchom `czekaj` ponownie.")
            return
        time.sleep(1.5)


def cmd_pracuje(a) -> None:
    panel = [p.strip().replace("-", "_") for p in (a.panel or "").split(",") if p.strip()]
    zle = [p for p in panel if p not in ROLE]
    if zle:
        sys.exit(f"Nieznane role: {zle}. Dozwolone: {', '.join(sorted(ROLE))}")
    zapisz(kat(a.rozmowa) / "pracuje.json", {"stan": "czeka" if a.koniec else "pracuje", "ts": teraz(), "panel": panel, "etap": a.etap or ""})
    print("OK: pasek „zespół pracuje” " + ("wyłączony" if a.koniec else f"– {len(panel)} osób"))


def cmd_odpowiedz(a) -> None:
    s = stan(a.rozmowa)
    if a.plik:
        d = json.loads(Path(a.plik).read_text(encoding="utf-8"))
    else:
        d = {"tekst": a.tekst, "ryzyko": a.ryzyko, "kryzys": a.kryzys, "reakcja": a.reakcja}
    # jedna albo kilka wiadomości (Michał 1.11.2026 07:59: „wydaje jedną bądź więcej wiadomości tekstowych”)
    czesci = [str(x).strip() for x in (d.get("wiadomosci") or []) if str(x).strip()] or [str(d.get("tekst") or "").strip()]
    if len(czesci) > 4:
        sys.exit("Najwyżej 4 wiadomości w jednej odpowiedzi (docs/ROZMOWA.md §0).")
    if d.get("kryzys") and len(czesci) > 1:
        czesci = ["\n\n".join(czesci)]  # w kryzysie jedna wiadomość z kartą, nie seria dymków
    tekst = "\n\n".join(czesci).strip()
    if not tekst:
        sys.exit("Pusta odpowiedź.")
    ryz = int(d.get("ryzyko") if d.get("ryzyko") is not None else -1)
    if ryz < 0 or ryz > 4:
        sys.exit("Podaj ryzyko 0–4 (ocena strażnika ryzyka dla tej tury).")
    nowe = s["nowe"]
    filtr = max([max(int(w.get("ryzykoLokalne") or 0), ryzyko_slownik(w.get("tekst", ""))[0]) for w in nowe] or [0])
    # dolna granica = filtr nowych wiadomości ORAZ poziom z poprzedniej odpowiedzi zespołu i filtr całej historii
    # (próba 1.11.2026: „nie mam takich myśli” bez nowego faktu nie może zejść z 2 do 0)
    poprzedni = int((s["zespol"][-1].get("ryzyko") if s["zespol"] else 0) or 0)
    historia = max([max(int(w.get("ryzykoLokalne") or 0), ryzyko_slownik(w.get("tekst", ""))[0]) for w in s["ja"]] or [0])
    dolna = max(filtr, poprzedni, historia)
    if ryz < dolna and not d.get("obnizam_ryzyko"):
        zrodlo = "filtr słownikowy" if dolna == filtr else ("poprzednia ocena strażnika" if dolna == poprzedni else "filtr wcześniejszych wiadomości")
        sys.exit(f"Dolna granica ryzyka w tej rozmowie to {dolna} ({zrodlo}), a odpowiedź ma {ryz}. Poziom obniża tylko strażnik z NOWYM faktem (nie samym zaprzeczeniem): dodaj pole obnizam_ryzyko z tym faktem.")
    if (ryz >= 3 or filtr >= 3) and not d.get("kryzys"):
        numery = [n["numer"] for n in POMOC["numery"]]
        if not any(n.replace(" ", "") in tekst.replace(" ", "") for n in numery):
            sys.exit("Poziom ≥3: odpowiedź musi zawierać numery pomocy z config/pomoc-pl.json (albo ustaw kryzys: true – aplikacja pokaże je sama).")
    if filtr == 2 and ryz <= 2 and "?" not in bez_cytatow(tekst):
        sys.exit("Poziom 2 (bierne myśli): odpowiedź musi zawierać pytanie wprost o plan/zamiar i dostęp do środków.")
    flagi = d.get("flagi") or {}
    aktywne = [k for k, v in flagi.items() if v] if isinstance(flagi, dict) else []
    if aktywne and not d.get("kryzys"):
        sys.exit(f"Flagi strażnika {aktywne}: ustaw kryzys: true i kierunek (przemoc / mania / somatyczny / inni) – także przy ryzyku samobójczym 0 (docs/ROZMOWA.md §5).")
    if (ryz >= 3 or aktywne) and not re.search(r"\bdzi[sś]\b|\bteraz\b", tekst, re.I):
        sys.exit("Poziom ≥3: każda tura musi mieć kontakt z człowiekiem lub specjalistą DZIŚ (telefon teraz, CZP / izba przyjęć dziś) – docs/ROZMOWA.md §5.")
    ostrz = [w for w in SZWY if re.search(w, bez_cytatow(tekst), re.I)]  # cytaty słów użytkownika i gotowe zdania – bez detektora
    if filtr < 2 and dolna == 2 and ryz <= 2 and "?" not in bez_cytatow(tekst):
        ostrz.append("poziom 2 z wcześniejszych tur: sprawdź, czy pytanie o plan i dostęp do środków dostało już odpowiedź – jeśli nie, wróć do niego")
    if bez_cytatow(tekst).count("?") > 1:
        ostrz.append("więcej niż jedno pytanie w turze (docs/ROZMOWA.md §4)")
    if len(czesci) > 1:
        if any("?" in bez_cytatow(c) for c in czesci[:-1]):
            ostrz.append("seria: pytanie do użytkownika tylko w OSTATNIEJ wiadomości – inaczej odpowie, zanim przeczyta resztę (docs/ROZMOWA.md §0)")
        if any(len(c.split()) < 6 for c in czesci):
            ostrz.append("seria: wiadomość krótsza niż 6 słów – dołącz ją do sąsiedniej")
        if d.get("tempo") in ("krotko", "szybko"):
            ostrz.append("seria przy tempie krótkim/szybkim – zwykle wystarczy jedna wiadomość")
    if ryz >= 4 and re.search(r"\bjutro\b", tekst, re.I):
        ostrz.append("poziom 4: ocena specjalisty DZIŚ, nie „jutro” (docs/ROZMOWA.md §5)")
    if d.get("kryzys") and s["zespol"] and s["zespol"][-1].get("kryzys"):
        pop = s["zespol"][-1].get("tekst", "")
        powt = [n["numer"] for n in POMOC["numery"] if n["numer"].replace(" ", "") in tekst.replace(" ", "") and n["numer"].replace(" ", "") in pop.replace(" ", "")]
        if len(powt) >= 2:
            ostrz.append(f"numery {powt} powtórzone z poprzedniej tury – pełna lista jest na czerwonej karcie; w tekście jeden numer z gotowym pierwszym zdaniem")
    slow = len(tekst.split())
    glosy = [g for g in d.get("glosy", []) if isinstance(g, dict)]
    for g in glosy:
        g["rola"] = str(g.get("rola", "")).replace("-", "_")
    n = max([w.get("n", 0) for w in s["zespol"]] or [0]) + 1
    na = max([w.get("n", 0) for w in s["ja"]] or [0])
    w = {"n": n, "odpowiedz_na": na, "ts": teraz(), "tekst": tekst, "ryzyko": ryz, "kryzys": bool(d.get("kryzys")),
         "glosy": glosy, "zrodla": [str(z) for z in d.get("zrodla", [])][:6]}
    for pole in ("wyzwalacze", "powod", "eksploracja", "flagi", "tempo"):  # docs/SIEC-AGENTOW.md §1 – materiał do pomiaru
        if d.get(pole) is not None:
            w[pole] = d[pole]
    if d.get("reakcja"):
        w["reakcja"] = str(d["reakcja"])[:8]
        w["reakcja_na"] = na
    if d.get("kierunek"):
        w["kierunek"] = str(d["kierunek"])
    if d.get("obnizam_ryzyko"):
        w["obnizam_ryzyko"] = str(d["obnizam_ryzyko"])
    seria = []
    for i, cz in enumerate(czesci):
        x = dict(w) if i == len(czesci) - 1 else {"n": n + i, "odpowiedz_na": na, "ts": w["ts"], "tekst": cz, "ryzyko": ryz, "kryzys": False, "glosy": [], "zrodla": []}
        x["n"], x["tekst"] = n + i, cz
        if len(czesci) > 1:
            x["seria"] = [i + 1, len(czesci)]
        seria.append(x)
    w = seria[-1]
    k = kat(a.rozmowa)
    zesp = czytaj(k / "zespol.json", {}) or {}
    zesp.setdefault("rozmowa", a.rozmowa)
    zesp.setdefault("wiadomosci", []).extend(seria)
    zapisz(k / "zespol.json", zesp)
    zapisz(k / "pracuje.json", {"stan": "czeka", "ts": teraz(), "panel": [], "etap": ""})
    with open(k / "_log.jsonl", "a", encoding="utf-8") as f:
        f.write(json.dumps({"ts": w["ts"], "zdarzenie": "odpowiedz", "n": n, "na": na, "ryzyko": ryz, "filtr": filtr, "slow": slow,
                            "panel": [g["rola"] for g in glosy], "szwy": ostrz,
                            **{k: w[k] for k in ("wyzwalacze", "powod", "eksploracja", "flagi", "tempo") if k in w}}, ensure_ascii=False) + "\n")
    print(f"OK: odpowiedź #{n}{'–#' + str(w['n']) if len(seria) > 1 else ''} na wiadomość #{na} ({len(seria)} wiad., {slow} słów, ryzyko {ryz}).")
    if ostrz:
        print(f"UWAGA (detektor szwów / granic): {ostrz} – sprawdź, czy jeden głos nie zdradza machinerii i nie łamie granic.")
    limit = {"krotko": 60, "szybko": 120, "namysl": 450}.get(str(d.get("tempo") or ""), 220)
    if slow > limit and not d.get("kryzys"):
        print(f"UWAGA: {slow} słów przy tempie „{d.get('tempo') or 'normalnie'}” (limit ok. {limit}; docs/ROZMOWA.md §3a). Treść bezpieczeństwa się nie liczy.")
    if slow > 90 and ryz >= 4:
        print(f"UWAGA: poziom 4 – {slow} słów; cel ≤80, tylko tor bezpieczeństwa (docs/ROZMOWA.md §5).")


def cmd_formulacja(a) -> None:
    t = Path(a.plik).read_text(encoding="utf-8")
    p = kat(a.rozmowa) / "formulacja-robocza.md"
    p.write_text(t, encoding="utf-8")
    print("OK: formulacja robocza zapisana")


def cmd_historia(a) -> None:
    podsumuj(stan(a.rozmowa))


def main() -> None:
    ap = argparse.ArgumentParser(description="Tryb Rozmowa: pliki aplikacja ↔ zespół (docs/ROZMOWA.md)")
    sub = ap.add_subparsers(dest="cmd", required=True)
    c = sub.add_parser("czekaj"); c.add_argument("--rozmowa"); c.add_argument("--limit", type=int, default=540); c.set_defaults(f=cmd_czekaj)
    c = sub.add_parser("pracuje"); c.add_argument("--rozmowa", required=True); c.add_argument("--panel", default=""); c.add_argument("--etap"); c.add_argument("--koniec", action="store_true"); c.set_defaults(f=cmd_pracuje)
    c = sub.add_parser("odpowiedz"); c.add_argument("--rozmowa", required=True); c.add_argument("--plik"); c.add_argument("--tekst"); c.add_argument("--ryzyko", type=int)
    c.add_argument("--reakcja"); c.add_argument("--kryzys", action="store_true"); c.set_defaults(f=cmd_odpowiedz)
    c = sub.add_parser("formulacja"); c.add_argument("--rozmowa", required=True); c.add_argument("--plik", required=True); c.set_defaults(f=cmd_formulacja)
    c = sub.add_parser("historia"); c.add_argument("--rozmowa", required=True); c.set_defaults(f=cmd_historia)
    a = ap.parse_args()
    a.f(a)


if __name__ == "__main__":
    main()
