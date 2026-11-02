#!/usr/bin/env python3
"""
Pomiar realizmu Psychoterapii AI (0.3.0; koncepcje Innowacyjnego §3.5, docs/ROZMOWA.md §0d).
Liczy wskaźniki sesji z ramą z plików rozmowy/<ID>/ – bez modelu i bez treści rozmów w raporcie (same liczby).

  python skrypty/realizm.py                      raport wszystkich sesji (na ekran)
  python skrypty/realizm.py --konto kab123       tylko jedno konto
  python skrypty/realizm.py --od 2026-11-01 --do 2026-11-30
  python skrypty/realizm.py --zapisz             zapis do raporty/REALIZM-<data>.md (folder lokalny, poza repo)
  python skrypty/realizm.py --json               surowe liczby

Wskaźniki i cele: udział słów terapeuty ≤40%, ≤1 pytanie na odpowiedź, 1–2 nawiązania do pamięci na sesję i 0 zmyślonych,
powrót do zadania z poprzedniej sesji 100%, suwaki (średnia i trend), pęknięcia wykryte i naprawione, odsetek tur „słucham”,
długość sesji, ćwiczenia rozpoczęte / ukończone.
Ślepa ocena par transkryptów (sędzia na innym modelu) jest osobnym krokiem ręcznym – ten skrypt jej nie robi.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from datetime import datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from rozmowa import KORZEN, PEKNIECIE, ROZMOWY, bez_cytatow, bez_ogonkow, czytaj, rozmowy, ts_sek  # noqa: E402

NAWIAZANIE = r"\b(pamietam,? ze|mowil[ae]?s,? ze|pisal[ae]?s,? ze|wspominal[ae]?s|nazwal[ae]?s|ostatnio (mowil|wspominal|pisal)\w*)"
NAPRAWA = (r"\b(przepraszam|moja wina|(biore|wezme) to na siebie|chyba (cie )?zle (zrozumia|odczyta)|nie trafi|chybi|"
           r"co (moge|mam|moglbym|moglabym) (zrobic )?(inaczej|zmienic)|co zmienic|nie (o to|tego) (ci )?chodzilo|zle to ujal)")


def _slowa(t) -> int:
    return len(str(t or "").split())


def _wczytaj(rid: str) -> dict:
    k = ROZMOWY / rid
    u = [w for w in (czytaj(k / "uzytkownik.json", {}) or {}).get("wiadomosci", []) if isinstance(w, dict)]
    z = [w for w in (czytaj(k / "zespol.json", {}) or {}).get("wiadomosci", []) if isinstance(w, dict)]
    m = czytaj(k / "meta.json", {}) or {}
    log = []
    if (k / "_log.jsonl").is_file():
        for linia in (k / "_log.jsonl").read_text(encoding="utf-8").splitlines():
            try:
                log.append(json.loads(linia))
            except ValueError:
                pass
    return {"id": rid, "konto": str(m.get("konto") or ""), "ja": u, "zespol": z, "log": log}


def _grupy(z: list[dict]) -> list[dict]:
    """Odpowiedzi terapeuty zgrupowane po turze (seria wiadomości = jedna odpowiedź)."""
    gr: dict = {}
    for w in z:
        klucz = (w.get("odpowiedz_na", 0), bool(w.get("wstepna")), w.get("ts"))
        g = gr.setdefault(klucz, {"na": w.get("odpowiedz_na", 0), "wstepna": bool(w.get("wstepna")), "ts": w.get("ts"), "tekst": [], "w": []})
        g["tekst"].append(str(w.get("tekst", "")))
        g["w"].append(w)
    out = list(gr.values())
    for g in out:
        g["tekst"] = "\n\n".join(g["tekst"])
        g["kryzys"] = any(x.get("kryzys") for x in g["w"])
        g["tempo"] = next((x.get("tempo") for x in reversed(g["w"]) if x.get("tempo")), None)
        g["pole"] = {k: v for x in g["w"] for k, v in x.items() if k in ("zadanie", "obserwacja", "cwiczenie", "wynik_cwiczenia", "ryzyko")}
    return sorted(out, key=lambda g: (g["na"], str(g["ts"])))


def _sesje_jednej(r: dict) -> list[dict]:
    ja, grupy = r["ja"], _grupy(r["zespol"])
    zd = [w for w in ja if w.get("typ") == "sesja"]
    baza = sorted(_slowa(w.get("tekst")) for w in ja[:10] if w.get("typ", "wiadomosc") == "wiadomosc")
    med = baza[len(baza) // 2] if len(baza) >= 3 else 0
    out = []
    for i, st in enumerate(zd):
        if st.get("akcja") != "start":
            continue
        kon = next((w for w in zd[i + 1:] if w.get("akcja") in ("koniec", "start")), None)
        if kon and kon.get("akcja") == "start":
            kon = None  # nowa sesja bez zamknięcia poprzedniej – okno do następnego startu
            nast = next((w for w in zd[i + 1:] if w.get("akcja") == "start"), None)
            do_n = nast.get("n", 10 ** 9) - 1
        else:
            do_n = kon.get("n", 10 ** 9) if kon else 10 ** 9
        od_n = st.get("n", 0)
        msg = [w for w in ja if od_n < w.get("n", 0) <= do_n]
        tury = [w for w in msg if w.get("typ", "wiadomosc") == "wiadomosc"]
        gr = [g for g in grupy if od_n <= g["na"] <= do_n]
        pelne = [g for g in gr if not g["wstepna"]]
        slowa_ja = sum(_slowa(w.get("tekst")) for w in tury)
        slowa_ty = sum(_slowa(g["tekst"]) for g in pelne if not g["kryzys"])
        pyt = [bez_cytatow(g["tekst"]).count("?") for g in pelne if not g["kryzys"]]
        ost_ts = max([str(w.get("ts")) for w in msg] + [str(g["ts"]) for g in gr] + [str(st.get("ts"))])
        koniec_ts = kon.get("ts") if kon else ost_ts
        nawi = sum(len(re.findall(NAWIAZANIE, bez_ogonkow(bez_cytatow(g["tekst"])))) for g in pelne)
        zmysl = sum(1 for e in r["log"] if e.get("zdarzenie") == "odpowiedz" and od_n <= int(e.get("na") or 0) <= do_n
                    and any("nawiązanie" in str(x) for x in e.get("szwy") or []))
        # pęknięcia: fraza albo nagle krótko po pytaniu (linia bazowa osoby); naprawa = najbliższa pełna odpowiedź
        pek, napr = 0, 0
        for w in tury:
            t = bez_ogonkow(str(w.get("tekst", "")))
            przed = [g for g in grupy if str(g["ts"]) < str(w.get("ts")) and not g["wstepna"]]
            pyt_przed = bool(przed) and "?" in bez_cytatow(przed[-1]["tekst"])
            if re.search(PEKNIECIE, t) or (med >= 20 and _slowa(t) <= 3 and pyt_przed):
                pek += 1
                po = next((g for g in grupy if g["na"] >= w.get("n", 0) and not g["wstepna"]), None)
                if po and re.search(NAPRAWA, bez_ogonkow(po["tekst"])):
                    napr += 1
        cw_start = sum(1 for g in gr if (g["pole"].get("cwiczenie") or {}).get("start"))
        cw_kon = sum(1 for g in gr if g["pole"].get("wynik_cwiczenia"))
        cw_prz = sum(1 for g in gr if (g["pole"].get("cwiczenie") or {}).get("przerwij"))
        zad = next((g["pole"]["zadanie"] for g in reversed(pelne) if g["pole"].get("zadanie")), None)
        out.append({
            "rozmowa": r["id"], "konto": r["konto"], "start": st.get("ts"), "koniec": koniec_ts, "zakonczona": bool(kon),
            "minuty": max(0, round((ts_sek(koniec_ts) - ts_sek(st.get("ts"))) / 60)), "tury": len(tury),
            "slowa_osoby": slowa_ja, "slowa_terapeuty": slowa_ty, "udzial": round(100 * slowa_ty / max(1, slowa_ja + slowa_ty)),
            "odpowiedzi": len(pelne), "wstepne": len(gr) - len(pelne),
            "pytania_sr": round(sum(pyt) / len(pyt), 2) if pyt else 0.0, "odp_ponad_1_pytanie": sum(1 for x in pyt if x > 1),
            "nawiazania": nawi, "zmyslone": zmysl,
            "slucham": sum(1 for g in pelne if g["tempo"] == "slucham"),
            "obserwacje": sum(1 for g in pelne if g["pole"].get("obserwacja")),
            "zadanie_dane": bool(zad), "zadanie_tekst": zad,
            "suwaki": (kon or {}).get("suwaki"),
            "pekniecia": pek, "naprawione": napr,
            "cwiczenia_start": cw_start, "cwiczenia_koniec": cw_kon, "cwiczenia_przerwane": cw_prz,
            "ryzyko_max": max([int(x.get("ryzyko") or 0) for g in gr for x in g["w"]] + [int(w.get("ryzykoLokalne") or 0) for w in tury] or [0]),
            "_okno": (od_n, do_n), "_pelne": pelne, "_msg": msg,
        })
    return out


def _powroty(sesje: list[dict]) -> None:
    """Powrót do zadania: sesja po sesji z zadaniem – osoba kliknęła zrobione / nie wyszło albo terapeuta o nie zapytał."""
    for i, se in enumerate(sesje):
        se["powrot"] = None
        pop = sesje[i - 1] if i else None
        if not pop or not pop["zadanie_dane"]:
            continue
        rdz = {x[:5] for x in re.findall(r"[a-z]{5,}", bez_ogonkow(pop["zadanie_tekst"] or ""))}
        klik = any(w.get("typ") == "zadanie" and w.get("status") in ("zrobione", "nie_wyszlo") for w in se["_msg"])
        pierwsze = " ".join(g["tekst"] for g in se["_pelne"][:2])
        tk = bez_ogonkow(pierwsze)
        trafy = {x for x in rdz if x in tk}
        se["powrot"] = bool(klik or "zadani" in tk or len(trafy) >= 2)


def sesje_konta(konto: str) -> list[dict]:
    out = []
    for rid in rozmowy():
        r = _wczytaj(rid)
        if r["konto"] == konto:
            out += _sesje_jednej(r)
    out.sort(key=lambda x: str(x["start"]))
    for i, se in enumerate(out, 1):
        se["nr_konta"] = i
    _powroty(out)
    return out


def sesje_rozmowy(rid: str) -> list[dict]:
    r = _wczytaj(rid)
    if r["konto"]:
        return sesje_konta(r["konto"])
    out = _sesje_jednej(r)
    for i, se in enumerate(out, 1):
        se["nr_konta"] = i
    _powroty(out)
    return out


def wszystkie(konto: str | None = None, od: str | None = None, do: str | None = None) -> list[dict]:
    konta = sorted({_wczytaj(r)["konto"] for r in rozmowy()} - {""})
    out = []
    for k in ([konto] if konto else konta):
        out += sesje_konta(k)
    if not konto:
        for rid in rozmowy():
            r = _wczytaj(rid)
            if not r["konto"]:
                out += sesje_rozmowy(rid)
    if od:
        out = [x for x in out if str(x["start"])[:10] >= od]
    if do:
        out = [x for x in out if str(x["start"])[:10] <= do]
    return sorted(out, key=lambda x: str(x["start"]))


def opis_sesji(se: dict) -> list[str]:
    su = se.get("suwaki") or {}
    return [
        f"czas: {se['minuty']} min · tur osoby: {se['tury']} · odpowiedzi terapeuty: {se['odpowiedzi']} (+{se['wstepne']} wstępnych)",
        f"udział słów terapeuty: {se['udzial']}% (cel ≤40%) · pytania na odpowiedź: {se['pytania_sr']} (cel ≤1; ponad 1: {se['odp_ponad_1_pytanie']})",
        f"nawiązania do pamięci: {se['nawiazania']} (cel 1–2) · zmyślone: {se['zmyslone']} (cel 0) · tempo „słucham”: {se['slucham']} · obserwacje: {se['obserwacje']}",
        f"pęknięcia: {se['pekniecia']} (z naprawą {se['naprawione']}) · ćwiczenia: rozpoczęte {se['cwiczenia_start']}, ukończone {se['cwiczenia_koniec']}, przerwane {se['cwiczenia_przerwane']}",
        f"powrót do zadania z poprzedniej sesji: {'—' if se.get('powrot') is None else ('tak' if se['powrot'] else 'NIE')} · zadanie na koniec: {'tak' if se['zadanie_dane'] else 'nie'}",
        f"suwaki: samopoczucie {su.get('samopoczucie', '—')}/10, trafność {su.get('trafnosc', '—')}/10 · ryzyko max: {se['ryzyko_max']}",
    ]


def _proc(a: int, b: int) -> str:
    return f"{round(100 * a / b)}%" if b else "—"


def raport(sesje: list[dict], tytul: str = "") -> str:
    d = datetime.now().strftime("%Y-%m-%d %H:%M")
    lin = [f"# Realizm Psychoterapii AI – raport {d}", "", tytul or f"Sesji: {len(sesje)}. Same liczby, bez treści rozmów (zasada: historia rozmów zostaje na laptopie).", ""]
    if not sesje:
        return "\n".join(lin + ["Brak sesji z ramą („Zacznij sesję”) w wybranym okresie."]) + "\n"
    n = len(sesje)
    ud = [x["udzial"] for x in sesje]
    pyt = [x["pytania_sr"] for x in sesje if x["odpowiedzi"]]
    pow_ = [x["powrot"] for x in sesje if x.get("powrot") is not None]
    su = [x["suwaki"] for x in sesje if x.get("suwaki")]
    pek, napr = sum(x["pekniecia"] for x in sesje), sum(x["naprawione"] for x in sesje)
    odp = sum(x["odpowiedzi"] for x in sesje)
    cs, ck = sum(x["cwiczenia_start"] for x in sesje), sum(x["cwiczenia_koniec"] for x in sesje)
    sr = lambda v: round(sum(v) / len(v), 1) if v else "—"  # noqa: E731
    def ok(war):
        return "✓" if war else "✗"
    lin += ["## Wskaźniki zbiorcze", "", "| Wskaźnik | Wynik | Cel | |", "|---|---|---|---|",
            f"| Udział słów terapeuty (średnio) | {sr(ud)}% | ≤40% | {ok(sr(ud) != '—' and sr(ud) <= 40)} |",
            f"| Pytania na odpowiedź (średnio) | {sr(pyt)} | ≤1 | {ok(sr(pyt) == '—' or sr(pyt) <= 1)} |",
            f"| Nawiązania do pamięci na sesję | {sr([x['nawiazania'] for x in sesje])} | 1–2 | {ok(1 <= (sr([x['nawiazania'] for x in sesje]) or 0) <= 2)} |",
            f"| Zmyślone nawiązania | {sum(x['zmyslone'] for x in sesje)} | 0 | {ok(sum(x['zmyslone'] for x in sesje) == 0)} |",
            f"| Powrót do zadania z poprzedniej sesji | {_proc(sum(pow_), len(pow_))} ({sum(pow_)}/{len(pow_)}) | 100% | {ok(not pow_ or all(pow_))} |",
            f"| Pęknięcia naprawione | {_proc(napr, pek)} ({napr}/{pek}) | 100% | {ok(napr == pek)} |",
            f"| Suwak „jak się czuję” (średnio) | {sr([int(x.get('samopoczucie') or 0) for x in su])} | trend ↑ | |",
            f"| Suwak „rozmowa o tym, o czym chciałem/am” | {sr([int(x.get('trafnosc') or 0) for x in su])} | ≥7 | {ok(not su or sr([int(x.get('trafnosc') or 0) for x in su]) >= 7)} |",
            f"| Tury „słucham” | {_proc(sum(x['slucham'] for x in sesje), odp)} | 10–25% | |",
            f"| Długość sesji (średnio) | {sr([x['minuty'] for x in sesje])} min, {sr([x['tury'] for x in sesje])} tur | 20–40 min | |",
            f"| Ćwiczenia ukończone / rozpoczęte | {ck}/{cs} | | |",
            f"| Sesje zakończone przyciskiem (z suwakami) | {len(su)}/{n} | 100% | {ok(len(su) == n)} |", ""]
    if len(su) >= 2:
        t = [int(x.get("samopoczucie") or 0) for x in su]
        lin += [f"Trend samopoczucia: pierwsza {t[0]}/10 → ostatnia {t[-1]}/10 ({'+' if t[-1] >= t[0] else ''}{t[-1] - t[0]}).", ""]
    lin += ["## Sesje", "", "| # | Data | Konto | Min | Tury | Udział | Pyt./odp. | Nawiąz. (zmyśl.) | Słucham | Pęknięcia (napr.) | Ćwiczenia | Powrót do zadania | Suwaki | Ryzyko max |",
            "|---|---|---|---|---|---|---|---|---|---|---|---|---|---|"]
    for i, x in enumerate(sesje, 1):
        s_ = x.get("suwaki") or {}
        lin.append(f"| {i} | {str(x['start'])[:16].replace('T', ' ')} | {x['konto'] or '—'} · s{x.get('nr_konta', '?')} | {x['minuty']} | {x['tury']} | {x['udzial']}% | {x['pytania_sr']} | {x['nawiazania']} ({x['zmyslone']}) | {x['slucham']} | "
                   f"{x['pekniecia']} ({x['naprawione']}) | {x['cwiczenia_koniec']}/{x['cwiczenia_start']} | {'—' if x.get('powrot') is None else ('tak' if x['powrot'] else 'nie')} | "
                   f"{s_.get('samopoczucie', '—')}/{s_.get('trafnosc', '—')} | {x['ryzyko_max']} |")
    lin += ["", "— Narzędzie testowe marki MS. Raport mierzy formę rozmowy, nie skuteczność terapii."]
    return "\n".join(lin) + "\n"


def main() -> None:
    ap = argparse.ArgumentParser(description="Pomiar realizmu Psychoterapii AI (docs/ROZMOWA.md §0d)")
    ap.add_argument("--konto")
    ap.add_argument("--od")
    ap.add_argument("--do")
    ap.add_argument("--zapisz", action="store_true", help="zapis do raporty/REALIZM-<data>.md")
    ap.add_argument("--json", action="store_true")
    a = ap.parse_args()
    sesje = wszystkie(a.konto, a.od, a.do)
    if a.json:
        print(json.dumps([{k: v for k, v in x.items() if not k.startswith("_")} for x in sesje], ensure_ascii=False, indent=2))
        return
    tekst = raport(sesje)
    if a.zapisz:
        p = KORZEN / "raporty" / f"REALIZM-{datetime.now().strftime('%Y-%m-%d')}.md"
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(tekst, encoding="utf-8")
        print(f"OK: raport zapisany: {p.relative_to(KORZEN)}")
    else:
        print(tekst)


if __name__ == "__main__":
    main()
