# Lokale Entscheidungen — Botanical ASCII Lab

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
