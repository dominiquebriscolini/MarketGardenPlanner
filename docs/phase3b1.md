# Phase 3B.1 — eigenständiger Geometriekern

Implementiert am 16.11.2026 für Python 3.11. Keine neue Oberfläche, kein
Generator und keine Änderungen am bestehenden Scheduler oder Demo-Endpunkt.

## Installation und Tests

Der agronomische Kern behält seine leere Laufzeit-Abhängigkeitsliste. Der neue
Geometriekern wird über das optionale Extra `geometry` installiert:

```powershell
cd ~\Documents\MarketGardenPlanner
py -3.11 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -e ".[geometry]"
.\.venv\Scripts\python.exe -B -m unittest discover -s tests -v
```

Die lokale `.venv` muss nicht aktiviert werden. Die neuen Tests benötigen das
Geometry-Extra; der bisherige Anwendungsstart funktioniert weiterhin unabhängig
davon mit dem bisherigen Python-3.11-Prozess. Kein globales Shapely installiert.
Shapely **2.1.2** ist im Extra festgelegt und als Windows-cp311-Wheel geprüft;
verwendete GEOS-Version **3.13.1**, transitive NumPy-Version **2.4.6**.
Die transitive NumPy-Version ist hier ein Prüfstand, kein zusätzlicher Lockfile.

Frontend-Regressionsprüfung unverändert:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File frontend\test.ps1
```

Das Skript unterstützt `-NodeExecutable <Pfad zu node.exe>`. TypeScript kann
mit `node frontend/node_modules/typescript/bin/tsc --noEmit -p frontend/tsconfig.json`
geprüft werden. Die Anwendung benötigt für ihren normalen Start keinen Neubau.

## Paketstruktur

| Datei unter `src/market_garden_planner/spatial/` | Inhalt |
|---|---|
| `models.py` | Unveränderliche metrische Dataclasses und strukturelle Prüfung |
| `geometry.py` | Abgeleitete vier Beetecken, ohne Bildschirmbezug |
| `validation.py` | Shapely-Polygone, Topologie, Einschluss und Kollisionen |
| `changes.py` | Validierte, atomare Breitenänderung eines einzigen Beetes |
| `serialization.py` | Strenger JSON-v1-Vertrag und Geometrie-Abhängigkeitstoken |
| `adapters.py` | Lesende Übersetzung zu bisherigen Scheduler-`Bed`-Objekten |
| `migration.py` | Ausschließlich explizite Migration der synthetischen SVG-Demo |

`market_garden_planner.__init__` importiert das Paket nicht. Der bisherige Kern
erhält dadurch keine Shapely-Abhängigkeit. Shapely-Objekte werden niemals als
maßgebliche Daten gespeichert. Grundlage der räumlichen Operationen ist das
[Shapely-2.1.2-Handbuch](https://shapely.readthedocs.io/en/2.1.2/manual.html).

## Datenstrukturen und Koordinaten

- `Point(x, y)`: endliche Meterkoordinaten, auch negative Koordinaten zulässig.
- `CoordinateFrame`: fester lokaler Rahmen `m / east / north / ccw_degrees`.
- `Parcel`: UUID `object_id`, UUID `revision_id`, explizit geschlossener
  Außenring und Löcher als unveränderliche Tupel von Punkten; Name, Herkunft,
  Quellenreferenz, `geometry_locked` und `generation_protected`.
- `BedGeometry`: UUID/Revision, `parcel_id`, Mittelpunkt, Breite und Länge in
  Metern, Rotation in Grad sowie dieselben Herkunfts-/Sperrfelder.
- `GeometryState`: eine Parzelle, geordnetes Tupel der Beete, Koordinatenrahmen
  und Gesamt-`revision_id`. Doppelte IDs und falsche Grundstücksreferenzen
  werden abgelehnt. Die Reihenfolge bleibt für die Scheduler-Erstbelegung erhalten.

UUIDs sind kanonische Strings. Neue Objekte erhalten über `new_id()` UUID4;
Umbenennung oder Verschiebung erzeugt keine neue Objektidentität.
Winkel müssen bereits in `[0,360)` liegen: keine implizite Normalisierung beim
Einlesen. Alle Maße sind endlich und positiv; Bool-Werte gelten nicht als Zahlen.
Verschachtelte Punkte/Ringe/Beetlisten sind ebenfalls unveränderlich.

Die Breitenachse ist `u=(cos θ,sin θ)`, die Längsachse `v=(-sin θ,cos θ)`.
`corners(bed)` liefert die vier abgeleiteten Ecken. Fläche ist `width_m*length_m`.
Weder Koordinatenraster noch zusätzliche bearbeitbare Polygonkopie eines Beetes.
Ein 17°-Beet bleibt ein echtes gedrehtes Rechteck.

## Validierung

Dataclass-Konstruktion prüft Struktur, IDs, Maße und Einheiten. Die räumliche
Topologie wird ausdrücklich mit `validate(state)` bzw. `require_valid(state)`
geprüft. Konstruktion eines Kandidaten ist noch keine fachliche Freigabe.
JSON-Export/-Import, Scheduler-Adapter und Änderungsfunktion führen diese
Prüfung obligatorisch aus.

- Selbstüberschneidungen, ungültige Löcher und Nullflächen werden abgelehnt.
- Beete müssen innerhalb des Grundstücks einschließlich Loch-Ausschluss liegen.
- Positive Flächenüberschneidungen zweier Beete sind Kollisionen, auch wenn
  eines vollständig im anderen liegt. Reine Kantenberührung ist erlaubt.
- Keine Polygonreparatur, Pufferung, Rundung, Raster-Snaps oder Nachbarverschiebung.
- Numerische Schnitt-/Differenzflächen bis **1e-12 m²** gelten als
  Rechenrest. Das ist keine Erlaubnis für einen praktischen Überstand.
  **1e-6 m** ist als Vergleichstoleranz für Koordinaten dokumentiert, wird aber
  nicht als Grenzpuffer verwendet. Ein realer Überstand wird nicht weggepuffert.

`GeometryIssue` enthält Fehlercode, beteiligte Objekt-IDs, Meldung und optional
WKT der betroffenen Fläche. `GeometryValidationError.issues` bewahrt diese
strukturierten Fehler. Strukturell ungültige Primitive erzeugen `ValueError`.

## Lokale Änderung, Sperren und Revisionsbezug

```python
from market_garden_planner.spatial import (
    resize_bed_width, geometry_token, dumps, loads, scheduler_beds,
)

# state ist ein vorhandener, gültiger GeometryState.
before_token = geometry_token(state)
changed = resize_bed_width(
    state, state.beds[0].object_id, 0.75,
    anchor="negative_edge", expected_revision_id=state.revision_id,
)
assert changed.beds[1] is state.beds[1]  # sofern ein Nachbarbeet vorhanden ist
assert before_token != geometry_token(changed)
assert loads(dumps(changed)) == changed
beds_for_scheduler = scheduler_beds(changed)
```

`anchor="center"` verbreitert symmetrisch. `negative_edge` hält die negative
Breitenkante fest, verschiebt den Mittelpunkt um die halbe Differenz entlang u;
`positive_edge` hält die andere Kante fest. Bei 0,65 → 0,75 m sind das ±0,05 m.
Nur das Zielbeet und der Gesamtzustand erhalten neue Revisions-UUIDs. Nachbarn,
Grundstück, Winkel, Länge, Herkunft und Objekt-ID bleiben unverändert.

Eine Kollision oder Grenzverletzung lehnt den Kandidaten vollständig ab; der
Ausgangszustand wird nicht verändert. `geometry_locked` blockiert die Änderung.
`generation_protected` allein verbietet eine ausdrückliche manuelle Änderung
nicht. Diese Sperre ist für einen späteren Generator bestimmt. Gleiche Breite
ist ein No-op ohne neue Revision; ein gesperrtes Objekt bleibt dennoch gesperrt.
Eine falsche `expected_revision_id` erzeugt einen Revisionskonflikt.

`geometry_token(state)` ist SHA-256 über den kanonischen JSON-Vertrag einschließlich
aller Revisionen, Reihenfolgen und Eingabefelder. Ein späterer Prognoselauf kann
das Token speichern und auf Gleichheit prüfen. Auch versehentlich geänderte
Maße ohne neue Revision ändern das Token. Der Vergleich ist bewusst konservativ:
Metadaten- oder reine Lageänderungen können ebenfalls einen Unterschied erzeugen.
Der Kern selbst startet keinen Scheduler-Lauf und verändert keine Prognose.
PlanRun-/Stale-UI und Revisionskonflikte eines Speicherdienstes bleiben späteren
Phasen vorbehalten.

## JSON und explizite Demo-Migration

Eigenständiges Format: `format="market-garden-spatial"`, `schema_version=1`.
`frame`, `revision_id`, `parcel` und `beds` sind Pflichtfelder. Ringe werden als
Arrays von `{x, y}` gespeichert. IDs, Revisionen, Winkel, Maße, Reihenfolge,
Sperren und Herkunft werden vollständig zurückgelesen. Keine abgeleiteten
Beetpolygone oder Bildschirmkoordinaten im Format.

Unbekannte Versionen verlangen eine ausdrückliche Migration. Doppelte JSON-Keys,
NaN/Infinity, fehlende oder zusätzliche Felder sowie geometrisch ungültige Daten
werden abgelehnt. Beim Import werden keine fehlenden IDs/Revisionen erfunden.
Die bestehenden Katalog- und Demo-Formate werden nicht ersetzt.

`migration.migrate_svg_demo(GEOMETRY)` ist ein separater lesender Test-/Adapterpfad:

- SVG-Ecken in Metern werden ausdrücklich nach `(x, -y)` überführt.
- SVG-Rotation um die linke obere Ecke wird vor der Mittelpunktumrechnung
  berücksichtigt. Weltwinkel ist die ausdrückliche Umrechnung `(-angle) % 360`.
- Implizit geschlossene SVG-Grenze wird im neuen Vertrag explizit geschlossen.
  Das ist eine dokumentierte Formatmigration, keine Topologiereparatur.
- Fester Demo-Namensraum und Legacy-ID liefern stabile UUID5-Objektidentitäten.
  Initialrevisionen hängen deterministisch von den migrierten Eingaben ab;
  spätere Breitenänderungen verwenden neue UUID4-Revisionen.
- B01 usw. bleiben sichtbare Namen; Herkunft und Quellenreferenz sind als
  synthetische Demo erkennbar, Bestand ist standardmäßig generatorgeschützt.
- Original-Dictionary, Demo-Endpunkt und Frontend bleiben unverändert.

## Scheduler-Adapter

`scheduler_beds(state)` prüft Geometrie und erzeugt ein neues Tupel der
vorhandenen `seasonal_models.Bed(id, width_m, length_m)`. ID ist die räumliche
Objekt-UUID; Reihenfolge und Maße werden erhalten. Position und Rotation
beeinflussen die vorhandene rechteckige Kapazitätsrechnung nicht.

Im vollständigen Demo-Regressionsfall werden nur Legacy-`bed_id`-Werte auf die
neuen UUIDs abgebildet; danach stimmen sämtliche Dataclass-Ergebnisse überein,
einschließlich Reservierungen, Flächen, Erntemengen, Zielbilanzen und Warnungen.
Der synthetische Kapazitätstest mit 0,25 m Reihenabstand, 0,30 m Pflanzenabstand
und 8 m Länge bestätigt 52 → 78 Positionen bei 0,65 → 0,75 m Breite.
Keine neuen agronomischen Annahmen außerhalb der gekennzeichneten Testfixtures.

## Tests und Abnahme

`tests/test_spatial.py` ergänzt **22 neue Testfälle**. Zusammen mit den bisherigen
32 Python-Tests ergibt sich **54 erfolgreiche Python-Tests**.

| Testgruppe | Nachweis |
|---|---|
| Grundstück | Konkaves Polygon, schräge Kanten, Loch und gültige Einschlussprüfung |
| 17°-Beet | Exakte Richtung, Kantenlängen, Fläche 5,2 m² |
| Breitenänderung | 0,65 → 0,75 m, 6,0 m², symmetrisch und beide festen Kanten |
| Isolation | Nachbar und Parzelle unverändert; Eingabe bleibt bei Fehlern identisch |
| Kollision | Gedrehte Beete, vollständige Überdeckung, positive Kleinüberschneidung |
| Randfälle | Kantenberührung achsenparallel/gedreht erlaubt; außerhalb und im Loch abgelehnt |
| Ungültige Polygone | Selbstüberschneidung, Nullfläche und falsches Loch ohne Reparatur |
| Sperren/Revision | Geometriesperre, Generatorschutz, Konfliktprüfung, No-op und Tokenwechsel |
| JSON | Vollständiger Roundtrip, Präzision, strenge Felder/Versionen, Topologieprüfung |
| Migration | Sichtbare Ecken bei 0°/17°, stabile IDs/Initialrevisionen, Original unverändert |
| Scheduler | ID-/Reihenfolgevertrag, Kapazität und vollständiger Alt-/Neu-Ergebnisvergleich |

Außerdem: bisherige **12 Frontend-Tests** erfolgreich, TypeScript-Prüfung
erfolgreich, `pip check` ohne Konflikte. Die Demo-Datenaufbereitung funktioniert
weiterhin auch im bisherigen globalen Python ohne Shapely.

## Konkretisierungen gegenüber ARCHITECTURE.md

- Bewusst ein Grundstück pro `GeometryState`; Projektverwaltung, mehrere
  Grundstücke und Gewächshäuser sind nicht Bestandteil 3B.1.
- Das vorgeschlagene `object_revision_id` heißt hier einheitlich `revision_id`
  am jeweiligen Objekt; `object_id` bleibt davon getrennt.
- Keine allgemeine Command-API/Idempotenz oder Speicherung. Nur reine
  Breitenänderung mit optionaler Basisrevisionsprüfung.
- Ringrichtung bleibt bei der Serialisierung erhalten. Es erfolgt keine
  automatische Winding-Normalisierung oder andere topologische Reparatur.
- Herkunft und Quellenreferenz sind vorhanden; ein allgemeines Modell für
  Vermessungsqualität oder Messunsicherheit wird in dieser kleinen Phase nicht ergänzt.
- Flächentoleranz ist konkret 1e-12 m²; Koordinaten werden nicht auf ein Raster gesetzt.
- Shapely als optionales Extra statt Pflichtabhängigkeit des Agronomiekerns.

Kein neuer Editor, kein Bake-System, keine Optimierung/Generierung, keine
isometrische Darstellung. Vorhandene Designreferenzen und fremde Projekte
wurden nicht verändert. Kein Git-Commit erstellt.
