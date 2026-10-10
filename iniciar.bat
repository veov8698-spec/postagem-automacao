@echo off
title SocialPublisher - Servidor Local
chcp 65001 > nul
cd /d "%~dp0"

echo ======================================================
echo    INICIANDO SOCIALPUBLISHER LOCAL
echo ======================================================
echo.

if not exist "node_modules\" (
    echo [INFO] Primeira execucao detectada. Instalando dependencias...
    call npm install
    echo.
)

echo [OK] Abrindo navegador em http://localhost:3000...
start http://localhost:3000

echo [OK] Iniciando servidor Node.js...
node server.js
pause
