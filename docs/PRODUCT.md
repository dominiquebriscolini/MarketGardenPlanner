# Produktanforderungen und spätere Entwicklung

## Aktueller Umfang

Phase 3A.2 stellt die lokale, maßstäbliche Karte, unabhängige Beetdetails und
eine kalenderwochengenaue Ernteprognose auf Basis des Python-Schedulers bereit.
Phase 3B.1 ergänzt einen getrennten, optionalen Python-Geometriekern; die
bestehende Oberfläche bleibt dabei unverändert. [Umsetzung und Tests](phase3b1.md).
Die nachfolgenden Anforderungen sind ausdrücklich **zukünftig** und werden
in dieser Implementierungsphase nicht umgesetzt.

## Planungsvarianten / Bake — zukünftig

- Generierte Pläne als eigenständige Varianten speichern.
- Varianten duplizieren und vergleichen.
- Flächennutzung, Wege und prognostizierte Erträge zwischen Varianten vergleichen.

## Manuelle Geometriebearbeitung — zukünftig

- Automatisch generierte Beete nachträglich präzise verändern.
- Beispiel: Beetbreite von 65 auf 75 cm ändern.
- Einseitige oder symmetrische Verbreiterung ermöglichen.
- Änderungen auf Kollisionen prüfen.
- Manuell bearbeitete Elemente gegen automatische Optimierung sperren.

## Historische Ertragsdaten — zukünftig

- Nutzer können eigene Ertragswerte aus vergangenen Jahren eingeben.
- Prognosen, historische Erfahrungswerte und tatsächliche Ernten getrennt speichern.
- Daten Kultur, Sorte, Beet und Anbaujahr zuordnen.
- Später die Ertragsprognosen mit betriebseigenen Daten kalibrieren können.

Die Kennzeichnung synthetischer Daten, die nachvollziehbare Herkunft aller
agrarischen Eingaben und die Trennung von Fachgeometrie und Darstellung bleiben
dabei verbindlich. Diese Liste beauftragt weder Optimierung noch Speicherung
oder Geometriebearbeitung für den aktuellen Prototypen.

## Interaktive Grundstücksplanung — Architekturstand Phase 3B.0

Die folgenden Anforderungen ergänzen die obigen Punkte. Sie werden im
Architekturauftrag nur spezifiziert; die Anwendung bleibt unverändert.
Technische Entscheidungen: [ARCHITECTURE.md](ARCHITECTURE.md).
Reihenfolge und Abnahme: [ROADMAP.md](ROADMAP.md).

- Beliebige Grundstückspolygone mit schrägen Kanten und Aussparungen;
  maßhaltige Meterkoordinaten ohne verpflichtende Rasterbindung.
- Frei editierbare Beetposition, Länge, Breite und Rotation; Wege, Hindernisse
  und nicht nutzbare Flächen sind eigene räumliche Objekte.
- **Neues Grundstück:** Grenze definieren, anschließend manuell planen oder
  ausdrücklich eine automatische Generierung aktivieren.
- **Bestehender Market Garden:** Beete, Wege und Gewächshäuser übernehmen;
  automatische räumliche Platzierung wird standardmäßig übersprungen.
- **Kombiniert:** Bestand schützen, ausgewählte freie Flächen mit neuen
  Generierungsvorschlägen ergänzen. Geschützte Objekte bleiben unverändert.
- Geometrieidentität, Belegung und Prognosen über stabile IDs und konkrete
  Planungsrevisionen verknüpfen. Eine lokale Änderung verändert nicht automatisch
  die Nachbargeometrie. Veraltete Prognosen sichtbar kennzeichnen.
- Gewächshäuser besitzen eigene Grundrisse und nutzbare Innenflächen;
  Innenbeete bleiben individuell bearbeitbar. Freiland und geschützter Anbau
  benötigen explizite Profile, keine erfundenen Ertrags-/Wachstumsfaktoren.
- Arbeitsstand und unveränderliche Bake-Varianten unterscheiden. Objektidentität
  über Varianten erhalten; neu duplizierte reale Objekte erhalten neue IDs.
- Technische 2D- und isometrische Ansicht verwenden dieselbe räumliche Wahrheit.
  Ein schräges Beet behält auch isometrisch seine tatsächliche Ausrichtung.
- Langfristige Gestaltung **Monochrome Living Landscape**: viel Weiß/Grau,
  wenige dezente Farbakzente, ruhige Landschafts-/Architekturmodell-Anmutung,
  inspiriert von Terra Nil; keine Spielmechanik oder daraus abgeleitete Kachelbindung.

Frühere Wünsche nach dezenter Pixel-Art bleiben erhalten: Pflanzenzeichen
können später diesen Stil nutzen, dürfen aber keine zweite Geometrie erzeugen.
