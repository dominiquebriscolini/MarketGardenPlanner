# Verbindliches Entscheidungsprotokoll

Erstfassung: **16.11.2026**. Dokumentationsstand: Phase 3B.3b,
Git-Stand `46db28f`. Dieses Protokoll wird vor jeder neuen Entwicklungsphase
gelesen und berücksichtigt. Es hält Produkt- und Architekturentscheidungen
fest; ein beschlossenes Zukunftsziel ist keine Implementierungsfreigabe.

Fortschreibung 16.11.2026: Phase 3B.3c ergänzt DEC-027 und konkretisiert damit
die bislang offenen präzisen Bearbeitungs- und Löschfunktionen aus DEC-010.
Die oben genannte Datierung der Erstfassung bleibt als Historie erhalten.

## Geltung, Quellen und Fortschreibung

- **beschlossen:** verbindlicher Grundsatz, ausdrücklich gewünschtes Produktziel
  oder durch die beauftragte Phase festgelegte technische Entscheidung.
- **vorgeschlagen:** dokumentierter Kandidat ohne endgültige Auswahl.
- **offen:** noch keine konkrete Entscheidung; bis zur Klärung keine Vorgabe
  oder vermeintlich beschlossene Standardeinstellung daraus ableiten.
- **Datum** bezeichnet bei übernommenen Einträgen die Erfassung am 16.11.2026.
  Ein eigenständiges früheres Beschlussdatum ist in den ausgewerteten Unterlagen
  nicht gesondert belegt und wird nicht erfunden. Phasendaten belegen den
  dokumentierten Umsetzungsstand, nicht zwingend den Zeitpunkt der Erstentscheidung.
- Angaben „Protokollauftrag“ beziehen sich auf den ausdrücklichen Nutzerauftrag
  „Dauerhaftes Entscheidungsprotokoll“ vom 16.11.2026. Dort erstmals ausdrücklich
  aufgeführte Anforderungen werden mit dieser Herkunft aufgenommen.
- Begründungen fassen die dokumentierten Ziele und technischen Zusammenhänge
  zusammen; sie sind keine nachträglich erfundenen wörtlichen Beschlüsse.

IDs bleiben dauerhaft stabil und werden nicht wiederverwendet. Neue Entscheidungen
werden mit der nächsten freien ID, Datum, Quelle, Status, Begründung und
Auswirkungen ergänzt. Eine Änderung bestehender Entscheidungen muss ausdrücklich
begründet werden und den bisherigen Inhalt, Änderungsdatum und ersetzenden
Beschluss nachvollziehbar erhalten. Kein stilles Umformulieren oder Löschen
beschlossener Anforderungen. Ein Statuswechsel wird mit Datum und Begründung
protokolliert; offene und vorgeschlagene Punkte werden nicht automatisch verbindlich.
Konkrete neue Nutzerentscheidungen werden vor der davon abhängigen Umsetzung
eingetragen; Änderungen an Produkt, Architektur und Roadmap werden abgeglichen.

Quellenbasis: [AGENTS.md](../AGENTS.md), [Produkt](PRODUCT.md),
[Architektur](ARCHITECTURE.md), [Roadmap](ROADMAP.md),
[Phase 1](phase1.md), [Phase 2](phase2.md), [Phase 3A.1](phase3a1.md),
[Phase 3A.2](phase3a2.md), [Ernteprognose](phase3a2-harvest.md),
[Phase 3B.1](phase3b1.md), [Phase 3B.2](phase3b2.md),
[Phase 3B.3a](phase3b3a.md), [Phase 3B.3b](phase3b3b.md) und Protokollauftrag.

## Grundarchitektur, Geometrie und Bearbeitung

### DEC-001 — Verbindliche Dokumentation und kleine Entwicklungsschritte

- **Datum:** 16.11.2026, Erfassung und ausdrücklicher Protokollauftrag.
- **Status:** beschlossen.
- **Entscheidung:** Vor jeder neuen Entwicklungsphase dieses Protokoll lesen
  und berücksichtigen. Neue Produkt- und Architekturentscheidungen dokumentieren;
  bestehende Entscheidungen nachvollziehbar fortschreiben. Kleine, überprüfbare
  Schritte, bestehende Funktionen und Tests erhalten. Keine Änderungen an externen
  Projekten oder Rhino-Konfigurationen; kein Git-Commit ohne ausdrücklichen Auftrag.
- **Begründung:** Dauerhafte Projektkontinuität benötigt auffindbare Entscheidungen
  und klar begrenzte, prüfbare Änderungen.
- **Auswirkungen:** Jede Phase prüft Entscheidungen, Umfang, Regressionen und
  Dokumentationsbedarf. Dieses Dokument allein beauftragt keine Funktionsentwicklung.
- **Quelle:** AGENTS.md und Protokollauftrag.

### DEC-002 — Python-Kern, React/TypeScript und SVG

- **Datum:** 16.11.2026, Erfassung; in Phase 3A.1 bis 3B.3b dokumentiert.
- **Status:** beschlossen.
- **Entscheidung:** Python bleibt Backend und Fachkern; React/TypeScript mit
  SVG trägt die technische 2D-Oberfläche. Die Anwendung läuft lokal unter Windows.
  Fachlogik, API, Speicherung und Darstellung bleiben getrennt, damit späterer
  Webbetrieb möglich bleibt. Rhino/Grasshopper sind optionale Adapter, keine Voraussetzung.
- **Begründung:** Bestehende Berechnungen und Datenverträge sollen für mehrere
  Oberflächen wiederverwendbar bleiben.
- **Auswirkungen:** Keine parallele JavaScript-Agronomie oder zweite Fachgeometrie.
  Öffentliche Bereitstellung, Authentisierung und Desktop-Paketierung sind noch
  gesondert zu entscheiden; der lokale Prototyp ist keine fertige öffentliche Web-API.
- **Quelle:** ARCHITECTURE.md, phase3a1.md, phase3b2.md; frühere Nutzeraufträge.

### DEC-003 — Ein metrischer Weltraum unabhängig von der Ansicht

- **Datum:** 16.11.2026, Erfassung; Geometrievertrag in Phase 3B.1 dokumentiert.
- **Status:** beschlossen.
- **Entscheidung:** Maßhaltige lokale Koordinaten in Metern, X nach Osten,
  Y nach Norden; Winkel gegen den Uhrzeigersinn. SVG- und spätere Projektions-
  bzw. Bildschirmkoordinaten bleiben abgeleitet. Kein verpflichtendes Raster,
  keine automatische Winkelrastung oder Rundung der gespeicherten Maße.
- **Begründung:** Präzise Planung und mehrere Darstellungen brauchen dieselben
  unveränderten geometrischen Eingaben.
- **Auswirkungen:** Zoom und Pan verändern nur die Kamera. Bearbeitung verwendet
  die inverse Transformation; Y-Spiegelung und Rotation sind ausdrücklich zu prüfen.
  Der aktuelle Leser akzeptiert Winkel in `[0,360)` und repariert sie nicht still.
- **Quelle:** AGENTS.md, ARCHITECTURE.md, phase3b1.md, phase3b3a.md, phase3b3b.md.

### DEC-004 — Freie Grundstücksformen und parametrische Rechteckbeete

- **Datum:** 16.11.2026, Erfassung; räumliches Modell seit Phase 3B.1 dokumentiert.
- **Status:** beschlossen.
- **Entscheidung:** Grundstücke als gültige Polygone mit beliebig schrägen Kanten
  und Löchern unterstützen. Rechteckbeete durch Mittelpunkt, Breite, Länge und
  freie Rotation beschreiben. Ecken und Fläche werden daraus abgeleitet.
- **Begründung:** Reale Grenzen und schräge Bestandsbeete passen nicht in ein
  verpflichtendes Kachel- oder Achsenraster.
- **Auswirkungen:** Schräglagen bleiben in 2D und späteren Ansichten erhalten.
  Aktuell ein Grundstück pro Geometriezustand; mehrere Grundstücke, Kurven und
  nichtrechteckige Beete benötigen eine spätere ausdrückliche Erweiterung.
- **Quelle:** PRODUCT.md, ARCHITECTURE.md, phase3b1.md; Protokollauftrag.

### DEC-005 — Neue Grundstücke, Bestand und kombinierte Planung

- **Datum:** 16.11.2026, Erfassung; als Produktabläufe in Phase 3B.0 dokumentiert.
- **Status:** beschlossen.
- **Entscheidung:** Neue Grundstücke und bestehende Market Gardens unterstützen.
  Nutzer können manuell planen sowie später automatische Flächenaufteilung
  ausdrücklich aktivieren. Bestand kann geschützt und ausschließlich auf
  ausgewählten freigegebenen Flächen ergänzt werden.
- **Begründung:** Bestehende Strukturen und neue Planungen benötigen unterschiedliche
  Ausgangspunkte, sollen aber im selben Projekt kombinierbar sein.
- **Auswirkungen:** Öffnen, Importieren und Scheduler-Aufrufe aktivieren keinen
  räumlichen Generator. Der automatische Teil bleibt ein zukünftiger eigener Dienst.
- **Quelle:** PRODUCT.md, ARCHITECTURE.md §6, ROADMAP.md; Protokollauftrag.

### DEC-006 — Sperren und lokale Änderungen respektieren

- **Datum:** 16.11.2026, Erfassung; Sperrfelder seit Phase 3B.1 dokumentiert.
- **Status:** beschlossen.
- **Entscheidung:** Geometriesperre und Generatorschutz getrennt führen.
  Geometrisch gesperrte Objekte bleiben unverändert. Ein Generator muss zusätzlich
  generatorgeschützten Bestand respektieren. Eine manuelle Änderung bewegt keine
  Nachbarn; Generatorschutz allein verbietet keine ausdrückliche manuelle Änderung.
- **Begründung:** Manuell eingepasster Bestand und bewusste Bearbeitung benötigen
  verlässliche, unterscheidbare Schutzregeln.
- **Auswirkungen:** Alle späteren Generator- und Gruppenbefehle müssen diese
  Regeln prüfen. Entsperren ist bewusst; die aktuelle Oberfläche bietet dafür
  noch kein Werkzeug. Keine stillschweigende Anpassung anderer Beetmaße.
- **Quelle:** AGENTS.md, phase3b1.md, phase3b2.md, phase3b3b.md; Protokollauftrag.

### DEC-007 — Zentrale Validierung ohne stillschweigende Reparatur

- **Datum:** 16.11.2026, Erfassung; umgesetzt in Phase 3B.1.
- **Status:** beschlossen.
- **Entscheidung:** Python-Geometriemodelle und Shapely prüfen Struktur, Polygon-
  validität, Beetüberschneidung und Grundstückseinschluss einschließlich Löchern.
  Ungültige Eingaben verständlich ablehnen. Keine stillen Reparaturen, Puffer,
  Raster-Snaps oder Nachbarverschiebungen.
- **Begründung:** Reparaturen können Maße und nutzbare Fläche unbemerkt verändern.
- **Auswirkungen:** Frontend-Vorschau ersetzt die zentrale Speicherprüfung nicht.
  Reine Kantenberührung ist im aktuellen Kern zulässig; numerische Flächenreste
  bis 1e-12 m² sind keine praktische Überstandserlaubnis. Erforderliche Pflegewege,
  Betriebsabstände und reale Messgenauigkeit sind zusätzlich zu spezifizieren.
- **Quelle:** phase3b1.md, phase3b2.md, phase3b3b.md; ARCHITECTURE.md §4.

### DEC-008 — Stabile Identitäten und revisionsgebundene Ableitungen

- **Datum:** 16.11.2026, Erfassung; konkretisiert in Phase 3B.1/3B.2.
- **Status:** beschlossen.
- **Entscheidung:** Objekt-UUIDs bleiben bei Lage-, Maß- und Namensänderungen
  erhalten. Objekt-, Geometrie- und Projektrevisionen sowie Geometrie-Token
  unterscheiden. Räumliche Objekte, saisonale Belegung und Prognosen getrennt
  halten und über IDs sowie konkrete Eingabestände verknüpfen.
- **Begründung:** Eine Geometrieänderung darf nicht unbemerkt mit einem älteren
  Berechnungsergebnis vermischt werden.
- **Auswirkungen:** Geänderte Eingaben müssen später als veraltete Prognose
  erkennbar sein. Keine automatische komplette Scheduler-Neubelegung. Aktuell
  sind Token vorhanden; gespeicherte Projekte besitzen noch keine zugeordneten
  Scheduler-Läufe oder vollständige Stale-Anzeige. Das reale Feld heißt `revision_id`.
- **Quelle:** AGENTS.md, ARCHITECTURE.md §5, phase3b1.md, phase3b2.md.

### DEC-009 — SQLite, bestehendes JSON und revisionssichere lokale API

- **Datum:** 16.11.2026, Erfassung; Entscheidung in Phase 3B.2 dokumentiert.
- **Status:** beschlossen.
- **Entscheidung:** SQLite hinter einem Repository speichert das bestehende
  validierte räumliche JSON. Versionierte Verträge, transaktionale Änderungen,
  erwartete Projektrevision und Konfliktantworten verwenden. Der lokale Python-
  Standardbibliothek-HTTP-Handler bleibt vorerst der Transport.
- **Begründung:** Die vorhandene kleine API benötigt keine parallele Geometrie-
  datenhaltung und derzeit kein zusätzliches Serverframework.
- **Auswirkungen:** Veraltete Änderungen überschreiben keinen neueren Stand.
  PUT/PATCH und der Beet-Anlegebefehl unterstützen wiederholbare Command-IDs;
  Projekterstellung ist davon zu unterscheiden. FastAPI/Pydantic bleibt eine
  spätere Option bei begründetem Bedarf, keine bereits beschlossene Migration.
- **Quelle:** phase3b2.md, phase3b3b.md; ARCHITECTURE.md §8/§9.

### DEC-010 — Aktueller Editor: Achsenzeichnung, Translation, bestätigte Übernahme

- **Datum:** 16.11.2026, Erfassung; umgesetzt in Phase 3B.3b.
- **Status:** beschlossen.
- **Entscheidung:** Zwei Längsachsenpunkte plus ausdrücklich eingegebene Breite
  definieren neue Rechteckbeete ohne Winkelrastung. Verschieben verändert nur
  den Mittelpunkt. Entwurf und bestätigter Bestand bleiben getrennt; Übernahme
  erst nach Validierung und erfolgreicher API-Antwort. Die Demo ist schreibgeschützt.
- **Begründung:** Ein kleiner Editor soll präzise und überprüfbar bleiben,
  ohne eine unbestätigte Mausbewegung als gespeichert darzustellen.
- **Auswirkungen:** Bei ungültiger Position, API-Fehler oder Konflikt bleibt
  die Vorschau getrennt. Nach verlorener Schreibantwort tatsächlichen Stand
  neu laden; kein behaupteter sicherer Rollback. Undo/Redo, Löschen, numerische
  Bearbeitung und spätere Zeichenwerkzeuge bleiben offen. Die anfängliche
  Eingabebreite 0,75 m ist keine agronomische Norm oder Generatorvorgabe.
- **Quelle:** phase3b3b.md und dessen beauftragter Umfang.

## Automatische Beetaufteilung und Varianten

### DEC-011 — Einstellbare Aufteilungsparameter

- **Datum:** 16.11.2026, durch den Protokollauftrag ausdrücklich festgehalten.
- **Status:** beschlossen.
- **Entscheidung:** Die zukünftige automatische Aufteilung erhält einstellbare
  Beetbreite, Wegbreite, Beetlänge und angestrebten Beetflächenanteil.
- **Begründung:** Flächenaufteilung muss an Betriebsweise, Raumangebot und
  Zugänglichkeit anpassbar sein.
- **Auswirkungen:** Parameter gehören zum nachvollziehbaren Variantenstand.
  Offen sind Wertebereiche, Standardwerte, Soll-/Mindest-/Höchstlängen, zulässige
  Abweichungen und der Nenner des Beetflächenanteils. Ein Zielanteil ist noch
  keine garantierte geometrische Machbarkeit. Kein Generator ist damit implementiert.
- **Quelle:** Protokollauftrag; grundsätzlich vorbereitet in ROADMAP.md Phase 3B.6.

### DEC-012 — Gleichrangige Ziele mit veränderbaren Nutzerprioritäten

- **Datum:** 16.11.2026, durch den Protokollauftrag ausdrücklich festgehalten.
- **Status:** beschlossen.
- **Entscheidung:** Nutzbare Beetfläche, effiziente Arbeitswege und praktische
  Zugänglichkeit sind gleichwertige Optimierungsziele. Nutzer können ihre
  Optimierungsprioritäten verändern.
- **Begründung:** Eine brauchbare Planung muss produktive Fläche und alltägliche
  Bewirtschaftung gemeinsam berücksichtigen.
- **Auswirkungen:** Zielkonflikte und Auswirkungen geänderter Prioritäten sichtbar
  machen. Fachliche Gleichrangigkeit legt noch keine numerische Zielfunktion,
  Normalisierung, Gewichtskoeffizienten oder Auswahlmethode fest; siehe DEC-015.
- **Quelle:** Protokollauftrag; bisherige Roadmap ließ Gütemaße ausdrücklich offen.

### DEC-013 — Arbeitswege über ein tatsächliches Wegenetz bewerten

- **Datum:** 16.11.2026, durch den Protokollauftrag ausdrücklich festgehalten.
- **Status:** beschlossen.
- **Entscheidung:** Arbeitswege anhand des nutzbaren Wegenetzes bewerten;
  geometrische Direktabstände allein reichen als Wegekennzahl nicht aus.
  Eingänge, Gewächshäuser und später weitere Betriebsstationen berücksichtigen.
- **Begründung:** Praktische Erreichbarkeit hängt von Verbindungen, Hindernissen
  und nutzbaren Zugängen ab.
- **Auswirkungen:** Wegegeometrie und Netzkonnektivität müssen vor belastbaren
  Optimierungsvergleichen vorliegen. Netzmodell, Beet-Zugangspunkte, Stationstypen,
  Arbeitsabläufe, Fahr-/Gehkosten und Kennzahlen sind noch offen. Ohne diese
  Eingaben keine vermeintlich gemessene Arbeitswegeeffizienz ausgeben.
- **Quelle:** Protokollauftrag; ARCHITECTURE.md §3/§8 unterscheidet Wegefläche
  und explizit definierte Mittellinienlänge, enthält aber noch keine Netzbewertung.

### DEC-014 — Mehrere Varianten vergleichen und mit Bake sichern

- **Datum:** 16.11.2026, Erfassung; Bake-Ziel seit PRODUCT.md/Phase 3B.0 dokumentiert,
  Mehrvarianten-Erzeugung im Protokollauftrag ausdrücklich bestätigt.
- **Status:** beschlossen.
- **Entscheidung:** Mehrere Planungsvorschläge erzeugen und nachvollziehbar
  vergleichen können. Bearbeitbarer Arbeitsstand und dauerhaft gesicherte,
  unveränderliche Bake-Varianten bleiben getrennt. Varianten duplizieren und
  als neuen Arbeitsstand weiterbearbeiten können.
- **Begründung:** Alternative Prioritäten und Flächenaufteilungen sollen
  überprüfbar bleiben, ohne frühere Planstände zu überschreiben.
- **Auswirkungen:** Geometrie, verfügbare Anbaufläche, Wege und vorhandene
  Ernteprognosen mit gleicher Vergleichsbasis ausweisen. Eingaben, Quellen,
  Revisionen und relevante Rechen-/Generatorstände nachvollziehbar sichern.
  Logische Objektidentitäten über Varianten erhalten. Fehlende/veraltete
  Prognosen sind kein Nullertrag. Bake ist noch nicht implementiert; die
  aktuelle SQLite-Projektspeicherung ersetzt keine Variantenverwaltung.
- **Quelle:** PRODUCT.md, ARCHITECTURE.md §8, ROADMAP.md Phase 3B.5/3B.6;
  Protokollauftrag.

### DEC-015 — Optimierungsverfahren und Bewertungsdefinitionen

- **Datum:** 16.11.2026, als offene Detailentscheidung erfasst.
- **Status:** offen.
- **Entscheidung:** Noch kein Optimierungsalgorithmus und keine endgültige
  Zielfunktion beschlossen. DEC-011 bis DEC-014 bestimmen die Produktziele.
- **Begründung:** Flächen-, Wege- und Zugänglichkeitswerte benötigen definierte
  Einheiten, Bezugsgrößen und harte Bedingungen, bevor Varianten fair bewertbar sind.
- **Auswirkungen:** Vor Umsetzung festlegen: Kennzahlen und Normalisierung,
  Prioritätenmodell und Standardprioritäten, Definition des Zielflächenanteils,
  Erreichbarkeits-/Breitenanforderungen, Umgang mit unverbundenen Flächen,
  Variantenanzahl, Reproduzierbarkeit, Abbruchkriterien und Rechenzeitbudget.
  Die Roadmap empfiehlt zuerst nachvollziehbare deterministische Vorschläge;
  dies ist keine mathematische Optimalitätsgarantie.
- **Quelle:** ROADMAP.md Phase 3B.6 und offene Gütemaße; Protokollauftrag.

## Gebäude, Darstellung und Import

### DEC-016 — Gewächshäuser als eigenständige räumliche Objekte

- **Datum:** 16.11.2026, Erfassung; Zielarchitektur in Phase 3B.0 dokumentiert.
- **Status:** beschlossen.
- **Entscheidung:** Gewächshaus-Grundriss, nutzbare Innenfläche und individuell
  bearbeitbare Innenbeete getrennt modellieren. Freiland und geschützter Anbau
  benötigen explizite, belegte Bedingungen und Profile.
- **Begründung:** Gebäude, Arbeitszugang und agronomische Eignung sind
  unterschiedliche Eigenschaften desselben Betriebs.
- **Auswirkungen:** Hierarchieabhängige Kollisionen und Flächenbilanzen prüfen;
  Gebäudehülle/Innenbeete nicht doppelt als Anbaufläche zählen. Keine pauschalen
  Wachstums- oder Ertragsfaktoren erfinden. Umsetzung, Stationseinbindung und
  gruppenübergreifende Saisonzuordnung bleiben zukünftige Arbeitspakete.
- **Quelle:** PRODUCT.md, ARCHITECTURE.md §7, ROADMAP.md Phase 3B.4; Protokollauftrag.

### DEC-017 — Monochrome Living Landscape und Miniaturmodell-Anmutung

- **Datum:** 16.11.2026, Erfassung; Monochrome Living Landscape zuvor dokumentiert,
  Tilt-Shift-/Miniaturmodell-Richtung im Protokollauftrag ausdrücklich ergänzt.
- **Status:** beschlossen.
- **Entscheidung:** Sachliche, hochwertige, reduzierte Gestaltung mit viel
  Weiß/Grau, zurückhaltenden Farbakzenten und lebendiger Vegetation.
  Tilt-Shift-/Miniaturmodell-Ästhetik ist eine gestalterische Richtung für die
  spätere Landschaftsansicht. Keine Spielmechanik oder unnötigen 3D-Effekte.
- **Begründung:** Präzise Planung und anschauliche saisonale Landschaft sollen
  eine ruhige, gut lesbare gemeinsame Gestaltung erhalten.
- **Auswirkungen:** Frühere Wünsche nach dezenter isometrischer Pflanzen-Pixel-Art
  bleiben berücksichtigt. Eine konkrete Kombination von Pixel-Art, Pflanzenassets,
  Tiefenwirkung und Miniaturmodell ist noch nicht spezifiziert. Der Stil ändert
  weder Fachgeometrie noch die Lesbarkeit technischer Angaben; siehe DEC-025.
- **Quelle:** AGENTS.md, PRODUCT.md, ARCHITECTURE.md §10; Protokollauftrag.

### DEC-018 — Technische 2D-Karte als dauerhafte Arbeitsansicht

- **Datum:** 16.11.2026, Erfassung; Map-first seit Phase 3A.2 dokumentiert.
- **Status:** beschlossen.
- **Entscheidung:** Technische, maßhaltige 2D-Ansicht erhalten. Die Karte füllt
  den Viewport; schwebende Werkzeuge, Saisonleiste und Detailpanel verändern
  ihren Ausschnitt nicht durch bloßes Öffnen. Beetnamen bleiben aufrecht lesbar;
  Projektbeet-Maße stehen im bestehenden Tooltip und im Detailpanel.
- **Begründung:** Präzise Bearbeitung und visuelle Kontrolle benötigen eine
  lesbare, stabile technische Ansicht.
- **Auswirkungen:** Spätere Landschaftsansichten ergänzen diese Ansicht.
  Datenfreie Projekte erhalten keine erfundenen Kulturen oder Erntemengen.
  Hover und Auswahl bleiben unabhängig; Zoom/Pan verändern keine Geometrie.
- **Quelle:** phase3a2.md, phase3a2-harvest.md, phase3b3a.md, phase3b3b.md;
  Nutzerauftrag zur Korrektur der Beetbeschriftungen; Protokollauftrag.

### DEC-019 — Perspektive/Isometrie als zukünftige Option derselben Geometrie

- **Datum:** 16.11.2026, Erfassung; isometrisches Ziel seit Phase 3B.0 dokumentiert,
  Perspektive als Option im Protokollauftrag bestätigt.
- **Status:** beschlossen.
- **Entscheidung:** Eine perspektivische oder isometrische Landschaftsansicht
  kann später dieselbe Weltgeometrie und dieselben Objektidentitäten projizieren.
  Frei rotierte Beete behalten ihre tatsächliche Orientierung.
- **Begründung:** Anschaulichkeit darf keine abweichende Planungsgeometrie erzeugen.
- **Auswirkungen:** Keine eigene Kachelgeometrie für die Landschaft. Welche
  Projektion und welcher Renderer tatsächlich umgesetzt werden, bleibt offen;
  die technische 2D-Ansicht ist davon unabhängig. Keine 3D-Implementierung durch
  dieses Protokoll freigegeben.
- **Quelle:** AGENTS.md, PRODUCT.md, ARCHITECTURE.md §10, ROADMAP.md Phase 3B.7;
  Protokollauftrag.

### DEC-020 — Satellitenkarten-/GIS-Import als zukünftiges Produktziel

- **Datum:** 16.11.2026, im Protokollauftrag ausdrücklich als Ziel festgehalten.
- **Status:** beschlossen.
- **Entscheidung:** Satellitenkarten-/GIS-Import für die Grundstücksplanung
  berücksichtigen. Er soll die Übernahme realer Grundstücke und Bestände unterstützen.
- **Begründung:** Vorhandene räumliche Informationen können Erfassung und
  Orientierung unterstützen.
- **Auswirkungen:** Bildhintergrund, importierte Vektorgeometrie und tatsächliche
  Vermessungsgenauigkeit unterscheiden und ihre Herkunft kenntlich machen.
  Bestehende Metergeometrie braucht einen ausdrücklich definierten Georeferenz-
  und Transformationsvertrag. Noch kein Importdienst oder Format implementiert.
- **Quelle:** Protokollauftrag; ARCHITECTURE.md §3 und ROADMAP.md lassen
  Fremdformate und Georeferenz bisher ausdrücklich offen.

### DEC-021 — Technische GIS-/Kartenauswahl

- **Datum:** 16.11.2026, als offene Detailentscheidung erfasst.
- **Status:** offen.
- **Entscheidung:** Noch keine Anbieter, Dienste, Importformate oder
  GIS-Bibliotheken ausgewählt.
- **Begründung:** Datenquellen und Genauigkeitsanforderungen sind noch nicht
  ausreichend spezifiziert.
- **Auswirkungen:** Koordinatenreferenzsysteme, Georeferenzierung, Formate,
  Bildmaßstab, zulässige Quellen/Nutzungsbedingungen, Offline-Verhalten,
  Importprüfung und Herkunfts-/Genauigkeitsangaben vor Umsetzung festlegen.
  Geografische Gradkoordinaten dürfen nicht als Meter interpretiert werden.
- **Quelle:** ARCHITECTURE.md §3, ROADMAP.md offene Entscheidungen; Protokollauftrag.

## Agronomie, Daten und Namensfindung

### DEC-022 — Saisonentwicklung und Ernteprognose aus dem Python-Scheduler

- **Datum:** 16.11.2026, Erfassung; Scheduler seit Phase 2 dokumentiert.
- **Status:** beschlossen.
- **Entscheidung:** Saisonale Pflanzenentwicklung, Belegung und agronomische
  Planung auf den bestehenden Python-Scheduler stützen. Der Saisonregler zeigt
  Aussaat, Wachstum, Ernte, Räumung und Folgekulturen aus diesen Ergebnissen.
  Die Ernteprognose verwendet ausschließlich Ernteereignisse der gewählten
  ISO-Kalenderwoche, gruppiert nach Kultur und Einheit.
- **Begründung:** Tageszustand eines Beets und Wochenmenge sind unterschiedliche
  Sichten auf denselben Plan.
- **Auswirkungen:** Keine erfundenen Frontend-Erträge oder Jahresmengen als
  Wochenprognose. kg und Stück getrennt halten. Sichtbares Wachstum ist zunächst
  eine schematische Planphase. Bei gespeicherten Projekten ohne Scheduler-Lauf
  bleiben Saisonfunktionen ausdrücklich als nicht verfügbar gekennzeichnet.
- **Quelle:** AGENTS.md, phase2.md, phase3a1.md, phase3a2-harvest.md,
  phase3b3a.md, phase3b3b.md; Protokollauftrag.

### DEC-023 — Echte Daten, Schätzungen und Demo-Daten unterscheiden

- **Datum:** 16.11.2026, Erfassung; Herkunftsvertrag seit Phase 1 dokumentiert.
- **Status:** beschlossen.
- **Entscheidung:** Agronomische Eingaben mit Wert, Einheit, Quelle und Status
  führen. Gemessene/belegte Daten, Planungsannahmen bzw. Schätzungen und
  synthetische Demo-/Testdaten klar unterscheiden. Fehlende Werte bleiben
  fehlend; Berechnungen mit Zwischenergebnissen nachvollziehbar halten.
- **Begründung:** Präzise Geometrie macht ungesicherte Ertragsannahmen nicht
  automatisch zu verlässlichen agronomischen Daten.
- **Auswirkungen:** Keine erfundenen Ersatzwerte oder stillen Übernahmen aus
  anderen Standorten/Methoden. Quellenstatus ist kein automatischer Beweis.
  Manuelle Eingriffe müssen künftig Herkunft und Ergebnisbezug erhalten;
  vollständige Eingabe-/Kulturplanung ist noch kein vorhandener UI-Umfang.
  Synthetische Fixtures bleiben von produktiven Kulturdaten getrennt.
- **Quelle:** AGENTS.md, phase1.md, phase2.md, PRODUCT.md; Protokollauftrag.

### DEC-024 — Historische Erträge und spätere betriebliche Kalibrierung

- **Datum:** 16.11.2026, Erfassung; Produktziel vor Phase 3B.0 dokumentiert.
- **Status:** beschlossen.
- **Entscheidung:** Nutzer sollen eigene historische Ertragswerte erfassen
  können. Prognosen, historische Erfahrungswerte und tatsächliche Ernten
  getrennt speichern und Kultur, Sorte, Beet sowie Anbaujahr zuordnen.
- **Begründung:** Betriebserfahrung soll auswertbar werden, ohne Erwartung,
  beobachtete Ernte und Modellannahme zu vermischen.
- **Auswirkungen:** Kalibrierung mit betriebseigenen Daten ist eine spätere
  Möglichkeit. Verfahren, erforderliche Datengrundlage, Qualitätsregeln und
  Benutzeroberfläche bleiben offen. Keine automatische Überschreibung des
  Katalogs oder pauschale Übertragung vergangener Erträge.
- **Quelle:** PRODUCT.md, ROADMAP.md „Historische Erträge“; Protokollauftrag.

### DEC-025 — Konkrete Landschaftsdarstellung und Pflanzenassets

- **Datum:** 16.11.2026, als offene Detailentscheidung erfasst.
- **Status:** offen.
- **Entscheidung:** Noch kein Renderer, keine Asset-Pipeline und keine konkrete
  technische Umsetzung der Tilt-Shift-/Pixel-Art-/Miniaturmodell-Richtung ausgewählt.
- **Begründung:** Die gestalterische Richtung DEC-017 und geometrischen Regeln
  DEC-018/DEC-019 reichen noch nicht als Implementierungsspezifikation.
- **Auswirkungen:** Projektion, Pflanzenzeichen, Wachstumsdarstellung,
  Verdeckung, Lesbarkeit, Leistung und Export vor Umsetzung prüfen. Neue
  Bibliotheken nur bei nachgewiesenem Bedarf; die Metergeometrie bleibt maßgeblich.
- **Quelle:** ROADMAP.md Phase 3B.7 und offene Asset-/Renderingentscheidung;
  Protokollauftrag.

### DEC-026 — Namenskandidaten

- **Datum:** 16.11.2026, im Protokollauftrag dokumentiert; frühere Datierung unbekannt.
- **Status:** vorgeschlagen.
- **Entscheidung:** **TERRASTRA**, **TERRAMETRA** und **PARAMETRA** als
  gleichberechtigte Namenskandidaten festhalten. Keine endgültige Namenswahl.
- **Begründung:** Die Kandidaten sollen dauerhaft auffindbar bleiben, ohne eine
  bereits erfolgte Marken- oder Produktentscheidung vorzutäuschen.
- **Auswirkungen:** Bestehenden Projekt-/Paketnamen nicht aufgrund dieser Liste
  ändern. Auswahlkriterien, endgültiger Name und Verfügbarkeit der Namen/Domains
  sind offen und wurden in diesem Auftrag nicht geprüft.
- **Quelle:** Protokollauftrag.

### DEC-027 — Präzise Beetänderungen und bestätigte Einzel-Löschung

- **Datum:** 16.11.2026, ausdrücklicher Nutzerauftrag Phase 3B.3c.
- **Status:** beschlossen.
- **Entscheidung:** Numerische Mittelpunkt-, Maß- und Winkeleingaben sowie
  ein Rotationsgriff ergänzen den Editor. Rotation und Größenänderung erfolgen
  standardmäßig um den Mittelpunkt, ohne Raster. Ein expliziter Mittelpunkt-
  Ankervertrag bereitet spätere feste Bezugskanten vor; diese werden hier noch
  nicht als neue Bedienfunktion eingeführt. Einzelne ungesperrte Beete können
  nach Bestätigung gelöscht werden, auch über Entf außerhalb von Eingabefeldern.
- **Begründung:** Präzise Bearbeitung braucht unabhängige geometrische Operationen,
  eine eindeutige Bezugslage und Schutz vor versehentlicher Löschung.
- **Auswirkungen:** Der bisherige Vorschau-/Bestätigungsablauf bleibt erhalten.
  Änderungen nutzen PATCH; ein eigener DELETE-Befehl prüft Sperre und erwartete
  Projektrevision in derselben Transaktion. Die ID eines gelöschten Beets wird
  im dauerhaften Änderungsbeleg vermerkt und darf im selben Projekt nicht neu
  vergeben werden. Dafür bleiben bestehendes JSON- und SQLite-Schema erhalten.
  Kein Undo/Redo und keine automatische Beetaufteilung in dieser Phase.
- **Quelle:** Nutzerauftrag Phase 3B.3c; DEC-003/006/007/008/009/010;
  [Umsetzung und Grenzen](phase3b3c.md).

Fortschreibung zu DEC-010: Die dort für den Stand 3B.3b als offen bezeichneten
numerischen Bearbeitungs- und Löschfunktionen werden durch diesen ausdrücklichen
Auftrag konkretisiert. Die ursprüngliche Beschreibung bleibt als Verlauf erhalten;
Zeichnen, Translation und bestätigte Übernahme gelten unverändert weiter.

### DEC-028 — Kompakte Anzeige und ausdrückliches Shift-Snapping

- **Datum:** 16.11.2026, Nutzerauftrag UI-Feinschliff zu Phase 3B.3c.
- **Status:** beschlossen.
- **Entscheidung:** Geometrische Zahlen im Ruhezustand mit höchstens zwei
  Nachkommastellen anzeigen, vollständige Werte intern erhalten. Erst eine
  tatsächliche Eingabe verändert den numerischen Entwurf; Fokus, Anzeige oder
  Auswahl runden keine Fachwerte. Während einer ausdrücklich eingegebenen
  präzisen Zahl darf der aktive Eingabetext vollständig sichtbar bleiben;
  beim Verlassen des Felds wird wieder nur die Anzeige kompakt formatiert.
  Griffrotation bleibt frei; ausschließlich mit gedrückter Shift-Taste gilt
  ein 15°-Winkelraster. Shift loslassen stellt sofort den freien Winkel an
  derselben Mausposition wieder her. Während des Drehens den Winkel anzeigen.
- **Begründung:** Lesbarkeit soll die geometrische Genauigkeit bewahren;
  bewusstes Fangverhalten unterstützt präzise Ausrichtungen ohne Rasterpflicht.
- **Auswirkungen:** DEC-003 und DEC-027 bleiben für die Fachgeometrie und freie
  Standardrotation erhalten. Das optionale Raster ist eine ausdrückliche
  Bedienaktion. Vorschau, Python-Validierung und API-Bestätigung bleiben maßgeblich.
- **Quelle:** Nutzerauftrag „Phase 3B.3c: UI-Feinschliff“; phase3b3c.md.

## Konsistenzprüfung und aktuelle Grenzen

Die Grundsätze sind mit Produkt, Architektur und Phasenabnahmen vereinbar.
Für die weitere Arbeit sind folgende historische bzw. noch offene Stellen
ausdrücklich zu unterscheiden:

| Dokumentationsstelle | Einordnung für künftige Phasen |
|---|---|
| PRODUCT.md „Aktueller Umfang“ nennt noch 3A.2/3B.1; ältere Phasen nennen keinen Editor oder keine Speicherung. | Historischer Stand, keine Rücknahme von 3B.2/3B.3a/3B.3b. Die jeweiligen neueren Phasen beschreiben Persistenz, Projektansicht und Editor. |
| ARCHITECTURE.md enthält ursprüngliche Vorschläge zu FastAPI, Projektdateien und API-Befehlen; der Bibliotheksabsatz nennt noch „später sqlite3“. | DEC-009 und phase3b2.md dokumentieren die konkret gewählte SQLite-/Standardbibliothek-Lösung. Die früheren Empfehlungen sind keine Pflichtmigration. |
| ROADMAP.md führt Shapely-Version und Speichervertrag teilweise noch unter offenen Entscheidungen. | Phase 3B.1 legt Shapely 2.1.2 fest; Phase 3B.2 konkretisiert SQLite und JSON. Allgemeine Messgenauigkeit und künftige Anforderungen bleiben davon getrennt offen. |
| Architekturentwurf nennt `object_revision_id`; reale Modelle verwenden `revision_id`. | DEC-008 und phase3b1.md maßgeblich für den aktuellen Vertrag. Keine stille Umbenennung bestehender Daten. |
| Varianten-/Snapshot-Schema in ARCHITECTURE.md ist ein Vorschlag. | Bake ist Produktziel gemäß DEC-014; die dort skizzierten Tabellen/Objekte sind keine bereits implementierte oder endgültig festgelegte Datenbankmigration. |
| Netzbasierte Wegeoptimierung, genaue Aufteilungsparameter und veränderbare Prioritäten fehlen bisher als konkrete Spezifikation. | Jetzt als Produktziele DEC-011 bis DEC-013 dokumentiert; Bewertungsformeln, Netzmodell und Algorithmus bleiben nach DEC-015 offen. |
| Satelliten/GIS, Tilt-Shift und Namenskandidaten sind bisher nicht entsprechend ausgearbeitet. | Herkunft ist der aktuelle Protokollauftrag, kein erfundenes früheres Beschlussdatum. Technische Auswahl bzw. Namenswahl bleibt offen. |
| Monochrome Living Landscape, dezente Pixel-Art und Miniaturmodell-Richtung. | Gemeinsame gestalterische Ziele; noch keine endgültige Asset-/Rendererentscheidung. Keine Spielästhetik und keine geometrische Kachelbindung daraus ableiten. |
| Technische Planung, zukünftiger Generator und heutiger saisonaler Scheduler. | Getrennte Verantwortungen. Saisonale Erstbelegung ist keine automatische räumliche Beetoptimierung. |

Die vorhandenen Phasendokumente bleiben als historische Abnahmeprotokolle
erhalten. Ihre Testzahlen sind zeitbezogen; der zuletzt dokumentierte Stand
3B.3b nennt 87 Python- und 36 Frontend-Tests. Für diesen reinen Dokumentations-
auftrag wurden keine Anwendungstests, Builds oder Funktionen geändert.

### Offene Entscheidungen vor den jeweiligen Umsetzungsschritten

- **Generator und Vergleich (DEC-011 bis DEC-015):** Parametergrenzen,
  Flächenanteilsdefinition, Netz-/Zugänglichkeitsmodell, messbare Ziele,
  Normalisierung, Nutzerprioritäten, Algorithmus und reproduzierbare Varianten.
- **Bake (DEC-014):** endgültiger Speicher-/Snapshot-Vertrag, Vergleichskennzahlen
  und Benutzerablauf; unveränderliche Varianten sind als Grundsatz beschlossen.
- **Editor/Gewächshäuser (DEC-010/DEC-016):** verbleibende Werkzeuge,
  Undo/Redo-/Gruppenregeln und konkrete Umgebungszuordnung im Scheduler.
- **Import (DEC-020/DEC-021):** Datenquellen, Formate, Georeferenz, Genauigkeit
  und Transformations-/Importregeln.
- **Agronomie (DEC-008/DEC-022 bis DEC-024):** belastbare lokale Profile,
  gespeicherte Saisonläufe/Stale-UI sowie Datengrundlage und Kalibrierungsverfahren.
- **Darstellung (DEC-017/DEC-019/DEC-025):** Projektion, Renderer,
  Tilt-Shift-/Pixel-Art-Ausgestaltung und Pflanzenassets.
- **Name (DEC-026):** endgültige Wahl und separate Verfügbarkeitsprüfung.
- **Bereitstellung (DEC-002/DEC-009):** Desktop-Paketierung bzw. öffentlicher
  Webbetrieb und dessen zusätzliche technische Anforderungen.

### DEC-029 — Persistente Kulturabsichten ohne erfundene Saisonwerte

- **Datum:** 16.11.2026, Nutzerauftrag Phase 3C.1.
- **Status:** beschlossen.
- **Entscheidung:** Projektbezogene Anbauvorgänge erhalten eigene stabile UUIDs,
  Revisionen und Beet-/Katalogprofilreferenzen. Startdatum bezeichnet bei
  Direktsaat die Aussaat ins Beet, bei Pflanzung das Pflanzen ins Beet; ein
  optionales geplantes Erntedatum ist eine Nutzereingabe, kein Rechenergebnis.
  Die Profil-Anbauart muss passen. Geometriesperren sperren nur Geometrie.
- **Begründung:** Der vorhandene Scheduler plant aus Zielen und vollständigen
  Saisonprofilen; er bildet manuelle Beetzuweisungen bisher nicht direkt ab.
  Eine Eingabe ist daher kein Scheduler-Lauf und keine belastbare Prognose.
- **Auswirkungen:** SQLite-Schema 2 ergänzt einen getrennten, versionierten
  Kulturplan je Projekt, mit transaktionaler Migration aus Schema 1. Kultur-
  änderungen erhöhen Projekt-/Kulturplanrevision, erhalten Geometrie und Token.
  Alle Schreiboperationen teilen die erwartete Projektrevision. Beete mit
  Anbauvorgängen dürfen erst nach deren ausdrücklicher Entfernung gelöscht
  werden; keine versteckte Kaskade. Keine Demo-Erträge, automatische Termine,
  Belegungsdauer, Konfliktfreiheit der Kulturfolge oder Scheduler-Neuberechnung
  behaupten. Geplantes Erntedatum ist ausdrücklich kein Räumdatum.
- **Offen:** Belegungsintervalle/Räumung, reale Saisonprofile, Run-/Intent-
  Zuordnung, Sorten außerhalb des Katalogs, historische und tatsächliche Ernten.
  Diese bleiben spätere, getrennte Datensätze gemäß DEC-008/022–024.

### DEC-030 — Informative Datumsüberschneidungen und kompakte Beetplanung

- **Datum:** 17.11.2026, Nutzerauftrag Kulturplanung UX und Überschneidungen.
- **Status:** beschlossen.
- **Entscheidung:** Die Oberfläche zeigt kompakte Vorgangszeilen und einklappbare
  Geometrie-/Herkunftsangaben. Eine rein lesende Python-Prüfung vergleicht bekannte
  Planungsabschnitte vom Start bis einschließlich geplanter Ernte auf demselben
  Beet. Gleicher Starttag ist auch ohne Erntedatum eine bekannte Gemeinsamkeit.
  Fehlt das Ende eines früher gestarteten Vorgangs, ist eine spätere mögliche
  Überschneidung unklar, nicht automatisch vorhanden oder ausgeschlossen.
- **Begründung:** Nutzer sollen Terminkonflikte sehen, ohne Mischkulturen zu
  verbieten oder fehlende Zeitspannen zu erfinden. Der Erntetag ist kein Räumtag.
- **Auswirkungen:** Vorhandene Datumsvalidierung und `DateWindow.overlaps` werden
  wiederverwendet; inklusive Planungstage werden nur für den Vergleich in
  halboffene Intervalle übersetzt. Ergebnisse nennen betroffene Vorgangs-IDs und
  bekannte gemeinsame Tage. Prüfung auch für gültige Formularentwürfe, ohne
  SQLite-Schreibzugriff oder neue Persistenzfelder. Keine Terminänderungen,
  Speicherverbote, Prognosen oder Aussage über tatsächliche Beetverfügbarkeit
  nach einer Ernte. DEC-029 bleibt erhalten; die dort noch nicht implementierte
  Datumsprüfung wird hier ausdrücklich als informativer Vergleich ergänzt.
- **Offen:** Tatsächliche Belegungs-/Räumintervalle, Mischkulturverträglichkeit,
  Teilbeetbelegung und Scheduler-Integration bleiben spätere Aufgaben.

## Änderungsverlauf

| Datum | Änderung | Grundlage |
|---|---|---|
| 16.11.2026 | Erstfassung DEC-001 bis DEC-026; historische Einordnung und offene Details aufgenommen. | Bestehende Dokumentation und ausdrücklicher Auftrag zum dauerhaften Entscheidungsprotokoll. Keine neuen Funktionen, kein Git-Commit. |
| 16.11.2026 | DEC-027 ergänzt; Bezug zu den bislang offenen Editorfunktionen in DEC-010 ausdrücklich fortgeschrieben. | Nutzerauftrag Phase 3B.3c; Mittelpunkt-Anker und revisionssichere Einzel-Löschung mit dauerhafter ID-Sperre. |
| 16.11.2026 | DEC-028 ergänzt: kompakte Anzeige ohne Verlust interner Präzision und optionales Shift-Winkelraster. | Ausdrücklicher UI-Feinschliff-Auftrag; keine Änderung der Standardrotation oder Fachgeometrie. |
| 16.11.2026 | DEC-029 ergänzt: persistente Nutzereingaben zur Kulturplanung, Schema-2-Migration und Löschschutz zugewiesener Beete. | Phase 3C.1; vorhandener Katalog, getrennte Geometrie und keine neuen Agronomieannahmen. |
| 17.11.2026 | DEC-030 ergänzt: kompakte Planung und informative, Python-basierte Datumsprüfung einschließlich unklarer Zeiträume. | Ausdrücklicher UX-/Überschneidungsauftrag vor Phase 3C.2; keine Speicherblockade. |
