# Propozycje usprawnień wyglądu – rola Graficzny (2.11.2026)

Na podstawie zrzutów aplikacji 0.3.0 (tryb jasny i ciemny, okno 1280×800). Nic nie jest wdrożone; każda pozycja
wymaga decyzji Michała. Kolejność = moja polecana kolejność.

| # | Co | Dlaczego | Praca |
|---|---|---|---|
| 1 | **Lawendowa litera K + domknięcie tokenów** (karta wysłana 2.11) | K w rogu jest miętowe – jedyna widoczna resztka morskiej palety lekarskiej. | bardzo mała |
| 2 | **Stały, spokojny przycisk „Pomoc w kryzysie”** w pasku ikon (np. kółko ratunkowe), otwiera numery z `config/pomoc-pl.json` | Ścieżka kryzysowa ma być zawsze dostępna, a dziś to drobny tekst w stopce Psychoterapii AI; w Wywiadzie i Pokoju jej nie widać. Przycisk nie krzyczy, ale zawsze jest pod ręką. | mała |
| 3 | **Łagodniejszy wskaźnik stanu AI** w lewym dolnym rogu: zamiast czerwonego „Nie działa” szare „AI wyłączone”, czerwień tylko przy prawdziwym błędzie | W aplikacji wsparcia czerwona plakietka na stałe wygląda jak alarm, choć to zwykły stan „bez połączenia”. Zasada „mało ostrzeżeń”. | mała |
| 4 | **Pusty Pokój psychologiczny z obrazkiem** zamiast beżowego prostokąta: szkic kręgu foteli + jedno zdanie „Wczytaj sprawę, a zespół zajmie miejsca” | Dziś przed wczytaniem sprawy widać pustą plamę, która wygląda jak błąd ładowania. | średnia |
| 5 | **Pasek nagłówka w Wywiadzie wyrównany do ramki** (jak w Psychoterapii AI i Pokoju) | Nagłówek Wywiadu ma własne, ciemniejsze tło i wychodzi poza wewnętrzny margines tafli – to ślad modułu przeniesionego z konsylium lekarskiego. | mała |
| 6 | **Małe twarze zespołu przy „Pokaż, kto co myślał”** (3–4 kółka z inicjałami w kolorach ról) | Pokazuje, że za jednym głosem stoi zespół, bez dodatkowego tekstu. | mała |
| 7 | **Ikony przy ćwiczeniach i karcie celu** (spójny zestaw kreskowych ikon jak w pasku) | Ćwiczenia krok po kroku z 0.3.0 są czysto tekstowe; ikona ułatwia rozpoznanie na iPadzie. | średnia |

Uwagi:
- Pozycje 2 i 3 dotykają bezpieczeństwa i komunikatów – przed wdrożeniem zerknąć z rolą Merytoryczną.
- Wszystko w trybie jasnym domyślnie; tryb ciemny sprawdzany przy każdej zmianie.
- Makiety do każdej pozycji robię dopiero po wyborze Michała.
