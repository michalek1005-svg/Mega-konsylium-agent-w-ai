# Część A — infekcja (nowa ślepa tura)

Lekarz POZ skorygował pytanie: GŁÓWNYM problemem jest INFEKCJA, alergia to wątek dodatkowy (już omówiony w części B).
Przeczytaj ponownie ../01-wywiad.md (sekcja „PYTANIE WIODĄCE” i „Infekcja — dane”).

ŚLEPA TURA: nie czytaj innych plików w A-infekcja/03-opinie/.

Zadanie (z perspektywy Twojej roli):
1. Etiologia infekcji: kandydaci z p (suma ≤1) w polu `rozpoznania`. Używaj DOKŁADNIE tych nazw, gdy pasują:
   „grypa”, „COVID-19”, „zakażenie RSV”, „inne wirusowe zakażenie dróg oddechowych”, „adenowirusowa gorączka gardłowo-spojówkowa”, „krztusiec”, „zakażenie Mycoplasma pneumoniae”, „bakteryjne zapalenie płuc”, „bakteryjne zapalenie krtani lub tchawicy”, „zapalenie nagłośni”. Inne nazwy tylko, gdy żadna nie pasuje.
2. Pole `nagly_przebieg`: dlaczego nagły początek, silne osłabienie i nagły kaszel (patofizjologia, wiek, praca nocna, bisoprolol, kontakt na oddziale).
3. Pole `leczenie`: czy antybiotyk w ogóle (cefuroksym, azytromycyna — zasadność), leczenie przeciwwirusowe (np. oseltamiwir — okno czasowe, wskazania u 64-latki), objawowe, budezonid w nebulizacji — zasadność; z dawkami i źródłami.
4. Pole `diagnostyka`: co zrobić dziś (test antygenowy/PCR, CRP, RTG, SpO2) i co zmienia decyzję.
5. Pole `praca`: zakaźność, zwolnienie, ryzyko dla pacjentów OIT.
6. Pole `zwiazek_z_reakcja`: czy infekcja wyjaśnia część obrazu skórnego/ocznego (kofaktor, pokrzywka infekcyjna, oko).
7. `pilnosc`, `pewnosc`, `red_flags_*`, `nastepny_krok`, `co_zmieniloby_zdanie`, `zrodla` wg schemas/opinia.schema.json.

Źródła: PubMed (mcp__PubMed__search_articles, mcp__PubMed__get_article_metadata), cytuj PMID+DOI tylko zobaczone; reszta [wiedza modelu, niezweryfikowane].
Zapisz: A-infekcja/03-opinie/<twoja_rola>.json (rola = ta sama nazwa co w części B).
Odpowiedź: ≤10 zdań i NA KOŃCU `SKRÓT: <1–2 pełne zdania językiem medycznym, ≤400 znaków>`.
