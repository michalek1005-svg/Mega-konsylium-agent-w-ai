# Anonimizator wyników badań (Synevo) — Konsylium AI

Narzędzie offline do usuwania danych osobowych z wyników badań laboratoryjnych, zanim trafią do konsylium.
Cała aplikacja to **jeden plik HTML**: `ANONIMIZATOR-WYNIKOW-<wersja>.html`. Otwierasz go w Chrome albo Edge (dwuklik) i działa bez internetu.

## Jak używać

1. Otwórz plik `ANONIMIZATOR-WYNIKOW-0.1.0.html`.
2. Przeciągnij na okno wynik z Synevo: PDF (e-wynik) albo zdjęcie lub skan (JPG, PNG).
3. Narzędzie zaznaczy kolorowo, co proponuje zakryć. Lista po prawej jest pogrupowana:
   - **domyślnie zakrywane:** imię i nazwisko pacjenta (także powtórzenia w stopce), PESEL i dokumenty, data urodzenia, adres, telefon i e-mail, numery zlecenia i próbki, kod dostępu do wyników, kody kreskowe i QR, lekarz i zleceniodawca, podpisy personelu laboratorium;
   - **domyślnie zostają** (bo pomagają lekarzom): daty pobrania i wydania, punkt pobrań, płeć, wiek i oczywiście same wyniki z normami.
4. Poprawiasz ręcznie:
   - **przeciągnięcie** myszą po stronie zakrywa dowolny prostokąt,
   - **dwuklik** na słowie zakrywa to słowo,
   - **kliknięcie** ramki wyłącza ją albo włącza z powrotem, a krzyżyk usuwa Twoją ramkę,
   - pole **„Twoje frazy”** znajduje i zakrywa wpisane słowa w całym dokumencie, bez względu na wielkość liter i polskie znaki,
   - **Ctrl+Z** cofa zmianę.
5. **Podgląd efektu** pokazuje stronę tak, jak będzie wyglądała po zapisie.
6. Zapis:
   - **Zapisz zanonimizowany PDF.** Każda strona jest zapisywana jako obraz z czarnymi polami. Zakrytego tekstu nie da się odzyskać ani zaznaczyć, a metadane oryginału nie są przenoszone. Plik dostaje neutralną nazwę `wynik-zanonimizowany-RRRR-MM-DD.pdf`, bez nazwiska z nazwy oryginału.
   - **Kopiuj tekst dla konsylium** albo **Zapisz tekst (.txt)**. Tekst wyniku trafia tam z `[USUNIĘTO]` w miejscu zakrytych słów i można go wkleić do czatu konsylium.

> Automat może coś przeoczyć, zwłaszcza na krzywych zdjęciach. Zawsze przejrzyj „Podgląd efektu” przed wysłaniem.

## Prywatność

- Wszystko dzieje się w przeglądarce, na Twoim komputerze. W plik są wbudowane: pdf.js (czytanie PDF), Tesseract.js z polskim słownikiem (OCR zdjęć), pdf-lib (zapis PDF) i krój Plus Jakarta Sans.
- Nagłówek `Content-Security-Policy` (`connect-src blob: data:`, `default-src 'none'`) sprawia, że przeglądarka **nie pozwoli** stronie połączyć się z żadnym serwerem.
- `build.mjs` przerywa budowę, jeśli w kodzie aplikacji pojawi się adres sieciowy.
- Aplikacja niczego nie zapamiętuje: nie używa localStorage, ciasteczek ani pamięci podręcznej OCR. Wybór motywu też nie jest zapamiętywany.

## Jak wykrywane są dane (`src/wykrywanie.js`)

- **Etykiety formularza** w układzie wydruku Synevo, m.in. „Pacjent:”, „Imię i nazwisko”, „PESEL”, „Data urodzenia”, „Adres”, „Tel.”, „Nr zlecenia”, „Kod dostępu”, „Lekarz kierujący”, „Zleceniodawca”, „Autoryzował”, „Punkt pobrań”, „Data pobrania”. Zakrywana jest wartość za etykietą (albo pod nią), a sama etykieta zostaje, więc lekarz widzi, czego brakuje.
- **Wzorce:** PESEL ze sprawdzeniem sumy kontrolnej, długie numery, kody z literami i cyframi, telefon, e-mail, kod pocztowy z miejscowością, ulica z numerem.
- **Tytuły** „lek.”, „dr”, „mgr”, „prof.” razem z nazwiskiem.
- **Powtórzenia** imienia i nazwiska pacjenta w całym dokumencie.
- **Kody kreskowe i QR** wykrywane na obrazie strony (gęste pionowe paski albo kwadratowa „szachownica”).
- Wyniki liczbowe (np. `6,45`, `13,5 - 17,5`) nie są zakrywane. Sprawdza to test.

Listę etykiet (`ETYKIETY`) łatwo rozszerzyć. Jeśli na Twoim wydruku Synevo coś nie zostanie wykryte, dopisz etykietę i dodaj przypadek do testów.

Ten sam moduł działa na zwykłym tekście, np. na wywiadzie pisanym własnymi słowami:
`wykryjWTekscie(tekst, { frazy }) → [{ od, do, kategoria, powod, tekst }]` i `zanonimizujTekst(tekst, zakresy)`.

## Budowa i testy

```bash
cd narzedzia/anonimizator
npm ci
node build.mjs          # → ANONIMIZATOR-WYNIKOW-<wersja>.html + SHA256.txt
npm test                # reguły wykrywania (Node, bez przeglądarki)
node test/e2e.mjs       # prawdziwa przeglądarka (Playwright + Chromium)
```

Test e2e tworzy z fikcyjnego wyniku `test/przyklad-synevo.html` (wszystkie dane są zmyślone) plik PDF z warstwą tekstu oraz zdjęcie PNG. Potem otwiera aplikację z dysku (`file://`) i sprawdza:

- czy padło zero żądań sieciowych,
- czy dane osobowe zostały wykryte, a wyniki zostały na miejscu,
- czy działa ręczna ramka i cofanie,
- czy zapisany PDF nie ma warstwy tekstu ani danych.

Zrzuty ekranu trafiają do `test/wyniki/`.

## Wygląd

Wspólne tokeny marki MS (paleta „Laguna”, tryb ciemny, przyciski) są w `../wspolne/ms-tokeny.css`. To kopia z Nawigatora Medycznego i z tego pliku korzysta też moduł Wywiad. Domyślny jest motyw ciemny, a przycisk „Motyw” przełącza na jasny.
Logo „K” jest na razie zastępcze (litera na płytce w kolorze petrol). Właściwe `MsLogo` czeka na decyzję Michała.

## Co dalej

- Powłoka na Windows (przenośny .exe z modułami Wywiad i Anonimizator) powstaje w wątku wywiadu. Ten plik HTML wchodzi do niej bez zmian.
- Sprawdzić reguły na prawdziwym wydruku Synevo. Można to zrobić lokalnie u Michała, bo plik nigdzie nie wychodzi, i dopisać brakujące etykiety.
