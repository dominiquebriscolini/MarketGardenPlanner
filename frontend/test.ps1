param([string]$NodeExecutable = 'node')
$ErrorActionPreference = 'Stop'
$previousPythonPath = $env:PYTHONPATH
Push-Location $PSScriptRoot
try {
    $esbuild = Get-ChildItem -LiteralPath node_modules -Recurse -Filter esbuild.exe -Force | Select-Object -First 1 -ExpandProperty FullName
    if (-not $esbuild) { throw 'esbuild.exe fehlt. Zuerst pnpm install ausführen.' }
    & $esbuild src\interactions.ts --bundle --platform=node --format=esm --outfile=.test-build\interactions.mjs
    if ($LASTEXITCODE -ne 0) { throw 'Test-Build fehlgeschlagen.' }
    & $esbuild src\forecastModel.ts --bundle --platform=node --format=esm --outfile=.test-build\forecastModel.mjs
    if ($LASTEXITCODE -ne 0) { throw 'Prognose-Test-Build fehlgeschlagen.' }
    foreach ($module in @('projectView','projectClient')) {
        & $esbuild "src\$module.ts" --bundle --platform=node --format=esm --outfile=".test-build\$module.mjs"
        if ($LASTEXITCODE -ne 0) { throw 'Projekt-Test-Build fehlgeschlagen.' }
    }
    foreach ($component in @('Plot','ProjectTooltip')) {
        & $esbuild "src\$component.tsx" --bundle --packages=external --platform=node --format=esm --outfile=".test-build\$component.mjs"
        if ($LASTEXITCODE -ne 0) { throw 'Beschriftungs-Test-Build fehlgeschlagen.' }
    }
    $env:PYTHONPATH = Join-Path (Split-Path $PSScriptRoot -Parent) 'src'
    py -3.11 -B -c "import json; from pathlib import Path; from market_garden_planner.prototype.presentation import payload; Path('.test-build/demo.json').write_text(json.dumps(payload(), default=lambda d: d.isoformat()), encoding='utf-8')"
    if ($LASTEXITCODE -ne 0) { throw 'Scheduler-Testdaten konnten nicht erzeugt werden.' }
    $geometryPython = Join-Path (Split-Path $PSScriptRoot -Parent) '.venv\Scripts\python.exe'
    & $geometryPython -B tests\export_project_fixture.py
    if ($LASTEXITCODE -ne 0) { throw 'Projekt-Testdaten konnten nicht erzeugt werden. Geometry-Extra prüfen.' }
    & $NodeExecutable --test --test-isolation=none tests\interactions.test.mjs tests\forecast.test.mjs tests\projects.test.mjs tests\labels.test.mjs
    if ($LASTEXITCODE -ne 0) { throw 'Interaktionstests fehlgeschlagen.' }
} finally { $env:PYTHONPATH = $previousPythonPath; Pop-Location }
