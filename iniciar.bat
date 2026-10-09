@echo off
title SocialPublisher - Servidor Node.js
cd /d "%~dp0"
echo ======================================================
echo    Iniciando SocialPublisher (Node.js + MySQL)
echo ======================================================
echo.
start http://localhost:3000
npm start
pause
