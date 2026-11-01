# MS Konsylium Psychologiczne – start (wersja testowa 0.1.0)

„Brat bliźniak” MS Konsylium: Rozmowa z jednym terapeutą AI, za którym pracuje zespół agentów, i Pokój psychologiczny z konsylium terapeutów różnych podejść. **Narzędzie testowe – to nie jest terapia ani diagnoza.**

## 1. Co jest w aplikacji (pasek ikon po lewej)
| Ikona | Zakładka | Do czego |
|---|---|---|
| 💬 | **Psychoterapia AI** (startowa) | Okno jak komunikator. Piszesz o sobie albo o konkretnej sytuacji („O mojej sytuacji”) albo jako terapeuta o kliencie („Konsultacja przypadku”). Odpowiada jeden **Terapeuta AI**; nad paskiem widać, kto z zespołu teraz myśli; pod odpowiedzią „Pokaż, kto co myślał”. Emotikony do wstawiania i reakcje na odpowiedzi. „Zwołaj konsylium” przenosi rozmowę do Pokoju. |
| 📋 | **Wywiad** | Klikalny wywiad przed pełnym konsylium (opis własnymi słowami → pytania od AI na żywo → „Wyślij do Konsylium”). |
| 👥 | **Pokój psychologiczny** | Krąg foteli: prowadzący z herbatą, 5 terapeutów różnych szkół, diagnosta, psychiatra; strażnik ryzyka i zastępcy przy ścianie, sprawdzający przy biurku, stażysta za szybą. Dymki, ściana z etapami, Wnioski. Pole „Terapeuta prowadzący” – Twój głos w dyskusji. |
| 📁 | Folder | Wskaż folder `ms-psycho` (ten folder). |

Ekran z prezentem „Dla Halusi ❤” pokazuje się przy każdym starcie **tylko w wersji 1** (0.1.x); „Pomiń ›” w prawym dolnym rogu.

## 2. Bezpieczeństwo (zawsze włączone)
- Filtr słownikowy w aplikacji (`config/frazy-ryzyka.json`) czyta każdą wiadomość **zanim** trafi do AI: słowa o odebraniu sobie życia → od razu czerwona karta z numerami; bierne myśli o śmierci → łagodna karta z numerami.
- Strażnik ryzyka czyta każdą turę; skrypt `rozmowa.py` nie pozwala obniżyć poziomu bez nowego faktu ani wysłać odpowiedzi wysokiego ryzyka bez numerów.
- Numery pomocy: `config/pomoc-pl.json` (112 · 800 70 2222 całodobowo · 116 123 · Niebieska Linia 800 120 002) – sprawdzone 1.11.2026 ze źródłami (gov.pl, NASK), wszystkie całodobowe.
- Tylko dorośli, bez danych identyfikujących.

## 3. Uruchomienie Claude w tym folderze (żeby Terapeuta AI odpowiadał)
Sesja Claude Code (albo Remote Control) **w folderze `ms-psycho`**, z poleceniem:

> Jesteś zespołem MS Konsylium Psychologiczne. Przeczytaj CLAUDE.md, docs/ROZMOWA.md i docs/BEZPIECZENSTWO.md. Prowadź pętlę Rozmowy: `python skrypty/rozmowa.py czekaj`, potem dla każdej nowej wiadomości `pracuje` → strażnik ryzyka i panel (osobne wywołania agentów z .claude/agents) → prowadzący scala jeden głos → klient‑sędzia → `rozmowa.py odpowiedz`, i znowu `czekaj`. Gdy `czekaj` zgłosi „ZWOŁAŁ KONSYLIUM” albo pojawi się nowy wywiad (`python skrypty/wywiad_na_zywo.py czekaj`), poprowadź pełne konsylium wg CLAUDE.md §4 z dymkami `skrypty/dymek.py`. Nie kończ pracy, dopóki użytkownik nie napisze „koniec”.

Na komputerze Michała PubMed może się nazywać `mcp__plugin_pubmed_PubMed__*` – prowadzący sprawdza na starcie.

Sygnał „AI pracuje” (kropka w lewym dolnym rogu): jak w MS Konsylium – plik `.claude/settings.local.json` z hookami `skrypty\ai_aktywnosc.ps1` (przykład w docs/NA-ZYWO.md).

## 4. Testowanie
- Przypadki syntetyczne: `przypadki-testowe/PSY-01…10` (wiek i płeć, dorośli). Tury do Rozmowy: `przypadki-testowe/ROZMOWA-tury-uzytkownika.md`. Kryteria: `przypadki-testowe/KRYTERIA-OCENY.md`. Klucze oceny są poza aplikacją i nie mogą tu trafić.
- Test automatyczny całej ścieżki (dla programisty): `cd aplikacja/powloka && npm ci && node zbuduj.mjs --bez-paczki && xvfb-run -a node test/e2e-psycho.mjs`.

## 5. Wersja 2 (po pokazie)
Usunąć ekran prezentu: `aplikacja/powloka/zbuduj.mjs` → `const PREZENT = false;`, podnieść wersję w `package.json`, zbudować.
