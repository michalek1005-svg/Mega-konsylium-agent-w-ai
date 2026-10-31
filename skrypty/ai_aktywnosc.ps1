# Sygnał „AI pracuje” dla aplikacji MS Konsylium i (opcjonalnie) dioda Scroll Lock.
# Wywoływany przez hooki Claude Code na komputerze użytkownika (Remote Control):
#   UserPromptSubmit / PreToolUse -> pracuje,  Stop -> czeka
# Użycie: powershell -NoProfile -ExecutionPolicy Bypass -File skrypty\ai_aktywnosc.ps1 -Stan pracuje [-Dioda]
# Dioda: Scroll Lock (nie Caps Lock: przełączenie Caps Lock zmienia pisanie na wielkie litery).
param(
  [ValidateSet('pracuje', 'czeka')][string]$Stan = 'pracuje',
  [switch]$Dioda
)
$ErrorActionPreference = 'SilentlyContinue'
$folder = Split-Path -Parent $PSScriptRoot
$plik = Join-Path $folder '_ai-aktywnosc.json'
$czas = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
$json = '{"stan":"' + $Stan + '","czas":' + $czas + '}'
$tmp = "$plik.tmp"
[IO.File]::WriteAllText($tmp, $json, (New-Object Text.UTF8Encoding $false))
Move-Item -Force $tmp $plik

if ($Dioda) {
  Add-Type -AssemblyName System.Windows.Forms
  $wlaczona = [System.Windows.Forms.Control]::IsKeyLocked([System.Windows.Forms.Keys]::Scroll)
  $chce = ($Stan -eq 'pracuje')
  if ($wlaczona -ne $chce) {
    Add-Type -Name K -Namespace MS -MemberDefinition '[DllImport("user32.dll")] public static extern void keybd_event(byte k, byte s, uint f, UIntPtr e);'
    [MS.K]::keybd_event(0x91, 0x46, 0x1, [UIntPtr]::Zero)   # VK_SCROLL w dół
    [MS.K]::keybd_event(0x91, 0x46, 0x3, [UIntPtr]::Zero)   # VK_SCROLL w górę
  }
}
