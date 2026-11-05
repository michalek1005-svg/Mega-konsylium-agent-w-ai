#!/usr/bin/env python3
"""
Jedno klikalne pytanie konsylium do lekarza prowadzącego, rozstrzygające spór (ankieta zmian 1.11.2026: „Tak”; wzór MAI-DxO).

Kiedy: po rundzie dyskusji spór o rozpoznanie nr 1 trwa, a lekarze zgodnie wskazują JEDNĄ informację, która go rozstrzygnie
(objaw, wynik, okoliczność). Najwyżej 2 pytania na sprawę. Pytanie zamknięte, bez sugerowania rozpoznania.

  python skrypty/pytanie_lekarza.py sprawy/<ID> --id P1 --tekst "Czy ból promieniuje do pleców?" --bo "rozstrzyga tętniak wobec kolki" [--opcje "tak|nie|nie wiem"] [--czekaj 600]

Aplikacja pokazuje kartę z przyciskami nad sceną; kliknięcie dopisuje odpowiedź do sprawy/<ID>/uwagi-lekarza.jsonl
(pola pytanie_id, odpowiedz). Z --czekaj skrypt czeka na odpowiedź (domyślnie 600 s) i ją wypisuje;
brak odpowiedzi = „NIEZNANE” (konsylium idzie dalej, informacja trafia do CZEGO NIE WIEMY).
Odpowiedź ma rangę odpowiedzi z wywiadu: dopisz ją do 01-wywiad.md z godziną.
"""
from __future__ import annotations

import argparse
import json
import time
from datetime import datetime, timezone
from pathlib import Path


def odpowiedz(sprawa: Path, pid: str) -> str | None:
    p = sprawa / "uwagi-lekarza.jsonl"
    if not p.exists():
        return None
    for linia in p.read_text(encoding="utf-8").splitlines():
        try:
            z = json.loads(linia)
        except json.JSONDecodeError:
            continue
        if str(z.get("pytanie_id")) == pid:
            return str(z.get("odpowiedz") or z.get("skrot") or "")
    return None


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("sprawa", type=Path)
    ap.add_argument("--id", required=True, help="P1, P2…")
    ap.add_argument("--tekst", help="treść pytania (≤200 znaków); bez niej skrypt tylko sprawdza/czeka na odpowiedź")
    ap.add_argument("--bo", default="", help="dlaczego pytamy (≤160 znaków)")
    ap.add_argument("--opcje", default="tak|nie|nie wiem", help='opcje rozdzielone „|” (2–5)')
    ap.add_argument("--czekaj", type=int, nargs="?", const=600, default=0, help="czekaj na odpowiedź do N s (domyślnie 600)")
    a = ap.parse_args()
    if not a.sprawa.is_dir():
        raise SystemExit(f"Nie ma katalogu sprawy: {a.sprawa}")
    if a.tekst:
        opcje = [o.strip() for o in a.opcje.split("|") if o.strip()][:5]
        if len(opcje) < 2:
            raise SystemExit("Podaj co najmniej 2 opcje.")
        w = {"ts": datetime.now(timezone.utc).isoformat(timespec="seconds"), "zdarzenie": "pytanie", "id": a.id,
             "tekst": " ".join(a.tekst.split())[:200], "opcje": opcje}
        if a.bo:
            w["bo"] = " ".join(a.bo.split())[:160]
        with open(a.sprawa / "_log.jsonl", "a", encoding="utf-8") as f:
            f.write(json.dumps(w, ensure_ascii=False) + "\n")
        print(f"Pytanie {a.id} w Pokoju: {w['tekst']}  [{' / '.join(opcje)}]")
    koniec = time.time() + max(0, a.czekaj)
    while True:
        o = odpowiedz(a.sprawa, a.id)
        if o is not None:
            print(f"ODPOWIEDŹ {a.id}: {o}")
            return
        if time.time() >= koniec:
            print(f"ODPOWIEDŹ {a.id}: NIEZNANE (brak odpowiedzi)")
            return
        time.sleep(2)


if __name__ == "__main__":
    main()
