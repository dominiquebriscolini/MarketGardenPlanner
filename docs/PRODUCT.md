# Produkt — Zweck, Umfang und Weiterentwicklung

Stand der Übersicht: **17.11.2026**, vorhandener Arbeitsstand bis Phase 3C.2.
Diese Fortschreibung ordnet bestehende Anforderungen und Implementierungen ein;
sie trifft keine neuen Produktentscheidungen und gibt keine Entwicklung frei.

## Produktzweck und Arbeitsabläufe

Der Planner unterstützt die räumliche und saisonale Planung eines Market Gardens:
maßhaltige Beete und Grundstücke betrachten und bearbeiten, Kulturen zuordnen und
Berechnungen mit Herkunft, Zwischenwerten und Grenzen nachvollziehen.
Die Anwendung läuft zunächst lokal unter Windows; die Trennung von Python-Kern,
API und Darstellung hält späteren Webbetrieb offen (DEC-002).

Beschlossene Produktabläufe sind neue Grundstücke, die Übernahme bestehender
Gärten und eine Kombination aus geschütztem Bestand und ausdrücklich freigegebenen
Generierungsflächen (DEC-005). Diese Zielabläufe sind noch nicht vollständig
als Oberfläche verfügbar. Zusätzliche Zielgruppensegmente, Prioritäten oder
Erfolgskriterien werden hier nicht erfunden.

## Bestehende Funktionen

| Bereich | Nachweisbarer Umfang | Nachweis |
|---|---|---|
| Fachkern und Scheduler | Quellen-/Statusmodell, Bedarfsrechnung, Satzplanung, Belegung und Ernteereignisse; fehlende Daten bleiben fehlend | [Phase 1](phase1.md), [Phase 2](phase2.md), DEC-022/023 |
| Projektgeometrie | Ein metrisches Grundstückspolygon mit Löchern, frei rotierte Rechteckbeete, IDs, Revisionen, Sperren und Shapely-Validierung | [3B.1](phase3b1.md), DEC-003 bis DEC-008 |
| Speicherung/API | SQLite-Projekte, transaktionale Änderungen, erwartete Revision und Konfliktantworten | [3B.2](phase3b2.md), [3C.1](phase3c1.md), DEC-009/029 |
| Karte und Beeteditor | Projektwahl, Vollbildkarte, Zoom/Pan, Hover, Auswahl, Zeichnen, Verschieben, Rotation, numerische Maße/Position, bestätigtes Löschen | [3B.3a](phase3b3a.md), [3B.3b](phase3b3b.md), [3B.3c](phase3b3c.md), DEC-027/028 |
| Kulturplanung | Persistente Nutzereingaben mit Start und optional geplanter Ernte; kompakte Liste und informative Überschneidungsprüfung | [3C.1](phase3c1.md), DEC-029/030 |
| Projekt-Wochenansicht | Serverseitige ISO-Wochenprojektion, Folge-/gleichzeitige Kulturen und unklare Enden, ohne Ertrags- oder Wachstumsannahmen | [3C.2](phase3c2.md), DEC-031 |
| Demo | Getrennte synthetische Tagesansicht und schedulerbasierte Wochen-Ernteprognose; schreibgeschützt | [3A.2](phase3a2.md), [Ernteprognose](phase3a2-harvest.md) |

Geplante Ernte ist keine tatsächliche Ernte und kein Räumdatum. Die Projektansicht
zeigt zeitliche Planungsdaten; gespeicherte Projekte erhalten damit keine
automatisch berechneten Erntemengen. Fachliche Datenlücken stehen in
[agronomy-sources.md](agronomy-sources.md).

## Beschlossene Zukunftsziele — noch nicht vollständig umgesetzt

- Neue Grundstücke und vorhandene Gärten einschließlich Wegen, Hindernissen,
  Gewächshäusern und präziser manueller Bearbeitung unterstützen (DEC-004/005/016).
  Die bestehende Beetbearbeitung ist implementiert; feste Bezugskanten und
  weitere räumliche Objekte sind davon zu unterscheiden.
- Varianten sichern, duplizieren und fair vergleichen; Bake-Stände unveränderlich
  erhalten (DEC-014).
- Ausgewählte Flächen ausdrücklich generieren, Bestand schützen und einstellbare
  Maße sowie veränderbare Prioritäten für Fläche, Wegenetz und Zugänglichkeit
  berücksichtigen (DEC-011 bis DEC-015).
- Historische Erfahrungswerte und tatsächliche Ernten getrennt von Prognosen
  erfassen; spätere betriebliche Kalibrierung ermöglichen (DEC-024).
- Satelliten-/GIS-Import vorbereiten, ohne bereits einen Anbieter oder ein
  Importformat festzulegen (DEC-020/021).
- Technische 2D-Ansicht erhalten und eine spätere Landschaftsansicht derselben
  Geometrie ermöglichen: Monochrome Living Landscape, zurückhaltende Farben,
  lebendige Vegetation und Miniaturmodell-Anmutung (DEC-017 bis DEC-019/025).

Reihenfolge und verbleibender Umfang: [ROADMAP.md](ROADMAP.md).
Offene Ausgestaltung: [OPEN_QUESTIONS.md](OPEN_QUESTIONS.md).
Diese Ziele sind keine pauschale Implementierungsfreigabe.

## Vorschläge und unverbindliche Ideen

- TERRASTRA, TERRAMETRA und PARAMETRA bleiben Namenskandidaten (DEC-026).
- Renderer, Pflanzenassets und konkrete Tilt-Shift-/Pixel-Art-Ausgestaltung
  sind noch nicht ausgewählt (DEC-025).
- FastAPI/Pydantic, generierte TypeScript-Verträge und konkrete technische
  Snapshot-Entwürfe bleiben Optionen, soweit nicht bereits durch DEC-009
  oder spätere Beschlüsse entschieden.
- Das [Botanical ASCII Lab](../experiments/botanical-ascii-lab/README.md)
  liefert isolierte Studien. Lokale EXP-Entscheidungen ändern weder die
  Produktgestaltung noch den Integrationsumfang des Planners.

## Zukünftige Sammlung visueller, funktionaler und gestalterischer Vorstellungen

Dieser Abschnitt ist der vorgesehene Einstieg zur Sammlung der Vorstellungen
des Nutzers. Er enthält noch keine zusätzlichen Anforderungen oder erfundenen
Präferenzen. Vorhandene Referenzbilder unter `design/references/` bleiben
Quellenmaterial; ihre bloße Ablage ist kein verbindlicher Beschluss.

Künftige Beiträge werden in drei Bereiche eingeordnet:

| Bereich | Zu erfassender Inhalt |
|---|---|
| Visuell | Referenzen, Screenshots, gewünschte Bildwirkung und ausdrücklich benannte relevante Merkmale |
| Funktional | Gewünschter Arbeitsablauf, Situation und erwartetes Verhalten |
| Gestalterisch | Aussagen zu Typografie, Farbe, Informationshierarchie und Interaktion |

Pro Beitrag festhalten: Herkunft/Datum, möglichst unverfälschte Nutzerbeschreibung,
Referenz oder relativer Link, gewünschter Nutzen und Bezug zu bestehenden
DEC-/OQ-IDs. Kennzeichnung als **gesammelt / unverbindlich**, **zur Klärung**
oder **durch benannte Entscheidung beschlossen**. Eine Visualisierung oder
Interpretation von Codex ist ausdrücklich von einer Nutzervorgabe zu unterscheiden.

Offene Auslegung wird in [OPEN_QUESTIONS.md](OPEN_QUESTIONS.md) verlinkt.
Erst eine tatsächliche Entscheidung wird im [Entscheidungsprotokoll](DECISIONS.md)
festgehalten. Eine freigegebene Funktion erhält bei Bedarf eine kleine
Spezifikation unter `docs/features/`: Ziel, Umfang/Nichtumfang, Bedienregeln,
Daten-/API-Auswirkungen, Fehlerfälle, Abnahmekriterien und DEC-/OQ-Bezüge.
Der Ordner und einzelne Spezifikationen werden erst bei konkretem Bedarf angelegt;
bestehende Phasenberichte bleiben als Nachweise erhalten.

## Historische Produktanforderungen

Die folgende bisherige Fassung bleibt vollständig erhalten. Ihre Aussagen
„zukünftig“ und „in dieser Phase“ beziehen sich auf die jeweils genannten
historischen Aufträge; sie nehmen spätere Implementierungen nicht zurück.

<details>
<summary>Bisherige Produktdokumentation — historische Anforderungen und Fortschreibungen</summary>

# Produktanforderungen und spätere Entwicklung

## Aktueller Umfang

Fortschreibung Phase 3C.2: Gespeicherte Projekte besitzen nun eine serverseitig
abgeleitete ISO-Wochenansicht aus ihren eigenen Anbauabsichten. Geplante,
abgeschlossene, überlagerte und unklare Zeiträume werden ohne Wachstums-/Ertrags-
annahmen dargestellt; Demo und Projektdaten bleiben getrennt. Keine bestätigte
Ernte oder Räumung daraus ableiten. [Bedienung und Regeln](phase3c2.md), DEC-031.

Fortschreibung Phase 3C.1: Gespeicherte Projektbeete erhalten persistente,
manuell bearbeitbare Kulturabsichten aus dem bestehenden Python-Katalog:
Direktsaat/Pflanzung, Startdatum und optional geplante Ernte. Mehrere Vorgänge
je Beet, stabile IDs und klare Nutzereingabe-Kennzeichnung; keine abgeleiteten
Saisonphasen oder neuen Ernteprognosen. [Bedienung und Grenzen](phase3c1.md).
Die folgenden früheren Umfangsbeschreibungen bleiben als Historie erhalten.

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

</details>
