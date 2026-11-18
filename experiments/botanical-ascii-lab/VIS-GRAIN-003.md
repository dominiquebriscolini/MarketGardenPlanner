# VIS-GRAIN-003 – Transparente ASCII-Tomate im Wind

18.11.2026 · Git-HEAD `20e6a63` mit vorhandenen uncommitteten Änderungen.
Isolierter Nutzerauftrag, implementiert und im Browser geprüft.
Gemeinsame Designabnahme offen. [Experimentfreigabe](../../docs/DECISIONS.md#lokale-experimentfreigabe-vis-grain-003)
· [Vorversuch VIS-GRAIN-002](VIS-GRAIN-002.md).

## Ausführen und prüfen

Im Repository das bestehende Lab starten und
[VIS-GRAIN-003 öffnen](http://127.0.0.1:8773/vis-grain-003/).

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File experiments/botanical-ascii-lab/start.ps1
```

Die zehn Pflanzen stehen in zwei versetzten Reihen. Die mittlere Haltung
verbindet die beiden Ausschläge. Ein Zyklus dauert 4,8 s, jede Haltung
steht 1,2 s. Die zehn Phasen sind fest in 480-ms-Schritten über den Zyklus
verteilt. Ein gemeinsamer Timer aktualisiert die Szene alle 240 ms.
Zehn `drawImage`-Aufrufe je Aktualisierung verwenden denselben Atlas.
Pause und verborgener Tab halten den Timer an. Bei aktivierter
Bewegungsreduktion startet die Ansicht pausiert. Der Umschalter für hellen
Grund dient der Kontrolle der transparenten Zeichenkanten.

## Bilder und Transparenz

- Die [vorhandene Tomatenreferenz](../../design/references/02_vegetation/%7BC9BFABF6-B80E-4268-ADBD-E2BF970A8116%7D.png)
  liefert alle drei Haltungen. Eine zeilenweise horizontale Verformung
  nimmt nach unten stetig ab, ist ab Quellzeile 380 null und oben auf
  ±6 Quellpixel begrenzt. Die Vorlage bleibt 469 × 588 px. Die Bewegung
  ist synthetisch.
- Eine aus Helligkeit und Chroma der Vorlage abgeleitete Maske trennt die
  Pflanze vom hellen Hintergrund. Ein motivspezifischer Schnitt bei
  Quellzeile 500 entfernt den Erdhügel. Die Pflanze wird auf einen dunklen
  neutralen Grund gesetzt und die dunklen Blatttöne werden vor der
  ASCII-Umwandlung leicht angehoben.
- Playwright CLI 0.1.24 steuert sechs einzelne PNG-Exporte mit der
  erprobten ASCII-Konfiguration (Scale 2, Spacing 0, Output Width 0,
  STANDARD, Original, Grain aus). Pro Haltung gibt es einen schwarzen
  und einen weißen Exporthintergrund. Der RGB-Abstand zwischen beiden
  liefert die Zeichen-Alpha. Die Abstände der drei Kanäle unterschieden sich
  höchstens um einen 8-Bit-Schritt. Die aus der Quelle abgeleitete Maske
  begrenzt die Deckkraft pro 10 × 16-px-Zelle. Damit bleiben auch dunkle
  Pflanzendetails und teiltransparente Zeichenkanten erhalten.
- [Links](vis-grain-003/left.png), [Mitte](vis-grain-003/center.png) und
  [rechts](vis-grain-003/right.png) sind 460 × 576 px große RGBA-PNGs.
  Der [Atlas](vis-grain-003/atlas.png) ist 1392 × 580 px groß, mit je zwei
  transparenten Randpixeln um jede Kachel. [Atlas-JSON](vis-grain-003/atlas.json)
  enthält die Kachelrechtecke und den gemeinsamen Fußpunkt (225, 491)
  in Kachelkoordinaten. Die drei unteren Ausschnitte ab Ausgabezeile 380
  sind bytegleich, einschließlich des sichtbaren Fußpunkts. Jede
  Atlas-Kachel stimmt pixelgenau mit ihrem Einzelbild überein.

Die Freistellung wirkt auf beiden geprüften Hintergründen ohne sichtbaren
rechteckigen Rand. Orange Fruchtakzente und dünne Glyphen bleiben erkennbar,
sehr feine Strukturen gehen beim ASCII-Raster und besonders beim Verkleinern
teilweise verloren. Auf hellem Grund verlieren die hellgrünen Zeichen
Kontrast. Bei zehn Pflanzen fallen die Sprünge weniger gemeinsam auf. In
der Einzelpflanze wechseln beim Biegen sichtbar ganze Zeichen im Blätterdach.
Drei Haltungen reichen für eine ruhige, stilisierte Bewegung in der
Übersicht. Für weichere Nahansichten sind Zwischenbilder sinnvoll. Die
stärkste Einschränkung ist der diskrete Glyphenwechsel im festen Raster.

## Leistung

Headless Chrome 157 unter Windows. Zehn Pflanzen je Ansicht, dunkler
Hintergrund, 1440 × 1000 CSS-Pixel und DPR 1. Ein Messfenster je Ansicht
nach 600 ms Aufwärmzeit. VIS-001 lief in Variante A im ASCII-Modus mit
Standardwind (55 %), DP-001 mit seinem 8-Frame-Bildsatz.

| Ansicht | Canvas in px | Zeichnungen/s | Ø / P95 je Zeichnung | CDP TaskDuration je Messfenster | RGBA-Bildsatz |
|---|---:|---:|---:|---:|---:|
| VIS-GRAIN-003 | 1060 × 517 | 4,2 | 0,12 / 0,20 ms | 172 ms / 5,01 s | 3,08 MiB |
| DP-001 | 880 × 607 | 6,2 | 0,13 / 0,20 ms | 160 ms / 5,00 s | 0,79 MiB |
| VIS-001 | 1082 × 868 | 3,5 | 284,51 / 308,50 ms | 5462 ms / 5,20 s | — |

Die Zeichnungsdauer misst die synchrone Arbeit aus den jeweiligen
Ansichten. CDP TaskDuration umfasst auch Browserarbeit außerhalb der
Pflanzenzeichnung. Die Abfragegrenzen liegen
außerhalb des Messfensters im Seitenskript. Der Indikator kann bei langen
Tasks über dessen Dauer liegen. Canvas-Größen, Darstellungsqualität und
Zeichenfrequenzen unterscheiden sich. Der Vergleich erfasst weder
GPU-Präsentation noch den Gesamtprozessspeicher.

Der Abstand zu VIS-001 zeigt den Aufwand der laufenden Geometrie- und
Sichtbarkeitsberechnung in dieser Szene. Gegenüber DP-001 ist kein
belastbarer CPU-Vorteil erkennbar. Die höhere Auflösung vergrößert den
RGBA-Bildsatz trotz geringerer Framezahl. Mit 2,09 MiB für einen
Canvas-Backing-Store ergibt sich für VIS-GRAIN-003 eine rechnerische
Pixelnutzlast von rund 5,17 MiB. DP-001 liegt mit seinen zwei
Canvas-Flächen und dem 8-Frame-Satz bei rund 4,87 MiB.
[Rohmessung](.qa/vis-grain-003/benchmark.json).

## Änderungen, Nachweise und Wiederholung

- `vis-grain-003/` enthält Testansicht, Wiedergabe, drei RGBA-Bilder,
  Atlas/JSON, Offline-Aufbereitung und die beiden Playwright-Skripte.
- [.qa/vis-grain-003](.qa/vis-grain-003/) enthält Quelldateien, Masken,
  Schwarz-/Weißexporte und Prüfdaten. Browserbilder
  [dunkel](.qa/vis-grain-003/demo-dark.png) und
  [hell](.qa/vis-grain-003/demo-light.png). Die
  [GIF-Vorschau](.qa/vis-grain-003/animation.gif) zeigt einen vollständigen
  Zyklus aus den 20 tatsächlichen Canvas-Zuständen der Testansicht.
- Die Browserprüfung erfasst alle 20 Zeitschritte und bestätigt zehn
  Instanzen mit drei gleichzeitig sichtbaren Haltungen. Jede Instanz
  durchläuft alle Haltungen. Geprüft wurden außerdem Pause ohne weitere
  Zeichnungen, Bewegungsreduktion, heller Hintergrund und ein
  390 px breites Fenster ohne horizontalen Überlauf. Beide vorhandenen
  Lab-Testsuiten für die Szene liefen zusammen mit 16/16 Prüfungen durch.
  Die Planner-Suite wurde für den isolierten Versuch nicht ausgeführt.
- Zur Asset-Wiederholung `assets.py prepare` mit vorhandenem Pillow
  ausführen (getestet mit der Codex-Runtime, Pillow 13.0.0). Im Repo-Stamm
  `playwright-cli -s=grain003 open https://grainrad.com --browser=chrome`
  und `playwright-cli -s=grain003 run-code --filename=experiments/botanical-ascii-lab/vis-grain-003/export.playwright.js`
  ausführen, dann `assets.py pack`. Die Testansicht verwendet die
  vorgefertigten Dateien und läuft lokal ohne Grainrad-Verbindung.

Planner, VIS-001, DP-001 und VIS-GRAIN-002 wurden für den Versuch als
Referenzen verwendet. Der Versuch ergänzt ausschließlich Lab-Dateien und
verlinkte Dokumentation. Keine Installation, kein Git-Commit. Die
Renderer- und Asset-Entscheidung bleibt im Rahmen von DEC-017/025 und
OQ-019/020 offen.
