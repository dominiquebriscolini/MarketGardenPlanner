> Historischer Erststand vom 16.11.2026. Die aktuellen Ergebnisse der räumlichen
> Überarbeitung stehen in [DEPTH-STUDY.md](DEPTH-STUDY.md).

# Testbericht — 16.11.2026

Getestet im lokalen Codex-In-App-Browser unter Windows, HTTP auf 127.0.0.1:8773.
Dies sind Messungen dieses Rechners, keine plattformübergreifende Leistungszusage.

## Automatisierte Browserprüfungen

**18 Prüfungen bestanden**, `test.html` meldet COMPLETE.

- Deterministisches Modell und ausschließlich endliche 3D-Koordinaten.
- Gleich lange isometrische Achsen und exakt 30° für die erste Bodenachse.
- Fester Windursprung, unveränderte Geometrie bei Stärke null.
- Sichtbare Auslenkung außen, stetiger Übergang über eine Böengrenze.
- Identische Verformung gemeinsam genutzter Ansatzpunkte.
- Je Modus: tatsächliche Canvas-Zeichen-/Kreisaufrufe, pixelgleiche Wiederholung
  bei festem Zeitpunkt und geringere Auflösung/Belegung bei größeren Zellen.

Statische Ausgabe bei 800 × 740 Pixel, Zeichengröße 5, Wind null:

| Modus | echte Schriftzeichen | Punktkreise |
|---|---:|---:|
| ASCII | 5.234 | 0 |
| Halftone | 0 | 9.680 |
| Hybrid | 2.209 | 4.729 |

Der Test zählt die tatsächlichen Methodenaufrufe des sichtbaren Canvas, nicht nur
einen UI-Modusnamen. Die unsichtbare Geometriemaske ist nicht das Ausgabebild.

Letzter gemessener 30-Bilder-Lauf pro Modus nach Bündelung der Punktpfade:

| Modus | Median | 95. Perzentil |
|---|---:|---:|
| ASCII | 37,6 ms | 60,6 ms |
| Halftone | 25,8 ms | 40,2 ms |
| Hybrid | 24,5 ms | 91,6 ms |

Vorherige Läufe lagen teils niedriger (etwa 20–27 ms Median). Synchroner Testlauf,
JIT/GC und Hostauslastung beeinflussen die Werte deutlich. Kein Nachweis konstanter
60 fps; insbesondere die Ausreißer sind eine Grenze des ersten Prototyps.
Die interaktive Ansicht animiert über requestAnimationFrame; eine pausierte,
unveränderte Ansicht rendert nicht weiter. Keine Langzeit-Frametiming-Messung.

## Manuelle Browserprüfung

- Seite und Module per HTTP erfolgreich ausgeliefert (Status 200).
- Alle drei Modi geöffnet und als Screenshots verglichen.
- ASCII zeigt echte Glyphen; Halftone hat deutlich geschlossenere Punktflächen;
  Hybrid hält die Stängel typografisch und kombiniert Blatttexturen.
- Regler bis 16 px geprüft: Raster sinkt in der Testansicht von 239 × 150 auf
  74 × 46 Zellen; deutlich weniger Details. Rückkehr auf 5 px geprüft.
- Zeichenraster, Pause und Windregler betätigt; 100 % Wind zusätzlich als
  zeitlich getrennte Screenshots geprüft. Außenblätter ändern deutlich die Lage,
  der Hauptstamm bleibt vergleichsweise ruhig.
- Zoomknöpfe, Pfeiltasten-Pan, Mausziehen und Mausrad getestet; Reset auf 100 %.
- Keine Warnungen oder JavaScript-Fehler in den abgefragten Browserlogs.
- Alle fünf JS-Module zusätzlich mit dem Node-VM-Modulparser syntaktisch geprüft.

## Visuelle Beurteilung und Grenzen

Tomatenmerkmale sind über gefiederte, gezähnte Blätter, kleinere Zwischenfiedern,
hängende rote/grüne Fruchtgruppen und obere Blüten erkennbar. Die Silhouette ist
asymmetrisch und nicht kachelartig. Die Fiedern wirken stellenweise noch sehr
regelmäßig; die botanische Modellierung kann in einer weiteren Studie verbessert
werden. Kleine Blüten und Zähnung gehen bei grobem Raster verloren.

Blattflächen und Fruchtkonturen sind im Halftone-Modus am geschlossensten.
ASCII wirkt erwartungsgemäß luftiger; bei 5 px sind einzelne Zeichen ohne
Vergrößerung klein. Der Zeichengrößenregler verändert echte Auflösung.

Desktopprüfung bei circa 1101 × 883 Browserpixeln. Ein versuchter Viewport-Override
auf 390 px wurde von der Browserumgebung nicht angewendet; mobile Darstellung
ist deshalb nicht visuell abgenommen. Temporären Override anschließend aufgehoben.

Die bestehenden Planner-Tests wurden nicht ausgeführt: Das Experiment importiert
keine Planner-Komponenten und ändert keine vorhandenen Dateien. Im Repository
waren bereits andere, laufend ergänzte Änderungen vorhanden; sie wurden weder
bearbeitet noch zurückgesetzt. Kein Commit und keine Editorintegration.
