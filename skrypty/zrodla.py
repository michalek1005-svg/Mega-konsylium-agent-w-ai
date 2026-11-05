#!/usr/bin/env python3
"""
Źródła poza PubMed + wspólna biblioteka sprawy (sprawy/<ID>/_biblioteka.jsonl).
Ustalenia Innowacyjnego i Merytorycznego 1.11.2026 (konsylium/ZRODLA-POZA-PUBMED.md); tylko biblioteka standardowa.

  python skrypty/zrodla.py sprawy/<ID> lokalne "dna moczanowa"          # najpierw: zrodla/ (polskie wytyczne, karty z MANIFEST)
  python skrypty/zrodla.py sprawy/<ID> rpl Metforminum                   # Rejestr Produktów Leczniczych (INN po łacinie albo --nazwa Metformax)
  python skrypty/zrodla.py sprawy/<ID> chpl "Metformax; Mounjaro; Bisocard"   # ChPL z RPL dla KAŻDEGO leku z wywiadu → sprawy/<ID>/_chpl/
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


def _plik_przez_powershell(url: str, cel: Path) -> bool:
    import os
    import subprocess
    if os.name != "nt":
        return False
    cmd = f"Invoke-WebRequest -UseBasicParsing -TimeoutSec 40 -Uri '{url}' -OutFile '{cel}'"
    try:
        r = subprocess.run(["powershell", "-NoProfile", "-Command", cmd], capture_output=True, timeout=60)
        return r.returncode == 0 and cel.exists() and cel.stat().st_size > 0
    except Exception:  # noqa: BLE001
        return False


def pobierz_plik(url: str, cel: Path) -> bool:
    """Plik binarny (ChPL to zwykle PDF). True, gdy zapisano."""
    try:
        with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=40, context=_kontekst_ssl()) as r:
            dane = r.read()
        if dane:
            cel.write_bytes(dane)
            return True
    except Exception:  # noqa: BLE001
        pass
    return _plik_przez_powershell(url, cel)


def pobierz(url: str, wymagane: bool = True) -> dict | None:
    blad = None
    try:
        with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=20, context=_kontekst_ssl()) as r:
            return json.loads(r.read().decode("utf-8"))
    except Exception as e:  # noqa: BLE001
        blad = e
    d = _przez_powershell(url)
    if d is not None:
        return d
    if not wymagane:
        return None
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


STOP_LOKALNE = {"leczenie", "leczenia", "rozpoznanie", "diagnostyka", "wytyczne", "wytyczna", "zalecenia", "postępowanie", "pacjent",
                "pacjenta", "dorosłych", "dorosły", "przewlekła", "przewlekły", "ostra", "ostry", "choroba", "choroby", "zespół", "objawy",
                "polska", "polskie", "poz", "and", "the", "oraz", "przy", "dla", "bez", "lub", "albo", "jak"}


def lokalne(sprawa: Path, q: str, kto: str) -> None:
    # pomiar 2.11.2026: dawne liczenie każdego rdzenia w całym tekście dopisywało do biblioteki 11 kart niezwiązanych ze sprawą
    slowa = sorted({w[:6] for w in re.findall(r"\w+", q.lower()) if len(w) >= 3 and w not in STOP_LOKALNE})
    # wiersze MANIFEST.md (po polsku: „co to”, zakres) – karty bywają po angielsku
    opisy = {}
    man = ROOT / "zrodla" / "MANIFEST.md"
    if man.exists():
        for l in man.read_text(encoding="utf-8", errors="replace").splitlines():
            m = re.match(r"^\|\s*([\w.\-/]+\.md)\s*\|(.*)$", l)
            if m:
                opisy[m.group(1)] = m.group(2).lower()
    jest = lambda w, t: re.search(r"(?<!\w)" + re.escape(w), t) is not None  # noqa: E731 – początek słowa, nie środek („dna” ≠ „jednak”)
    if not slowa:
        print(f"zrodla/: zapytanie „{q}” bez słów kluczowych (podaj nazwę problemu, np. „dna moczanowa”).")
        return
    wyniki = []
    for p in sorted((ROOT / "zrodla").rglob("*.md")):
        if p.name.upper().startswith("MANIFEST"):
            continue
        t = p.read_text(encoding="utf-8", errors="replace")
        lo = t.lower()
        tytul = next((l.lstrip("# ").strip() for l in t.splitlines() if l.startswith("#")), p.stem)
        glowa = (tytul + " " + p.stem.replace("-", " ") + " " + opisy.get(p.name, "") + " " + lo[:800]).lower()
        w_glowie = [w for w in slowa if jest(w, glowa)]             # problem w tytule / nazwie pliku / manifeście / wstępie karty
        rozne = [w for w in slowa if jest(w, lo) or jest(w, glowa)]
        # karta pasuje, gdy problem jest w jej nagłówku albo w tekście jest większość słów zapytania
        if not w_glowie and len(rozne) < max(2, -(-len(slowa) * 2 // 3)):
            continue
        traf = 10 * len(w_glowie) + 3 * len(rozne) + min(20, sum(len(re.findall(r"(?<!\w)" + re.escape(w), lo)) for w in rozne))
        wyniki.append((traf, p, tytul))
    wyniki.sort(key=lambda x: -x[0])
    if wyniki:
        prog = wyniki[0][0] * 0.5
        wyniki = [x for x in wyniki if x[0] >= prog]
    if not wyniki:
        print(f"zrodla/: brak karty dla „{q}”. Zapisz w opinii: BRAK_PL: {q}")
        return
    for traf, p, tytul in wyniki[:5]:
        rel = p.relative_to(ROOT).as_posix()
        print(f"[{rel}] {tytul}  (trafień: {traf})")
        zapisz(sprawa, {"typ": "lokalne", "id": rel, "tytul": tytul, "kto_pobral": kto})


def normuj(t: str) -> str:
    import unicodedata
    t = unicodedata.normalize("NFKD", t.lower())
    return "".join(c for c in t if c.isalnum())


def rpl(sprawa: Path, inn: str | None, nazwa: str | None, kto: str) -> None:
    q = {"size": "100"}
    if nazwa:
        q["name"] = nazwa
    else:
        q["commonName"] = inn
    d = pobierz("https://rejestrymedyczne.ezdrowie.gov.pl/api/rpl/medicinal-products/search/public?" + urllib.parse.urlencode(q))
    lista = d.get("content") or d.get("items") or (d if isinstance(d, list) else [])
    # „Metforminum” nie łapie „Metformini hydrochloridum” (sole): dopytaj rdzeniem, gdy brak preparatu jednoskładnikowego
    if inn and not nazwa and not any(not re.search(r"\+|,|;", str(x.get("commonName") or "")) for x in lista) and len(inn) > 7:
        q2 = {"size": "100", "commonName": inn[:-3] if inn.lower().endswith("num") else inn[:7]}
        d2 = pobierz("https://rejestrymedyczne.ezdrowie.gov.pl/api/rpl/medicinal-products/search/public?" + urllib.parse.urlencode(q2))
        znane = {str(x.get("id")) for x in lista}
        lista = lista + [x for x in (d2.get("content") or d2.get("items") or []) if str(x.get("id")) not in znane]
    if not lista:
        print("RPL: brak wyników. Uwaga: commonName to INN po łacinie (Metforminum, nie metformina).")
        return
    # najpierw preparaty jednoskładnikowe (commonName dokładnie jak zapytanie), potem złożone
    if inn and not nazwa:
        rdzen = normuj(inn)[:6]

        def ile_substancji(x) -> int:
            return len([c for c in re.split(r"\s*(?:\+|,|;|\bet\b|\bi\b)\s*", str(x.get("commonName") or "")) if c.strip()])

        lista = sorted(lista, key=lambda x: (ile_substancji(x) > 1, rdzen not in normuj(str(x.get("commonName") or "")),
                                             str(x.get("medicinalProductName") or "")))
    for x in lista[:15]:
        opis = f"{x.get('medicinalProductName')} · {x.get('commonName')} · {x.get('pharmaceuticalFormName') or x.get('pharmaceuticalForm') or ''} · {x.get('medicinalProductPower') or ''}"
        print(f"[RPL: {x.get('medicinalProductName')}] {opis}")
        zapisz(sprawa, {"typ": "rpl", "id": str(x.get("id") or x.get("medicinalProductName")), "tytul": opis, "kto_pobral": kto})


RPL = "https://rejestrymedyczne.ezdrowie.gov.pl/api/rpl/medicinal-products"
SEKCJE_CHPL = ("3.", "4.2", "4.3", "4.4", "4.5", "4.6", "4.8")


def _tekst_pdf(pdf: Path) -> str | None:
    try:
        import pypdf  # type: ignore
    except Exception:  # noqa: BLE001
        return None
    try:
        return "\n".join((s.extract_text() or "") for s in pypdf.PdfReader(str(pdf)).pages)
    except Exception:  # noqa: BLE001
        return None


def _wytnij_sekcje(t: str) -> str:
    """Z pełnego tekstu ChPL zostawia punkty 3, 4.2–4.6, 4.8 (nagłówki „4.2 Dawkowanie…”)."""
    linie = t.splitlines()
    out, bierz = [], False
    for l in linie:
        m = re.match(r"\s*(\d{1,2}\.\d?)\s+\S", l)
        if m:
            nr = m.group(1)
            bierz = any(nr == x or nr.startswith(x) and x.endswith(".") and len(nr) <= 2 for x in SEKCJE_CHPL) or nr in SEKCJE_CHPL
        if bierz:
            out.append(l)
    return "\n".join(out).strip()


def _szukaj_rpl(nazwa: str) -> list[dict] | None:
    """None = Rejestr nie odpowiada; [] = brak takiego leku."""
    wyn: list[dict] = []
    for klucz in ("name", "commonName"):
        d = pobierz(f"{RPL}/search/public?" + urllib.parse.urlencode({klucz: nazwa, "size": "50"}), wymagane=False)
        if d is None:
            return None
        wyn = d.get("content") or d.get("items") or (d if isinstance(d, list) else [])
        if wyn:
            break
    return wyn


def chpl(sprawa: Path, leki: list[str], kto: str) -> int:
    """Dla każdego leku: RPL → id produktu → ChPL (characteristic) do sprawy/<ID>/_chpl/. Kod 0 gdy wszystko, 2 gdy coś niedostępne."""
    kat = sprawa / "_chpl"
    kat.mkdir(exist_ok=True)
    brak = 0
    for lek in leki:
        lista = _szukaj_rpl(lek)
        if lista is None:
            print(f"[RPL niedostępny] {lek}: Rejestr nie odpowiada. Etykieta [wiedza modelu, niezweryfikowane].")
            brak += 1
            continue
        if not lista:
            print(f"RPL: brak „{lek}” w Rejestrze (spróbuj nazwy handlowej albo INN po łacinie, np. Tirzepatidum). Lek spoza RPL (np. import docelowy, suplement) – zaznacz to w opinii.")
            continue
        rdzen = normuj(lek)[:6]
        lista.sort(key=lambda x: (rdzen not in normuj(str(x.get("medicinalProductName") or "")),
                                  not x.get("hasDownloadableMaterials", True)))
        x = lista[0]
        pid = str(x.get("id"))
        nazwa = str(x.get("medicinalProductName") or lek)
        opis = f"{nazwa} · {x.get('commonName')} · {x.get('pharmaceuticalFormName') or ''} · {x.get('medicinalProductPower') or ''}"
        pdf = kat / f"{normuj(nazwa)[:30] or pid}-{pid}.pdf"
        ok = pdf.exists() or pobierz_plik(f"{RPL}/{pid}/characteristic", pdf)
        if ok and not pdf.read_bytes()[:5].startswith(b"%PDF"):
            # serwer bywa zwraca JSON/HTML zamiast PDF – zostawiamy pod właściwym rozszerzeniem do wglądu
            inny = pdf.with_suffix(".txt")
            pdf.replace(inny)
            pdf, ok = inny, False
        if not ok:
            print(f"[RPL: {nazwa}] {opis}\n  [RPL niedostępny] ChPL nie pobrał się ({RPL}/{pid}/characteristic).")
            zapisz(sprawa, {"typ": "rpl", "id": pid, "tytul": opis, "kto_pobral": kto, "cytat": "ChPL niepobrany"})
            brak += 1
            continue
        rel = pdf.relative_to(sprawa).as_posix()
        tekst = _tekst_pdf(pdf)
        if tekst:
            wyc = _wytnij_sekcje(tekst) or tekst[:20000]
            txt = pdf.with_suffix(".sekcje.txt")
            txt.write_text(wyc, encoding="utf-8")
            print(f"[RPL: {nazwa}, ChPL] {opis}\n  sekcje 3, 4.2–4.6, 4.8: {txt.relative_to(sprawa).as_posix()} ({len(wyc)} znaków)")
        else:
            print(f"[RPL: {nazwa}, ChPL] {opis}\n  PDF: {rel} – przeczytaj narzędziem Read (pkt 3, 4.2–4.6, 4.8).")
        zapisz(sprawa, {"typ": "chpl", "id": pid, "tytul": f"ChPL {opis}", "kto_pobral": kto, "plik": rel,
                        "cytat": "cytuj [RPL: " + nazwa + ", ChPL pkt …]"})
    return 2 if brak else 0


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
    ap.add_argument("tryb", choices=["lokalne", "rpl", "chpl", "fda", "dodaj", "lista"])
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
    elif a.tryb == "chpl":
        leki = [x.strip() for x in re.split(r"[;\n]", a.zapytanie or "") if x.strip()]
        if not leki:
            sys.exit("Podaj leki rozdzielone średnikiem, np. \"Metformax; Mounjaro\"")
        sys.exit(chpl(a.sprawa, leki, a.kto))
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
