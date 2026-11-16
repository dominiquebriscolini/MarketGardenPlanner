# Phase 3A.2 — Map-first Interface

Aktuelle Ergänzung: [Kalenderwochengenaue Ernteprognose und verschiebbares
Fenster](phase3a2-harvest.md). Dort stehen die aktualisierten Prüfergebnisse
(32 Python-Tests, 12 Frontend-Tests). Zukünftige Produktanforderungen sind
separat in [PRODUCT.md](PRODUCT.md) dokumentiert.

## Ergebnis

Die Grundstückskarte füllt den gesamten Browser-Viewport. Projekttitel,
Werkzeuge, Legende, Saisonsteuerung, Beetdetails und Ernteprognose sind
schwebende Elemente. Das Öffnen oder Schließen dieser Elemente verändert
weder die SVG-Größe noch den Kartenausschnitt. Es gibt keine feste rechte
Spalte und keinen umgebenden Seitenrahmen.

Die Projektprinzipien stehen verbindlich in `AGENTS.md`. Python-Scheduler,
Agronomieberechnungen, Beispieldaten, Beetpositionen und Grundstücksgrenze
wurden nicht verändert. Es wurden keine Pakete oder Frameworks ergänzt.

## Lokal starten

Die fertige Oberfläche liegt in `frontend/dist`; zum normalen Start genügen
Python 3.11 und ein moderner Browser. Node.js ist nur zum Neubau erforderlich.

```powershell
cd ~\Documents\MarketGardenPlanner
powershell -NoProfile -ExecutionPolicy Bypass -File .\start-prototype.ps1
```

Danach **http://127.0.0.1:8765** öffnen. Strg+C beendet den Server.
Bei belegtem Port kann `-Port 8766` ergänzt werden. Nach einem Neubau die
Browserseite neu laden. Der Dienst bleibt auf `127.0.0.1` beschränkt.

## Bedienung

- **Karte:** +/− oder Mausrad für Zoom. Freie Kartenfläche ziehen für Pan;
  zusätzlich stehen auf größeren Fenstern Richtungstasten im Werkzeugfeld
  bereit. „Einpassen“ setzt Zoom und Verschiebung zurück.
- **Hover:** Beetnummer, Kultur bzw. „Frei“, Fläche, aktueller Zustand und
  nächster bekannter Termin. Der Tooltip weicht an Bildschirmrändern aus.
  Tastaturfokus auf einem Beet zeigt dieselbe Information.
- **Auswahl:** Ein Beet anklicken oder mit Tab fokussieren und Enter/Leertaste
  drücken. Der Auswahlrahmen ist vom Hover-Rahmen unabhängig.
- **Details:** Rechte Karte mit Kulturfolge, Pflanzenzahlen, Aussaat, Pflanzung,
  Ernte- und Räumungsgrenzen. Inhalt scrollt, Kopf und Schließen bleiben sichtbar.
  Schließen über ×, Esc oder Klick auf freie Kartenfläche. Verschieben per
  Ziehen hebt eine Auswahl nicht auf.
- **Saison:** Tagesregler, Datumseingabe und ±Woche. Kartenfarben, Tooltip,
  Detailstatus und ausgewählte Kalenderwoche der Prognose verwenden denselben Tag.
- **Legende und Prognose:** Bei Bedarf öffnen; die Karte bleibt unverändert.
  Die Ernteprognose enthält ausschließlich die Erntemengen der ausgewählten
  Kalenderwoche. kg und Stück werden getrennt dargestellt. Ihr Fenster ist
  am Titel verschiebbar und unabhängig vom rechten Beetpanel.
- **Kleine Fenster:** Kompaktere Werkzeuge, Details als überlagernde Karte.
  Pan bleibt über Ziehen möglich; eine geöffnete Detailkarte kann einen
  größeren Anteil der Karte verdecken und lässt sich jederzeit schließen.

## Daten und Architektur

`GET /api/demo` liefert unverändert die Ergebnisse des Python-Schedulers und
die dort daraus abgeleiteten Tageszustände. Es gibt keine neue JavaScript-
Planungslogik. Insbesondere werden Belegungen und Kulturphasen im Frontend
nicht selbst berechnet. Alle Beispielparameter und die Grundstücksgeometrie
sind synthetisch; der Hinweis bleibt dauerhaft im Projekttitel sichtbar.

| Modul | Verantwortung |
|---|---|
| `App.tsx` | Gemeinsamer Saisontag, Auswahl, Esc, schwebende Bedienfelder |
| `Plot.tsx` | Bildschirmfüllendes SVG, Kamera, Zoom/Pan, Hover und Auswahl |
| `BedTooltip.tsx` | Tooltip-Inhalt, gemessene Größe und randbegrenzte Position |
| `Details.tsx` | Scrollbares Beetpanel mit expliziten Scheduler-Terminen |
| `Forecast.tsx` | Erntemengen ausschließlich der ausgewählten Kalenderwoche |
| `ForecastWindow.tsx` | Eigenes verschiebbares, begrenztes Prognosefenster |
| `forecastModel.ts` | ISO-Kalenderwoche, Gruppierung und Bildschirmbegrenzung |
| `interactions.ts` | Reine Funktionen für Kamera, Tooltip, Terminlookup und Saison-Navigation |
| `style.css` | Ruhige Grün-/Beige-Palette, Overlay-Positionen und responsive Regeln |

Die SVG-Fachkoordinaten bleiben in Metern. `fittedView` erhält nur Grundstück
und Viewport-Abmessungen; Auswahl, Panels und Datum sind keine Eingaben.
`cameraView` verändert ausschließlich die Ansicht. Das Seitenverhältnis
bleibt erhalten. Der Bildschirmmaßstab ergibt sich aus Metern pro Pixel.
Beschriftungen erhalten bei kleinen Fenstern eine Mindestlesegröße, ohne
die Beetgeometrie zu verändern.

Die statische Grundstücksebene ist memoisiert. Der Kameraausschnitt wird
nur bei Fenstergröße, Zoom oder Pan neu bestimmt. Saisonwechsel wählen
bereits vorhandene Tageszustände; sie lösen weder einen Backend-Aufruf noch
eine Neuberechnung der Grundstücksgeometrie aus.

Hover und Auswahl sind separate Zustände. Tooltips haben keine eigenen
Mausziele (`pointer-events: none`). Transparente Zwischenräume der Legenden-
und Prognose-Steuergruppe lassen Eingaben an die Karte durch. Pan verhindert
Browser-Textauswahl und unterscheidet Ziehen von einem einfachen Kartenklick.

Der nächste bekannte Termin ist ein reiner Lookup in den bereits gelieferten
Satzdaten: Aussaat, Pflanzung, erste Ernte, Ernteende/Räumungsbeginn und
Belegungsende. „Nächster“ bedeutet strikt nach dem ausgewählten Kalendertag.
Weitere Schnitttermine werden nicht aus Wochenmengen erfunden. Sämtliche
Phasen bleiben schematische Planphasen und keine beobachtete Pflanzenentwicklung.

## Prüfungen

Ausgeführt unter Python **3.11.9**, Node **24.22.1**, TypeScript **5.9.3**.

| Prüfung | Ergebnis |
|---|---|
| Alle Python-Tests | **32 erfolgreich**; bestehende Tests unverändert |
| TypeScript `tsc --noEmit` | Erfolgreich |
| Frontend-Build | Erfolgreich über `frontend/build.ps1` (direkter esbuild-Aufruf) |
| Frontend-Interaktionstests | **4 erfolgreich**, Node-Test-Runner, keine neuen Testbibliotheken |
| HTTP-Vorschau | HTTP 200, vorhandener lokaler Python-Server |
| Browser-Konsole | Keine gemeldeten JavaScript-Fehler |

Die gezielten Frontend-Tests prüfen maßstäbliches Einpassen bei verschiedenen
Seitenverhältnissen, Kameratransformation, Tooltip-Begrenzung an allen vier
Bildschirmecken, Terminlookup einschließlich freier Beete und exklusiver
Grenzen sowie Saison-Navigation an Anfang und Ende.

```powershell
cd ~\Documents\MarketGardenPlanner
$env:PYTHONPATH="$PWD\src"
py -3.11 -B -m unittest discover -s tests -v

cd frontend
powershell -NoProfile -ExecutionPolicy Bypass -File .\build.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File .\test.ps1
```

Beide Frontend-Skripte unterstützen `-NodeExecutable <Pfad zu node.exe>`.
Sie benötigen installierte Frontend-Abhängigkeiten. Der direkte Build-Weg
vermeidet das bereits in Phase 3A.1 festgestellte `spawn EPERM` der isolierten
Windows-Umgebung. Auf gewöhnlichen Entwicklungsinstallationen steht weiterhin
`pnpm run build` für TypeScript und Vite zur Verfügung. Details zur Installation
stehen in `phase3a1.md`.

### Visuelle Browserabnahme

Geprüft im Chromium-basierten In-App-Browser mit normalem Viewport sowie
**390 × 844 Pixeln**:

1. Karte füllt den Viewport, kein Dokument-Scrollbalken; Grundstück initial
   groß eingepasst, Maßstab und Positionen erhalten.
2. Hover über Kopfsalat im Wachstum und über ein freies Beet im August:
   korrekter Status, 9,6 m² und passender nächster Scheduler-Termin.
3. B01 auswählen, unabhängig B02 hovern; Auswahl und Tooltip bleiben getrennt.
4. Esc, Kartenklick und Schließen-Schaltfläche heben die Auswahl auf.
5. Saisonregler tatsächlich gezogen: Karte und geöffnetes Panel wechseln
   gemeinsam von Kopfsalat zu Tomatenernte. SVG-`viewBox` bleibt identisch.
6. Wachstum, Ernte am 15. Juni, Räumung ab 16. Juni und frei ab 20. Juni geprüft.
7. Zoom, Richtungstasten und Pan per Ziehen bei geöffnetem Panel funktionieren;
   Panel und Auswahl bleiben erhalten.
8. Mobile Karte bleibt 390 × 844 Pixel groß, ohne Seitenüberlauf. Panel scrollt;
   Wochenprognose weiterhin aufrufbar. Tooltip am rechten Rand bleibt mit
   gemessenen Grenzen vollständig im sichtbaren Bereich.

Screenshots der Desktopansicht mit Auswahl/Hover und der mobilen Ansicht
wurden als separate Abnahmeartefakte bereitgestellt.

## Verbleibende Grenzen

Keine funktionalen Blocker in den geprüften Abläufen festgestellt. Auf kleinen
Bildschirmen verdeckt ein geöffnetes Panel bewusst einen Teil der Karte;
die Ansicht wird dafür nicht verschoben oder verkleinert. Hover setzt eine
Maus oder Tastaturfokus voraus; Touch verwendet die Beetauswahl.

Weiterhin keine Pixel-Art, 3D-Darstellung, Optimierung, Grundstücksbearbeitung,
Datenbank oder reale Standortkalibrierung. Externe Projekte und Rhino-
Konfigurationen wurden nicht verändert. Es wurde kein Git-Commit erstellt.
