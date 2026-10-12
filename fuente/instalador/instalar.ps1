# Instalador de Signo Consultorio (Windows)
$ErrorActionPreference = "Stop"
$src = Split-Path -Parent $MyInvocation.MyCommand.Path
$docs = [Environment]::GetFolderPath("MyDocuments")
$dest = Join-Path $docs "Signo"
Write-Host ""
Write-Host "  SIGNO CONSULTORIO - instalación" -ForegroundColor Cyan
Write-Host "  Carpeta del programa: $dest"
Write-Host ""
New-Item -ItemType Directory -Force -Path $dest, (Join-Path $dest "Respaldos"), (Join-Path $dest "PDF firmados") | Out-Null
if (Test-Path (Join-Path $src "Signo Consultorio.html")) { Copy-Item -Force (Join-Path $src "Signo Consultorio.html") (Join-Path $dest "Signo Consultorio (copia sin internet).html") }
Copy-Item -Force (Join-Path $src "signo.ico") (Join-Path $dest "signo.ico")

$chrome = @("$env:ProgramFiles\Google\Chrome\Application\chrome.exe", "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe", "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe") | Where-Object { Test-Path $_ } | Select-Object -First 1
$edge = @("${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe", "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe") | Where-Object { Test-Path $_ } | Select-Object -First 1
if ($chrome -and $edge) {
  Write-Host "  Tienes Google Chrome y Microsoft Edge."
  Write-Host "  Elige el navegador con el que ya usabas Signo (ahí están tus pacientes):"
  Write-Host "    1 = Google Chrome     2 = Microsoft Edge"
  $r = Read-Host "  Escribe 1 o 2 y presiona Enter"
  $browser = if ($r -eq "2") { $edge } else { $chrome }
} elseif ($chrome) { $browser = $chrome } elseif ($edge) { $browser = $edge } else {
  Write-Host "  No encontré Chrome ni Edge. Instala uno de los dos y vuelve a ejecutar este instalador." -ForegroundColor Red
  Read-Host "  Presiona Enter para salir"; exit 1
}
$url = "https://signoy.github.io/SIGNO/"
$ws = New-Object -ComObject WScript.Shell
$places = @([Environment]::GetFolderPath("Desktop"), [Environment]::GetFolderPath("Programs"))
foreach ($p in $places) {
  $lnk = $ws.CreateShortcut((Join-Path $p "Signo Consultorio.lnk"))
  $lnk.TargetPath = $browser
  $lnk.Arguments = "--app=""$url"""
  $lnk.WorkingDirectory = $dest
  $lnk.IconLocation = (Join-Path $dest "signo.ico")
  $lnk.Description = "Signo Consultorio - Medicina Integral"
  $lnk.Save()
}
Write-Host ""
Write-Host "  Listo. Quedó el icono 'Signo Consultorio' en el escritorio y en el menú Inicio." -ForegroundColor Green
Write-Host "  Se abre en su propia ventana y se actualiza sola cada vez que hay una versión nueva."
Write-Host "  Primera vez: Ajustes y respaldo > Restaurar respaldo, para traer tus pacientes."
Write-Host "  Para fijarlo en la barra de tareas: ábrelo, clic derecho en su icono de la barra > Anclar."
Write-Host ""
Start-Process $browser "--app=""$url"""
Read-Host "  Presiona Enter para cerrar"
