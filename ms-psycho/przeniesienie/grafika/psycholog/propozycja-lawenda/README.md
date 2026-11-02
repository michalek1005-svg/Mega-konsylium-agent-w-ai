# Propozycja: domknięcie palety „Lawenda” (wątek Graficzny, 2.11.2026)

**Stan:** czeka na decyzję Michała. Nic z tego katalogu nie jest jeszcze w aplikacji.

## Co sprawdziłem
Aplikacja 0.3.0 już jest lawendowa: `aplikacja/wspolne/ms-tokeny-psycho.css` nakłada lawendę na morską paletę MS
„Laguna” (`ms-tokeny.css`). Makieta porównawcza (zrzuty prawdziwej aplikacji z `node zbuduj.mjs --bez-paczki`):
`/mnt/project-files/psycho-grafika/makiety-2026-11-02/makieta-lawenda-porownanie.png`.

Resztki palety „Laguna”, które zostały:
1. **Litera K w rogu jest miętowo‑zielona** (tryb jasny). Reguła w `aplikacja/powloka/app/index.html` (ok. wiersz 118)
   obraca barwę o 80°, a źródło `logo-k-7b-jasny.svg` jest beżowe – beż + 80° daje zieleń, nie lawendę.
   Obrót o 220° daje lawendę (ok. #8A7FB5). Tryb ciemny (biały neon) jest w porządku.
2. **Nakładka nie nadpisuje 24 zmiennych** (np. `--strona-cien` ma morski cień `rgba(10,54,52,…)`). Dziś żaden ekran
   psychologiczny ich nie używa, więc tego nie widać – ale każdy nowy ekran, który ich użyje, dostanie morski odcień.

## Pliki
- `ms-tokeny-psycho.css` – zamiennik 1:1 dla `aplikacja/wspolne/ms-tokeny-psycho.css`. Wszystkie dzisiejsze wartości
  zostają bez zmian (zrzuty przed/po są identyczne poza literą K); dopisane brakujące zmienne z `../ms-tokeny-lawenda.css`.
- `logo-k-lawenda.css` – nowa reguła `.logo-k img` (220° zamiast 80°).

## Jak wdrożyć (Kodujący, po akceptacji)
1. Skopiuj `ms-tokeny-psycho.css` do `aplikacja/wspolne/`.
2. W `aplikacja/powloka/app/index.html` zamień `hue-rotate(80deg)` na `hue-rotate(220deg)` w regule `.logo-k img`
   (pod komentarzem „K w lawendzie”).
3. Testy jak zwykle (`node zbuduj.mjs`, e2e, test_frazy 80/80, test_030, Pokój 12/12).
