$ErrorActionPreference = 'Stop'
$repoPython = Join-Path $PSScriptRoot '../../.venv/Scripts/python.exe'
if (Test-Path -LiteralPath $repoPython) {
    & $repoPython -u -B (Join-Path $PSScriptRoot 'serve.py')
} else {
    py -3 -u -B (Join-Path $PSScriptRoot 'serve.py')
}
