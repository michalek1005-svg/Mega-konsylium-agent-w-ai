# 08 — Odpowiedź ordynatora rezydentom

## R1 (psychiatra konsultujący)
1. Brakujące dane (ból w klatce/duszność/poty/wysiłek, >6 h, ciąża/menopauza, rodzinne zawały, palenie) — **PRZYJMUJĘ** częściowo: palenie i wywiad rodzinny w kierunku choroby wieńcowej nie były zebrane; dopisuję do CZEGO NIE WIEMY. Ból w klatce/duszność/poty były zebrane (tura 2). Kategoria: brak_danych. Hasło: czynniki-ryzyka-wiencowe.
2. OZW ściany dolnej, troponiny brak — **PRZYJMUJĘ, ZMIENIA DECYZJĘ**: prawidłowe EKG nie wyklucza OZW; dodaję troponinę wysokoczułą do dzisiejszego pakietu. Kategoria: hipoteza. Hasło: troponina-przy-bolu-w-nadbrzuszu.
3. Wynik „tego samego dnia” i 72 h na USG wyglądają na logistykę — **PRZYJMUJĘ**: 72 h było ustaleniem zespołu, nie progiem z wytycznej; oznaczam jako ustalenie konsylium. Uwaga o odpowiedziach bez pytań („Brak”, „Nie”) — **PRZYJMUJĘ** jako sygnał dla aplikacji (pakiet powinien mieć tematy pytań bez ich treści). Kategoria: zalozenie. Hasło: okno-usg-logistyka.

## R2 (lekarz SOR)
1. Wysiłkowość, rodzina, palenie, cukrzyca; nowe leki hepatotoksyczne — **PRZYJMUJĘ** (palenie, cukrzyca, rodzina, nowe leki w ostatnich tygodniach) do CZEGO NIE WIEMY. Kategoria: brak_danych. Hasło: czynniki-ryzyka-wiencowe.
2. OZW, brak troponiny — **PRZYJMUJĘ** (jak R1.2, ta sama zmiana decyzji). Kategoria: hipoteza. Hasło: troponina-przy-bolu-w-nadbrzuszu.
3. 72 h przy dodatnim Murphym to odroczenie z nawyku; jedno EKG bez troponiny nie wyklucza — **PRZYJMUJĘ**: skracam okno USG do „dziś lub najpóźniej jutro”, a przy braku dostępu — izba przyjęć dziś. Kategoria: zalozenie. Hasło: okno-usg-logistyka.

## R3 (internista z USA)
1. Nasilenie bólu teraz (0–10), >6 h, promieniowanie do pleców/klatki, wysiłek, cukrzyca, rodzina, ciąża, zmiana masy ciała, wcześniejsze USG; brak SpO₂ i glikemii — **PRZYJMUJĘ**: nasilenie bólu (S z SOCRATES, braki wskazał też sprawdzający procesu), zmiana masy ciała (flaga nowotworowa), wcześniejsze USG, glikemia do pakietu. ODRZUCAM SpO₂ jako element zmieniający decyzję u pacjentki bez duszności. Kategoria: brak_danych. Hasło: nasilenie-bolu-i-masa-ciala.
2. OZW, brak troponiny — **PRZYJMUJĘ** (jak R1.2). Kategoria: hipoteza. Hasło: troponina-przy-bolu-w-nadbrzuszu.
3. Próg lipazy >3× GGN „amerykański” — **ODRZUCAM**: to kryterium z rewizji klasyfikacji z Atlanty 2012 (międzynarodowe), stosowane też w Polsce; oznaczam źródło. Bezpieczeństwo 72 h — **PRZYJMUJĘ** (jak R2.3). Kategoria: zalozenie. Hasło: okno-usg-logistyka.

## Zmiana decyzji
Tak: troponina wysokoczuła dołączona do dzisiejszego pakietu; USG dziś/jutro zamiast ≤72 h. Wpis `rewizja_projektu` w `_log.jsonl`.
