param([int]$Port = 8765)
$ErrorActionPreference = 'Stop'
$env:PYTHONPATH = Join-Path $PSScriptRoot 'src'
$env:PYTHONDONTWRITEBYTECODE = '1'
py -3.11 -B -m market_garden_planner.prototype.server --port $Port
