# Odpowiedź ordynatora rezydentom i Sprawdzającemu faktów — TEST-2026-11-01-06

## Rezydent 1 (persona: pediatra)

**R1.1 Brak danych: świadek epizodu, zwykłe ciśnienie na amlodypinie, płyny/diureza/kolor moczu/gorączka, okoliczności początku bólu.**
PRZYJMUJĘ (częściowo) — kategoria: brak_danych, hasło: ciśnienie wyjściowe. Powód: ciśnienie wyjściowe i podaż płynów faktycznie nie zostały zebrane i trafiają do CZEGO NIE WIEMY; diureza, kolor moczu i gorączka były zapytane (odpowiedzi: „nic nietypowego”, „nie”). Zmienia decyzję: NIE — żadna z tych danych nie wyklucza pękniętego tętniaka ani nie obniża pilności z 1.

**R1.2 Hipoteza niewypowiedziana: hipotensja i tachykardia z odwodnienia, bólu, ketoprofenu i amlodypiny, nie z krwawienia; brak planu na ujemne angio-TK.**
Część A (odwodnienie/leki): ODRZUCAM — kategoria: hipoteza, hasło: hipowolemia niekrwotoczna. Powód: hipoteza była rozważona (farmakolog, runda 1) i nie da się jej potwierdzić w POZ, a wskaźnik wstrząsowy ≥1,0 jest niezależnie związany z pęknięciem tętniaka (aOR 5,3, PMID 32674713), więc do czasu obrazowania musi być traktowana jak krwawienie. Zmienia decyzję: NIE.
Część B (ujemne angio-TK): PRZYJMUJĘ — kategoria: zalozenie, hasło: plan na ujemny wynik. Powód: 05-projekt wspominał tylko krwiak i rozwarstwienie; w PLANIE B dopisuję zakażoną zablokowaną nerkę (urosepsę) i niedokrwienie krezki jako kolejne rozpoznania do wykluczenia przy utrzymującym się obrazie wstrząsu. Zmienia decyzję: NIE (uzupełnia plan B).

**R1.3 Założenie: wywiad sugerujący; zakaz analgezji jako nawyk „nie maskować brzucha”.**
Część A (wywiad sugerujący): ODRZUCAM — kategoria: zalozenie, hasło: jakość ankiety. Powód: odpowiedzi pochodzą z ankiety o stałych pytaniach („Jakie było górne ciśnienie?” → „104 mmHg”), a decyzja opiera się na zbieżności czterech niezależnych sygnałów (charakter bólu, presynkopa, parametry, profil ryzyka), nie na jednej odpowiedzi. Zmienia decyzję: NIE.
Część B (zakaz analgezji): ODRZUCAM — kategoria: zalozenie, hasło: analgezja przedszpitalna. Powód: konsylium nie zakazuje analgezji, tylko przenosi ją do ZRM/SOR (opioid dożylny miareczkowany), a zakaz dotyczy wyłącznie kolejnego NLPZ doustnie przy ASA i nieznanej dawce ketoprofenu z hipoperfuzją — w FINAL doprecyzowuję to zdanie, by nie brzmiało jak „nic na ból”. Zmienia decyzję: NIE.

## Sprawdzający faktów (07-sprawdzenie.json, kartka ŻÓŁTA)

1. Wskaźnik wstrząsowy — zastąpić etykietę PMID 32674713: PRZYJMUJĘ (źródło potwierdzone przez Sprawdzającego). Nie zmienia decyzji.
2. Próg 30 mm — cytować ESVS 2024 (PMID 38307694, poziom 3): PRZYJMUJĘ, z dopiskiem „wytyczna europejska, polskiej brak”. Nie zmienia decyzji.
3. aOR 4,71 (PMID 38040202) — dopisać populację (wstrząs krwotoczny, transport międzyszpitalny) i oznaczyć „nie podawać leków hipotensyjnych” jako wniosek konsylium: PRZYJMUJĘ; w FINAL skracam do zdania bez liczby, z zastrzeżeniem ekstrapolacji. Nie zmienia decyzji.
4. „Tętno <100/min” w PLANIE B — BEZ_ZRODLA: PRZYJMUJĘ, zastępuję wskaźnikiem wstrząsowym <1,0 (PMID 32674713). Nie zmienia decyzji.
5. Interakcja ASA + ketoprofen — BEZ_ZRODLA: PRZYJMUJĘ etykietę [wiedza modelu, niezweryfikowane] do czasu dodania ChPL ketoprofenu do zrodla/. Nie zmienia decyzji.
6. Sugestia dodania ChPL ketoprofenu, ChPL ASA 75 mg i ESVS 2024 do zrodla/: przekazuję użytkownikowi (poza FINAL).

**Wynik:** rekomendacja, pilność i plan bez zmian względem 05-projekt.md; zmiany w 09-FINAL są redakcyjne i źródłowe (plan B rozszerzony, kryterium stabilności ze źródłem, etykiety). Żadna uwaga nie zmienia decyzji — powrót do kroku 4 niepotrzebny.
