# Light/Dark Mode — THEME 04

Stand 17.11.2026. Aktuelle Anwendung: http://127.0.0.1:8773/

## Sichtbares Verhalten

Ein kompakter, tastaturbedienbarer Switch mit Sonnen-/Mondsymbol befindet sich
oben rechts. Dark ist die Standardeinstellung ohne gespeicherte Auswahl. Die
Auswahl wird ausschließlich unter dem lokalen Browser-Schlüssel
`botanical-ascii-lab:theme` gespeichert und beim nächsten Öffnen wiederhergestellt.
Ein früher Inline-Start setzt das Theme vor dem Stylesheet, um einen andersfarbigen
Zwischenzustand beim Öffnen zu vermeiden. Bei gesperrtem localStorage bleibt die
Umschaltung in der aktuellen Sitzung bedienbar; es werden keine Daten übertragen.

- Dark: Hintergrund exakt `#101713`, bisherige gedämpfte Pflanzenfarben,
  bisherige Alpha-/Tonabstufung und dunkler Schatten.
- Light: Hintergrund exakt `#F0EEE5`, dunkelgrüne entsättigte Druckfarben,
  gedämpfte rote/orange Früchte, graugrüner zurückhaltender Schatten.
- Seitenleiste, Kopfbereich, Texte, Buttons, Slider, Kontrollkästchen, Linien,
  Fokusmarkierung, Scrollbar und Zeichenraster wechseln mit.
- Hybrid und 5 px bleiben Standard. Keine zusätzlichen Bedienfunktionen,
  Kamerawinkel, Pflanzenorgane oder Bewegungseinstellungen.

## Technische Trennung

`themes.js` enthält zwei explizite Renderer-Paletten und die kleine Speicherlogik.
`renderer.js` erhält `theme` als reine Darstellungsoption. Der Renderer verwendet
Palettenhintergrund, Druckfarben, Schattenfarbe und Rasterfarbe direkt beim
Zeichnen. **Kein CSS-Filter, keine Bildinversion, kein zweites Lichtmodell.**

Die helle Palette bildet identische Beleuchtungswerte auf dunkleres Schattenink
und helleres entsättigtes Lichtink ab. Sie verwendet eine kräftigere Schrift und
höher deckendes Ink, damit feine Zeichen auf dem hellen Hintergrund lesbar bleiben.
Die rote/orange Materialfamilie der Früchte bleibt dabei erhalten. Geometrische
Glyphenpositionen, Zeichengröße, Punktradien, Punktzahl und Schattenabdeckung
bleiben identisch. Die dunkle Pflanzenpalette und ihre ursprüngliche Ink-Abstufung
bleiben erhalten; der Hintergrund wurde auf das ausdrücklich gewünschte #101713
gesetzt.

Die zwischengespeicherte Bodenschattenebene berücksichtigt jetzt zusätzlich das
Theme in ihrem Schlüssel. Dadurch wechselt auch ein pausierter Schatten sofort
mit der Palette, ohne die Schattengeometrie oder ihre Weichzeichnung zu verändern.
CSS-Variablen bilden die komplette UI-Palette ab; `color-scheme` und angepasste
Formularstile verhindern unpassende native weiße/dunkle Bedienelemente.

`model.js`, `projection.js`, `wind.js`, `lighting.js` und `visibility.js` sind
per SHA-256 bytegleich zum Beginn dieses Arbeitsschritts. Keine Änderung an
Pflanzengeometrie, fester Isometrie, Nordausrichtung, Lichtquelle, Eigenverschattung,
Schattenfeld, Wind oder Wachstum. Alle Änderungen liegen im Lab, nicht im Planner.

## Prüfung

**44 automatisierte Prüfungen bestanden** in `theme-test.html`:

- exakte gewünschte Hintergrundfarben;
- für ASCII, Halftone und Hybrid, jeweils bei 5 und 6 px:
  identische Tiefen/Eigentümer, Materialien/Beleuchtung, Sonnen-Tiefenkarte und
  gefilterte Schattenmaske, Glyphenpositionen/Punktradien, Zeichen-/Punkt-/
  Schattenzähler; tatsächlich andere Ausgabefarben; nach dem Zurückschalten
  pixelgenau wiederhergestellte dunkle Ausgabe.

Die Testseite verändert die gespeicherte Theme-Auswahl nicht.

Zusätzlich manuell im Browser geprüft:

- erster Aufruf ohne gespeicherte Auswahl startet dunkel;
- Light und Dark werden nach Neuladen korrekt wiederhergestellt;
- UI-Hintergrundfarben gemessen: rgb(240,238,229) und rgb(16,23,19);
- berechneter Canvas-CSS-Filter ist in beiden Themes `none`;
- feine Blattstrukturen und weicher Bodenschatten in Hybrid bei 5 und 6 px;
- ASCII und Halftone im Light Mode, Raster und Formularzustände;
- sichtbare Sonnen-/Mondauswahl, keine Warnungen/JavaScript-Fehler in den Logs;
- am Ende Dark, Hybrid, 5 px und die unveränderte Windbewegung aktiv.

Die feine 5-px-Darstellung bleibt bewusst abstrahiert; 6 px erleichtert das Lesen
einzelner Zeichen. Es gibt keine zusätzliche Flächenfüllung oder Blattdichte.
Die Theme-Erweiterung enthält keinen Umbau der vorhandenen Animationsleistung.

Vergleichsbilder und Testprotokoll liegen unter `.qa/theme-results/`.
