# Phase 3C.2 — Saisonvisualisierung gespeicherter Gartenprojekte

Ausgangsstand `a8192e8`; umgesetzt und geprüft am **17.11.2026**.
Grundlagen: AGENTS, DECISIONS, PRODUCT, ARCHITECTURE, ROADMAP und Phase 3C.1.
Neue Entscheidung: **DEC-031**. Kein Git-Commit.

## Implementierte Funktionen

- Bestehender Saisonregler auch für gespeicherte Projekte: ISO-Jahr,
  Kalenderwoche, Montag/Sonntag, Wochenvor-/zurück und Schieber über 52/53 Wochen.
- Rein lesende Python-Jahresprojektion der gespeicherten Anbauvorgänge.
  Innerhalb eines geladenen Jahres aktualisiert sich die Karte unmittelbar
  ohne erneuten API-Abruf oder Seitenneuladen.
- Aktive Kulturen direkt an den Beeten, aufrechte Beschriftung; ruhige
  Belegungsflächen, Schraffur für zeitliche Überlagerung, Punkte/offenes Ende
  für unklare Zeiträume. Geometrie und Kamera bleiben unabhängig vom Datum.
- Tooltip und ausgewähltes Beetdetail zeigen denselben Wochenstand. Alle
  betroffenen Vorgänge bleiben im Detail zugänglich; auf der Karte maximal
  zwei Namen mit Anzahl weiterer Vorgänge, im Tooltip maximal drei Namen.
- Kulturplanung und Geometrieeditor bleiben verfügbar. Nach bestätigter
  Änderung lädt die Wochenprojektion für die neue Revision; die gewählte Woche
  und Auswahl bleiben erhalten. Keine Termin-/Geometriekorrekturen.
- Demo bleibt eigene Tagesansicht mit bisherigen Scheduler-Ergebnissen und
  Ernteprognose. Projektmodus erhält keine neue Ernteprognose.

## Regeln der zeitlichen Planung

Die Darstellung ist eine **Wochenplanung**, keine Wachstumssimulation und kein
Nachweis tatsächlicher Belegung, Ernte oder Räumung.

Eine ISO-Woche reicht von **Montag einschließlich bis zum folgenden Montag
ausschließlich**. In der Oberfläche steht das inklusive Sonntagdatum.
Maßgeblich ist das ISO-Wochenjahr, nicht das Jahr einzelner Kalendertage.
Beispiel: KW 53/2020 = 28.12.2020–03.01.2021; KW 1/2021 beginnt am 04.01.
`isocalendar`, die vorhandene `harvest.monday`-Hilfe und `DateWindow` liefern
den Kalender in Python; die erste ISO-Woche wird über den 4. Januar bestimmt.

Ein einziger bekannter Planungstag innerhalb der Woche genügt, um den Vorgang
in dieser Woche sichtbar zu machen. Der bekannte Abschnitt reicht wie in
DEC-030 vom Aussaat-/Pflanzdatum **bis einschließlich geplanter Ernte**.
Es werden keine fachlichen Saisonwerte, Anzucht-/Räumtage oder Erträge ergänzt.

| Daten in Bezug auf die gewählte Woche | Darstellung |
|---|---|
| Beet ohne Vorgänge | Unbelegt · keine Kultur geplant |
| Alle Starts liegen nach dem Sonntag | Noch nicht belegt |
| Bekannter Abschnitt berührt mindestens einen Wochentag | Geplante Belegung |
| Mindestens zwei Vorgänge teilen bekannte Tage innerhalb dieser Woche | Zeitliche Überlagerung / Mischkultur |
| Mehrere bekannte Abschnitte folgen innerhalb derselben Woche ohne gemeinsame Tage | Geplante Belegung, zusätzlich „Folgekulturen innerhalb dieser Woche“ |
| Ernte fehlt, Start liegt in dieser Woche | Starttag bekannt; geplante Belegung mit Hinweis „Ende offen“ |
| Ernte fehlt, Start liegt vor dieser Woche | Belegung unklar; mögliche Fortdauer, keine bestätigte Dauerbelegung |
| Bekannte Ernte liegt vor dem Montag | Dieser Vorgang ist nach Plan abgeschlossen; tatsächliche Räumung unbekannt |
| Frühere bekannte Abschlüsse und künftige Starts, dazwischen kein bekannter aktiver Abschnitt | Planungspause |

Auch bei einem geplanten Abschluss bleibt ausdrücklich offen, ob tatsächlich
geerntet oder geräumt wurde. Die spätere Wochenansicht behandelt den Vorgang
nicht mehr als **bekannten geplanten Abschnitt**. Sie bestätigt keine physische
Beetverfügbarkeit. „Ende offen“ wird weder am Jahreswechsel noch beim Start
einer Folgekultur automatisch beendet.

Mehrere in derselben Woche sichtbare Kulturen sind nicht automatisch gleichzeitig
aktiv: Zwei aufeinanderfolgende Kulturen an unterschiedlichen Tagen sind keine
Mischkultur. Die bestehenden Python-Überschneidungsregeln aus Phase 3C.1 prüfen
bekannte gemeinsame Tage. Mögliche Überlagerung wegen fehlendem Ende wird
zusätzlich als unklar gekennzeichnet, nicht als sichere Mischkultur.

## Architektur und Datenfluss

`projects/season_view.py` ist eine kleine, reine **Präsentationsprojektion** der
vorhandenen `CultivationIntent`-Eingaben. Sie verwendet den bestehenden
Kalender-/Intervallvertrag und `cultivation_checks`, ohne Termine oder Beete
zu planen. `plan_season`, Allocator, Agronomiekern und synthetische Demo-Profile
bleiben unverändert. Ein Aufruf des Allocators würde manuelle Zuweisungen neu
verteilen und vollständige Saisonprofile/Ziele verlangen; beides ist hier
ausdrücklich nicht beauftragt. Daher keine künstlichen Ziele oder Ersatzprofile.

Ein GET liefert das vollständige ISO-Jahr mit allen Beetwochen. Das Frontend
führt keine zweite ISO-Datums-/Belegungsberechnung aus: es wählt nur ein
vorhandenes Wochenelement aus. Die Slider-Komponente `SeasonSlider` wird von
Demo und Projekt gemeinsam genutzt; deren Daten und Zeitstände bleiben getrennt.

Antworten binden sich an `project_id`, Projektrevision, Kulturplanrevision und
Geometrie-Token. Zusätzlich müssen Vorgänge und Beet-IDs zum geladenen Projekt
passen. Nicht passende/unvollständige Antworten werden zurückgewiesen. Bei
neuer Revision wird der alte Wochenstand nicht als neuer Stand angezeigt.
Abbruchsignale verhindern, dass verspätete Antworten einen anderen Projekt-
oder Jahresstand überschreiben. Ein Jahreswechsel lädt ein neues Kalenderjahr;
die Wochenanzahl kommt aus Python, nicht aus einer Frontend-Schaltjahrregel.

### API

| Endpunkt | Verhalten |
|---|---|
| GET `/api/v1/projects/{id}/season` | Jahresprojektion mit initial vorgeschlagener Woche |
| GET `/api/v1/projects/{id}/season/{iso_year}` | Jahresprojektion für ein ausdrücklich gewähltes ISO-Jahr |

Antwort im unveränderten API-v1-Umschlag unter `season`:

- `schema_version: 1`, Projekt-/Kulturplanrevision und Geometrie-Token.
- `iso_year`, `week_count` (52/53), `initial_week`, auswählbare `years`.
- Gespeicherte `cultivations` und Namen aus dem vorhandenen Python-Katalog.
- `weeks`: ISO-Jahr/Wochennummer, Montag/Sonntag und Status pro Beet-ID.
- Je Beet: `stage`, `active_ids` (bekannte Tage), `open_ids` (Ende unbekannt),
  `upcoming_ids`, `completed_ids`, `shown_ids`, `uncertain`, `succession` und
  `possible_overlap`. Offene IDs sind keine bestätigten Reservierungen.

Keine SQLite-Schreiboperation, Migration oder neue gespeicherte Fachfelder.
Bestehende Revisionskonflikte beim Bearbeiten bleiben HTTP 409. Liefert ein
GET eine andere Eingaberevision als die geladene UI, weist der Client dies
ebenfalls als Revisionskonflikt zurück und verlangt Projekt-Neuladen.
API-Ausfall/fehlerhafte Antwort bedeutet **Wochenstatus nicht verfügbar**,
keine vermeintlich unbelegten Beete. „Wochenansicht erneut laden“ wiederholt
den Abruf; bei Revisionskonflikt das Projekt mit ↻ neu laden.

## Bedienung und lokaler Start

Den bisherigen lokalen Projekt-API-Prozess beenden und neu starten, damit der
neue GET-Endpunkt geladen wird. Der Produktionsbuild liegt unter `frontend/dist`.

```powershell
cd ~\Documents\MarketGardenPlanner
.\.venv\Scripts\python.exe -B -m market_garden_planner.api.server
```

**http://127.0.0.1:8766** neu laden, gespeichertes Projekt wählen. Unten
ISO-Jahr wählen und den Wochenregler ziehen oder −/+ Woche verwenden.
Vor KW 1 geht es zum letzten Wochenstand des Vorjahres, nach der letzten
Woche zu KW 1 des Folgejahres. Wechsel von einem 53-Wochenjahr auf ein
52-Wochenjahr begrenzt die gewählte Wochennummer auf die vorhandenen 52.
Die Jahresauswahl umfasst Planjahre, aktuelles Jahr und Nachbarjahre der Ansicht.

Ohne lokale Auswahl startet die Ansicht im aktuellen ISO-Jahr, wenn dort Starts
liegen oder das Projekt leer ist; sonst im Jahr des ersten geplanten Starts.
Im aktuellen Jahr wird die heutige Woche vorgeschlagen, ansonsten die Woche
des ersten Starts im gewählten Jahr. Diese Vorschläge verändern keine Eingabe.

Die gewählte ISO-Woche/Jahr wird je Projekt in `sessionStorage` unter
`mgp.season.v1:<Projekt-ID>` als lokale Ansichtspräferenz gehalten: nach Neuladen
und beim Wechsel zurück zum Projekt bleibt sie erhalten. Keine Speicherung
dieser Auswahl in SQLite; blockierter Sitzungsspeicher verhindert die Planung
nicht. Die Demo behält ihren eigenen Tagesindex. Kulturtermine im Beetdetail
bearbeiten, ausdrücklich speichern; danach folgt der Wochenstatus dem
bestätigten neuen Projektstand, nicht einem ungespeicherten Formularentwurf.

## Geänderte Module

- Neu Python: `projects/season_view.py`; erweitert: `api/routes.py`.
- Neu Frontend: `projectSeason.ts`, `useProjectSeason.ts`, `SeasonSlider.tsx`,
  `ProjectSeasonBar.tsx`, `ProjectWeekSummary.tsx`.
- Erweitert: `App.tsx`, `Plot.tsx`, `ProjectTooltip.tsx`, `ProjectDetails.tsx`,
  `style.css`, `frontend/test.ps1`.
- Neu Tests: `tests/test_project_season.py`,
  `frontend/tests/project-season.test.mjs`, `export_season_fixture.py`.
- Dokumentation: diese Abnahme, DEC-031 und kurze Statusfortschreibungen in
  Produkt, Architektur und Roadmap.

Geometriemodelle, Repository, SQLite-Schema, Katalogwerte, Agronomieberechnung,
Scheduler und Demo-Eingaben unverändert. `experiments/` und Botanical ASCII Lab
wurden weder bearbeitet noch importiert. Keine neuen externen Abhängigkeiten.

## Tests

| Prüfung | Ergebnis |
|---|---|
| Python 3.11.9, gesamte Suite | **126/126 bestanden** (115 bisherige + 11 neue) |
| Frontend, gesamte Suite | **84/84 bestanden** (73 bisherige + 11 neue) |
| TypeScript `tsc --noEmit` | bestanden |
| Produktionsbuild | bestanden |

Python prüft leere, künftige, laufende, abgeschlossene, lückenhafte und offene
Planungen; Sonntag/Montag, eingeschlossene Ernte, Folge-/Mischkulturen,
Überlagerungen außerhalb der gewählten Woche, fehlende Enden über Jahreswechsel,
ISO-Wochen 1/52/53, Revisionen, Geometrieerhalt, reine GETs, Kulturänderung und
Neuladen sowie unverändert zurückgewiesene 409-Konflikte. Kalendergrenzen
werden ohne Datumskorrektur geprüft.

Frontend-Prüfdaten entstehen aus der tatsächlichen Python-Projektion. Tests
prüfen Vertrags-/Revisionsprüfung, fehlerhafte/unvollständige Zuordnungen,
API-Ausfall/409, projektspezifische Präferenzen, tatsächliche Kulturbezeichnungen,
Geometrieerhalt, Überlagerungs-/Unsicherheitsdarstellung, Tooltip/Detailanzeige,
gemeinsamen Regler und unveränderte Demo bei versehentlich beigefügten
Projekt-Saisondaten. Keine JavaScript-Ersatzfixtures für die Belegungsberechnung.

```powershell
.\.venv\Scripts\python.exe -B -m unittest discover -s tests -q
powershell -NoProfile -ExecutionPolicy Bypass -File frontend\test.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File frontend\build.ps1
```

Frontend-Skripte unterstützen `-NodeExecutable <absoluter Node-Pfad>`;
der Build umfasst TypeScript. Loopback-Verbindungen sind für HTTP-Tests nötig.

### Browserabnahme

Separater SQLite-Testbestand auf Port 8879, eindeutig synthetisch gekennzeichnet;
keine Testeinträge oder Migration in produktiven Projekten:

- Sechs reale Geometrieobjekte aus dem bestehenden Modell. In KW 20/2026:
  leer, zukünftig, Kopfsalat geplant, abgeschlossen, Spinat/Radieschen gleichzeitig
  sowie Karotten mit offenem Ende auf der Karte erkennbar.
- Tooltip und ausgewähltes Detailpanel zeigen beide überlagerten Kulturen.
  Wochenwechsel bei Auswahl: KW 23 zeigt nur noch Spinat auf diesem Beet.
  SVG-ViewBox vor/nach Datumsauswahl exakt gleich.
- KW 53/2020 endet am 03.01.2021; + Woche wechselt auf KW 1/2021 mit 52 Wochen.
  − Woche führt korrekt zurück zu KW 53/2020.
- Bei KW 20 Kopfsalat-Ernte von 01.06. auf 10.05. geändert: Status wird nach
  Bestätigung abgeschlossen; gewählte Woche und Auswahl bleiben. Nach Neuladen
  Daten und KW 20 erhalten. Der Termin wurde danach bewusst wiederhergestellt.
- Zweites leeres Projekt zeigt ausschließlich unbelegte Beete und seinen eigenen
  initialen Zeitstand. Demo am 20.06.2026 weiter sechs freie Beete und ihre
  KW-25-Prognose mit 600 Stück Kopfsalat. Zurückwechseln erhält Projekt-KW 20.
- Zwischenzeitlich geänderte Projektrevision: UI-Speichern erhält 409,
  überschreibt keinen Termin. Nach ↻ ist bestätigte Bearbeitung wieder möglich.
- API-Vergleich bestätigt unveränderte Geometrie, Objektrevisionen, Token,
  Vorgangs-IDs und finale Nutzereingaben gegenüber dem Test-Ausgangsstand.
- Keine Konsolenfehler/Warnungen vor absichtlich beendetem Testserver. Danach
  Jahreswechsel: alle Beete ausdrücklich `project-unavailable`; sichtbarer
  Verbindungsfehler und Wiederholen-Schaltfläche, keine Freimeldung.
- Screenshot mit Legende und geöffnetem Detailpanel erstellt. Testserver beendet.

## Bekannte Einschränkungen

- Wochenstatus ist eine aus Nutzerdaten abgeleitete Ansicht, kein gespeicherter
  `PlanRun`. Keine Wachstumsstadien, Pflanzenzahlen, Erntemengen oder tatsächlichen
  Beobachtungen. Kein neuer agronomischer Scheduler, keine Freigabe zur Räumung.
- Wochenstatus wird nach Laden, Jahreswechsel und bestätigter Projektänderung
  abgerufen; keine Echtzeitüberwachung externer Änderungen. Innerhalb eines
  bereits geladenen Jahres bleibt dessen revisionsgebundener Schnappschuss
  nutzbar, auch wenn ein späterer API-Ausfall noch nicht erkannt wurde.
- ISO-Jahre 1–9998: ein vollständiges ISO-Jahr benötigt auch repräsentierbare
  Daten im folgenden Kalenderjahr. Außerhalb davon verständliche Ablehnung.
- Jahrespayload wächst mit Beeten und Vorgängen; derzeit bewusst einfacher
  Jahresabruf. Spätere Bereichs-/Ereignisoptimierung erst nach Messung.
- Lange Namen können sich bei dicht liegenden Beeten überlagern. Karte kürzt
  Namen und verweist auf Tooltip/Detail, keine neue Beschriftungs- oder
  Geometrie-Engine. Alle Vorgänge bleiben über die Liste erreichbar.
- Neue Ernteprognose, automatische Beetaufteilung, Botanical ASCII Lab und
  botanische Vegetationsdarstellung bleiben ausdrücklich außerhalb dieser Phase.
