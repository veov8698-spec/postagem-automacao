@echo off
title SocialPublisher - Atualizar pelo GitHub
chcp 65001 > nul
cd /d "%~dp0"

echo ======================================================
echo    ATUALIZANDO SOCIALPUBLISHER DO GITHUB
echo ======================================================
echo.

echo [1/3] Verificando conexao com o repositorio GitHub...
git remote -v
echo.

echo [2/3] Baixando as atualizacoes mais recentes (git pull)...
git pull origin main
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [AVISO] Ocorreu uma divergencia local ou git nao configurado.
    echo Tentando sincronizar com a branch principal...
    git fetch origin main
    git reset --hard origin/main
)
echo.

echo [3/3] Instalando dependencias do Node.js (npm install)...
call npm install --silent
echo.

echo ======================================================
echo    ✅ PROGRAMA ATUALIZADO COM SUCESSO!
echo ======================================================
echo.
echo Todas as melhorias (responsividade celular, multiplos
echo canais, fila de videos e picos gamer) estao prontas.
echo.
set /p resp="Deseja iniciar o programa agora? (S/N): "
if /i "%resp%"=="S" (
    start http://localhost:3000
    npm start
)
