# Phase 3A.1 — lokaler visueller Prototyp

## Start

Voraussetzung: Python 3.11. Die gebaute Oberfläche liegt in `frontend/dist`.
Der normale Start benötigt weder Node.js noch Internet, Rhino oder Grasshopper.

```powershell
cd ~\Documents\MarketGardenPlanner
powershell -NoProfile -ExecutionPolicy Bypass -File .\start-prototype.ps1
```

Danach im Browser **http://127.0.0.1:8765** öffnen. Das Terminal bleibt offen;
Strg+C beendet den Server. Bei belegtem Port: `-Port 8766` ergänzen.
Alternativ ohne PowerShell-Skript:

```powershell
$env:PYTHONPATH="$PWD\src"
py -3.11 -B -m market_garden_planner.prototype.server
```

## Visuelle Kontrolle

1. Grundstück und sechs nummerierte Beete sind sichtbar. Auf B02 klicken:
   rechts erscheinen seine Sätze, Pflanzennamen und Termine.
2. 01.03.2026 wählen: alle Beete frei.
3. 01.04.2026: Radieschen im Feldwachstum.
4. 20.04.2026: Radieschenernte; 21.04.2026: Räumung;
   25.04.2026: wieder frei. Das Belegungsende ist exklusiv.
5. 10.06.2026: Kopfsalat als Folgekultur auf denselben Beeten.
6. 10.08.2026: Tomatenernte auf B01; übrige Beete frei.
7. 19.10.2026: Spinaternte. Mehrfachschnitt hält das Beet auch zwischen
   den Schnitten belegt. 31.10.2026: alle Beete wieder frei.
8. Regler und ±Woche verwenden; Prognosetabelle markiert die ausgewählte
   Erntewoche. Mengen in kg und Stück werden nicht addiert.
9. Mit +/− zoomen, Pfeilen verschieben und „Einpassen“ zurücksetzen.
   Bemaßung und Grundstück werden gemeinsam skaliert. Fenster verkleinern:
   Detailbereich erscheint unter dem Grundstück.

## Module und Datenfluss

- `prototype/demo.py`: ausschließlich synthetische Saisonprofile und Ziele,
  fest definierte Grundstücksgeometrie, Aufruf des unveränderten `plan_season`.
- `prototype/presentation.py`: tägliche Zustände aus den tatsächlich zugeteilten
  Reservierungen und Satzterminen. Keine JavaScript-Planungslogik.
- `prototype/server.py`: lesender Standardbibliothek-HTTP-Adapter auf Loopback;
  `GET /api/demo` liefert Geometrie, Originalergebnisse und Tageszustände.
- `frontend/src/Plot.tsx`: SVG in lokalen Metern. Zoom und Verschiebung ändern
  nur die `viewBox`, keine Fachkoordinaten oder Kapazitäten.
- `Details.tsx`, `Forecast.tsx`, `App.tsx`: Beetauswahl, Wochenprognose und
  Saisonsteuerung. ISO-Kalenderdaten; Datumsformatierung explizit in UTC.
- `types.ts`: kleiner expliziter Transportvertrag.

Erntephase bezeichnet das Intervall von erster Ernte bis exklusivem Ernteende,
auch zwischen Mehrfachschnitten. Dies ist keine Behauptung täglicher Ernte.
Räumung endet am exklusiven Belegungsende. Anzucht wird im Detail als Termin
gezeigt und belegt kein Feldbeet. Darstellung ist ein Plan, kein Ist-Protokoll.
Leere Beete sind im Prototyp nur darstellbar, nicht manuell bearbeitbar.

## Oberfläche neu bauen

Node.js 22 LTS oder neuer und pnpm 11 installieren bzw. bereitstellen:

```powershell
cd ~\Documents\MarketGardenPlanner\frontend
pnpm install --frozen-lockfile
pnpm run build
```

Der Lockfile hält die aufgelösten Versionen fest. Alternativ mit npm:
`npm install` und `npm run build`; dabei entsteht ein eigener npm-Lockfile.
Für Frontend-Entwicklung zusätzlich zum Python-Server `pnpm dev` starten
und dessen lokale URL öffnen; `/api` wird an Port 8765 weitergeleitet.
Der normale Start verwendet ausschließlich den statischen Produktionsbuild.

Falls die Windows-Ausführungsumgebung Node-Unterprozesse mit `spawn EPERM`
blockiert, gibt es einen gleichwertigen direkten Build mit TypeScript-Prüfung:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\build.ps1
```

Das Skript unterstützt `-NodeExecutable <absoluter Pfad zu node.exe>`.
Dieser Weg wurde in der Implementierungsumgebung verwendet. Installation der
Pakete und direkter Build sind getrennte Schritte. Es werden keine Skripte
zur Laufzeit der Browseranwendung nachgeladen.

## Prüfungen

```powershell
cd ~\Documents\MarketGardenPlanner
$env:PYTHONPATH="$PWD\src"
py -3.11 -B -m unittest discover -s tests -v
```

30 bisherige Tests unverändert; ergänzende Integrationstests prüfen den
Darstellungsvertrag, Tagesgrenzen, Kulturfolgen und Geometrie-/Kapazitätsbezug.
`pnpm run build` prüft TypeScript und erstellt den Browserbuild.

## Bewusste Grenzen

Alle Agronomiewerte und der Lageplan sind synthetisch und bleiben getrennt von
`data/cultures.json`. Kein Geometrieeditor, Optimierer, Datenbank, 3D-Renderer
oder Desktop-Installer. Keine automatische Standortkalibrierung. SVG-Positionen
sind präzise Modellkoordinaten; Pflanzenzustände sind schematische Planphasen.
Der Standardbibliothek-Server ist nur für diesen lokalen, lesenden Prototypen
vorgesehen. Ein späterer API-Adapter kann ihn ersetzen, ohne den Kern zu ändern.
