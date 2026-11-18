# VIS-GRAIN-004 – Grainrad-Pflanzen für die Gartenübersicht

Die erwähnten Rohmessungen, Bilder und Atlanten sind historische Versuchsartefakte und in der bereinigten Kopie nicht enthalten.

18.11.2026 · Lokaler Experimentstand auf Git-HEAD `20e6a63` mit bereits
vorhandenen Änderungen. [Experimentfreigabe](../../docs/DECISIONS.md#lokale-experimentfreigabe-vis-grain-004).
Gemeinsame Designabnahme offen.

## Verifizierter Bestand

Der [Kulturkatalog](../../data/cultures.json) enthält zehn Arten, eine
benannte Sorte und 15 Anbauprofile. Der [API-Katalog](../../src/market_garden_planner/projects/catalogue.py)
liefert Profil- und Art-ID. Die [synthetische Saison-Demo](../../src/market_garden_planner/prototype/demo.py)
verwendet die Art-IDs direkt für Tomaten, Kopfsalat, Radieschen und Spinat.
[Tests](../../tests/test_seasonal_acceptance.py) verwenden dieselben Arten
Tomate, Kopfsalat und Radieschen mit synthetischen Parametern. Generische
Test-IDs stehen für technische Fälle. Die
[integrierte Isometrie](../../frontend/src/IsometricGarden.tsx) zeichnet
derzeit Tomaten anhand des Demo-Saisonstatus beziehungsweise des aktiven
Projektprofils `tomatoes-field-transplant`.

| Kultur / Art-ID | Anbauprofile | Visuelle Gruppe und Stand |
|---|---|---|
| Tomaten · `tomatoes` | `tomatoes-field-transplant` | Aufrechte Fruchtpflanze. Bestehendes VIS-GRAIN-003-Symbol mit orangeroten Früchten. |
| Kopfsalat · `lettuce` | `lettuce-butterhead-transplant` | Breite, geschlossene Blattrosette als Einzelsymbol. |
| Radieschen · `radishes` | `radishes-spring`, `radishes-autumn` | Kurzer Reihenabschnitt mit lückigem Laub. Die roten Knollen erscheinen im Lab-Beetschnitt. Beide Saisonprofile teilen ein Asset. |
| Spinat · `spinach` | `spinach-spring-direct`, `spinach-autumn-direct` | Dichter, flacher Blattcluster. Beide Saisonprofile teilen ein Asset. |
| Kohlrabi · `kohlrabi` | `kohlrabi-standard-transplant`, `kohlrabi-superschmelz-transplant` | Kompakte oberirdische Knolle mit aufrechten Blattstielen. Standard und Sorte Superschmelz teilen ein Asset. |
| Zwiebeln · `onions` | `onions-seed-direct`, `onions-seed-transplant` | Drei Büschel aufrechter, schmaler Blätter als Reihenabschnitt. Beide Anbaumethoden teilen ein Asset. |
| Karotten · `carrots` | `carrots-early-lwg`, `carrots-standard-bzl` | Gefiedertes Laub und spitze Speicherwurzel unter Erdschleier. |
| Rote Bete · `beetroot` | `beetroot-root-direct` | Breiteres Laub mit rötlichen Stielen und runder Speicherwurzel unter Erdschleier. |
| Buschbohnen · `bush-beans` | `bush-beans-direct` | Buschiger Reihenbestand mit Dreiergruppen aus Blättern. |
| Zucchini · `zucchini` | `zucchini-transplant-lwg` | Breite Einzelpflanze mit großen gelappten Blättern und bodennaher Frucht. |

Die Auswahl deckt alle vier Demokulturen ab. Kohlrabi und Zwiebel erweitern
die Silhouetten um einen oberirdischen Knollenkörper und lineares Laub.
Rosetten und Blattcluster nutzen dieselbe Grundkonstruktion mit
unterschiedlichen Silhouetten. Radieschen, Spinat und Zwiebel stehen als
kleine Bestände, damit niedrige beziehungsweise schmale Pflanzen im
Überblick erkennbar bleiben. Ein Cluster ist ein Darstellungszeichen für
einen Bestand. Seine drei Teilpflanzen geben keine Pflanzabstände vor.

## Bildsatz und Verwendung des ersten Stands

- Atlas (`atlas.png`) und Mapping (`atlas.json`)
  liegen neben der lokalen Testansicht. Der erste Atlas maß 1392 × 3480 px
  und belegte dekodiert rund 18,5 MiB RGBA. Die Kacheln messen je
  460 × 576 px und haben einen transparenten Rand von zwei Pixeln.
- `byProfile[profileId]` oder `bySpecies[speciesId]` liefert die
  Asset-ID. Explizites `null` kennzeichnet eine Kultur ohne Bildsatz.
  `assets[id]` enthält Fußpunkt und drei Quellrechtecke `x, y, w, h`
  sowie die relativen Dateipfade der Einzel-PNGs unter `frames/`.
  Zeichnen mit Zielursprung `Bildschirmpunkt − foot × Maßstab`.
  Der Maßstab der Testansicht ist illustrativ.
- Stabiler Anker bei (225, 491), je eine Hauptdarstellung mit links,
  mittig und rechts. Die Folge Mitte → links → Mitte → rechts dauert
  4,8 s. Die Quellbewegung ist auf ±6 px begrenzt. Die Bildzeilen ab
  448 bleiben für jede Kultur über alle Haltungen bytegleich.
- Die Tomatenpixel stammen aus VIS-GRAIN-003. Die übrigen Motive wurden
  lokal synthetisch gezeichnet und über Grainrad als ASCII exportiert
  (Scale 2, Spacing 0, Output Width 0, STANDARD, Original, Grain aus).
  Schwarz-/Weißpaare rekonstruieren die Zeichen-Alpha. Die
  Quellmaske begrenzt sie auf das Pflanzenmotiv.
- Start über das [Lab-Startskript](README.md#start), dann
  [VIS-GRAIN-004 öffnen](http://127.0.0.1:8773/vis-grain-004/).
  Die Szene enthält 18 phasenversetzte Symbole in sechs Beispielbeeten
  und funktioniert lokal mit einem Atlas. Die Projektansicht nutzt
  weiterhin den in DEC-034 beschriebenen Tomatensatz.

## Prüfstand und Grenzen

18.11.2026: 30 Grainrad-PNG-Exporte. Beim Packen geprüft wurden je
Kultur drei unterschiedliche RGBA-Frames, gleiche Abmessungen, sichtbare
Motive innerhalb der Kachel, transparente Umgebung, stabile Fußzone,
pixelidentische Atlasrechtecke und die Zuordnung aller 15 Profile.
Chrome prüfte sechs animierte Kulturen, reduzierte Bewegung beim Start
und 390 px Ansichtsbreite. 126 Python- und 16 Lab-Tests bestanden.
Browserbild (`preview.png`).
Kein Git-Commit.

Im kleinsten Maßstab verlieren Radieschen und Zwiebeln zuerst feine
Blattdetails. Die Atlasgröße und symbolische Dichte wurden nicht
für große Gärten vermessen. Für spätere Wachstumsphasen sind die Zuordnung
zu fachlich belegten Zuständen, Anker und Größenübergänge sowie
Schnitt/Ernte bei Reihenbeständen offen. Scheduler-Zustände und reale
Beetbelegung bleiben Fachinformationen des Planners.
[OQ-019](../../docs/OPEN_QUESTIONS.md#oq-019), [OQ-020](../../docs/OPEN_QUESTIONS.md#oq-020).

Wiederholung: `assets.py prepare` mit Pillow ausführen, im Repo-Stamm
`playwright-cli -s=grain004 open https://grainrad.com/ --browser=chrome`
und `playwright-cli -s=grain004 run-code --filename=experiments/botanical-ascii-lab/vis-grain-004/export.playwright.js`
ausführen und mit `assets.py pack` abschließen. Quellmasken und
Zwischenexporte landen in `.qa/vis-grain-004/`.

## Kontrast und Hellmodus im Lab

18.11.2026 · Dunkel ist die Startansicht. Die Lab-Schaltfläche **Hellmodus**
wechselt Hintergrund, Beetfarben und Zeichenkontrast. Auf dunklem Grund
sind die vorhandenen Zeichen heller. Auf hellem Grund sind sie dunkler und
feine Zeichenkanten deckender. Die Anpassung erfolgt beim Zeichnen des
vorhandenen Atlas. Chrome prüfte alle sechs Kulturen in beiden Modi,
den Erhalt der pausierten Haltung beim Umschalten und die Breite von
390 px im Hellmodus.
Dunkel (`preview.png`) · Hell (`preview-light.png`).

## Vorheriger Versuch mit Beetschnitt

18.11.2026 · Die Lab-Szene zeigt Radieschenknollen und Zwiebelkörper als
stationäre Glyphenmuster im Beetschnitt unter der Erdlinie. Der Kohlrabi
behält seinen sichtbaren oberirdischen Knollenkörper. Die Schnitte
illustrieren die Lage der Pflanzenteile ohne Tiefenmaßstab. Jede Kultur
hat einen weichen, leicht nach rechts versetzten Bodenschatten mit
passender Breite. Beim Kopfsalat betonen gestaffelte Blätter, hellere
Mittelrippen und dunklere Blattfalten die Rundung.

Der Grainrad-Export und die Atlasprüfung wurden erneut ausgeführt.
Der damalige Browsertest prüfte Schatten für alle sechs Kulturen und
beide Unterbodenmotive in Hell und Dunkel.

Die Schnittkante verläuft direkt durch die dargestellte Pflanzreihe.
Die Verbindung zwischen Blattansatz und Knolle folgt bei Radieschen
und Zwiebeln den einzelnen Laubansätzen im Sprite und bleibt im Wind
am Boden verankert. Der Browsertest prüft den sichtbaren Übergang
durch die Erdlinie in beiden Modi.

## Vorheriger Versuch mit vier eigenständig gezeichneten Wachstumsphasen

18.11.2026 · Das Auswahlfeld wechselt die sechs Lab-Kulturen gemeinsam
zwischen Auflaufen, Jungpflanze, Ausbildung und ausgewachsenem Zustand.
Die Zeichnungen verwenden illustrative Formen ohne Kalender- oder
Schedulerbezug.

| Kultur | Auflaufen | Jungpflanze | Ausbildung | Ausgewachsen |
|---|---|---|---|---|
| Tomate | Kleiner Spross | Mehrere Blattpaare | Verzweigung mit gelben Blütenakzenten | Vorhandene Tomate mit roten Früchten |
| Kopfsalat | Wenige Blätter | Offene Rosette | Dichtere Rosette | Rund geschlossener Kopf |
| Radieschen | Kleine Blattpaare | Lockeres Laub | Kleine Speicherorgane unter Erdschleier | Breiteres Laub und größere Speicherorgane |
| Spinat | Kleine Blattpaare | Lockerer Blattbestand | Breitere Blattrosetten | Dichter Bestand |
| Kohlrabi | Kleiner Spross | Aufrechte Blätter | Verdickung oberhalb der Erdlinie | Deutlich sichtbare oberirdische Knolle |
| Zwiebel | Zwei schmale Blätter | Mehr aufrechte Blätter | Kleine Zwiebelkörper unter Erdschleier | Längeres Laub und größere Zwiebelkörper |

Die geschlossene Iso-Beetfläche ersetzt den früheren Querschnitt.
Radieschen und Zwiebeln bleiben am jeweiligen Laubansatz positioniert.
Eine gemeinsame, halbdeckende Erdschicht dämpft die Farben der
unterirdischen Pflanzenteile. Diese Zeichen sind eine schematische
Sichthilfe ohne räumliches Tiefenmaß.

Je Phase ein Atlas mit denselben sechs Art-IDs, drei Windhaltungen und
dem gemeinsamen Fußpunkt (225, 491). Die Ansicht lädt den aktuell
gewählten Atlas. Der bestehende Atlas (`atlas.json`) liefert
die ausgewachsene Phase. Die übrigen Mappings sind
Auflaufen (`atlas-sprout.json`),
Jungpflanze (`atlas-juvenile.json`) und
Ausbildung (`atlas-developing.json`).

Für die drei zusätzlichen Phasen `assets.py prepare-growth` verwenden,
den Browser für den vorhandenen Export mit `https://grainrad.com/#growth`
öffnen und danach `assets.py pack-growth` ausführen. Die Lab-Ansicht bleibt
lokal nutzbar. Git-HEAD und offene gemeinsame Nutzerabnahme siehe oben.

Geprüft am 18.11.2026: 108 zusätzliche Grainrad-Exporte ergeben 54
neue RGBA-Frames. Die Packprüfung bestätigt drei verschiedene Posen
je Kultur und Phase, identische Fußzonen und pixelgleiche Atlaskacheln.
Chrome prüfte vier verschiedene Darstellungen pro Kultur, geschlossene
Beete, Speicherorgane erst ab Ausbildung, Hell/Dunkel, Wind/Pause und
die Darstellung bei 390 px Breite.

## Alle Katalogkulturen und stetiges Größenwachstum

18.11.2026 · Die Lab-Sammlung deckt alle zehn Katalogkulturen und
alle 15 Anbauprofile ab. Karotten und Rote Bete erhalten wie
Radieschen und Zwiebeln eine ans Laub gebundene Speicherwurzel
unter dem Erdschleier. Buschbohnen stehen als kurzer Bestand,
Zucchini als breite Einzelpflanze.

Die vorherigen, separat gezeichneten Phasen waren ein Versuch.
Das Lab verwendet jetzt denselben Bildsatz je Kultur über vier
Größenstufen (34, 55, 78 und 100 Prozent). Beim Wechsel wächst oder
schrumpft die Pflanze in 720 ms um den festen Fußpunkt. Bei
reduzierter Bewegung wird die Zielgröße unmittelbar dargestellt.
Die Tomate behält so ihre Silhouette. Die Größenstufen sind eine
Darstellung ohne Zuordnung zu fachlichen Scheduler-Phasen.

Der aktuelle Atlas (`atlas.json`) enthält 30 Windframes
bei 1392 × 5800 px. Das Mapping enthält die vier Größenfaktoren
unter `growthScale`. Die früheren Entwicklungsbilder bleiben in
den historischen Phasenatlanten dokumentiert. Für die vier
zusätzlichen Kulturen lassen sich die Eingaben mit
`assets.py prepare-additions` und die Exporte über den Browserstart
`https://grainrad.com/#additions` wiederholen. `assets.py pack`
prüft und bündelt anschließend den gesamten Katalog.

18.11.2026 geprüft: 24 zusätzliche Grainrad-Exporte, vollständiges
Katalog-Mapping und 30 unterschiedliche Posen innerhalb ihrer
jeweiligen Kultur. Der Browsertest prüfte alle zehn Kulturen, vier
Größenstufen, einen animierten Zwischenschritt, reduzierte Bewegung,
Hell/Dunkel und den Erdschleier bei allen vier Wurzel- und Zwiebelkulturen.
Klein (`preview-sprout-light.png`) ·
Jungpflanze (`preview-juvenile-light.png`) ·
Herangewachsen (`preview-developing-light.png`) ·
Ausgewachsen (`preview-light.png`).

### Lesbarkeit und Größenverhältnisse

18.11.2026 · Die Rote Bete hat eine breitere, rundere Speicherwurzel
als das Radieschen. Die Karotte reicht sichtbar tiefer und läuft
spitz zu. Diese Verhältnisse sind schematisch. Die Zucchini zeigt
unter den breiten Blättern eine lange Frucht mit heller Flanke
und gelber Blüte. Bei der Buschbohne hängen helle, leicht gebogene
Hülsen unter den dreiteiligen Blattgruppen. Der Browsertest prüft
die relativen Breiten und Längen der Wurzelmotive im Hell- und Dunkelmodus.
