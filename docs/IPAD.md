# MS Konsylium na iPadzie (iPad Air)

iPad otwiera **tę samą aplikację** (Wywiad, Anonimizator, Pokój lekarski z Wnioskami) w Safari, a dane
obsługuje aplikacja MS Konsylium na komputerze z Windows. Nie ma osobnego kodu: iPad dostaje tę samą
powłokę (`narzedzia/powloka/app/index.html`, wersja `ipad.html`) i te same moduły.

## Jak włączyć

1. Na komputerze w MS Konsylium stuknij ikonę **iPada** na pasku po lewej → **Udostępnij na iPadzie**.
   Przy pierwszym razie Windows zapyta o zaporę: zezwól dla **sieci prywatnych**.
2. Na iPadzie (ta sama sieć Wi‑Fi) otwórz Aparat i zeskanuj kod QR.
3. W Safari: Udostępnij → **Do ekranu początkowego**. Ikona „MS Konsylium” otwiera aplikację na cały ekran.

Udostępnienie jest **domyślnie wyłączone**, a wybór jest zapamiętany (po ponownym uruchomieniu wraca
taki, jaki był). **Nowy kod** unieważnia stary: każdy iPad trzeba wtedy sparować jeszcze raz.

## Jak to działa

- `narzedzia/powloka/serwer-ipad.js`: serwer HTTP w procesie głównym aplikacji (port 8765).
  Serwuje `ipad.html` i moduły, a pod `/api/<operacja>` wykonuje te same operacje na plikach, co okno
  Windows (`PLIKI` w `main.js`: folder, czytaj, zapisz, lista, czytajFolder), tylko w folderze Konsylium.
- `narzedzia/powloka/app/ipad-most.js`: na iPadzie zastępuje `preload.js` (`window.msPowloka` przez `fetch`).
  Moduły nie wiedzą, że są na iPadzie: dalej używają `MsMost` przez powłokę.
- Folder Konsylium wybiera się tylko na komputerze. Na iPadzie widać, który jest używany.

## Bezpieczeństwo

- Odpowiada tylko adresom z sieci lokalnej (10/8, 172.16/12, 192.168/16, link-local, loopback).
- Dane tylko z kluczem parowania (z kodu QR, 18 losowych bajtów) w nagłówku `X-MS-Klucz`; bez niego 403.
- Serwer niczego nie pobiera z internetu; okno Windows dalej ma zablokowaną sieć.
- Połączenie iPad ↔ komputer idzie po `http` w sieci domowej (bez szyfrowania TLS). Używaj w zaufanej
  sieci Wi‑Fi, nie w publicznej. Gdy nie używasz iPada, wyłącz udostępnianie.
- Schowek: Safari nie daje `navigator.clipboard` po `http`, więc powłoka iPada podstawia kopiowanie
  przez `execCommand('copy')`.

## Gdy coś nie działa

- „Brak połączenia z komputerem”: aplikacja na PC wyłączona, udostępnianie wyłączone albo inna sieć Wi‑Fi.
- Zmienił się adres komputera (router nadał nowy IP): zeskanuj nowy kod QR z panelu iPada na PC.
- „Port 8765 jest zajęty”: inny program używa portu; zamknij go albo uruchom z `MS_IPAD_PORT`.

## Test

`cd narzedzia/powloka && node zbuduj.mjs --bez-paczki && xvfb-run -a node test/e2e-ipad.mjs`
(ekran iPada Air 820×1180 i 1180×820, dotyk; wywiad na żywo, Pokój, Wnioski, Anonimizator, 403 bez klucza).

## Aplikacja natywna z App Store

Wymagałaby Maca z Xcode i konta Apple Developer (99 USD/rok), a dane i tak musiałyby iść z komputera
(Claude pracuje w folderze Konsylium na PC). Wersja przez Safari daje to samo bez tych kosztów.
