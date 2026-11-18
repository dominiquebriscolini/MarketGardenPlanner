param([string]$NodeExecutable = 'node', [switch]$Preview, [switch]$PublicPreview)
$ErrorActionPreference = 'Stop'
Push-Location $PSScriptRoot
try {
    & $NodeExecutable node_modules\typescript\bin\tsc --noEmit
    if ($LASTEXITCODE -ne 0) { throw 'TypeScript-Prüfung fehlgeschlagen.' }
    # Direct invocation also works in Windows environments blocking Node child processes.
    $esbuild = Get-ChildItem -LiteralPath node_modules -Recurse -Filter esbuild.exe -Force |
        Select-Object -First 1 -ExpandProperty FullName
    if (-not $esbuild) { throw 'esbuild.exe fehlt. Zuerst pnpm install ausführen.' }
    $output = if ($PublicPreview) { 'dist\public-preview' } elseif ($Preview) { 'dist\preview' } else { 'dist' }
    New-Item -ItemType Directory -Force "$output\assets" | Out-Null
    if ($Preview -or $PublicPreview) {
        & ..\.venv\Scripts\python.exe -B -m market_garden_planner.prototype.preview "$output\season.json"
        if ($LASTEXITCODE -ne 0) { throw 'Export der synthetischen Saison fehlgeschlagen.' }
    }
    & $esbuild src\main.tsx --bundle --minify --format=esm "--outdir=$output\assets" --entry-names=app
    if ($LASTEXITCODE -ne 0) { throw 'Frontend-Build fehlgeschlagen.' }
    if ($Preview -or $PublicPreview) {
        $bundle = Get-Content -LiteralPath "$output\assets\app.js" -Raw -Encoding UTF8
        if ($bundle.Contains('data:image/png') -or -not $bundle.Contains('data:image/svg+xml')) {
            throw 'Der Vorschau-Build muss die eigenen SVG-Pflanzensymbole verwenden.'
        }
    }
    $html = Get-Content -Raw -Encoding UTF8 index.html
    $html = $html.Replace('<script type="module" src="/src/main.tsx"></script>', '<link rel="stylesheet" href="/assets/app.css"><script type="module" src="/assets/app.js"></script>')
    if ($Preview -or $PublicPreview) {
        $html = $html.Replace('id="root"', 'id="root" data-preview="true"').Replace('"/assets/', '"./assets/')
    }
    [System.IO.File]::WriteAllText((Join-Path $PWD "$output\index.html"), $html, (New-Object System.Text.UTF8Encoding($false)))
    if ($PublicPreview) {
        [System.IO.File]::WriteAllText((Join-Path $PWD "$output\.nojekyll"), '')
    }
    Write-Output "Frontend geprüft und nach frontend/$output gebaut."
} finally { Pop-Location }
