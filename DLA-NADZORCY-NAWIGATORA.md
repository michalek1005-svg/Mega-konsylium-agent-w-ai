# Przekaz dla nadzorcy projektu Nawigator Medyczny

> Od: Michał (przez sesję Claude, 31.10.2026). Do: agent nadzorujący Nawigator Medyczny w Claude Code.
> Michał: wklej ten plik do katalogu Nawigatora (np. jako `docs/MARKA-MS.md`) albo wklej jego treść do rozmowy z nadzorcą i napisz: „przeczytaj i potwierdź, co zmienia to w Twojej pracy".

## Co się zmienia — w trzech zdaniach

1. Nawigator Medyczny **nie jest już samodzielną aplikacją**, tylko jedną z aplikacji marki **„MS"**.
2. W marce MS są na dziś **dwie aplikacje**: **Gabinet** (= dzisiejszy Nawigator Medyczny: notatki, chmurki, NawigatorHelper — bez zmian funkcji) i **Konsylium AI** (nowa, testowo-edukacyjna: wieloagentowe konsylium lekarskie do zbierania wiedzy i publikacji; **nie do realnych pacjentów**). Planowana jest trzecia.
3. Obie mają być **bliźniacze graficznie**: ten sam język wizualny, ten sam nagłówek, to samo logo — w Nawigatorze litera **„N"**, w Konsylium **„K"**, w identycznym miejscu i formie.

## Co to znaczy dla Ciebie (nadzorcy Nawigatora)

- **Nie zmieniaj nic w funkcjach Nawigatora z tego powodu.** Gabinet działa jak dziś.
- **Twój styl staje się wzorcem marki.** Zespół Konsylium (osobny projekt Claude Code w katalogu `konsylium-ai/`) wyśle do Ciebie agenta-badacza (`badacz-nawigatora`), który **tylko czyta** kod Nawigatora i wyciąga: kolory, cienie neumorficzne, zaokrąglenia, fonty, odstępy, komponenty (przycisk, karta, chmurka, pole, nagłówek) i komponent logo z „N". Nie będzie niczego edytował. Jeśli zapyta o ścieżki plików albo o to, „dlaczego tak" — odpowiedz; jeśli poprosi o zmianę — odmów i odeślij do Michała.
- **Powstanie wspólny pakiet `ms-ui`** (tokeny + komponenty + logo z literą jako parametrem). Na początku to będzie **kopia** Twoich komponentów z adnotacją źródła. **Nawigator nie musi na niego przechodzić** — to decyzja Michała na później. Jeśli Michał zdecyduje, że tak: przejście ma być małymi krokami (najpierw tokeny, potem logo, potem komponenty), z zrzutami ekranu przed/po, żeby nic nie drgnęło wizualnie.
- **Logo.** Od teraz litera w logo jest **parametrem**, nie stałą. Jeśli u Ciebie „N" jest wpisane na sztywno (w SVG, w JSX, w CSS) — **nie zmieniaj tego sam teraz**, ale zapisz w swoim dzienniku, gdzie dokładnie jest, żeby przejście na `<MsLogo litera="N" />` było jedną zmianą. Jeśli obok litery ma pojawić się wspólny znak „MS" — to decyzja Michała; nie dodawaj sam.
- **Ciemny motyw.** Michał w innym projekcie prosił o kolory ciemne i stonowane (jasne „bolały w oczy"). Jeśli Nawigator ma tryb ciemny — będzie prawdopodobnie domyślnym w Konsylium. Jeśli nie ma — Michał może poprosić o niego w obu aplikacjach; wtedy robicie go **raz**, w `ms-ui`, nie dwa razy osobno.
- **Spójność ponad gust.** Jeśli zespół Konsylium zgłosi, że coś w Twoim stylu wygląda dziwnie — nie poprawiaj po cichu u siebie i nie pozwól poprawiać po cichu u nich. Obie zmiany idą przez Michała, żeby aplikacje nie rozjechały się.
- **NawigatorHelper** (przenoszenie tekstu do okna gabinetu skrótem) — Konsylium prawdopodobnie zechce użyć tego samego mechanizmu do kopiowania swojej karty FINAL. Jeśli zespół Konsylium zapyta, jak to działa — opisz interfejs (co trzeba wywołać, w jakim formacie tekst). Nie przebudowuj Helpera pod nich bez Michała.

## Czego od Ciebie potrzebuje zespół Konsylium (możesz przygotować z wyprzedzeniem)

1. Ścieżka do repo Nawigatora i polecenie uruchomienia lokalnie.
2. Lista plików: tokeny/zmienne stylu, komponenty UI, komponent nagłówka, komponent/plik logo.
3. Wersje: Next.js, React, Tailwind (jeśli jest), inne biblioteki UI.
4. Czy jest tryb ciemny i jak się przełącza.
5. Zrzuty ekranu 3–4 głównych widoków (do porównania „obok siebie" z Konsylium).

Zapisz to w jednym pliku `docs/DLA-KONSYLIUM.md` w projekcie Nawigatora. Zespół Konsylium zacznie od niego.

## Czego nie robić

- Nie zmieniać nazwy aplikacji ani brandingu w interfejsie Nawigatora samodzielnie (np. nie dopisywać „MS Gabinet" w nagłówku) — Michał zdecyduje, jak marka ma być widoczna.
- Nie przenosić Nawigatora do monorepo, nie zmieniać struktury katalogów „pod markę" bez wyraźnego polecenia.
- Nie wprowadzać zależności od `ms-ui`, dopóki pakiet nie istnieje i Michał nie powie „przechodzimy".

## Jedno zdanie do potwierdzenia Michałowi

Po przeczytaniu odpowiedz Michałowi prostym językiem: co rozumiesz, że się zmienia, co zrobisz od razu (przygotowanie `docs/DLA-KONSYLIUM.md`), a co czeka na jego decyzję (przejście na `ms-ui`, znak „MS", tryb ciemny). Maksymalnie 5 zdań.
