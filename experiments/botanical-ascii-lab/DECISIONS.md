# Lokale Entscheidungen — Botanical ASCII Lab

## DP-001 — Gemeinsame vorbereitete ASCII-Bilder als begrenzter Versuch

- Datum: 17.11.2026. Herkunft: ausdrücklicher Nutzerauftrag DP-001.
- Status: isoliert implementiert und automatisch geprüft; gemeinsame Designabnahme offen.
- Umsetzung: neuer Einstieg `dp001.html`, Canvas 2D ohne neue Pakete, maximal
  20 Frames eines gemeinsamen aktiven Theme-Bildsatzes, 12-Sekunden-Zyklus mit
  individuellen Phasen. 8/12/20 Frames werden verglichen. Windfeld des bestehenden
  Modells wird beim Vorbereiten entlang einer geschlossenen Zeitkurve abgetastet.
- Begründung: vorhandenes Lab nutzt JavaScript/Canvas. Ein kleiner Bildkopier-Versuch
  erfordert weder Lab-Migration noch PixiJS. Produktives React/TypeScript bleibt erhalten.
- Auswirkungen: vereinfachte pflanzenweise Zeichenreihenfolge, kein gemeinsamer
  Geometrietiefenpuffer oder gegenseitiger Schatten. Keine Planner-Integration,
  Agronomie oder endgültige Rendererwahl. EXP-005/006 und VIS-001 bleiben für
  ihre bisherigen Einstiege unverändert. DEC-017/025 und OQ-019/020 bleiben erhalten.
- Nachweis: [Spezifikation](../../docs/features/DP-001.md), [Bericht](DP-001.md).

## EXP-001 — Isolierter Rendererversuch

- Datum: 16.11.2026.
- Status: für Experiment 01 umgesetzt.
- Grundlage: ausdrücklicher Nutzerauftrag „Botanical ASCII Lab – Experiment 01“.
- Entscheidung: buildfreie Browser-ES-Module und Canvas 2D ausschließlich in diesem
  Experimentordner; keine React-, Python-, API- oder Editoränderungen.
- Begründung: alle drei Verfahren mit identischem Modell und Raster ohne neue
  Laufzeitabhängigkeit vergleichen.
- Auswirkungen: kein Produktionsrenderer ausgewählt; DEC-025 des zentralen
  Entscheidungsprotokolls bleibt offen. DEC-003/019 werden durch getrennte
  3D-Weltkoordinaten und abgeleitete Projektion respektiert. Keine Agronomie.
- Dokumentationsgrenze: AGENTS.md und docs/DECISIONS.md wurden gelesen. Der Auftrag
  untersagt Änderungen am bestehenden Planner; deshalb liegen diese ausschließlich
  experimentellen Entscheidungen hier und ändern das zentrale Protokoll nicht.

## EXP-002 — Botanisch gestaltetes Modell, gemeinsames Ausgaberaster

- Datum: 16.11.2026.
- Status: für Experiment 01 umgesetzt.
- Entscheidung: explizite Blattknoten und ein Achseltrieb, 3D-Blattpolygone,
  Fruchtstände und Blüten; keine allgemeine rekursive Baumgenerierung. Echte
  ASCII-Schriftzeichen und echte Halftone-Kreise aus derselben Materialmaske.
- Begründung: Wiedererkennbarkeit und fairer Vergleich der drei Verfahren.
- Auswirkungen: deterministisch und wiederverwendbar; weiterhin synthetische,
  vereinfachte Pflanzengeometrie. Keine Wachstumssimulation oder Integration.

## EXP-003 — Räumliche Blattflächen und gemeinsame Tiefenprüfung

- Datum: 17.11.2026.
- Status: im Lab umgesetzt; keine Freigabe für den Haupteditor.
- Grundlage: ausdrücklicher Nutzerauftrag „Räumliche Tiefe verbessern“.
- Entscheidung: vorhandene Organe räumlich neu orientieren, Blattflächen als
  gekrümmte triangulierte Netze abbilden und den mittleren Painter-Tiefenwert durch
  einen gemeinsamen Software-Z-Buffer mit neun Proben je Rasterzelle ersetzen.
  Eine feste Weltlichtquelle liefert dezente diskrete Tonwerte aus Flächennormalen.
- Begründung: größere Raumwirkung und nachvollziehbare Verdeckung in allen Modi,
  ohne zusätzliche Blätter oder höhere globale Zeichendichte.
- Auswirkungen: EXP-002 bleibt für die botanische und deterministische Modellierung
  gültig. Dessen bisherige Polygon-/Maskenimplementierung ist mit diesem Datum
  durch gekrümmte Netze und eine opake Tiefenmaske ersetzt; ASCII und Halftone bleiben
  Ausgabeadapter derselben Sichtbarkeit. Die frühere Implementierung ist unter
  `.qa/before-depth/` ausschließlich für den Vorhervergleich gesichert.
  Wind, Hauptoberfläche, Bedienlogik und Palette bleiben unverändert.
  Architektur, Prüfungen und Grenzen stehen in [DEPTH-STUDY.md](DEPTH-STUDY.md).

## EXP-004 — Direkt zugängliche Blickrichtungen und frische Quelldateien

- Datum: 17.11.2026.
- Status: im Lab umgesetzt und im Browser geprüft.
- Grundlage: ausdrücklicher Folgeauftrag zum Öffnen und Bedienen des Ergebnisses.
- Entscheidung: kleine 0°-/45°-/90°-Umschaltung über der Zeichenfläche; dieselben
  Ansichten sind über `?view=0`, `?view=45`, `?view=90` direkt erreichbar.
  `serve.py` liefert ausschließlich den Experimentordner auf 127.0.0.1:8773 aus,
  deaktiviert HTTP-Caching und ignoriert alte GET-Cachevalidatoren. Versionierte
  CSS-/Modul-URLs umgehen bereits vorhandene Browsercaches.
- Begründung: Ergebnis unmittelbar erreichbar und neue Version eindeutig sichtbar.
- Auswirkungen: die zuvor unveränderte UI/Bedienlogik wird durch diesen neuen
  ausdrücklichen Auftrag um genau diese Umschaltung ergänzt. Geometrie, Palette,
  Wind und Haupteditor bleiben unverändert. Der Server bleibt auf Wunsch des
  Nutzers nach der Browserprüfung aktiv. Kein Planner-Startskript geändert.
- Prüfung: HTTP 200 trotz Cachevalidator, no-store-Header, ausgelieferte app.js
  entspricht der Datei auf Disk; alle drei Winkel im Browser betätigt, keine
  Warnungen oder JavaScript-Fehler in den abgefragten Logs.

## EXP-005 — Feste Standardisometrie und gemeinsame Sonnenverschattung

- Datum: 17.11.2026.
- Status: im Lab umgesetzt und geprüft.
- Grundlage: ausdrücklicher Nutzerauftrag „Feste Isometrie und verbesserte Verschattung“.
- Entscheidung: EXP-004 hinsichtlich der Winkelumschaltung abgelöst: Knöpfe,
  URL-Steuerung und Renderer-Kameradrehung entfernt. Ausschließlich Standardisometrie
  bei erhaltener Geometrie, Verdeckung, Pan und Zoom. Gemeinsame feste Sonne aus
  Bildschirm-links-oben, Lichttiefenfeld für stärkere Eigenverschattung sowie
  weich gefilterter, geometrisch abgeleiteter Bodenschatten nach rechts unten.
- Begründung: konstante Orientierung und klarere Raumwirkung bei 5–6 px ohne
  zusätzliche Pflanzenorgane oder veränderte Wind-/Wachstumslogik.
- Auswirkungen: frühere Vergleichsseite nur noch historisches Bildarchiv;
  SUN/LightingField in lighting.js sind für weitere Weltobjekte wiederverwendbar.
  Hybrid/5 px und Pflanzenpalette bleiben erhalten. Gegenüber EXP-003 ist die
  damals nur dezente unverschattete Beleuchtung durch echte Sonnenabschattung
  ersetzt; die opake Kameratiefenprüfung bleibt gültig. Wind und Modell bytegleich.
- Prüfung: 12 Licht-, 23 feste Tiefen- und 18 bestehende Rendererprüfungen;
  visuelle Browserkontrolle aller Modi sowie 5/6 px. Details und Grenzen in
  [LIGHT-STUDY.md](LIGHT-STUDY.md). Kein Eingriff in den Planner.

## EXP-006 — Zwei explizite Paletten und lokal gespeicherte Theme-Auswahl

- Datum: 17.11.2026.
- Status: im Lab umgesetzt und geprüft.
- Grundlage: ausdrücklicher Nutzerauftrag „Light/Dark Mode“.
- Entscheidung: kompakter Sonnen-/Mond-Switch oben rechts, Dark als Standard;
  Auswahl unter `botanical-ascii-lab:theme` lokal speichern. Zwei Renderer-Paletten
  und CSS-Variablen für die vollständige UI statt Canvas-Inversion/CSS-Filter.
- Begründung: Lesbarkeit auf dunklem Grün und warmem Off-White, während geometrische
  und lichtbezogene Ergebnisse exakt dieselben bleiben.
- Auswirkungen: Hintergründe #101713 / #F0EEE5. Light erhält dunkles entsättigtes Ink,
  zurückhaltenden graugrünen Schatten und rote/orange Früchte. Bisherige Dark-Ink-
  Palette erhalten. Schriftgewicht/Inkdeckkraft sind Darstellungsparameter, keine
  Änderung von Raster, Punktzahl, Geometrie oder Lichtmodell. Thema invalidiert die
  Schattenfarbebenen im Cache. EXP-005 bleibt für feste Kamera/Licht/Schatten gültig.
- Prüfung: 44 Paletten-/Geometrieinvarianzprüfungen; Browservergleich bei 5/6 px,
  Auswahl nach Neuladen, CSS-Filter none; fünf Kernmodule per Hash unverändert.
  [Technik und Testergebnisse](THEME-STUDY.md). Keine Planner-Dateien geändert.

## VIS-001 — Etappe 1: freigegebener Maßstabstest

- Datum: 17.11.2026. Herkunft: vorbereiteter Nutzerauftrag und anschließende
  ausdrückliche Implementierungsfreigabe in diesem Chat.
- Status: im isolierten Lab implementiert und technisch/visuell geprüft;
  fachliche Abnahme durch den Nutzer ausstehend.
- Umfang: 2,75 × 6,00 m, A/B/C mit 10/20/30 gleichen Tomateninstanzen, zehn
  gleichmäßig verteilte Positionen je Reihe. Ausschließlich synthetische Parameter.
- Umsetzung: lokale Instanzadapter und statische Beetkontur nutzen die vorhandene
  gemeinsame Sichtbarkeits-/Licht-/Renderingpipeline. Lokaler Wind vor Translation.
  Eine einmalige gemeinsame Kadrierung umfasst alle Varianten. Kein Auto-Fit beim
  Wechsel; keine Änderung an Projektion, Geometrie, Raster, Licht oder Windmodell.
- Auswirkungen: normale Startseite zeigt A, bestehende Einzelansicht über
  `/?study=single`. EXP-005/006 bleiben bezüglich Kamera, Licht und Themes gültig.
  Keine Planner-Integration oder neue Produktstandards; keine neue DEC-/OQ-ID.
- Begründung: begrenzter Vergleich der räumlichen Anordnung ohne Darstellungswechsel.
  Leistungsgrenzen wurden gemessen und nicht durch zusätzliche Optimierung bearbeitet.
  [Abschlussbericht und Abnahmekriterien](VIS-001-ETAPPE-1.md).
