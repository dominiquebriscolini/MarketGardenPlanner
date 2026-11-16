# Phase 3B.3b — Beete zeichnen und verschieben

Ausgangsstand: `012cbc3` (Phase 3B.3a), implementiert und geprüft am 16.11.2026.
Umfang: rechteckige Beete manuell zeichnen, auswählen und verschieben. Keine
Optimierung, Grundstücksbearbeitung, Isometrie oder neue Kulturplanung.

## Start und Bedienung

Im Projektverzeichnis die vorhandene Python-3.11-Umgebung mit Geometry-Extra
verwenden. Nach einem Update **den bisherigen API-Prozess beenden und neu
starten**, damit der zusätzliche Anlege-Endpunkt verfügbar ist:

```powershell
cd ~\Documents\MarketGardenPlanner
.\.venv\Scripts\python.exe -B -m market_garden_planner.api.server
```

**http://127.0.0.1:8766** öffnen, gegebenenfalls die Seite neu laden und unter
„Ansicht / Projekt“ ein gespeichertes Projekt wählen. Die bestehende Datenbank
`.local/projects.sqlite3` bleibt erhalten. Alternative Datenbank wie bisher
mit `--database "C:\vorhandener-ordner\garden.sqlite3"` angeben.

### Auswählen und verschieben

- „Auswählen“ ist beim Projektöffnen aktiv. Ein Klick auf ein Beet öffnet die
  vorhandene geometrische Detailansicht. Diese zeigt den bestätigten Stand.
- Ein ungesperrtes Beet mit gedrückter linker Maustaste ziehen und loslassen.
  Der Mausversatz verschiebt ausschließlich dessen Mittelpunkt. Winkel,
  Breite, Länge, Identität und Nachbarbeete bleiben erhalten.
- Gesperrte Beete bleiben auswählbar, werden aber nicht verschoben. Eine
  Meldung erklärt die Sperre. Es gibt hier kein Entsperrwerkzeug.
- Freie Kartenfläche im Auswahlmodus ziehen, um die Kamera zu verschieben.
  Zoom, „Einpassen“, Hover und Auswahl bleiben verfügbar.

### Ein Beet zeichnen

1. „Beet zeichnen“ wählen.
2. **Beetbreite in Metern** vorgeben, beispielsweise `0,75`. Der Startwert ist
   0,75 m; die Eingabe ist ausdrücklich ein Maß für neue Beete, keine Änderung
   vorhandener Beetbreiten. Nur positive, endliche Werte werden verwendet.
3. Auf der Karte den **Anfang der Längsachse** drücken, zum **Ende der
   Längsachse** ziehen und loslassen. Die zwei Punkte bestimmen Länge,
   Mittelpunkt und freie Ausrichtung. Die Breite liegt symmetrisch um die
   Achse. Diese Festlegung vermeidet die Mehrdeutigkeit zweier gegenüberliegender
   Ecken bei gleichzeitig freier Rotation und frei wählbarer Breite.
4. Während des Ziehens erscheint ein maßhaltiges gestricheltes Rechteck.
   Nach dem Loslassen folgen abschließende Python-Validierung und Speicherung.
   Erst die bestätigte API-Antwort übernimmt das neue Beet in den Bestand.

Winkel werden aus der gezogenen Längsachse berechnet, nicht auf 0°, 30°, 45°
oder 90° eingerastet. Es gibt kein verpflichtendes Raster und keine Rundung
der gespeicherten Maße. Eine Bewegungsschwelle von vier Bildschirmpixeln
unterscheidet einen Klick vom Ziehen; sie ist kein geometrisches Mindestmaß.
Ein Null-Längen-Beet wird nicht angelegt.

„Vorschau verwerfen“ oder Esc verwirft eine noch nicht bestätigte Vorschau.
Esc beendet außerdem den Zeichenmodus. Beim laufenden abschließenden
Prüfen/Speichern sind weitere Bearbeitung, Projektwechsel und Neuladen über
die Projektauswahl kurz gesperrt. Eine laufende Speicherung wird nicht als
vermeintlich sicher rückgängig gemacht.

## Vorschau, Validierung und Fehler

Der bestätigte Projektstand und der Entwurf sind getrennte Zustände. Bei einer
Verschiebung bleibt der gespeicherte Ursprung abgeblendet sichtbar. Ein
gestricheltes Rechteck zeigt den Kandidaten:

- Ocker: Prüfung ausstehend oder läuft.
- Grün: Python hat die aktuelle Vorschau als geometrisch gültig bestätigt;
  sie ist **noch nicht gespeichert**.
- Rot: ungültige oder nicht bestätigte Vorschau. Der Bestand bleibt erhalten.

Die vollständige Kandidatengeometrie wird nach kurzer Eingabepause (120 ms)
über `POST /api/v1/geometry/validate` an den vorhandenen Geometriekern
übergeben. Shapely prüft Kollisionen, Grundstücksgrenze und Polygonlöcher.
Es gibt keine alternative JavaScript-Topologieprüfung. Vor dem Schreiben
wird die endgültige Position erneut validiert. Zusätzlich prüft das Repository
innerhalb der Schreibtransaktion den tatsächlichen neuesten Projektstand.

Alte Vorschauabrufe werden abgebrochen und durch eine laufende Sequenzkennung
entwertet. Verspätete Antworten dürfen keine jüngere Vorschau einfärben.
Pointer-Cancel, verlorene Pointer-Capture, Werkzeugwechsel, Fenstergrößenwechsel
oder Esc beenden eine laufende Geste, ohne sie zu speichern.

Bei Kollision, außerhalb der Grenze oder im Loch bleibt die rote Vorschau
mit verständlicher Meldung stehen. Es erfolgt kein Schreibaufruf nach
fehlgeschlagener abschließender Vorvalidierung. Bei API-Ausfall, fehlerhafter
Antwort oder Revisionskonflikt ersetzt der Entwurf niemals den bestätigten
Projektstand. Das rechte Panel zeigt weiterhin gespeicherte Werte.

**Wichtig bei verlorener Schreibantwort:** Ein Server kann bereits committed
haben, obwohl die Browserantwort verloren geht. Deshalb heißt die Meldung
„Speicherung nicht bestätigt“; sie behauptet keinen sicheren Rollback.
Mit ↻ neu laden, um den tatsächlichen gespeicherten Stand abzurufen. Es gibt
keine automatische Wiederholung, kein Offline-Speichern und kein blindes
Überschreiben nach einem Konflikt.

## API-Erweiterung und Persistenz

Die bisherige API kann verschieben (`PATCH`), lehnte neue Objekt-IDs in einem
vollständigen `PUT` aber absichtlich ab. Diese Schutzregel bleibt erhalten.
Neu ist ausschließlich der explizite Anlegeweg:

| Methode / Pfad | Inhalt | Ergebnis |
|---|---|---|
| `POST /api/v1/projects/{project_id}/beds` | `expected_revision`, vollständiges `bed` im vorhandenen Geometrie-v1-Format, optional `command_id` | 201, vollständiges bestätigtes `project` |
| `PATCH /api/v1/projects/{project_id}/beds/{bed_id}` | `expected_revision`, `changes: {center: {x, y}}`, optional `command_id` | Bestehender Endpunkt, 200 |
| `POST /api/v1/geometry/validate` | Vollständige Kandidatengeometrie | Bestehender Endpunkt, ohne Schreiben |

Beispiel für den Körper eines Anlegebefehls (UUID-Werte sind Platzhalter):

```json
{
  "expected_revision": "<Projektrevision>",
  "command_id": "<neue Befehls-UUID>",
  "bed": {
    "object_id": "<neue Beet-UUID>",
    "revision_id": "<initiale UUID>",
    "parcel_id": "<bestehende Grundstücks-UUID>",
    "name": "Beet 7",
    "origin": "manual",
    "geometry_locked": false,
    "generation_protected": true,
    "source_reference": "Manuell gezeichnet",
    "center": {"x": 7.125, "y": 12.75},
    "width_m": 0.75,
    "length_m": 6.2,
    "rotation_deg": 17
  }
}
```

Die bestehenden UUID-/Metadaten-/Referenzregeln gelten unverändert. Der
Server übernimmt die neue Objekt-ID, vergibt die endgültige Objektrevision
und erhöht Geometrie- und Projektrevision. Geometrie-Token ändern sich wie
bisher. Vorhandene Beete behalten Reihenfolge, IDs, Revisionen und Eigenschaften.
Entwürfe verwenden stabile UUIDs über sämtliche Pointerbewegungen hinweg.

Der neue Endpunkt ergänzt genau ein Beet. Duplikate, falsche Referenzen,
ungültige Felder und ungültige Topologie werden ohne Reparatur abgewiesen.
Er kann keine vorhandenen Objekte ersetzen, löschen oder nebenher ändern.
`PUT` erlaubt weiterhin keine Hinzufügung/Entfernung von IDs.

Anlegen und Verschieben verwenden das vorhandene SQLite-`_change` mit
`BEGIN IMMEDIATE`, erwarteter Projektrevision und atomarem Änderungsbeleg.
Veraltete Revision: **409**; fehlende erwartete Revision: **428**; ungültige
Geometrie/gesperrtes Beet: **422**. Wiederholung derselben `command_id` mit
identischer Anfrage liefert die gespeicherte Antwort statt eines zweiten
Beets. Derselbe Befehl mit anderem Inhalt ist ein Konflikt.

Keine Migration: Datenbankschema, API-Version und räumliches JSON bleiben
Version 1. Der bestehende strenge JSON-Leser und Geometriekern werden
wiederverwendet. Der generische Vorschau-Endpunkt prüft Topologie; Sperren
und Projektrevision sind zusätzlich beim endgültigen Schreibbefehl maßgeblich.
Es gibt noch keinen eigenen projektbezogenen Vorschau-Endpunkt.

## Module

- `frontend/src/editingGeometry.ts`: inverse Bildschirm-/SVG-/Welttransformation,
  Rechteck aus Längsachse plus Breite, reine Translation und Kandidatenbildung.
- `frontend/src/editingClient.ts`: Vorvalidierung, vorhandener PATCH bzw.
  neuer POST und Prüfung der bestätigten Rückgabe. Verschieben sendet nur
  `center`, niemals nebenher Maße oder Winkel.
- `frontend/src/useBedEditor.ts`: Werkzeug, Breite, Entwurf, Prüfreihenfolge,
  Abbruch, Sequenzschutz und bestätigte Übernahme.
- `frontend/src/EditorControls.tsx`: kompakte Werkzeugleiste und klare Statusmeldungen.
- `frontend/src/Plot.tsx`: Pointer-Gesten, maßhaltige Vorschau; ursprüngliche
  Geometrie und lesbare Namen bleiben getrennt.
- `frontend/src/App.tsx`, `projectClient.ts`, `style.css`: Anbindung,
  strukturierte API-Fehler und responsive schwebende Bedienelemente.
- `projects/geometry_updates.py`, `projects/repository.py`, `api/routes.py`
  unter `src/market_garden_planner/`: schmaler Anlegebefehl mit vorhandener
  Validierung, Revisionierung und Transaktion.
- `tests/test_projects.py`, `frontend/tests/editing.test.mjs`,
  `frontend/test.ps1`: API-/SQLite-/Darstellungs-/Interaktionstests.

Die inverse Transformation berücksichtigt ViewBox, Zoom, Pan, Position und
Größe des SVG sowie mögliches `xMidYMid meet`-Letterboxing. Danach wird SVG-Y
zurück nach Welt-Y gespiegelt. Während einer Geste wird ihre Kameraabbildung
festgehalten; ein Größenwechsel bricht ab. Keine Ableitung von Weltmetern
aus einem fest angenommenen Pixelmaß.

## Testresultate

| Prüfung | Ergebnis |
|---|---|
| Python 3.11, gesamte Suite | **87/87 bestanden**, 6 neue API-Fälle |
| Frontend, gesamte Suite | **36/36 bestanden**, 11 neue Editorfälle |
| TypeScript `tsc --noEmit` | bestanden |
| Produktionsbuild | bestanden, `frontend/dist` aktualisiert |

API-Tests prüfen Anlegen und erneutes Laden nach Repository-Neustart,
Rotation/Maße/UUIDs, unveränderte Nachbarn, Kollision, Grenze, Loch, doppelte
IDs, Revisionskonflikt, idempotente Wiederholung und fehlende Revision.
Ein absichtlich fehlschlagender Beleg-INSERT weist vollständigen Rollback
eines bereits ausgeführten Anlege-Updates nach. Die bisherige PUT-ID-Sperre
und vorhandene Sperr-/Demo-Tests bleiben erfolgreich.

Frontend-Tests prüfen Zoom/Pan/Fenstergrößen/Letterboxing, exakte Endpunkte
und freie Winkel, Breiten ohne Rundung, reine 17°-Translation, Sperren,
Validierung vor POST/PATCH, erwartete Revision und Command-ID, Blockieren
ungültiger Kandidaten, Netzwerk-/Konfliktfehler und unvollständige Bestätigung,
Abbruch vor Schreiben, klar getrennte rote Vorschau, Toolbar und Demo-Schutz.

```powershell
.\.venv\Scripts\python.exe -B -m unittest discover -s tests -v
powershell -NoProfile -ExecutionPolicy Bypass -File frontend\test.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File frontend\build.ps1
```

Frontend-Skripte akzeptieren wie bisher `-NodeExecutable` für einen absoluten
Node-Pfad. Der Build enthält die TypeScript-Prüfung. Keine neuen Bibliotheken.

### Browserabnahme

Mit einer **separaten temporären synthetischen Datenbank**, nicht mit dem
dauerhaft angelegten Testgarten oder anderen Nutzerprojekten, geprüft:

- Auswahl und Detailanzeige; 17°-Beet von (5, 9) nach (6, 10) bei 100 % Zoom.
- Weitere Verschiebung nach (7, 11) bei 125 % Zoom: 25 Pixel entsprechen dort
  genau einem Meter; Winkel 17°, Breite 0,65 m und Länge 8 m bleiben gleich.
- Gesperrtes Nachbarbeet blockiert; API-Vergleich bestätigt unverändertes Objekt.
- Neues Beet mit 0,75 m Breite, Länge 3,605551275… m, freiem Winkel
  326,309932474…° und Mittelpunkt (6, 18,5) gezeichnet und gespeichert.
- ↻ lädt alle drei Beete mit bestätigten Werten erneut.
- Verschieben ins Polygonloch und auf den Nachbarn: rote Vorschau,
  verständliche Meldung, kein gespeicherter Geometriewechsel.
- Zeichnen über die Grundstücksgrenze hinaus: abgelehnt.
- Externe Projektänderung vorbereitet, anschließend aus veralteter Ansicht
  verschoben: HTTP 409, Fehlermeldung, keine Übernahme der Vorschau.
- Testserver beendet und danach verschoben: Verbindungsfehler, alter
  bestätigter Mittelpunkt bleibt im Detailpanel.
- 1280 × 720 und 390 × 844: Werkzeuge erreichbar, Panel scrollbar, keine
  Kartenverkleinerung durch Overlays. Screenshots separat bereitgestellt.
- Demo ohne Editorwerkzeuge; Saison 20.06.2026 zeigt weiterhin freie Beete
  und korrekt 600 Stück Kopfsalat in KW 25 aus den Scheduler-Ernteereignissen.
- Keine JavaScript-Fehler vor dem absichtlich ausgelösten API-Ausfall.

## Bekannte Grenzen

- Noch kein Undo/Redo, Löschen, numerisches Verschieben, nachträgliches
  Skalieren/Rotieren, Entsperren oder Anlegen einer Grundstücksgrenze.
- Zeichnen ist eine Ziehgeste mit zwei Achsendpunkten, kein getrenntes
  Klick-Klick-Werkzeug. Touch-/Stifteingaben verwenden Pointer Events;
  physische Touch-/Stiftgeräte wurden nicht separat abgenommen.
- Gültigkeitsfarbe folgt der Python-Antwort, somit mit Eingabepause und
  Netzwerklatenz. Auch eine grüne Vorschau ist keine Speicherzusage.
- Auf schmalen Fenstern verdecken Werkzeuge/Details einen größeren Teil der
  unverändert maßhaltigen Karte. Beschriftungskollisionen sind weiter möglich.
- Keine gespeicherten Scheduler-Ergebnisse an Projekten; keine automatische
  Neuberechnung nach Flächenänderung. Geometrie-Token bereiten spätere
  Veraltetheitsprüfung vor, ohne neue agronomische Annahmen.

Demo-Eingaben, Scheduler, Agronomieberechnungen, räumliches JSON und zentraler
Geometriekern wurden nicht verändert. Kein Git-Commit erstellt.
