#!/usr/bin/env python3
"""
Źródła poza PubMed + wspólna biblioteka sprawy (sprawy/<ID>/_biblioteka.jsonl).
Ustalenia Innowacyjnego i Merytorycznego 1.11.2026 (konsylium/ZRODLA-POZA-PUBMED.md); tylko biblioteka standardowa.

  python skrypty/zrodla.py sprawy/<ID> lokalne "dna moczanowa"          # najpierw: zrodla/ (polskie wytyczne, karty z MANIFEST)
  python skrypty/zrodla.py sprawy/<ID> rpl Metforminum                   # Rejestr Produktów Leczniczych (INN po łacinie albo --nazwa Metformax)
  python skrypty/zrodla.py sprawy/<ID> fda metformin [--sekcje drug_interactions,contraindications]   # openFDA drug label (poziom 3: „wg FDA; sprawdzić z ChPL”)
  python skrypty/zrodla.py sprawy/<ID> dodaj --typ pubmed --id 31749148 --tytul "…" --rok 2020 --cytat "…" --kto farmakolog
  python skrypty/zrodla.py sprawy/<ID> lista                             # co już jest w bibliotece sprawy (żeby nie szukać dwa razy)

ClinicalTrials.gov: konektor MCP Clinical_Trials (search_trials z location="Poland") – wynik zapisz przez „dodaj --typ trial --id NCT…”.
Każdy wpis biblioteki ma id; agenci cytują [PMID …], [RPL: …], [FDA label: …], [NCT…], [zrodla/<plik>].
Bez sieci (albo przy błędzie) skrypt mówi to wprost i kończy się kodem 2 – wtedy etykieta [wiedza modelu, niezweryfikowane].
"""
from __future__ import annotations

import argparse
import json
import re
import sys
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
UA = {"User-Agent": "MS-Konsylium/0.6 (narzedzie testowe; kontakt: lokalnie)"}


def teraz() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def _kontekst_ssl():
    """Weryfikacja certyfikatów zawsze włączona. Kolejno: magazyn systemu (truststore), certifi, domyślny."""
    import ssl
    try:
        import truststore  # type: ignore
        return truststore.SSLContext(ssl.PROTOCOL_TLS_CLIENT)
    except Exception:  # noqa: BLE001
        pass
    try:
        import certifi  # type: ignore
        return ssl.create_default_context(cafile=certifi.where())
    except Exception:  # noqa: BLE001
        return ssl.create_default_context()


def _przez_powershell(url: str) -> dict | None:
    """Windows: Invoke-RestMethod korzysta z magazynu certyfikatów Windows, który sam dociąga brakujący
    certyfikat pośredni (RPL na PC Michała: CERTIFICATE_VERIFY_FAILED w Pythonie 3.12). Weryfikacja zostaje włączona."""
    import os
    import subprocess
    if os.name != "nt":
        return None
    cmd = ("[Console]::OutputEncoding=[Text.Encoding]::UTF8; "
           f"(Invoke-WebRequest -UseBasicParsing -TimeoutSec 25 -Uri '{url}' -Headers @{{'Accept'='application/json'}}).Content")
    try:
        r = subprocess.run(["powershell", "-NoProfile", "-Command", cmd], capture_output=True, timeout=40)
        if r.returncode == 0 and r.stdout.strip():
            return json.loads(r.stdout.decode("utf-8-sig"))
    except Exception:  # noqa: BLE001
        return None
    return None


def pobierz(url: str) -> dict:
    blad = None
    try:
        with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=20, context=_kontekst_ssl()) as r:
            return json.loads(r.read().decode("utf-8"))
    except Exception as e:  # noqa: BLE001
        blad = e
    d = _przez_powershell(url)
    if d is not None:
        return d
    print(f"Źródło niedostępne ({blad.__class__.__name__}: {blad}). Użyj etykiety [wiedza modelu, niezweryfikowane].", file=sys.stderr)
    sys.exit(2)


def biblioteka(sprawa: Path) -> list[dict]:
    p = sprawa / "_biblioteka.jsonl"
    if not p.exists():
        return []
    out = []
    for l in p.read_text(encoding="utf-8").splitlines():
        try:
            out.append(json.loads(l))
        except json.JSONDecodeError:
            pass
    return out


def zapisz(sprawa: Path, wpis: dict) -> None:
    if any(w.get("typ") == wpis["typ"] and w.get("id") == wpis["id"] for w in biblioteka(sprawa)):
        return
    wpis = {"czas": teraz(), **wpis}
    with open(sprawa / "_biblioteka.jsonl", "a", encoding="utf-8") as f:
        f.write(json.dumps(wpis, ensure_ascii=False) + "\n")


def lokalne(sprawa: Path, q: str, kto: str) -> None:
    slowa = [w for w in re.findall(r"\w+", q.lower()) if len(w) >= 3]
    wyniki = []
    for p in sorted((ROOT / "zrodla").rglob("*.md")):
        if p.name.upper().startswith("MANIFEST"):
            continue
        t = p.read_text(encoding="utf-8", errors="replace")
        lo = t.lower()
        traf = sum(lo.count(w[:6]) for w in slowa)
        if traf:
            tytul = next((l.lstrip("# ").strip() for l in t.splitlines() if l.startswith("#")), p.stem)
            wyniki.append((traf, p, tytul))
    wyniki.sort(key=lambda x: -x[0])
    if not wyniki:
        print(f"zrodla/: brak karty dla „{q}”. Zapisz w opinii: BRAK_PL: {q}")
        return
    for traf, p, tytul in wyniki[:5]:
        rel = p.relative_to(ROOT).as_posix()
        print(f"[{rel}] {tytul}  (trafień: {traf})")
        zapisz(sprawa, {"typ": "lokalne", "id": rel, "tytul": tytul, "kto_pobral": kto})


def rpl(sprawa: Path, inn: str | None, nazwa: str | None, kto: str) -> None:
    q = {"size": "10"}
    if nazwa:
        q["name"] = nazwa
    else:
        q["commonName"] = inn
    d = pobierz("https://rejestrymedyczne.ezdrowie.gov.pl/api/rpl/medicinal-products/search/public?" + urllib.parse.urlencode(q))
    lista = d.get("content") or d.get("items") or (d if isinstance(d, list) else [])
    if not lista:
        print("RPL: brak wyników. Uwaga: commonName to INN po łacinie (Metforminum, nie metformina).")
        return
    for x in lista[:10]:
        opis = f"{x.get('medicinalProductName')} · {x.get('commonName')} · {x.get('pharmaceuticalFormName') or x.get('pharmaceuticalForm') or ''} · {x.get('medicinalProductPower') or ''}"
        print(f"[RPL: {x.get('medicinalProductName')}] {opis}")
        zapisz(sprawa, {"typ": "rpl", "id": str(x.get("id") or x.get("medicinalProductName")), "tytul": opis, "kto_pobral": kto})


def fda(sprawa: Path, generic: str, sekcje: list[str], kto: str) -> None:
    d = pobierz("https://api.fda.gov/drug/label.json?" + urllib.parse.urlencode({"search": f"openfda.generic_name:{generic}", "limit": "1"}))
    wyn = (d.get("results") or [None])[0]
    if not wyn:
        print("openFDA: brak etykiety.")
        return
    for s in sekcje:
        tekst = " ".join(wyn.get(s) or [])
        if tekst:
            tekst = re.sub(r"\s+", " ", tekst)[:1500]
            print(f"[FDA label: {generic}, {s}] {tekst}\n")
    zapisz(sprawa, {"typ": "fda", "id": f"{generic}:{wyn.get('set_id', '')}", "tytul": f"FDA label {generic}", "kto_pobral": kto,
                    "cytat": "wg FDA; dawki sprawdzić z ChPL"})


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("sprawa", type=Path)
    ap.add_argument("tryb", choices=["lokalne", "rpl", "fda", "dodaj", "lista"])
    ap.add_argument("zapytanie", nargs="?")
    ap.add_argument("--nazwa"); ap.add_argument("--kto", default="")
    ap.add_argument("--sekcje", default="boxed_warning,contraindications,drug_interactions,use_in_specific_populations")
    ap.add_argument("--typ"); ap.add_argument("--id"); ap.add_argument("--tytul", default=""); ap.add_argument("--rok", default="")
    ap.add_argument("--cytat", default="")
    a = ap.parse_args()
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    if not a.sprawa.is_dir():
        sys.exit(f"Nie ma katalogu sprawy: {a.sprawa}")
    if a.tryb == "lokalne":
        lokalne(a.sprawa, a.zapytanie or "", a.kto)
    elif a.tryb == "rpl":
        if not (a.zapytanie or a.nazwa):
            sys.exit("Podaj INN po łacinie albo --nazwa")
        rpl(a.sprawa, a.zapytanie, a.nazwa, a.kto)
    elif a.tryb == "fda":
        fda(a.sprawa, a.zapytanie or "", [s.strip() for s in a.sekcje.split(",") if s.strip()], a.kto)
    elif a.tryb == "dodaj":
        if not (a.typ and a.id):
            sys.exit("dodaj wymaga --typ i --id")
        zapisz(a.sprawa, {"typ": a.typ, "id": a.id, "tytul": a.tytul, "rok": a.rok, "cytat": a.cytat[:500], "kto_pobral": a.kto})
        print(f"Dodano do biblioteki sprawy: {a.typ} {a.id}")
    else:
        for w in biblioteka(a.sprawa):
            print(f"{w.get('typ'):8} {w.get('id')}  {w.get('tytul', '')[:90]}  ({w.get('kto_pobral', '')})")


if __name__ == "__main__":
    main()
