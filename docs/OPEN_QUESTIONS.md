# Offene Fragen und Entscheidungsbedarf

Erfassung: **17.11.2026**, vorhandene Dokumentation und Arbeitsstand bis Phase 3C.2.
Dieses Register konsolidiert offene Details; es trifft keine Produktentscheidung,
erzeugt keine neuen Anforderungen und gibt keine Implementierung frei.

## Verwendung und Abgrenzung

- Alle OQ-Einträge sind bei Erfassung **offen**. Es gibt keine erfundenen
  Verantwortlichen, Fristen, Standardwerte oder Prioritäten. „Vor …“ benennt
  nur den fachlichen Klärungsbedarf, keinen zugesagten Umsetzungstermin.
- OQ-IDs bleiben stabil und werden nicht wiederverwendet. Bei Klärung Eintrag
  erhalten, Status/Datum und die entscheidende DEC-ID ergänzen.
- [DECISIONS.md](DECISIONS.md) bleibt das verbindliche Protokoll. Offene und
  vorgeschlagene DEC-Einträge bleiben dort vollständig erhalten; dieses Register
  ist der zentrale aktuelle Index, keine konkurrierende Beschlusssammlung.
- Ein beschlossenes Ziel mit noch fehlender Implementierung ist nicht als Ganzes
  „unentschieden“. Hier stehen seine tatsächlich unbestimmten Details.
- Fachliche Datenlücken und ausstehende Nachweise sind als solche bezeichnet.
  Fehlende Daten sind keine Nullwerte, Studien keine Produktfreigabe.
- Bestehende Wochen-/Überschneidungsregeln aus DEC-030/031 sind beschlossen.
  Ihre fachlichen Grenzen werden nicht als ungeklärte aktuelle Datumslogik geführt.

| Bereich | Einträge |
|---|---|
| Geometrie und Editor | [OQ-001](#oq-001) bis [OQ-006](#oq-006) |
| Agronomie und Saisonplanung | [OQ-007](#oq-007) bis [OQ-012](#oq-012) |
| Gewächshäuser, Varianten und Generierung | [OQ-013](#oq-013) bis [OQ-016](#oq-016) |
| Historische Daten, Import und Darstellung | [OQ-017](#oq-017) bis [OQ-020](#oq-020) |
| Name, Bereitstellung und technische Optionen | [OQ-021](#oq-021) bis [OQ-024](#oq-024) |

## Geometrie und Editor

<a id="oq-001"></a>
### OQ-001 — Praktische Genauigkeit, Betriebsabstände und Wegefreiräume

- **Offen:** Messgenauigkeit/Herkunft realer Grenzen, betriebliche Mindestabstände,
  Pflegewege und fachliche Grenzfälle für importierte/vermessene Geometrie.
- **Bereits geklärt:** metrischer Raum ohne Raster, Shapely 2.1.2, zulässige
  Kantenberührung und technische Toleranzen. Diese sind keine Messgenauigkeit
  oder Erlaubnis zu einem praktischen Überstand.
- **Vor:** Import, zusätzliche Abstandsregeln oder belastbare Generierung.
- **Bezug/Quellen:** [DEC-003](DECISIONS.md#dec-003),
  [DEC-007](DECISIONS.md#dec-007), [Architektur](ARCHITECTURE.md),
  [Geometriekern](phase3b1.md), historische Roadmap §5.

<a id="oq-002"></a>
### OQ-002 — Erweiterung des räumlichen Vertrags und Grundstückserfassung

- **Offen:** UI-Vertrag zur Grundstücksgrenze, eigenständige Wege/Hindernisse/
  Sperr- und Generierungsflächen sowie deren Referenzen und Migration.
  Mehrere Grundstücke, Kurven und nichtrechteckige Beete sind ausdrücklich
  spätere Erweiterungsoptionen, noch kein freigegebener konkreter Umfang.
- **Bereits geklärt:** ein Polygon einschließlich Löchern und frei rotierte
  parametrische Rechteckbeete je heutigem Geometriezustand.
- **Vor:** Erweiterung des Geometrieschemas oder des Grundstückseditors.
- **Bezug/Quellen:** [DEC-004](DECISIONS.md#dec-004),
  [DEC-005](DECISIONS.md#dec-005), [Architektur](ARCHITECTURE.md),
  [3B.3c-Grenzen](phase3b3c.md), Roadmap 3B.3.

<a id="oq-003"></a>
### OQ-003 — Verbleibende präzise Editorwerkzeuge und Schutzbedienung

- **Offen:** Bedienung fester Bezugskanten/einseitiger Skalierung, Skaliergriffe,
  bewusstes Entsperren und getrennte Bedienung des Generatorschutzes.
  Weitere Zeichenwerkzeuge sind nicht durch den heutigen Achsen-Drag festgelegt.
- **Bereits geklärt:** symmetrische numerische Maße, Mittelpunktrotation,
  freie Rotation/optionales Shift-Snapping und bestätigte Einzel-Löschung.
- **Vor:** nächster ausdrücklich beauftragter Editorerweiterung.
- **Bezug/Quellen:** [DEC-006](DECISIONS.md#dec-006),
  [DEC-010](DECISIONS.md#dec-010), [DEC-027](DECISIONS.md#dec-027),
  [DEC-028](DECISIONS.md#dec-028), [3B.3b](phase3b3b.md), [3B.3c](phase3b3c.md).

<a id="oq-004"></a>
### OQ-004 — Undo/Redo, Wiederherstellung und Gruppenänderungen

- **Offen:** Historientiefe, Revisions-/Konfliktverhalten beim Rückgängigmachen,
  Umgang mit gelöschten IDs und Wiederherstellen, Umfang atomarer Gruppenbefehle.
  Gesperrte Kinder müssen bei späteren Gebäudeoperationen berücksichtigt werden.
- **Vor:** Undo/Redo oder gruppenweiser Bearbeitung; keine vollständige
  Event-Sourcing-Architektur ist beschlossen.
- **Bezug/Quellen:** [DEC-006](DECISIONS.md#dec-006),
  [DEC-008](DECISIONS.md#dec-008), [DEC-016](DECISIONS.md#dec-016),
  [DEC-027](DECISIONS.md#dec-027), [Architektur §9](ARCHITECTURE.md),
  [Roadmap](ROADMAP.md).

<a id="oq-005"></a>
### OQ-005 — Projektbezogene Vorschau mit Revision und Sperren

- **Offen:** zusätzlicher Preview-Vertrag, der Projektbasis, Identitäten und
  Sperren ohne Speicherung prüft; Rückmeldungsverhalten bei Latenz und Konflikten.
- **Bereits geklärt:** generische Topologie-Vorschau vorhanden; die verbindliche
  Speicherprüfung erfolgt zentral und transaktional. Eine grüne Vorschau ist
  keine Speicherzusage.
- **Vor:** Erweiterung der vorhandenen Editorvorschau.
- **Bezug/Quellen:** [DEC-007](DECISIONS.md#dec-007),
  [DEC-009](DECISIONS.md#dec-009), [DEC-010](DECISIONS.md#dec-010),
  [3B.2-Grenzen](phase3b2.md), [3B.3b](phase3b3b.md).

<a id="oq-006"></a>
### OQ-006 — Aufbewahrung von Command-Belegen und gelöschten IDs

- **Offen:** Aufbewahrungs-/Archivierungsregel und gegebenenfalls effizienterer
  Index, ohne Idempotenz oder dauerhaften Schutz gelöschter Objekt-IDs aufzugeben.
  Die Belege sind keine Bake- oder historische Objektverwaltung.
- **Vor:** Bereinigung oder struktureller Optimierung der Belege; Bedarf zuerst messen.
- **Bezug/Quellen:** [DEC-009](DECISIONS.md#dec-009),
  [DEC-027](DECISIONS.md#dec-027), [3B.2](phase3b2.md), [3B.3c](phase3b3c.md).

## Agronomie und Saisonplanung

<a id="oq-007"></a>
### OQ-007 — Kulturabsichten, Scheduler-Läufe und veraltete Ergebnisse

- **Offen:** Zuordnung stabiler Vorgänge zu Run-/Batch-IDs, bewusste Auslösung
  und Vorschau eines Laufs, manuell fixierte Beetzuweisungen sowie gespeicherte
  Eingabe-/Profil-Snapshots und vollständige Stale-Anzeige.
- **Bereits geklärt:** Kulturabsicht ist kein Scheduler-Lauf; ISO-Wochenstatus
  aus DEC-031 benötigt keinen Allocator. Geometrie-Token und Revisionen sind vorhanden.
- **Vor:** neuen Projekt-Ernteprognosen oder gespeicherten Saisonläufen.
- **Bezug/Quellen:** [DEC-008](DECISIONS.md#dec-008),
  [DEC-022](DECISIONS.md#dec-022), [DEC-029](DECISIONS.md#dec-029),
  [DEC-031](DECISIONS.md#dec-031), [Architektur §5](ARCHITECTURE.md),
  [3C.1-Anschluss](phase3c1.md), [3C.2-Grenzen](phase3c2.md).

<a id="oq-008"></a>
### OQ-008 — Lokale Agronomiedaten, Sorten und fachliche Kalibrierung

- **Art:** offener Daten- und Fachbedarf.
- **Offen:** belastbare Luxemburger Standort-/Saisonprofile, Sortenwahl,
  skalare Erträge, Keim-/Etablierungsquoten und zeitliche Ertragsverläufe.
  Standort, Boden, Höhenlage und Kulturführung sind nicht durch fremde
  Quellenwerte automatisch validiert. Umgang mit eigenen Sorten/Profilen
  außerhalb des heutigen Katalogs ist noch nicht spezifiziert.
- **Vor:** belastbaren operativen Prognosen; keine synthetischen Ersatzdaten einsetzen.
- **Bezug/Quellen:** [DEC-023](DECISIONS.md#dec-023),
  [DEC-024](DECISIONS.md#dec-024), [DEC-029](DECISIONS.md#dec-029),
  [Agronomiequellen und Kultur-Datenlücken](agronomy-sources.md),
  [Phase 1](phase1.md), [Phase 2](phase2.md), [3C.1](phase3c1.md).

<a id="oq-009"></a>
### OQ-009 — Fachliche Belegungs-, Ernte- und Räumintervalle

- **Offen:** realer Belegungs-/Räumvertrag für Nutzerplanung, Ernteintervalle
  gegenüber einzelnen geplanten Erntetagen sowie Erfassung tatsächlicher Ereignisse.
- **Bereits geklärt:** aktuelle Planungstage zählen Start bis geplante Ernte
  inklusive; ohne Ernte bleibt die Fortdauer unklar. Geplante Ernte bestätigt
  weder tatsächliche Ernte noch Räumung. Die Regeln aus DEC-030/031 bleiben unverändert.
- **Vor:** physischer Verfügbarkeitsanzeige oder Integration echter Saisonprofile.
- **Bezug/Quellen:** [DEC-022](DECISIONS.md#dec-022),
  [DEC-029](DECISIONS.md#dec-029), [DEC-030](DECISIONS.md#dec-030),
  [DEC-031](DECISIONS.md#dec-031), [3C.1](phase3c1.md), [3C.2](phase3c2.md).

<a id="oq-010"></a>
### OQ-010 — Mischkultur, Teilbeete und beetgenaue Prognosen

- **Offen:** fachliche Mischkulturverträglichkeit, räumliche Teilbelegung,
  Kapazitäts-/Konfliktregeln sowie eine begründete Verteilung satzbezogener
  Erträge auf mehrere Beete. Gleichverteilung ist nicht bereits beschlossen.
- **Bereits geklärt:** informative Überschneidungshinweise verbieten keine
  Mischkultur; Folgekulturen derselben Woche sind nicht automatisch gleichzeitig.
- **Vor:** Teilbeetplanung, Kompatibilitätsaussagen oder beetgenauen Mengen.
- **Bezug/Quellen:** [DEC-008](DECISIONS.md#dec-008),
  [DEC-022](DECISIONS.md#dec-022), [DEC-030](DECISIONS.md#dec-030),
  [Architektur §5](ARCHITECTURE.md), [Phase 2](phase2.md), [3C.1](phase3c1.md).

<a id="oq-011"></a>
### OQ-011 — Anzuchtkapazitäten und getrennte Ausfallstufen

- **Offen:** falls dieser bislang nicht modellierte Bereich beauftragt wird:
  Anzuchtflächen/-kapazitäten, separate Jungpflanzen- und Verluststufen,
  anfänglich höhere Beetbelegung und gegebenenfalls Vereinzeln.
- **Bereits geklärt:** heutige Verlustformel und produktiver Zielbestand gelten
  weiter; ein Daten-/Modellbedarf ist keine Freigabe eines neuen Funktionsumfangs.
- **Vor:** Erweiterung der Verlust- oder Anzuchtberechnung.
- **Bezug/Quellen:** [DEC-022](DECISIONS.md#dec-022),
  [DEC-023](DECISIONS.md#dec-023), [Phase 1](phase1.md),
  [Phase 2](phase2.md), [ursprüngliche Abnahme](acceptance.md).

<a id="oq-012"></a>
### OQ-012 — Lagerung und Auslieferung nach der Ernte

- **Offen:** ob und mit welchen Eingaben Lagerbestände, Lagerverluste,
  Haltbarkeit und spätere Auslieferung überhaupt eigener Produktumfang werden.
  Das ist im bisherigen Scheduler ausdrücklich nicht simuliert.
- **Bereits geklärt:** Lagerernte beschreibt zunächst die tatsächliche
  gebündelte Ernte; keine nachgelagerte Bestandsrechnung daraus ableiten.
- **Vor:** einer gesondert beauftragten Lager-/Lieferplanung.
- **Bezug/Quellen:** [DEC-022](DECISIONS.md#dec-022),
  [DEC-023](DECISIONS.md#dec-023), [Phase 2 — Ertragsmodelle](phase2.md).

## Gewächshäuser, Varianten und Generierung

<a id="oq-013"></a>
### OQ-013 — Gewächshausgeometrie und Anbaubedingungen

- **Offen:** konkrete Gebäude-/Innenflächen-/Tür- und Infrastrukturverträge,
  Hierarchie-/Gruppenoperationen, Umgebungszuordnung und belegte geschützte
  Profile; Eignungsfilter für gemischte Ziele und Gruppen ohne Doppelzählung.
- **Bereits geklärt:** Gewächshäuser sind eigene räumliche Objekte,
  Innenbeete bleiben individuell; keine pauschalen Ertrags-/Wachstumsfaktoren.
  Der bisherige Vorschlag getrennt eindeutiger Gruppen ersetzt keine fertige Integration.
- **Vor:** Phase 3B.4 und belastbarer Freiland-/geschützter Planung.
- **Bezug/Quellen:** [DEC-016](DECISIONS.md#dec-016),
  [Architektur §7](ARCHITECTURE.md), [Roadmap 3B.4](ROADMAP.md).

<a id="oq-014"></a>
### OQ-014 — Bake-Vertrag, Abstammung und faire Variantenvergleiche

- **Offen:** endgültiges Snapshot-/Speicherschema, Nutzerablauf und
  Vergleichskennzahlen/-versionen; konkrete Abstammungsregeln beim Aufteilen/
  Zusammenlegen sowie Vergleich mit verschiedenen Zielen, Profilen oder Rechenständen.
- **Bereits geklärt:** unveränderliche Bake-Eingaben, fortgeführte logische IDs,
  neue Identität realer Duplikate; fehlende/veraltete Prognose ist kein Nullertrag.
  Architektur-Skizzen sind keine bereits beschlossene Datenbankmigration.
- **Vor:** Phase 3B.5; Wegenetz/-kennzahlen zusätzlich OQ-015.
- **Bezug/Quellen:** [DEC-008](DECISIONS.md#dec-008),
  [DEC-014](DECISIONS.md#dec-014), [Architektur §8](ARCHITECTURE.md),
  [Produkt](PRODUCT.md), [Roadmap](ROADMAP.md).

<a id="oq-015"></a>
### OQ-015 — Wegenetz, Erreichbarkeit und Vergleichskennzahlen

- **Offen:** Netzmodell, Mittellinien-/Kreuzungsregeln, Beet-Zugangspunkte,
  Stationstypen, Eingänge, Gewächshauszugänge, Arbeitsabläufe und Geh-/Fahrkosten;
  Behandlung unverbundener Flächen und praktische Zugänglichkeit.
- **Bereits geklärt:** reale Wege über ein nutzbares Netz bewerten;
  Direktabstand allein und aus Fläche erfundene Wegelängen reichen nicht.
- **Vor:** belastbarem Wege-/Variantenvergleich und Generatorbewertung.
- **Bezug/Quellen:** [DEC-012](DECISIONS.md#dec-012),
  [DEC-013](DECISIONS.md#dec-013), [DEC-015](DECISIONS.md#dec-015),
  [Architektur §3/8](ARCHITECTURE.md), [Roadmap](ROADMAP.md).

<a id="oq-016"></a>
### OQ-016 — Generatorparameter, Prioritäten und Verfahren

- **Offen:** Wertebereiche/Standards für Breite, Wege und Länge,
  Soll-/Mindest-/Höchstlängen und zulässige Abweichungen; Nenner des
  Beetflächenanteils; harte Bedingungen, messbare Ziele, Normalisierung,
  Prioritätenmodell/-standards, Algorithmus, Variantenanzahl, Seed,
  Reproduzierbarkeit, Abbruchbedingungen und Rechenzeitbudget.
- **Bereits geklärt:** Fläche, Arbeitswege und Zugang sind gleichwertige Ziele
  mit veränderbaren Nutzerprioritäten; nur freigegebene Flächen belegen und
  geschützten Bestand respektieren. Keine numerischen Gewichte beschlossen.
- **Vor:** Phase 3B.6; deterministische Vorschläge sind eine bestehende
  Roadmap-Empfehlung, keine Optimalitätsgarantie.
- **Bezug/Quellen:** [DEC-011](DECISIONS.md#dec-011),
  [DEC-012](DECISIONS.md#dec-012), [DEC-013](DECISIONS.md#dec-013),
  [DEC-014](DECISIONS.md#dec-014), [DEC-015](DECISIONS.md#dec-015),
  [Roadmap](ROADMAP.md).

## Historische Daten, Import und Darstellung

<a id="oq-017"></a>
### OQ-017 — Historische/Ist-Ernten und betriebliche Kalibrierung

- **Offen:** Erfassungsablauf, Einheiten/Bezugsbasis, Datenqualitätsregeln,
  Zuordnung über Beetumbauten/Varianten/Jahre hinweg und fachliches
  Kalibrierungsverfahren einschließlich nötiger Datengrundlage.
- **Bereits geklärt:** Prognose, historische Erfahrung und tatsächliche Ernte
  sind getrennte Datensätze mit Kultur-/Sorten-/Beet-/Jahresbezug.
  Keine automatische Überschreibung des Katalogs.
- **Vor:** eigenständiger Ertragsdatenerfassung oder Kalibrierung.
- **Bezug/Quellen:** [DEC-023](DECISIONS.md#dec-023),
  [DEC-024](DECISIONS.md#dec-024), [DEC-029](DECISIONS.md#dec-029),
  [Produkt](PRODUCT.md), [Roadmap — historische Erträge](ROADMAP.md).

<a id="oq-018"></a>
### OQ-018 — Satelliten-/GIS-Import und Georeferenz

- **Offen:** Anbieter, Formate, Lizenzen, Verfügbarkeit/offline, Referenzsystem,
  Georeferenz, Genauigkeit, Maßstabs-/Koordinatentransformation und Importablauf.
- **Bereits geklärt:** lokaler metrischer Fachraum; geografische Grad nicht
  als Meter interpretieren und eigenes metrisches JSON nicht als RFC-7946-GeoJSON ausgeben.
- **Vor:** konkreter Importimplementierung; technische Auswahl nicht beschlossen.
- **Bezug/Quellen:** [DEC-020](DECISIONS.md#dec-020),
  [DEC-021](DECISIONS.md#dec-021), [Architektur §3](ARCHITECTURE.md),
  [Roadmap](ROADMAP.md).

<a id="oq-019"></a>
### OQ-019 — Landschaftsansicht, Projektion, Renderer und Vegetationsassets

- **Offen:** Projektion/Renderer, schematische saisonale Pflanzenzeichen,
  Höhen, Asset-Pipeline, Verdeckung, Lesbarkeit, Export, Leistung und konkrete
  Verbindung von Pixel-Art, Tilt-Shift und Architekturmodell-Anmutung.
- **Bereits geklärt:** technische 2D-Ansicht bleibt; zweite Ansicht verwendet
  dieselben IDs/Weltkoordinaten, keine Kachelbindung der Fachgeometrie.
- **Experimentgrenze:** Botanical ASCII Lab und EXP-001 bis EXP-006 sind lokale
  Studien, keine Produktionswahl. Deren Raster-/Licht-/Leistungsgrenzen und
  synthetisches Modell begründen keine automatische Integration oder Agronomie.
- **Vor:** Phase 3B.7 bzw. jeder gesondert beauftragten Rendererintegration.
- **Bezug/Quellen:** [DEC-017](DECISIONS.md#dec-017),
  [DEC-018](DECISIONS.md#dec-018), [DEC-019](DECISIONS.md#dec-019),
  [DEC-025](DECISIONS.md#dec-025), [Architektur](ARCHITECTURE.md),
  [Lab-Entscheidungen](../experiments/botanical-ascii-lab/DECISIONS.md),
  [Lab-Grenzen](../experiments/botanical-ascii-lab/README.md),
  [Tiefenstudie](../experiments/botanical-ascii-lab/DEPTH-STUDY.md),
  [Lichtstudie](../experiments/botanical-ascii-lab/LIGHT-STUDY.md),
  [Themestudie](../experiments/botanical-ascii-lab/THEME-STUDY.md).

<a id="oq-020"></a>
### OQ-020 — Konkretisierung visueller und funktionaler Vorstellungen

- **Art:** ausstehende Nutzereingaben und Auslegung vorhandener Gestaltungsvorgaben.
- **Offen:** welche konkreten Merkmale vorhandener/neuer Referenzen verbindlich
  gewünscht sind und wie sie sich auf einzelne Arbeitsabläufe auswirken.
  Keine zusätzlichen Zielgruppen, Erfolgskriterien oder Präferenzen erfinden.
- **Bereits geklärt:** bestehende Gestaltungsrichtung aus DEC-017 bis DEC-019.
  Die jetzt angelegte Sammlungsstruktur ist Dokumentationspflege; sie legt
  weder eine neue Ästhetik noch Produktprioritäten fest.
- **Vor:** einer Umsetzung, die bislang nicht konkretisierte Nutzerwünsche benötigt.
- **Bezug/Quellen:** [DEC-017](DECISIONS.md#dec-017),
  [DEC-018](DECISIONS.md#dec-018), [DEC-025](DECISIONS.md#dec-025),
  [Produktsammlung](PRODUCT.md), [Designreferenzen](../design/references/).
  Herkunft der Sammlungsstruktur: ausdrücklicher Docs-as-Code-Auftrag vom 17.11.2026.

## Name, Bereitstellung und technische Optionen

<a id="oq-021"></a>
### OQ-021 — Produktname

- **Offen:** Auswahlkriterien, endgültige Wahl und gesonderte Namens-/Domain-
  Verfügbarkeitsprüfung. Keine Verfügbarkeit wurde hier geprüft.
- **Bereits geklärt:** TERRASTRA, TERRAMETRA und PARAMETRA sind gleichberechtigte
  Kandidaten, kein Umbenennungsauftrag.
- **Vor:** endgültiger Benennung/Veröffentlichung.
- **Bezug/Quelle:** [DEC-026](DECISIONS.md#dec-026).

<a id="oq-022"></a>
### OQ-022 — Desktop-Paketierung, Sicherung/Export und öffentlicher Webbetrieb

- **Offen:** konkrete Windows-Verteilung und Laufzeitinstallation; Nutzerablauf
  für Sicherung/JSON-Import/-Export; Anforderungen an öffentlichen Betrieb,
  Authentisierung, Projektrechte und Mehrbenutzerspeicherung.
  Optionale Rhino-/Grasshopper-Transportintegration ist nicht konkret freigegeben.
- **Bereits geklärt:** lokaler Loopback-Server, SQLite und optionale Adapter.
  Der lokale Prototyp ist keine fertige öffentliche Web-API; bestehende
  JSON-Serialisierung ist noch keine vollständige Sicherungsoberfläche.
- **Vor:** Paketierung, Exportoberfläche, externer Integration oder Netzfreigabe.
- **Bezug/Quellen:** [DEC-002](DECISIONS.md#dec-002),
  [DEC-009](DECISIONS.md#dec-009), [Architektur §8/11](ARCHITECTURE.md),
  [Phase 1](phase1.md), [3B.2-Grenzen](phase3b2.md).

<a id="oq-023"></a>
### OQ-023 — API-Vertragspflege und möglicher Frameworkwechsel

- **Offen:** ob wachsender Umfang einen Wechsel zu FastAPI/Pydantic,
  OpenAPI-/TypeScript-Generierung oder zusätzliche Frontend-Laufzeitvalidierung rechtfertigt.
  Das sind technische Optionen, keine beschlossene Migration.
- **Bereits geklärt:** Standardbibliothek-Transport und zentrale Domänenvalidierung
  bleiben der aktuelle Vertrag; vorhandene manuelle Typen/Prüfungen nicht verwerfen.
- **Vor:** begründeter Änderung der Transport-/Vertragsschicht.
- **Bezug/Quellen:** [DEC-002](DECISIONS.md#dec-002),
  [DEC-009](DECISIONS.md#dec-009), [Architektur §9/11](ARCHITECTURE.md),
  [3B.2](phase3b2.md).

<a id="oq-024"></a>
### OQ-024 — Skalierung, Beschriftung und Aktualität externer Änderungen

- **Offen:** gemessene Lastgrenzen und daraus abgeleiteter Bedarf für
  Pagination, Ereignis-/Bereichsabrufe, räumliche Indizes, Beschriftungsplatzierung
  oder Echtzeitbeobachtung externer Änderungen; konkrete Leistungsziele fehlen.
- **Bereits geklärt:** aktuelle Projektliste validiert alle Projekte,
  Jahresprojektion wächst mit Beeten/Vorgängen, Konflikte sind teils paarweise.
  Innerhalb eines geladenen Jahres bleibt ein revisionsgebundener Schnappschuss
  nutzbar; dies ist keine Echtzeitgarantie. Lange Labels können sich überlagern.
- **Vor:** Optimierung oder Zusage zu Skalierung/Aktualität; erst messen.
- **Bezug/Quellen:** [DEC-008](DECISIONS.md#dec-008),
  [DEC-018](DECISIONS.md#dec-018), [DEC-031](DECISIONS.md#dec-031),
  [Architektur-Risiken](ARCHITECTURE.md), [3B.2](phase3b2.md),
  [3B.3c-Grenzen](phase3b3c.md), [3C.2-Grenzen](phase3c2.md).

## Ausstehende Prüfnachweise — keine offenen Produktentscheidungen

| ID | Dokumentierter offener Nachweis | Quelle |
|---|---|---|
| QA-001 | Physischer Shift-Drag einschließlich Loslassen und eingeblendeter Winkelanzeige; Logik automatisiert geprüft, damalige Browsersteuerung konnte die Kombination nicht zuverlässig bedienen | [3B.3c — UI-Feinschliff](phase3b3c.md), DEC-028 |
| QA-002 | Gesonderte Bedienprüfung mit physischen Touch-/Stiftgeräten | [3B.3b](phase3b3b.md), [3B.3c](phase3b3c.md) |

Hier werden keine Nachweise als erledigt erklärt, die im vorhandenen Bericht
offen bleiben. Ob ein separater gemeinsamer Abnahmetermin stattgefunden hat,
muss durch einen tatsächlichen Nachweis fortgeschrieben werden.

## Historisch offene, inzwischen geklärte Punkte

Diese Punkte werden nicht erneut als offene Entscheidung aufgenommen:

| Frühere Frage | Klärung / Nachweis |
|---|---|
| Ursprüngliche Abnahmefälle 3–6 | In Phase 2 mit synthetischen Daten automatisiert; [acceptance.md](acceptance.md) |
| Shapely-Version/Windows-Kompatibilität | Shapely 2.1.2, [3B.1](phase3b1.md), aktuelles `pyproject.toml` |
| Lokaler Speicher-/Fehler-/Revisionsvertrag | SQLite und lokale API, [3B.2](phase3b2.md), DEC-009 |
| Projektansicht und Welt-/SVG-Transformation | [3B.3a](phase3b3a.md); spätere Bearbeitung ergänzt diesen Stand |
| Anlegen, Verschieben, numerische Bearbeitung, Rotation, bestätigtes Löschen | [3B.3b](phase3b3b.md), [3B.3c](phase3b3c.md), DEC-027/028 |
| Persistente Kulturabsichten und informative Überschneidungen | [3C.1](phase3c1.md), DEC-029/030 |
| Wochenansicht gespeicherter Projekte und ISO-Wochenregeln | [3C.2](phase3c2.md), DEC-031; echte Scheduler-Ergebnisse weiterhin OQ-007 |

## Fortschreibung

17.11.2026: Erstkonsolidierung vorhandener offener Details und Datenlücken.
Alle DEC-IDs, Begründungen, Phasenberichte und lokalen EXP-Entscheidungen bleiben
erhalten. Keine Frage wird allein durch Aufnahme in dieses Register beschlossen.
