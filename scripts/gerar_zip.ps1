$src = 'C:\laragon\www\social-publisher'
$dest = 'C:\laragon\www\social-publisher\social-publisher-pronto.zip'
$desktop = [System.IO.Path]::Combine([System.Environment]::GetFolderPath('Desktop'), 'social-publisher-pronto.zip')

if (Test-Path $dest) { Remove-Item $dest -Force }
if (Test-Path $desktop) { Remove-Item $desktop -Force }

$tempDir = [System.IO.Path]::Combine([System.IO.Path]::GetTempPath(), 'pkg_' + [System.Guid]::NewGuid().ToString())
New-Item -ItemType Directory -Path $tempDir | Out-Null

# Copiar recursivamente ignorando node_modules, .git e arquivos zip
Get-ChildItem -Path $src | Where-Object { $_.Name -notin @('node_modules', '.git', 'social-publisher-pronto.zip') } | ForEach-Object {
    Copy-Item -Path $_.FullName -Destination $tempDir -Recurse
}

Compress-Archive -Path "$tempDir\*" -DestinationPath $dest -CompressionLevel Optimal
Remove-Item -Path $tempDir -Recurse -Force

if (Test-Path $dest) {
    $info = Get-Item $dest
    $mb = [System.Math]::Round($info.Length / 1048576, 2)
    Write-Output "SUCESSO: ZIP criado em $dest ($mb MB)"
    Copy-Item -Path $dest -Destination $desktop -Force
    Write-Output "COPIA_DESKTOP: $desktop"
} else {
    Write-Output "ERRO: Nao foi possivel criar o ZIP"
}
