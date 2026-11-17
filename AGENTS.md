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

## Verbindliche Dokumentationspflege — Docs-as-Code

- Vor jeder neuen Entwicklungsphase `README.md`, `docs/PRODUCT.md`,
  `docs/DECISIONS.md`, `docs/OPEN_QUESTIONS.md`, `docs/ARCHITECTURE.md` und
  `docs/ROADMAP.md` sowie die betroffene Funktionsspezifikation (soweit vorhanden)
  und den letzten relevanten Phasenbericht lesen. Diese Regeln ersetzen nicht
  den konkreten Nutzerauftrag.
- Zuständigkeiten beachten: README ist Einstieg/Start, PRODUCT beschreibt
  Produktzweck und Umfang, DECISIONS enthält Beschlüsse, OPEN_QUESTIONS den
  aktuellen offenen Entscheidungsbedarf, ARCHITECTURE den technischen Bestand
  und getrennte Entwürfe, ROADMAP Status/Abhängigkeiten/Abnahmekriterien.
- Tatsächlichen Codebestand, aktuelle Regeln, beschlossene Zukunftsziele,
  unverbindliche Ideen und historische Berichte ausdrücklich unterscheiden.
  Widersprüche gegen Code und Beschlusslage prüfen; nicht allein anhand des
  jüngsten Dateidatums entscheiden. Ungeklärte entscheidungsrelevante Widersprüche
  benennen und klären, bevor davon abhängige Änderungen umgesetzt werden.
- Offene Fragen nicht eigenständig zu Produktentscheidungen oder Standardwerten
  machen. OQ-IDs stabil halten; geklärte Einträge mit Datum und DEC-Bezug erhalten.
  Ein beschlossenes, noch nicht implementiertes Ziel ist nicht automatisch offen.
- Relevante neue Entscheidungen mit belegter Herkunft dokumentieren. Änderungen
  bestehender Entscheidungen ausdrücklich fortschreiben; IDs und frühere
  Begründungen erhalten. Ein Dokumentationsabgleich begründet keine neue
  Produktentscheidung oder Implementierungsfreigabe.
- Nutzerideen und Referenzen gemäß PRODUCT erfassen. Nutzeraussage, Interpretation,
  Experiment und Beschluss auseinanderhalten. Keine fehlenden Anforderungen
  erfinden; lokale EXP-Entscheidungen geben keine Planner-Integration frei.
- Bei konkretem Bedarf kleine Funktionsspezifikationen unter `docs/features/`
  verwenden: Ziel, Umfang/Nichtumfang, Bedienregeln, Daten-/API-Auswirkungen,
  Fehlerfälle, Abnahmekriterien und DEC-/OQ-Bezüge. Keine vorsorgliche
  Vollmigration der vorhandenen Phasenberichte.
- Mit einer Umsetzung betroffene Spezifikation, aktuelle Übersichten und
  Roadmap-Status abgleichen. Datierte Testresultate, Arbeits-/Git-Stand,
  Einschränkungen und offene manuelle Abnahme im Phasenbericht festhalten.
  „Implementiert“, „automatisch geprüft“ und „gemeinsam abgenommen“ nicht gleichsetzen.
- Phasenberichte und historische Fassungen erhalten, als historisch kenntlich
  machen und auf aktuelle Übersichten verweisen. Alte Testzahlen nicht als
  aktuelle Regressionsbasis vervielfältigen; maßgeblich ist die vorhandene Suite.
- Vor Abschluss relative Links und verwendete Sprungmarken, DEC-/OQ-Verweise,
  Statusangaben und Widersprüche der zentralen Dokumente prüfen.
- Vorhandene nicht eingecheckte Änderungen vor dem Schreiben prüfen und erhalten.
  Dokumentationsaufträge ändern weder Anwendungscode noch Datenbanken,
  Einstellungen oder externe Projekte. Kein Git-Commit ohne ausdrücklichen Auftrag.
