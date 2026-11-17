# Roadmap — Status, Abhängigkeiten und Abnahme

Stand: **17.11.2026**, vorhandener Arbeitsstand bis Phase 3C.2.
Diese Übersicht gleicht bestehende Aufträge und Phasenberichte ab; sie
beauftragt keine weitere Implementierung und trifft keine neuen Prioritätsentscheidungen.
[Produkt](PRODUCT.md), [Architektur](ARCHITECTURE.md),
[Entscheidungen](DECISIONS.md), [offene Fragen](OPEN_QUESTIONS.md).

## Statusübersicht

„Implementiert“ bedeutet durch vorhandenen Code und Phasenbericht belegt.
„Prüfungen dokumentiert“ bezeichnet einen früheren Prüfbericht, keine hier
erneut ausgeführten Tests und keine automatische gemeinsame Produktabnahme.
Eine ausdrücklich dokumentierte offene manuelle Prüfung bleibt offen.

| Phase / Bereich | Stand | Nachweis / verbleibender Umfang |
|---|---|---|
| 1 / 2 | Implementiert; automatisierte Prüfungen dokumentiert | [Fachkern](phase1.md), [Scheduler](phase2.md), lokale Kalibrierung weiterhin offen |
| 3A.1 / 3A.2 | Implementiert; Prüfungen dokumentiert | [Prototyp](phase3a1.md), [Map-first](phase3a2.md), [Ernteprognose](phase3a2-harvest.md) |
| 3B.0 | Architekturprüfung dokumentiert | Historischer Entwurf unten; spätere Umsetzungen konkretisieren ihn |
| 3B.1 | Implementiert; Prüfungen dokumentiert | [Geometriekern](phase3b1.md); Shapely 2.1.2 festgelegt |
| 3B.2 | Implementiert; Prüfungen dokumentiert | [SQLite/API](phase3b2.md); Speicher-/Revisionsvertrag konkretisiert, Schema inzwischen durch 3C.1 erweitert |
| 3B.3a | Implementiert; Prüfungen dokumentiert | [Projektanzeige](phase3b3a.md) |
| 3B.3b | Implementiert; Prüfungen dokumentiert | [Zeichnen und Verschieben](phase3b3b.md) |
| 3B.3c + UI-Feinschliff | Implementiert; Prüfungen dokumentiert, physischer Shift-Drag noch offen | [Präzise Bearbeitung](phase3b3c.md); offene Geräteprüfung im OQ-Register |
| 3B.3 insgesamt | Teilweise umgesetzt | Grundstücksgrenze, Wege/Sperrflächen, feste Bezugskanten, Entsperren und Undo/Redo sind noch nicht vollständig als UI vorhanden |
| 3C.1 + UX-Fortschreibung | Implementiert; Prüfungen dokumentiert | [Kulturplanung und Datumsanalyse](phase3c1.md), DEC-029/030 |
| 3C.2 | Implementiert im Arbeitsstand; Prüfungen dokumentiert | [Projekt-Wochenansicht](phase3c2.md), DEC-031; kein gespeicherter Scheduler-Lauf |
| 3B.4 | Beschlossenes Ziel, nicht implementiert | Gewächshäuser/Umgebungszuordnung; OQ-013 |
| 3B.5 | Beschlossenes Ziel, nicht implementiert | Bake und Vergleich; OQ-014/015 |
| 3B.6 | Beschlossenes Ziel, nicht implementiert | Freigegebene Zonen generieren; OQ-015/016 |
| 3B.7 | Beschlossenes Darstellungsziel; technische Umsetzung offen | OQ-019; isoliertes Botanical ASCII Lab ist keine Integration |
| Historische Erträge / GIS | Beschlossene Zukunftsziele, nicht implementiert | OQ-017/018; keine neue Reihenfolge festgelegt |

## Abhängigkeiten und nächste Klärungen

Die bestehende räumliche Reihenfolge bleibt erhalten:
Geometrie → Persistenz → manueller Editor → Gewächshäuser →
Bake/Vergleich → zonenbezogene Generierung → zusätzliche Landschaftsansicht.
Der ergänzende Kulturplanungsstrang 3C.1/3C.2 ist bereits vorhanden; er ersetzt
weder diese Abhängigkeiten noch die fachlichen Voraussetzungen für Prognosen.

Vor einer nächsten Beauftragung den kleinen konkreten Umfang und seine
Abnahmekriterien festlegen. Der bereits dokumentierte fachliche Anschluss ist
Saison-/Räumvertrag, Zuordnung manueller Kulturabsichten zu Scheduler-Läufen
und revisionsgebundene Ergebnisse (OQ-007 bis OQ-010).
Diese Nennung ist keine Entscheidung, ihn vor den räumlichen Zielen umzusetzen.

## Qualitäts- und Dokumentationsnachweise

- Bestehende Funktionen und Tests erhalten. Die Regressionsbasis ist die
  tatsächlich vorhandene Suite zu Beginn des jeweiligen Auftrags, nicht die
  historische Zahl 32/12 aus Phase 3B.0.
- Aktuelle Befehle: [README](../README.md). Datierte Testergebnisse stehen im
  jeweiligen Phasenbericht; jüngster dokumentierter Stand ist [3C.2](phase3c2.md).
- Code, dokumentierte automatische Prüfungen, offene manuelle Abnahme und
  Git-/Arbeitsstand getrennt ausweisen; keine Abnahme aus einer Testzahl ableiten.
- Geometrie, IDs, Revisionen, Datumsgrenzen, Datenherkunft und API-Fehler direkt
  prüfen; UI-Änderungen zusätzlich im Browser kontrollieren.
- Querverweise und Status nach jeder Phase abgleichen. Offene Punkte mit
  [OQ-ID](OPEN_QUESTIONS.md) verknüpfen, Entscheidungen über DEC-IDs fortschreiben.
- Kein automatischer Git-Commit und keine Änderungen an externen Projekten.

## Historische Planung und unveränderte Abnahmekriterien

Die bisherige Roadmap bleibt vollständig erhalten. Alte Formulierungen wie
„offen“, „dieser Auftrag“, Versionsauswahl und Testzahlen beziehen sich auf
die dort genannten Stände. Insbesondere Shapely-Version und lokaler
Speicher-/Revisionsvertrag sind heute nicht mehr unentschieden.
Noch ausstehende Detailentscheidungen stehen ausschließlich als aktueller
Index in [OPEN_QUESTIONS.md](OPEN_QUESTIONS.md); Begründungen bleiben am Ursprung.

<details>
<summary>Bisherige Roadmap — ursprüngliche Reihenfolge, Aufträge und Abnahmekriterien</summary>

# Phase 3B.0 — Roadmap zur interaktiven Grundstücksplanung

Stand: 16.11.2026. **Vorschlag, noch kein Implementierungsauftrag.**
Fachliche Grundlage: [ARCHITECTURE.md](ARCHITECTURE.md), [PRODUCT.md](PRODUCT.md).
Jede Phase endet mit einem eigenständig prüfbaren Ergebnis. Keine automatischen
Git-Commits oder Änderungen an externen Projekten/Rhino-Konfigurationen.

## 1. Abhängigkeiten und empfohlene Reihenfolge

```text
3B.1 Geometrievertrag + stabile IDs + Migration
  → 3B.2 Projektdatei/Repository + versionierte Schreib-API
    → 3B.3 Präziser manueller 2D-Editor
      → 3B.4 Gewächshäuser und Umgebungszuordnung
        → 3B.5 Bake, Duplizieren und Vergleich
          → 3B.6 Optionale zonenbezogene Generierung
            → 3B.7 Isometrische Ansicht derselben Geometrie
```

Historische Ertragsdaten können nach 3B.2/3B.4 als eigenes Arbeitspaket folgen.
Die isometrische Projektion kann nach stabilem Geometrie- und Saisonvertrag
parallel vorbereitet werden; sie ist keine Voraussetzung für den Editor.
Bake vor Generierung ermöglicht einen eingefrorenen Bestandsvergleich, bevor
ein automatischer Vorschlag zusätzliche Objekte erzeugt.

## 2. Phasen mit Abnahmekriterien

### Ergänzender Strang 3C.2 — Wochenansicht gespeicherter Projekte

Implementiert auf ausdrücklichen Auftrag: Python projiziert eigene Anbauabsichten
auf ISO-Wochen, die bestehende Karte und der gemeinsame Regler zeigen diese
revisionsgebunden an. Kein zusätzlicher Scheduler, PlanRun, SQLite-Vertrag oder
Ertragsmodell. Fehlende Enden und echte zeitliche Überlagerungen bleiben sichtbar;
Folgekulturen innerhalb derselben Woche werden davon getrennt.
[Abnahme und Grenzen](phase3c2.md), DEC-031. Fachliche Saisonprofile, Ist-Daten,
Räumung und neue Prognosen bleiben eigene zukünftige Aufgaben.

### Ergänzender Strang 3C.1 — Kulturplanung und manuelle Beetzuweisung

Auf ausdrücklichen Auftrag nach 3B.3c implementiert: dauerhafte Kulturabsichten
mit eigenen IDs, Katalogprofilreferenzen, expliziten Nutzerdaten und getrennter
Kulturplanrevision. SQLite-Schema 2 migriert bekannte Version 1 transaktional;
bestehende Geometrie bleibt erhalten. Formular und chronologische Liste im
Beetpanel; revisionssichere CRUD-API und Schutz vor verwaisten Vorgängen.
[Abnahme, 106 Python-/66 Frontend-Tests und Grenzen](phase3c1.md), DEC-029.
Keine neue Saisonvisualisierung, Prognose oder Änderung des Schedulers.

Nächster fachlicher Anschluss (noch nicht beauftragt): Saison-/Räumvertrag,
Intent-/Run-Zuordnung und ausdrücklich ausgelöster Scheduler-Lauf für manuelle
Zuweisungen; Ergebnisse an Geometrie-Token, Kulturplanrevision und Profilstand
binden. Die bisherigen räumlichen Zukunftsphasen bleiben davon unberührt.

### 3B.0 — Architekturprüfung (dieser Auftrag)

Ergebnis: Bestandsaufnahme, Koordinaten-/Identitätsentscheidung, räumliches
Modell, Scheduler-Grenzen und Roadmap. Keine Anwendungsänderungen.

Abnahme: `ARCHITECTURE.md`, `ROADMAP.md`, ergänztes `PRODUCT.md` und `AGENTS.md`;
alle vorherigen Anforderungen bleiben erhalten. Der vorhandene Quell- und
Datenbestand bleibt unverändert. Regressionen: 32 Python- und 12 Frontend-Tests
sowie TypeScript-Prüfung erneut erfolgreich.

### 3B.1 — Kleiner Geometrievertrag und lesender Scheduler-Adapter

Implementiert: siehe [Phase-3B.1-Abnahme](phase3b1.md). Die folgenden Punkte
bleiben die Spezifikation dieses Schritts; 3B.2 und spätere Schritte sind offen.

Abhängigkeit: bestätigte Architekturentscheidungen aus 3B.0.

Ergebnis: separates Python-Domänenpaket für Grundstückspolygon und gedrehtes
Rechteckbeet, stabile IDs, explizite Weltkoordinaten, JSON-Roundtrip und
Geometrievalidierung. Ein lesender Adapter erzeugt bisherige Scheduler-Beete.
Der heutige Demo-Endpunkt und die Oberfläche bleiben zunächst unangetastet.

Abnahme: siehe vollständigen kleinen Auftrag in Abschnitt 3. Keine Änderungen
an der bisherigen Scheduler-Implementierung, keine installierte Editor- oder
Variantenfunktion. Shapely-Version nur nach erfolgreichem Python-3.11-/Windows-Test
festlegen und isoliert vom agronomischen Kern halten.

### 3B.2 — Projektpersistenz und versionierter Anwendungsvertrag

Abhängigkeit: 3B.1. Implementiert gemäß Auftrag direkt mit SQLite-Repository;
das räumliche JSON bleibt der einzige Geometrievertrag. Kein separates zweites
Projektdateimodell. [Datenbankschema, API und Tests](phase3b2.md).
Transport zunächst über den vorhandenen lokalen HTTP-Handler statt FastAPI;
die Trennung erlaubt späteren Austausch. Generische Topologie-Vorschau vorhanden,
projektbezogene Sperr-/Revisionsvorschau bleibt ein kleiner Anschlussauftrag für 3B.3.

Abnahme:

- Speichern/Laden erhält IDs, Winkel, Koordinaten, Quellen und Sperren.
- Unbekanntes Schema und ungültige Referenzen werden verständlich abgelehnt;
  Migration ist explizit und durch Roundtrip-Tests abgesichert.
- Ungültige Vorschau schreibt nichts. Revisionenkonflikt überschreibt nichts.
- Wiederholte Command-ID ist idempotent; Schreibfehler lassen alten Stand lesbar.
- Bestehender Prototyp bleibt durch einen Kompatibilitätsadapter ausführbar.
- Keine automatische Generierung oder Saisonberechnung durch Öffnen/Speichern.

Stand: 81 Python- und 12 Frontend-Tests erfolgreich. Idempotente Änderungsbelege
für PUT/PATCH umgesetzt; Projekterstellung bleibt ein normales nicht idempotentes
POST. Objekt-Hinzufügen/-Löschen und projektbezogene Preview-Befehle vor dem
vollständigen Editor ergänzen. Keine Bake-Variantenverwaltung in 3B.2.

### 3B.3 — Präziser manueller 2D-Editor und Bestandsübernahme

Vorbereitender Teilschritt **3B.3a implementiert**: ausschließlich lesende
Projektauswahl und maßhaltige SVG-Anzeige der vorhandenen Projekt-API, inklusive
Polygonlöchern und frei gedrehten Beeten. Separate Demo mit Saisonplanung;
gespeicherte Projekte ohne erfundene Scheduler-Ergebnisse. [Abnahme](phase3b3a.md).
Der folgende Editorumfang bleibt offen und ist durch 3B.3a nicht implementiert.

**3B.3b implementiert:** Rechteckbeete über zwei Längsachsenpunkte und
eingegebene Breite frei zeichnen, auswählen und metrisch verschieben.
Shapely-Vorschau, revisionssicherer Anlegebefehl und bestehender PATCH,
Sperr-/Konfliktbehandlung; bestätigter Stand getrennt vom Entwurf.
[Abnahme und Grenzen](phase3b3b.md). Die folgenden Kriterien für den
vollständigen Editor (u. a. Grundstücksgrenze, Skalieren/Rotation, Undo/Redo,
Wege, Sperrflächen) bleiben weiterhin zukünftiger Umfang.

Abhängigkeit: 3B.2. Grenzen und Beete manuell erfassen oder aus explizitem
Projektformat übernehmen. Fremdformate/GIS-Importe später einzeln spezifizieren.
Länge, Breite, Position und Rotation numerisch editieren; Pointerwerkzeuge
verwenden die inverse Welttransformation. Wege und Sperrflächen ergänzen.

Abnahme:

- Ablauf A: unregelmäßige Grenze eingeben, Beete ohne Rasterzwang anlegen.
- Ablauf B: vorhandene Strukturen übernehmen; räumlicher Generator bleibt aus.
- 65 → 75 cm, einseitig und symmetrisch, mit sichtbar richtiger Ankerkante.
- Nur gewähltes Objekt ändert sich; Nachbarobjekte bleiben identisch.
- Konflikt wird vor Übernahme gezeigt; Undo/Redo stellt exakte Revisionen wieder her.
- Geometrie-/Generatorsperren werden für alle Änderungswege respektiert.
- Laufgebundene alte Saisonprognose erhält Stale-Kennzeichnung. Neuberechnung
  ist bewusst; eine Zuweisungsänderung wird nicht als bloße Flächenänderung versteckt.
- Hover, Auswahl, Prognosefenster, saisonaler Regler und Kamera bleiben erhalten.

### 3B.4 — Gewächshäuser und explizite Anbaubedingungen

Abhängigkeit: 3B.3. Eigene Gebäude- und nutzbare Innenpolygone, Türen/Wände,
individuell bearbeitbare Innenbeete und explizite Umgebungszuordnung.

Abnahme:

- Gebäude enthält Innenbeete, ohne dass dies als verbotene Kollision gilt.
- Ein Innenbeet außerhalb der nutzbaren Innenfläche wird abgelehnt.
- Gesperrte Kinder werden nicht durch Gebäudeverschiebung mitverschoben.
- Freiland und geschützter Anbau verwenden eigene explizite Profile.
- Fehlende Profilwerte erzeugen Datenmeldungen; kein erfundener Ertragsfaktor.
- Scheduler-Aufrufe zunächst je eindeutiger Umgebungsgruppe; mehrdeutige
  gruppenübergreifende Ziele werden nicht doppelt gezählt.
- Baukörper, produktive Innenfläche, Wege und Beete sind in Flächenbilanzen getrennt.

### 3B.5 — Bake und vergleichbare Varianten

Abhängigkeit: 3B.2–3B.4. Unveränderliche Eingabeschnappschüsse und PlanRuns,
neuer bearbeitbarer Arbeitsstand beim Duplizieren. SQLite-Repository mit
Transaktionen, Integritätsprüfung und weiterhin nutzbarem JSON-Export.

Abnahme:

- Nach Bake verändert eine Bearbeitung weder gespeicherte Geometrie noch Profile
  oder Ergebnisse. Versions- und Integritätsinformationen bleiben erhalten.
- Duplizierte Variante erhält neue Varianten-ID; fortgeführte reale Objekte
  behalten logische IDs. Ein neu dupliziertes Beet erhält eine neue Objekt-ID.
- Geänderte/gelöschte/zusätzliche Objekte sind nachvollziehbar vergleichbar.
- Flächen, Wegeflächen und definierte Wegelängen werden separat verglichen.
- Wochenprognosen nach Kultur und Einheit vergleichen; verschiedene Ziele,
  Profilstände oder Rechenversionen sichtbar kennzeichnen.
- Fehlende oder veraltete Prognose ist kein vergleichbarer Nullertrag.
- Abgebrochener Schreibvorgang hinterlässt keine halbe Variante.

### 3B.6 — Ausdrücklich aktivierte Generierung ausgewählter Zonen

Abhängigkeit: validierter Editor, Sperren und Bake. Erst deterministische
Platzierungsvorschläge, keine pauschale „optimale“ Betriebsplanung versprechen.

Abnahme:

- Neues Grundstück: Generator nur nach bewusster Wahl mit eingegebenen Maßen,
  freier Ausrichtung und expliziten Wegen/Abständen.
- Bestehender Garten: Import, Öffnen und Scheduler lösen niemals Platzierung aus.
- Kombiniert: Bestand sperren, freie Zone wählen, nur darin zusätzliche Beete
  vorschlagen. Alle geschützten Objektrevisionen bleiben unverändert.
- Gleicher Eingabestand, Seed und Generatorversion ergeben gleiche Vorschau.
- Kollisionen und nicht platzierbare Restflächen werden sichtbar gemeldet.
- Ablehnen verändert nichts; Bestätigen übernimmt den Vorschlag atomar.
- Gewächshaus-Innenplanung und Freiland sind getrennte räumliche Kontexte.

### 3B.7 — Monochrome Living Landscape

Abhängigkeit: stabiler räumlicher Vertrag und saisonale Ergebnisbezüge.
Zunächst ein einfacher zweiter Renderer ohne neue 3D-/Spielmechanik. Eine
3D-Bibliothek nur nach nachgewiesenem Bedarf für Verdeckung/Leistung auswählen.

Abnahme:

- 2D und Isometrie referenzieren dieselben Objekt-IDs und Weltpunkte.
- Ein schräges Beet behält seine echte Richtung; keine Kachelung der Geometrie.
- Wechsel der Ansicht ändert keine Koordinate, Fläche, Reservierung oder Prognose.
- Umgekehrtes Picking identifiziert das richtige räumliche Objekt.
- Saisonphasen stammen weiterhin aus Python; Pflanzenbilder sind schematisch.
- Weiß/Grau mit wenigen dezenten Akzenten, lesbare Namen und Legende,
  ruhige Architekturmodell-Anmutung ohne Spieloberfläche.

### Späteres eigenständiges Arbeitspaket — Historische Erträge

Abhängigkeit: persistente IDs, Saisonjahre und Umgebungsbezüge. Prognose,
historischer Erfahrungswert und tatsächliche Ernte werden unterschiedliche
Datensätze mit Quelle und Bezugsbasis. Zuordnung zu Kultur, Sorte, Beet und Jahr.
Kalibrierung erst nach definiertem Verfahren und ausreichenden Betriebsdaten;
kein stilles Überschreiben des Katalogs. Abnahmefälle für Einheiten, Herkunft,
Beetumbauten und Zuordnung über Varianten hinweg vorab spezifizieren.

## 3. Vorgeschlagener Auftrag für Phase 3B.1

> Implementiere ein separates, kleines Python-Paket für den räumlichen
> Datenvertrag. Unterstütze ein Grundstückspolygon mit Löchern und ein frei
> gedrehtes Rechteckbeet mit stabiler ID. Migriere die vorhandene Demo nur in
> einem lesenden Adapter/Testpfad in den neuen metrischen Raum. Leite daraus
> die bisherigen Scheduler-`Bed`-Objekte ab. Die bestehende Anwendung und ihr
> Demo-API-Vertrag werden noch nicht umgestellt.

**Enthalten:**

1. `CoordinateFrame`, `Parcel`, `BedGeometry` mit Revision, Herkunft und
   getrennten Geometrie-/Generatorsperren; eindeutige Einheiten und Winkelkonvention.
2. Parametrisches Beetpolygon und Fläche; keine doppelt editierbaren Eckpunkte.
3. Validierung von Polygon, Dimensionen, Einschluss und Beetüberschneidungen
   über einen kleinen Shapely-Adapter. Fehler mit Objekt-IDs.
4. Reine Breitenänderungsfunktion mit expliziter Ankerwahl als Test der lokalen
   Änderung; kein UI-Werkzeug und kein automatisches Verschieben anderer Beete.
5. Versionierter JSON-Roundtrip und lesender Adapter zur bestehenden Scheduler-ID.
6. Erhalt aller bisherigen Tests, zusätzliche fokussierte Geometrie-/Adaptertests.

**Nicht enthalten:** Editoroberfläche, Schreib-API, dauerhafte Projektspeicherung,
Generator, Gewächshausfunktionen, Bake, Optimierung und isometrischer Renderer.
Hierfür werden nur die später erweiterbaren Identitäts-/Objektgrenzen vorbereitet.

**Konkrete Abnahmefälle:**

- Ein konkaves Grundstück mit schräger Kante und Loch wird korrekt gelesen.
  Selbstüberschneidung und Beet im Loch werden abgelehnt.
- Ein 8 × 0,65 m großes Beet bei 17° hat 5,2 m²; seine vier Ecken entsprechen
  der dokumentierten Transformation und werden beim JSON-Roundtrip nicht gerastert.
- 0,75 m Breite ergibt 6,0 m²; symmetrisch bleibt das Zentrum gleich,
  einseitig bleibt die gewählte Kante innerhalb Toleranz exakt an ihrem Ort.
- In einem Testbestand mit zwei Beeten bleibt das nicht bearbeitete Objekt
  einschließlich seiner Revision identisch. Eine verursachte Kollision wird abgelehnt.
- Gesperrtes Beet kann nicht geändert werden. Eine Fehlermeldung nennt seine ID.
- Migration der sechs Demo-Beete erhält sichtbare Eckpositionen nach Rückprojektion;
  Breite, Länge und Scheduler-Reihenfolge bleiben erhalten.
- Bei unveränderten Zielen/Profilen liefert der Adapter nach expliziter Abbildung
  der Legacy-Beet-IDs auf UUIDs denselben bisherigen Saisonplan. Veränderte Maße
  werden mit dem existierenden `bed_capacity`
  geprüft, ohne den Scheduler oder aktuelle produktive Eingaben zu ändern.
- Synthetischer Abstandstest: 0,65 → 0,75 m bei 0,25 m Reihenabstand,
  L=8 m und 0,30 m Pflanzenabstand ergibt 52 → 78 Positionen. Kein agronomischer
  Produktionswert und keine automatische Neubelegung anderer Beete.

## 4. Qualitätsregeln über alle Phasen

- Vor jedem Schritt einen konkreten Datenvertrag und kleine Abnahmefälle festlegen.
- Regressionsbasis: aktuelle 32 Python- und 12 Frontend-Tests erhalten, bei
  gewollter Vertragsmigration Alt-/Neu-Vergleich ergänzen.
- Neue Zustände nicht ausschließlich durch Screenshots testen: Identität,
  Koordinaten, Topologie, Revisionen und Rechenergebnisse direkt prüfen.
- Nach UI-Änderungen Browserprüfung: Kamera unverändert bei Panelaktionen,
  Hover/Auswahl unabhängig, Prognose nach Kalenderwoche, kleine Fenster.
- Keine Vermischung synthetischer Fixtures mit produktiven Agronomiedaten.
- Anwendungen und Bibliotheken erst in der zugehörigen Phase installieren/ändern.
- Der Wechsel von Geometrieversion oder Regeln macht betroffene Ableitungen
  nachvollziehbar ungültig; keine verdeckten automatischen Gesamtläufe.

## 5. Offene Entscheidungen mit geplantem Zeitpunkt

| Entscheidung | Zeitpunkt / empfohlener Ausgangspunkt |
|---|---|
| Exakte Shapely-Version und Windows-Verteilung | 3B.1, Python-3.11-Wheel und Topologietests zuerst |
| Praktische Toleranzen und Vermessungsangaben | 3B.1, technische Toleranz von realer Messgenauigkeit trennen |
| Projektdatei und Fehler-/Revisionsvertrag | 3B.2, eigenes metrisches JSON, Repository-Abstraktion |
| Fremdformat-Import und Georeferenz | Nach definiertem Bestandsformat; kein impliziter WGS84-Import |
| Undo/Redo-Tiefe und explizite Gruppenänderungen | 3B.3, kleine Befehlshistorie |
| Gemischte Umgebungszuweisung im Scheduler | 3B.4, zuerst eindeutige Gruppen statt stiller Profilübertragung |
| Wegelängen-/Flächenauswertung | Vor Variantenvergleich 3B.5 verbindlich definieren |
| Generatorheuristik, Abstände und Gütemaße | 3B.6, reale Betriebsanforderungen vor Optimierungsversprechen |
| Pflanzenassets, Höhen und Renderingbibliothek | 3B.7; keine neuen Geometriekoordinaten aus Assets |

</details>
