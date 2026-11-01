# Gotowe pliki aplikacji MS Konsylium Psychologiczne 0.1.3 (bez budowania)

Wynik `node aplikacja/powloka/zbuduj.mjs` = zawartość `resources\app`. Generowany automatycznie – nie edytować ręcznie (po zmianach: zbudować i skopiować `aplikacja/powloka/build/` tutaj).

Wdrożenie na Windows bez node i gita:
1. Skopiuj CAŁY folder działającej aplikacji MS Konsylium (Electron 38.0.0 – ta sama wersja) do nowego folderu `MS-Konsylium-Psychologiczne`.
2. W kopii usuń zawartość `resources\app` i wgraj tam zawartość tego katalogu.
3. Uruchom exe z kopii. Nazwa w package.json („MS Konsylium Psychologiczne”) daje osobne ustawienia w `%APPDATA%\MS Konsylium Psychologiczne` i port iPada 8766 – nie koliduje z MS Konsylium.
Folder pracy dla Claude: katalog `ms-psycho/` z tego samego commitu (bez `aplikacja/`, wystarczą CLAUDE.md, .claude, config, docs, skrypty, zrodla-psycho, przypadki-testowe).
