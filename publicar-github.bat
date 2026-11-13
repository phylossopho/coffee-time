@echo off
setlocal EnableExtensions EnableDelayedExpansion
chcp 65001 >nul
cd /d "%~dp0"

set "SITE=https://phylossopho.github.io/coffee-time/"
set "REPO=https://github.com/phylossopho/coffee-time.git"

echo ============================================
echo   COFFEE TIME - verificar y publicar en GitHub
echo ============================================
echo.

if not exist "index.html" (
  echo [ERROR] No se encuentra index.html.
  echo         Ejecuta este archivo desde la carpeta coffee-time.
  goto :fail
)

echo [1/6] Comprobando herramientas...
where git >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Git no esta instalado o no esta en el PATH.
  goto :fail
)
where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js no esta instalado o no esta en el PATH.
  goto :fail
)
echo       Git y Node disponibles.
echo.

echo [2/6] Verificando sintaxis de los scripts...
node --check assets\app.js
if errorlevel 1 goto :fail
node --check assets\data.js
if errorlevel 1 goto :fail
echo       app.js y data.js sin errores.
echo.

for /f "delims=" %%b in ('git rev-parse --abbrev-ref HEAD') do set "BRANCH=%%b"
echo [3/6] Rama actual: !BRANCH!
echo       Remoto: !REPO!
echo.
echo       Archivos con cambios:
git status --short
if errorlevel 1 goto :fail
echo.

set "MSG="
set /p "MSG=Mensaje del commit (Enter = automatico): "
if "!MSG!"=="" set "MSG=Actualiza el sitio (!DATE! !TIME!)"

echo [4/6] Preparando archivos...
git add -A
if errorlevel 1 goto :fail

git diff --cached --quiet
if not errorlevel 1 (
  echo       No hay cambios nuevos para subir.
  goto :verify
)

echo [5/6] Creando commit y subiendo...
git commit -m "!MSG!"
if errorlevel 1 goto :fail
git push -u origin "!BRANCH!"
if errorlevel 1 (
  echo.
  echo [AVISO] No se pudo subir. Si el remoto tiene cambios, ejecuta:
  echo         git pull --rebase origin !BRANCH!
  echo         y vuelve a correr este archivo.
  goto :fail
)
echo       Cambios subidos a GitHub.
echo.

:verify
echo [6/6] Verificando el repositorio y GitHub Pages...
git fetch origin "!BRANCH!" --quiet
for /f "delims=" %%h in ('git rev-parse HEAD') do set "LOCAL=%%h"
for /f "delims=" %%h in ('git rev-parse "origin/!BRANCH!"') do set "REMOTE=%%h"
if /i "!LOCAL!"=="!REMOTE!" (
  echo       GitHub tiene el ultimo commit: !LOCAL!
) else (
  echo [AVISO] GitHub no tiene el ultimo commit local.
  echo         Local:  !LOCAL!
  echo         Remoto: !REMOTE!
)

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$files = @('assets/app.js','assets/data.js');" ^
  "$local = ($files | ForEach-Object { (Get-Content -Raw $_).Replace([string][char]13, '') }) -join '#';" ^
  "$sha = [BitConverter]::ToString([Security.Cryptography.SHA256]::Create().ComputeHash([Text.Encoding]::UTF8.GetBytes($local))).Replace('-','');" ^
  "$ok = $false;" ^
  "for ($i = 0; $i -lt 18; $i++) {" ^
  "  try {" ^
  "    $remote = @();" ^
  "    foreach ($f in $files) {" ^
  "      $r = Invoke-WebRequest -UseBasicParsing -Uri ('!SITE!' + $f + '?ts=' + [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()) -Headers @{ 'Cache-Control' = 'no-cache' } -TimeoutSec 30;" ^
  "      $remote += $r.Content.Replace([string][char]13, '');" ^
  "    }" ^
  "    $rsha = [BitConverter]::ToString([Security.Cryptography.SHA256]::Create().ComputeHash([Text.Encoding]::UTF8.GetBytes(($remote -join '#')))).Replace('-','');" ^
  "    if ($rsha -eq $sha) { $ok = $true; break }" ^
  "  } catch {}" ^
  "  Start-Sleep -Seconds 10" ^
  "}" ^
  "if ($ok) {" ^
  "  Write-Host '      GitHub Pages ya sirve la version publicada.';" ^
  "} else {" ^
  "  Write-Host '      GitHub Pages aun esta desplegando. Abre el sitio en 1 o 2 minutos:';" ^
  "  Write-Host '      !SITE!';" ^
  "}"

echo.
echo ============================================
echo   Listo. Sitio: !SITE!
echo ============================================
echo.
pause
exit /b 0

:fail
echo.
echo ============================================
echo   No se pudo completar la publicacion.
echo ============================================
echo.
pause
exit /b 1