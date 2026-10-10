@echo off
title Configurar Inicializacao Automatica com o Windows
chcp 65001 > nul
cd /d "%~dp0"

echo ======================================================
echo    CONFIGURAR INICIALIZACAO AUTOMATICA DO SERVIDOR
echo ======================================================
echo.
echo Escolha uma opcao:
echo.
echo [1] ATIVAR: Iniciar o Servidor + Cloudflare junto com o Windows
echo [2] DESATIVAR: Nao iniciar automaticamente com o Windows
echo [3] Sair
echo.
set /p opt="Digite o numero da opcao (1, 2 ou 3): "

set "STARTUP_FOLDER=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
set "SHORTCUT_PATH=%STARTUP_FOLDER%\SocialPublisher_AutoStart.vbs"

if "%opt%"=="1" (
    echo.
    echo Criando inicializador silencioso...
    (
        echo Set WshShell = CreateObject^("WScript.Shell"^)
        echo WshShell.CurrentDirectory = "%~dp0"
        echo WshShell.Run "cmd /c iniciar_online.bat", 0, False
    ) > "%SHORTCUT_PATH%"
    echo.
    echo ======================================================
    echo   [SUCESSO] Inicializacao automatica ATIVADA!
    echo   Sempre que o Windows ligar, o servidor e o tunel
    echo   iniciarao sozinhos em segundo plano.
    echo ======================================================
    echo.
    pause
    exit /b
)

if "%opt%"=="2" (
    echo.
    if exist "%SHORTCUT_PATH%" (
        del /f /q "%SHORTCUT_PATH%"
        echo ======================================================
        echo   [SUCESSO] Inicializacao automatica DESATIVADA!
        echo ======================================================
    ) else (
        echo ======================================================
        echo   O inicializador automatico ja nao estava ativado.
        echo ======================================================
    )
    echo.
    pause
    exit /b
)

exit /b
