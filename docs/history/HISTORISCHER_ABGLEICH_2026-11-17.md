# Historischer Dokumentationsabgleich — 17.11.2026

## Geltung und Herkunft

Einmaliger Abgleich der [historischen Übergabe, Teile 1–4](MarketGardenPlanner_Historische_Projektuebergabe_Teil1-4.md)
mit [AGENTS](../../AGENTS.md), [README](../../README.md), [PRODUCT](../PRODUCT.md),
[DECISIONS](../DECISIONS.md), [OPEN_QUESTIONS](../OPEN_QUESTIONS.md),
[ARCHITECTURE](../ARCHITECTURE.md), [ROADMAP](../ROADMAP.md), Phasenberichten,
[Botanical ASCII Lab](../../experiments/botanical-ascii-lab/README.md), Code und Git.
Grundlage der Bereinigung sind der abgeschlossene Analysebericht und der
anschließende ausdrückliche Dokumentationsauftrag des Nutzers vom 17.11.2026.

Die Übergabe ist eine historische Gesprächsrekonstruktion, kein aktueller
Code- oder Beschlussnachweis. DEC-Einträge behalten ihren jeweiligen Status;
auch eine Zuordnung zu einer DEC-ID bedeutet nicht automatisch „beschlossen“.
H-/HF-Kennungen bleiben lokale historische Referenzen. Thematische und teilweise
Zuordnungen sind keine neuen Entscheidungen oder Implementierungsfreigaben.
Alle vorhandenen DEC-/OQ-IDs bleiben erhalten; frühere Berichte werden nicht korrigiert.

<a id="h-zuordnung"></a>
## H-Zuordnung

Ziele und Status richten sich nach dem [aktuellen Entscheidungsprotokoll](../DECISIONS.md).

| Historische Referenz | Bestehende DEC-IDs | Bewertung |
|---|---|---|
| H-01 Eigenständige Anwendung | DEC-002 | Eindeutig; optionale Rhino-Anbindung kein vorhandener Transport |
| H-02 Metrische freie Geometrie | DEC-003, DEC-004 | Eindeutig |
| H-03 Manuell und automatisch | DEC-005 | Eindeutig; Generator Zukunftsziel |
| H-04 Bestand/Sperren schützen | DEC-006, DEC-005 | Eindeutig; zwei Schutzarten unterscheiden |
| H-05 Validiert und bestätigt speichern | DEC-007, DEC-009, DEC-010 | Über mehrere Beschlüsse verteilt |
| H-06 Fläche und Wege gemeinsam | DEC-012 | Eindeutig |
| H-07 Drei Optimierungsziele | DEC-012 | Eindeutig; keine numerische Drittelung |
| H-08 Reale Wege | DEC-013 | Eindeutig |
| H-09 Veränderbare Prioritäten | DEC-012, DEC-015 | Eindeutig; Standardgewichte offen |
| H-10 Parametrisierbare Aufteilung | DEC-011, DEC-012, DEC-015 | Eindeutig; Detailverfahren offen |
| H-11 Transparenter Variantenvergleich | DEC-014, DEC-015 | Eindeutig |
| H-12 Bake | DEC-014 | Grundziel eindeutig; unveränderlichen Bake und neuen Arbeitsstand trennen |
| H-13 Agronomielogik wiederverwenden | DEC-002, DEC-022, DEC-029, DEC-031 | Eindeutig; Wochenprojektion kein neuer Scheduler |
| H-14 Demo/Projekt trennen | DEC-023, DEC-029, DEC-031 | Eindeutig |
| H-15 Parameterherkunft/Qualität | DEC-023 | Eindeutig; Parametervertrag im Code vorhanden |
| H-16 Mehrere Vorgänge | DEC-029 | Eindeutig |
| H-17 Überschneidungen anzeigen | DEC-030, DEC-031 | Eindeutig; keine fachliche Mischkulturprüfung |
| H-18 Plan/Prognose/Ist trennen | DEC-023, DEC-024, DEC-029, DEC-031 | Über mehrere Beschlüsse verteilt |
| H-19 Map-first | DEC-018, DEC-022 | Eindeutig; Prognosefenster für Demo |
| H-20 Direkte/numerische Bearbeitung | DEC-010, DEC-027 | Beeteditor; keine vollständige Skaliergriff-/Ankerkanten-UI |
| H-21 Zwei Nachkommastellen | DEC-028 | Eindeutig; interne Genauigkeit erhalten |
| H-22 Shift-Snapping | DEC-028 | Eindeutig; physischer Shift-Drag offen |
| H-23 Kompaktes Detailpanel | DEC-030 | Eindeutig |
| H-24 Bearbeitungskontext | DEC-032 | Eindeutig; im nicht eingecheckten Arbeitsstand |
| H-25 ASCII-/Halftone-Bildsprache | DEC-017, DEC-025 nur thematisch | Unsichere Verbindlichkeit; keine zentrale Festlegung nachgewiesen, OQ-019/020 |
| H-26 Monochrome Landschaft/Miniatur | DEC-017, DEC-025 | Grundrichtung beschlossen; konkrete Umsetzung offen |
| H-27 Technische 2D-Ansicht | DEC-018, DEC-019 | Eindeutig; zweite Ansicht nicht integriert |
| H-28 Name offen | DEC-026 | Kandidaten vorgeschlagen, kein endgültiger Name |

<a id="hf-zuordnung"></a>
## HF-Zuordnung

Maßgeblich bleiben die Detailfragen im [OQ-Register](../OPEN_QUESTIONS.md).
Mehrere HF-Themen sind dort zusammengefasst; eine Eins-zu-eins-Abbildung wäre falsch.

| Historische Referenz | Bestehende OQ-IDs | Abdeckung / Einschränkung |
|---|---|---|
| HF-01 Optimierungsverfahren | OQ-016 | Abgedeckt |
| HF-02 Bewertungsformeln | OQ-016, OQ-015, OQ-014 | Ziele, Wegekennzahlen, Variantenvergleich getrennt |
| HF-03 Zielflächendichte | OQ-016 | Harte/weiche Zielbehandlung und unerreichbarer Zielwert ausdrücklich präzisiert |
| HF-04 Winkelsuchstrategien | OQ-016 | Zuvor nur algorithmisch allgemein; Suchraum/Kanten/Zonen jetzt ausdrücklich offen |
| HF-05 Beetlängen | OQ-016 | Abgedeckt |
| HF-06 Parametergrenzen | OQ-016, OQ-001 | Abgedeckt; keine Standards übernommen |
| HF-07 Variantenanzahl | OQ-016, OQ-014 | Anzahl und Präsentation getrennt |
| HF-08 Wegenetzmodell | OQ-015, OQ-002 | Abgedeckt |
| HF-09 Maßgebliche Wegbeziehungen | OQ-015 | Abgedeckt |
| HF-10 Zugänglichkeit | OQ-015, OQ-001 | Grundsätzlich abgedeckt; Fahrzeuganforderungen offen |
| HF-11 Haupt-/Nebenwege | OQ-015, OQ-002 | Thematisch; abgeleiteter Prüfpunkt, keine beschlossene Klassifikation |
| HF-12 Bake-Speichervertrag | OQ-014 | Detailvertrag offen; Unveränderlichkeit bereits beschlossen |
| HF-13 Freigabe/Bestandsschutz | OQ-002, OQ-003, OQ-016 | Bedienung offen, Grundregeln beschlossen |
| HF-14 Herkunft generierter Beete | OQ-014, OQ-016 | Teilweise geklärt durch Herkunftsfelder; strukturierter Lauf-/Variantenbezug offen |
| HF-15 Fachliche Überschneidungen | OQ-010, OQ-009 | Heutige Datumsprüfung bereits geregelt |
| HF-16 Projekt-Ernteprognose | OQ-007, OQ-008, OQ-009, OQ-010 | Voraussetzungen auf mehrere Einträge verteilt |
| HF-17 Historische Erträge | OQ-017 | Abgedeckt |
| HF-18 Unvollständige Zeiträume | OQ-009, OQ-007, OQ-008 | Heutige Ansicht geklärt; spätere Ableitungen offen |
| HF-19 Visuelles Pflanzenwachstum | OQ-019, OQ-008 | Darstellung/Datenfrage; kein beschlossener Simulationsumfang |
| HF-20 Kartenanbieter | OQ-018 | Abgedeckt |
| HF-21 GIS-/Importformate | OQ-018, OQ-001, OQ-002 | Abgedeckt |
| HF-22 Weitere Editorfunktionen | OQ-002, OQ-003, OQ-004 | Abgedeckt |
| HF-23 Botanical-ASCII-Integration | OQ-019 | Mögliche Integration, keine Freigabe |
| HF-24 Renderingverfahren | OQ-019 | Abgedeckt |
| HF-25 Ansichtswechsel/Projektion | OQ-019 | Thematisch abgedeckt; Kamera-/Wechselablauf offen |
| HF-26 Visuelle Produktidentität | OQ-019, OQ-020 | Gestaltung offen; Lab-Themes keine Planner-Vorgabe |
| HF-27 Produktname | OQ-021 | Abgedeckt |
| HF-28 Rhino-/Grasshopper-Rolle | OQ-022 | Optionale Integration nicht konkret freigegeben |

Aktuelle OQ-Themen ohne eigene HF-Entsprechung bleiben erhalten, etwa
Command-Aufbewahrung, Anzucht/Lagerung, API-Vertragspflege und Skalierung.

## Dokumentationsbefund und übernommener Kontext

Grundarchitektur, Geometrie, Schutzregeln, Generatorziele, Variantenprinzipien,
Datenqualität, Kulturplanung und Wochenprojektion sind bereits dokumentiert.
Beschlossene Zukunftsziele sind weiterhin keine vorhandenen vollständigen Funktionen.
Die Bereinigung ergänzt in PRODUCT den parametrischen Ursprung und den betrieblichen
Wegekontext, in OQ-014/016 die vorhandenen Herkunftsfelder und offenen Folgefragen.

Die frühe Größenordnung „20 Sorten“ bleibt historisch, ohne nachgewiesenes festes
Katalog-/Rechenlimit. Positive Namensbewertungen für TERRASTRA/TERRAMETRA bleiben
unverbindlicher Kontext. Sie priorisieren DEC-026 nicht nachträglich um.

## Widersprüche und Nachweisgrenzen

- **Gestaltung:** H-25 behauptet eine beschlossene ASCII-/Halftone-Richtung.
  Die verbindliche Vorgabe ASCII/Halftone versus Pixel-Art ist ausdrücklich
  noch nicht abschließend geklärt (Nutzerklarstellung vom 17.11.2026).
  DEC-017/025 bleiben unverändert; OQ-019/020 führen den Bedarf. Die lokalen
  [EXP-001 bis EXP-006](../../experiments/botanical-ascii-lab/DECISIONS.md)
  wählen keinen Produktionsrenderer und geben keine Integration frei.
- **Stale:** Die historische Aufzählung zu 3B.1 reicht über den Bestand hinaus,
  sofern sie als vollständige Prognoseerkennung gelesen wird. Vorhanden ist ein
  Geometrie-Token; [3B.1](../phase3b1.md) grenzt PlanRun-/Stale-UI ausdrücklich aus.
- **Bake:** DEC-014 präzisiert die historische Überführung in bearbeitbare
  Geometrie: gesicherter Bake unveränderlich, Duplikat neuer Arbeitsstand.
- **Skalieren:** Numerische Maßänderungen sind vorhanden; feste Bezugskanten
  und Skaliergriffe sind keine vollständige Editorfunktion (OQ-003).
- **Herkunft:** [spatial/models.py](../../src/market_garden_planner/spatial/models.py)
  enthält bereits `origin` mit `existing`/`manual`/`generated` und optional
  `source_reference`. Daraus folgt kein strukturierter Generatorlauf-/Variantenbezug.
- **Reihenfolge:** „3C.3 als Nächstes“ ist historische Planung, keine neue
  Priorität gegenüber der heutigen räumlichen Roadmap.
- **Testzahl 3B.3a:** Die Übergabe nennt zuletzt 25 Frontend-Tests;
  [3B.3a](../phase3b3a.md) dokumentiert 21 und
  [3B.3b](../phase3b3b.md) 36 mit elf neuen Editorfällen. Die Zwischenbasis 25
  ist damit plausibel, ein eigener datierter Nachweis im 3B.3a-Bericht fehlt.
  Keine dieser historischen Zahlen wird überschrieben.
- **Abnahme:** Die Übergabe berichtet „alles funktioniert“ zur grundlegenden
  3B.3c-Bearbeitung vor dem weiteren Feinschliff. Das ist keine Abnahme aller
  Folgefunktionen, des physischen Shift-Drags oder der gesamten Phase 3C.2.

## Implementierungs- und Prüfstand

Nachweisbarer Bestand bis 3C.2: Fachkern/Scheduler, metrische Geometrie,
SQLite-Schema 2 und revisionssichere API, Beeteditor, Kulturabsichten,
Datumsanalyse und lesende ISO-Wochenprojektion. DEC-032 ist im vorhandenen
Frontend-Arbeitsstand implementiert. [season_view.py](../../src/market_garden_planner/projects/season_view.py)
plant keine Beete neu und berechnet keine Erträge. Der Parametervertrag
`value`/`unit`/`source`/`status` ist in
[models.py](../../src/market_garden_planner/models.py) nachweisbar.

Projekt-Ernteprognose, gespeicherte Scheduler-Läufe, vollständige Stale-UI,
Generator, Bake, Gewächshausobjekte, GIS und Lab-Integration fehlen weiterhin.
Das Lab bleibt eine synthetische Tomatenstudie mit fester Isometrie,
Tiefenprüfung, Licht/Schatten, Wind und Themes; die frühere Winkelumschaltung
wurde durch EXP-005 abgelöst. Keine Wachstums-/Ertragssimulation.

Die datierten Ergebnisse bleiben ausschließlich frühere Nachweise:
[3C.2 samt UX-Nachtrag](../phase3c2.md),
[Lab-Lichtstudie](../../experiments/botanical-ascii-lab/LIGHT-STUDY.md) und
[Lab-Themestudie](../../experiments/botanical-ascii-lab/THEME-STUDY.md).
Die Analyse zählte statisch 126 Python-Testmethoden und 88 Frontend-Testdeklarationen;
das ist kein ausgeführter Testlauf. Tests, Build und Browserabnahme wurden für
diesen Dokumentationsauftrag nicht wiederholt. QA-001/002 im OQ-Register
und eine vollständige gemeinsame 3C.2-Abnahme bleiben ohne neuen Erledigungsnachweis.

## Git-Schnappschuss vor dieser Bereinigung

Am 17.11.2026: Branch `master`, HEAD
`20e6a6383e9c69ef48924623f73577a273d63c3e` —
`Phase 3C.2: Project season timeline`; kein Remote konfiguriert.
Das belegt einen lokalen Commit, keinen externen Sicherungsstand.

| Historische Lücke / Stand | Im lokalen Git nachgewiesen |
|---|---|
| 3A.1 ohne Hash | `327a634` |
| 3A.2 | `e1d6458` |
| 3B.1 | `bfca02b` |
| 3B.2 | `106f30c` |
| 3B.3a | `012cbc3` |
| 3B.3b ohne übermittelten Hash | `46db28f` |
| Entscheidungsarchiv | `f57d9b3` |
| 3B.3c ohne übermittelten Hash | `d92a258` |
| 3C.1 | `a8192e8` |
| 3C.2 historisch ohne bestätigten Commit | `20e6a63` vorhanden |
| DEC-032 / UX-Nachtrag | Noch nicht eingecheckt |

Bereits vor diesem Auftrag geändert: `docs/DECISIONS.md`, `docs/phase3c2.md`,
`frontend/src/CultivationPanel.tsx`, `frontend/src/style.css`,
`frontend/tests/cultivation.test.mjs`; außerdem `docs/history/` unversioniert.
Die fünf verfolgten Diffs enthielten 154 Einfügungen und fünf Löschungen.
Diese Angabe beschreibt den Ausgangsstand, nicht den Diff nach dieser Bereinigung.
Alle vorhandenen Änderungen bleiben erhalten; kein Commit wird erstellt.

## Bereinigungsumfang und verbleibender Bedarf

Geändert werden ausschließlich README und die fünf zentralen Fachübersichten
sowie dieser neue Abgleichbericht. DECISIONS erhält nur aktuelle Einordnung und
Verweis, keine Änderung bestehender Entscheidungstexte. Historische Übergabe,
Phasenberichte, Testprotokolle, Lab und Anwendungscode bleiben unverändert.

Die Bereinigung schließt keine OQ. Insbesondere Gestaltung, Winkelsuche,
Dichtebewertung, Generatorherkunft, Wegekennzahlen, Scheduler-Anschluss und
manuelle Prüfnachweise bleiben offen. Es gibt keine neue Reihenfolge,
Produktentscheidung, Datenmigration oder Implementierung.

## Prüfung dieser Bereinigung — 17.11.2026

- 304 relative Link-/Sprungmarkenverweise in README, den fünf zentralen
  Fachübersichten und diesem Bericht geprüft: keine fehlenden Ziele gefunden.
- 28 H- und 28 HF-Zeilen vollständig und ohne doppelte Kennung; alle darin
  zugeordneten DEC-/OQ-IDs vorhanden. DEC-001 bis DEC-032 und OQ-001 bis OQ-024
  bleiben unverändert als ID-Bestand erhalten.
- DEC-017 und DEC-025 mit HEAD verglichen: Entscheidungstexte identisch.
- Dateihashes vor/nach der Bearbeitung: ausschließlich README und die fünf
  zentralen Fachübersichten geändert, dieser Bericht neu. Vorhandene Änderungen
  an Anwendungscode, Frontend-Tests und phase3c2 bleiben bytegleich erhalten;
  historische Übergabe, übrige Phasenberichte und Lab ebenfalls unverändert.
- Git-Diff einschließlich neuer Datei inhaltlich geprüft; `git diff --check`
  ohne Whitespacefehler. Vorhandene LF/CRLF-Hinweise betreffen bereits geänderte
  Dateien und sind keine neuen Inhaltsänderungen dieses Auftrags.
- Keine Anwendungstests, Builds oder Browserprüfungen ausgeführt; keine
  Datenbanken, Einstellungen oder externen Projekte geändert; kein Commit.
