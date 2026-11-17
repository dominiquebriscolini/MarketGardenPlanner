# LIGHT 03 — feste Isometrie und Verschattung

Stand: 17.11.2026. Lokale Anwendung: http://127.0.0.1:8773/

## Tatsächliche Änderungen

- Winkelknöpfe und ihre Steuerung entfernt. Alte `?view=`-Links werden auf die
  Standardansicht bereinigt. Auch der Renderer akzeptiert keine Kameradrehung mehr.
  Projektion und Nordausrichtung bleiben fest; Zoom und Pan bleiben erhalten.
- Gemeinsame, unveränderliche Sonne in `lighting.js`: Weltlichtrichtung
  `normalize([-0.32, 0.08, 1])`. Ihre Projektion zeigt nach links oben; die
  Projektion eines Punktes entlang der Gegenrichtung auf z=0 verschiebt den
  Schatten nach rechts unten. Keine zweite Lichtquelle, keine Materialglanzlichter.
- Diffuses Licht aus Flächennormalen und echte Abschattung durch andere Geometrie.
  Untere Pflanzenteile erhalten weniger Umgebungslicht. Gegenüberliegende bzw.
  sichtbare Blattrückseiten bleiben dunkler. Die Alpha-/Zeichen-/Punktabstufung
  nutzt den größeren Tonwertumfang auch bei 5–6 px.
- Weicher geometrischer Bodenschatten aus demselben Sonnen-Tiefenfeld. Dunkle
  Halftone-Punkte, im ASCII-Modus echte Schriftzeichen, erzeugen eine gegliederte
  Silhouette statt einer Ellipse. Der Pflanzenfarbsatz bleibt unverändert;
  lediglich eine dunkle Schattenfarbe ergänzt den Hintergrund.
- Hybrid und 5 px bleiben Standard. `model.js` und `wind.js` sind per SHA-256
  bytegleich zum Beginn dieses Schritts: 143 Einzelblättchen, 12 Früchte,
  vier Blüten, insgesamt 1.467 Modellprimitive. Keine Wachstumslogik ergänzt.

## Gemeinsamer Lichtvertrag

`LightingField.build(forms)` erhält bereits transformierte und windverformte
Weltkoordinaten. Die Formen können von Pflanzen oder anderen späteren Objekten
stammen: triangulierte Flächen, Stängelpolylinien mit Radius, Kugelfrüchte oder
einfache Blütenpolygone. Für mehrere Objekte werden ihre Weltformen zusammen
übergeben, damit sie sich mit derselben Sonne gegenseitig verschatten.

Das 256×256-Lichttiefenfeld verwendet die Sonnenstrahlkoordinaten
`(x − Lx/Lz·z, y − Ly/Lz·z)` und speichert die höchste abdeckende Oberfläche.
Dreiecke verwenden baryzentrische Tiefe, Kugeln einen analytischen Strahlschnitt.
Stängel werden entlang ihrer vorhandenen 3D-Polylinien abgetastet. Feinste Adern
unterhalb 2 mm Radius werden im Lichtfeld nicht als eigenständige Schattenspender
abgetastet; die darunterliegende Blattfläche wirft weiterhin ihren Schatten.

Neun gefilterte Lichtproben und ein neigungsabhängiger Bias vermeiden harte
Eigenverschattungskanten und Selbstschattenartefakte. Die Bildschirmverdeckung
bleibt der bisherige opake Z-Buffer mit neun Proben pro Zeichenrasterzelle.
Punktlücken zeigen deshalb keine rückwärtigen Pflanzenflächen.

Der Bodenschatten verwendet die projizierte tatsächliche Silhouette aus dem
Lichtfeld. Ein separabler Gaußfilter erzeugt eine weiche Kante; es gibt keine
unabhängig platzierte Schattenellipse. Der Schatten liegt auf der Weltebene z=0
und folgt Kamera-Pan und Zoom konsistent.

Zur Begrenzung der Rechenkosten wird nur das weiche Lichttiefenfeld maximal zehnmal
pro Sekunde erneuert; die Original-Windverformung der sichtbaren Pflanzenpunkte
läuft weiterhin bei jedem Renderbild. Die gefilterte Bodenschattenebene wird bis
zur nächsten Lichtfeld-/Kamera-/Rasteränderung zwischengespeichert. Die Windfunktion,
Zeitsteuerung und Bewegungsparameter wurden nicht geändert.

## Prüfung

**53 Prüfungen bestanden:**

- 12 Lichtprüfungen in `light-test.html`: obere linke Sonne, untere rechte
  Schattenrichtung, Abschattung unter einem Blatt, freie Sonnenexposition,
  deutlich dunklere untere Fläche, dunkle abgewandte Fläche, geometrischer
  Bodenschatten, schattenfreier Außenbereich, ignorierte Kamerawinkel,
  realer Pflanzenschatten und Kontrast bei 5 sowie 6 px.
- 23 räumliche Prüfungen in `depth-test.html`, nun ausschließlich in der festen
  Standardansicht: Geometrie, verdeckte Flächen, kreuzende Flächen, Kugelvorderseite,
  identische Sichtbarkeit aller Modi und Reihenfolgeunabhängigkeit.
- 18 bestehende Renderer-/Windprüfungen in `test.html`, einschließlich echter
  ASCII-/Kreisaufrufe, deterministischer Bilder und Auflösungsänderung.

Blatttöne im gemessenen statischen 5-px-Bild: 10. Perzentil 48/255, 90. Perzentil
223/255. Das ist ein deutlicher Helligkeitsumfang ohne zusätzliche Blätter.
3.536 Schattenrasterzellen im Testbild bei 800×740 px.

Letzter vollständiger 30-Bilder-Testlauf (800×740, bewegte Geometrie, volle
Schattenaktualisierung bei jeder Test-Zeitstufe): ASCII Median 56,8 ms,
Halftone 42,3 ms, Hybrid 43,5 ms; Hybrid p95 47,5 ms. Diese Hostmessungen sind
lastabhängig, keine Zusage von 60 fps. Der erste Aufbau ist teurer; die laufende
Ansicht kann Licht-/Bodenschatten zwischenspeichern.

Visuell im Browser geprüft: stärkere Blattoberseiten-/Unterseitenabstufung,
dunkle innere Partien und ein gegliederter weicher Schatten rechts unten;
alle drei Render-Modi sowie 5 und 6 px. Keine Winkelknöpfe, kein neuer Kameramodus,
keine Warnungen oder JavaScript-Fehler in den abgefragten Logs. Am Ende Hybrid,
5 px und unveränderte Windbewegung aktiv. Server läuft auf dem bestehenden Port.

`depth-review.html` ist jetzt ausdrücklich ein Archiv mit einem historischen Bild
von DEPTH 02. Die aktuelle Anwendung verlinkt es nicht und benötigt es nicht.

## Grenzen

Endliche Lichtfeldauflösung und Schatten-Bias können kleinste Kontakt-/Aderdetails
vereinfachen. Die Schattenkante ist gefiltert, keine physikalische Flächenlicht-
Simulation. Keine Mehrfachreflexion, keine spektralen oder realistischen Materialien.
Große Bodenschatten können am Rand des aktuellen Ausschnitts abgeschnitten sein;
Zoom und Verschieben zeigen weitere Bereiche ohne Änderung der Orientierung.

Alle Änderungen dieses Schritts liegen im Botanical ASCII Lab. Keine Änderungen
am Planner, seinen Startdateien, Backend, Daten oder zentralen Entscheidungen.
