# VIS-GRAIN-004 – Planner-Integration

18.11.2026 · Die Projekt-Isometrie füllt eindeutig zugeordnete
Kulturflächen gleichmäßig mit ASCII-Symbolen. Vier Größenstufen folgen
schematisch dem geplanten Zeitraum. Die Demo nutzt denselben Atlas für
ihre Scheduler-Zustände. Gemeinsame Abnahme offen. [Prüfstand](../phase-garden-views.md). [Lab-Bericht](../../experiments/botanical-ascii-lab/VIS-GRAIN-004.md).

Dieser Bericht dokumentiert die historische Grainrad-Integration. In der
bereinigten Kopie verwenden Planner und Vorschau
[eigene SVG-Pflanzensymbole](../../frontend/src/plantSymbols.ts).

## Historisches Paket

Der frühere Atlas und das
[Manifest](../../frontend/src/assets/grainrad-plants/manifest.json) enthielten
zehn Katalogkulturen und 30 transparente Frames. Der
damalige TypeScript-Einstieg liefert Atlas-URL,
Frame-Rechtecke, Fußpunkte, Windfolge, Größenstufen und Darstellungsparameter.
Er löst Katalogprofil- und Demo-Art-IDs getrennt auf. Unbekannte IDs ergeben
`undefined`. Die Auflösung arbeitet ohne Netzwerk und ohne Lab-Abhängigkeit
zur Laufzeit.

- Pro Frame sind `x`, `y`, `w` und `h` Quellpixel. Der Fußpunkt
  `(225, 491)` liegt in Kachelkoordinaten. Die Iso projiziert den Weltpunkt
  wie bisher aus der Beetgeometrie. Sprite-Größe und Fußpunkt werden erst
  am projizierten Punkt angewandt.
- Schattenform, Hell-/Dunkel-Kontrast und vier schematische Größenfaktoren
  sind reine Präsentationswerte. Beim Moduswechsel soll die Position
  erhalten bleiben. `prefers-reduced-motion` soll die mittlere Windhaltung
  wählen und Größenziele unmittelbar anzeigen.
- Bei Radieschen, Zwiebeln, Karotten und Roter Bete enthalten die
  Darstellungsdaten Blattansatz, Formraster, Proportionen und Theme-Farben.
  Wie in der [Lab-Referenz](../../experiments/botanical-ascii-lab/vis-grain-004/demo.js)
  werden diese Motive an der geschlossenen Beetfläche abgeschnitten,
  vom Erdschleier gedämpft und vor dem oberirdischen Laub gezeichnet.

Die Übergabe lässt sich aus dem aktuellen Lab-Stand mit
`python experiments/botanical-ascii-lab/vis-grain-004/assets.py stage`
und Pillow wiederholen. Die Vorbereitung vergleicht Art- und Profil-IDs
mit dem Katalog und jede Atlaskachel pixelgenau mit ihrem Einzelbild.

## Historischer Stand vor der Integration

Die [Isometrie](../../frontend/src/IsometricGarden.tsx) hat bereits
eine geometrische Pflanzreihe, eine Sortierung nach projizierter Tiefe
und einen gemeinsamen Windzyklus. Die Beispielansicht löst
`batch.plan.profile_id` als Demo-Art-ID auf und verwendet die bereits
gelieferten Scheduler-Zustände. Für gespeicherte Projekte verweist die
[Wochenansicht](../../frontend/src/projectSeason.ts) über Kulturvorgänge
auf Katalogprofil-IDs. Die heutige Tomatenbedingung berücksichtigt Vorgänge,
die zugleich in `shown_ids` und `active_ids` stehen. Vorgänge nur in
`open_ids` bleiben über die bestehende Statusanzeige lesbar.

Für den späteren Einbau bietet sich an, diese Sichtbarkeitsbedingungen
beizubehalten und nur die Bildzuordnung zu verallgemeinern. Bei mehreren
aktiven Kulturen pro Beet ist die räumliche Zuordnung der Symbole offen.
Die Wochenansicht liefert Planungszustände, die Größenstufen brauchen
deshalb eine gesondert freizugebende Zuordnung. [OQ-019](../OPEN_QUESTIONS.md#oq-019).

Für die Abnahme sollen ein synthetisches Mehrkultur-Projekt und die
vorhandene Demo die Zuordnung, den Saisonwechsel, unbekannte IDs,
unsichere Belegung, beide Themes und reduzierte Bewegung prüfen.
Bei dichter Belegung bleibt die Lesbarkeit zu prüfen. Der Atlas belegt
dekodiert rund 30,8 MiB RGBA. Messungen im produktiven SVG-Renderer
stehen aus. Der ursprüngliche Bildnachweis zur Tomate führt die
Nutzungsrechte für eine externe Veröffentlichung als offenen Punkt.

## Historischer Prüfstand der Vorbereitung

18.11.2026 · Vorbereitet auf HEAD `20e6a63` mit vorhandenen lokalen
Änderungen. Zehn Arten, 15 Katalogprofile und 30 Atlaskacheln geprüft.
TypeScript, separater esbuild-Bundle-Test des Adapters mit gültigen und
unbekannten IDs sowie Lab-Browserprüfung erfolgreich. Die Mehrkultur-
Darstellung in der Planner-Isometrie ist noch nicht eingebunden.

## Damaliger Umfang

[DEC-045](../DECISIONS.md#dec-045) zeichnet Projektpflanzen nach
projizierter Tiefe in einem HTML-Canvas über der Karten-SVG.
Beschriftung und Auswahlkontur liegen darüber. Symbolpositionen verwenden
einen Darstellungsabstand von 0,8 m, unabhängig von der Kapazität.
Hell/Dunkel verwendet den vorhandenen Atlas-Kontrast. Bei reduzierter
Bewegung erscheint die mittlere Pose. Die separate unterirdische
Glyphenebene des Lab-Versuchs ist weiterhin offen.

Die bestehenden ASCII-Atlaskacheln werden rund 40 % größer gezeichnet,
damit mehr Glyphendetails sichtbar sind. Die Beetkonturen behalten
beim Zoomen ihre feine Strichstärke. Die vier Größenstufen und ihre
Fußpunkte bleiben erhalten.
