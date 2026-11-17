# Phase 3C.1 — Kulturplanung und Beetzuweisung

Implementiert und im Browser geprüft am 16.11.2026; abschließende vollständige
Test-/TypeScript-/Buildprüfung am 17.11.2026. Grundlage: AGENTS, DECISIONS,
PRODUCT, ARCHITECTURE, ROADMAP, Phase 3B.3c und der tatsächlich vorhandene
Python-Katalog/Scheduler. Entscheidung: **DEC-029**. Kein Git-Commit.

**Fortschreibung 17.11.2026:** Kompakte Kulturplanung und rein informative
Datumsüberschneidungen gemäß **DEC-030** ergänzt. Die ursprüngliche Persistenz
und der Scheduler bleiben unverändert. Details und aktuelle Abnahme stehen
im Abschnitt „UX und Datumsüberschneidungen“ am Ende dieses Dokuments.

## Funktionsumfang und Bedienung

1. Lokalen Projekt-API-Server neu starten (siehe unten), Browser neu laden.
2. Unter **Ansicht / Projekt** ein gespeichertes Projekt öffnen, Beet anklicken.
3. Im rechten Panel unter **Kulturplanung → Kultur hinzufügen** ein vorhandenes
   Python-Katalogprofil wählen. Bei mehreren Profilen derselben Kultur dient
   die Profilkennung zur Unterscheidung. Vorhandene Sorte wird mit angezeigt.
4. Anbauart beachten: **Direktsaat** bedeutet Aussaat ins Beet; **Pflanzung**
   bedeutet Pflanzen ins Beet, nicht Aussaat in einer Anzucht. Das Katalogprofil
   legt die unterstützte Anbauart fest; die API weist widersprüchliche Angaben ab.
5. Startdatum und optional geplante Ernte eingeben, **Anbauvorgang speichern**.
   Keine Termine werden vorbelegt oder aus Demo-Daten übernommen.
6. Weitere Vorgänge für dasselbe Beet hinzufügen. Die Liste sortiert nach
   Startdatum. **Bearbeiten** erhält die Vorgangs-ID, **Entfernen** fragt im
   Panel nochmals nach; **Abbrechen** führt keinen Schreibvorgang aus.

Die Geometrieform bleibt unter **Geometrie bearbeiten** einklappbar verfügbar;
Rotation am Griff, Zeichnen, Verschieben, Hover, Zoom/Pan und numerische
Präzision bleiben erhalten. Während eines Schreibvorgangs sind konkurrierende
UI-Schreibaktionen und Projektwechsel gesperrt. Ein nicht gespeicherter
Geometrieentwurf muss vor Kulturänderungen gespeichert oder verworfen werden.
Nicht gespeicherte Kulturformulare werden beim Schließen/Beetwechsel verworfen.

Eine Geometriesperre verhindert keine Kulturplanung. Ein Beet mit Anbauvorgängen
kann jedoch **nicht gelöscht** werden: 409 `bed_has_cultivations`; zuerst die
Vorgänge ausdrücklich entfernen. Keine automatische Kaskade oder verwaiste
Zuordnung. Die Demo bleibt getrennt, synthetisch und schreibgeschützt.

## Lokaler Start und Migration

Alle bisher laufenden Projekt-API-Prozesse vor dem Wechsel beenden (Strg+C).
Eine Sicherung der bisherigen `.local/projects.sqlite3` vor dem ersten Start
mit der neuen Schema-Version aufbewahren. Keine alte Serverinstanz parallel
auf dieselbe Datenbank zugreifen lassen.

```powershell
cd ~\Documents\MarketGardenPlanner
.\.venv\Scripts\python.exe -B -m market_garden_planner.api.server
```

**http://127.0.0.1:8766** öffnen/neu laden. Der aktuelle Produktionsbuild liegt
bereits unter `frontend/dist`. Der reine Demo-Server auf 8765 bietet keine
Projekt-Schreib-API. Alternative Datenbank wie bisher:

```powershell
.\.venv\Scripts\python.exe -B -m market_garden_planner.api.server --database "C:\Pfad\projects.sqlite3" --port 8766
```

Der erste Start migriert ausschließlich das bekannte MGP1-Schema 1 explizit
und transaktional nach **SQLite-Schema 2**. Fehler rollen DDL, Initialisierung
und Versionswechsel gemeinsam zurück; fremde/unbekannte Schemas werden
abgelehnt. Es gibt keine Rückmigration für alte Programmversionen.

Die produktive `.local`-Datenbank wurde bei dieser Umsetzung **nicht geöffnet,
migriert oder mit Test-Kulturvorgängen ergänzt**. Die Browserprüfung verwendete
eine separate synthetische Datenbank auf Port 8877; dieser Testserver ist beendet.

## Datenmodell und SQLite

Vorhandene Tabellen `projects` und `commands` behalten ihre Spalten.
`geometry_json`, räumliches Schema 1, Objekt-IDs, Maßwerte und Geometrie-Token
bleiben unverändert. Ergänzt wird:

```sql
CREATE TABLE cultivation_plans (
  project_id TEXT PRIMARY KEY NOT NULL REFERENCES projects(project_id),
  plan_json TEXT NOT NULL
);
-- PRAGMA application_id bleibt MGP1; PRAGMA user_version = 2
```

Ein validierter `CultivationPlan` pro Projekt ist die einzige fachliche
Repräsentation dieser Eingaben. Beispiel des versionierten JSON-Vertrags:

```json
{
  "schema_version": 1,
  "revision_id": "<Kulturplan-UUID>",
  "entries": [{
    "cultivation_id": "<stabile Vorgangs-UUID>",
    "revision_id": "<Vorgangsrevision-UUID>",
    "bed_id": "<bestehende räumliche Beet-UUID>",
    "profile_id": "radishes-spring",
    "establishment": "direct",
    "start_date": "2027-03-15",
    "planned_harvest_date": "2027-04-30",
    "input_status": "user_input"
  }]
}
```

IDs und Revisionen werden serverseitig erzeugt. Die initiale leere Planrevision
ist deterministisch je Projekt, damit Migration und historische Schema-1-
Änderungsbelege denselben leeren damaligen Plan dekodieren. Historische Belege
bleiben historische Antworten; sie werden nicht mit heutigen Eingaben vermischt.
Bestehende Zeilen, Projekt-/Geometrierevisionen und Belege bleiben bei Migration
bitgleich. Neue Projekte erhalten atomar Geometrie und leeren Kulturplan.

`CultivationIntent` referenziert die existierenden `CropProfile`-IDs aus
`database.load_database(data/cultures.json)`. Der Katalog enthält derzeit
15 Profile für zehn Kulturen. Es werden weder Parameter kopiert noch Erträge,
Pflanzenzahlen, saisonale Zeitspannen oder Kulturen im Frontend erfunden.

## API und Revisionen

Der bestehende lokale Standardbibliothek-HTTP-Handler bleibt erhalten;
kein neues Framework und keine neuen externen Abhängigkeiten.

| Endpunkt | Verhalten |
|---|---|
| GET `/api/v1/cultures` | Namen, Sortenreferenzen, Profil-IDs und Anbauarten aus dem Python-Katalog; keine Demo-/Ertragswerte |
| GET `/api/v1/projects/{id}` | wie bisher, zusätzlich `cultivation_plan` |
| GET `/api/v1/projects/{id}/beds/{bed_id}/cultivations` | Vorgänge dieses Beets und aktuelle Projektrevision |
| POST `.../beds/{bed_id}/cultivations` | neuen Vorgang anlegen |
| PUT `.../beds/{bed_id}/cultivations/{cultivation_id}` | vollständige Eingabefelder eines Vorgangs ersetzen; ID/Beetbezug erhalten |
| DELETE `.../beds/{bed_id}/cultivations/{cultivation_id}` | genau diesen Vorgang entfernen |
| POST `/api/v1/cultivations/analyze` | bekannte Planungstage eines Eingabeschnappschusses rein lesend vergleichen; keine Speicherung |

POST/PUT-Anfrage:

```json
{
  "expected_revision": "<aktuelle Projektrevision>",
  "command_id": "<optionale neue Befehls-UUID>",
  "cultivation": {
    "profile_id": "radishes-spring",
    "establishment": "direct",
    "start_date": "2027-03-15",
    "planned_harvest_date": "2027-04-30"
  }
}
```

DELETE sendet nur `expected_revision` und optional `command_id`. POST antwortet
201, PUT/DELETE 200, jeweils mit dem vollständigen bestätigten Projekt im
API-v1-Umschlag. Unbekannte Felder, selbst gelieferte IDs oder Statuswerte werden
abgelehnt. `planned_harvest_date` darf beim Erstellen/Ersetzen fehlen oder null
sein; im gespeicherten Vertrag ist es ausdrücklich null, niemals ein Ersatzdatum.

Alle Änderungen verwenden dieselbe `BEGIN IMMEDIATE`-Transaktion und erwartete
**Projektrevision** wie Geometrieänderungen. Veraltete Revision → 409, fehlende
Revision → 428, ungültige Eingaben → 422, fehlende Projekt-/Beet-/Vorgangsreferenz
→ 404. Vorgänge eines anderen Projekts/Beets können nicht darüber bearbeitet
werden. Gleiches `command_id` mit gleicher Anfrage liefert die damalige Antwort;
andere Anfrage mit derselben ID → 409.

Kulturänderung erhöht Projekt-, Plan- und betroffene Vorgangsrevision, erhält
die übrigen Vorgänge sowie Geometrie und Token. Unverändertes Speichern erzeugt
keine neue Revision. Reine Kulturänderungen schreiben nicht einmal die
Geometriespalten. Geometrieänderungen erhalten den Kulturplan. Neue Ableitungen
können später **Geometrie-Token + Kulturplanrevision + Katalog-/Kernstand** binden.
Es wird in dieser Phase kein Scheduler-Lauf angelegt oder neu berechnet.

Nach fehlender Schreibantwort ist das Ergebnis unbekannt, nicht garantiert
zurückgerollt. Das Frontend zeigt **Speicherung nicht bestätigt** und verlangt
Neuladen über ↻. Es übernimmt ausschließlich eine erfolgreiche, dekodierte
Antwort mit unveränderter Geometrie und bestätigter gezielter Kulturänderung.

## Validierung und fachliche Grenzen

- ISO-Kalenderdaten strikt `YYYY-MM-DD`, einschließlich Schaltjahren; keine
  Zeitstempel oder stillen Datumskorrekturen. Geplante Ernte nicht vor Start.
- Profil muss im realen Katalog vorkommen und zur Anbauart passen.
- Nutzereingaben sind **keine fachlich begründeten Schätzungen oder Ist-Daten**.
  Die UI kennzeichnet sie ausdrücklich. Synthetische Testprojekte bleiben als
  solche gekennzeichnet; ihre Beispieldaten landen nicht in realen Projekten.
- Ein optionales Erntedatum ist kein Räumdatum oder Ende eines Ernteintervalls.
  Ohne fachlich belegte Saisonprofile/Räumung werden keine Belegungsintervalle
  erfunden. Mehrere aufeinanderfolgende Vorgänge sind speicherbar; fachliche
  Kalenderprüfung und Überschneidungsfreiheit wurden im ursprünglichen Stand
  nicht behauptet. Die Fortschreibung DEC-030 ergänzt einen informativen
  Datumsvergleich, weiterhin ohne Aussage über Räumung/Beetverfügbarkeit.
- Keine Anzuchttermine, Räumtermine, Saisonvisualisierung, Kapazitätsberechnung,
  Ernteprognose, Kalenderempfehlung oder Standortvalidierung ergänzt.
- Katalogreferenzen sind keine eingefrorenen Prognoseparameter. Ein späterer
  `PlanRun` muss den konkreten Katalog-/Saisonprofilstand als Snapshot erfassen.
  Entfernte Katalogprofile bleiben in vorhandenen Vorgängen über ihre ID lesbar;
  eine Änderung verlangt ein aktuell bekanntes Profil.
- Eigene Sorten, Schätzungen, Ist-/historische Ernten, Undo/Redo und Bake bleiben
  eigenständige spätere Arbeitspakete; keine leeren Scheindatensätze dafür.

## Module

- Neu: `projects/cultivation.py` (unveränderliche Eingabemodelle/Validierung),
  `projects/catalogue.py` (bestehenden Katalog lesen), `projects/schema.py`
  (Schema und Migration), jeweils unter `src/market_garden_planner/`.
- Erweitert: `projects/repository.py`, `api/routes.py`; HTTP-Transport unverändert.
- Neu: `frontend/src/cultivationModel.ts`, `cultivationClient.ts`,
  `CultivationPanel.tsx`; erweitert: `App.tsx`, `ProjectDetails.tsx`,
  `projectView.ts`, `projectClient.ts`, `style.css`, `frontend/test.ps1`.
- Neu: `tests/test_cultivation.py`, `frontend/tests/cultivation.test.mjs`.
- Dokumentation: diese Phase, DEC-029 sowie kurze Statusfortschreibungen in
  Produkt, Architektur und Roadmap. Python-Agronomie, Scheduler, Kulturdaten,
  Demo, Geometriekern und vorhandene Tests unverändert.

## Testresultate

| Prüfung | Ergebnis |
|---|---|
| Python 3.11, gesamte Suite | **115/115 bestanden** (zuvor 106; neun zusätzliche Prüfungen) |
| Frontend, gesamte Suite | **73/73 bestanden** (zuvor 66; sieben zusätzliche Prüfungen) |
| TypeScript `tsc --noEmit` | bestanden |
| Produktionsbuild | bestanden |

Python prüft tatsächliches SQLite/HTTP: Zuordnung, Kulturfolge, Bearbeiten,
Entfernen, Wiederöffnen/IDs, Schaltjahr und ungültige Termine, Profil/Anbauart,
strenge Felder, projekt-/beetfremde Referenzen, Geometriesperren, Löschschutz,
gelöschte Beete, wechselseitige Revisionskonflikte, idempotente Befehle, No-op,
Rollback nach Plan-/Projektupdate, ungeschriebene Geometriespalten, korrupten
Kulturplan, Migration/alte Belege und Rollback einer scheiternden Migration.

Frontend prüft Vertragsdekodierung/IDs, Datum, echten Katalogvertrag, gezielte
POST/PUT/DELETE mit Revision, unveränderte Nachbarn und Geometrie, fehlende oder
unvollständige Bestätigung, 409/404/422, API-Ausfall, chronologische Liste,
Herkunftshinweis und fehlende Plan-API. Bestehende Demo-/Editorprüfungen bleiben.

```powershell
.\.venv\Scripts\python.exe -B -m unittest discover -s tests -q
powershell -NoProfile -ExecutionPolicy Bypass -File frontend\test.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File frontend\build.ps1
```

Frontend-Skripte akzeptieren weiterhin `-NodeExecutable <absoluter Node-Pfad>`.
Der Build beinhaltet die TypeScript-Prüfung. Die Frontend-Testfixtures verwenden
durchgehend das vorhandene Projektvenv (geprüft: Python 3.11.9), damit kein
zusätzlicher Windows-Launcher `py.exe` benötigt wird. Für die HTTP-Integrationstests
müssen lokale Loopback-Verbindungen in der Ausführungsumgebung erlaubt sein.

### Browserabnahme (1280 × 720, separate synthetische Datenbank)

- Katalogauswahl, Direktsaat Radieschen am 15.03.2027/Ernte geplant 30.04.2027,
  danach Kopfsalat-Pflanzung am 10.05.2027 ohne Erntedatum tatsächlich gespeichert.
- Radieschen auf 16.03.2027 geändert; Kopfsalat-Entfernung abgebrochen und danach
  ausdrücklich bestätigt. Verbleibender Vorgang bleibt bestehen.
- Beet-Löschdialog bestätigt: Server weist Löschung wegen Kulturvorgang zurück;
  Beet und Vorgang bleiben erhalten.
- Zweite Änderung von außen erzeugt neuere Projektrevision. Veralteter
  UI-Speicherversuch mit 17.03.2027 erhält 409; gespeicherter 16.03. bleibt.
- Nach vollständigem Neuladen beide Vorgänge wieder sichtbar. API-Vergleich
  bestätigt unveränderte Geometrie, IDs, Objektrevisionen und Token gegenüber
  dem anfangs leeren Projekt.
- Vor absichtlichem Serverausfall keine Konsolenfehler/Warnungen. Testserver
  beendet, erneuter UI-Schreibversuch meldet Verbindungsfehler und bleibt
  unbestätigt; die bisher gespeicherte Liste bleibt erhalten.
- Demo am 20.06.2026 weiterhin sechs freie Beete, keine Kultur-Schreiboberfläche
  und Ernteprognose KW 25 mit 600 Stück Kopfsalat aus dem bestehenden Scheduler.
- Screenshot der gespeicherten Kulturfolge erstellt. Scrollbares Detailpanel
  überlagert die Karte, ohne deren Größe oder Kamera zu verändern.

## Nächster Anschluss

Erst fachlichen Saisonprofil-/Räumvertrag und bewusste Intent-/Run-Zuordnung
festlegen. Anschließend einen expliziten Python-Scheduler-Adapter für manuelle
Zuordnungen und revisionsgebundene Ergebnisse ergänzen. Kein direkter Ersatz
von `plan_season` durch eine neue Frontend-Belegungslogik.

## UX und Datumsüberschneidungen — Fortschreibung 17.11.2026

### Kompaktes Detailpanel

- Kultur, Anbauart, Start und geplante Ernte in kompakten Zeilen; Bearbeiten und
  Entfernen als beschriftete kleine Aktionen in derselben Kopfzeile.
- Profil-ID bleibt als Titel am Kulturnamen verfügbar, beansprucht keine eigene
  Zeile. Vorhandene Sortennamen bleiben sichtbar. Fehlende Ernte heißt „offen“.
- Geometrie mit Abmessungen/Winkel in der eingeklappten Zusammenfassung;
  numerischer Editor und gespeicherte Eigenschaften vollständig darin erhalten.
  Identität/Herkunft und allgemeine Hinweise sind ebenfalls einklappbar.
- Erfolgsbestätigungen werden weiter barrierearm angekündigt, beanspruchen
  nach Abschluss keine dauerhafte sichtbare Zeile. Speicher-/Prüffehler bleiben
  sichtbar. Keine Verringerung der geometrischen Genauigkeit.
- Die Karte und Demoansicht behalten ihre bisherige Fläche und Interaktion.
  Viele Vorgänge und aufgeklappte Formulare/Erklärungen scrollen im Detailpanel.

### Bedeutung der Datumsprüfung

Verglichen werden ausschließlich Vorgänge desselben Beets und deren eingegebene
Planungstage. Aussaat/Pflanzung und geplante Ernte zählen **einschließlich**
dieser Kalendertage. Beispiel: Ernte A am 30.04. und Start B am 30.04. erzeugen
einen Hinweis für den gemeinsamen Tag; Start B am 01.05. erzeugt aus diesen
bekannten Daten keinen Hinweis. Das ist keine Bestätigung, dass A am 01.05.
bereits geräumt ist. Ein Erntedatum bleibt ausdrücklich **kein Räumdatum**.

Die Python-Funktion `DateWindow.overlaps` des vorhandenen Saisonmodells wird
wiederverwendet: inklusive Planungstage werden ausschließlich für den Vergleich
in halboffene Intervalle übersetzt. Der maximale Python-Kalendertag wird ohne
Überlauf mit derselben Vergleichsregel behandelt. Keine Scheduler-Berechnung
oder Ertrags-/Wachstumsannahme wird ergänzt.

| Datensituation | Hinweis |
|---|---|
| Zwei bekannte Abschnitte schneiden sich | Überschneidung mit gemeinsamen Tagen |
| Vorgang startet innerhalb eines bekannten Abschnitts, eigene Ernte fehlt | Gemeinsamer Starttag bekannt; weitere Dauer offen |
| Früherer Vorgang ohne Ernte, späterer Start | Überschneidung unklar; kein unbegrenzt belegtes Beet erfinden |
| Beide ohne Ernte, gleicher Start | Gemeinsamer Starttag bekannt; weitere Dauer offen |
| Beide ohne Ernte, verschiedene Starts | Unklar, keine sichere Überschneidung behaupten |
| Bekannte Ernte vor späterem Start, dessen Ernte fehlt | Kein gemeinsamer bekannter Tag; späteres Ende bleibt offen |
| Anderes Beet | Kein Paarvergleich |

Betroffene Zeilen erhalten einen zurückhaltenden Hinweis. Anklicken öffnet die
Erklärung mit beiden Kulturen, Aussaat-/Pflanzterminen und gegebenenfalls den
gemeinsamen Tagen. Vollständige und unklare Beziehungen können gleichzeitig
vorkommen. Hinweise verhindern das Speichern **nicht**: Mischkulturen bleiben
möglich. Keine automatische Terminänderung, Verschiebung oder Eingabekorrektur.

Auch gültige Formularentwürfe werden geprüft und als „Entwurf“ gekennzeichnet.
Die gespeicherten Zeilen behalten dabei ihre bestätigten Termine. Ungültige
Formulare sind kein gültiger neuer Vergleichsstand. Verspätete Antworten werden
abgebrochen/verworfen; ein alter Hinweis wird nicht einem neueren Entwurf
zugeordnet. Ist die API nicht erreichbar, heißt dies „Datumsprüfung nicht
verfügbar“, nicht „keine Überschneidung“. Die Prüfung ist keine Speicherbedingung.

### Rein lesende API

`POST /api/v1/cultivations/analyze` erwartet ein Objekt mit `entries` als Liste
vollständiger `CultivationIntent`-Objekte aus dem obigen Vertrag. Beispiel
einer synthetischen Prüfeingabe:

```json
{
  "entries": [{
    "cultivation_id": "12345678-1234-4234-8234-000000000001",
    "revision_id": "12345678-1234-4234-8234-000000000002",
    "bed_id": "12345678-1234-4234-8234-000000000003",
    "profile_id": "radishes-spring",
    "establishment": "direct",
    "start_date": "2027-03-01",
    "planned_harvest_date": "2027-04-30",
    "input_status": "user_input"
  }]
}
```

Die API validiert dieselben IDs, Datumswerte und Eingabestatus wie bisher.
Das folgende Antwortbeispiel zeigt eine Beziehung für zwei übergebene Vorgänge
im API-v1-Umschlag:

```json
{
  "api_version": 1,
  "analysis": {
    "schema_version": 1,
    "relations": [{
      "kind": "overlap",
      "cultivation_ids": ["<ID A>", "<ID B>"],
      "start_date": "2027-04-10",
      "end_date": "2027-04-30",
      "complete": true
    }],
    "incomplete_ids": []
  }
}
```

`unknown`-Beziehungen haben nur `kind` und zwei IDs, keine erfundenen Daten.
`complete: false` bedeutet, dass nur ein gemeinsamer Tag aus unvollständigen
Angaben bekannt ist. `incomplete_ids` benennt alle fehlenden Erntetermine.
Die Antwort gilt nur für die übergebenen Eingaben, nicht als Aussage über eine
zwischenzeitlich geänderte Datenbankrevision. Die Oberfläche bindet sie an den
konkreten Eingabeschnappschuss. Keine Repository-Schreiboperation, neue Tabelle,
Migration oder Änderung des bestehenden Projekt-JSON. Maximale Eingabemenge
500 Vorgänge je Prüfabruf als technische Begrenzung, kein Speicherlimit.

### Zusätzliche Module und Prüfungen

- `projects/cultivation_checks.py`: reine Python-Datumsanalyse und strenge
  Eingabedekodierung; `api/routes.py`: zusätzlicher rein lesender POST.
- `frontend/src/cultivationChecks.ts`, `useCultivationChecks.ts`,
  `CultivationReview.tsx`: API-Vertrag, entwertbare Entwurfsprüfung und Erklärungen.
- `CultivationPanel.tsx`, `ProjectDetails.tsx`, `style.css`: kompakte Darstellung.
- Neue Fälle in `tests/test_cultivation_checks.py` und
  `frontend/tests/cultivation-checks.test.mjs`; Test-Build entsprechend erweitert.
- Python prüft überlappende/aufeinanderfolgende/unvollständige Abschnitte,
  gemeinsame Grenztage, verschiedene Beete, Schaltjahr/`date.max`,
  stabile IDs, fehlerhafte Eingaben und die rein lesende API. Überlappende
  Vorgänge lassen sich weiterhin speichern; SQLite-Stand bleibt beim Prüfen gleich.
- Frontend prüft API-Vertrag und Fehler/Abbruch, Referenzen, unbekannte Enden,
  präzise Erklärungen, Mischkulturhinweis, kompakte Zeilen und einklappbare Bereiche.

### Ergänzende Browserabnahme

Separate synthetische Datenbank auf Port 8878, keine Änderung an produktiven
Projekten. Fenster 1280 Pixel breit, Höhen **560, 720 und 900 Pixel**:

- Drei Vorgänge mit allen sechs Terminen bei 720/900 Pixeln ohne Scrollen
  sichtbar; Zusatzangaben ebenfalls eingeklappt erreichbar. Bei 560 Pixeln
  bleiben die drei Terminzeilen sichtbar, Zusatzangaben sind scrollbar.
- Zwölf Vorgänge auf einem geometrisch gesperrten Beet: Liste scrollbar,
  letzter Vorgang bearbeitbar; Datumseingaben bleiben vorhanden und bedienbar.
- Bekannte Überschneidung und unklare Beziehung gemeinsam markiert; Erklärung
  nennt Radieschen/Kopfsalat/Spinat mit den jeweiligen Terminen.
- Ergänzung eines fehlenden Erntetermins im Formular entfernt den unklaren
  Hinweis bereits im Entwurf. Vollständiger API-Vergleich vor dem Speichern:
  **alle gespeicherten Termine, IDs, Revisionen und Geometrie unverändert**.
- Entwurf mit weiterhin vorhandener Überschneidung ausdrücklich gespeichert;
  nach Neuladen Erntedatum 20.05.2027 und Hinweis wieder vorhanden.
- Geometrie aufgeklappt: numerische Bearbeitung bleibt verfügbar;
  SVG-ViewBox vor/nach Öffnen identisch. Keine Fehler/Warnungen in der Konsole.
- Demo am 20.06.2026 weiterhin sechs freie Beete und KW-25-Prognose mit
  600 Stück Kopfsalat. Kein Projekteditor in der Demo.
- Zwei Screenshots erstellt; temporäre Viewportvorgabe zurückgesetzt und
  Testserver nach Abschluss beendet.

Keine neue Saisonvisualisierung. Tatsächliche Räumung, Mischkulturverträglichkeit
und Belegungsoptimierung bleiben offen. Keine neuen Abhängigkeiten, kein Commit.
