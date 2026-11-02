# Okno Rozmowy – działający komponent (wątek Graficzny, 1.11.2026 ~05:05)

Dla brata psychologicznego: zakładka **Rozmowa** – JEDEN terapeuta AI odpisuje jednym tekstem jak w komunikatorze, a w tle pracuje zespół agentów (decyzja Michała 1.11 04:30–04:38). Zastępuje makietę `../makieta-rozmowa.png`.

## Pliki
- `rozmowa.css` – wygląd (paleta Lawenda jak Pokój psychologiczny; tryb jasny domyślny, ciemny przez `data-motyw="ciemny"` lub `data-theme="dark"` na `<html>`). Wszystkie klasy z prefiksem `rz-`, nic nie koliduje z pokoj.css.
- `rozmowa.js` – komponent bez bibliotek i bez sieci; tekst zawsze przez `textContent` (test XSS w e2e).
- `ROZMOWA-podglad.html` – samodzielny podgląd z danymi demo (kobieta 34 l., fikcyjne), osadzony krój, CSP `default-src 'none'`.
- `zrodlo-podgladu.html` – szablon podglądu (bez osadzonych plików).
- `test-e2e.cjs` – Playwright: `node test-e2e.cjs ROZMOWA-podglad.html [katalog-na-zrzuty]` → „rozmowa e2e OK”.
- Zrzuty: `rozmowa-jasny.png`, `rozmowa-ciemny.png`, `rozmowa-ipad-kryzys.png`.

## API
```js
const rz = Rozmowa.zamontuj(elementKontenera, {
  imie: 'Terapeutka', sprawa: '2026-11-01-01',
  przyciski: [['Formulacja robocza', fn], ['Wnioski', fn]],   // opcjonalne, w nagłówku
  onWyslij: (tekst) => {},          // zapisz turę użytkownika (np. sprawy/<ID>/rozmowa.jsonl) i daj sygnał Claude
  onZwolaj: () => {},               // przycisk „Zwołaj konsylium” → Pokój psychologiczny
  onReakcja: (idWiadomosci, emoji) => {},
});
rz.dodaj({ kto: 'terapeuta' | 'ja' | 'system', tekst, czas: '13:02', dzien: 'Dziś',
           zrodla: ['PHQ-9: 14'], emo: ['❤️'],
           kulisy: [{ rola: 'CBT', skrot: '…' }, { rola: 'Psychodynamiczny', skrot: '…', spor: true }] });
rz.pisze(true, ['Terapeutka CBT', 'Strażnik ryzyka']);  // pasek „Zespół pracuje: N” + dymek „Terapeutka pisze…”; false chowa
rz.kryzys(poziom);   // 0–2 nic; 3 = ramka z numerami 112 / 800 70 2222 / 116 123; 4 = to samo + wstrzymane pisanie (BEZPIECZENSTWO.md, poziom 4)
rz.wczytaj(tury);    // cała historia, np. z rozmowa.jsonl po ponownym otwarciu
```
`kulisy` = zwijane „Jak zespół do tego doszedł” (domyślnie zamknięte – na wierzchu jeden głos); `spor: true` podświetla rozbieżne zdanie.

## Wstawienie do aplikacji
1. Skopiuj `rozmowa.css` i `rozmowa.js` do modułu Rozmowy (lub wklej w build jak `pokoj.css`/`pokoj.js`).
2. W HTML zakładki: `<main id="rozmowa"></main>` o wysokości widoku (komponent ma `height:100%`).
3. Podłącz `onWyslij` do zapisu tury i nasłuchu odpowiedzi (np. co 2–3 s czytanie `rozmowa.jsonl` jak „Na żywo” w Pokoju) → `rz.pisze(true, agenci)` gdy Claude pracuje, `rz.dodaj({kto:'terapeuta',…})` + `rz.pisze(false)` po odpowiedzi, `rz.kryzys(poziom)` z pola poziomu ryzyka.
4. Stopka „to nie jest terapia, 112” jest stała w komponencie.
