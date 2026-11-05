# Plakat w Pokoju lekarskim

`plakat.jpg` to obraz pastelowy osadzany przez `build.mjs` (jako `data:`, offline). Powstaje w dwóch krokach:

1. `node zasoby/renderuj-szkic.cjs POKOJ-LEKARSKI-<wersja>.html szkic.png` renderuje szkic wektorowy `PLAKAT_SZKIC` z `src/plakat.js`.
2. `python3 zasoby/maluj-plakat.py szkic.png zasoby/plakat.jpg` przemalowuje go kreskami pastelu na papierze z ziarnem (Pillow + numpy, wynik deterministyczny).

Można też podmienić `plakat.jpg` na dowolny własny obraz 4:5 (np. prawdziwy rysunek pastelowy); bez zdjęć i nazwisk aktorów.
