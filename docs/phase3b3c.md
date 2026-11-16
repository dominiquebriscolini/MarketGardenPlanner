# Phase 3B.3c — Präzise Beetbearbeitung

Ausgangsstand: `f57d9b3`, implementiert und geprüft am 16.11.2026.
Grundlagen: AGENTS.md, DECISIONS.md (insbesondere DEC-003, DEC-006 bis DEC-010),
Produkt, Architektur, Roadmap und Phase 3B.3b. Die kleine Erweiterung ist in
**DEC-027** ausdrücklich dokumentiert; frühere Entscheidungen bleiben erhalten.
Der UI-Feinschliff vom 16.11.2026 folgt zusätzlich **DEC-028**.

## Funktionen und Start

Bestehende gespeicherte Projektbeete können jetzt am Mittelpunkt frei gedreht,
numerisch in Breite, Länge, Winkel und Mittelpunkt bearbeitet sowie nach
Bestätigung gelöscht werden. Zeichnen, Auswählen, Drag-and-drop, Zoom/Pan,
aufrechte Namen und vorhandene Hover-Tooltips bleiben erhalten. Die Demo bleibt
schreibgeschützt. Keine automatische Flächenaufteilung und keine neuen Abhängigkeiten.

Nach einem Update den laufenden API-Prozess mit Strg+C beenden und neu starten,
damit der neue DELETE-Endpunkt geladen wird:

```powershell
cd ~\Documents\MarketGardenPlanner
.\.venv\Scripts\python.exe -B -m market_garden_planner.api.server
```

**http://127.0.0.1:8766** im Browser neu laden und unter „Ansicht / Projekt“
ein gespeichertes Projekt wählen. Datenbank unverändert `.local/projects.sqlite3`;
eine andere vorhandene Datei wie bisher mit `--database "C:\Pfad\garden.sqlite3"`
angeben. Der originale Demo-Server auf 8765 ersetzt die Projekt-API nicht.

Der Produktionsbuild wurde nach `frontend/dist` gebaut. Die Prüfungen verwendeten
eine separate temporäre SQLite-Datenbank; bestehende Nutzerprojekte und der
dauerhafte „Testgarten – Geometrie“ wurden dabei nicht bearbeitet oder gelöscht.

## Bedienung

### Rotation am Griff

1. Im Auswahlmodus ein ungesperrtes Beet anklicken.
2. Der kleine Kreis jenseits der positiven Längsachse ist der Rotationsgriff.
3. Den Kreis mit gedrückter linker Maustaste um das Beet ziehen. Drehpunkt ist
   der gespeicherte Mittelpunkt. Ohne Shift ist der Winkel vollständig frei.
   Mit gedrückter **Shift-Taste** rastet der absolute Winkel in **15°-Schritten**
   ein, also auch bei 45° und 90°. Loslassen von Shift stellt noch während
   derselben Geste die freie Rotation wieder her, auch ohne weitere Mausbewegung.
4. Die gestrichelte maßhaltige Vorschau zeigt die neue Ausrichtung. Loslassen
   startet abschließende Python-Prüfung und Speicherung.

Mittelpunkt, Breite, Länge, UUID und Nachbarn bleiben bei einer reinen Drehung
erhalten. Griffabstand und Trefffläche bleiben beim Zoom in Bildschirmpixeln
gut bedienbar; der eigentliche Winkel wird aus Weltkoordinaten berechnet.
Eine Pointerposition direkt im Drehzentrum hat keinen definierten Polarwinkel
und wird nicht als neue Rotation gespeichert.
Während der Drehung zeigt ein kleines, aufrechtes Fenster an der Maus den
Winkel mit maximal zwei Nachkommastellen und den aktuellen Rasterstatus.
Es bleibt innerhalb des Viewports und fängt keine Zeigerereignisse ab.

Der Griff erscheint nur beim ausgewählten ungesperrten Projektbeet im
Auswahlmodus. Während einer noch nicht übernommenen numerischen Vorschau oder
einer fehlgeschlagenen Änderung ist er ausgeblendet: zuerst speichern oder
verwerfen. Während einer laufenden Griffrotation folgt er der Vorschau.

### Numerische Maße, Winkel und Position

Das rechte Panel enthält fünf Eingabefelder:

- Breite und Länge in **Metern**.
- Winkel in **Grad**, gegen den Uhrzeigersinn im Weltkoordinatensystem.
- Mittelpunkt X nach **Osten**, Mittelpunkt Y nach **Norden**, jeweils in Metern.

Dezimalwerte sind erlaubt. Es wird kein Eingaberaster erzwungen und keine
zusätzliche Dezimalrundung gespeichert. Ruhende Felder, Zusammenfassungen und
Projekt-Hover zeigen maximal **zwei Nachkommastellen**. Auswahl und bloßes
Fokussieren eines Felds ändern weder Rohwert noch Vorschau oder Revision.
Erst tatsächliches Tippen zeigt den vollständigen eingegebenen Text, damit
auch präzise Dezimaleingaben bearbeitbar bleiben. Beim Verlassen wird wieder
kompakt angezeigt; der vollständige Eingabetext bleibt separat erhalten.
Beim Speichern eines Felds werden unveränderte andere Werte niemals aus ihren
gerundeten Anzeigen rekonstruiert. Zahlen verwenden wie das bestehende Modell die
Fließkomma-Präzision der Laufzeit, keine beliebige mathematische Dezimalpräzision.

Winkel sind gemäß bestehendem Geometrievertrag im Bereich **0° bis kleiner
als 360°** einzugeben. Negative Werte oder 360° werden mit Hinweis abgelehnt
und nicht still umgerechnet. Breite und Länge müssen positiv und endlich sein;
leere Felder, NaN/Infinity oder unvollständige Zahlen sind keine gültige Änderung.

Jede gültige Eingabe erzeugt eine **noch nicht gespeicherte Vorschau**.
„Änderungen speichern“ validiert und schreibt die explizit geänderten Werte
gemeinsam. „Verwerfen“ setzt Felder und Vorschau auf den bestätigten Stand zurück.
Der Abschnitt **„Gespeicherte Geometrie“** zeigt währenddessen weiterhin die
zuletzt bestätigten Eigenschaften. Kein automatisches Speichern beim Verlassen
eines Felds.

Breite/Länge werden standardmäßig symmetrisch um den Mittelpunkt verändert.
Position und Winkel bleiben dabei gleich. Eine reine Koordinatenänderung
verändert weder Winkel noch Maße. Änderungen betreffen nur das ausgewählte Beet.
Der explizite `ResizeAnchor='center'`-Vertrag bereitet eine spätere Erweiterung
für feste Bezugskanten vor. Diese zusätzlichen Bezugskanten sind noch keine
Bedienoption; der bestehende Python-Breitenanker bleibt unverändert verfügbar.

Beginn einer Kartengeste verwirft zuvor nicht gespeicherte numerische Eingaben,
damit diese nicht unbemerkt mit einer neuen Drag-/Rotationsoperation kombiniert
werden. Wechsel zu einem anderen Beet lädt dessen bestätigte Werte.

### Löschen und Entf

- Im Panel „Beet löschen …“ wählen oder bei ausgewähltem Beet **Entf** drücken.
- Entf ist in Zahlen-/Textfeldern, Selects, Textareas und editierbaren Text-
  Widgets nicht als Löschbefehl aktiv. Wiederholungs-/Kompositionseingaben und
  abgeänderte Tastenkombinationen lösen ebenfalls keine Beetlöschung aus.
- Ein modaler Dialog nennt das Beet und seine UUID. Der Fokus liegt zunächst
  auf **„Abbrechen“**. Abbrechen oder Esc schließt nur den Dialog und erhält
  Auswahl, Detailpanel und gespeichertes Beet.
- Erst **„Endgültig löschen“** startet die validierte API-Änderung. Nach deren
  Bestätigung verschwinden Beet, Auswahl, Griff und Detailpanel. Zoom und
  Grundstück bleiben erhalten.
- Gesperrte Beete erhalten deaktivierte Eingaben und Löschschaltfläche, keinen
  Griff und auch über Entf keinen Löschdialog.

Es gibt noch keine Rückgängig-Funktion. Bei API-Fehler oder Konflikt bleibt
der Dialog mit Fehlermeldung offen; das Beet wird im Browser nicht vorzeitig
entfernt. Während laufender Bestätigung sind Abbrechen und erneutes Löschen
gesperrt, um einen möglicherweise schon ausgeführten Schreibvorgang nicht
als sicher abgebrochen darzustellen.

## Validierung, Datenfluss und API

Alle Operationen verwenden denselben getrennten Entwurf wie Phase 3B.3b.
Die vorhandene Inverse der SVG-Kamera berücksichtigt ViewBox, Zoom, Pan,
Viewport und Y-Spiegelung. Die Drehung ist die Differenz der Start-/End-
Polarwinkel um den Mittelpunkt; Breite/Länge bleiben parametrische Meterwerte.

Vorschauabrufe werden nach kurzer Eingabepause an die bestehende generische
Python-Geometrieprüfung gesendet. Vor dem Schreiben wird nochmals geprüft.
Shapely kontrolliert Kollisionen, Grundstücksgrenzen und Polygonlöcher;
Sperre und erwartete Projektrevision werden beim atomaren Schreiben gegen
den aktuellen Serverstand geprüft. Keine JavaScript-Topologie-Engine und keine
Reparatur ungültiger Geometrien. Das ausdrückliche Shift-Winkelraster betrifft
nur die Griffrotation; Zeichnen, Verschieben und numerische Eingaben bleiben frei.

| Operation | Schnittstelle | Gesendete Änderung |
|---|---|---|
| Zeichnen | bestehendes POST `/api/v1/projects/{id}/beds` | neues Rechteckbeet |
| Verschieben | bestehendes PATCH `/api/v1/projects/{id}/beds/{bed_id}` | nur `center` |
| Griffrotation | dasselbe PATCH | nur `rotation_deg` |
| Numerische Eingabe | dasselbe PATCH | ausschließlich geänderte Felder aus `center`, `width_m`, `length_m`, `rotation_deg` |
| Löschen | **neues DELETE** `/api/v1/projects/{id}/beds/{bed_id}` | `expected_revision`, optional `command_id` |

DELETE erwartet wie PATCH JSON mit `Content-Type: application/json`:

```json
{
  "expected_revision": "<aktuelle Projektrevisions-UUID>",
  "command_id": "<neue Befehls-UUID>"
}
```

Antwort: HTTP 200 und das vollständige bestätigte Projekt im bestehenden
API-v1-Umschlag. Der Client kontrolliert den erwarteten Beetbestand und bei
Änderungen die bestätigten geometrischen Eigenschaften. Die UI übernimmt
ausschließlich erfolgreiche, dekodierte Antworten.

DELETE nutzt die vorhandene `BEGIN IMMEDIATE`-Transaktion mit Revisionsprüfung,
neuer Geometrie-/Projektrevision und verändertem Geometrie-Token. Nachbarobjekte,
deren Revisionen und das Grundstück bleiben identisch. Leere Projekte nach
Löschen des letzten Beets bleiben gültig. Vollständiges PUT erlaubt weiterhin
keine ID-Hinzufügung oder -Entfernung.

Fehler wie bisher: 409 bei veralteter Revision, 428 ohne erwartete Revision,
422 bei Sperre/ungültigen Werten oder Geometrie, 404 bei fehlendem Beet.
Bei einem Löschbefehl gilt die Bestätigung im Browser als Bedienungsschutz;
ein ausdrücklich ausgeführter API-DELETE ist selbst der Löschauftrag und
öffnet keinen zusätzlichen serverseitigen Dialog.

### Dauerhafte ID-Sperre und Kompatibilität

Ein Löschbeleg erhält intern im vorhandenen `commands.response_json` das
zusätzliche Feld **`_deleted_bed_id`**. Er bleibt atomar mit der Projektänderung
gespeichert. Auch DELETE ohne mitgelieferte Command-ID legt einen Beleg mit
serverseitig erzeugter ID an. Wiederholung einer mitgelieferten Command-ID
liefert wie bisher dieselbe Antwort.

Das Wiederanlegen derselben gelöschten Objekt-ID im **selben Projekt** wird
mit `retired_id` (422) abgelehnt. Andere Projekte bleiben unabhängig.
Vorhandene Belege ohne dieses Metadatum bleiben lesbar. Die zusätzliche
Beleginformation wird nicht in den öffentlichen Projektumschlag oder die
Fachgeometrie aufgenommen. SQLite-Tabellenschema, API-Version und räumliches
JSON bleiben Version 1; keine Migration und kein paralleles Geometriemodell.
Eine künftige Belegbereinigung muss diese ID-Sperren erhalten.

### Fehlerzustände

Ungültige Vorschauen werden rot markiert und nicht gespeichert. Ein Ausfall
vor dem Schreiben meldet „Nicht gespeichert“. Geht eine Schreibantwort verloren,
kann der Server bereits committed haben; dann heißt die Meldung weiterhin
„Speicherung nicht bestätigt“. Mit ↻ den tatsächlichen Stand neu laden.
Kein blindes Wiederholen, kein Überschreiben nach 409 und kein behaupteter
Rollback allein wegen einer fehlenden Browserantwort. Verspätete Vorschau-
Antworten bleiben durch Abbruch und Sequenzkennung entwertet.

## Geänderte Module

- `frontend/src/editingGeometry.ts`: isolierte Rotation, Mittelpunkt-Skalierung,
  Griffposition und explizite Änderungsfelder; Löschkandidat ohne Mutationen.
- `frontend/src/geometryForm.ts`: verlustfreie Zahlenfeldübernahme, Eingabeprüfung,
  differenzielle numerische Änderungen und Entf-Regel.
- `frontend/src/RotationHandle.tsx`: konstante Bildschirmgröße des Griffes.
- `frontend/src/geometryDisplay.ts`, `PrecisionNumberInput.tsx`: reine Anzeige-
  formatierung, getrennt von vollständigen Rohwerten und aktiven Eingaben.
- `frontend/src/RotationReadout.tsx`: aufrechte, begrenzte Winkelanzeige;
  `Plot.tsx` verarbeitet Shift-Wechsel auch ohne Pointerbewegung.
- `frontend/src/BedGeometryForm.tsx`: fünf numerische Felder und Speicher-/Löschaktionen.
- `frontend/src/DeleteBedDialog.tsx`: nativer modaler Dialog mit Fokus auf Abbrechen.
- `frontend/src/useBedEditor.ts`, `editingClient.ts`: erweiterte Entwurfsarten,
  Bestätigungszustände, DELETE und Kontrolle des bestätigten Beetbestands.
- `frontend/src/Plot.tsx`, `ProjectDetails.tsx`, `App.tsx`, `EditorControls.tsx`,
  `projectClient.ts`, `style.css`: Gesten, Form, Tastatur, Fehlermeldungen und Gestaltung.
- `projects/geometry_updates.py`, `projects/repository.py`, `api/routes.py`,
  `api/server.py` unter `src/market_garden_planner/`: gezielte Einzel-Löschung,
  Sperren, atomarer Beleg und Aufnahme des DELETE-JSON-Bodys.
- `tests/test_projects.py`, `frontend/tests/precision.test.mjs`,
  `frontend/test.ps1`: neue API-/Persistenz-/Frontend-Prüfungen.
- `frontend/tests/polish.test.mjs`: neun zusätzliche Prüfungen für kompakte
  Zahlen, Präzisionserhalt und optionales 15°-Snapping.
- `docs/DECISIONS.md`: DEC-027 mit ausdrücklicher Fortschreibung zu DEC-010;
  DEC-028 für Anzeigepräzision und ausschließlich optionales Winkelraster.

Scheduler, Agronomieberechnungen, produktive Daten, räumliche Modelle und
Shapely-Regeln sind unverändert. Bestehende Demo wird nicht räumlich migriert.

## Testresultate

| Prüfung | Ergebnis |
|---|---|
| Python 3.11, gesamte Suite | **95/95 bestanden** (8 neue API-Fälle) |
| Frontend, gesamte Suite einschließlich UI-Feinschliff | **57/57 bestanden** (zuvor 48; neun zusätzliche Fälle) |
| TypeScript `tsc --noEmit` | bestanden |
| Produktionsbuild | bestanden |

Die Python-Tests prüfen exakte Dezimalwinkel, Länge/Breite und Mittelpunkt
mit unveränderten übrigen Eigenschaften und Nachbarn; Persistenz nach erneutem
Öffnen des Repositorys; ungültige Maße/Winkel, Rotation über die Grundstücks-
grenze, Kollision und Loch; Sperren für sämtliche Änderungen und Löschen;
Löschpersistenz, Revision/Token, leeres Projekt, 409/428/404, strenge Anfragefelder,
idempotente Löschung, dauerhafte ID-Sperre und getrennte Projekte. Ein künstlich
fehlschlagender Löschbeleg weist Rollback nach bereits ausgeführtem UPDATE nach.

Frontend-Tests prüfen Drehzentrum und freie Dezimalwinkel, Übergang über 0°,
Zoom-/Pan-/Viewport-unabhängige Winkel und konstante Griffgröße, Mittelpunkt-
Skalierung mit explizitem Anker, unveränderte Nachbarn, vollständige numerische
Präzision, fehlerhafte Eingaben, reine PATCH-Felder, Löschablauf und unvollständige
Bestätigung, API-Ausfall/409, Entf-Filter, Griff-Sichtbarkeit, gesperrte Form,
Bestätigungsdialog und unveränderte Demo. Der Abbruch/Bestätigungsablauf wurde
zusätzlich tatsächlich im Browser bedient; die Darstellungstests allein
simulieren keine komplette Browser-Ereignisschleife.

```powershell
.\.venv\Scripts\python.exe -B -m unittest discover -s tests -v
powershell -NoProfile -ExecutionPolicy Bypass -File frontend\test.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File frontend\build.ps1
```

Frontend-Skripte akzeptieren wie bisher `-NodeExecutable <absoluter Node-Pfad>`.
Der Build enthält die TypeScript-Prüfung. Keine neuen externen Pakete.

### Browserprüfung

Ursprüngliche Funktionsabnahme: separate synthetische Prüfdatenbank,
1280 × 720 und 390 × 844 Pixel:

- Winkel 23,12567°, Breite 0,753421 m, Länge 7,123456 m sowie Mittelpunkt
  (6,123456; 10,234567) numerisch gespeichert. Jeweils unveränderte andere
  Eigenschaften und unveränderter gesperrter Nachbar über API verifiziert.
- Griffrotation bei 100 % auf 34,935036193…°, bei 125 % auf 25,551181686…°.
  Mittelpunkt und Maße bleiben exakt gleich. Neuladen erhält alle Werte.
- Numerische Position im Polygonloch und auf dem Nachbarn: nicht gespeichert.
- Gesperrtes Beet: Felder und Löschknopf deaktiviert; kein Griff und kein
  Löschdialog bei Entf.
- Entf im Zahlenfeld: kein Löschdialog. Panel-Schaltfläche und Entf außerhalb
  eines Eingabefelds öffnen den Dialog. Vor Bestätigung drei Beete in der API.
- Abbrechen und Esc erhalten Auswahl und Beet. Bestätigtes Löschen reduziert
  den Bestand von drei auf zwei Beete, schließt Auswahl/Panel und bleibt nach
  Neuladen erhalten. Nachbar unverändert.
- Bisheriges Zeichnen und Drag-and-drop: neues Rechteck frei bei 326,309932474…°
  angelegt und danach von (6; 18,5) nach (7; 18,5) verschoben.
- Externe Projektrevision vorbereitet: numerisches Speichern führt zu 409,
  bestätigt keine Änderung und erhält den alten gespeicherten Winkel.
- Testserver beendet: numerisches Speichern sowie bestätigter Löschversuch
  melden Verbindungsfehler; das Beet bleibt im Browser erhalten, der fehlgeschlagene
  Löschdialog zeigt die Fehlermeldung und bleibt abbrechbar.
- Demo ohne Editorwerkzeuge; 20.06.2026 weiter freie Tagesbeete und 600 Stück
  Kopfsalat aus den Scheduler-Ereignissen von KW 25.
- Kleines Fenster: numerische Felder im scrollbar bleibenden Panel erreichbar;
  Karte bleibt bildschirmfüllend. Keine JavaScript-Fehler vor dem absichtlich
  ausgelösten API-Ausfall. Screenshots von Form, Dialog und Mobilansicht bereitgestellt.

### Ergänzende Prüfung des UI-Feinschliffs

- Ausschließlich Frontend und Dokumentation geändert; Python, Geometriemodelle,
  Scheduler, API und produktive SQLite-Daten unverändert.
  SHA-256-Vergleich der 59 erfassten Dateien unter `src`, `tests` und `data`:
  keine Änderung gegenüber Beginn dieses UI-Auftrags. Beide vollständigen
  Testsuiten sowie TypeScript und Build erneut erfolgreich ausgeführt.
- Neun neue Frontend-Fälle prüfen Zwei-Stellen-Formatierung, negative Null,
  unveränderte Rohwerte beim Anzeigen, vollständige Eingabetexte, kompakte
  Formularausgabe ohne Änderungsaufruf und präzises PATCH eines einzelnen Felds.
  Weitere Fälle prüfen 15°/45°/90° einschließlich 360°-Übergang, freie Rotation,
  Shift-Wechsel bei identischer Zeigerposition, Zoomunabhängigkeit sowie die
  aufrechte und am Rand begrenzte Winkelanzeige.
- Browser bei 1280 × 720 mit separatem synthetischem Projekt: alle fünf Felder
  kompakt; Auswahl und Fokuswechsel lassen Projekt, Geometrie und Revision exakt
  unverändert. Eingabe `0.812345678901` wird nach Fokuswechsel als `0,81`
  angezeigt und trotzdem exakt mit allen Stellen gespeichert. Länge, Winkel und
  Mittelpunkt behalten dabei ihre vollständigen ursprünglichen Werte.
- Freie Griffrotation und anschließende bestätigte Speicherung funktionieren
  weiterhin. Keine Fehler oder Warnungen in der Browserkonsole.
- **Offene manuelle Abnahme:** Die Browsersteuerung kann Shift nicht zuverlässig
  gleichzeitig mit einem Drag halten. Snapping und Rückkehr zur freien Rotation
  sind automatisiert geprüft; den physischen Shift-Drag und die kurz eingeblendete
  Winkelanzeige bei der gemeinsamen Browserprüfung kontrollieren.

## Bekannte Einschränkungen

- Noch kein Undo/Redo, Wiederherstellen, Entsperren, Skalieren am Griff oder
  Skalieren mit fester Bezugskante. Numerische Änderungen speichert man ausdrücklich.
- Ein Grundstück mit Polygonlöchern pro Projekt wie bisher. Hindernisse, die
  als Polygonlöcher modelliert sind, werden berücksichtigt; eigenständige
  zusätzliche Hindernisobjekte gehören noch nicht zum Geometrie-v1-Vertrag.
- ID-Sperren werden derzeit beim Anlegen durch die vorhandenen projektbezogenen
  Belege geprüft. Ein eigener Index oder eine separate Historienverwaltung ist
  bei größeren Projekten ein späterer, zu messender Bedarf.
- Kleine Panels erfordern Scrollen. Nur während tatsächlicher Texteingabe können
  lange Dezimalwerte horizontales Scrollen im Feld erfordern; ruhende Anzeigen
  bleiben kompakt und gespeicherte Werte werden nicht gekürzt.
  Eine automatische Beschriftungsplatzierung ist weiterhin nicht vorhanden.
- Keine gesonderte Abnahme mit physischen Touch-/Stiftgeräten.
- Gespeicherte Projekte haben weiterhin keine automatisch zugeordneten
  Scheduler-Ergebnisse. Keine neue agronomische Annahme oder Neuberechnung.

Kein Git-Commit erstellt.
