@echo off
title SocialPublisher - Servidor + Tunel Online
chcp 65001 > nul
echo ======================================================
echo    INICIANDO SOCIALPUBLISHER ONLINE
echo ======================================================
echo.

start "SocialPublisher Node" cmd /k "node server.js"
timeout /t 2 /nobreak > nul

start "Cloudflare Tunnel" cmd /k ""C:\Program Files (x86)\cloudflared\cloudflared.exe" tunnel --url http://localhost:3000"

echo.
echo Servidor e Tunel iniciados com sucesso!
echo Acesse o link que abrir na janela do Cloudflare Tunnel.
pause
