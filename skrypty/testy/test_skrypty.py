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


    def test_myslnik_w_zrodlach_i_skroty(self):
        t = FINAL.format(wnioski="").replace("[1] RPL: Metformax SR, ChPL pkt 4.8\n",
            "[1] RPL: Metformax SR — ChPL pkt 4.8\n[2] PTD 2026 — cukrzyca\n").replace("DLACZEGO: Kulka pojawia się raz na dobę po dawce leku [1].",
            "DLACZEGO: Pacjentka po 70. r.ż. ma kulkę po dawce leku [1]. Wg PTD 2026 metformina XR ma matrycę [2]. To tłumaczy obraz.")
        self.assertEqual(lint_final.lint(t), [])

    def test_zrodla_bez_limitu(self):
        zr = "".join(f"[{n}] PMID {10000000 + n}\n" for n in range(1, 9))
        t = FINAL.format(wnioski="").replace("[1] RPL: Metformax SR, ChPL pkt 4.8\n", zr).replace(
            "po dawce leku [1].", "po dawce leku [1][8].")
        self.assertEqual(lint_final.lint(t), [])
        self.assertTrue(any("[9]" in b for b in lint_final.lint(t.replace("[1][8]", "[1][9]"))))


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


class TestPomiar30(unittest.TestCase):
    """Błędy zgłoszone po pomiarze K0–K3 (2.11.2026, pomiar-30/UWAGI-DO-KODU.md)."""

    def _sprawa(self, opinie):
        sprawa = Path(tempfile.mkdtemp()); (sprawa / "03-opinie").mkdir()
        for o in opinie:
            (sprawa / "03-opinie" / f"{o['rola']}.json").write_text(json.dumps(o), encoding="utf-8")
        return sprawa

    def test_polekowa_tak_bez_rundy_gdy_wszyscy_maja_zatrucie(self):
        roz = [{"nazwa": "zatrucie digoksyną", "icd10": "T46.0", "p": 0.8}]
        s = self._sprawa([_opinia(r, roz) for r in ("bayes", "hipotezujacy", "poz_pragmatyk")]
                         + [{"rola": "farmakolog", "pilnosc": 2, "rozpoznania": [], "przyczyna_polekowa": "tak"}])
        self.assertFalse(agregacja.agreguj(s)["runda"]["potrzebna"])

    def test_lek_jako_czynnik_ryzyka_bez_rundy(self):
        roz = [{"nazwa": "zatorowość płucna", "icd10": "I26.9", "p": 0.8}]
        s = self._sprawa([_opinia(r, roz) for r in ("bayes", "hipotezujacy")]
                         + [{"rola": "farmakolog", "pilnosc": 2, "rozpoznania": [], "przyczyna_polekowa": "tak", "polekowe_jako": "czynnik_ryzyka"}])
        self.assertFalse(agregacja.agreguj(s)["runda"]["potrzebna"])
        (s / "03-opinie" / "farmakolog.json").write_text(json.dumps({"rola": "farmakolog", "pilnosc": 2, "rozpoznania": [], "przyczyna_polekowa": "tak"}), encoding="utf-8")
        self.assertIn("farmakolog: przyczyna polekowa TAK", agregacja.agreguj(s)["runda"]["powody"])

    def test_ten_sam_blok_icd_to_zgoda(self):
        s = self._sprawa([_opinia("bayes", [{"nazwa": "wirusowe zakażenie górnych dróg oddechowych", "icd10": "J06.9", "p": 0.7}]),
                          _opinia("hipotezujacy", [{"nazwa": "wirusowe zapalenie nosa i gardła", "icd10": "J00", "p": 0.7}])])
        w = agregacja.agreguj(s)
        self.assertEqual(w["zgoda"], 1.0)
        self.assertFalse(w["runda"]["potrzebna"])

    def test_rewizja_z_pliku_rundy_md(self):
        s = self._sprawa([_opinia("bayes", [{"nazwa": "kamica", "icd10": "K80", "p": 0.68}])])
        (s / "04-runda1").mkdir()
        rew = _opinia("bayes", [{"nazwa": "kamica", "icd10": "K80", "p": 0.65}]); rew["rewizja"] = True
        (s / "04-runda1" / "bayes.md").write_text("Przekonuje mnie…\n```json\n" + json.dumps(rew) + "\n```\n", encoding="utf-8")
        w = agregacja.agreguj(s)
        self.assertEqual(w["runda_opinii"], 1)
        self.assertEqual(w["pliki_opinii"]["bayes"], "bayes.md")

    def test_lokalne_bez_kart_niezwiazanych(self):
        sprawa = Path(tempfile.mkdtemp())
        out = io.StringIO()
        with redirect_stdout(out):
            zrodla.lokalne(sprawa, "dna moczanowa", "test")
        self.assertIn("dna.md", out.getvalue())
        self.assertNotIn("covid", out.getvalue().lower())
        self.assertNotIn("ibs", out.getvalue().lower())


if __name__ == "__main__":
    unittest.main()
