# Produkt — Zweck, Umfang und Weiterentwicklung

Stand der Übersicht: **18.11.2026**, vorhandener Arbeitsstand bis Phase 3C.2.
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

## Historischer Ursprung und betrieblicher Nutzen

Die [historische Übergabe](history/MarketGardenPlanner_Historische_Projektuebergabe_Teil1-4.md)
(Teil 1 §1 und §3, H-01/H-06 bis H-10) beschreibt den Ursprung als parametrisches
Grasshopper-Werkzeug: Beet- und Wegmaße ändern und deren geometrische Auswirkungen
unmittelbar sehen. Daraus entwickelte sich die eigenständige räumliche und
agronomische Anwendung aus DEC-002. Das ist historischer Kontext, kein Auftrag
für eine Rhino-/Grasshopper-Integration (OQ-022).

Die Wegeoptimierung hat einen betrieblichen Grund: Mehr Beetfläche kann durch
lange oder unpraktische Lauf- und Transportwege an Nutzen verlieren. Eingang,
Beete und später etwa Wasserstelle, Kompost oder Wasch-/Erntestation bilden
mögliche Wegbeziehungen; Schubkarre und Erntewagen veranschaulichen den Bedarf
an praktischer Zugänglichkeit. DEC-012/013 halten die gemeinsamen Ziele und
reale Wege fest. Stationen, Häufigkeiten, Breiten und Fahrzeuganforderungen
bleiben auszugestalten (OQ-001/015/016); Beispiele legen keine Standards fest.

Die früh überlieferte Größenordnung „bis zu 20 Sorten“ ist keine nachgewiesene
technische Grenze. Herkunft, Zuordnungen und Einschränkungen stehen im
[historischen Abgleich](history/HISTORISCHER_ABGLEICH_2026-11-17.md).

## Bestehende Funktionen

| Bereich | Nachweisbarer Umfang | Nachweis |
|---|---|---|
| Fachkern und Scheduler | Quellen-/Statusmodell, Bedarfsrechnung, Satzplanung, Belegung und Ernteereignisse; fehlende Daten bleiben fehlend | [Phase 1](phase1.md), [Phase 2](phase2.md), DEC-022/023 |
| Projektgeometrie | Ein metrisches Grundstückspolygon mit Löchern, frei rotierte Rechteckbeete, IDs, Revisionen, Sperren und Shapely-Validierung | [3B.1](phase3b1.md), DEC-003 bis DEC-008 |
| Speicherung/API | SQLite-Projekte, transaktionale Änderungen, erwartete Revision und Konfliktantworten | [3B.2](phase3b2.md), [3C.1](phase3c1.md), DEC-009/029 |
| Karte und Beeteditor | Projektanlage mit rechteckigem Grundstück, Projektwahl, Vollbildkarte, Zoom/Pan, Hover, Auswahl, Zeichnen mit optionalem Shift-Winkelraster, Verschieben, Rotation, numerische Maße/Position, editierbare Beetnamen, bestätigtes Löschen | [3B.3a](phase3b3a.md), [3B.3b](phase3b3b.md), [3B.3c](phase3b3c.md), DEC-027/028, [DEC-040](DECISIONS.md#dec-040), [DEC-041](DECISIONS.md#dec-041) |
| Kulturplanung | Persistente Nutzereingaben mit Start und optional geplanter Ernte; automatisches Speichern gültiger Eingaben, kompakte Liste, informative Überschneidungsprüfung und ID-gebundener Bearbeitungskontext | [3C.1](phase3c1.md), [3C.2-UX](phase3c2.md#ux-fortschreibung--bearbeitungskontext-17112026), DEC-029/030/032, [DEC-038](DECISIONS.md#dec-038) |
| Referenzertrag | Veröffentlichte, klar gekennzeichnete Ertragsreferenzen je Kulturvorgang bei passender Datenbasis | [DEC-043](DECISIONS.md#dec-043), [Agronomiequellen](agronomy-sources.md) |
| Projekt-Wochenansicht | Serverseitige ISO-Wochenprojektion, Folge-/gleichzeitige Kulturen, fehlende Erntetermine und eigene Kennzeichnung von Beeten ohne Kulturplanung, ohne Ertrags- oder Wachstumsannahmen | [3C.2](phase3c2.md), DEC-031, [DEC-039](DECISIONS.md#dec-039) |
| Isometrie und Darstellung | Informative SVG-Isometrie mit gemeinsamer Auswahl und Saisonposition, Pan und Zoom bei festem Blickwinkel, horizontalen Beetnamen, gleichmäßige VIS-GRAIN-004-Füllung mit vier schematischen Größenstufen und gemeinsamem Hell-/Dunkelmodus | [DEC-034](DECISIONS.md#dec-034), [DEC-035](DECISIONS.md#dec-035), [Umsetzung](phase-garden-views.md) |
| Demo | Getrennte synthetische Tagesansicht und schedulerbasierte Wochen-Ernteprognose; schreibgeschützt | [3A.2](phase3a2.md), [Ernteprognose](phase3a2-harvest.md) |

Geplante Ernte ist keine tatsächliche Ernte und kein Räumdatum. Die Projektansicht
zeigt zeitliche Planungsdaten; gespeicherte Projekte erhalten damit keine
automatisch berechneten Erntemengen. Fachliche Datenlücken stehen in
[agronomy-sources.md](agronomy-sources.md).

Die Basis von Phase 3C.2 ist in `20e6a63` gesichert. DEC-032 einschließlich
Zeilenhervorhebung und benannter Formularüberschrift ist im vorhandenen,
noch nicht eingecheckten Arbeitsstand implementiert. Frühere Prüfberichte
belegen keine neue gemeinsame Abnahme durch diesen Dokumentationsauftrag.

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
- Zwei komplementäre Gartenansichten auf gemeinsamer Datenbasis anbieten.
  Die **Beetplanung** in der 2D-SVG-Draufsicht dient der geometrischen
  Bearbeitung und zeigt Kulturvorgänge mit ihren Zeiträumen zur Einsicht.
  Kleine X markieren Pflanzplätze bei eindeutiger Wochenbelegung.
  Kulturvorgänge zeigen ihre Pflanzkapazität. Nummerierte Kulturreihen
  teilen das Beet je Anbauzeitraum auf. Anzeige und Referenzertrag folgen
  der Zuordnung. [DEC-044](DECISIONS.md#dec-044).
  [DEC-042](DECISIONS.md#dec-042). Die **Kulturplanung** in der
  Isometrie dient der saisonalen Visualisierung und Bearbeitung von
  Anbauvorgängen. Ihr Beetpanel konzentriert sich auf Kulturen und Termine.
  Beide Ansichten nutzen dieselben Garten-, Beet-, Kultur- und Saisondaten
  sowie dieselbe Beetauswahl und Saisonposition. [DEC-037](DECISIONS.md#dec-037).
- Die Isometrie zeigt erkennbare Pflanzreihen mit Pflanzensymbolen, deren
  grafische Verteilung von der Reihenlänge abhängt. Symbolzahl und
  Symbolabstand sind vom tatsächlichen Pflanzenbestand und seinen
  Pflanzabständen zu unterscheiden. Die agronomischen Berechnungen bleiben
  unverändert. Die Gestaltungsrichtung Monochrome Living Landscape gilt weiter.
  Die erste Ausbaustufe wurde separat freigegeben und umgesetzt. Die
  vollständige grafische Ausgestaltung bleibt offen. [DEC-034](DECISIONS.md#dec-034),
  [DEC-033](DECISIONS.md#dec-033), [DEC-017](DECISIONS.md#dec-017),
  [OQ-019](OPEN_QUESTIONS.md#oq-019).

Reihenfolge und verbleibender Umfang: [ROADMAP.md](ROADMAP.md).
Offene Ausgestaltung: [OPEN_QUESTIONS.md](OPEN_QUESTIONS.md).
Diese Ziele sind keine pauschale Implementierungsfreigabe.

## Vorschläge und unverbindliche Ideen

DP-001, VIS-GRAIN-003 und Botanical ASCII Lab haben Experimentstatus.
Die eigenständigen Experimente besitzen keine Nutzerabnahme. DEC-034 gibt
die Verwendung des VIS-GRAIN-003-Tomatenatlas in der ersten Planner-Isometrie
frei. Die Lab-Anwendungen bleiben eigenständige Experimente.

**Beauftragtes Experiment DP-001, 17.11.2026:** Der Nutzer wünscht eine einfache
Gesamtoberfläche mit vorbereiteten ASCII-Tomatenbildern, maximal 20 gemeinsamen
Animationsframes und dem Vergleich 10/30/100 Pflanzen. Die Umsetzung im getrennten
Lab ist eine Design-/Leistungsstudie mit Beispieldaten, keine Produktintegration
oder endgültige Gestaltungswahl. Canvas 2D und die konkrete Anordnung sind lokale
Versuchsauslegungen von Codex. [Spezifikation](features/DP-001.md),
[Ergebnis](../experiments/botanical-ascii-lab/DP-001.md). DEC-017/025 und OQ-019 bleiben erhalten.

**Beauftragtes Experiment VIS-GRAIN-003, 18.11.2026:** Der Nutzer wünscht
eine subtile, ressourcenschonende Windbewegung mit drei transparenten
ASCII-Posen derselben Tomatenreferenz und zehn versetzt animierten Pflanzen.
[Versuchsbericht](../experiments/botanical-ascii-lab/VIS-GRAIN-003.md).

- TERRASTRA, TERRAMETRA und PARAMETRA bleiben Namenskandidaten (DEC-026).
- Renderer, Pflanzenassets und konkrete Tilt-Shift-/Pixel-Art-Ausgestaltung
  sind noch nicht ausgewählt (DEC-025).
- FastAPI/Pydantic, generierte TypeScript-Verträge und konkrete technische
  Snapshot-Entwürfe bleiben Optionen, soweit nicht bereits durch DEC-009
  oder spätere Beschlüsse entschieden.
- Das [Botanical ASCII Lab](../experiments/botanical-ascii-lab/README.md)
  liefert isolierte Studien. Lokale EXP-Entscheidungen ändern weder die
  Produktgestaltung noch den Integrationsumfang des Planners.

### Historisch gesammelter Kontext — unverbindlich / zur Klärung

- **Namen, unverbindlich:** Die Übergabe (Teil 1 §8, H-28/HF-27) berichtet
  positive Nutzerbewertungen für TERRASTRA und TERRAMETRA. PARAMETRA und weitere
  Vorschläge gehören zur Namensgeschichte. Das ändert weder die gleichberechtigten
  Kandidaten aus DEC-026 noch OQ-021; Name und Verfügbarkeit bleiben ungeklärt.
- **Gestaltung, zur Klärung:** H-25 bezeichnet generatives ASCII/Halftone als
  beschlossene Richtung. Eine verbindliche Festlegung ASCII/Halftone versus
  Pixel-Art ist jedoch noch nicht abschließend geklärt (ausdrückliche
  Nutzerklarstellung im Bereinigungsauftrag vom 17.11.2026). DEC-017 und DEC-025
  bleiben unverändert. OQ-019/020 führen den Entscheidungsbedarf; die lokalen
  EXP-Entscheidungen des Botanical ASCII Lab wählen keinen Planner-Renderer.

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
Der Ordner und einzelne Spezifikationen werden bei konkretem Bedarf angelegt;
DP-001 ist die erste solche Spezifikation. Bestehende Phasenberichte bleiben als Nachweise erhalten.

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
