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
        "wstepna": true = SZYBKA PIERWSZA ODPOWIEDŹ (1–3 zdania + pytanie; nie zamyka tury – zespół pracuje dalej, docs/ROZMOWA.md §0a)
  python skrypty/rozmowa.py pamiec --rozmowa ID --plik pamiec.md          pamięć konta (konta/<konto>/pamiec.md) – po każdej rozmowie
        0.2.0 (docs/ROZMOWA.md §0c): "tempo": "slucham" (jedno zdanie zachęty), "zadanie": "…" (jedno na sesję, w zamknięciu),
        "obserwacja": "…" (jeden wzorzec na sesję, od 3. sesji, tentatywnie)
  python skrypty/rozmowa.py formulacja --rozmowa ID --plik formulacja.md    robocza formulacja (przycisk „Jak to rozumiemy”)
  python skrypty/rozmowa.py historia --rozmowa ID                           cała rozmowa
        0.3.0 (docs/ROZMOWA.md §0d): "cwiczenie": {"start": "zapis_mysli", "zgoda": "<słowa osoby>"} | {"krok": "<odpowiedź osoby>"} | {"przerwij": true},
        "cel": "<cel pracy słowami osoby>", "cel_przeglad": true; styl terapeuty z konta (konta/<konto>/terapeuta.json)
  python skrypty/rozmowa.py superwizja --rozmowa ID --plik streszczenie.md  po sesji: superwizja/<konto>/<data>-sN.md (liczby + streszczenie)
  python skrypty/rozmowa.py notatka --konto K --tekst "…"                    notatka superwizora (Michał) – czekaj pokaże ją w następnej sesji
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
KONTA = KORZEN / "konta"
WYWIADY = KORZEN / "wywiad-na-zywo"
SUPERWIZJA = KORZEN / "superwizja"


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
# 0.3.0: ćwiczenia prowadzone krok po kroku i karty stylu terapeuty (docs/ROZMOWA.md §0d)
CWICZENIA = {c["id"]: c for c in json.loads((KORZEN / "config" / "cwiczenia.json").read_text(encoding="utf-8"))["cwiczenia"]}
_STYLE = json.loads((KORZEN / "config" / "style-terapeuty.json").read_text(encoding="utf-8"))
STYLE = {x["id"]: x for x in _STYLE["style"]}
STYL_DOMYSLNY = _STYLE.get("domyslny", "spokojnie")
STYLE_ZAWSZE = str(_STYLE.get("_zawsze") or "")
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
    for re_ in FRAZY.get("zaprzeczenia", []):  # decyzja Michała 1.11.2026: wyraźne zaprzeczenie nie podnosi poziomu
        s = re.sub(re_, " ", s)
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
    odp = max([w.get("odpowiedz_na", 0) for w in ze if not w.get("wstepna")] or [0])  # szybka pierwsza odpowiedź nie zamyka tury
    nowe = [w for w in ja if w.get("n", 0) > odp and w.get("typ") != "zwolaj"]
    zwolania = [w for w in ja if w.get("typ") == "zwolaj" and w.get("n", 0) > odp]
    konto = str(m.get("konto") or "")
    if not re.fullmatch(r"[\w-]{2,40}", konto):
        konto = ""
    return {"id": rid, "konto": konto, "tryb": u.get("tryb") or m.get("tryb") or "rozmowa", "ja": ja, "zespol": ze, "nowe": nowe,
            "zwolania": zwolania, "reakcje": u.get("reakcje", {}), "odp": odp}


def rozmowy() -> list[str]:
    if not ROZMOWY.exists():
        return []
    return sorted([d.name for d in ROZMOWY.iterdir() if d.is_dir() and not d.name.startswith((".", "_"))])


def ts_sek(ts) -> float:
    try:
        return datetime.fromisoformat(str(ts).replace("Z", "+00:00")).timestamp()
    except Exception:
        return 0.0


def rozmowy_konta(konto: str) -> list[str]:
    return [r for r in rozmowy() if (czytaj(ROZMOWY / r / "meta.json", {}) or {}).get("konto") == konto] if konto else []


def sesja_info(s: dict) -> dict:
    """Sesja z ramą (docs/ROZMOWA.md §0c): zdarzenia typ "sesja" (akcja start/koniec) zapisuje aplikacja w uzytkownik.json."""
    ev = [w for w in s["ja"] if w.get("typ") == "sesja"]
    starty = [w for w in ev if w.get("akcja") == "start"]
    info = {"aktywna": False, "nr": 0, "tury": 0, "minuty": 0, "start_n": 0, "ostatni_koniec": None}
    konce = [w for w in ev if w.get("akcja") == "koniec"]
    if konce:
        info["ostatni_koniec"] = konce[-1]
    # numer sesji liczony na całym koncie (wszystkie rozmowy)
    nr = 0
    for r in rozmowy_konta(s.get("konto", "")) or [s["id"]]:
        u = s["ja"] if r == s["id"] else (czytaj(ROZMOWY / r / "uzytkownik.json", {}) or {}).get("wiadomosci", [])
        nr += len([w for w in u if isinstance(w, dict) and w.get("typ") == "sesja" and w.get("akcja") == "start"])
    info["nr"] = nr
    if starty and (not konce or konce[-1].get("n", 0) < starty[-1].get("n", 0)):
        st = starty[-1]
        info.update(aktywna=True, start_n=st.get("n", 0),
                    tury=len([w for w in s["ja"] if w.get("n", 0) > st.get("n", 0) and w.get("typ", "wiadomosc") == "wiadomosc"]),
                    minuty=int(max(0, time.time() - ts_sek(st.get("ts"))) // 60))
    elif starty:
        info["start_n"] = starty[-1].get("n", 0)
    return info


def udzial_slow(s: dict, od_n: int) -> tuple[int, int]:
    ja = sum(len(str(w.get("tekst", "")).split()) for w in s["ja"] if w.get("n", 0) > od_n and w.get("typ", "wiadomosc") == "wiadomosc")
    ty = sum(len(str(w.get("tekst", "")).split()) for w in s["zespol"] if w.get("odpowiedz_na", 0) >= max(1, od_n) and not w.get("kryzys") and not w.get("wstepna"))
    return ja, ty


PEKNIECIE = r"\b(nie rozumiesz|niewazne|nic (mi )?nie daje|to nic nie da|bez sensu|daj (mi )?spokoj|nie o to (mi )?chodzi|znowu to samo|juz to (mowiles|mowilas|pisales|pisalas)|gadasz jak|jak automat|jak robot|odpusc)"


def pekniecie(s: dict) -> str:
    """Prosty wykrywacz pęknięcia sojuszu (bez modelu), z linią bazową z pierwszych 10 wiadomości osoby."""
    nowe = [w for w in s["nowe"] if w.get("typ", "wiadomosc") == "wiadomosc"]
    if not nowe:
        return ""
    t = bez_ogonkow(" ".join(str(w.get("tekst", "")) for w in nowe))
    m = re.search(PEKNIECIE, t)
    if m:
        return f"fraza „{m.group(0)}”"
    baza = sorted(len(str(w.get("tekst", "")).split()) for w in s["ja"][:10] if w.get("typ", "wiadomosc") == "wiadomosc")
    med = baza[len(baza) // 2] if len(baza) >= 3 else 0
    ost = s["zespol"][-1] if s["zespol"] else {}
    if med >= 20 and len(t.split()) <= 3 and "?" in bez_cytatow(str(ost.get("tekst", ""))):
        return f"nagle krótko ({len(t.split())} słowa przy zwykłych ok. {med}) po pytaniu terapeuty"
    return ""


def ostatni_r(s: dict) -> int:
    return int((s["zespol"][-1].get("ryzyko") if s["zespol"] else 0) or 0)


def faza_sesji(se: dict, maks: int, ost_r: int) -> str:
    if not se.get("aktywna"):
        return ""
    if se["tury"] <= 1:
        return "OTWARCIE"
    return "ZAMKNIĘCIE" if (se["tury"] >= 12 or se["minuty"] >= 35) and maks < 2 and ost_r < 2 else "PRACA"


# ---------- 0.3.0: styl terapeuty, cel pracy, ćwiczenia, superwizja (docs/ROZMOWA.md §0d) ----------
def styl_konta(konto: str) -> dict:
    t = (czytaj(KONTA / konto / "terapeuta.json", {}) or {}) if konto else {}
    sid = t.get("styl") if t.get("styl") in STYLE else STYL_DOMYSLNY
    return {**STYLE[sid], "wybrany": t.get("styl") in STYLE, "poprzedni": t.get("poprzedni")}


def starty_sesji(konto: str, s: dict | None = None) -> list[str]:
    """Czasy startów sesji na całym koncie (ze zdarzeń typ "sesja" w uzytkownik.json)."""
    ts = []
    for r in rozmowy_konta(konto):
        u = s["ja"] if s and r == s["id"] else (czytaj(ROZMOWY / r / "uzytkownik.json", {}) or {}).get("wiadomosci", [])
        ts += [str(w.get("ts")) for w in u if isinstance(w, dict) and w.get("typ") == "sesja" and w.get("akcja") == "start"]
    return sorted(ts)


def konce_sesji(konto: str) -> list[str]:
    ts = []
    for r in rozmowy_konta(konto):
        u = (czytaj(ROZMOWY / r / "uzytkownik.json", {}) or {}).get("wiadomosci", [])
        ts += [str(w.get("ts")) for w in u if isinstance(w, dict) and w.get("typ") == "sesja" and w.get("akcja") == "koniec"]
    return sorted(ts)


def cel_konta(konto: str) -> dict:
    return (czytaj(KONTA / konto / "cel.json", {}) or {}) if konto else {}


def przeglad_celu_potrzebny(konto: str, s: dict) -> int:
    """Liczba sesji od uzgodnienia celu albo od ostatniej oceny; ≥4 → przegląd celu (koncepcje §3.2)."""
    cel = cel_konta(konto)
    if cel.get("status") != "uzgodniony" or cel.get("przeglad"):
        return 0
    oceny = [str(o.get("data")) for o in cel.get("oceny") or [] if isinstance(o, dict)]
    ref = max([str(cel.get("uzgodniono") or cel.get("ts") or "")] + oceny)
    return len([t for t in starty_sesji(konto, s) if ts_sek(t) > ts_sek(ref)])


def cwiczenie_stan(s: dict) -> dict | None:
    """Stan ćwiczenia w rozmowy/<ID>/cwiczenie.json; przycisk „Przerwij” w aplikacji = zdarzenie typ "cwiczenie"."""
    c = czytaj(kat(s["id"]) / "cwiczenie.json", None)
    if not isinstance(c, dict):
        return None
    if c.get("status") == "trwa" and any(w.get("typ") == "cwiczenie" and w.get("akcja") == "przerwij" and w.get("n", 0) > int(c.get("start_na") or 0) for w in s["ja"]):
        c = {**c, "status": "przerwane", "przerwal": "osoba (przycisk)", "_z_przycisku": True}
    return c


def notatka_superwizora(konto: str) -> dict | None:
    """Notatka superwizora obowiązuje do końca pierwszej sesji zakończonej po jej zapisaniu."""
    n = czytaj(SUPERWIZJA / konto / "notatka.json", None) if konto else None
    if not isinstance(n, dict) or not str(n.get("tekst") or "").strip():
        return None
    n = dict(n)
    n["aktywna"] = not any(ts_sek(t) > ts_sek(n.get("ts")) for t in konce_sesji(konto))
    return n


NIE_TERAZ = r"\b(nie teraz|przerwijmy|przerwij|dosc tego|wystarczy|nie chce (juz )?(tego|dalej)|zostawmy to|innym razem|nie mam (na to )?sily)\b"
EMOJI = re.compile("[\U0001F300-\U0001FAFF☀-➿]")


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
    if s.get("konto"):
        kk = KONTA / s["konto"]
        prof = czytaj(kk / "profil.json", {}) or {}
        print(f"--- KONTO: {prof.get('pseudonim') or s['konto']} · {prof.get('wiek') or '?'} l. · {prof.get('plec') or '?'} (bez danych identyfikujących) ---")
        pm = kk / "pamiec.md"
        if pm.is_file():
            t = pm.read_text(encoding="utf-8").strip()
            print("--- PAMIĘĆ psychoterapeuty z wcześniejszych rozmów (konta/" + s["konto"] + "/pamiec.md; użytkownik ją widzi i może usunąć) ---")
            print(t[:6000] or "(pusta – użytkownik ją wyczyścił)")
        else:
            print("--- PAMIĘĆ: brak (pierwsza rozmowa na tym koncie) ---")
        inne = [r for r in rozmowy() if r != s["id"] and (czytaj(ROZMOWY / r / "meta.json", {}) or {}).get("konto") == s["konto"]]
        if inne:
            print(f"   wcześniejsze rozmowy tego konta: {', '.join(inne[-5:])} (python skrypty/rozmowa.py historia --rozmowa ID)")
        zad = czytaj(kk / "zadanie.json", None)
        if zad and zad.get("tekst"):
            print(f"--- ZADANIE między sesjami: „{zad['tekst']}” – status: {zad.get('status', 'zaproponowane')}{' · jak było: ' + zad['jak'] if zad.get('jak') else ''} ---")
        su = czytaj(kk / "suwaki.json", []) or []
        if su:
            print("--- suwaki po sesjach (jak się czuje / czy rozmowa była o tym, o czym chciał(a)), 0–10: " + "; ".join(f"{x.get('data', '')[:10]}: {x.get('samopoczucie')}/{x.get('trafnosc')}" for x in su[-5:]) + " ---")
        if prof.get("nastepny_termin"):
            print(f"--- umówiony następny termin: {prof['nastepny_termin']} ---")
        st = styl_konta(s["konto"])
        print(f"--- STYL TERAPEUTY (karta, docs/ROZMOWA.md §0d): „{st['nazwa']}”{'' if st['wybrany'] else ' (domyślny – osoba nie wybrała)'} · {'; '.join(st['cechy'])} · zwroty: {' / '.join(st['zwroty'])} · nie: {'; '.join(st['nie_robi'])} · emotikony: {st['emotikony']}. To styl, nie osoba: bez imienia, biografii i udawanych uczuć ---")
        if STYLE_ZAWSZE:
            print(f"--- ZAWSZE, w każdym stylu: {STYLE_ZAWSZE} ---")
        cel = cel_konta(s["konto"])
        if cel.get("tekst"):
            oc = [o for o in cel.get("oceny") or [] if isinstance(o, dict)]
            print(f"--- CEL PRACY ({'uzgodniony' if cel.get('status') == 'uzgodniony' else 'propozycja – osoba jeszcze nie potwierdziła'}): „{cel['tekst']}”"
                  + (f" · oceny „na ile bliżej” 0–10: {', '.join(str(o.get('wartosc')) + ' (' + str(o.get('data', ''))[:10] + ')' for o in oc[-4:])}" if oc else "") + " ---")
        ns = notatka_superwizora(s["konto"])
        if ns and ns["aktywna"]:
            print(f"--- NOTATKA SUPERWIZORA ({str(ns.get('ts', ''))[:16].replace('T', ' ')}): „{ns['tekst']}” – uwzględnij w sposobie prowadzenia tej sesji; nie cytuj jej osobie ---")
        wyn = czytaj(kk / "cwiczenia.json", []) or []
        if wyn:
            print("--- ostatnie ćwiczenia: " + "; ".join(f"{x.get('nazwa')} ({str(x.get('ts', ''))[:10]})" for x in wyn[-3:] if isinstance(x, dict)) + " (konta/" + s["konto"] + "/cwiczenia.json) ---")
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
    se = sesja_info(s)
    cw = cwiczenie_stan(s)
    cw_akt = cw if cw and cw.get("status") == "trwa" else None
    zdarzenia = [w for w in s["nowe"] if w.get("typ") in ("sesja", "zadanie", "cel", "styl", "cwiczenie")]
    if zdarzenia and len(zdarzenia) == len(s["nowe"]) and maks < 2:
        ost = zdarzenia[-1]
        if ost.get("typ") == "cwiczenie":
            print(f"ĆWICZENIE PRZERWANE przyciskiem przez osobę ({(cw or {}).get('nazwa', '')}): jedno ciepłe zdanie bez nacisku („Jasne, zostawiamy to – możemy wrócić, kiedy zechcesz.”) i \"cwiczenie\": {{\"przerwij\": true}}. Bez pytania o powód.")
        elif ost.get("typ") == "styl":
            st = styl_konta(s.get("konto", ""))
            print(f"STYL ZMIENIONY przez osobę na „{st['nazwa']}”: jedno zdanie, które to nazywa i przyjmuje (np. „Dobrze – od teraz będę mówić {'bardziej wprost i konkretnie' if st['id'] == 'wprost' else 'spokojniej i więcej dopytywać' if st['id'] == 'spokojnie' else 'trochę lżej'}.”), od razu w nowym stylu; bez pytania o powód.")
        elif ost.get("typ") == "cel":
            if ost.get("akcja") == "ocena":
                print(f"PRZEGLĄD CELU – osoba oceniła „na ile bliżej” na {ost.get('wartosc')}/10, cel {'ten sam' if ost.get('ten_sam', True) else 'do zmiany'}: 1–2 zdania – co ta liczba mówi (bez oceniania), a przy zmianie celu zapytaj, jak brzmi teraz (potem pole \"cel\").")
            elif ost.get("akcja") == "zmiana":
                print(f"CEL ZMIENIONY przez osobę: „{ost.get('cel')}”. Krótko przyjmij jej słowa (1–2 zdania), bez poprawiania.")
            else:
                print("CEL PRZYJĘTY przez osobę: jedno zdanie potwierdzenia i powrót do rozmowy.")
        elif ost.get("typ") == "sesja" and ost.get("akcja") == "start":
            su = czytaj(KONTA / s["konto"] / "suwaki.json", []) if s.get("konto") else []
            naprawa = ""
            if su:
                t1 = int(su[-1].get("trafnosc") or 10)
                t0 = int(su[-2].get("trafnosc") or t1) if len(su) > 1 else t1
                if t1 <= 6 or t0 - t1 >= 3:
                    naprawa = f" NAPRAWA NAJPIERW: ostatnio „czy rozmowa była o tym, o czym chciał(a)” = {t1}/10 – zacznij od tego: nazwij, weź na siebie, zapytaj, co zrobić inaczej (SZTUKA-ROZMOWY §4 pkt 11)."
            print(f"SESJA {se['nr']} – OTWARCIE (docs/ROZMOWA.md §0c): jedna krótka wiadomość: most do poprzedniej sesji (zadanie z karty, jeśli jest – „jak poszło?”; bez oceny, gdy nie wyszło) albo do pamięci, i agenda: „O czym dziś najważniejsze?”. Bez panelu, bez \"wstepna\".{naprawa}")
            if s.get("konto"):
                cel = cel_konta(s["konto"])
                if not cel.get("tekst") and se["nr"] <= 3:
                    print("   CEL PRACY (docs/ROZMOWA.md §0d): jeszcze go nie ma – w tej sesji uzgodnij jedno zdanie słowami osoby („Nad czym chcesz ze mną pracować?”), potem pole \"cel\" (aplikacja pokaże kartę „Nad czym pracujemy” do potwierdzenia albo poprawy).")
                elif przeglad_celu_potrzebny(s["konto"], s) >= 4:
                    print(f"   PRZEGLĄD CELU (co 4 sesje): w tej odpowiedzi dodaj \"cel_przeglad\": true – aplikacja zapyta „Na ile jesteśmy bliżej (0–10)? Czy cel nadal ten sam?” przy celu „{cel.get('tekst')}”.")
        elif ost.get("typ") == "sesja" and ost.get("akcja") == "koniec":
            print(f"SESJA ZAKOŃCZONA przez osobę (suwaki: {ost.get('suwaki')}, termin: {ost.get('termin') or '—'}): 1–2 zdania pożegnania (podziękuj, nawiąż do zadania i terminu, „otwarte drzwi”), bez pytania. Potem OBOWIĄZKOWO przepisz pamięć `rozmowa.py pamiec` wg szablonu §0b (z sekcją Suwaki). Na koniec SUPERWIZJA: streszczenie sesji w ≤10 zdaniach + „co dobrze / co źle” od klienta‑sędziego → `rozmowa.py superwizja --rozmowa {s['id']} --plik streszczenie.md` (docs/ROZMOWA.md §0d).")
        else:
            print(f"ZADANIE – osoba kliknęła: {ost.get('status')}. Krótko (1–2 zdania): „Biorę” → konkret, kiedy i gdzie; „Zmieńmy” → zapytaj, co byłoby łatwiejsze, i zaproponuj mniejsze (pole \"zadanie\"); „Nie teraz” → bez nacisku; „zrobione/nie wyszło” → wzmocnienie albo „co stanęło na drodze?”. Bez panelu.")
        print(f"rozmowa.py odpowiedz --rozmowa {s['id']} --plik odp.json  (\"tempo\": \"krotko\")")
        return
    if se["aktywna"]:
        ja_sl, ty_sl = udzial_slow(s, se["start_n"])
        udz = round(100 * ty_sl / max(1, ja_sl + ty_sl))
        faza = faza_sesji(se, maks, ostatni_r(s))
        print(f"SESJA {se['nr']} · tura {se['tury'] + 1} · {se['minuty']} min · faza: {faza} · udział słów terapeuty {udz}% (cel ≤40%) (docs/ROZMOWA.md §0c)")
        if faza == "ZAMKNIĘCIE":
            print("   ZAMKNIĘCIE: podsumowanie w 2–3 zdaniach własnymi słowami osoby + JEDNO małe zadanie w polu \"zadanie\" (aplikacja pokaże kartę Biorę / Zmieńmy / Nie teraz) + zaproszenie, by zakończyć sesję przyciskiem.")
        if udz >= 50 and ja_sl + ty_sl > 150:
            print(f"   ZA DUŻO MÓWISZ: {udz}% słów w sesji to terapeuta – skróć, zostaw miejsce (tempo „słucham” albo jedno zdanie + pytanie).")
        if se["nr"] >= 3 and not any(z.get("obserwacja") for z in s["zespol"] if z.get("odpowiedz_na", 0) >= max(1, se["start_n"])) and faza == "PRACA" and se["tury"] >= 3:
            print("   OBSERWACJA (raz na sesję, od 3. sesji): zapytaj panel „jaki wzorzec widać w tej i poprzednich rozmowach, którego osoba sama nie nazwała?”; jeśli jest trafny – powiedz go tentatywnie, ze zdaniem własnym, bez etykiet, i wpisz w pole \"obserwacja\".")
    if cw_akt:
        c = CWICZENIA.get(cw_akt.get("id"), {})
        kroki = c.get("kroki", [])
        k = int(cw_akt.get("krok") or 0)
        tekst_n = bez_ogonkow(" ".join(str(w.get("tekst", "")) for w in s["nowe"] if w.get("typ", "wiadomosc") == "wiadomosc"))
        rmax = int(c.get("ryzyko_max", 1))
        if maks > rmax or maks >= 3 or (s["zespol"] and max(maks, ostatni_r(s)) > rmax):
            print(f"ĆWICZENIE „{cw_akt.get('nazwa')}” WSTRZYMAJ: sygnał ryzyka – najpierw bezpieczeństwo; w odp.json \"cwiczenie\": {{\"przerwij\": true}} (przy ≥3 skrypt przerwie je sam).")
        elif maks >= 2 and not re.search(NIE_TERAZ, tekst_n):
            print(f"ĆWICZENIE „{cw_akt.get('nazwa')}” MOŻE TRWAĆ (dozwolone przy ryzyku {rmax}), ale w tej odpowiedzi NAJPIERW łagodne pytanie wprost o myśli samobójcze, plan i środki (docs/BEZPIECZENSTWO.md §2); krok ćwiczenia dopiero po odpowiedzi.")
        elif re.search(NIE_TERAZ, tekst_n):
            print(f"ĆWICZENIE „{cw_akt.get('nazwa')}”: osoba chyba chce przerwać („nie teraz”) – przyjmij to bez nacisku i \"cwiczenie\": {{\"przerwij\": true}}.")
        elif k < len(kroki):
            nast = kroki[k + 1] if k + 1 < len(kroki) else None
            print(f"ĆWICZENIE „{cw_akt.get('nazwa')}” · krok {k + 1}/{len(kroki)} (docs/ROZMOWA.md §0d): osoba odpowiedziała na „{kroki[k]['etykieta']}”. W odp.json \"cwiczenie\": {{\"krok\": \"<jej odpowiedź jej słowami, krótko>\"}}"
                  + (f"; w tekście krótko odbij to, co powiedziała, i zadaj JEDNO pytanie następnego kroku – „{nast['etykieta']}” (propozycja: „{nast['pytanie']}”)." if nast else "; to OSTATNI krok – skrypt zamknie ćwiczenie i aplikacja pokaże kartę wyniku; w tekście 2–3 zdania podsumowania słowami osoby i co z tym dalej (zwykle zadanie przy zamknięciu sesji)."
                     + (f" Zakończenie (informacja zwrotna): „{c['zakonczenie']}”" if c.get("zakonczenie") else "")
                     + (" Eksperyment: jeśli w tej sesji nie ma jeszcze zadania, skrypt sam wpisze zadanie „sprawdzić przewidywanie”, a następna rozmowa zaczyna się od „Co się stało?”." if c.get("id") == "eksperyment" else "")))
            if c.get("nie_przy"):
                print(f"   NIE PRZY (wtedy przerwij ćwiczenie i wróć do rozmowy): {'; '.join(c['nie_przy'])}.")
            print(f"   Ćwiczenie idzie bez odpowiedzi wstępnej i bez pełnego panelu: strażnik + prowadzący, 1 krok = 1 pytanie, 20–80 słów → rozmowa.py odpowiedz --rozmowa {s['id']} --plik odp.json")
    elif s["nowe"] and maks < 2 and ostatni_r(s) < 2 and (not se["aktywna"] or faza_sesji(se, maks, ostatni_r(s)) == "PRACA"):
        print("ĆWICZENIA (za zgodą, docs/ROZMOWA.md §0d). Najpierw zapytaj i zaproponuj; start dopiero po zgodzie osoby: \"cwiczenie\": {\"start\": \"<id>\", \"zgoda\": \"<jej słowa zgody>\"} + pytanie 1. kroku.")
        for c in CWICZENIA.values():
            print(f"   {c['id']} – {c['nazwa']}: kiedy: {c.get('kiedy', '—')}" + (f" · NIE przy: {'; '.join(c['nie_przy'])}" if c.get("nie_przy") else ""))
        print("   Żadnego ćwiczenia: na wspomnieniu traumy lub przemocy, przy objawach psychotycznych, manii, intoksykacji, do oceniania osób trzecich.")
    pk = pekniecie(s)
    if pk and maks < 3:
        print(f"PĘKNIĘCIE? ({pk}) – najpierw naprawa: nazwij, co mogło nie zagrać, weź to na siebie, zapytaj, co zmienić (SZTUKA-ROZMOWY §4 pkt 11). Bez techniki w tej turze.")
    if maks >= 3:
        print("Filtr słownikowy: poziom ≥3. Aplikacja już pokazała kartę kryzysową z numerami. Strażnik ryzyka NAJPIERW; odpowiedź wg docs/BEZPIECZENSTWO.md (pytanie wprost, numery, kontakt z człowiekiem teraz). Obniżyć poziom można tylko z nowym faktem (pole obnizam_ryzyko).")
    elif maks == 2:
        print("Filtr słownikowy: sygnał pośredni poziomu 2 (bierne myśli o śmierci, pożegnanie, pragnienie połączenia ze zmarłym, zaniechanie leczenia „bo po co”, dostęp do środków). Strażnik ustala, o co chodzi; w odpowiedzi OBOWIĄZKOWO łagodne pytanie wprost o myśli samobójcze, plan i środki, jeden element planu bezpieczeństwa i numer pomocy. To nie jest skrypt kryzysowy.")
    odp_zesp = len({w.get("odpowiedz_na") for w in s["zespol"]})
    if odp_zesp and odp_zesp % 5 == 0 and maks < 2:
        print(f"INFORMACJA ZWROTNA (docs/SZTUKA-ROZMOWY.md §3): to {odp_zesp + 1}. tura – jeśli pasuje, na końcu krótko: „W skali 0–10: jak minął tydzień?” albo „Na ile te rozmowy pomagają?” (zamiast innego pytania).")
    if maks < 2 and s["zespol"] and int(s["zespol"][-1].get("ryzyko") or 0) >= 2:
        print(f"PAMIĘTAJ: poziom ryzyka z poprzedniej tury = {s['zespol'][-1].get('ryzyko')} – to dolna granica tej tury (obniża tylko nowy fakt). Jeśli osoba nie odpowiedziała na pytanie o plan i środki – wróć do niego łagodnie; jeśli odpowiedziała (także „nie mam”) – NIE pytaj ponownie, prowadź rozmowę dalej (decyzja Michała 1.11.2026).")
    if cw_akt and maks < 2:
        return  # w ćwiczeniu: krok po kroku, bez odpowiedzi wstępnej i bez wyboru tempa
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
        slucham_ost = [z.get("tempo") for z in s["zespol"][-2:]]
        slucham_mozna = False
        if maks == 0 and ostatni == 0 and pytan == 0 and slow_n >= 45 and not leki and slucham_ost != ["slucham", "slucham"]:
            slucham_mozna = True
            print("TEMPO MOŻE BYĆ: SŁUCHAM (docs/ROZMOWA.md §3a) – osoba jest w środku opowieści: jedno zdanie zachęty („Mhm. Mów dalej – co było potem?”), bez panelu i bez \"wstepna\"; \"tempo\": \"slucham\". Najwyżej 2 razy z rzędu.")
        if maks == 0 and ostatni == 0 and not namysl and not leki and slow_n <= 30 and pytan == 1:
            print(f"TEMPO: SZYBKO (docs/ROZMOWA.md §3a) – jedno proste pytanie przy ryzyku 0: strażnik + 1 podejście, odpowiedź 40–120 słów, bez sędziego. W odp.json \"tempo\": \"szybko\".")
        elif namysl:
            print(f"TEMPO: DO NAMYSŁU (docs/ROZMOWA.md §3a) – strażnik + panel 4–5 + źródła (PubMed, Europe PMC) + klient-sędzia; odpowiedź do ok. 450 słów. Pasek: rozmowa.py pracuje … --etap \"przemyśla dokładniej\". W odp.json \"tempo\": \"namysl\".")
        else:
            print("TEMPO: NORMALNIE (docs/ROZMOWA.md §3a) – strażnik + panel ≤4 + klient-sędzia, 80–220 słów.")
    wstepne = [x for x in s["zespol"] if x.get("wstepna") and x.get("odpowiedz_na", 0) > s["odp"]]
    if s["nowe"] and not krotka and maks < 3 and not wstepne and locals().get("slucham_mozna"):
        print("(Jeśli wybierasz SŁUCHAM – to jest cała odpowiedź tej tury; bez \"wstepna\" i bez panelu.)")
    if s["nowe"] and not krotka and maks < 3 and not wstepne:
        print(f"SZYBKO NAJPIERW (decyzja Michała 1.11.2026 15:43; docs/ROZMOWA.md §0a): zanim ruszy panel – prowadzący SAM, w kilka sekund, pisze 1–3 zdania: krótkie uznanie + jedno zagadujące/dopytujące pytanie; odp.json z \"wstepna\": true. Potem panel w tle, a pełna odpowiedź (bez \"wstepna\") uwzględnia też to, co osoba dopisze w międzyczasie.")
    elif wstepne:
        print("SZYBKA ODPOWIEDŹ JUŻ POSZŁA – teraz pełna opinia zespołu (bez \"wstepna\"); nie powtarzaj pytania z szybkiej odpowiedzi.")
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
        # osoba jeszcze pisze (docs/ROZMOWA.md §3a): wielokropek albo 2+ wiadomości w 60 s → odczekaj do 25 s od ostatniej
        teraz_s = time.time()
        def pisze(s):
            nw = [w for w in s["nowe"] if w.get("typ", "wiadomosc") == "wiadomosc"]
            if not nw or s["zwolania"]:
                return False
            ost = nw[-1]
            wiek = teraz_s - ts_sek(ost.get("ts"))
            if wiek >= 25 or wiek < 0 or int(ost.get("ryzykoLokalne") or 0) >= 2 or ryzyko_slownik(ost.get("tekst", ""))[0] >= 2:
                return False
            t = str(ost.get("tekst", "")).rstrip()
            return t.endswith(("...", "…")) or (len(nw) >= 2 and ts_sek(ost.get("ts")) - ts_sek(nw[-2].get("ts")) < 60)
        if gotowe and any(pisze(s) for s in gotowe) and time.time() + 2 < koniec:
            time.sleep(1.5)
            continue
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
    if d.get("wstepna"):
        nowe_f = max([max(int(w.get("ryzykoLokalne") or 0), ryzyko_slownik(w.get("tekst", ""))[0]) for w in s["nowe"]] or [0])
        if nowe_f >= 3 or d.get("kryzys"):
            sys.exit("Przy poziomie ≥3 / kryzysie nie ma szybkiej odpowiedzi wstępnej – od razu pełna odpowiedź bezpieczeństwa.")
        if len(tekst.split()) > 60 or len(czesci) > 1:
            sys.exit("Szybka odpowiedź wstępna: jedna wiadomość, najwyżej ok. 60 słów (docs/ROZMOWA.md §0a).")
        if "?" not in bez_cytatow(tekst):
            sys.exit("Szybka odpowiedź wstępna ma zagadać i dopytać – zakończ jednym pytaniem.")
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
    # po udokumentowanym obniżeniu (obnizam_ryzyko) historia liczy się dopiero od wiadomości po nim –
    # inaczej to samo dawne zdanie wymuszało obnizam_ryzyko w każdej kolejnej turze (uwaga z PC 1.11.2026)
    od = max([x.get("odpowiedz_na", 0) for x in s["zespol"] if x.get("obnizam_ryzyko")] or [0])
    historia = max([max(int(w.get("ryzykoLokalne") or 0), ryzyko_slownik(w.get("tekst", ""))[0]) for w in s["ja"] if w.get("n", 0) > od] or [0])
    dolna = max(filtr, poprzedni, historia)
    if ryz < dolna and not d.get("obnizam_ryzyko"):
        zrodlo = "filtr słownikowy" if dolna == filtr else ("poprzednia ocena strażnika" if dolna == poprzedni else "filtr wcześniejszych wiadomości")
        sys.exit(f"Dolna granica ryzyka w tej rozmowie to {dolna} ({zrodlo}), a odpowiedź ma {ryz}. Poziom obniża tylko strażnik z faktem: dodaj pole obnizam_ryzyko (wyraźne zaprzeczenie myśli samobójczych wystarcza, jeśli w rozmowie nie padły metoda, środki, plan ani samookaleczenie – docs/ROZMOWA.md §5).")
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
        ostrz.append("poziom 2 z wcześniejszych tur: jeśli pytanie o plan i środki nie dostało odpowiedzi – wróć do niego; jeśli osoba zaprzeczyła – nie pytaj ponownie")
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
    se = sesja_info(s)
    od_n = se["start_n"] if se["aktywna"] else 0
    if d.get("zadanie"):
        if any(z.get("zadanie") for z in s["zespol"] if z.get("odpowiedz_na", 0) >= max(1, od_n)) and not any(w.get("typ") == "zadanie" and w.get("status") == "zmienmy" and w.get("n", 0) > od_n for w in s["ja"]):
            sys.exit("Jedno zadanie na sesję (docs/ROZMOWA.md §0c). Drugie tylko po „Zmieńmy”.")
        if ryz >= 3:
            sys.exit("Przy poziomie ≥3 nie dajemy zadania – tylko tor bezpieczeństwa.")
    if d.get("obserwacja"):
        if any(z.get("obserwacja") for z in s["zespol"] if z.get("odpowiedz_na", 0) >= max(1, od_n)):
            sys.exit("Jedna obserwacja wzorca na sesję (docs/ROZMOWA.md §0c).")
        if se["nr"] < 3:
            ostrz.append("obserwacja wzorca przed 3. sesją – zwykle za wcześnie")
    if d.get("tempo") == "slucham":
        if len(tekst.split()) > 25 or len(czesci) > 1:
            sys.exit("Tempo „słucham”: jedno zdanie zachęty, najwyżej ok. 25 słów.")
        if [z.get("tempo") for z in s["zespol"][-2:]] == ["slucham", "slucham"]:
            sys.exit("Tempo „słucham” najwyżej 2 razy z rzędu – teraz pełniejsza odpowiedź.")
        if dolna >= 2:
            sys.exit("Przy poziomie ≥2 nie ma tempa „słucham”.")
    # ---------- 0.3.0 (docs/ROZMOWA.md §0d): ćwiczenie krok po kroku, cel pracy, styl ----------
    cw = cwiczenie_stan(s)
    cw_akt = cw if cw and cw.get("status") == "trwa" else None
    cw_zapis, wynik, cw_slad = None, None, None
    dc = d.get("cwiczenie")
    if dc is not None and not isinstance(dc, dict):
        sys.exit("Pole cwiczenie: obiekt {\"start\": \"<id>\", \"zgoda\": \"…\"} | {\"krok\": \"…\"} | {\"przerwij\": true}.")
    if dc and d.get("wstepna"):
        sys.exit("Ćwiczenie nie idzie odpowiedzią wstępną – jeden krok = jedna pełna odpowiedź.")
    if cw and cw.get("_z_przycisku"):
        cw_zapis = {k: v for k, v in cw.items() if not k.startswith("_")}
        cw_zapis["koniec_ts"] = teraz()
        cw_slad = {"przerwij": True}
    if dc and dc.get("start"):
        if cw_akt:
            sys.exit(f"Trwa ćwiczenie „{cw_akt.get('nazwa')}” – najpierw je dokończ albo przerwij (\"przerwij\": true).")
        c = CWICZENIA.get(str(dc["start"]))
        if not c:
            sys.exit(f"Nieznane ćwiczenie {dc['start']!r}. Dostępne: {', '.join(CWICZENIA)} (config/cwiczenia.json).")
        if d.get("kryzys") or max(ryz, dolna) > int(c.get("ryzyko_max", 1)):
            sys.exit(f"„{c['nazwa']}” tylko przy ryzyku ≤{c.get('ryzyko_max', 1)} – teraz najpierw bezpieczeństwo (docs/ROZMOWA.md §0d).")
        zg = bez_ogonkow(str(dc.get("zgoda") or "")).strip(" .!,")
        if len(zg) < 2 or zg not in bez_ogonkow(" ".join(str(w.get("tekst", "")) for w in s["nowe"])):
            sys.exit("Ćwiczenie tylko za zgodą: w polu cwiczenie.zgoda zacytuj słowa osoby z NOWEJ wiadomości, którymi się zgodziła (np. „tak, spróbujmy”). Najpierw zapytaj – zaproponuj – zapytaj (docs/ROZMOWA.md §0d).")
        if "?" not in bez_cytatow(tekst):
            sys.exit(f"Start ćwiczenia: zakończ pytaniem 1. kroku – „{c['kroki'][0]['etykieta']}”.")
        se_faza = faza_sesji(se, filtr, poprzedni)
        if se_faza and se_faza != "PRACA":
            ostrz.append(f"ćwiczenie w fazie {se_faza} – zwykle tylko w fazie pracy")
        cw_zapis = {"id": c["id"], "nazwa": c["nazwa"], "rozmowa": s["id"], "start_ts": teraz(), "start_na": max([w.get("n", 0) for w in s["ja"]] or [0]),
                    "krok": 0, "liczba_krokow": len(c["kroki"]), "odpowiedzi": {}, "status": "trwa"}
        cw_slad = {"start": c["id"]}
    elif dc and (dc.get("krok") is not None or dc.get("przerwij")):
        if not cw_akt and not (dc.get("przerwij") and cw and cw.get("_z_przycisku")):
            sys.exit("Nie ma trwającego ćwiczenia.")
    if dc and cw_akt and (dc.get("krok") is not None or dc.get("przerwij")):
        c = CWICZENIA.get(cw_akt.get("id"), {"kroki": [], "nazwa": cw_akt.get("nazwa")})
        cw_zapis = {k: v for k, v in cw_akt.items() if not k.startswith("_")}
        if dc.get("przerwij"):
            cw_zapis.update(status="przerwane", przerwal="terapeuta (na prośbę osoby albo z powodu ryzyka)", koniec_ts=teraz())
            cw_slad = {"przerwij": True}
        else:
            k = int(cw_akt.get("krok") or 0)
            kroki = c["kroki"]
            val = str(dc["krok"]).strip()[:300]
            if not val or k >= len(kroki):
                sys.exit("Pole cwiczenie.krok: odpowiedź osoby na bieżący krok (jej słowami, krótko).")
            if kroki[k].get("typ") == "skala" and not re.search(r"\d", val):
                ostrz.append(f"krok „{kroki[k]['etykieta']}” to skala – zapisz liczbę, którą podała osoba")
            cw_zapis["odpowiedzi"] = {**(cw_akt.get("odpowiedzi") or {}), kroki[k]["klucz"]: val}
            cw_zapis["krok"] = k + 1
            cw_slad = {"krok": k + 1}
            if k + 1 >= len(kroki):
                cw_zapis.update(status="zakonczone", koniec_ts=teraz())
                wynik = {"id": cw_zapis["id"], "nazwa": cw_zapis["nazwa"], "ts": teraz(),
                         "pola": [[x["etykieta"], cw_zapis["odpowiedzi"].get(x["klucz"], "")] for x in kroki]}
            elif "?" not in bez_cytatow(tekst):
                sys.exit(f"Następny krok ćwiczenia: zadaj JEDNO pytanie – „{kroki[k + 1]['etykieta']}”.")
    elif cw_akt and not d.get("wstepna"):
        ostrz.append(f"trwa ćwiczenie „{cw_akt.get('nazwa')}” – brak pola cwiczenie (krok / przerwij)")
    biez = cw_zapis or cw_akt
    if biez and biez.get("status") == "trwa" and (ryz > int(CWICZENIA.get(biez.get("id"), {}).get("ryzyko_max", 1)) or d.get("kryzys")):
        cw_zapis = {k: v for k, v in biez.items() if not k.startswith("_")}
        cw_zapis.update(status="przerwane", przerwal="skrypt – ryzyko wyższe niż pozwala ćwiczenie", koniec_ts=teraz())
        cw_slad, wynik = {"przerwij": True}, None
        ostrz.append("ćwiczenie przerwane automatycznie – ryzyko wyższe, niż pozwala to ćwiczenie")
    if d.get("cel") or d.get("cel_przeglad"):
        if not s.get("konto"):
            sys.exit("Cel pracy zapisuje się na koncie – ta rozmowa nie ma konta.")
        if ryz >= 3 or d.get("kryzys"):
            sys.exit("Przy poziomie ≥3 nie ustalamy celu – tylko tor bezpieczeństwa.")
        if d.get("cel_przeglad") and not d.get("cel") and cel_konta(s["konto"]).get("status") != "uzgodniony":
            sys.exit("Przegląd celu wymaga uzgodnionego celu (osoba kliknęła „To jest to”).")
    st = styl_konta(s.get("konto", ""))
    if (ryz >= 2 or d.get("kryzys")) and EMOJI.search(tekst):
        ostrz.append("ryzyko ≥2 / kryzys: bez emotikonów w każdym stylu – styl znika, mówimy spokojnie, krótko, wprost")
    elif st["emotikony"] == "nie" and EMOJI.search(tekst):
        ostrz.append(f"styl „{st['nazwa']}”: bez emotikonów w tekście (reakcja emotikonem jest wolna)")
    elif st["id"] == "cieplo" and len(EMOJI.findall(tekst)) > 1:
        ostrz.append("styl „Ciepło i z humorem”: najwyżej jeden emotikon w wiadomości")
    if ryz >= 1 and re.search(r"(\b(haha|hehe|żart\w*|xd+)\b|😂|😄|😆|🤣)", tekst, re.I):
        ostrz.append(f"styl „{st['nazwa']}”: bez humoru przy ryzyku ≥1")
    # nawiązania do pamięci: nie wolno wspominać niczego, czego nie ma w pamiec.md ani w historii (§0b)
    korpus = bez_ogonkow(" ".join(str(w.get("tekst", "")) for w in s["ja"]))
    if s.get("konto") and (KONTA / s["konto"] / "pamiec.md").is_file():
        korpus += " " + bez_ogonkow((KONTA / s["konto"] / "pamiec.md").read_text(encoding="utf-8"))
    for r_ in rozmowy_konta(s.get("konto", "")):
        if r_ != s["id"]:
            korpus += " " + bez_ogonkow(" ".join(str(w.get("tekst", "")) for w in (czytaj(ROZMOWY / r_ / "uzytkownik.json", {}) or {}).get("wiadomosci", []) if isinstance(w, dict)))
    for m in re.finditer(r"(pamietam,? ze|mowil[ae]?s,? ze|pisal[ae]?s,? ze|wspominal[ae]?s|nazwal[ae]?s|ostatnio (mowil|wspominal|pisal)\w*)([^–—.?!;]{0,90})", bez_ogonkow(bez_cytatow(tekst))):
        rdz = [x[:5] for x in re.findall(r"[a-z]{5,}", m.group(3))][:8]
        brak = [x for x in rdz if x not in korpus]
        if rdz and len(brak) > len(rdz) / 2:
            ostrz.append(f"nawiązanie „{m.group(0)[:60]}…” – nie widać tego w pamięci ani historii ({', '.join(brak)}); nie zmyślaj wspomnień")
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
    if d.get("wstepna"):
        w["wstepna"] = True
    for pole in ("zadanie", "obserwacja"):
        if d.get(pole):
            w[pole] = str(d[pole]).strip()[:400]
    if wynik and wynik.get("id") == "eksperyment" and not w.get("zadanie") and ryz < 3 \
            and not any(z.get("zadanie") for z in s["zespol"] if z.get("odpowiedz_na", 0) >= max(1, od_n)):
        odp_e = (cw_zapis or {}).get("odpowiedzi") or {}
        w["zadanie"] = (f"Sprawdzić przewidywanie: {odp_e.get('plan', 'mały krok z eksperymentu')}"[:300] + " – i zapisać, co się naprawdę stało.")
    if cw_slad:
        w["cwiczenie"] = {**cw_slad, "id": (cw_zapis or {}).get("id")}
    if wynik:
        w["wynik_cwiczenia"] = wynik
    if d.get("cel"):
        w["cel"] = str(d["cel"]).strip()[:200]
    if d.get("cel_przeglad"):
        w["cel_przeglad"] = True
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
    if d.get("wstepna"):
        zapisz(k / "pracuje.json", {"stan": "pracuje", "ts": teraz(), "panel": ["prowadzacy"], "etap": "zbiera opinie zespołu"})
    else:
        zapisz(k / "pracuje.json", {"stan": "czeka", "ts": teraz(), "panel": [], "etap": ""})
    if w.get("zadanie") and s.get("konto"):
        zapisz(KONTA / s["konto"] / "zadanie.json", {"tekst": w["zadanie"], "ts": w["ts"], "rozmowa": s["id"], "status": "zaproponowane"})
    if cw_zapis:
        zapisz(k / "cwiczenie.json", cw_zapis)
    if wynik and s.get("konto"):
        lw = czytaj(KONTA / s["konto"] / "cwiczenia.json", []) or []
        zapisz(KONTA / s["konto"] / "cwiczenia.json", (lw + [{**wynik, "rozmowa": s["id"]}])[-30:])
    if s.get("konto") and (w.get("cel") or w.get("cel_przeglad")):
        cel = cel_konta(s["konto"])
        if w.get("cel"):
            if cel.get("tekst") and cel.get("tekst") != w["cel"]:
                cel.setdefault("historia", []).append({"tekst": cel["tekst"], "do": w["ts"]})
            cel.update(tekst=w["cel"], status="propozycja", ts=w["ts"], rozmowa=s["id"], przeglad=False)
        if w.get("cel_przeglad"):
            cel["przeglad"] = True
        cel.setdefault("oceny", [])
        zapisz(KONTA / s["konto"] / "cel.json", cel)
    with open(k / "_log.jsonl", "a", encoding="utf-8") as f:
        f.write(json.dumps({"ts": w["ts"], "zdarzenie": "odpowiedz", "n": n, "na": na, "ryzyko": ryz, "filtr": filtr, "slow": slow,
                            "panel": [g["rola"] for g in glosy], "szwy": ostrz,
                            **{k: w[k] for k in ("wyzwalacze", "powod", "eksploracja", "flagi", "tempo") if k in w}}, ensure_ascii=False) + "\n")
    print(f"OK: odpowiedź #{n}{'–#' + str(w['n']) if len(seria) > 1 else ''} na wiadomość #{na} ({len(seria)} wiad., {slow} słów, ryzyko {ryz}).")
    if cw_zapis:
        print(f"ĆWICZENIE „{cw_zapis['nazwa']}”: {cw_zapis['status']}" + (f", krok {cw_zapis['krok']}/{cw_zapis.get('liczba_krokow')}" if cw_zapis["status"] == "trwa" else "") + (" – karta wyniku w rozmowie i w konta/…/cwiczenia.json" if wynik else ""))
    if ostrz:
        print(f"UWAGA (detektor szwów / granic): {ostrz} – sprawdź, czy jeden głos nie zdradza machinerii i nie łamie granic.")
    limit = {"slucham": 25, "krotko": 60, "szybko": 120, "namysl": 450}.get(str(d.get("tempo") or ""), 220)
    if cw_slad and not wynik:
        limit = 80
    limit = round(limit * float(st.get("dlugosc") or 1)) if d.get("tempo") != "slucham" else limit
    if slow > limit and not d.get("kryzys"):
        print(f"UWAGA: {slow} słów przy tempie „{d.get('tempo') or 'normalnie'}” (limit ok. {limit}; docs/ROZMOWA.md §3a). Treść bezpieczeństwa się nie liczy.")
    if slow > 90 and ryz >= 4:
        print(f"UWAGA: poziom 4 – {slow} słów; cel ≤80, tylko tor bezpieczeństwa (docs/ROZMOWA.md §5).")


def cmd_pamiec(a) -> None:
    s = stan(a.rozmowa)
    if not s.get("konto"):
        sys.exit("Ta rozmowa nie ma konta (meta.json bez \"konto\") – pamięci nie zapisuję.")
    t = Path(a.plik).read_text(encoding="utf-8").strip()
    if len(t) > 8000:
        sys.exit("Pamięć ma być zwięzła: najwyżej ok. 8000 znaków (docs/ROZMOWA.md §0b).")
    p = KONTA / s["konto"] / "pamiec.md"
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(t + f"\n\n*Zaktualizowano: {teraz()[:16].replace('T', ' ')} · rozmowa {s['id']}*\n", encoding="utf-8")
    print(f"OK: pamięć konta {s['konto']} zapisana ({len(t)} znaków).")


def cmd_superwizja(a) -> None:
    """Po sesji: superwizja/<konto>/<data>-sN.md – liczby sesji (realizm.py) + streszczenie prowadzącego (≤10 zdań)."""
    s = stan(a.rozmowa)
    if not s.get("konto"):
        sys.exit("Superwizja dotyczy sesji na koncie – ta rozmowa nie ma konta.")
    t = Path(a.plik).read_text(encoding="utf-8").strip()
    if not t:
        sys.exit("Puste streszczenie.")
    if len(t) > 4000:
        sys.exit("Streszczenie ma być krótkie: ≤10 zdań (najwyżej ok. 4000 znaków).")
    sys.path.insert(0, str(Path(__file__).resolve().parent))
    import realizm  # noqa: E402 – te same liczby co w raporcie realizmu
    sesje = [x for x in realizm.sesje_rozmowy(s["id"]) if x["rozmowa"] == s["id"]]
    if not sesje:
        sys.exit("W tej rozmowie nie było sesji („Zacznij sesję”).")
    se = sesje[-1]
    prof = czytaj(KONTA / s["konto"] / "profil.json", {}) or {}
    zd = len(re.findall(r"[.!?…](\s|$)", re.sub(r"^\s*[#*-].*$", "", t, flags=re.M)))
    zad = czytaj(KONTA / s["konto"] / "zadanie.json", {}) or {}
    cel = cel_konta(s["konto"])
    data = str(se.get("start") or teraz())[:10]
    lin = [f"# Superwizja · {prof.get('pseudonim') or s['konto']} ({prof.get('wiek') or '?'} l., {prof.get('plec') or '?'}) · sesja {se['nr_konta']} · {data}", "",
           f"Rozmowa `{s['id']}` · konto `{s['konto']}` · styl terapeuty: {styl_konta(s['konto'])['nazwa']}" + ("" if se.get("zakonczona") else " · **sesja jeszcze trwa**"), "",
           "## Liczby sesji (skrypty/realizm.py)", ""]
    lin += [f"- {x}" for x in realizm.opis_sesji(se)]
    lin += [f"- zadanie na koncie: „{zad.get('tekst')}” – {zad.get('status', '?')}" if zad.get("tekst") else "- zadanie: brak",
            f"- cel pracy: „{cel.get('tekst')}” ({cel.get('status')})" if cel.get("tekst") else "- cel pracy: jeszcze nie ustalony", "",
            "## Streszczenie sesji (psychoterapeuta AI) i ocena klienta‑sędziego", "", t, "",
            "## Notatka superwizora", "",
            "_Dopisuje Michał: w aplikacji 👤 konto → „Superwizja”, albo `python skrypty/rozmowa.py notatka --konto " + s["konto"] + " --tekst \"…\"`. Psychoterapeuta AI dostanie ją przed następną sesją._", ""]
    nr = se["nr_konta"]
    p = SUPERWIZJA / s["konto"] / f"{data}-s{nr}.md"
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text("\n".join(lin), encoding="utf-8")
    print(f"OK: superwizja zapisana: {p.relative_to(KORZEN)}")
    if zd > 12:
        print(f"UWAGA: streszczenie ma ok. {zd} zdań – cel ≤10.")


def cmd_notatka(a) -> None:
    """Notatka superwizora (Michał): 2–3 zdania, które psychoterapeuta AI uwzględni w następnej sesji."""
    if not re.fullmatch(r"k[a-z0-9]{5}", a.konto or "") or not (KONTA / a.konto / "profil.json").is_file():
        sys.exit(f"Nie ma konta {a.konto!r} (konta/<konto>/profil.json).")
    t = (a.tekst or "").strip()
    if not t or len(t) > 600:
        sys.exit("Notatka: 1–3 zdania, najwyżej 600 znaków.")
    zapisz(SUPERWIZJA / a.konto / "notatka.json", {"tekst": t, "ts": teraz(), "autor": "superwizor"})
    print(f"OK: notatka superwizora dla konta {a.konto} – psychoterapeuta AI zobaczy ją w `czekaj` do końca następnej sesji.")


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
    c = sub.add_parser("pamiec"); c.add_argument("--rozmowa", required=True); c.add_argument("--plik", required=True); c.set_defaults(f=cmd_pamiec)
    c = sub.add_parser("formulacja"); c.add_argument("--rozmowa", required=True); c.add_argument("--plik", required=True); c.set_defaults(f=cmd_formulacja)
    c = sub.add_parser("historia"); c.add_argument("--rozmowa", required=True); c.set_defaults(f=cmd_historia)
    c = sub.add_parser("superwizja"); c.add_argument("--rozmowa", required=True); c.add_argument("--plik", required=True); c.set_defaults(f=cmd_superwizja)
    c = sub.add_parser("notatka"); c.add_argument("--konto", required=True); c.add_argument("--tekst", required=True); c.set_defaults(f=cmd_notatka)
    a = ap.parse_args()
    a.f(a)


if __name__ == "__main__":
    main()
