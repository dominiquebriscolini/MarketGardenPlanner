# Phase 3A.2 — Ernteprognose und Overlay-Korrektur

## Ergebnis

Die Oberfläche verwendet einheitlich den Namen **Ernteprognose**. Angezeigt
wird ausschließlich die ISO-Kalenderwoche des Saisonreglers, Montag bis Sonntag,
mit Kalenderwochennummer, ISO-Wochenjahr und Datumsbereich. In leeren Wochen
lautet die Anzeige „Keine Ernte in dieser Woche erwartet“.

Das Prognosefenster ist unabhängig vom rechten Beetdetailpanel. Beide können
gleichzeitig geöffnet sein. Ein Beetwechsel aktualisiert nur das Beetpanel;
die Ernteprognose bleibt für die gewählte Woche bestehen. Grundstückskarte,
Geometrie, Agronomieberechnungen und Python-Scheduler sind unverändert.

## Datenvertrag

`forecastModel.ts` wählt aus `ScheduleResult.crop_forecasts` ausschließlich
Zeilen mit dem zur gewählten Woche passenden `week_start`. Die Scheduler-Wochen
beginnen bereits montags. Das Frontend gruppiert nach Kultur-ID und Einheit
und verwendet **quantity**, nicht `credited_quantity`.

Damit zählen auch Ernten außerhalb eines Ziel-Erntefensters zur tatsächlichen
Wochenprognose. kg und Stück werden niemals zusammengezählt. Es gibt weder
Jahressummen noch eine Filterung nach dem visuellen Beetstatus. Synthetische
Daten bleiben im Projekttitel und im Prognosefenster gekennzeichnet.

Die ISO-Wochenberechnung verwendet ausschließlich UTC-Kalenderdaten, ohne
lokale Zeitverschiebung oder Sommerzeit-Arithmetik. Die Mengen selbst stammen
vollständig aus dem bestehenden Python-Scheduler; das Frontend erstellt keine
zusätzlichen Ertragsannahmen.

Beispiele aus dem tatsächlichen synthetischen Scheduler-Lauf:

| Ausgewählter Tag | Kalenderwoche | Anzeige |
|---|---|---|
| 10.06.2026 | KW 24, 08.–14.06. | Keine Ernte erwartet |
| 20.06.2026 | KW 25, 15.–21.06. | 600 Stück Kopfsalat, obwohl alle Beete an diesem Tag frei sind |
| 22.06.2026 | KW 26, 22.–28.06. | Keine Ernte erwartet |
| 16.08.2026 | KW 33, 10.–16.08. | 24,25 kg Tomaten, keine Saisonpauschale |
| 31.10.2026 | KW 44, 26.10.–01.11. | 36 kg Spinat; Zielanrechnung in dieser Woche ist dagegen 0 |

## Fenster und Bedienung

- Über die kompakte Schaltfläche „Ernteprognose“ öffnen und schließen.
- Am Fenstertitel ziehen. Pointer-Capture hält die Bewegung auch außerhalb
  der Titelleiste zuverlässig am Fenster. Die Karte erhält diese Eingaben nicht.
- Das gesamte Fenster bleibt mit mindestens 12 Pixeln Abstand im Viewport.
  Größenänderungen und wechselnde Inhaltshöhen werden berücksichtigt.
- Der Titel ist per Tab erreichbar. Pfeiltasten verschieben um 10 Pixel,
  Shift+Pfeiltasten um 50 Pixel. Esc im Titel schließt nur die Prognose;
  die Beetauswahl und dessen Detailpanel bleiben bestehen.
- Die Schließen-Schaltfläche ist fest im Fensterkopf; der Inhalt scrollt.
- Die verschobene Position bleibt beim Schließen und Wiederöffnen innerhalb
  derselben Sitzung erhalten. Ein Wechsel zwischen schmalem und breitem Layout
  setzt sie auf die zur jeweiligen Bildschirmgröße passende Ausgangsposition.
- Am Desktop liegt das Fenster zunächst links unterhalb der Legende und
  oberhalb der Saisonleiste. Die rechte Beetdetailspalte bleibt verfügbar.
- Auf schmalen Bildschirmen wird das Beetpanel bei geöffneter Ernteprognose
  in der Höhe begrenzt. Beide Fenster stehen in der Ausgangsposition übereinander,
  jeweils mit eigenem Scrollbereich; die Saisonleiste bleibt darunter erreichbar.
- Bewusst manuell verschobene Fenster dürfen andere Inhalte überdecken. Es
  gibt keine automatische Kollisionsoptimierung zwischen Bedienfenstern.

Das Öffnen oder Verschieben eines Fensters verändert die Karten-`viewBox`
nicht. Pan, Zoom, Beet-Hover, Beetauswahl und der gemeinsame Saisontag bleiben
erhalten. Die Prognose wird bei jeder Änderung des Saisonreglers unmittelbar
aus den bereits geladenen Scheduler-Ergebnissen ausgewählt.

## Module

- `forecastModel.ts`: Wochenabgrenzung, Auswahl und Gruppierung der vorhandenen
  Erntemengen; initiale Fensterabmessungen und Begrenzung im Bildschirmraum.
- `Forecast.tsx`: kleine Wochenansicht mit Kultur und erwarteter Menge bzw.
  eindeutigem Leerzustand. Keine jährlichen Produktionsbilanzen im Fenster.
- `ForecastWindow.tsx`: unabhängiges Fenster mit Drag, Tastaturbedienung und
  gemessenen Abmessungen.
- `App.tsx`: unabhängige Zustände für Prognoseöffnung/-position und Beetauswahl.
- `docs/PRODUCT.md`: ausschließlich zukünftige Anforderungen zu Varianten/Bake,
  manueller Geometriebearbeitung und historischen Ertragsdaten.

## Prüfungen

Ausgeführt unter Python 3.11.9, Node 24.22.1 und TypeScript 5.9.3:

| Prüfung | Ergebnis |
|---|---|
| Bestehende Python-Tests | **32 erfolgreich**, unverändert |
| Frontend-Tests | **12 erfolgreich**: 4 bisherige und 8 neue Tests |
| TypeScript `tsc --noEmit` | Erfolgreich |
| Frontend-Build | Erfolgreich über `frontend/build.ps1`, direkter esbuild-Aufruf |
| HTTP-Vorschau | HTTP 200 |
| JavaScript-Konsole | Keine gemeldeten Fehler |

Die neuen Tests prüfen Montag/Sonntag und den anschließenden Montag,
ISO-Wochenjahre und Sommerzeitgrenzen, Wochen ohne Ernte, getrennte Einheiten,
Gruppierung, Ausschluss anderer Wochen/Jahressummen sowie ungekürzte
Wochenmengen außerhalb des Zielzeitraums. Zusätzlich werden Fenstergrenzen
nach Verschieben/Resize und die Ausgangsposition gegen die übrigen Bedienelemente
geprüft. Ein Teil dieser Tests verwendet direkt vor dem Testlauf aus dem
unveränderten Python-Scheduler generierte Ergebnisse in `.test-build/demo.json`.
Andere kleine Vertragsfixtures sind ausschließlich synthetische Testdaten.

```powershell
cd ~\Documents\MarketGardenPlanner
$env:PYTHONPATH="$PWD\src"
py -3.11 -B -m unittest discover -s tests -v
cd frontend
powershell -NoProfile -ExecutionPolicy Bypass -File .\build.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File .\test.ps1
```

Die Frontend-Skripte unterstützen weiterhin `-NodeExecutable <Pfad zu node.exe>`.
Der Testlauf benötigt jetzt ebenfalls Python 3.11 für die realen Scheduler-
Ergebnisse. Der normale Anwendungsstart bleibt unverändert:

```powershell
cd ~\Documents\MarketGardenPlanner
powershell -NoProfile -ExecutionPolicy Bypass -File .\start-prototype.ps1
```

Danach **http://127.0.0.1:8765** öffnen; Strg+C beendet den Server.

### Visuelle Abnahme

Im Browser bei normalem Viewport (1280 × 720) und bei 390 × 844 Pixeln geprüft:

1. Beetdetails und Ernteprognose gleichzeitig geöffnet; neues Beet anklicken
   ersetzt ausschließlich das Beetpanel.
2. 20. Juni: Beete und Detailstatus „Frei“, dennoch 600 Stück Kopfsalat in KW 25.
   22. Juni: unmittelbar korrekter Leerzustand in KW 26.
3. 16. August: 24,25 kg Tomaten als Wochenmenge.
4. Drag am Titel verschiebt nur das Fenster; Karten-`viewBox` und Auswahl
   bleiben unverändert. Ziehen bis zur unteren rechten Ecke wird begrenzt.
5. Schließen/Wiederöffnen sowie Pfeiltasten und Esc im Titel geprüft.
6. Zoom, Pan und Einpassen bei geöffneten Fenstern erhalten beide Panels.
7. Mobile Ausgangsposition: Beetpanel endet bei y=463, Prognose liegt bei
   y=475–701, Saisonleiste beginnt bei ungefähr y=723. Keine gegenseitige
   Überdeckung dieser drei Elemente; Karte bleibt 390 × 844 Pixel groß.
8. Screenshots der Desktop- und mobilen Ansicht gespeichert.

Keine funktionalen Blocker festgestellt. Auf niedrigen Bildschirmen müssen
Fensterinhalte gescrollt werden. Freie manuelle Positionierung kann andere
Overlays bewusst verdecken; nur die Bildschirmgrenzen werden erzwungen.

Keine Änderungen an Scheduler, Agronomieregeln, Grundstücksgeometrie oder
externen Projekten. Die Produktanforderungen sind ausschließlich dokumentiert,
nicht implementiert. Kein Git-Commit erstellt.
