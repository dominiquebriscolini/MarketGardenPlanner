# Market Garden Planner

Lokaler Market-Gardening-Planer für maßhaltige Grundstücks- und Beetplanung
sowie nachvollziehbare agronomische Berechnungen. Python-Fachkern und Scheduler,
React/TypeScript-Oberfläche mit SVG. Rhino und Grasshopper sind optional.

## Aktueller Implementierungsstand — 17.11.2026

Geprüft am vorhandenen Arbeitsstand bis Phase 3C.2, einschließlich noch nicht
eingecheckter Änderungen. „Implementiert“ bezeichnet Code und vorhandene
Phasenberichte, keine erneute Abnahme durch diese Dokumentationspflege.

- Gespeicherte SQLite-Projekte auswählen und als bildschirmfüllende Karte öffnen:
  unregelmäßiges Grundstück mit Löchern, metrische und frei rotierte Rechteckbeete.
- Beete zeichnen, auswählen, verschieben, drehen, numerisch bearbeiten und nach
  Bestätigung löschen; Sperren, zentrale Geometrievalidierung und Revisionskonflikte.
- Kulturvorgänge je Beet hinzufügen, bearbeiten, entfernen und dauerhaft speichern;
  informative Hinweise auf bekannte oder unklare zeitliche Überschneidungen.
- ISO-Jahr und Kalenderwoche für gespeicherte Projekte wählen. Python leitet den
  Wochenstatus aus eigenen Kulturabsichten ab; keine botanische Wachstumssimulation.
- Separate, schreibgeschützte synthetische Demo mit Tagesregler und
  schedulerbasierter wöchentlicher Ernteprognose.

Gespeicherte Projekte besitzen noch keine neue Ernteprognose oder gespeicherten
Scheduler-Läufe. Gewächshäuser, Bake, räumliche Generierung und eine zusätzliche
Landschaftsansicht sind Zukunftsziele, keine vorhandenen Funktionen.
Details: [Produkt](docs/PRODUCT.md), [Architektur](docs/ARCHITECTURE.md),
[Roadmap](docs/ROADMAP.md) und [offene Fragen](docs/OPEN_QUESTIONS.md).

Die 3C.2-Basis ist in `20e6a63` gesichert; der UX-Nachtrag DEC-032 mit
ID-gebundener Hervorhebung und benannter Kulturüberschrift liegt bereits
implementiert, aber noch nicht eingecheckt vor. Git-/Nachweisdetails und
H-/HF-Zuordnungen: [historischer Abgleich](docs/history/HISTORISCHER_ABGLEICH_2026-11-17.md).

## Lokal starten

In einer bereits eingerichteten Python-3.11-Umgebung im Repository:

```powershell
.\.venv\Scripts\python.exe -B -m market_garden_planner.api.server
```

[Anwendung öffnen](http://127.0.0.1:8766), oben links ein gespeichertes Projekt
oder die gekennzeichnete Demo wählen. **Neues Projekt** legt mit Name, Breite
und Länge ein leeres Grundstück an. Standarddatenbank:
`.local/projects.sqlite3`. Strg+C beendet den Server.
Installation und API-Beispiele: [Phase 3B.2](docs/phase3b2.md);
aktuelle Saisonbedienung: [Phase 3C.2](docs/phase3c2.md).
Die API verwendet SQLite-Schema 2 mit transaktionaler Migration bekannter
Schema-1-Datenbanken; die räumliche JSON-Struktur bleibt Version 1.

Der Python-Kern benötigt nur die Standardbibliothek. Projektgeometrie/API
benötigen zusätzlich das vorhandene Extra `geometry` mit Shapely 2.1.2.
Die gebaute Oberfläche liegt in `frontend/dist`; der normale Start benötigt
keinen Node-Prozess. Installation in eine vorhandene Umgebung bei Bedarf:
`python -m pip install -e ".[geometry]"`.

Die bisherige reine Demo bleibt über `start-prototype.ps1` auf
[Port 8765](http://127.0.0.1:8765) separat startbar.

## Entwicklung und Prüfungen

```powershell
.\.venv\Scripts\python.exe -B -m unittest discover -s tests -q
powershell -NoProfile -ExecutionPolicy Bypass -File frontend\test.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File frontend\build.ps1
```

Der Frontend-Build enthält die TypeScript-Prüfung. Die Skripte erlauben
`-NodeExecutable <absoluter Node-Pfad>`; vorhandene Frontend-Abhängigkeiten
werden vorausgesetzt. [Bauhinweise](docs/phase3a1.md) und
[aktuell dokumentierte Prüfung](docs/phase3c2.md).
Testzahlen bleiben im jeweiligen datierten Phasenbericht; sie sind kein
Nachweis eines neuen Testlaufs. `docs/test-results.txt` gehört historisch zu Phase 2.

Für schnelle Wiederholungen lassen sich einzelne Testdateien auswählen
(aus dem Repository-Stamm in PowerShell):

```powershell
.\.venv\Scripts\python.exe -B -m unittest discover -s tests -p 'test_project_season.py' -q
.\frontend\test.ps1 -TestFile cultivation.test.mjs, project-season.test.mjs -Verbose
```

`-TestFile` erwartet Dateinamen aus `frontend/tests`. Der Runner erzeugt
die benötigten Test-Bundles und Python-Fixtures frisch. `-Verbose` zeigt die
Zeiten für Bundling, Fixture-Erzeugung und Node-Tests. Python- und Frontend-
Tests können parallel laufen. Pro Checkout schreibt jeweils ein Frontend-
Testlauf nach `frontend/.test-build`.

Für gezielte UI-Abnahmen steht der Repository-Skill
[planner-browser-acceptance](.agents/skills/planner-browser-acceptance/SKILL.md)
zur Verfügung. Die Regression richtet sich weiterhin nach dem betroffenen
Umfang und den Abnahmekriterien.

## Dokumentation und Zuständigkeiten

| Einstieg | Zuständigkeit |
|---|---|
| [AGENTS.md](AGENTS.md) | Verbindliche Arbeits- und Pflegeregeln für Codex |
| [PRODUCT.md](docs/PRODUCT.md) | Produktzweck, Umfang, Zukunftsziele und Sammlung von Nutzerideen |
| [DECISIONS.md](docs/DECISIONS.md) | Verbindliche Beschlüsse, vorgeschlagene Optionen und ihre Historie |
| [OPEN_QUESTIONS.md](docs/OPEN_QUESTIONS.md) | Konsolidierte offene Fragen mit stabilen OQ-IDs und DEC-Bezügen |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | Aktuelle technische Struktur und getrennte Erweiterungsentwürfe |
| [ROADMAP.md](docs/ROADMAP.md) | Phasenstatus, Abhängigkeiten und Abnahmekriterien |
| [Agronomiequellen](docs/agronomy-sources.md) | Datenherkunft, Geltung und fachliche Lücken |
| [Ursprüngliche Abnahme](docs/acceptance.md) | Fachliche Rechenfälle aus Phase 1/2 |

Die `docs/phase*.md` bleiben historische Umsetzungs-, Bedienungs- und Prüfberichte.
Aktuelle Editorbeschreibung: [3B.3c](docs/phase3b3c.md);
Kulturplanung: [3C.1](docs/phase3c1.md); Wochenansicht: [3C.2](docs/phase3c2.md).
Ansichtswechsel und Hell/Dunkel: [Gartenansichten](docs/phase-garden-views.md).
Funktionsspezifikationen werden bei Bedarf in `docs/features/` ergänzt;
erster isolierter Versuch: [DP-001](docs/features/DP-001.md).

Das [Botanical ASCII Lab](experiments/botanical-ascii-lab/README.md) bleibt ein
isoliertes Experiment mit eigenem Entscheidungsprotokoll. Es ist kein
Produktionsrenderer und wird nicht durch seine Dokumentation zur Integration freigegeben.

**DP-001 (17.11.2026):** Getrennter Design-Prototyp mit gemeinsam vorbereiteten
ASCII-Pflanzenbildern: Lab starten und
[DP-001 öffnen](http://127.0.0.1:8773/dp001.html).
[Umfang](docs/features/DP-001.md), [Messungen und Grenzen](experiments/botanical-ascii-lab/DP-001.md).

**VIS-GRAIN-003 (18.11.2026):** Zehn animierte ASCII-Tomaten aus einem
transparenten Atlas. [Lab-Startanleitung](experiments/botanical-ascii-lab/README.md),
[Testansicht öffnen](http://127.0.0.1:8773/vis-grain-003/),
[Versuchsbericht](experiments/botanical-ascii-lab/VIS-GRAIN-003.md).

## Historischer Einstieg

Die bisherige README bleibt unten vollständig erhalten. Ihre Funktions-,
Abhängigkeits- und Testangaben gelten für die dort genannten früheren Phasen;
für den aktuellen Stand gelten die Abschnitte oben.

<details>
<summary>Bisherige README — historischer Inhalt unverändert</summary>

# Market Gardening Planner ? Phase 1 und 2

## Projektanzeige Phase 3B.3a

Gespeicherte Grundstücke mit Polygonlöchern und frei gedrehten Beeten jetzt
in der bestehenden Karte öffnen: API-Server wie unten starten, im Browser
**http://127.0.0.1:8766** öffnen und oben links **„Ansicht / Projekt“** wählen.
Geometrieanzeige ohne Bearbeitung; die synthetische Demo bleibt separat verfügbar.
[Startanleitung, Koordinatentransformation und Abnahme](docs/phase3b3a.md).

## Projektpersistenz und API Phase 3B.2

SQLite-Projekte mit zentral validierter Geometrie und Revisionskonflikten:
`.\.venv\Scripts\python.exe -B -m market_garden_planner.api.server`.
Standard: http://127.0.0.1:8766, lokale Datenbank `.local/projects.sqlite3`.
[Installation, API-Anfragen, Schema und Testresultate](docs/phase3b2.md).
Der bisherige Demo-Start auf Port 8765 bleibt unverändert.

## Geometriekern Phase 3B.1

Separates optionales Paket `market_garden_planner.spatial` mit metrischen
Polygonen, gedrehten Rechteckbeeten, Validierung, JSON und lesendem Scheduler-Adapter.
Installation in einer lokalen Python-3.11-Umgebung: `python -m pip install -e ".[geometry]"`.
[Datenvertrag, vollständige Installation und Tests](docs/phase3b1.md).
Demo, Frontend und agronomischer Kern bleiben unverändert.

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
.\.venv\Scripts\python.exe -B -m unittest discover -s tests -v
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

</details>
