#!/usr/bin/env python3
"""
Wywiad na żywo (MS Konsylium Narzędzia ↔ Claude) — protokół: docs/NA-ZYWO.md.

Aplikacja na Windows zapisuje zanonimizowany stan wywiadu do  wywiad-na-zywo/<KOD>/stan.json,
Claude dopisuje pytania do  wywiad-na-zywo/<KOD>/ankieta.json  (ms-ankieta-1 + "wersja", "koniec").
Na koniec aplikacja zapisuje  wywiad-na-zywo/<KOD>/01-wywiad.md  i Claude zaczyna konsylium.

Użycie (z katalogu repo Konsylium; na Windows „python”, gdzie indziej „python3”):
  python skrypty/wywiad_na_zywo.py czekaj                 # czeka na nowy stan najnowszego wywiadu (do 9 min)
  python skrypty/wywiad_na_zywo.py czekaj --kod ABC-123 --po 7
  python skrypty/wywiad_na_zywo.py pokaz --kod ABC-123    # bieżący stan bez czekania
  python skrypty/wywiad_na_zywo.py dodaj --kod ABC-123 --pytania nowe.json [--flagi flagi.json] [--tytul "…"] [--koniec]
  python skrypty/wywiad_na_zywo.py zakoncz --kod ABC-123  # „koniec”: true bez nowych pytań

Plik --pytania: lista pytań w formacie ms-ankieta-1 (narzedzia/wywiad/FORMAT-ANKIETY.md) albo obiekt {"pytania": […], "flagi": […]}.
Pytania wolno tylko dopisywać: skrypt odrzuca powtórzone id i nie usuwa niczego z ankiety.
"""
from __future__ import annotations

import argparse
import json
import os
import re
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

KATALOG = "wywiad-na-zywo"
TYPY = {"jeden", "wiele", "skala", "liczba", "tekst"}


def korzen() -> Path:
    tu = Path.cwd()
    for p in [tu, *tu.parents]:
        if (p / KATALOG).is_dir() or (p / "CLAUDE.md").is_file():
            return p
    return tu


def katalog_wywiadu(kod: str | None) -> Path | None:
    baza = korzen() / KATALOG
    if kod:
        return baza / kod
    if not baza.is_dir():
        return None
    kand = [d for d in baza.iterdir() if d.is_dir() and (d / "stan.json").is_file()]
    return max(kand, key=lambda d: (d / "stan.json").stat().st_mtime) if kand else None


def czytaj_json(p: Path):
    for _ in range(5):
        try:
            return json.loads(p.read_text(encoding="utf-8"))
        except FileNotFoundError:
            return None
        except (json.JSONDecodeError, PermissionError):
            time.sleep(0.2)  # aplikacja właśnie zapisuje
    return None


def zapisz_json(p: Path, dane) -> None:
    p.parent.mkdir(parents=True, exist_ok=True)
    tmp = p.with_name(p.name + f".{os.getpid()}.tmp")
    tmp.write_text(json.dumps(dane, ensure_ascii=False, indent=2), encoding="utf-8")
    for i in range(10):
        try:
            os.replace(tmp, p)
            return
        except PermissionError:
            time.sleep(0.1 * (i + 1))
    os.replace(tmp, p)


def podsumuj(kat: Path, stan: dict) -> str:
    l = [f"# Wywiad na żywo {stan.get('kod')} · stan nr {stan.get('numer')} · {stan.get('etap')}",
         f"katalog: {kat}"]
    if stan.get("czekaNaPytania"):
        l.append("!! PACJENT CZEKA NA PYTANIA — dopisz kolejne (dodaj) albo zakończ (zakoncz).")
    elif stan.get("etap") == "pytania":
        l.append(f"Pacjent odpowiada; w kolejce zostało pytań: {stan.get('pozostaloPytan')}. Możesz dopisać kolejne, zanim skończy.")
    if stan.get("etap") == "wyslano" or (kat / "01-wywiad.md").is_file():
        l.append(f"Wywiad wysłany: {kat / '01-wywiad.md'} — zacznij konsylium (docs/NA-ZYWO.md, krok 4).")
    l.append(f"ankieta: wersja {stan.get('ankietaWersja')}" + (" · lekarz zakończył ręcznie" if stan.get("zakonczonoRecznie") else ""))
    fl = stan.get("flagi") or []
    l.append("flagi: " + ("; ".join(f"[{f.get('poziom')}] {f.get('dlaLekarza')}" for f in fl) if fl else "brak"))
    l.append("")
    l.append("## Odpowiedzi")
    for o in stan.get("odpowiedzi") or []:
        l.append(f"- {o.get('id')}: {o.get('krotko') or o.get('pytanie')} → {o.get('odpowiedz')}")
    for o in stan.get("zOpisu") or []:
        l.append(f"- {o.get('id')} (z opisu): {o.get('krotko')} → {o.get('odpowiedz')}")
    if stan.get("wyniki"):
        l.append("")
        l.append(f"## Wyniki badań: {len(stan['wyniki'])} (pełny tekst w stan.json → wyniki)")
    bledy = czytaj_json(kat / "bledy.json") or {}
    if bledy.get("bledy"):
        l.append("")
        l.append("## Aplikacja odrzuciła ankietę.json:")
        l += [f"- {b}" for b in bledy["bledy"]]
    return "\n".join(l)


def cmd_czekaj(a) -> int:
    koniec = time.time() + a.limit
    while True:
        kat = katalog_wywiadu(a.kod)
        stan = czytaj_json(kat / "stan.json") if kat else None
        if stan and int(stan.get("numer") or 0) > a.po:
            print(podsumuj(kat, stan))
            return 0
        if time.time() > koniec:
            print("Brak nowego stanu w czasie " + str(a.limit) + " s. Uruchom „czekaj” ponownie." +
                  (f" Ostatni stan: nr {stan.get('numer')}, etap {stan.get('etap')}." if stan else " Nie ma jeszcze żadnego wywiadu."))
            return 2
        time.sleep(0.7)


def cmd_pokaz(a) -> int:
    kat = katalog_wywiadu(a.kod)
    stan = czytaj_json(kat / "stan.json") if kat else None
    if not stan:
        print("Nie ma jeszcze stanu wywiadu.")
        return 1
    print(podsumuj(kat, stan))
    return 0


def sprawdz_pytanie(q: dict) -> list[str]:
    b = []
    if not isinstance(q, dict) or not re.fullmatch(r"[a-z0-9_]{1,40}", str(q.get("id", ""))) or q.get("id") == "opis":
        return [f"zły id: {q.get('id') if isinstance(q, dict) else q!r}"]
    if q.get("typ") not in TYPY:
        b.append(f"{q['id']}: typ musi być jednym z {sorted(TYPY)}")
    if not str(q.get("tekst", "")).strip():
        b.append(f"{q['id']}: brak tekstu")
    if q.get("typ") in ("jeden", "wiele") and not (isinstance(q.get("opcje"), list) and 2 <= len(q["opcje"]) <= 12):
        b.append(f"{q['id']}: od 2 do 12 opcji")
    return b


def cmd_dodaj(a) -> int:
    kat = katalog_wywiadu(a.kod)
    if not kat:
        sys.exit("Nie ma wywiadu na żywo. Podaj --kod.")
    stan = czytaj_json(kat / "stan.json") or {}
    ank = czytaj_json(kat / "ankieta.json") or {"format": "ms-ankieta-1", "kod": stan.get("kod") or kat.name,
                                                 "tytul": "Pytania dla Ciebie", "opis": "", "pytania": [], "flagi": []}
    nowe, flagi = [], []
    if a.pytania:
        d = json.loads(Path(a.pytania).read_text(encoding="utf-8"))
        nowe = d if isinstance(d, list) else d.get("pytania", [])
        flagi = [] if isinstance(d, list) else d.get("flagi", [])
    if a.flagi:
        flagi += json.loads(Path(a.flagi).read_text(encoding="utf-8"))
    ids = {q["id"] for q in ank["pytania"]}
    bledy = []
    for q in nowe:
        bledy += sprawdz_pytanie(q)
        if isinstance(q, dict) and q.get("id") in ids:
            bledy.append(f"{q['id']}: takie pytanie już jest (pytania wolno tylko dopisywać)")
        ids.add(q.get("id") if isinstance(q, dict) else None)
    for f in flagi:
        if not isinstance(f, dict) or f.get("poziom") not in ("112", "pilne") or not f.get("gdy") or not f.get("dlaLekarza"):
            bledy.append(f"zła flaga: {f}")
    if bledy:
        print("Nie zapisano. Błędy:\n- " + "\n- ".join(bledy))
        return 1
    ank["pytania"] += nowe
    ank["flagi"] = (ank.get("flagi") or []) + flagi
    if a.tytul:
        ank["tytul"] = a.tytul
    ank["wersja"] = int(ank.get("wersja") or 0) + 1
    ank["koniec"] = bool(a.koniec)
    ank["zapisano"] = datetime.now(timezone.utc).isoformat(timespec="seconds")
    zapisz_json(kat / "ankieta.json", ank)
    print(f"ankieta.json wersja {ank['wersja']}: pytań {len(ank['pytania'])} (+{len(nowe)}), flag {len(ank['flagi'])}" +
          (" · KONIEC pytań" if a.koniec else "") + f". Ostatni stan aplikacji: nr {stan.get('numer')}.")
    return 0


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    c = sub.add_parser("czekaj"); c.add_argument("--kod"); c.add_argument("--po", type=int, default=0); c.add_argument("--limit", type=int, default=540)
    p = sub.add_parser("pokaz"); p.add_argument("--kod")
    d = sub.add_parser("dodaj"); d.add_argument("--kod"); d.add_argument("--pytania"); d.add_argument("--flagi"); d.add_argument("--tytul"); d.add_argument("--koniec", action="store_true")
    z = sub.add_parser("zakoncz"); z.add_argument("--kod")
    a = ap.parse_args()
    if a.cmd == "czekaj":
        return cmd_czekaj(a)
    if a.cmd == "pokaz":
        return cmd_pokaz(a)
    if a.cmd == "zakoncz":
        a.pytania = a.flagi = a.tytul = None; a.koniec = True
    return cmd_dodaj(a)


if __name__ == "__main__":
    sys.exit(main())
