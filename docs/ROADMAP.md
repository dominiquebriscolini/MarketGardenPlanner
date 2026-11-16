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

Abhängigkeit: 3B.1. Zuerst versionierte JSON-Projektdatei mit atomarem Austausch
und Repository-Schnittstelle. SQLite folgt bei der Variantenverwaltung hinter
derselben Schnittstelle; kein paralleles manuelles Pflegen zweier Wahrheiten.
FastAPI/Pydantic als äußerer Adapter für Vorschau, validierte Befehle und Laden.

Abnahme:

- Speichern/Laden erhält IDs, Winkel, Koordinaten, Quellen und Sperren.
- Unbekanntes Schema und ungültige Referenzen werden verständlich abgelehnt;
  Migration ist explizit und durch Roundtrip-Tests abgesichert.
- Ungültige Vorschau schreibt nichts. Revisionenkonflikt überschreibt nichts.
- Wiederholte Command-ID ist idempotent; Schreibfehler lassen alten Stand lesbar.
- Bestehender Prototyp bleibt durch einen Kompatibilitätsadapter ausführbar.
- Keine automatische Generierung oder Saisonberechnung durch Öffnen/Speichern.

### 3B.3 — Präziser manueller 2D-Editor und Bestandsübernahme

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
