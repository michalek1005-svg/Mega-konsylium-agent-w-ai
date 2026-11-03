# ms-ui – wspólny pakiet wyglądu marki MS

Decyzja Michała (ankieta 3.11.2026): jeden pakiet wyglądu dla Konsylium i Nawigatora. Zakres: `/mnt/project-files/grafika/ms-ui/PROPOZYCJA-ZAKRESU-MS-UI.md` (Graficzny).

| Plik | Co jest w środku |
|---|---|
| `tokeny.css` | kolory, tryb jasny (domyślny) i ciemny (`html[data-motyw="ciemny"]`), `--scene`, `--grain`, cienie |
| `komponenty.css` | `.nk-button`, `.nk-on`, `.nk-label`, `.nk-manual`, `.nk-muted`, `.nk-status`, przewijanie |
| `ms-ui.mjs` | `msUiCss()` – tokeny + komponenty w tej kolejności; buildy wklejają to w miejsce `/*@@MS-TOKENY@@*/` |
| `WERSJA` | wersja pakietu (1.0.0) |

Nazwy zmiennych i klas są takie same jak w Nawigatorze (`--petrol`, `--ink`, `.nk-button` …). Pakiet zmienia porządek, nie wygląd: po przeniesieniu (3.11.2026) zbudowane pliki Wywiadu, Anonimizatora i powłoki różnią się od poprzednich tylko komentarzami.

## Nowa aplikacja w 5 krokach
1. W szablonie HTML wstaw `<style>/*@@MS-TOKENY@@*/</style>` przed własnymi stylami.
2. W buildzie: `import { msUiCss } from '<ścieżka>/packages/ms-ui/ms-ui.mjs'` i podmień `/*@@MS-TOKENY@@*/` na `msUiCss()`.
3. W trybie deweloperskim (plik otwierany wprost) podlinkuj `tokeny.css` i `komponenty.css`; build usuwa te linki.
4. Motyw: `<html data-motyw="jasny">` (domyślnie) albo `"ciemny"`.
5. Zero adresów sieciowych – krój i ikony wbudowane przy buildzie.

## Zasady
- Zmiany kolorów i logo marki tylko przez Michała. Nie poprawiać po cichu.
- Nawigator przechodzi na pakiet dopiero po słowie Michała, przez nadzorcę Nawigatora (krok 2).
- Pokój lekarski ma jeszcze własną kopię tokenów z kolorami sceny (inny domyślny motyw); przejście ze sprawdzeniem zrzutów przez Graficznego to następny krok.
- Do dopisania przez Graficznego: `logo.js` (`logoLitera('K'|'N')`), `ikony.svg`, `czcionki/`, `warianty/lawenda.css`, `podglad.html`.
