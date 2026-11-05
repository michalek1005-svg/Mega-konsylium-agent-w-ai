# Logo K (wariant 7b „Grawer wklęsły” Nawigatora)

Litera K wygenerowana tym samym generatorem co logo N Nawigatora Medycznego
(`makiety/logo-lod/generator/{logo.js,white.js}` w repo Nawigatora), z podmienionymi ścieżkami litery (`norm.json`: A = pień, B = oba ramiona).
`export.js` renderuje `logo-k-7b-{jasny,ciemny}.svg` do PNG 1×/2×/3× (Playwright/Chromium). W aplikacji wbudowane są PNG @3x jako `data:` w `app/index.html` (`.logo-k`), bez filtrów SVG (tak jak w Nawigatorze).
Wymiary jak w Nawigatorze: płótno 62×66 px → 48×51 px, litera ok. 28 px, oś litery = oś paska ikon.
