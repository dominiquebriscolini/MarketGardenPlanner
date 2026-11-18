# Verbindliches Entscheidungsprotokoll

> Dokumentationspflege **17.11.2026**: Der aktuelle Arbeitsstand reicht bis
> Phase 3C.2 einschließlich UX-Nachtrag DEC-032; die unten genannten Erstfassungsstände und die damalige
> Konsistenzprüfung bleiben historische Nachweise. Die aktuellen Übersichten
> stehen in [PRODUCT](PRODUCT.md), [ARCHITECTURE](ARCHITECTURE.md) und
> [ROADMAP](ROADMAP.md). Offene Details und überholte Offen-Punkte werden in
> [OPEN_QUESTIONS](OPEN_QUESTIONS.md) konsolidiert.
> Diese Ergänzung und stabile Linkanker ändern keine DEC-ID, keinen Beschluss
> und keine frühere Begründung. Es wird keine neue Produktentscheidung getroffen.



Erstfassung: **16.11.2026**. Dokumentationsstand: Phase 3B.3b,
Git-Stand `46db28f`. Dieses Protokoll wird vor jeder neuen Entwicklungsphase
gelesen und berücksichtigt. Es hält Produkt- und Architekturentscheidungen
fest; ein beschlossenes Zukunftsziel ist keine Implementierungsfreigabe.

Fortschreibung 16.11.2026: Phase 3B.3c ergänzt DEC-027 und konkretisiert damit
die bislang offenen präzisen Bearbeitungs- und Löschfunktionen aus DEC-010.
Die oben genannte Datierung der Erstfassung bleibt als Historie erhalten.

Dokumentationsabgleich 17.11.2026: [H-/HF-Zuordnungen und Nachweisgrenzen](history/HISTORISCHER_ABGLEICH_2026-11-17.md).
Die 3C.2-Basis ist in `20e6a63` gesichert, DEC-032 liegt noch nicht eingecheckt
vor. ASCII/Halftone versus Pixel-Art bleibt ausdrücklich ungeklärter
Entscheidungsbedarf unter OQ-019/020; DEC-017 und DEC-025 bleiben unverändert.
Dieser Hinweis ändert keinen Beschluss und erzeugt keine neue ID.

Fortschreibung 18.11.2026: [DEC-033](#dec-033) beschließt zwei komplementäre
Gartenansichten als Produktziel und konkretisiert DEC-019. Die Implementierung
ist nicht freigegeben.

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

<a id="dec-001"></a>

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

<a id="dec-002"></a>

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

<a id="dec-003"></a>

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

<a id="dec-004"></a>

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

<a id="dec-005"></a>

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

<a id="dec-006"></a>

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

<a id="dec-007"></a>

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

<a id="dec-008"></a>

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

<a id="dec-009"></a>

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

<a id="dec-010"></a>

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

<a id="dec-011"></a>

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

<a id="dec-012"></a>

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

<a id="dec-013"></a>

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

<a id="dec-014"></a>

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

<a id="dec-015"></a>

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

<a id="dec-016"></a>

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

<a id="dec-017"></a>

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

<a id="dec-018"></a>

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

<a id="dec-019"></a>

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

- **Fortschreibung 18.11.2026:** [DEC-033](#dec-033) konkretisiert die bisherige
  Darstellungsoption als isometrischen Informations- und Saisonmodus neben der
  2D-SVG-Arbeitsansicht. Anlass ist die vom Nutzer bestätigte Aufgabenteilung
  für beide Ansichten. Die gemeinsame Weltgeometrie und die tatsächlichen
  Beetausrichtungen gelten weiter. Die konkrete Projektion bleibt offen.

<a id="dec-020"></a>

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

<a id="dec-021"></a>

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

<a id="dec-022"></a>

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

<a id="dec-023"></a>

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

<a id="dec-024"></a>

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

<a id="dec-025"></a>

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

<a id="dec-026"></a>

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

<a id="dec-027"></a>

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

<a id="dec-028"></a>

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

Fortschreibung 18.11.2026: [DEC-036](#dec-036) verlegt die numerische
Winkelanzeige aus der Karte und der Drehgeste in die Beetplanung.
Anlass ist der Wunsch nach einer aufgeräumten Beschriftung.
Griffrotation und Shift-Raster bleiben erhalten.

Fortschreibung 18.11.2026: [DEC-041](#dec-041) übernimmt das ausdrückliche
Shift-Raster für das Zeichnen neuer Beete. Anlass ist der Wunsch,
Beete bereits beim Anlegen in 15°-Schritten auszurichten.

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

<a id="dec-029"></a>

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

<a id="dec-030"></a>

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

<a id="dec-031"></a>

### DEC-031 — Revisionsgebundene ISO-Wochenansicht aus Kulturabsichten

- **Datum:** 17.11.2026, Nutzerauftrag Phase 3C.2.
- **Status:** beschlossen.
- **Entscheidung:** Python projiziert gespeicherte Anbauabsichten auf ISO-Wochen
  (Montag bis Sonntag, ISO-Jahr einschließlich 52/53 und Jahreswechsel).
  Ein bekannter Planungstag genügt für Sichtbarkeit in der Woche. Start bis
  geplante Ernte zählen inklusive; danach ist der Vorgang nur nach Plan beendet,
  nicht als tatsächlich geerntet oder geräumt bestätigt. Ohne Ernte ist nur der
  Starttag sicher bekannt, später bleibt die mögliche Fortdauer ausdrücklich offen.
- **Begründung:** Zeitliche Planungsansicht benötigt weder erfundene Saisonprofile
  noch einen zweiten Allocator. `DateWindow`, Kalenderhilfen und DEC-030 werden
  wiederverwendet; der bestehende agronomische Scheduler bleibt unverändert.
- **Auswirkungen:** Rein lesende Jahresprojektion mit Projekt-/Kulturplanrevision
  und Geometrie-Token; Frontend zeigt ausschließlich passende Antworten.
  Wochenwechsel innerhalb eines geladenen ISO-Jahres benötigt keinen neuen Abruf.
  Gleichzeitige bekannte Tage sind Überlagerung; mehrere nacheinander aktive
  Vorgänge derselben Woche sind Folgekulturen. Unklare mögliche Überlagerungen
  werden davon getrennt. Bei API-Fehler kein vermeintlich freies Beet anzeigen.
  Auswahl von ISO-Jahr/Woche ist eine lokale, projektbezogene Ansichtspräferenz
  im Sitzungsspeicher, keine Änderung der SQLite-Daten oder Fachrevisionen.
- **Grenzen:** Keine Prognose, Wachstumssimulation, Ist-Ernte, Räumung,
  automatische Planung oder Botanical-ASCII-Lab-Integration. Bestehende
  Demo-Tagesansicht und deren Scheduler-Ergebnisse bleiben getrennt erhalten.

<a id="dec-032"></a>

### DEC-032 — Eindeutiger Bearbeitungskontext eines Anbauvorgangs

- **Datum:** 17.11.2026, ausdrücklicher UX-Auftrag zu Phase 3C.2.
- **Status:** beschlossen.
- **Entscheidung:** Die aktuell bearbeitete Kulturzeile erhält einen dezenten
  salbeigrünen Hintergrund und eine schmale Akzentlinie. Formularüberschrift
  und Hervorhebung beziehen sich auf dieselbe stabile Vorgangs-ID. Die Überschrift
  benennt die gespeicherte Kultur; Anbauart und gespeichertes Startdatum stehen
  als kleinere Zusatzinformation darunter. Neue Vorgänge heißen „Kultur hinzufügen“.
- **Begründung:** Auch mehrere Vorgänge derselben Kultur müssen beim Bearbeiten
  eindeutig unterscheidbar bleiben. Ein ungespeicherter Formularentwurf darf
  nicht die Identität des ausgewählten bestehenden Vorgangs verschleiern.
- **Auswirkungen:** Wechseln aktualisiert den Kontext unmittelbar, erfolgreiches
  Speichern oder Abbrechen entfernt ihn. Formularwerte, Validierung, Speicher-
  vertrag, Geometrie und Saisonregler bleiben unverändert. Keine neuen permanenten
  Bedienelemente und keine Änderung an den fachlichen Regeln aus DEC-029 bis DEC-031.
- **Quelle:** Nutzerauftrag „Phase 3C.2: Eindeutige Hervorhebung beim Bearbeiten
  von Anbauvorgängen“; [UX-Fortschreibung](phase3c2.md).

Fortschreibung 18.11.2026: [DEC-038](#dec-038) ersetzt den Abschluss des
Bearbeitungskontexts bei erfolgreicher Speicherung. Automatische Speicherung
lässt den Eintrag geöffnet. „Fertig“ beendet den Bearbeitungskontext.

<a id="dec-033"></a>

### DEC-033 — Zwei komplementäre Gartenansichten auf gemeinsamer Datenbasis

- **Datum:** 18.11.2026.
- **Status:** beschlossen am 18.11.2026. Implementierung nicht freigegeben.
- **Entscheidung:**
  - Die 2D-SVG-Draufsicht bleibt der geometrische Planungs- und Bearbeitungsmodus.
    Sie stellt keine einzelnen Pflanzen grafisch dar.
  - Die Isometrie ist als zweiter Gartenmodus für Information und saisonale
    Visualisierung vorgesehen. Beete können ausgewählt und Informationen
    angezeigt werden. Geometrische Änderungen sind der 2D-Draufsicht vorbehalten.
  - Beide Ansichten verwenden dieselben Garten-, Beet-, Kultur- und Saisondaten
    einschließlich gemeinsamer Beetauswahl und Saisonposition. Die metrische
    Weltgeometrie und die Objektidentitäten gelten ansichtsübergreifend.
  - In der Isometrie bleiben Pflanzreihen erkennbar. Pflanzensymbole werden
    abhängig von der Reihenlänge abstrahiert dargestellt. Grafische Symbolzahl
    und Symbolabstand sind von den tatsächlichen agronomischen Pflanzenzahlen
    und Pflanzabständen zu unterscheiden.
- **Begründung:** Die Draufsicht dient der präzisen Planung. Die Isometrie macht
  die saisonale Entwicklung desselben Gartens anschaulich. Gemeinsame
  Beetauswahl und Saisonposition erhalten beim Wechsel den Betrachtungskontext.
- **Auswirkungen:** Agronomische Berechnungen bleiben unverändert. Der
  Python-Scheduler bleibt gemäß [DEC-022](#dec-022) die fachliche Quelle für
  Saison- und Belegungszustände. Technische Zustandsverwaltung, konkrete
  Projektion, Renderer und Asset-Pipeline bleiben offen. Die Ausgestaltung
  wird unter [OQ-019](OPEN_QUESTIONS.md#oq-019) geführt, ergänzend zu
  [DEC-025](#dec-025).
- **Quelle:** Ausdrückliche Nutzerbestätigung im Auftrag „DEC-033: Zwei
  Gartenansichten dokumentieren“ vom 18.11.2026. Fortschreibung von
  [DEC-019](#dec-019) auf Grundlage von [DEC-003](#dec-003),
  [DEC-008](#dec-008), [DEC-017](#dec-017) und [DEC-018](#dec-018).

Fortschreibung 18.11.2026: [DEC-037](#dec-037) ordnet die
Kulturbearbeitung dem isometrischen Modus zu. Geometrische Änderungen
bleiben der Draufsicht vorbehalten.

Fortschreibung 18.11.2026: [DEC-042](#dec-042) erlaubt kleine X als
technische Pflanzplatzmarken in der Draufsicht. Die Regel über dargestellte
Pflanzen wird dafür um diese Planungsmarken ergänzt.

<a id="dec-034"></a>

### DEC-034 — Erste Planner-Isometrie mit ASCII-Tomaten und gemeinsamem Theme

- **Datum:** 18.11.2026.
- **Status:** beschlossen und für den beschriebenen Umfang ausdrücklich zur Umsetzung freigegeben.
- **Entscheidung:** Die vorhandene Draufsicht bleibt der Arbeitsmodus ohne
  Pflanzensymbole. Ein Zweistellungs-Schalter wechselt zur informativen
  Isometrie desselben Gartens. Beide Modi erhalten eine gemeinsame,
  von Grainrad inspirierte Gestaltung mit Hell-/Dunkel-Umschalter.
  Für die erste Pflanzenvisualisierung wird die erprobte ASCII-Tomate
  mit vorbereiteten Windposen aus VIS-GRAIN-003 verwendet.
- **Begründung:** Die freigegebene Integration verbindet den bestehenden
  Planungsablauf mit einer saisonalen Gartenansicht und greift auf einen
  bereits geprüften Bildsatz zurück.
- **Auswirkungen:** Konkretisiert [DEC-033](#dec-033) für diese Ausbaustufe.
  Agronomie und Datenmodell folgen den bestehenden Verträgen. Die langfristige
  Bildsprache, Renderer- und Asset-Pipeline-Entscheidung aus [DEC-025](#dec-025)
  und übrige Fragen unter [OQ-019](OPEN_QUESTIONS.md#oq-019) bleiben offen.
- **Quelle:** Ausdrücklicher Nutzerauftrag vom 18.11.2026 zur Integration in
  den Planner. [Umsetzung und Prüfstand](phase-garden-views.md).

<a id="dec-035"></a>

### DEC-035 — Isometrischen Ausschnitt verschieben und zoomen

- **Datum:** 18.11.2026.
- **Status:** beschlossen und ausdrücklich zur Umsetzung freigegeben.
- **Entscheidung:** Die Isometrie erhält Verschieben des Bildausschnitts und
  Zoom bei festem Blickwinkel. Ein kurzer Klick bleibt Beetauswahl.
- **Begründung:** Größere Gärten lassen sich erkunden und einzelne Beete
  näher betrachten, während Auswahl und Saisonposition erhalten bleiben.
- **Auswirkungen:** Konkretisiert [DEC-034](#dec-034) und den Bedienumfang in
  [OQ-019](OPEN_QUESTIONS.md#oq-019). Die Navigation verändert nur die
  isometrische Kamera. [Umsetzung und Prüfstand](phase-garden-views.md).
- **Quelle:** Ausdrückliche Nutzerfreigabe „ja beides integrieren“ vom 18.11.2026.

<a id="dec-036"></a>

### DEC-036 — Editierbare Beetnamen und horizontale Iso-Beschriftung

- **Datum:** 18.11.2026.
- **Status:** beschlossen und zur Umsetzung freigegeben.
- **Entscheidung:** Die Beetplanung zeigt den Winkel im Geometrieabschnitt
  und bietet dort die Namensbearbeitung. Die Mausrotation bleibt erhalten.
  Die Isometrie zeigt horizontale, kollisionsgeprüfte Beetnamen-Kästchen
  mit feinen Verbindungslinien.
- **Begründung:** Namen sollen den Garten eindeutig beschriften. Numerische
  Winkelwerte gehören zur präzisen Geometriebearbeitung.
- **Auswirkungen:** Schreibt [DEC-018](#dec-018) für Tooltip und Anzeige
  sowie [DEC-028](#dec-028) für die numerische Anzeige während der
  Drehgeste fort. Namensänderungen nutzen den revisionsgesicherten Beet-PATCH.
- **Quelle:** Ausdrücklicher Nutzerauftrag vom 18.11.2026.
  [Umsetzung und Prüfung](phase-garden-views.md).

Fortschreibung 18.11.2026: Namensfeld und Speichern stehen direkt in der
Beetplanung. Das Geometrieformular kann geschlossen bleiben. Die
Iso-Kästchen erhalten mehr Abstand zur zugehörigen Beetkontur.

<a id="dec-037"></a>

### DEC-037 — Beetplanung und Kulturplanung als getrennte Arbeitsmodi

- **Datum:** 18.11.2026.
- **Status:** beschlossen und zur Umsetzung freigegeben.
- **Entscheidung:** Die Draufsicht heißt **Beetplanung**. Dort werden
  Beetname und Geometrie bearbeitet. Kultur und Zeitraum sind einsehbar.
  Die Isometrie heißt **Kulturplanung**. Dort werden Anbauvorgänge im
  rechten Beetpanel bearbeitet. Geometrieangaben entfallen in diesem Panel.
- **Begründung:** Die Werkzeuge im Beetpanel folgen der Aufgabe der
  jeweiligen Ansicht. Kulturen und Zeiträume bleiben beim Geometrieplanen sichtbar.
- **Auswirkungen:** Schreibt [DEC-033](#dec-033) und die erste Umsetzung
  [DEC-034](#dec-034) fort. Gemeinsame Beetauswahl, Saisonposition,
  Datenmodell und Rechenregeln bleiben erhalten. Die Demo bleibt lesend.
- **Quelle:** Ausdrücklicher Nutzerauftrag zur Aufgabenteilung vom
  18.11.2026. [Umsetzung und Prüfung](phase-garden-views.md).

<a id="dec-038"></a>

### DEC-038 — Kulturfelder automatisch speichern

- **Datum:** 18.11.2026.
- **Status:** beschlossen und zur Umsetzung freigegeben.
- **Entscheidung:** Änderungen an Kultur, Anbauart, Startdatum und geplantem
  Erntedatum werden nach kurzer Eingabepause automatisch gespeichert.
  Ein neuer Anbauvorgang wird angelegt, sobald seine Pflichtangaben gültig sind.
- **Begründung:** Einzelne Feldänderungen sollen direkt übernommen werden.
  Schnelle Änderungen werden gemeinsam übertragen.
- **Auswirkungen:** Schreibt [DEC-032](#dec-032) und [DEC-037](#dec-037) fort.
  „Fertig“ schließt den Bearbeitungskontext. Ungültige Eingaben bleiben
  lokal. Endgültiges Entfernen ist weiterhin eine bestätigte Einzelaktion.
  Der bestehende revisionsgesicherte Speichervertrag bleibt maßgeblich.
- **Quelle:** Ausdrücklicher Nutzerauftrag zum automatischen Speichern
  vom 18.11.2026. [Umsetzung und Prüfung](phase-garden-views.md).

<a id="dec-039"></a>

### DEC-039 — Wochenbelegung verständlich kennzeichnen

- **Datum:** 18.11.2026.
- **Status:** beschlossen und zur Umsetzung freigegeben.
- **Entscheidung:** In der Wochenplanung sind nur Beete ohne Anbauvorgang
  gestrichelt umrandet. Grundstücksaussparungen erhalten eine durchgezogene
  Kontur. Inaktive Wochen mit vorhandener Kulturplanung werden von Beeten
  ohne Kulturplanung unterschieden. Die Legende benennt fehlende geplante
  Erntetermine ausdrücklich.
- **Begründung:** Konturen und Begriffe sollen Beete ohne Planung, freie
  Wochen und zeitlich unvollständige Planung klar auseinanderhalten.
- **Auswirkungen:** Gilt in beiden Gartenansichten. Die fachliche
  Wochenprojektion aus [DEC-031](#dec-031) bleibt unverändert.
- **Quelle:** Ausdrücklicher Nutzerauftrag zur Legende vom 18.11.2026.
  [Umsetzung und Prüfung](phase-garden-views.md).

<a id="dec-040"></a>

### DEC-040 — Projekt aus der Projektauswahl anlegen

- **Datum:** 18.11.2026.
- **Status:** beschlossen und zur Umsetzung freigegeben.
- **Entscheidung:** „Neues Projekt“ legt ein gespeichertes Projekt mit
  Namen und eingegebenen Maßen für ein leeres rechteckiges Grundstück an.
  Nach bestätigter Anlage öffnet sich die Beetplanung.
- **Begründung:** Ein leerer, maßhaltiger Einstieg ermöglicht die
  anschließende Beetplanung über die vorhandenen Werkzeuge.
- **Auswirkungen:** Konkretisiert den Einstieg für [DEC-005](#dec-005).
  Freie Grundstückserfassung bleibt offen. Wiederholte Sendeversuche
  derselben Anlage im Dialog werden über dieselbe Projekt-ID erkannt.
- **Quelle:** Nutzerauftrag zur Projektanlage vom 18.11.2026.
  [Umsetzung und Prüfung](phase-garden-views.md).

<a id="dec-041"></a>

### DEC-041 — 15°-Winkelraster beim Zeichnen mit Shift

- **Datum:** 18.11.2026.
- **Status:** beschlossen und zur Umsetzung freigegeben.
- **Entscheidung:** Beim Ziehen einer neuen Beetlängsachse rastet der
  Winkel mit gedrückter Shift-Taste in 15°-Schritten ein. Das Loslassen
  stellt noch während der Geste den freien Winkel wieder her.
- **Begründung:** Eine einheitliche Ausrichtung soll bereits beim Zeichnen
  ohne nachträgliche Winkelkorrektur möglich sein.
- **Auswirkungen:** Ergänzt [DEC-010](#dec-010) und [DEC-028](#dec-028).
  Der erste Achspunkt, die gezogene Länge und die eingegebene Breite
  bleiben erhalten. Validierung und Speicherung verwenden dieselbe Geometrie.
- **Quelle:** Ausdrücklicher Nutzerauftrag vom 18.11.2026.
  [Prüfstand](phase3b3c.md).

<a id="dec-042"></a>

### DEC-042 — Pflanzraster je Beet und Anbauvorgang

- **Datum:** 18.11.2026.
- **Status:** beschlossen. Rasterberechnung und X-Markierung umgesetzt.
  Die angeforderte Visualisierung mit VIS-GRAIN-004 und fachliche
  Ertrags-/Phasenintegration sind noch nicht umgesetzt.
- **Entscheidung:** Beetmaße und quellenbezogene Reihen- und Pflanzabstände
  des jeweiligen Anbauprofils bestimmen die möglichen Pflanzplätze.
  Nachfolgende Kulturen haben ein eigenes Raster auf demselben Beet.
  Die Beetplanung zeigt X als technische Pflanzplatzmarken. Das Ziel der
  Kulturplanung ist die Darstellung derselben Positionen mit den Pflanzen
  aus VIS-GRAIN-004 und sichtbarer Entwicklung.
- **Begründung:** Pflanzkapazität soll aus der metrischen Geometrie und
  dem jeweiligen Kulturprofil nachvollziehbar hervorgehen.
- **Auswirkungen:** Konkretisiert [DEC-033](#dec-033). Die bestehende
  Python-Kapazitätsregel liefert dieselben Anzahlen für Scheduler und Raster.
  Die Fachregeln aus [DEC-022](#dec-022) und [DEC-023](#dec-023) gelten weiter.
  Ertragsgrundlage, Phasenzuordnung und räumliche Aufteilung bei
  gleichzeitigen Kulturen erfordern fachliche Klärung.
- **Quelle:** Nutzerauftrag zu Pflanzabständen, Ertrag und VIS-GRAIN-004
  vom 18.11.2026. [Umsetzung und Quellen](phase-garden-views.md).

Fortschreibung 18.11.2026: [DEC-043](#dec-043) ergänzt Referenzschätzungen
sowie die Darstellung der Pflanzraster mit VIS-GRAIN-004. Die oben
dokumentierte erste Ausbaustufe bleibt als historischer Stand erhalten.

<a id="dec-043"></a>

### DEC-043 — Referenzertrag und schematisches Pflanzenwachstum

- **Datum:** 18.11.2026.
- **Status:** beschlossen und zur Umsetzung freigegeben.
- **Entscheidung:** Passende veröffentlichte Ertragswerte erscheinen als
  gekennzeichnete Referenzschätzung je Kulturvorgang. Die Isometrie nutzt
  mit VIS-GRAIN-004 dieselben fachlichen Rasterpunkte wie die Draufsicht.
  Visuelle Entwicklungsstufen orientieren sich am geplanten Zeitintervall.
- **Begründung:** Die Kulturplanung soll die Konsequenzen der Beetgröße
  anschaulich machen. Herkunft und Unsicherheit der Schätzung bleiben sichtbar.
- **Auswirkungen:** Ergänzt [DEC-042](#dec-042) und konkretisiert
  [DEC-023](#dec-023). Referenzen ersetzen keine operativen
  Scheduler-Ertragswerte. Lokale Kalibrierung und die Aufteilung
  gleichzeitiger Kulturen bleiben offen.
- **Quelle:** Nutzerauftrag zu VIS-GRAIN-004 vom 18.11.2026 und
  ausdrückliche Bestätigung der Referenzschätzungen. [Umsetzung](phase-garden-views.md).

Fortschreibung 18.11.2026: [DEC-044](#dec-044) konkretisiert die
räumliche Aufteilung bei gleichzeitigen Kulturen über Reihenzuordnungen.
Die lokale Ertragskalibrierung bleibt offen.

<a id="dec-044"></a>

### DEC-044 — Kulturreihen je Anbauzeitraum zuordnen

- **Datum:** 18.11.2026.
- **Status:** beschlossen und umgesetzt. Nutzerabnahme offen.
- **Entscheidung:** Reihennummern ordnen Anbauvorgänge für ihren jeweiligen
  Zeitraum von links nach rechts an. Die Reihenpositionen ergeben sich
  aus den Abständen der zugeordneten Kulturprofile. Pflanzpunkte,
  Iso-Pflanzen und Referenzertrag folgen dieser Aufteilung.
- **Begründung:** Kulturen mit unterschiedlichen Abständen sollen dasselbe
  Beet gemeinsam nutzen können. Folgekulturen brauchen eine eigene Aufteilung.
- **Auswirkungen:** Konkretisiert [DEC-042](#dec-042), [DEC-043](#dec-043)
  und [OQ-010](OPEN_QUESTIONS.md#oq-010). Unvollständige oder geometrisch
  widersprüchliche Reihenaufteilungen werden kenntlich gemacht.
  Geometrie und operative Scheduler-Erträge sind davon unabhängig.
- **Quelle:** Ausdrückliche Nutzerbestätigung vom 18.11.2026.
  [Bedienung und Prüfstand](phase-garden-views.md).

Fortschreibung 18.11.2026: [DEC-045](#dec-045) entkoppelt die
Anzahl und Position der gezeichneten Iso-Pflanzen vom fachlichen Raster.
Kulturzuordnung, zeitliche Gültigkeit und Referenzertrag aus DEC-044 gelten weiter.

<a id="dec-045"></a>

### DEC-045 — Gleichmäßige ASCII-Pflanzenfüllung in der Isometrie

- **Datum:** 18.11.2026.
- **Status:** beschlossen und umgesetzt. Nutzerabnahme offen.
- **Entscheidung:** Gleichmäßig verteilte VIS-GRAIN-004-Pflanzensymbole
  füllen eindeutig belegte Beetabschnitte in der Kulturplanung.
  Die Anzahl der Symbole richtet sich nach der Darstellung und der
  Größe der sichtbaren Kulturfläche. Die geplante Saison bestimmt
  vier schematische Größenstufen.
- **Begründung:** Die Isometrie soll den Bewuchs lesbar zeigen, auch bei
  sehr dichten Pflanzabständen.
- **Auswirkungen:** Schreibt die Darstellung aus [DEC-042](#dec-042),
  [DEC-043](#dec-043) und [DEC-044](#dec-044) fort. Das fachliche Raster
  bestimmt weiterhin X-Markierungen, Kapazität und Referenzertrag.
- **Quelle:** Ausdrücklicher Nutzerauftrag zur ASCII-Füllung und
  Wachstumsdarstellung vom 18.11.2026. [Prüfstand](phase-garden-views.md).

## Änderungsverlauf

### Lokale Experimentfreigabe VIS-GRAIN-004

- **ID / Datum:** VIS-GRAIN-004, 18.11.2026.
- **Fortschreibung (18.11.2026):** Der Nutzer erweitert den ursprünglichen
  Einzelzustand um illustrative Wachstumsphasen und wünscht eine
  Verschattung der unterirdischen Speicherorgane auf der geschlossenen
  Iso-Beetfläche. Umgesetzt als Studie mit vier Phasen für die sechs Lab-Kulturen.
- **Fortschreibung (18.11.2026):** Der Nutzer erweitert die Sammlung auf
  alle vorhandenen Katalogkulturen. Die vorherigen, eigens gezeichneten
  Phasen werden in der Lab-Ansicht durch stetige Vergrößerung derselben
  Pflanzenform ersetzt, um Größenwachstum klarer lesbar zu machen.
- **Status / Herkunft:** Expliziter Nutzerauftrag VIS-GRAIN-004 für Assets
  und vorbereitende Zuordnung. Gemeinsame Designabnahme offen.
- **Begründung:** Der vorhandene Grainrad-Tomatensatz dient als Referenz
  für ergänzende Darstellungen aus dem bestehenden Kulturkatalog.
- **Auswirkungen:** Experimenteller Mehrkultur-Atlas mit einem Zustand und
  drei Windhaltungen je Symbol, Katalogzuordnung und separater Lab-Testszene.
  [Versuchsbericht](../experiments/botanical-ascii-lab/VIS-GRAIN-004.md).

### Lokale Experimentfreigabe VIS-GRAIN-003

- **ID / Datum:** VIS-GRAIN-003, 18.11.2026.
- **Status / Herkunft:** Isolierter, ausdrücklich beauftragter Versuch mit drei
  transparenten ASCII-Windhaltungen und zehn Pflanzeninstanzen.
- **Begründung:** VIS-GRAIN-002 belegt die Wiederholbarkeit des Einzelbildexports.
  Drei PNG-Posen aus einer Vorlage erlauben die Prüfung von Transparenz,
  Fußpunktstabilität und niedriger Zeichenlast.
- **Auswirkungen:** Ein vorbereiteter Grainrad-Atlas und eine getrennte Canvas-2D-
  Ansicht im Lab. DEC-017/025 und OQ-019/020 gelten weiterhin für die offene
  Renderer- und Asset-Entscheidung.
  [Bericht](../experiments/botanical-ascii-lab/VIS-GRAIN-003.md).

### Lokale Experimentfreigabe VIS-GRAIN-002

- **ID / Datum:** VIS-GRAIN-002, 18.11.2026.
- **Status / Herkunft:** Isolierter Machbarkeitstest gemäß ausdrücklichem Auftrag
  „Automatisierter Grainrad-Test“, ausgeführt und anhand der Exporte geprüft.
- **Begründung:** Der Test der öffentlichen Browseroberfläche mit der vorhandenen
  Tomatenreferenz zeigt, ob sich vorbereitete ASCII-Bilder automatisieren lassen.
- **Auswirkungen:** Versuchsergebnisse und Artefakte bleiben im Lab. Die Wahl
  des Renderers und der Asset-Pipeline bleibt unter DEC-017/025 und OQ-019/020 offen.
  [Bericht und Nachweise](../experiments/botanical-ascii-lab/VIS-GRAIN-002.md).

### Lokale Experimentfreigabe DP-001 — keine Änderung bestehender Beschlüsse

- **ID / Datum:** DP-001, 17.11.2026.
- **Status:** ausdrücklich beauftragter, experimenteller Design-/Performance-Prototyp;
  keine neue Produktentscheidung und keine finale Rendererarchitektur.
- **Herkunft:** Nutzerauftrag „DP-001: Design-Prototyp mit vereinfachter Gartenvisualisierung“.
- **Umfang:** isolierte Gesamtoberfläche, Beispieldaten, bestehendes Tomatenmodell,
  gemeinsamer Satz von zunächst höchstens 20 ASCII-Frames, Phasenversatz,
  10/30/100-Pflanzenvergleich. Einfachere Umsetzung ohne PixiJS ausdrücklich erlaubt.
- **Begründung der lokalen Umsetzung:** Canvas 2D genügt als kleinster Versuch
  gemeinsamer Rasterbilder ohne neue Abhängigkeit. JavaScript-Lab und produktive
  React-/TypeScript-Struktur bleiben erhalten.
- **Auswirkungen/Grenzen:** nur neuer Lab-Einstieg; keine Planner-API, Algorithmen
  oder Datenmodelle. DEC-017/025 und OQ-019/020 bleiben erhalten; keine bestehende
  Entscheidung wird ersetzt. [Spezifikation](features/DP-001.md),
  [Ergebnis und Nachweise](../experiments/botanical-ascii-lab/DP-001.md).

| Datum | Änderung | Grundlage |
|---|---|---|
| 16.11.2026 | Erstfassung DEC-001 bis DEC-026; historische Einordnung und offene Details aufgenommen. | Bestehende Dokumentation und ausdrücklicher Auftrag zum dauerhaften Entscheidungsprotokoll. Keine neuen Funktionen, kein Git-Commit. |
| 16.11.2026 | DEC-027 ergänzt; Bezug zu den bislang offenen Editorfunktionen in DEC-010 ausdrücklich fortgeschrieben. | Nutzerauftrag Phase 3B.3c; Mittelpunkt-Anker und revisionssichere Einzel-Löschung mit dauerhafter ID-Sperre. |
| 16.11.2026 | DEC-028 ergänzt: kompakte Anzeige ohne Verlust interner Präzision und optionales Shift-Winkelraster. | Ausdrücklicher UI-Feinschliff-Auftrag; keine Änderung der Standardrotation oder Fachgeometrie. |
| 16.11.2026 | DEC-029 ergänzt: persistente Nutzereingaben zur Kulturplanung, Schema-2-Migration und Löschschutz zugewiesener Beete. | Phase 3C.1; vorhandener Katalog, getrennte Geometrie und keine neuen Agronomieannahmen. |
| 17.11.2026 | DEC-030 ergänzt: kompakte Planung und informative, Python-basierte Datumsprüfung einschließlich unklarer Zeiträume. | Ausdrücklicher UX-/Überschneidungsauftrag vor Phase 3C.2; keine Speicherblockade. |
| 17.11.2026 | DEC-031 ergänzt: ISO-Wochenprojektion gespeicherter Projekte, Unsicherheiten und Trennung von Folge-/Mischkulturen. | Phase 3C.2; kein neuer Scheduler oder SQLite-Vertrag. |
| 17.11.2026 | DEC-032 ergänzt: ID-gebundene Zeilenhervorhebung und benannter Formularkontext. | Ausdrücklicher UX-Auftrag zu Phase 3C.2; keine fachlichen oder persistenten Änderungen. |
| 18.11.2026 | DEC-033 ergänzt und DEC-019 mit datiertem Fortschreibungsverweis versehen. | Ausdrückliche Nutzerbestätigung der zwei Gartenansichten. Implementierung nicht freigegeben. |
| 18.11.2026 | DEC-034 ergänzt. | Ausdrücklicher Integrationsauftrag zu Ansichtswechsel, ASCII-Tomaten und Hell/Dunkel. |
| 18.11.2026 | DEC-035 ergänzt. | Ausdrückliche Freigabe für Verschieben und Zoomen in der Isometrie. |
| 18.11.2026 | DEC-036 ergänzt. | Ausdrücklicher Auftrag zu Beetnamen, Winkelanzeige und Iso-Beschriftung. |
| 18.11.2026 | DEC-037 ergänzt. | Ausdrücklicher Auftrag zur Aufgabenteilung von Beet- und Kulturplanung. |
| 18.11.2026 | DEC-038 ergänzt. | Ausdrücklicher Auftrag zum automatischen Speichern der Kulturfelder. |
| 18.11.2026 | DEC-039 ergänzt. | Nutzerauftrag zu Grundstücksaussparungen, Beetkonturen und Wochenlegende. |
| 18.11.2026 | DEC-040 ergänzt. | Nutzerauftrag zur Projektanlage aus der Projektauswahl. |
| 18.11.2026 | DEC-041 ergänzt. | Nutzerauftrag zum Shift-Winkelraster beim Beetzeichnen. |
| 18.11.2026 | DEC-042 ergänzt. | Nutzerauftrag zu kulturabhängigen Pflanzrastern und saisonaler Pflanzenvisualisierung. |
| 18.11.2026 | DEC-043 ergänzt. | Nutzerbestätigung zu veröffentlichten Ertragsreferenzen und Auftrag zur Visualisierung. |
| 18.11.2026 | DEC-044 ergänzt. | Nutzerbestätigung zur kulturabhängigen Anordnung und zeitlichen Reihenzuordnung. |
| 18.11.2026 | DEC-045 ergänzt. | Nutzerauftrag zur gleichmäßigen ASCII-Füllung mit Wachstumsstufen. |
