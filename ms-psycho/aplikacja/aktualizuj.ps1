# MS Konsylium Psychologiczne – bezpieczna aktualizacja na laptopie (Windows PowerShell 5.1+)
#
# Co robi (po kolei):
#   1. sprawdza, że aplikacja jest zamknięta,
#   2. pobiera kod z GitHuba (archiwum gałęzi) albo bierze podane archiwum zip,
#   3. robi KOPIĘ ZAPASOWĄ: cały folder pracy (z danymi) i resources\app → Documents\MS-Konsylium-Psychologiczne-kopie\<data-godzina>\
#      (kopia zostaje na tym laptopie, nic nie jest wysyłane),
#   4. podmienia resources\app na ms-psycho\aplikacja\gotowe\,
#   5. dogrywa pliki folderu pracy (skrypty, config, docs, agenci…) BEZ kasowania czegokolwiek,
#      z pominięciem katalogów z danymi i pliku _KLUCZE-NIE-DLA-APLIKACJI.md,
#   6. sprawdza, że katalogi z danymi mają tyle samo plików co przed aktualizacją, i pokazuje wersję.
#
# Nigdy nie rusza: konta\ rozmowy\ sprawy\ wywiad-na-zywo\ superwizja\ raporty\ ani _KLUCZE-NIE-DLA-APLIKACJI.md.
# Nie używa gita (żadnego git clean). Treści rozmów nie czyta – liczy tylko pliki.
#
# Uruchomienie (Michał, w PowerShellu):
#   powershell -NoProfile -ExecutionPolicy Bypass -File "$env:USERPROFILE\Documents\aktualizuj-psycho.ps1"
# Opcje:
#   -Galaz claude/project-thread-ud83qw   gałąź na GitHubie (domyślnie ta, do której scalamy)
#   -Archiwum C:\…\paczka.zip             zamiast pobierania – archiwum repo albo commitu z GitHuba
#   -Proba                                 tylko pokazuje, co by zrobił; niczego nie zmienia

param(
  [string]$Galaz = 'claude/project-thread-ud83qw',
  [string]$Archiwum = '',
  [string]$Aplikacja = (Join-Path $env:USERPROFILE 'Documents\MS-Konsylium-Psychologiczne'),
  [string]$FolderPracy = (Join-Path $env:USERPROFILE 'Documents\MS-Konsylium-Psychologiczne-folder\ms-psycho'),
  [string]$Kopie = (Join-Path $env:USERPROFILE 'Documents\MS-Konsylium-Psychologiczne-kopie'),
  [switch]$Proba
)

$ErrorActionPreference = 'Stop'
$DANE = @('konta', 'rozmowy', 'sprawy', 'wywiad-na-zywo', 'superwizja', 'raporty')
$NIGDY = @('_KLUCZE-NIE-DLA-APLIKACJI.md')
$REPO = 'https://github.com/michalek1005-svg/Mega-konsylium-agent-w-ai'

function Krok($t) { Write-Host "`n== $t" -ForegroundColor Cyan }
function Stop-Blad($t) { Write-Host "`nSTOP: $t" -ForegroundColor Red; Write-Host 'Nic nie zostało zmienione po tym miejscu. Kopia zapasowa (jeśli powstała) jest w folderze kopii.'; exit 1 }
function Licz($kat) { if (Test-Path $kat) { (Get-ChildItem -LiteralPath $kat -Recurse -File -Force -ErrorAction SilentlyContinue | Measure-Object).Count } else { -1 } }

Krok 'Sprawdzam foldery'
$app = Join-Path $Aplikacja 'resources\app'
if (-not (Test-Path (Join-Path $app 'package.json'))) { Stop-Blad "Nie widzę aplikacji w $app" }
if (-not (Test-Path $FolderPracy)) { Stop-Blad "Nie widzę folderu pracy $FolderPracy" }
$przed = @{}
foreach ($d in $DANE) { $przed[$d] = Licz (Join-Path $FolderPracy $d) }
$wersjaPrzed = (Get-Content (Join-Path $app 'package.json') -Raw | ConvertFrom-Json).version
Write-Host "Aplikacja: $Aplikacja (wersja $wersjaPrzed)"
Write-Host "Folder pracy: $FolderPracy"
foreach ($d in $DANE) { Write-Host ("  {0,-16} {1}" -f $d, $(if ($przed[$d] -lt 0) { 'brak (to normalne, jeśli jeszcze nie powstał)' } else { "$($przed[$d]) plików" })) }

Krok 'Sprawdzam, czy aplikacja jest zamknięta'
$exe = Get-ChildItem -LiteralPath $Aplikacja -Filter '*.exe' -File | Where-Object { $_.Name -notmatch 'unins|crashpad' } | Select-Object -First 1
if ($exe) {
  $dziala = Get-Process -ErrorAction SilentlyContinue | Where-Object { $_.Path -and $_.Path -like "$Aplikacja*" }
  if ($dziala) { Stop-Blad "Aplikacja jest otwarta ($($exe.Name)). Zamknij ją (i zakończ trwającą rozmowę), potem uruchom skrypt jeszcze raz." }
}

Krok 'Pobieram nową wersję'
$tmp = Join-Path $env:TEMP ("ms-psycho-akt-" + (Get-Date -Format 'yyyyMMdd-HHmmss'))
New-Item -ItemType Directory -Path $tmp | Out-Null
$zip = Join-Path $tmp 'repo.zip'
if ($Archiwum) {
  if (-not (Test-Path $Archiwum)) { Stop-Blad "Nie ma pliku $Archiwum" }
  Copy-Item -LiteralPath $Archiwum -Destination $zip
} else {
  [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
  $url = "$REPO/archive/refs/heads/$Galaz.zip"
  Write-Host "Pobieram $url"
  try { Invoke-WebRequest -Uri $url -OutFile $zip -UseBasicParsing } catch { Stop-Blad "Nie udało się pobrać archiwum: $($_.Exception.Message)" }
}
Expand-Archive -LiteralPath $zip -DestinationPath (Join-Path $tmp 'x') -Force
$zrodlo = Get-ChildItem -LiteralPath (Join-Path $tmp 'x') -Recurse -Directory -Filter 'ms-psycho' | Where-Object { Test-Path (Join-Path $_.FullName 'aplikacja\gotowe\package.json') } | Select-Object -First 1
if (-not $zrodlo) { Stop-Blad 'W archiwum nie ma ms-psycho\aplikacja\gotowe – to nie jest właściwa paczka.' }
$gotowe = Join-Path $zrodlo.FullName 'aplikacja\gotowe'
$wersjaNowa = (Get-Content (Join-Path $gotowe 'package.json') -Raw | ConvertFrom-Json).version
Write-Host "Nowa wersja: $wersjaNowa"

if ($Proba) {
  Write-Host "`nTRYB PRÓBY: kopia do $Kopie, podmiana $app, dogranie plików do $FolderPracy (bez: $($DANE -join ', '), $($NIGDY -join ', ')). Nic nie zmieniono." -ForegroundColor Yellow
  Remove-Item -LiteralPath $tmp -Recurse -Force
  exit 0
}

Krok 'Kopia zapasowa (zostaje na tym laptopie)'
$kopia = Join-Path $Kopie (Get-Date -Format 'yyyy-MM-dd-HHmmss')
New-Item -ItemType Directory -Path $kopia -Force | Out-Null
Copy-Item -LiteralPath $app -Destination (Join-Path $kopia 'resources-app') -Recurse -Force
Copy-Item -LiteralPath $FolderPracy -Destination (Join-Path $kopia 'ms-psycho') -Recurse -Force
foreach ($d in $DANE) {
  $p = $przed[$d]; $k = Licz (Join-Path $kopia "ms-psycho\$d")
  if ($p -ge 0 -and $k -ne $p) { Stop-Blad "Kopia katalogu $d jest niepełna ($k z $p plików). Aktualizacja przerwana." }
}
Write-Host "Kopia: $kopia"

Krok 'Podmieniam aplikację (resources\app)'
Get-ChildItem -LiteralPath $app -Force | Remove-Item -Recurse -Force
Copy-Item -Path (Join-Path $gotowe '*') -Destination $app -Recurse -Force

Krok 'Dogrywam pliki folderu pracy (bez kasowania, bez danych)'
$pomin = @('aplikacja') + $DANE
foreach ($el in Get-ChildItem -LiteralPath $zrodlo.FullName -Force) {
  if ($pomin -contains $el.Name -or $NIGDY -contains $el.Name) { continue }
  $cel = Join-Path $FolderPracy $el.Name
  if ($el.PSIsContainer) {
    foreach ($f in Get-ChildItem -LiteralPath $el.FullName -Recurse -File -Force) {
      if ($NIGDY -contains $f.Name) { continue }
      $wzgl = $f.FullName.Substring($el.FullName.Length).TrimStart('\')
      $docel = Join-Path $cel $wzgl
      New-Item -ItemType Directory -Path (Split-Path $docel -Parent) -Force | Out-Null
      Copy-Item -LiteralPath $f.FullName -Destination $docel -Force
    }
  } else {
    Copy-Item -LiteralPath $el.FullName -Destination $cel -Force
  }
}

Krok 'Sprawdzam'
$ok = $true
foreach ($d in $DANE) {
  $po = Licz (Join-Path $FolderPracy $d)
  $stan = if ($po -eq $przed[$d]) { 'bez zmian' } else { $ok = $false; "ZMIANA: było $($przed[$d]), jest $po" }
  Write-Host ("  {0,-16} {1}" -f $d, $stan)
}
$wersjaPo = (Get-Content (Join-Path $app 'package.json') -Raw | ConvertFrom-Json).version
Remove-Item -LiteralPath $tmp -Recurse -Force
if (-not $ok) { Write-Host "`nUWAGA: liczba plików w danych się zmieniła. Kopia sprzed aktualizacji: $kopia" -ForegroundColor Red; exit 2 }
Write-Host "`nOK, wersja $wersjaPrzed → $wersjaPo, dane zostały na miejscu. Kopia zapasowa: $kopia" -ForegroundColor Green
Write-Host 'Uruchom aplikację i sprawdź, czy otwiera się Psychoterapia AI.'
