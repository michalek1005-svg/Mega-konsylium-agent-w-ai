# Usprawnienia wyglądu 0.3.x – pakiet dla Kodującego (Graficzny, 3.11.2026)

**Decyzja Michała (karta, 3.11 13:59):** wdrożyć wszystkie 6 pozycji z `../USPRAWNIENIA-GRAFICZNE-2026-11-02.md`
(bez litery K – zostaje obecna, miętowa). Pozycje [2] i [3] przed wdrożeniem przegląda rola Merytoryczna.

Makieta przed/po (zrzuty prawdziwej aplikacji, jasny i ciemny): `node makieta.cjs <katalog>` po
`node zbuduj.mjs --bez-paczki`; gotowe PNG w `/mnt/project-files/psycho-grafika/makiety-2026-11-03/`.

| # | Co | Plik docelowy | Skąd wziąć |
|---|---|---|---|
| 2 | Przycisk „Pomoc w kryzysie” w pasku + panel z numerami | `aplikacja/powloka/app/index.html` (+ `ipad.html` przez zbuduj) | `powloka.css` [2], `fragmenty.js` `ikonaPomocy`, `panelPomocy` |
| 3 | Łagodniejszy stan „Nie działa” (bez pulsowania, napis w kolorze tekstu, kropka zostaje czerwona) | `aplikacja/powloka/app/index.html` | `powloka.css` [3] |
| 4 | Pusty Pokój: szkic kręgu foteli + „Pokój czeka na sprawę” | `aplikacja/pokoj-psychologiczny/src/pokoj.css`, `pokoj.js` | `pokoj.css`, `fragmenty.js` `pustyPokoj` |
| 5 | Nagłówek Wywiadu jako szklana karta (bez morskiego pasa) | `aplikacja/wywiad/index.html` ok. w. 63 | `wywiad.css` |
| 6 | Twarze zespołu przy „Pokaż, kto co myślał” | `aplikacja/rozmowa/rozmowa.html` ok. w. 827 | `rozmowa.css` [6], `fragmenty.js` `twarze` |
| 7 | Ikony ćwiczeń zamiast ✦ | `aplikacja/rozmowa/rozmowa.html` ok. w. 748 i `wynikHtml` | `rozmowa.css` [7], `fragmenty.js` `ikonyCwiczen` |

## Szczegóły wdrożenia
- **[2] Pomoc w kryzysie**
  - W `nav.pasek` na samym dole (po przycisku motywu): `<span class="kreska"></span>` + `<button type="button" id="pomoc-przycisk" class="pomoc" aria-label="Pomoc w kryzysie" aria-pressed="false">` z `ikonaPomocy` i `<span class="podpis">Pomoc w kryzysie</span>`.
  - Panel `<div class="folder pomoc-panel" id="pomoc-panel" hidden role="dialog" aria-label="Pomoc w kryzysie">` otwierany i zamykany jak panel folderu (Esc i klik poza panelem zamykają).
  - Numery **wyłącznie z `config/pomoc-pl.json`**: `zbuduj.mjs` wstrzykuje `window.MS_POMOC = <json>` (jak `MS_WERSJA`), a panel buduje `panelPomocy(MS_POMOC)`. Żadnych numerów wpisanych na sztywno.
  - Na iPadzie (`html.ipad`) przycisk zostaje. Podpisy są tam ukryte, więc wystarczy `aria-label`.
  - Stopka czatu z numerami zostaje bez zmian.
  - Uwagi Merytorycznego (3.11): kolejność numerów **dokładnie jak w pliku** (112 zawsze pierwsze, bez sortowania);
    przycisk osiągalny klawiaturą (Tab, Enter/Spacja; `podpis` pokazuje się też przy `:focus-visible`, dodaj `title="Pomoc w kryzysie"`);
    zdanie pod listą: „Te numery są tu zawsze, w każdej zakładce.”
- **[3]** Zmienia wygląd stanu `blad` w rogu (logika `odswiez()` zostaje). **Warunek Merytorycznego:** gdy nie działa AI,
  a osoba czeka na odpowiedź, w samym czacie ma być jedno spokojne zdanie (bez czerwieni i pulsowania): `MS_UI.zdanieBrakAI`
  = „Odpowiedź może się teraz nie pojawić. Jeśli potrzebujesz pomocy od razu – przycisk Pomoc w kryzysie.” Najprościej dopisać je
  na początku istniejącego komunikatu `msg system` „Na tym komputerze nie widać teraz pracy Claude…” (rozmowa.html, ok. w. 833,
  pokazuje się po 25 s czekania). Uwaga: w podglądzie przeglądarki stan to zawsze „Nie działa”; w aplikacji czerwień pojawia się tylko przy prawdziwym błędzie.
- **[4]** Wstaw `pustyPokoj()` do `#pokoj`, gdy nie ma wczytanej sprawy, i usuń element przy pierwszym `wczytajPliki`/`zywoZPowloki`. Tekst w nagłówku (`opis-sprawy`) może zostać.
- **[5]** Zamień jedną regułę `html.osadzony .pasek`. Sprawdź przewijanie: nagłówek jest `sticky` i ma zostać czytelny nad treścią.
- **[6]** W `<div>` z `glosy-btn` wstaw `MS_UI.twarze(m.glosy, rola)` tuż PRZED przyciskiem (nie w nim), najwyżej 4 kółka.
- **[7]** W `rysuj karta-cwiczenia` dodaj `ikonaCwiczenia(c.id)` na początku `h`; w `wynikHtml` zamień `✦ ` na ikonę, jeśli wynik ma `id`.

## Testy
Jak zawsze: `node zbuduj.mjs` + `xvfb-run -a node test/e2e-psycho.mjs`, `test_frazy.py` 80/80, `test_030.py`, Pokój `npm test` 12/12.
Do e2e warto dodać: przycisk `#pomoc-przycisk` istnieje we wszystkich zakładkach, a panel pokazuje wszystkie numery z `pomoc-pl.json`.
