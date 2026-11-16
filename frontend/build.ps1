param([string]$NodeExecutable = 'node')
$ErrorActionPreference = 'Stop'
Push-Location $PSScriptRoot
try {
    & $NodeExecutable node_modules\typescript\bin\tsc --noEmit
    if ($LASTEXITCODE -ne 0) { throw 'TypeScript-Prüfung fehlgeschlagen.' }
    # Direct invocation also works in Windows environments blocking Node child processes.
    $esbuild = Get-ChildItem -LiteralPath node_modules -Recurse -Filter esbuild.exe -Force |
        Select-Object -First 1 -ExpandProperty FullName
    if (-not $esbuild) { throw 'esbuild.exe fehlt. Zuerst pnpm install ausführen.' }
    New-Item -ItemType Directory -Force dist\assets | Out-Null
    & $esbuild src\main.tsx --bundle --minify --format=esm --outdir=dist\assets --entry-names=app
    if ($LASTEXITCODE -ne 0) { throw 'Frontend-Build fehlgeschlagen.' }
    $html = Get-Content -Raw -Encoding UTF8 index.html
    $html = $html.Replace('<script type="module" src="/src/main.tsx"></script>', '<link rel="stylesheet" href="/assets/app.css"><script type="module" src="/assets/app.js"></script>')
    [System.IO.File]::WriteAllText((Join-Path $PWD 'dist\index.html'), $html, (New-Object System.Text.UTF8Encoding($false)))
    Write-Output 'Frontend geprüft und nach frontend/dist gebaut.'
} finally { Pop-Location }
