[CmdletBinding()]
param(
    [string]$NodeExecutable = 'node',
    [string[]]$TestFile
)

$ErrorActionPreference = 'Stop'
$previousPythonPath = $env:PYTHONPATH
$buildLock = $null
Push-Location $PSScriptRoot
try {
    if (-not $PSBoundParameters.ContainsKey('TestFile')) {
        $TestFile = @(
            'interactions.test.mjs', 'forecast.test.mjs', 'projects.test.mjs',
            'labels.test.mjs', 'editing.test.mjs', 'precision.test.mjs',
            'polish.test.mjs', 'cultivation.test.mjs', 'cultivation-checks.test.mjs',
            'project-season.test.mjs'
        )
    }
    if (-not $TestFile) { throw 'Mindestens eine Testdatei angeben.' }
    $tests = foreach ($name in $TestFile) {
        if ($name -notmatch '\A[\w.-]+\.test\.mjs\z' -or
            -not (Test-Path -LiteralPath "tests\$name" -PathType Leaf)) {
            throw "Unbekannte Testdatei in frontend/tests: $name"
        }
        "tests\$name"
    }
    $tests = @($tests | Select-Object -Unique)

    # Tests refer to generated inputs by literal paths in .test-build.
    $inputs = foreach ($test in $tests) {
        $source = Get-Content -LiteralPath $test -Raw -Encoding UTF8
        foreach ($match in [regex]::Matches($source, '\.\./\.test-build/([\w.-]+\.(?:mjs|json))')) {
            $match.Groups[1].Value
        }
    }
    $modules = @()
    $components = @()
    $fixtures = @()
    foreach ($inputFile in ($inputs | Sort-Object -Unique)) {
        if ($inputFile.EndsWith('.json')) {
            if ($inputFile -notin @('demo.json', 'project.json', 'season.json')) {
                throw "Unbekanntes Test-Fixture: $inputFile"
            }
            $fixtures += $inputFile
            continue
        }
        $entry = [System.IO.Path]::GetFileNameWithoutExtension($inputFile)
        if (Test-Path -LiteralPath "src\$entry.ts" -PathType Leaf) {
            $modules += "src\$entry.ts"
        } elseif (Test-Path -LiteralPath "src\$entry.tsx" -PathType Leaf) {
            $components += "src\$entry.tsx"
        } else {
            throw "Kein TypeScript-Einstiegspunkt für $inputFile"
        }
    }

    $null = New-Item -ItemType Directory -Force .test-build
    try {
        $buildLock = [System.IO.File]::Open(
            (Join-Path $PSScriptRoot '.test-build\.lock'), 'OpenOrCreate', 'ReadWrite', 'None'
        )
    } catch [System.IO.IOException] {
        throw "Testausgaben konnten nicht gesperrt werden. Andere Frontend-Testläufe im selben Checkout zuerst beenden. $($_.Exception.Message)"
    }

    $timer = [System.Diagnostics.Stopwatch]::StartNew()
    if ($modules.Count -or $components.Count) {
        $esbuild = Get-ChildItem -LiteralPath node_modules -Recurse -Filter esbuild.exe -Force |
            Select-Object -First 1 -ExpandProperty FullName
        if (-not $esbuild) { throw 'esbuild.exe fehlt. Zuerst pnpm install ausführen.' }
        $bundleOptions = @('--bundle', '--platform=node', '--format=esm', '--outdir=.test-build', '--out-extension:.js=.mjs')
        if ($modules.Count) {
            & $esbuild @modules @bundleOptions
            if ($LASTEXITCODE -ne 0) { throw 'Test-Build der Module fehlgeschlagen.' }
        }
        if ($components.Count) {
            & $esbuild @components @bundleOptions --packages=external
            if ($LASTEXITCODE -ne 0) { throw 'Test-Build der Komponenten fehlgeschlagen.' }
        }
    }
    Write-Verbose "Test-Bundles: $($timer.ElapsedMilliseconds) ms"

    $timer.Restart()
    $repoRoot = Split-Path $PSScriptRoot -Parent
    $env:PYTHONPATH = Join-Path $repoRoot 'src'
    $geometryPython = Join-Path $repoRoot '.venv\Scripts\python.exe'
    foreach ($fixture in $fixtures) {
        switch ($fixture) {
            'demo.json' {
                & $geometryPython -B -c "import json; from pathlib import Path; from market_garden_planner.prototype.presentation import payload; Path('.test-build/demo.json').write_text(json.dumps(payload(), default=lambda d: d.isoformat()), encoding='utf-8')"
            }
            'project.json' { & $geometryPython -B tests\export_project_fixture.py }
            'season.json' { & $geometryPython -B tests\export_season_fixture.py }
        }
        if ($LASTEXITCODE -ne 0) { throw "Test-Fixture konnte nicht erzeugt werden: $fixture" }
    }
    Write-Verbose "Python-Fixtures: $($timer.ElapsedMilliseconds) ms"

    $timer.Restart()
    & $NodeExecutable --test --test-isolation=none @tests
    if ($LASTEXITCODE -ne 0) { throw 'Interaktionstests fehlgeschlagen.' }
    Write-Verbose "Node-Tests: $($timer.ElapsedMilliseconds) ms"
} finally {
    if ($null -ne $buildLock) { $buildLock.Dispose() }
    $env:PYTHONPATH = $previousPythonPath
    Pop-Location
}
