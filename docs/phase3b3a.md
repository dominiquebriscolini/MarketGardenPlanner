# Phase 3B.3a — Gespeicherte Projekte in der Karte

Ausgangsstand: `106f30c` (Phase 3B.2), umgesetzt und geprüft am 16.11.2026.
Dieser Schritt ist eine ausschließlich lesende Projektansicht. Python-API,
SQLite-Schema, Geometriekern, Scheduler, Agronomiedaten und Demo-Eingaben bleiben
unverändert. Keine zusätzlichen Abhängigkeiten und kein Git-Commit.

## Lokaler Start und Projekt öffnen

Die vorhandene Python-3.11-Umgebung mit Geometry-Extra verwenden. Falls sie noch
nicht eingerichtet ist, siehe `phase3b2.md` (`pip install -e ".[geometry]"`).

```powershell
cd ~\Documents\MarketGardenPlanner
.\.venv\Scripts\python.exe -B -m market_garden_planner.api.server
```

1. **http://127.0.0.1:8766** im Browser öffnen.
2. Oben links die Auswahl **„Ansicht / Projekt“** öffnen. Zunächst ist
   **„Demo · Saison 2026 (synthetisch)“** aktiv.
3. Einen gespeicherten Projektnamen auswählen. Der kurze UUID-Zusatz hilft bei
   gleichen Namen. Die vollständigen IDs werden unverändert übernommen.
4. Ein Beet anklicken: rechts erscheinen Abmessungen, Fläche, Weltrotation,
   Mittelpunkt, Sperren und IDs. Schließen über ×, Esc oder freie Kartenfläche.
5. Mit +/−, Mausrad oder „Einpassen“ zoomen; freie Kartenfläche zum Verschieben
   ziehen. Das Detailpanel verändert weder Kamera noch Kartenmaßstab.
6. Mit ↻ neben der Auswahl Projektliste und gewähltes Projekt erneut abrufen.
   Das erneute Laden hebt die Auswahl eines Beets auf.

Standarddatenbank ist `.local/projects.sqlite3` im Projektverzeichnis. Falls die
bisher gespeicherten Projekte in einer anderen Datei liegen, genau diese Datei
angeben; ein anderer Dateipfad liefert eine andere Projektliste:

```powershell
.\.venv\Scripts\python.exe -B -m market_garden_planner.api.server --database "C:\vorhandener-ordner\garden.sqlite3"
```

Bei leerer Datenbank erscheint „Noch keine Projekte gespeichert. Demo ist
verfügbar.“ Es werden keine Testprojekte automatisch in der Nutzerdatenbank
angelegt. Projekte werden weiterhin über die bestehende API aus `phase3b2.md`
oder das Python-Repository erstellt. Diese Phase enthält keine Erstellungsmaske.

Der ältere Start `start-prototype.ps1` auf Port 8765 liefert weiterhin die Demo,
jedoch keine Projekt-API. Für die Projektauswahl den oben genannten Server auf
8766 starten. Eine verständliche 404-Meldung weist darauf hin.

### Optionales, getrenntes synthetisches Sichtprüfprojekt

Nur bei Bedarf im Projektverzeichnis ausführen. Das Beispiel verwendet die
vorhandenen Modelle, legt **eine separate Testdatenbank** an und druckt die
Projekt-ID. Jede Ausführung legt ein weiteres, eindeutig synthetisches Projekt
an. Die Nutzerdatenbank wird nicht angesprochen.

```powershell
New-Item -ItemType Directory -Force .local | Out-Null
@'
from market_garden_planner.spatial import BedGeometry, GeometryState, Parcel, Point, new_id
from market_garden_planner.projects.repository import ProjectRepository

def ring(values):
    return tuple(Point(*p) for p in values)

parcel = Parcel(new_id(), ring([(0,0),(28,0),(26,20),(20,24),(0,20),(0,0)]),
    holes=(ring([(16,10),(20,10),(20,14),(16,14),(16,10)]),),
    name="SYNTHETIC parcel", source_reference="SYNTHETIC DISPLAY TEST")
beds = (
    BedGeometry(new_id(), parcel.object_id, Point(5,9), .65, 8, 17,
        name="Beet 17 deg", source_reference="SYNTHETIC DISPLAY TEST"),
    BedGeometry(new_id(), parcel.object_id, Point(11,9), 1.2, 6, 329,
        name="Bestandsbeet", geometry_locked=True,
        source_reference="SYNTHETIC DISPLAY TEST"),
)
project = ProjectRepository(".local/visual-check.sqlite3").create(
    "SYNTHETIC - Visual check", GeometryState(parcel, beds))
print(project.project_id)
'@ | .\.venv\Scripts\python.exe -B -

.\.venv\Scripts\python.exe -B -m market_garden_planner.api.server --database ".local/visual-check.sqlite3"
```

## Module und Datenfluss

- `frontend/src/projectClient.ts`: ausschließlich GET auf `/api/v1/projects`
  und `/api/v1/projects/{project_id}`. Gleiches Origin wie die Oberfläche;
  kein neuer Server, keine Schreibanfragen. Abbruch bei Projektwechsel und
  acht Sekunden Timeout, verständliche Netzwerk-/HTTP-/JSON-Fehler.
- `frontend/src/projectView.ts`: Transporttypen, strukturelle Prüfung des
  vorhandenen API-v1-/Geometrie-v1-Vertrags sowie reine Darstellungsadapter.
  UUIDs, Revisionen, Geometrie-Token, Referenzen, Metadaten, Einheiten, endliche
  Koordinaten und geschlossene Ringe werden geprüft. Die Topologievalidierung
  bleibt im Python-Geometriemodell; kein paralleler Frontend-Geometriekern.
- `frontend/src/App.tsx`: getrennte Demo-/Projektzustände, Projektauswahl,
  Laden/Fehler/leere Liste und getrennte Detail- und Saisonansichten.
  Veraltete Antworten abgebrochener Projektabrufe werden nicht übernommen.
  Projektwechsel hebt Auswahl auf und setzt Kamera auf Einpassen zurück.
- `frontend/src/Plot.tsx`: derselbe SVG-Renderer und dieselbe Kamera für beide
  Modi, Polygonpfad mit Löchern und zentrierte gedrehte Projektbeete.
- `frontend/src/ProjectDetails.tsx`, `ProjectTooltip.tsx`: ausschließlich
  verfügbare Geometrieinformationen, keine erfundenen Kulturen oder Termine.
- `frontend/src/style.css`: kompakte schwebende Projektauswahl, neutrale Beete,
  lesbare IDs und Anpassungen für schmale Fenster.
- `frontend/vite.config.ts`: Entwicklungsproxy für `/api` jetzt auf 8766.
- `frontend/tests/projects.test.mjs`, `export_project_fixture.py` und
  `frontend/test.ps1`: Tests mit einem vom echten Python-Modell und
  SQLite-Repository erzeugten synthetischen API-Datensatz.

Demo-Laden ist unabhängig vom Laden der Projektliste. Ein Fehler der
Projekt-API verhindert deshalb nicht die Demo. Bei einem Projektladefehler
erscheinen Fehlermeldung und Wiederholen-Schaltfläche; eine frühere fremde
Projektgeometrie bleibt nicht irreführend in der Karte stehen.

## Weltkoordinaten und Maßhaltigkeit

Die gespeicherte Weltgeometrie bleibt in Metern: X nach Osten, Y nach Norden,
Winkel gegen den Uhrzeigersinn. Der reine Anzeigeadapter erzeugt SVG-Punkte
`(x, -y)`, ohne Rundung oder Rasterbindung. Polygon-Außenring und alle Lochringe
werden gleich transformiert. Ein kombinierter SVG-Pfad mit `fill-rule="evenodd"`
zeigt Löcher unabhängig von der Ringumlaufrichtung als Aussparungen.

Für ein Projektbeet mit Mittelpunkt `(cx, cy)`, Breite `w`, Länge `l` und
Weltwinkel `a` gilt im SVG:

```text
transform = translate(cx, -cy) rotate(-a)
rect      = x:-w/2, y:-l/2, width:w, height:l
```

Damit werden alle vier Welt-Eckpunkte korrekt nach SVG reflektiert. Ein 17°-
Beet wird nicht lediglich an eine neue Position versetzt oder falsch herum
gedreht. Im Detailpanel steht weiterhin der gespeicherte Weltwinkel 17°.
UUIDs werden als Auswahl-/React-Schlüssel und `data-bed-id` verwendet.

Ein SVG-Längenwert entspricht einem Meter. Die vorhandene Kamera verwendet
denselben Meter-pro-Pixel-Faktor für beide Achsen; Zoomen verändert nur die
ViewBox. Die Maßstabsleiste leitet sich daraus ab. Keine Änderung an
Grundstücks-/Beetkoordinaten durch Zoom, Pan oder Panelaktionen.

Die Demo behält ihren bisherigen Darstellungsvertrag mit links oben
verankerten Rechtecken. Ein eigener lesender Adapter erhält ihre Positionen
und Winkel exakt. Das verhindert eine unbeabsichtigte Migration der Demo.

## Saisonverhalten

Im Demo-Modus bleiben Python-Scheduler-Zustände, Tagesregler, Beethover,
Kulturdetails und kalenderwochengenaue Ernteprognose erhalten.

Ein gespeichertes räumliches Projekt besitzt aktuell keine zugeordneten
Scheduler-Ergebnisse. Es zeigt neutrale Beetgeometrie und den Hinweis
„Keine Saisonplanung für dieses Projekt hinterlegt.“ Der Regler wird durch
diesen Hinweis ersetzt; die Ernteprognose ist deaktiviert. Fehlende Ergebnisse
werden nicht als freies Beet, Nullertrag oder Demo-Kulturbelegung interpretiert.
Kein automatischer Scheduler-Aufruf beim Öffnen eines Projekts.

## Prüfung

Erfolgreich unter Windows mit Python 3.11:

| Prüfung | Ergebnis |
|---|---|
| Gesamte Python-Suite | 81/81 bestanden |
| Frontend-Tests | 21/21 bestanden, davon 9 neue Projekttests |
| TypeScript `tsc --noEmit` | bestanden |
| Produktionsbuild | bestanden, `frontend/dist` aktualisiert |

Die neuen automatisierten Fälle prüfen Transportvertrag/Identitäten,
Polygonlöcher, Y-Reflexion, alle vier Ecken des 17°-Beets, gleichmäßigen
Maßstab bei unterschiedlichen Fenstergrößen und Zoom, Projektlisten und
falsche Antwort-IDs, ungültige Vertragsdaten, ausschließlich lesende API-Wege,
HTTP-/Netzwerk-/JSON-Fehler, Abbruch/Timeout sowie unveränderte Demo-Geometrie.
Die tatsächlichen UI-Projektwechsel und Panels wurden ergänzend im Browser
geprüft; die Tests verwenden kein zusätzliches Browser-Testframework.

Reproduzierbare Befehle aus dem Projektverzeichnis (Node im PATH):

```powershell
.\.venv\Scripts\python.exe -B -m unittest discover -s tests -v
powershell -NoProfile -ExecutionPolicy Bypass -File .\frontend\test.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File .\frontend\build.ps1
```

Die beiden Frontend-Skripte akzeptieren alternativ `-NodeExecutable` mit dem
vollständigen Pfad zur Node-EXE. Die Testfixture benötigt die eingerichtete
`.venv` mit Geometry-Extra. Der Build führt die TypeScript-Prüfung mit aus.

### Browserabnahme

Geprüft bei 1280 × 720 und 390 × 844 Pixeln mit separater temporärer SQLite-
Datenbank außerhalb der Nutzerdatenbank:

- Zunächst leere Projektliste mit verständlichem Hinweis und nutzbarer Demo.
- Zwei synthetische gespeicherte Projekte laden und wechseln, auch mit
  gleichen Beet-UUIDs in verschiedenen Projekten. Auswahl wird aufgehoben;
  die Kamera passt das neue Grundstück ein.
- Unregelmäßiger Außenring, sichtbares Polygonloch, 0,65 × 8 m bei 17° sowie
  zweites Beet bei 329°. Richtige Nordrichtung und Geometriedetails inklusive
  Mittelpunkt, 5,2 m² Fläche, Sperren, IDs und Revision.
- Zoom 100 → 125 %, Pan und Detailpanel schließen: konstante Abmessungen;
  Öffnen/Schließen des Panels verändert die ViewBox nicht.
- Schmale Ansicht: Auswahl und Kartenwerkzeuge erreichbar, Details scrollbar,
  Saisonhinweis sichtbar. Ein geöffnetes Panel verdeckt dort naturgemäß einen
  großen Kartenanteil; Schließen legt die Karte wieder frei.
- Demo nach Projektwechsel: 20.06.2026, alle sechs Beete am Tag frei, dennoch
  in KW 25 korrekt 600 Stück Kopfsalat aus den vorhandenen Ernteereignissen.
- Testserver gezielt beendet und erneut laden ausgelöst: verständlicher
  Verbindungsfehler mit Wiederholen-Schaltfläche statt alter Projektkarte.
- Keine JavaScript-Fehler vor dem absichtlich ausgelösten API-Ausfall.

Desktop-, Mobil- und API-Fehler-Screenshots wurden als separate Abnahmebilder
bereitgestellt. Der temporäre Prüfserver wurde anschließend beendet.

## Grenzen und Anschluss

Keine Geometriebearbeitung, Erstellung, Speicherung oder Projektlöschung in
der Oberfläche. Keine Saisonzuordnung, automatische Berechnung, Optimierung,
Gewächshausfunktion, Bake-Verwaltung oder Isometrie. Aktuell gilt der vorhandene
Geometrie-v1-Vertrag mit einem Grundstück pro Projekt.

Der Browser merkt sich die Projektauswahl nicht über ein Neuladen hinweg.
Änderungen anderer Prozesse werden erst nach ↻ sichtbar; kein Live-Abonnement.
Detailwerte werden für Lesbarkeit formatiert, das übernommene Datenobjekt wird
dabei nicht gerundet. Sehr eng stehende oder sehr kleine Beete können weiterhin
überlappende Beschriftungen haben; es gibt noch kein Label-Platzierungsverfahren.

Die Anzeige nutzt vorhandene Versions- und Identitätsdaten, schreibt sie aber
nicht. Ein späterer Editor muss getrennte Entwürfe, inverse Welttransformation,
validierte Schreibbefehle und Revisionskonflikte ergänzen. Die zentrale
Python-Validierung und Revisionen bleiben dafür maßgeblich.
