> Historischer Stand. Die aktuelle feste Ansicht und Verschattung sind in [LIGHT-STUDY.md](LIGHT-STUDY.md) dokumentiert.

# Räumliche Tiefe — 17.11.2026

Die bestehende Tomatenpflanze wurde räumlich überarbeitet. **Keine zusätzlichen
Blätter:** weiterhin 13 zusammengesetzte Blätter, 143 Einzelblättchen, 12 Früchte,
vier Blüten und insgesamt 1.467 Modellprimitive. Hybrid und 5 px bleiben Standard.

## Geometrie

Die elf wechselständigen Blattknoten und der vorhandene Achseltrieb wurden neu
ausgerichtet. Die Blattstiele besetzen alle vier XY-Quadranten. Die Mittelpunkte
der Einzelblättchen liegen ungefähr zwischen −0,43/+0,44 m in X und −0,46/+0,36 m
in Y (synthetische Modellmaße). Die Krone besitzt damit in beiden horizontalen
Richtungen eine ähnliche Ausdehnung statt einer bevorzugten Fächerebene.

Jedes Einzelblättchen besitzt 15 Längsstationen und fünf Querstationen, verbunden
zu 112 Dreiecken. Ein lokales orthogonales Bezugssystem bestimmt Längsachse,
Querachse und Oberflächennormale. Blattneigung, eine kleine Wölbung der Mittelrippe,
eine flache Querschüssel, fortschreitende Verdrehung und leichtes Herabhängen der
Spitze ergeben die räumliche Fläche. Die bisherige unpaarig gefiederte Struktur,
kleinen Zwischenfiedern und gezähnten Ränder bleiben erhalten. Haupt- und
Nebenadern liegen auf derselben Flächenfunktion. Alle Parameter sind deterministisch.

Die zusätzliche Tessellierung beschreibt dieselben Blätter genauer und erzeugt
keine zusätzlichen sichtbaren Pflanzenorgane. Von jeder geprüften Blickrichtung
zeigen einige Blattoberseiten zum Betrachter, andere stehen seitlich oder zeigen
die Unterseite. An den Mittelrippen wurden bei 0°/45°/90° jeweils 29/29/22 von 143
Blättchen als rückseitig orientiert gemessen; dies sind Orientierungen, keine
Zählung vollständig sichtbarer Blätter nach Verdeckung.

## Kamera, Verdeckung und Licht

Die Isometrie bleibt `u=(x−y)√3/2`, `v=(x+y)/2−z`. Für die Prüfansichten wird vor
der Projektion ausschließlich um Z gedreht; Elevation, Zoom und Ausschnitt bleiben
gleich. `depth=(x+y+z)/√3` ist die Koordinate entlang des normierten Kamerastrahls.
Eine positive größere Tiefe liegt näher am Betrachter. `yaw` ist nur eine optionale
Renderer-/Prüfoption, kein neues Bedienelement der Hauptoberfläche.

**visibility.js** ersetzt die frühere Sortierung ganzer Formen nach mittlerer Tiefe.
Ein Software-Z-Buffer mit neun Proben je Zeichenrasterzelle bestimmt pro Probe die
sichtbare Oberfläche. Dreiecke interpolieren die Tiefe baryzentrisch, Stängelsegmente
verwenden eine gerundete Röhrenoberfläche und Früchte die Vorderseite einer echten
Kugel in Kamerakoordinaten. Auch eine Frucht mit dahinterliegendem Mittelpunkt kann
deshalb korrekt vor einem Blatt erscheinen, wenn ihre Vorderseite hervorsteht.
Die Tiefenprüfung ist unabhängig von der Reihenfolge der Modellprimitive.

**renderer.js** erhält erst danach Material, Helligkeit und Stängelrichtung der
vordersten Probe. Dieselbe Sichtbarkeitsmaske gilt für ASCII, Halftone und Hybrid.
Leere Bereiche zwischen Glyphen oder Punkten zeigen ausschließlich den dunklen
Hintergrund, nicht zuvor gezeichnete hintere Pflanzenteile. Bei freien Zellzentren
sichern benachbarte Proben dünne Stiele und Konturen; an Silhouetten bleibt die
Ausgabe deshalb eine Rasterapproximation.

Eine einzige feste Weltlichtrichtung `normalize(−0,45,−0,65,1)` von schräg oben
liefert einen zurückhaltenden diffusen Helligkeitsanteil. Flächennormalen sowie
Vorder-/Rückseite bestimmen subtile, diskrete Tonwerte; ein begrenzter Tiefenanteil
beträgt höchstens ±0,025. Kein Canvas-Verlauf, kein Glanz, kein Schattenwurf und
keine zusätzlichen Lichtquellen oder realistischen Materialtexturen. Blattdreiecke
sind flach schattiert; Kugeln verwenden diskrete Tonstufen statt weicher Verläufe.
Kameradrehungen drehen die Weltlichtquelle nicht mit.

Palette, Glyphenrampe, hybride Zellverteilung und Abbildung von Tonwert auf
Punktgröße/-dichte wurden nicht erhöht oder umgestaltet. Die Raumwirkung entsteht
durch Orientierung, Krümmung, Selbstverdeckung und die daraus abgeleiteten Tonwerte.

## Unveränderte Dateien

`wind.js`, `index.html`, `style.css` und `app.js` sind bytegleich zum Ausgangsstand,
per SHA-256 geprüft. Insbesondere keine neue Windfunktion, keine anderen Böen oder
Zeitparameter, kein Kamera-Bedienfeld und keine Änderung der Hauptoberfläche.
Die Windfunktion wird lediglich wie zuvor auf die nun räumlicheren 3D-Punkte angewandt.
Die Palette in renderer.js enthält dieselben fünf Farben und denselben Hintergrund.

Alle Quelländerungen dieses Arbeitsschritts liegen im Experimentordner. Bestehende
Planner-Dateien, zentrale Entscheidungen und Daten wurden nicht verändert.
Die lokale Entscheidung EXP-003 dokumentiert die Ablösung des früheren Renderpfads.

## Prüfungen und Ergebnisse

**55 neue Tiefen-/Geometrieprüfungen und 18 bestehende Rendererprüfungen bestanden.**

`depth-test.html` prüft unter anderem:

- unveränderte Organ- und Primitivanzahl, deterministische und endliche Geometrie;
- jedes Einzelblättchen mit mehr als 1 mm Abweichung von seiner lokalen Bezugsebene;
- Krone in allen vier horizontalen Quadranten und konsistente Projektions-/Tiefenachsen;
- bei 0°, 45°, 90° in allen drei Modi pixelgleiche Ausgabe bei umgekehrter
  Primitivreihenfolge und identische Eigentümer des Tiefenpuffers;
- in allen drei Modi exakt dieselbe Sichtbarkeit je Blickrichtung;
- vollständige Unterdrückung hinterer Blatt-/Stängel-/Fruchtflächen, auch in den
  freien Zwischenräumen der sichtbaren Zeichen oder Punkte;
- kreuzende Flächen mit vorn wechselnder Oberfläche innerhalb derselben Polygone;
- korrekte Kugelvorderseite bei hinter dem Blatt liegendem Fruchtmittelpunkt.

Der unveränderte Test `test.html` bestätigt weiterhin echte Text-/Kreisaufrufe,
deterministische Pixel bei fester Zeit, Auflösungsänderung und Windverträge.
Gemessener 30-Bilder-Lauf bei 800 × 740 px, 5 px Zeichen und bewegter Geometrie:

| Modus | Median | 95. Perzentil | statische Zeichen | statische Punkte |
|---|---:|---:|---:|---:|
| ASCII | 23,9 ms | 37,9 ms | 4.688 | 0 |
| Halftone | 19,4 ms | 29,6 ms | 0 | 4.787 |
| Hybrid | 20,1 ms | 46,0 ms | 2.318 | 2.382 |

Die Zähler stammen vom statischen Bild bei Wind 0. Gegenüber Experiment 01 wurde
die Zahl der ausgegebenen Zeichen/Punkte bei dieser Kamera nicht erhöht. Die
Werte sind geräte- und lastabhängig, kein Nachweis konstanter 60 fps.

## Visuelle Abnahme

`depth-review.html` zeigt dieselbe Pflanze bei 0°, 45°, 90° in jedem Modus sowie
einen Vorher-/Nachher-Vergleich. Die Ansicht ist ein separates Prüfwerkzeug; die
Hauptoberfläche bleibt unverändert. Der PNG-Export erhält native 700 × 850 px pro
Ansicht und enthält keine hochskalierten Zeichen. Die Vergleichsbilder verwenden
5 px, Wind 0, dieselbe Kameraelevation und denselben Zoom.

Alle neun Kombinationen wurden im Browser betrachtet. Die Krone bleibt aus den
drei Richtungen breit und mehrschichtig, mit wechselnden Verdeckungen, sichtbaren
schmalen Blattkanten und unterschiedlich ausgerichteten Blattflächen. Bei 45°
entsteht besonders deutlich eine Vorder-/Hinterstaffelung um den Stamm. Der
Vergleich mit dem gesicherten Ausgangsstand zeigt weniger seitliche Fächerwirkung.
Hauptansicht mit Hybrid, 5 px und unveränderter Windanimation ebenfalls geöffnet;
keine Warnungen oder JavaScript-Fehler in den abgefragten Logs.

### Verbleibende Grenzen

Die Oberflächen haben keine Blattdicke; exakt kantenparallel betrachtete Blätter
können daher sehr dünn werden. Die Verdeckung ist an den neun Subrasterproben
korrekt, aber keine kontinuierliche analytische Sichtbarkeitslösung an jeder
beliebigen Stelle zwischen den Proben. Sehr kleine Blüten/Blattzähne bleiben bei
5 px abstrahiert. Kein physikalisches Lichttransport-, Schatten- oder Windmodell.
Die botanische Geometrie bleibt eine gestaltete Studie, keine Sortenrekonstruktion.

## Erneut öffnen

Mit `start.ps1` den lokalen Server starten, dann:

- Hauptansicht: http://127.0.0.1:8773/
- Vergleich: http://127.0.0.1:8773/depth-review.html
- Neue Prüfungen: http://127.0.0.1:8773/depth-test.html
- Bestehende Prüfungen: http://127.0.0.1:8773/test.html

Der temporäre QA-Server wird nach der Prüfung beendet. Bereits geladene Ansichten
bleiben bedienbar; für Neuladen und weitere Seiten den Server erneut starten.
