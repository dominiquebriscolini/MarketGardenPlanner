# VIS-001 — Etappe 1 · Technischer Abschlussbericht

Datum: 17.11.2026. Basis: Git-HEAD `20e6a63`, vorhandener uncommitteter Stand.
Status: implementiert, automatisch und im Browser geprüft. **Fachliche Abnahme
ausstehend.** Keine Freigabe einer Planner-Integration oder der Etappe 2.

## Auftragsumfang und Ergebnis

Start: <http://127.0.0.1:8773/>. Der bestehende lokale Server läuft weiter.
Startskript und HTTP-Server unverändert; no-store-Antworten und versionierte Module.
Die Startseite wurde im Browser neu geladen und als VIS-001 verifiziert.

Ein Beet von 2,75 m in X und 6,00 m in Y liegt zentriert auf Z=0.
Die drei Schaltflächen ändern ausschließlich die Szene:

| Variante | Reihen | Pflanzen | X-Positionen der Reihen in m |
| --- | ---: | ---: | --- |
| A (Start) | 1 | 10 | 0 |
| B | 2 | 20 | −0,6875; +0,6875 |
| C | 3 | 30 | −0,916667; 0; +0,916667 |

Für nullbasierte Reihe r, Slot s und Reihenzahl R:
`x = −1.375 + (r + .5) * 2.75 / R`,
`y = −3 + (s + .5) * 6 / 10`, `z = 0`.
Alle Reihen haben dieselben zehn Y-Positionen −2,7 bis +2,7 m, Abstand 0,6 m.
Dies sind synthetische Testparameter, keine Anbauempfehlung oder Produktstandards.

## Geänderte und neue Dateien

Alle nachstehenden Pfade sind relativ zu `experiments/botanical-ascii-lab/`.

| Datei | Änderung |
| --- | --- |
| `scene.js` (neu) | Positionen, Instanzen, statische Kontur, Weltpunktadapter, gemeinsame Startkadrierung |
| `visibility.js` | Nur Import und Aufruf des Weltpunktadapters statt direktem Windaufruf |
| `app.js` | A/B/C-Szenenauswahl, gemeinsame Startansicht/Reset, Einzelansicht erhalten, Diagnose-Snapshots |
| `index.html` | Kompakter A/B/C-Schalter, synthetische Parameter, VIS-001-Beschriftung, Modulversion |
| `scene.test.mjs` (neu) | 13 Geometrie-/Instanztests ohne neue Abhängigkeit |
| `vis001-test.html`, `vis001-test.js` (neu) | 36 Tests gegen die reale Anwendung im 1280×900-Iframe; Canvas-Exporte |
| `vis001-render-test.html` (neu) | 6 Prüfungen gemeinsamer Tiefe, Verdeckung und Schatten |
| `README.md`, `DECISIONS.md`, dieser Bericht | Aktueller Lab-Einstieg, Herkunft/Status, Technik und Testergebnisse |
| `.qa/vis001/` (neu) | Rohprotokolle, sechs native Vergleichs-PNGs, Browseransichten |

Keine neuen Pakete, keine parallele Renderinglogik, keine Änderungen am Planner.
Die zentrale Dokumentation und ihre bereits vorhandenen Änderungen bleiben erhalten.
Die Erweiterung betrifft nur das Experiment; zentrale Produkt-/Roadmap-Ziele werden
dadurch weder umgesetzt noch als abgenommen markiert. Historische Lab-Berichte bleiben erhalten.

## Instanzierung und Wiederverwendung

`createTomato()` wird einmal aufgerufen. Jede Instanz verwendet exakt dieselben
Punkte, Flächen, Radien, Farben, Flex- und Phasenwerte. Die Metadaten enthalten
Instanzursprung und lokale ID; globale Primitive-IDs sind innerhalb der Gesamtszene
eindeutig. Pro Pflanze bleiben 1.467 Primitive erhalten, dazu eine Beetkontur:
A 14.671, B 29.341, C 44.011. Szenen werden beim ersten Anwählen erzeugt und behalten.

`worldPoint()` führt den bisherigen Wind auf lokalen Koordinaten aus und addiert
erst anschließend den Instanzursprung. Die Wurzeln bleiben dadurch an ihren
Beetpositionen. Phasen, Windfunktion und Zeitschritt sind unverändert; die Instanzen
haben entsprechend synchronisierte lokale Bewegung. Ohne Instanzmetadaten bleibt
die alte Einzelpflanzenberechnung exakt erhalten (`/?study=single`, Zoom 100 %).

Die geschlossene Beetkontur nutzt die vorhandene Stängel-Polylinie mit Radius 0,
Pflanzenfarbe und gemeinsamem Tiefenpuffer. Der bestehende minimale Bildschirmstrich
macht sie sichtbar; die bestehende Lichtlogik schließt solche Linien als
Schattenspender aus. Die Kontur wird nicht vom Wind verformt. Keine Bodenfüllung,
Beetdicke, Maßbeschriftung oder neue Materialdarstellung hinzugefügt.

Ein einziger bestehender Renderer verarbeitet die gesamte Szene: gemeinsamer
Kameratiefenpuffer, gemeinsame Sonnenkarte, vorhandene Bodenschatten und Paletten.
ASCII, Halftone und Hybrid bleiben dieselben Ausgabealgorithmen.

## Gemeinsame Kamera und unveränderte Parameter

Die feste 30°-Isometrie und Nordausrichtung bleiben unverändert. Einmal beim Start
berechnet `initialStudyView()` eine gemeinsame Hülle aus allen A/B/C-Positionen,
lokaler Pflanzengeometrie, projizierten Bodenschatten und Beetkontur. Hinzu kommen
0,55 projizierte Meter Reserve für den vorhandenen Wind bis Stärke 1 und Schattenrand.
Bildschirmabstände: links/rechts 32, oben 56, unten 64 CSS-Pixel.

Referenz bei 1280×900 Browserfläche und Canvas 922×768 CSS-Pixel:
Skalierung 93,394804 px/m, Zoom 0,2643648214 (Anzeige 26 %),
Pan [−12,744845; −242,103349] px. Der gleiche Ausschnitt gilt für A/B/C.
Zoom/Pan werden beim Wechsel weder neu berechnet noch zurückgesetzt. Reset stellt
diese gemeinsame Startansicht wieder her. Die untere manuelle Zoomgrenze erlaubt
ein Viertel dieses Startzooms; die vorhandene Obergrenze bleibt 3.
Nach Fenstergrößenänderung erfolgt kein automatisches neues Fit; Reset verwendet
weiter die ursprüngliche Startkadrierung. Auf kleinen Flächen sind Details gröber.

Hybrid, Rasterweite 5 px, Wind 55 % und bisheriges Theme-Verhalten bleiben Standard.
Der Wechsel erhält auch manuell gewählten Modus, Rasterweite, Rasteranzeige, Zoom,
Pan, Windstärke, Zeit, Pause und Theme. Pausierte Ansichten und Wind 0 zeichnen
nach einem Variantenwechsel neu. Licht-/Schattenparameter bleiben unverändert;
die berechneten Schatten ändern sich erwartungsgemäß mit der Pflanzenanordnung.

## Tests am 17.11.2026

| Prüfung | Ergebnis |
| --- | ---: |
| `node --test experiments/botanical-ascii-lab/scene.test.mjs` | 13/13 |
| `vis001-test.html` | 36/36 |
| `vis001-render-test.html` | 6/6 |
| bestehend `test.html` | 18/18 |
| bestehend `light-test.html` | 12/12 |
| bestehend `depth-test.html` | 23/23 |
| bestehend `theme-test.html` | 44/44 |
| **Gesamt** | **152/152** |

Node prüft die exakten Positionsformeln und Anzahlen, ID-Eindeutigkeit, identische
lokale Geometrie, deterministische Rückkehr, fest verankerte Wurzeln, Reihenfolge
Wind/Translation, statische Kontur und gemeinsame Hülle einschließlich maximalem Wind.

Die Browser-Integration bedient die echten A/B/C-, Theme-, Zoom-, Pan-, Wind-, Pause-
und Modusschalter. A→B→C→A in beiden Themes erhält alle Zustandswerte; die Rückkehr
zu A ist bei eingefrorener Zeit pixelgleich. Auch manuelle Kamera, Wind 37 %, Wind 0,
ein nichtnuller Animationszeitpunkt und ASCII bleiben erhalten. Alle Vergleichsbilder
verwenden dieselbe Browsergröße, denselben Ausschnitt, Hybrid und 5 px.

Der Szenentest weist alle 30 Instanzen und die Beetkontur im gemeinsamen Tiefenpuffer
nach, prüft identische Ausgabe bei umgekehrter Primitivreihenfolge und vollständige
Verdeckung einer hinteren Instanz entlang desselben Kamerastrahls. Die bisherigen
Modus-/Theme-Prüfungen decken die gemeinsamen Ausgabealgorithmen zusätzlich ab.
Die Einzelansicht wurde im Browser mit verborgenem A/B/C-Schalter und 100 % geprüft.

Rohprotokolle und Exporte: [.qa/vis001/](.qa/vis001/).
Es wurde keine Planner-Suite ausgeführt: Planner-Code wurde nicht verändert;
seine vorhandenen uncommitteten Änderungen gehören nicht zu diesem Auftrag.

## Tatsächliche visuelle Ergebnisse

Alle sechs nativen Vergleichs-PNGs wurden betrachtet:
[Dark A](.qa/vis001/dark-A.png), [Dark B](.qa/vis001/dark-B.png),
[Dark C](.qa/vis001/dark-C.png), [Light A](.qa/vis001/light-A.png),
[Light B](.qa/vis001/light-B.png), [Light C](.qa/vis001/light-C.png).

A zeigt eine mittige diagonale Pflanzenreihe mit freien Beetstreifen. B und C
verbreitern die Krone über die Beetfläche; im C-Bild entsteht ein weitgehend
zusammenhängender Bestand. Beet und Kronenspitzen passen ohne Abschneiden in den
gleichen Ausschnitt. Es gibt keine Rotation oder sprungartige Neukadrierung.
Blätter und Fruchtakzente bleiben typografisch/punktiert, Schatten liegen gesammelt
rechts unten. Überlagerungen verdecken hintere Pflanzenteile; keine durchscheinenden
hinteren Stängel wurden erkannt. In Light wirken die feinen Strukturen blasser,
in Dark sind verschattete Innenbereiche sehr dunkel. Einzelne Blattdetails und
zehn getrennte Silhouetten sind bei dieser Gesamtansicht nicht überall lesbar.
Raster, Kontrast und Pflanzendichte wurden deswegen nicht nachjustiert.

Die Hauptseite wurde zusätzlich in der schmalen App-Browseransicht geprüft:
Schalter und Pause funktionieren, Startzoom dort 23 %. Diese kleinere Ansicht
verliert weitere feine Details. Browserbelege liegen ebenfalls in `.qa/vis001/`.

## Leistung und verbleibende Einschränkungen

Einzelmessungen des letzten UI-Testlaufs, keine statistischen Benchmarks:

| Theme | A | B | C |
| --- | ---: | ---: | ---: |
| Dark | 256,8 ms | 601,9 ms | 946,7 ms |
| Light | 251,0 ms | 559,5 ms | 826,6 ms |

Der separate C-Tiefentest benötigte 1007,4 ms. In der schmalen App-Ansicht wurden
unter paralleler Testlast bis rund 2 s gemessen. Eine flüssige Windanimation ist
bei vielen Instanzen nicht erreicht; UI-Reaktionen können während des synchronen
Renderns verzögert werden. Der vorhandene Zeitschrittdeckel von 0,1 s bleibt
unverändert, deshalb läuft Animationszeit bei langsamen Frames langsamer als Echtzeit.
Keine Performanceoptimierung vorgenommen, wie für diese Etappe vorgegeben.

Weitere Grenzen: identische Modellinstanzen, rasterbasierte Verdeckung und begrenzte
Detailauflösung, keine agronomische Bewertung, keine Wachstumssimulation, kein
Rasterweiten-/Kontrastvergleich. Fachliche Abnahme und mögliche Folgeaufträge offen.

## Arbeitsstand und Schutz vorhandener Änderungen

Vor Beginn waren README, zentrale Architektur-/Produkt-/Entscheidungs-/Roadmap-
Dokumente, `docs/phase3c2.md`, drei Frontend-Dateien und `docs/history/` bereits
uncommittet. Diese wurden nicht bearbeitet. Der Git-Diff außerhalb des Labs wurde
vorher/nachher per SHA-256 verglichen; unversionierte History-Dateien separat.
Modell, Projektion, Wind, Beleuchtung, Themes, Renderer, Stylesheet und Server sind
bytegleich zum Ausgangsstand. Es wurden keine Dateien externer Projekte verändert,
keine Abhängigkeiten installiert und keine Git-Commits erstellt.
