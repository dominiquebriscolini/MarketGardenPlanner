# Verbindliche Projektprinzipien

- Präzise 2D-Geometrie ist die Grundlage der Anwendung. Fach- und Bildschirmkoordinaten bleiben getrennt.
- Architektonische, wissenschaftlich-informative Gestaltung: minimalistisch und hochwertig.
- Keine spielartige Benutzeroberfläche und keine unnötigen 3D-Effekte.
- Langfristig dezente isometrische Pixel-Art-Pflanzendarstellung, aber nicht in dieser Phase.
- Agronomische Berechnungen bleiben nachvollziehbar und quellenbasiert.
- Synthetische Daten müssen eindeutig gekennzeichnet sein.
- Python-Scheduler bleibt die maßgebliche Quelle für Saison- und Belegungszustände.
- Kleine, überprüfbare Entwicklungsschritte; bestehende Funktionen und Tests erhalten.
- Keine Änderungen an externen Projekten oder Rhino-Konfigurationen.
- Keine Git-Commits ohne ausdrücklichen Auftrag.

## Verbindliches Entscheidungsprotokoll

- Bei jeder neuen Entwicklungsphase muss Codex `docs/DECISIONS.md` lesen und berücksichtigen.
- Neue Produkt- oder Architekturentscheidungen müssen in `docs/DECISIONS.md` mit stabiler ID, Datum, Status, Begründung und Auswirkungen dokumentiert werden.
- Bestehende Entscheidungen dürfen nicht stillschweigend überschrieben werden. Änderungen und Statuswechsel müssen ausdrücklich begründet und mit Datum, bisheriger Entscheidung und gegebenenfalls ersetzendem Beschluss nachvollziehbar dokumentiert werden.
- Beschlossene Zukunftsziele sind keine pauschale Implementierungsfreigabe; vorgeschlagene und offene Details dürfen nicht als bereits beschlossen behandelt werden.

## Ergänzungen zur Grundstücksarchitektur (Phase 3B.0)

- Architekturvorschläge und Abnahmefolgen stehen in `docs/ARCHITECTURE.md`
  und `docs/ROADMAP.md`. Sie sind keine pauschale Implementierungsfreigabe.
- Eine metrische Weltgeometrie für 2D und spätere Isometrie; keine Rasterpflicht
  und keine eigenständige isometrische Planungsgeometrie. Schräge Ausrichtungen erhalten.
- Räumliche Objekte, stabile Identitäten, saisonale Belegungen und abgeleitete
  Prognosen getrennt halten; Ergebnisbezüge an konkrete Eingaberevisionen binden.
- Lokale Geometrieänderungen verschieben keine Nachbarn. Sperren respektieren;
  veraltete Berechnungen sichtbar kennzeichnen statt automatisch alles neu zu belegen.
- Bestehende Gärten ohne automatische räumliche Generierung übernehmen.
  Generierung nur ausdrücklich, zonenbezogen und unter Erhalt geschützter Objekte.
- Gewächshäuser und Innenbeete getrennt modellieren; Anbaubedingungen ausdrücklich
  belegen, keine pauschalen Gewächshausfaktoren erfinden.
- Gespeicherte Bake-Varianten unveränderlich halten; Duplizieren erzeugt einen
  neuen bearbeitbaren Stand, ohne frühere Daten zu überschreiben.
- Langfristige Gestaltung: „Monochrome Living Landscape“, Weiß/Grau und wenige
  Akzente; vorhandene Anforderungen an Sachlichkeit und spätere dezente
  Pflanzen-Pixel-Art bleiben erhalten. Keine visuelle Umgestaltung im Architekturauftrag.
