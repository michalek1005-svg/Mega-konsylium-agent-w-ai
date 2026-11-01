# Ekran startowy „Dla Halusi ❤” – TYLKO wersja 1 (0.1.x)

Decyzja Michała (1.11.2026, 04:32–04:34): wielki czerwony prezent ze wstążką na całym ekranie → klik → z prezentu wylatują zrzuty ekranów aplikacji (kolaż, wygaszają się jeden po drugim) → „Dla Halusi ❤” i ekran w sercach → aplikacja. **Tylko w pierwszej wersji, potem usunąć.**

- Grafika i animacja: `prezent-start.html` (wątek Graficzny). `zbuduj.mjs` wycina z niego styl, scenę i skrypt i wkleja do powłoki.
- Zrzuty do kolażu: `zrzuty/*.jpg` (zrzuty tej aplikacji); gdy katalog jest pusty, zostają zrzuty z pliku Graficznego.
- **Jak usunąć w wersji 2:** w `powloka/zbuduj.mjs` ustaw `const PREZENT = false;` (albo usuń katalog `prezent/`). Nic innego nie trzeba zmieniać.
