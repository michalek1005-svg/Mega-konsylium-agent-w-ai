# Pakiet grafiki: Pokój psychologiczny (wątek Graficzny, 1.11.2026 ~05:00)

Zrobiony na kopii `narzedzia/pokoj-lekarski` z gałęzi PR #5 (stan f4fc3ce, ta sama struktura co claude/project-thread-084z7k).
Wszystko sprawdzone: `node build.mjs` OK, `npm test` 12/12, `npm run test:e2e` 3/3 (Chromium). Zero adresów sieciowych.

## Co wstawić (zamienniki 1:1)
- `src/pokoj.css` – paleta „Lawenda” (tryb jasny domyślny: tło #F1EEF5→#DDD6E6, akcent #5B4A8A, ściana wideo #2B2540/#1E1A2E, nagłówki kolumn #CDB9E6, odrzucone #ff9a8c); tryb ciemny też przerobiony. Te same klasy i id.
- `src/postacie.js` – terapeuci bez fartuchów i stetoskopów: `ubranie`/`ubranieCien` (sweter, marynarka), `swobodny` (koszulka – ACT), `tablet` (CBT), `laptop` (diagnosta), `identyfikator` (psychiatra), `herbata` (prowadzący – kubek z parą zamiast fajki). Klucze = id ról z `scenariusz.mjs`; mapowanie na Twoje 8 ról jest w komentarzach przy wpisach – jeśli zmieniasz id ról w ROLE, zmień klucze w `POSTACIE_WYGLAD` i w `MIEJSCA` (pokoj.js).
- `src/pokoj.js` – zmienione TYLKO: `MIEJSCA` (nowe miejsce `psychiatra` 318,470 – 8. fotel; działa, gdy rola `psychiatra` istnieje w ROLE), `rysujPokoj()` (scena), podpisy w legendzie `rysujLegende`, nazwa dymka użytkownika „Terapeuta prowadzący”, 1 linia w `klebDymu` (bez dymu, gdy nie ma fajki). Reszta logiki (przerwa, pisanie, prognoza, protokół, na żywo) bez zmian.
- `test/e2e-powloka.mjs`, `test/e2e-przerwa.mjs` – 3 asercje: fajka → `.herbata`, „Lekarz prowadzący” → „Terapeuta prowadzący”.
- `zmiany-wobec-pokoju-lekarskiego.patch` – ten sam zestaw jako diff -u (do `patch -p0` w katalogu `narzedzia/pokoj-lekarski`).
- `POKOJ-PSYCHOLOGICZNY-podglad.html` – zbudowany plik do obejrzenia (jeszcze z nazwami ról i scenariuszem Konsylium – scenariusz.mjs jest Twój).

## Scena (id/klasy zachowane dla logiki)
`.led` (ciepłe światło), `#ekran-sciana` = okno z ogrodem (po „Prognozy” pokazuje `#prognoza` – u Ciebie „zgodność kierunku pracy %”), `.komoda` = kącik herbaciany (czajnik `.para`, filiżanki, chusteczki, książki, roślina), `#plakat` = pastelowy pejzaż (cmok ordynatora na koniec działa dalej – jeśli niepotrzebny, wyłącz wywołanie `cmokPlakat`), ściana wideo w miękkiej ramie (`#tablica` HTML bez zmian), zegar, drzwi z napisem STAŻYSTA (postacie R1–R3 jak rezydenci), biurko konsultantów po prawej (s_fakty, s_proces), krąg 8 foteli (`.krzesla`) i niski stolik z chusteczkami/wodą/notatnikami, notatniki terapeutów w klasie `.laptop` (animacja „piszą” działa), `.kubki` herbaty + `.narada-znak` w przerwie, `#dym` pusty, `.biurko-prowadzacego`, rośliny.

## Poza moimi plikami (do zrobienia u Ciebie)
- `szablon.html`: tytuł „Pokój psychologiczny”, logo K z neonem lawendowym – wystarczy, że K używa `var(--petrol)`/gradientu z `.logo` (w pokoj.css gradient już jest #7b6cc4→#5B4A8A); napis stopki bez „lekarzy”.
- Etapy na ścianie (Wywiad → Ryzyko → Konsylium → Plan wsparcia → Wnioski) i „Mapa zgody” zamiast rankingu – to treść `scenariusz.mjs`/`rysujTablice` danych, nie grafika; kolumny tablicy wyświetlą, co dostaną.
- Ekran startowy „Dla Halusi”: `../prezent/prezent-start.html` (tylko wersja 1).
- Okno Rozmowy: makieta `../makieta-rozmowa.png`, źródło `../zrodlo/makieta-rozmowa.html` (CSS do przeniesienia: klasy `.pracuje`, `.msg.zespol/.ja`, `.wpis`, `.zwolaj`).
