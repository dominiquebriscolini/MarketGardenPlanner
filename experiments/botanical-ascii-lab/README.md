# Botanical ASCII Lab — Experiment 01

Aktuell: **LOCAL STUDY · THEME 04**, http://127.0.0.1:8773/ .
Oben rechts schaltet Sonne/Mond die gesamte UI und die Renderer-Palette zwischen
Dark (#101713, Standard) und Light (#F0EEE5) um. Die Auswahl wird lokal gespeichert.
Geometrie, feste Kamera, Wind und Beleuchtung bleiben identisch. Hybrid/5 px bleiben
Standard. [Theme-Technik und 44 Prüfungen](THEME-STUDY.md).

Die folgenden Abschnitte beschreiben die vorherigen Geometrie-/Lichtschritte;
die Theme-Erweiterung ersetzt ausschließlich ihre feste Dark-Farbgebung.

Stand 17.11.2026: räumliche Blattnetze, gemeinsame Tiefenprüfung und feste
Weltbeleuchtung. [Überarbeitung und aktuelle Testergebnisse](DEPTH-STUDY.md).
Aktuelle Prüfungen: light-test.html, depth-test.html und test.html.

Aktueller Stand **LOCAL STUDY · LIGHT 03**: feste Standardisometrie ohne
Winkelumschaltung, gemeinsame Sonne aus Bildschirm-links-oben, stärkere
Eigenverschattung und ein weicher geometrischer Bodenschatten nach rechts unten.
Hauptansicht: http://127.0.0.1:8773/ . Zoom und Pan bleiben erhalten.
Hybrid/5 px bleiben Standard. Keine Änderung an Modell, Wind oder Planner.
[Architektur und aktuelle Prüfung](LIGHT-STUDY.md).
`start.ps1` startet `serve.py` mit no-store-Antworten; versionierte Modul-/CSS-URLs
umgehen alte Browsercaches. Die frühere depth-review.html dient nur noch als Archiv.

Lokaler, unabhängiger Browser-Prototyp einer ausgewachsenen **Solanum lycopersicum**.
Gestaltetes, synthetisches Anschauungsmodell; keine Vermessung, Sortenrekonstruktion,
Wachstums-, Ertrags- oder Windphysiksimulation. Keine Verbindung zum Planner.

## Start

Im Repository:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File experiments/botanical-ascii-lab/start.ps1
```

Dann http://127.0.0.1:8773 öffnen. Beenden mit Strg+C im Serverterminal.
Keine Installation, kein Build, keine bezahlten APIs, keine Netzabhängigkeiten.
Ein beliebiger statischer HTTP-Server genügt; ES-Module benötigen HTTP statt file://.
Der Start benutzt die vorhandene Python-Umgebung, ersatzweise `py -3`.

## Bedienung

- ASCII / Halftone / Hybrid wechseln die Ausgabe derselben projizierten Geometrie.
- Zeichengröße 4–16 CSS-Pixel: größere Zellen verringern die reale Rasterauflösung.
- Windstärke 0–100 %, Pause und optional sichtbares Zeichenraster.
- Ziehen verschiebt; Mausrad zoomt um den Mauszeiger; +/− und Reset als Schaltflächen.
- Bei fokussierter Zeichenfläche: Pfeiltasten verschieben, +/− zoomen, 0 setzt zurück.
- Betriebssystem-Einstellung „Bewegung reduzieren“ aktiviert anfangs Pause.

## Botanische Referenzen und Ableitung

Recherche: 16.11.2026. Fotografien wurden als Referenzen recherchiert und betrachtet,
nicht eingebettet oder kopiert. Bildrechte bleiben bei den jeweiligen Fotografen.
Die Parameter sind eine visuelle Interpretation, keine aus den Fotos gemessenen Maße.

1. **Burke Herbarium, University of Washington** — Artenbeschreibung und Fotografien
   von Richard Old: https://burkeherbarium.org/imagecollection/taxon.php?Taxon=Solanum+lycopersicum
   Detailaufnahme: https://burkeherbarium.org/imagecollection/photo.php?Photo=wtu018927&SourcePage=taxon&Taxon=Solanum+lycopersicum
   Die Flora beschreibt zusammengesetzte Blätter mit größeren Fiederpaaren und kleinen
   eingeschobenen Fiedern, gezähnte Ränder, seitliche Blütenstände und sternförmige gelbe
   Blüten. Im Modell: 13 zusammengesetzte Blätter mit je sieben großen und vier kleinen
   Einzelblättchen; Blattstiele, Mittelrippen und Nebenadern bleiben räumliche Geometrie.

2. **Lucid, Plants of South Eastern New South Wales** — fotografisches Artenblatt mit
   Blatt-, Frucht- und Habitusansichten:
   https://apps.lucidcentral.org/plants_se_nsw/pdf/entities/solanum_lycopersicum.pdf
   Wechselständigkeit und unregelmäßige Zähnung motivieren versetzte Blattansätze und
   variierende Blattgrößen. Das Modell verwendet keine symmetrischen Fraktalbäume.

3. **Kwantlen Polytechnic University, School of Horticulture** — botanische Gegenprüfung:
   https://plantdatabase.kpu.ca/PlantPrint/lyly
   Zusammengesetzte Blätter, variable gelappte Fiedern und gelbe Blüten in zymösen
   Fruchtständen stützen die Auswahl der erkennbaren Merkmale.

4. **Fotografische Vergleichsansichten, Fruchtstände und Habitus**:
   https://www.aeseeds.com/mountain-magic-f1-tomato-seed/
   https://www.totallytomato.com/product/T00755/89
   Sichtbare reife/unreife Fruchtgruppen und Überlagerungen dienen als Formreferenz.
   Keine Sorteneigenschaften oder Leistungsangaben aus diesen Angeboten übernommen.

### Umsetzung der beobachteten Form

Blätter sind unpaarig gefiedert: drei leicht versetzte größere Paare, vier kleine
Zwischenfiedern und eine Endfieder. Größere untere Blätter, kleinere obere Blätter,
gezähnte Ränder und eine leichte Blattwölbung verhindern identische Silhouetten.
Elf explizit gesetzte Höhen-/Azimutknoten und ein einzelner Achseltrieb bestimmen
den Habitus. Drei seitliche, nach unten belastete Fruchtstände tragen 12 Früchte
mit Kelchblättern, sechs reif und sechs grün. Vier gelbe Blüten stehen weiter oben.
Die gesamte Pflanze bleibt luftig und asymmetrisch, mit überlappenden Blattflächen.

Die Studie vereinfacht eine kultivierte, aufrechte Pflanze ohne sichtbare Stütze.
Freistehende ausgewachsene Tomaten können stärker lagern; dies ist keine Aussage
über die statische Stabilität einer realen Pflanze. Behaarung und feine Blattlappen
sind im groben Raster nur angedeutet. Botanische Erkennbarkeit bleibt visuell zu
beurteilen, nicht allein über die Anzahl der Modellteile.

## Technische Architektur

```text
model.js → wind.js → projection.js → visibility.js → renderer.js → Canvas
                                      ↑
                                    app.js / UI / Kamera / Zeit
```

**model.js** erzeugt ausschließlich deterministische 3D-Formen in nominellen Metern:
Stängelpolylinien mit Radius, gekrümmte triangulierte Blattnetze, kugelförmige Früchte mit 3D-Mittelpunkt
und Radius sowie sternförmige Blütenpolygone. Kein `Math.random`, keine Texturen.
1.467 Primitive, darunter 143 Einzelblättchen, 12 Früchte und vier Blüten.

**wind.js** ist eine reine Funktion von Punkt, Zeit und Stärke. Aperiodische
gehashte Zielwerte mit quintischer Interpolation ändern sich über 6–17 Sekunden.
Ein stetiges räumliches Verformungsfeld verhindert auseinanderreißende Ansatzpunkte.
Nach außen wächst die Nachgiebigkeit; der Ursprung bleibt fest, der Hauptstamm
bewegt sich erheblich weniger als äußere Blätter. Keine schnelle Sinusschwingung.
Das Feld bildet keine Massenträgheit oder unterschiedliche Fruchtmassen ab.

**projection.js** ist unabhängig von UI und Renderer:

```text
u = (x − y) · √3 / 2
v = (x + y) / 2 − z
```

Alle drei Einheitsachsen haben projizierte Länge 1; die Bodenachsen liegen bei
30° und 150°. Skalierung und Pan wirken erst auf die projizierten Koordinaten.

**visibility.js** projiziert die verformten 3D-Flächen und löst Sichtbarkeit mit
neun Tiefenproben je Zeichenrasterzelle. Dreiecke interpolieren Kameratiefe,
Stängel und Kugelfrüchte liefern ihre vorderen Oberflächentiefen. Vollständige
Verdeckung entsteht vor der Ausgabe von Punkten oder Zeichen. Eine feste
Weltlichtquelle und Flächennormalen liefern dezente diskrete Tonwerte.

**renderer.js** zeichnet ausschließlich die vorderste Oberfläche jeder Zelle:

- ASCII: echte Glyphen per `fillText`; eine Glyphe je belegter Rasterzelle.
- Halftone: Kreise mit tonwertabhängiger Größe und ein/vier Punkten pro Zelle.
- Hybrid: typografische Stängel und kombinierte Blatt-/Fruchttexturen.

Palette, Glyphenrampe und Punktgrößen-/Dichteabbildung bleiben wie im ersten Stand.
Der unsichtbare Z-Buffer ist in allen Modi derselbe; Lücken in den Druckzeichen
geben keine verborgenen Pflanzenteile frei. Das Raster ist in CSS-Pixeln definiert.
Es gibt keine Kameraoption zur Rotation. Die feste Licht-/Tiefenprüfung ist in allen Modi dieselbe. Details: [LIGHT-STUDY.md](LIGHT-STUDY.md).
**app.js** verwaltet Kamera, Pointer-/Tastatursteuerung, Regler und die
`requestAnimationFrame`-Schleife. Bei unveränderter pausierter Ansicht wird nicht
neu gerendert; Hintergrundtabs halten Zeit und Rendering an. `window.labStats`
stellt die zuletzt gemessenen Zähler für lokale Diagnose bereit.

## Prüfungen

http://127.0.0.1:8773/test.html führt die reproduzierbaren Browserprüfungen mit
echten Canvas-Kontexten aus. Sie prüfen deterministische Geometrie, endliche
Koordinaten, Isometrie, Windstetigkeit, Ansatzpunktkonsistenz, tatsächliche
Text-/Kreisaufrufe, pixelgleiche feste Zeitpunkte und Auflösungsänderungen.
Zusätzlich werden pro Modus 30 vollständige Renderbilder gemessen.

Ergebnisse und Grenzen: siehe [TEST-RESULTS.md](TEST-RESULTS.md).
Lokale Architekturentscheidungen: siehe [DECISIONS.md](DECISIONS.md).

## Grenzen dieser ersten Studie

- Blattgeometrie besteht aus gekrümmten Dreiecksnetzen ohne Blattdicke.
- Tiefenprüfung an neun Subrasterproben je Zelle; Silhouetten bleiben rasterabhängig.
- Vereinfachte diffuse Beleuchtung und gefilterte Schatten; keine Mehrfachreflexion, Stütze, Wachstum oder Sortenauswahl.
- Sehr grobe Zeichen verlieren Blattzähne und kleine Blüten erwartungsgemäß.
- Leistungsprofil ist geräteabhängig; konstante 60 fps wurden nicht nachgewiesen.
- Keine Freigabe oder technische Anbindung an den Haupteditor, keine produktiven
  Kultur- oder Planungsdaten, keine Änderung an bestehenden Planner-Dateien.
