# Phase 3B.2 — SQLite-Persistenz und lokale Projekt-API

Ausgangsstand: `bfca02b` (Phase 3B.1), geprüft am 16.11.2026.
Keine neue Oberfläche und keine Änderung an Scheduler, Geometriemodell,
Demo-Daten oder bestehenden Datenformaten.

## 1. Entscheidung: SQLite und vorhandener HTTP-Transport

SQLite aus der Python-Standardbibliothek speichert pro Projekt genau das
bereits in Phase 3B.1 definierte räumliche JSON. Es gibt keine parallelen
Koordinaten-/Polygon-/Beettabellen, die auseinanderlaufen könnten.
`spatial.dumps`, `loads`, `require_valid` und `geometry_token` bleiben maßgeblich.

Der bestehende `prototype.server.Handler` eignet sich als Basis: der neue
`api.server.Handler` erweitert ihn durch getrennte Projektrouten. Die originale
Demo-Datei und ihr Startweg bleiben unverändert. Repository, Änderungsregeln
und Routing sind transportunabhängig getrennt.

FastAPI/Pydantic bietet validierte Transportmodelle und OpenAPI, siehe
[offizielle Dokumentation](https://fastapi.tiangolo.com/features/). Für diese
kleine lokale API würde ein sofortiger Wechsel zusätzliches Framework-/Server-
Setup und zusätzliche Eingabemodelle erzeugen, ohne die zentrale räumliche
Validierung ersetzen zu können. Deshalb jetzt keine neuen Abhängigkeiten.
Bei deutlich größerem API-Umfang, Authentisierung oder generierten Clients
kann derselbe Repository-/Domänenkern später durch FastAPI angesprochen werden.
Der aktuelle Standardbibliothek-HTTP-Server bleibt ausdrücklich ein lokaler
Server und ist keine fertige öffentliche Webbereitstellung.

Grundlage der Transaktionsentscheidung: [Python sqlite3](https://docs.python.org/3.11/library/sqlite3.html)
und [SQLite BEGIN IMMEDIATE](https://www.sqlite.org/lang_transaction.html).

## 2. Dateien und Start

Neu:

- `projects/repository.py`: Projektumschlag, SQLite, Revisionsvergleich,
  Integritätskontrolle und idempotente Änderungsbelege.
- `projects/geometry_updates.py`: revisionssichere Anwendung zentraler
  Geometriemodelle, Sperrprüfung und lokale Beetänderungen.
- `projects/errors.py`: nachvollziehbare Fehlercodes/HTTP-Statusangaben.
- `api/routes.py`: kleine versionierte HTTP-Operationen.
- `api/server.py`: JSON-Transport, Loopback-Start und vorhandene Demo/static-Auslieferung.
- `tests/test_projects.py`: SQLite-, Konkurrenz-, Rollback- und HTTP-Tests.

Alle Python-Pfade beziehen sich auf `src/market_garden_planner/`.
`.gitignore` wurde um `.local/` ergänzt. Architektur/Roadmap/README verweisen
auf den tatsächlichen Umsetzungsstand. Keine Änderung an Paketabhängigkeiten.

Die lokale Python-3.11-Umgebung aus 3B.1 mit Geometry-Extra verwenden:

```powershell
cd ~\Documents\MarketGardenPlanner
# Falls die Umgebung noch nicht eingerichtet ist:
py -3.11 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -e ".[geometry]"

# Neue Projekt-API samt bisheriger Demo-Oberfläche:
.\.venv\Scripts\python.exe -B -m market_garden_planner.api.server
```

Standard: **http://127.0.0.1:8766**, Datenbank
`~\Documents\MarketGardenPlanner\.local\projects.sqlite3`.
Das Standardverzeichnis wird bei Bedarf angelegt. Alternative:

```powershell
.\.venv\Scripts\python.exe -B -m market_garden_planner.api.server --port 8876 --database "C:\vorhandener-ordner\garden.sqlite3"
```

Bei einem ausdrücklich gewählten Pfad muss der Elternordner existieren.
Die Datenbankdatei wird angelegt, falls sie fehlt. Strg+C beendet den Server.
Für eine einfache Dateisicherung zuerst den Server beenden, dann die Datenbank kopieren.

Der bisherige Start über `start-prototype.ps1` auf Port 8765 bleibt gültig und
enthält weiterhin nur die Demo. Die neue API liefert ebenfalls `/` und
`/api/demo`; gespeicherte Projekte werden noch **nicht** automatisch in der
Demo-Karte angezeigt. Diese Anbindung gehört zu 3B.3.

## 3. Datenbankschema

- `PRAGMA application_id = 0x4D475031` (`MGP1`).
- `PRAGMA user_version = 1` als Datenbankschemaversion.
- Der gespeicherte Geometrievertrag behält unabhängig davon
  `format="market-garden-spatial"`, `schema_version=1`.
- HTTP-Antworten enthalten unabhängig davon `api_version=1`.

```sql
CREATE TABLE projects (
    project_id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL CHECK(length(name) BETWEEN 1 AND 200),
    revision_id TEXT NOT NULL,
    geometry_json TEXT NOT NULL,
    geometry_token TEXT NOT NULL CHECK(length(geometry_token)=64),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE commands (
    project_id TEXT NOT NULL REFERENCES projects(project_id),
    command_id TEXT NOT NULL,
    request_hash TEXT NOT NULL,
    response_json TEXT NOT NULL,
    PRIMARY KEY(project_id, command_id)
);
```

`projects` ist der aktuelle Arbeitsstand. `commands` enthält unveränderliche
Antwortbelege für wiederholte Änderungen, keine anwählbaren Bake-Varianten.
Die darin enthaltene Geometrie verwendet ebenfalls ausschließlich das vorhandene
räumliche JSON-Format. Keine zweite editierbare Geometriedarstellung.

IDs und Revisionen sind kanonische UUID-Strings; Zeitstempel UTC-ISO-Daten mit
Zeit. Jedes Projekt besitzt eine eigene UUID und Projektrevision. Räumliche
Objekt-UUIDs werden projektbezogen gelesen; zwei Projekte können unabhängig
denselben importierten Geometrie-Schnappschuss enthalten.

Nur eine leere, unversionierte Datenbank wird initialisiert. Fremde
`application_id`, unbekannte Versionen oder falsche Tabellenspalten führen
zu einem Fehler, nicht zu automatischem Überschreiben oder Reparieren.
Laden und Auflisten validieren auch das gespeicherte JSON und vergleichen den
gespeicherten Geometrie-Token neu; beschädigte Daten werden zurückgewiesen.

## 4. API-Vertrag

JSON-Anfragen: `Content-Type: application/json`, UTF-8, maximal 2 MiB.
Unbekannte Felder, doppelte Schlüssel und nicht endliche Zahlen werden abgelehnt.
Pfade verwenden keine Queryparameter. Projekterstellung erzeugt die Projekt-ID
serverseitig; vorhandene räumliche IDs/Revisionen des gültigen Anfangsstands bleiben erhalten.

| Methode / Pfad | Anfrage | Ergebnis |
|---|---|---|
| `POST /api/v1/projects` | `name`, `geometry` | 201, `project` |
| `GET /api/v1/projects` | — | 200, `projects` (Metadaten/Token, ohne Geometrie) |
| `GET /api/v1/projects/{id}` | — | 200, vollständiges `project` |
| `PUT /api/v1/projects/{id}` | `expected_revision`, `name`, `geometry`, optional `command_id` | 200, gespeichertes `project` |
| `PATCH /api/v1/projects/{id}/beds/{bed_id}` | `expected_revision`, `changes`, optional `command_id` | 200, gespeichertes `project` |
| `GET /api/v1/projects/{id}/validation` | — | 200, `valid`, `issues`, Projektrevision und Token |
| `POST /api/v1/geometry/validate` | `geometry` | 200 bei gültiger Geometrie; 422 mit Fehlern; schreibt nichts |

`project` enthält `project_id`, `name`, `revision_id`, `geometry`,
`geometry_token`, `created_at` und `updated_at`.
Die **äußere** `project.revision_id` ist die erwartete Revision beim Speichern;
sie ist nicht mit `project.geometry.revision_id` zu verwechseln.

Erlaubte Beetänderungen: `center: {x,y}`, `width_m`, `length_m`, `rotation_deg`.
Bei einer reinen Breitenänderung zusätzlich `anchor` mit `center`,
`negative_edge` oder `positive_edge`; hierfür wird die vorhandene Funktion
`resize_bed_width` verwendet. Eine Ankerangabe mit gleichzeitiger Positions-/
Längen-/Rotationsänderung ist mehrdeutig und wird zurückgewiesen.

Vollständiges Speichern erhält die vorhandene Grundstücks-ID und exakt die
vorhandene Menge von Beet-IDs. Hinzufügen, Entfernen und Ersetzen von Objekten
sind hier noch nicht freigegeben. Reihenfolge kann ausdrücklich geändert werden
und führt dann zu einer neuen Geometrierevision, weil sie den Scheduler beeinflusst.

### Beispielanfragen mit dem bestehenden synthetischen Demo-Format

Folgendes Beispiel erstellt ein separates gespeichertes Projekt; die ursprüngliche
Demo wird dadurch nicht verändert. Der API-Server muss bereits auf Port 8766 laufen.

```powershell
cd ~\Documents\MarketGardenPlanner
$base = 'http://127.0.0.1:8766'
function Send-ProjectJson($method, $path, $value) {
    $json = $value | ConvertTo-Json -Depth 100
    Invoke-RestMethod -Method $method -Uri ($base + $path) `
        -ContentType 'application/json; charset=utf-8' `
        -Body ([System.Text.Encoding]::UTF8.GetBytes($json))
}

$geometryJson = & .\.venv\Scripts\python.exe -B -c "from market_garden_planner.prototype.demo import GEOMETRY; from market_garden_planner.spatial.migration import migrate_svg_demo; from market_garden_planner.spatial import dumps; print(dumps(migrate_svg_demo(GEOMETRY)))"
$geometry = $geometryJson | ConvertFrom-Json
$created = Send-ProjectJson 'POST' '/api/v1/projects' @{
    name = 'Synthetisches Testprojekt'; geometry = $geometry
}
$project = $created.project
$path = '/api/v1/projects/' + $project.project_id

# Liste und Laden:
Invoke-RestMethod ($base + '/api/v1/projects')
$project = (Invoke-RestMethod ($base + $path)).project

# Hier wird ein 1,20-m-Demobeet auf 0,75 m geändert.
# Der Test 0,65 -> 0,75 m wird separat in der Testsuite nachgewiesen.
$patch = @{
    expected_revision = $project.revision_id
    command_id = [guid]::NewGuid().ToString()
    changes = @{ width_m = 0.75; anchor = 'center' }
}
$bedPath = $path + '/beds/' + $project.geometry.beds[0].object_id
$project = (Send-ProjectJson 'PATCH' $bedPath $patch).project

# Vollständig speichern, hier nur einen neuen Projektnamen:
$project = (Send-ProjectJson 'PUT' $path @{
    expected_revision = $project.revision_id
    name = 'Synthetisches Projekt, umbenannt'
    geometry = $project.geometry
}).project

# Gespeicherten Stand prüfen; Kandidat prüfen ohne Schreibvorgang:
Invoke-RestMethod ($base + $path + '/validation')
Send-ProjectJson 'POST' '/api/v1/geometry/validate' @{geometry = $project.geometry}
```

Bei direktem Repository-Zugriff stehen `create`, `list`, `get`, `save` und
`update_bed` zur Verfügung. Sie verwenden dasselbe zentrale `GeometryState`.
JSON-Import/-Export ist über dessen vorhandene `loads`/`dumps` möglich; ein
zusätzliches Projektdateiformat oder eine separate JSON-Projektdatei wurde nicht eingeführt.

## 5. Revisionen, Sperren und Konkurrenz

Jede Änderung läuft auf einer eigenen SQLite-Verbindung. Schreibvorgänge beginnen
mit `BEGIN IMMEDIATE`; danach werden aktueller Stand und erwartete Projektrevision
verglichen. Das SQL-Update enthält zusätzlich `WHERE ... revision_id = ?`.
Projektänderung und optionaler Änderungsbeleg werden gemeinsam committet.
Validierungsfehler, Revisionskonflikt oder fehlgeschlagener SQL-Schritt führen
zum vollständigen Rollback. Verbindungen werden auch bei Fehlern geschlossen.

- Ein Gewinner bei zwei gleichzeitigen Änderungen auf derselben Revision;
  der zweite Vorgang erhält ausdrücklich 409, niemals stilles Überschreiben.
- Unterschiedliche Projekte beeinflussen sich fachlich nicht. SQLite serialisiert
  Schreibzugriffe auf die Datei; nach fünf Sekunden Sperrwartezeit folgt 503.
- Geänderte Objekte erhalten neue Revisions-UUIDs. Unveränderte Nachbarn behalten
  exakt ihre Revision und Daten. Der Gesamtzustand erhält bei Änderungen der
  räumlichen Daten/Reihenfolge eine neue Revision, das Projekt bei jeder wirksamen
  Änderung ebenfalls. Ein vollständiger No-op erzeugt keine Revision.
- Objekt-/Geometrierevisionen sind nach Erstellung serververwaltet. Bei vollständigem
  Speichern werden die gelieferten Revisionsfelder nicht als Änderungsbeweis
  vertraut: unveränderte Objekte behalten gespeicherte Revisionen, geänderte erhalten neue.
- Reine Projektumbenennung ändert Projektrevision und Zeit, nicht den Geometrie-Token.
- Eine Geometriesperre kann nicht im selben Speichervorgang aufgehoben und
  durch eine Geometrieänderung umgangen werden. Zuerst ausdrücklich entsperren
  und speichern, dann mit neuer Projektrevision bearbeiten. Dasselbe gilt für
  eine gesperrte Grundstücksgrenze. Generatorschutz allein verbietet keine manuelle Änderung.
- Geometrie-Token wird mit dem gespeicherten Stand zurückgegeben. Künftige
  Scheduler-Läufe können ihn zum Erkennen veralteter Eingaben festhalten.
  Es erfolgt keinerlei automatische Berechnung für gespeicherte Projekte.

### Wiederholbare Änderungen

`command_id` ist für PUT/PATCH optional. Wiederholung derselben Command-ID mit
exakt derselben Eingabe liefert die ursprüngliche Antwort zurück, auch wenn
die ursprüngliche erwartete Revision inzwischen alt ist. Andere Eingabe mit
derselben Command-ID führt zu 409 `command_conflict`. Ohne Command-ID greift
immer die normale Revisionsprüfung.

Ein Beleg kann eine ältere Antwort enthalten, wenn zwischenzeitlich weitere
Änderungen erfolgten. Der spätere Editor muss Antwortrevisionen beachten und
darf verspätete Antworten nicht über einen neueren Zustand legen. Projekterstellung
ist als normales POST nicht idempotent: erneutes POST erzeugt ein neues Projekt.

## 6. Fehler und Validierung

```json
{
  "api_version": 1,
  "error": {
    "code": "revision_conflict",
    "message": "Project has a newer revision; reload before saving",
    "expected_revision": "<alte UUID>",
    "current_revision": "<aktuelle UUID>"
  }
}
```

| Status | Bedeutung |
|---|---|
| 400 | Ungültiges UTF-8/JSON, doppelte Keys, verbotene nicht endliche Zahlen oder Anfrageform |
| 403 | Falscher Host oder fremde Browser-Origin |
| 404 | Projekt, Beet oder Endpunkt nicht vorhanden |
| 405 | Methode für diesen Endpunkt nicht unterstützt |
| 409 | Revisionskonflikt oder anders verwendete Command-ID |
| 413 | Ungültige/zu große Body-Länge, Maximum 2 MiB |
| 415 | Falscher Content-Type |
| 422 | Struktur-/Einheiten-/Geometriefehler, Sperre oder unzulässiger ID-Wechsel |
| 428 | `expected_revision` fehlt bei Speichern/Beetänderung |
| 500 | Datenbank-/Integritäts-/Schemafehler oder unerwarteter interner Fehler |
| 503 | Datenbank weiterhin durch einen anderen Schreibvorgang belegt |

Topologische Geometriefehler enthalten zusätzlich `valid:false` und
`error.issues` mit den bestehenden `GeometryIssue`-Feldern: Code, Objekt-IDs,
Meldung und gegebenenfalls WKT. Primitive/Transportfehler verwenden `invalid_data`
oder `invalid_fields`. Datenbankfehler geben keine internen SQL-Details aus.
Fehlerantworten sind unmittelbar abrufbare Anfrageergebnisse; es gibt kein
zusätzliches dauerhaftes Fehlerprotokoll. `GET .../validation` prüft den
gespeicherten Stand, `POST .../geometry/validate` einen Kandidaten.

Alle räumlichen Regeln aus 3B.1 gelten weiter: gültige Polygone/Löcher,
Grenzeinschluss, keine positive Beetüberlappung oberhalb der dokumentierten
numerischen Toleranz, keine stillen Reparaturen oder Rasterung. Die generische
Geometrieprüfung ist keine projektbezogene Sperr-/Konfliktvorschau; die tatsächliche
Speicheroperation prüft zusätzlich gespeicherte Sperren, Identität und Revision.

## 7. Prüfungen und Ergebnisse

Unter Python **3.11.9**, SQLite **3.45.1**, Shapely **2.1.2**:

- **81 Python-Tests erfolgreich**: 54 bestehende, 27 neue Repository-/API-Tests.
- **12 bestehende Frontend-Tests erfolgreich**, TypeScript-Prüfung erfolgreich.
- `pip check` ohne Konflikte; keine neuen Paketabhängigkeiten.
- HTTP-Tests auf echten Loopback-Sockets, keine ausschließlich gemockte API.
- Separate CLI-Smokeprüfung für neuen API-Server und originalen Demo-Server:
  `/` und `/api/demo` jeweils HTTP 200, Projekt-Erstellen/Laden erfolgreich.
- Der komplette Demo-JSON-Payload bleibt identisch.

Abgedeckt: Erstellen und erneutes Laden nach Repository-Neustart, vollständiges
räumliches JSON einschließlich Löchern/17°-Rotation/Sperren, 0,65 → 0,75 m,
unveränderte Nachbarn, UUIDs/Revisionen/Token, ungültige Geometrie, gesperrte
Beete und Grundstücke, ID-Schutz, zwei Projekte, zwei konkurrierende Verbindungen,
idempotente Wiederholung und Konfliktantworten, Schema-/Integritätsfehler.

Rollback wird auch **nach bereits ausgeführtem Projekt-UPDATE** durch einen
absichtlich scheiternden nachfolgenden Beleg-INSERT getestet. Danach sind alter
Projektstand und leere Belegtabelle erhalten. Ein HTTP-Test erzwingt außerdem
einen SQL-Fehler und prüft JSON-Fehlerantwort sowie unveränderten gespeicherten Stand.

```powershell
.\.venv\Scripts\python.exe -B -m unittest discover -s tests -v
powershell -NoProfile -ExecutionPolicy Bypass -File frontend\test.ps1
```

## 8. Grenzen und nächste Phase 3B.3

- Ein Grundstück pro Projekt entsprechend `GeometryState` aus 3B.1.
- Noch keine Befehle zum Hinzufügen/Löschen räumlicher Objekte; diese müssen
  mit eigenen Identitäts-/Sperrregeln für den Editor ergänzt werden.
- Keine Bake-Verwaltung, keine historische Objektverwaltung, kein Undo/Redo,
  keine Scheduler-Ergebnisse in der Datenbank.
- Keine Benutzerverwaltung, öffentliche Netzfreigabe oder CORS. Host-/Origin-
  Prüfung und JSON-Content-Type begrenzen fremde Browser-Schreibanfragen;
  lokale Prozesse können die API weiterhin benutzen. Keine öffentliche Web-API.
- Projektliste lädt/validiert derzeit alle Projekte, ohne Pagination; numerische
  Geometrievalidierung bleibt unverändert. Erst bei nachgewiesenem Bedarf optimieren.
- Command-Belege bleiben erhalten; eine bereinigbare Aufbewahrungsregel ist später
  festzulegen. Sie sind kein Varianten-/Bake-Produkt.
- Die UI bleibt die synthetische Demo. 3B.3 muss Projektwahl/Laden, korrekte
  Welt-/SVG-Transformation, Revisionen, Konfliktdialoge und Fehlerdarstellung anbinden.
- Für komfortable Editorvorschau fehlen noch projektbezogene Preview-Befehle,
  die Sperren und Revisionsbasis ohne Speicherung prüfen. Generische Topologie-
  Validierung ist bereits vorhanden. Der Server bleibt beim endgültigen Speichern maßgeblich.

Kein Git-Commit erstellt. Vorhandene Fremd-/Designreferenzen wurden nicht verändert.
