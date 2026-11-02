# Pokój psychologiczny – grafika (wątek Graficzny, 1.11.2026 ok. 04:40)

Makieta: `makieta-psycholog-1.png` (źródło: `zrodlo/makieta-psycholog.html`, postacie z `../postacie/postacie.mjs`).
Nazwa widoku: **Pokój psychologiczny** (nie „gabinet”, nie „lekarski”). Tryb jasny domyślnie, styl Nawigatora (szklana tafla, pasek okrągłych ikon, neonowe K).

## Paleta (zamiast petrolu Konsylium)
- tło aplikacji: #F1EEF5 → #DDD6E6, akcent lawenda #8A7FB5 / #5B4A8A (nagłówki, ikony), szałwia #9FBF9A, piasek #F0CFA6, róż #D99A8C, błękit #8FB6C9
- ściany #F7F2EA → #EBE2D6, podłoga drewno #D9C7B2 → #C4AD93, dywan #E8DCD0
- ściana wideo: ciemny fiolet #2B2540 → #1E1A2E w ramie #F1E9DF; kolumny STAN PRAC / USTALENIA / ODRZUCONE jak w Pokoju lekarskim (te same klasy #tablica .etap/.ustalenia/.skreslone), nagłówki #CDB9E6, odrzucone #F0A9A0

## Scena (ten sam układ i logika co Pokój lekarski)
- zamiast stołu konferencyjnego: krąg 7 miękkich foteli + niski stolik (chusteczki, woda, notatniki); lampa podłogowa z ciepłym światłem, regał z książkami, okno z ogrodem, rośliny; zero elementów szpitalnych (bez stetoskopów, fartuchów, ekspresu, drukarki)
- pozycje postaci: prow (600,470), a (440,452), b (760,452), c (262,566), d (938,566), e (470,668), f (730,668), prowadzący‑użytkownik (1040,672); skala 0.76
- postacie: ta sama funkcja `lekarz()`/`postacSVG()` – usunąć stetoskop, fartuch w kolorze ubrania (sweter/marynarka), identyfikator zostaje; 4 kobiety + 4 mężczyźni, rasa biała
- prowadzący konsylium: starszy, siwy, okulary, bez fajki (w pokoju psychologicznym nie pali); „bajer” zamiast fajki do ustalenia (np. kubek herbaty, który paruje co 20 s)
- użytkownik: „Psycholog prowadzący (Ty)” – mężczyzna z teczką, jak w Konsylium
- role na makiecie (do podmiany wg definicji wątku Psychologa): Diagnosta, Terapeutka CBT, Psychiatra, Terapeutka rodzinna, Psycholożka kliniczna, Interwent kryzysowy
- etapy na tablicy: Wywiad → Triage (pilność/ryzyko) → Konsylium rundy → Plan wsparcia → Wnioski
- dymki: białe, nagłówek w kolorze roli; przerwa/pisanie na laptopach – w tym pokoju terapeuci piszą w notatnikach (animacja ręki), wychodzą po 90 s jak w Konsylium

## Do wdrożenia w kodzie (gdy wątek Psychologa wskaże katalog)
1. kopia narzedzia/pokoj-lekarski → pokoj-psychologiczny, podmiana tokenów w src/pokoj.css (`--akcent`, tła), 2. rysujPokoj: nowa scena wg makiety, 3. postacie.js: flaga `bezFartucha` + kolor ubrania, 4. teksty: „Pokój psychologiczny”, „Narada” zostaje.
