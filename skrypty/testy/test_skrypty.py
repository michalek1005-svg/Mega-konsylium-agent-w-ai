"""Testy skryptów konsylium (bez sieci). Uruchom: python -m unittest discover skrypty/testy"""
from __future__ import annotations

import io
import json
import sys
import tempfile
import unittest
from contextlib import redirect_stdout
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
import zrodla  # noqa: E402
import agregacja  # noqa: E402
import lint_final  # noqa: E402
import wynik  # noqa: E402


class TestChpl(unittest.TestCase):
    def test_pobiera_chpl_dla_kazdego_leku(self):
        sprawa = Path(tempfile.mkdtemp())
        orig_p, orig_f = zrodla.pobierz, zrodla.pobierz_plik

        def p(url, wymagane=True):
            if "Metformax" in url:
                return {"content": [{"id": 101, "medicinalProductName": "Metformax 500", "commonName": "Metformini hydrochloridum"}]}
            return {"content": []}

        def f(url, cel):
            self.assertIn("/101/characteristic", url)
            cel.write_bytes(b"%PDF-1.4 atrapa")
            return True
        zrodla.pobierz, zrodla.pobierz_plik = p, f
        try:
            out = io.StringIO()
            with redirect_stdout(out):
                kod = zrodla.chpl(sprawa, ["Metformax", "Nieistniejacy"], "farmakolog")
        finally:
            zrodla.pobierz, zrodla.pobierz_plik = orig_p, orig_f
        self.assertEqual(kod, 0)
        self.assertIn("[RPL: Metformax 500, ChPL]", out.getvalue())
        self.assertIn("brak „Nieistniejacy”", out.getvalue())
        b = [json.loads(l) for l in (sprawa / "_biblioteka.jsonl").read_text(encoding="utf-8").splitlines()]
        self.assertEqual(b[0]["typ"], "chpl")
        self.assertTrue((sprawa / b[0]["plik"]).exists())

    def test_rpl_niedostepny(self):
        sprawa = Path(tempfile.mkdtemp())
        orig = zrodla.pobierz
        zrodla.pobierz = lambda url, wymagane=True: None
        try:
            out = io.StringIO()
            with redirect_stdout(out):
                self.assertEqual(zrodla.chpl(sprawa, ["Metformax"], ""), 2)
        finally:
            zrodla.pobierz = orig
        self.assertIn("[RPL niedostępny]", out.getvalue())


def _opinia(rola, rozp, pil=4):
    return {"rola": rola, "pilnosc": pil, "pewnosc": "srednia", "rozpoznania": rozp}


class TestAgregacjaProblemy(unittest.TestCase):
    def test_osobny_ranking_na_problem_i_nie_choroby(self):
        sprawa = Path(tempfile.mkdtemp())
        (sprawa / "03-opinie").mkdir()
        obiekt = [{"nazwa": "fragment tabletki o przedłużonym uwalnianiu", "icd10": "ARTEFAKT-LEK", "p": 0.6, "problem": "P1"},
                  {"nazwa": "pasożyt", "icd10": "B82", "p": 0.2, "problem": "P1"}]
        mocz = [{"nazwa": "barwa po burakach", "icd10": "DIETA", "p": 0.5, "problem": "P2"},
                {"nazwa": "krwiomocz", "icd10": "R31", "p": 0.3, "problem": "P2"}]
        for rola in ("bayes", "hipotezujacy", "poz_pragmatyk"):
            o = [dict(x) for x in obiekt]
            if rola == "hipotezujacy":
                o[0]["nazwa"] = "otoczka leku w stolcu"   # inna nazwa, ten sam kod → jedno rozpoznanie
            (sprawa / "03-opinie" / f"{rola}.json").write_text(json.dumps(_opinia(rola, o + mocz)), encoding="utf-8")
        w = agregacja.agreguj(sprawa)
        self.assertEqual(w["problem_glowny"], "P1")
        self.assertEqual(w["ranking"][0]["rozpoznanie"], "fragment tabletki o przedłużonym uwalnianiu")
        self.assertEqual(w["zgoda"], 1.0)
        self.assertNotIn("barwa po burakach", [r["rozpoznanie"] for r in w["ranking"]])
        self.assertEqual(w["problemy"]["P2"]["ranking"][0]["rozpoznanie"], "barwa po burakach")
        self.assertFalse(w["runda"]["potrzebna"])

    def test_bez_problemow_jak_dawniej(self):
        sprawa = Path(tempfile.mkdtemp())
        (sprawa / "03-opinie").mkdir()
        for rola in ("bayes", "hipotezujacy"):
            (sprawa / "03-opinie" / f"{rola}.json").write_text(json.dumps(_opinia(rola, [{"nazwa": "dna moczanowa", "icd10": "M10.0", "p": 0.7}])), encoding="utf-8")
        w = agregacja.agreguj(sprawa)
        self.assertIsNone(w["problem_glowny"])
        self.assertEqual(w["problemy"], {})


FINAL = """REKOMENDACJA: Odstaw na tydzień preparat o przedłużonym uwalnianiu i obejrzyj stolec ponownie.
CO BY TO OBALIŁO: krew w stolcu albo utrata masy ciała.
PILNOŚĆ: 4 planowo — PEWNOŚĆ: średnia
DLACZEGO: Kulka pojawia się raz na dobę po dawce leku [1].
PLAN B: jeśli kulka zostanie po zmianie leku, to kał na pasożyty.
{wnioski}CZEGO NIE WIEMY: czy kulka rozpada się w wodzie.
WRÓĆ / ESKALUJ GDY: gorączka, krew w stolcu.
ŹRÓDŁA:
[1] RPL: Metformax SR, ChPL pkt 4.8
— Narzędzie testowe i edukacyjne marki MS. Nie służy do podejmowania decyzji u realnych pacjentów.
"""


class TestLintFinal(unittest.TestCase):
    def test_ok_z_linia_obalenia(self):
        self.assertEqual(lint_final.lint(FINAL.format(wnioski="")), [])

    def test_brak_obalenia(self):
        t = FINAL.format(wnioski="").replace("CO BY TO OBALIŁO: krew w stolcu albo utrata masy ciała.\n", "")
        self.assertIn("brak etykiety CO BY TO OBALIŁO:", lint_final.lint(t))

    def test_wnioski_wg_problemu(self):
        self.assertTrue(any("WNIOSKI WG PROBLEMU" in b for b in lint_final.lint(FINAL.format(wnioski=""), ["P1", "P2"])))
        t = FINAL.format(wnioski="WNIOSKI WG PROBLEMU:\n- P1: otoczka tabletki – zmiana preparatu.\n- P2: barwa po burakach – obserwacja.\n")
        self.assertEqual(lint_final.lint(t, ["P1", "P2"]), [])


class TestWynik(unittest.TestCase):
    def test_zestawienie_trafnosci_rol(self):
        kat = Path(tempfile.mkdtemp())
        for n, (ocena, mieli) in enumerate([("trafne", []), ("nietrafne", ["hipotezujacy"])]):
            s = kat / f"S{n}"; (s / "03-opinie").mkdir(parents=True)
            (s / "03-opinie" / "_agregat.json").write_text(json.dumps({"ranking": [{"rozpoznanie": "kamica"}],
                "rozpoznanie_nr1_lekarzy": {"bayes": "kamica", "hipotezujacy": "trzustka"}}), encoding="utf-8")
            wynik.zapisz(s, ocena, "zdanie", mieli)
        z = wynik.zestawienie(kat)
        self.assertEqual(z["sprawy"], 2)
        self.assertEqual(z["role"]["bayes"], {"n": 2, "trafnosc": 0.5})        # 1,0 + 0,0
        self.assertEqual(z["role"]["hipotezujacy"], {"n": 2, "trafnosc": 0.5})  # 0,0 (inne nr 1 przy trafnym) + 1,0 (miał rację)


if __name__ == "__main__":
    unittest.main()
