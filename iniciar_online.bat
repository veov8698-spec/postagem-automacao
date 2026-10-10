@echo off
title SocialPublisher - Servidor + Tunel Online (Cloudflare)
chcp 65001 > nul
cd /d "%~dp0"

echo ======================================================
echo    INICIANDO SOCIALPUBLISHER ONLINE (CLOUDFLARE)
echo ======================================================
echo.

:: 1. Inicia o Servidor Local na porta 3000
echo [1/2] Iniciando Servidor Node.js na porta 3000...
start "SocialPublisher Node" cmd /k "node server.js"
timeout /t 3 /nobreak > nul

:: 2. Detecta o executavel do Cloudflared
set CLOUDFLARED_BIN=""

where cloudflared >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    set CLOUDFLARED_BIN=cloudflared
) else if exist "C:\Program Files (x86)\cloudflared\cloudflared.exe" (
    set CLOUDFLARED_BIN="C:\Program Files (x86)\cloudflared\cloudflared.exe"
) else if exist "C:\Program Files\cloudflared\cloudflared.exe" (
    set CLOUDFLARED_BIN="C:\Program Files\cloudflared\cloudflared.exe"
) else if exist "%~dp0cloudflared.exe" (
    set CLOUDFLARED_BIN="%~dp0cloudflared.exe"
)

if %CLOUDFLARED_BIN%=="" (
    echo.
    echo ======================================================
    echo [AVISO] O Cloudflared nao foi encontrado no seu Windows.
    echo.
    echo Para gerar o link publico online do Cloudflare:
    echo 1. Baixe o executavel oficial:
    echo    https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe
    echo 2. Renomeie para 'cloudflared.exe' e coloque nesta pasta do projeto.
    echo.
    echo O servidor local esta rodando em: http://localhost:3000
    echo ======================================================
    start http://localhost:3000
    pause
    exit /b
)

echo [2/2] Abrindo Tunel Seguro Cloudflare...
start "Cloudflare Tunnel" cmd /k "%CLOUDFLARED_BIN% tunnel --url http://localhost:3000"

echo.
echo ======================================================
echo   ✅ SERVIDOR E TUNEL INICIADOS COM SUCESSO!
echo ======================================================
echo.
echo Na janela 'Cloudflare Tunnel' aberta ao lado, copie o link que termina com:
echo   https://xxxxxx.trycloudflare.com
echo Esse link funciona em qualquer celular ou computador pela internet!
echo.
pause
