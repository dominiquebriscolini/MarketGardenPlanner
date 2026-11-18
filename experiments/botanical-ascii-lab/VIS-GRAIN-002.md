# VIS-GRAIN-002 – Automatisierter Grainrad-Test

Die erwähnten Rohmessungen, Bilder und Atlanten sind historische Versuchsartefakte und in der bereinigten Kopie nicht enthalten.

18.11.2026 · Git-HEAD `20e6a63` mit vorhandenen uncommitteten Änderungen.
Isolierter Versuch gemäß Nutzerauftrag. Exportdateien automatisch ausgewertet,
PNG und Atlas visuell geprüft. Gemeinsame Designabnahme offen.
[Experimentfreigabe](../../docs/DECISIONS.md#lokale-experimentfreigabe-vis-grain-002).

## Aufbau

- Historische Tomatenreferenz, 469 × 588 px. Die Bildvorlage wurde aus dem Arbeitsstand entfernt. Das synthetische Test-GIF verwendet dieselbe Vorlage mit zyklischen horizontalen Verschiebungen von 0, +12, 0 und −12 px bei jeweils 250 ms.
- Playwright CLI 0.1.24, vorhandenes Headless Chrome 157 unter Windows, Grainrad mit WebGPU. Import über `setInputFiles` am Dateifeld, Wahl von ASCII und Download über die sichtbaren Bedienelemente. Ein direkter Klick auf das Dateifeld scheiterte an der darüberliegenden Dropzone.
- ASCII-Einstellungen: Scale 2, Spacing 0, Output Width 0, STANDARD, Original,
  schwarzer Hintergrund, Intensity 1 und Gamma 1. GIF-Preset Medium, 15 fps,
  2 s. Keine Kontoanmeldung erforderlich.

## Ergebnisse

| Prüfung | Ergebnis |
|---|---|
| Drei PNG-Exporte unmittelbar nach Effektwahl | Ein leeres, vollständig transparentes 300 × 150-PNG. Zwei unterschiedliche 460 × 576-PNGs. |
| Drei PNG-Exporte nach Canvas-/Schriftbereitschaft und einer Sekunde Wartezeit, Grain aktiv | Drei gültige 460 × 576-PNGs mit unterschiedlichen Dateihashes und RGBA-Pixeln. |
| Drei PNG-Exporte mit Grain aus, nach Canvas-/Schriftbereitschaft und zwei Browserframes | 3/3 byte- und pixelgleich, 460 × 576 px, vollständig opak. SHA-256 beginnt mit `413545849550ecb`. |
| GIF-Import und Export mit Grain aktiv | Gültiges ASCII-GIF mit bewegter Tomate, 30 unterschiedliche Frames. |
| Zwei GIF-Exporte mit Grain aus | Je 30 Frames bei 70 ms pro Frame (2,1 s), 460 × 576 px, Endlosschleife. Je drei unterschiedliche Bildzustände. Kein exakt gleicher RGBA-Zustand zwischen den beiden Exporten. Zustandswechsel bei 910/1960 ms bzw. 700/1680 ms. |

Die GIF-Aufnahme sampelt die Vorlage in diesem Versuch mit abweichender Dauer
und Startphase. Die Ursache der Pixelabweichungen zwischen den GIFs wurde
nicht isoliert. Der PNG-Nachweis gilt für diese Vorlage und diese Browserumgebung.
Die Automatisierung hängt an der öffentlichen Oberfläche und deren Einstellungen.

## Atlasprüfung

Die drei eindeutigen Zustände aus dem ersten GIF ohne Grain wurden verlustfrei
nach dem Dekodieren in drei PNG-Kacheln zu je 460 × 576 px gepackt. Der
Testatlas (`atlas-proof.png`) misst 1380 × 576 px.
Alle Kacheln sind vollständig opak, und der helle Vorlagenhintergrund erscheint
als dichtes Zeichenfeld. Für frei platzierbare Pflanzen wären eine Alphamaske,
ein konsistenter Fußpunkt und gepolsterte Kacheln für gefiltertes Sampling nötig.
Die Testbewegung verschiebt auch den Fußpunkt. Für eine reproduzierbare
Animation bietet sich an, fest definierte Eingabe-Frames einzeln als PNGs
zu exportieren und Zeitfolge und Fußpunkt beim Packen vorzugeben. Diese
Variante wurde hier nur für das statische PNG geprüft.

## Artefakte und Wiederholung

- PNG ohne Grain (`clean-1.png`), synthetisches Eingabe-GIF (`tomato-input.gif`), ASCII-GIF ohne Grain (`clean-1.gif`), ASCII-GIF mit Grain (`tomato-ascii.gif`).
- Messwerte mit Dateihashes, RGBA-Hashes und Framefolge (`measurements.json`).
- Im Repo-Stamm `playwright-cli -s=grain002 open https://grainrad.com --browser=chrome` und anschließend
  `playwright-cli -s=grain002 run-code --filename=experiments/botanical-ascii-lab/.qa/vis-grain-002/grainrad.playwright.js` ausführen. Das Skript überschreibt seine fünf Exportdateien.
  [Auswertung](.qa/vis-grain-002/inspect.py) verwendet Python mit vorhandenem Pillow (getestet mit 13.0.0 aus der Codex-Runtime) und schreibt den Testatlas.

Experimentdateien und Dokumentation ergänzt. Keine neuen Abhängigkeiten,
kein Grainrad-Quellcode, kein Git-Commit. Änderungen am Planner und eine
Rendererentscheidung lagen außerhalb des Versuchs. Die Planner-Regressionstests
wurden für den isolierten Browser- und Dateitest nicht ausgeführt.
