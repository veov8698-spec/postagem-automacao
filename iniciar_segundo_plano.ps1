# Script de inicializacao automatica em segundo plano
$ErrorActionPreference = "SilentlyContinue"
$projectDir = "C:\laragon\www\social-publisher"
Set-Location $projectDir

# 1. Garante que o node server.js seja iniciado se nao estiver rodando
$nodeRunning = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
    $_.Path -like "*nodejs*"
}
if (-not $nodeRunning) {
    Start-Process -FilePath "node" -ArgumentList "server.js" -WorkingDirectory $projectDir -WindowStyle Hidden
    Start-Sleep -Seconds 3
}

# 2. Localiza cloudflared
$cfExe = "C:\Program Files (x86)\cloudflared\cloudflared.exe"
if (-not (Test-Path $cfExe)) {
    $cfExe = "C:\Program Files\cloudflared\cloudflared.exe"
}
if (-not (Test-Path $cfExe)) {
    $cfExe = "cloudflared"
}

# 3. Inicia o tunel Cloudflare se nao estiver rodando
$cfRunning = Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue
$logFile = "$projectDir\cloudflared_online.log"

if (-not $cfRunning) {
    if (Test-Path $logFile) { Remove-Item $logFile -Force }
    Start-Process -FilePath $cfExe -ArgumentList "tunnel --url http://localhost:3000 --logfile `"$logFile`"" -WorkingDirectory $projectDir -WindowStyle Hidden
    Start-Sleep -Seconds 6
}

# 4. Extrai a URL publica do Cloudflare
$publicUrl = ""
if (Test-Path $logFile) {
    $logContent = Get-Content $logFile -Raw
    if ($logContent -match "https://[a-zA-Z0-9-]+\.trycloudflare\.com") {
        $publicUrl = $matches[0]
    }
}

# 5. Atualiza os atalhos no Desktop
$desktop = "C:\Users\lexke\OneDrive\Desktop"
if (-not (Test-Path $desktop)) {
    $desktop = [Environment]::GetFolderPath("Desktop")
}

if ($publicUrl) {
    $shortcutContent = @"
[InternetShortcut]
URL=$publicUrl
IconIndex=0
"@
    Set-Content -Path "$desktop\SocialPublisher_Celular.url" -Value $shortcutContent -Encoding ascii

    $txtContent = @"
=====================================================
LINK DE ACESSO DO SOCIAL PUBLISHER (CELULAR E PC)
=====================================================

Acesse no navegador do seu celular:
$publicUrl

Para acessar no computador:
http://localhost:3000

Atualizado automaticamente em: $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')
"@
    Set-Content -Path "$desktop\LINK_DO_CELULAR.txt" -Value $txtContent -Encoding utf8
}
