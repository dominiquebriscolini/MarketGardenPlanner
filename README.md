# Market Gardening Planner ? Phase 1 und 2

## Visueller Prototyp Phase 3A.1

Die aktuelle Oberfläche ist das [Map-first Interface der Phase 3A.2](docs/phase3a2.md):
bildschirmfüllende Karte, schwebende Bedienfelder und unabhängige Hover-/Beetauswahl.
Der lokale Startbefehl bleibt unverändert.

Lokaler Start: `powershell -NoProfile -ExecutionPolicy Bypass -File .\start-prototype.ps1`
und anschließend **http://127.0.0.1:8765** im Browser öffnen.
Die gebaute React-Oberfläche wird vom Python-3.11-Prozess ausgeliefert.
[Start, visuelle Abnahme, Architektur und Neubau](docs/phase3a1.md).
Alle Beispieldaten im Prototyp sind ausdrücklich synthetisch.

Python **3.11.9**, Standardbibliothek, keine Laufzeitabhaengigkeiten.

```powershell
$env:PYTHONPATH = "$PWD/src"
py -3.11 -m unittest discover -s tests -v
```

## Struktur

- `src/market_garden_planner/models.py`: Arten, Sorten, Profile, Ziele, Parameter und Quellenfakten.
- `src/market_garden_planner/database.py`: JSON-Lader mit Referenzpruefung; Schema 1 und 2.
- `src/market_garden_planner/calculator.py`: unabhaengiger Kern, Teilergebnisse und explizite Fehler.
- `src/market_garden_planner/adapters/`: Grenze fuer spaetere Rhino-/Grasshopper-Integration.
- `data/cultures.json`: zehn vereinbarte Kulturen, 15 getrennte Profile, eine belegte Sorte.
- `tests/test_phase1.py`: sieben bestehende Regressionstestgruppen.
- `tests/test_original_acceptance.py`: urspruengliche Abnahmefaelle 1, 2 und 7.
- `tests/test_catalogue.py`: Daten-, Layout- und Schnittstellenpruefungen.
- [Quellen und Datenluecken](docs/agronomy-sources.md)
- [Alle sieben Abnahmefaelle](docs/acceptance.md)
- [Letzter Testlauf](docs/test-results.txt)

```python
from market_garden_planner import load_database, ProductionTarget, calculate, MissingAgronomicData

db = load_database("data/cultures.json")
profile = db.profile("lettuce-butterhead-transplant")
target = ProductionTarget(profile.id, 150, "plants", 1.2)
result = calculate(profile, target)
print(result.plants, result.seeds, result.missing)  # 150, None, missing inputs
try:
    calculate(profile, target, required_outputs=("plants", "seeds"))
except MissingAgronomicData as error:
    print(error)  # no seed estimate without germination/establishment rates
```

Alle zehn Kulturen sind teilweise belegt. Keine ist bereits vollstaendig fuer
Luxemburger Produktionsprognosen kalibriert. Fehlende Quoten und skalare
kg-Ertraege bleiben null. Quellenbereiche und andere Bezugsbasen bleiben separat.
Testwerte sind synthetisch und gelangen nicht in die produktive Datenbank.

Ein einfacher saisonaler Scheduler ist implementiert; keine 3D-Geometrie. Der Kern braucht weder Rhino noch
Grasshopper; Rhino 7 kann spaeter einen externen Python-3.11-Prozess ansprechen.

## Saisonaler Scheduler (Phase 2)

[Architektur, Eingaben und Grenzen](docs/phase2.md)

```powershell
$env:PYTHONPATH = "$PWD/src"
py -3.11 examples/synthetic_scheduler.py
```

Das Beispiel verwendet ausschliesslich synthetische Agronomieparameter.
Alle sieben urspruenglichen Abnahmefaelle sind jetzt automatisiert; 30 Tests bestehen.
Satzplanung, Ernteprognose und Beetbelegung sind in getrennten Modulen umgesetzt.
