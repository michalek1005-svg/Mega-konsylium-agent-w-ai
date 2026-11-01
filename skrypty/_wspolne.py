"""Wspólne narzędzia skryptów konsylium (bez zależności poza stdlib + PyYAML)."""
from __future__ import annotations

import json
import re
import sys
import unicodedata
from datetime import datetime, timezone
from pathlib import Path

try:
    import yaml
except ImportError:  # pragma: no cover
    sys.exit("Brak PyYAML: pip install pyyaml")

ROOT = Path(__file__).resolve().parent.parent
CONFIG = ROOT / "config"
PAMIEC = ROOT / "pamiec"


def wczytaj_yaml(p: Path) -> dict:
    with open(p, encoding="utf-8") as f:
        return yaml.safe_load(f) or {}


def wczytaj_json(p: Path, domyslne=None):
    if not p.exists():
        return domyslne
    with open(p, encoding="utf-8") as f:
        return json.load(f)


def zapisz_json(p: Path, dane) -> None:
    p.parent.mkdir(parents=True, exist_ok=True)
    with open(p, "w", encoding="utf-8") as f:
        json.dump(dane, f, ensure_ascii=False, indent=2)
        f.write("\n")


def wagi() -> dict:
    return wczytaj_yaml(CONFIG / "wagi.yaml")


def kalibracja() -> dict:
    return wczytaj_json(PAMIEC / "kalibracja.json", {"role": {}, "rezydenci": {}})


def k_roli(rola: str, kal: dict | None = None) -> float:
    kal = kal or kalibracja()
    return float(kal.get("role", {}).get(rola, {}).get("k", 1.0))


def normalizuj(nazwa: str) -> str:
    """Mała litera, bez diakrytyków i interpunkcji, pojedyncze spacje."""
    s = unicodedata.normalize("NFKD", nazwa.lower())
    s = "".join(c for c in s if not unicodedata.combining(c))
    s = s.replace("ł", "l")
    s = re.sub(r"[^a-z0-9 ]+", " ", s)
    return re.sub(r"\s+", " ", s).strip()


def kanon(nazwa: str, synonimy: dict | None = None) -> str:
    """Sprowadza nazwę rozpoznania do formy kanonicznej wg config/synonimy.yaml."""
    if synonimy is None:
        synonimy = wczytaj_yaml(CONFIG / "synonimy.yaml") if (CONFIG / "synonimy.yaml").exists() else {}
    n = normalizuj(nazwa)
    for kan, warianty in synonimy.items():
        if n == normalizuj(kan) or any(n == normalizuj(w) for w in (warianty or [])):
            return normalizuj(kan)
    return n


def wczytaj_opinie(sprawa: Path, do_rundy: int | None = None) -> dict[str, dict]:
    """{rola: opinia} z 03-opinie/*.json (bez plików zaczynających się od '_').

    Opinia po rundzie dyskusji: 03-opinie/<rola>-runda<N>.json (pełna opinia) albo pole "runda": N w JSON-ie.
    Dla każdej roli bierzemy NAJNOWSZĄ rundę (≤ do_rundy, jeśli podano); przy remisie – plik zmieniony później.
    (Błąd z 1.11.2026: skrypt brał opinie ślepej tury zamiast ostatniej rundy.)
    """
    kat = sprawa / "03-opinie"
    najlepsze: dict[str, tuple] = {}
    for p in kat.glob("*.json"):
        if p.name.startswith("_"):
            continue
        op = wczytaj_json(p)
        if not op or "rola" not in op:
            print(f"UWAGA: {p.name} pominięty – brak pola \"rola\".", file=sys.stderr)
            continue
        m = re.search(r"-runda[_-]?(\d+)\.json$", p.name)
        runda = int(op.get("runda", m.group(1) if m else 0) or 0)
        if do_rundy is not None and runda > do_rundy:
            continue
        klucz = (runda, p.stat().st_mtime)
        if op["rola"] not in najlepsze or klucz > najlepsze[op["rola"]][0]:
            najlepsze[op["rola"]] = (klucz, {**op, "_plik": p.name, "_runda": runda})
    return {r: v[1] for r, v in sorted(najlepsze.items())}


def frontmatter(p: Path) -> tuple[dict, str]:
    """Zwraca (yaml_dict, reszta_tekstu) z pliku .md z front-matterem '---'."""
    txt = p.read_text(encoding="utf-8")
    m = re.match(r"^---\s*\n(.*?)\n---\s*\n?(.*)$", txt, re.S)
    if not m:
        return {}, txt
    return (yaml.safe_load(m.group(1)) or {}), m.group(2)


def log(sprawa: Path, rola: str, zdarzenie: str, plik: str = "") -> None:
    with open(sprawa / "_log.jsonl", "a", encoding="utf-8") as f:
        f.write(json.dumps({"ts": datetime.now(timezone.utc).isoformat(timespec="seconds"),
                            "rola": rola, "zdarzenie": zdarzenie, "plik": plik}, ensure_ascii=False) + "\n")
