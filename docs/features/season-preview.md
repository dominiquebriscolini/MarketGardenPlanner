# Schreibgeschützte Saisonvorschau

[DEC-046](../DECISIONS.md#dec-046--lokale-statische-saisonvorschau) ·
[DEC-047](../DECISIONS.md#dec-047--öffentliche-github-pages-saisonvorschau) ·
[Lokaler Start](../../README.md#schreibgeschützte-saisonvorschau)

Der **Testgarten am Feldweg** zeigt die Saison vom 1. März bis 1. November 2026.
Auf acht Beeten sind alle 15 aktuellen Katalogprofile aus zehn Kulturarten
vertreten, einschließlich Kohlrabi Superschmelz. Mehrere Profile derselben
Kulturart teilen sich das vorhandene Pflanzenmotiv. Aussaat, Pflanzung,
Ernte und Belegung sind ausdrücklich synthetisch.

- Die Vorschau bietet Draufsicht und Isometrie, Hell und Dunkel,
  Saisonregler, Beetdetails und synthetische Ernteprognose. Die Kulturliste
  springt zu Erntebeginn und zeigt das Beet des ausgewählten Satzes.
- Der Build exportiert die Saison aus dem Python-Scheduler über das bestehende
  Demoformat. Der Export meldet fehlende Katalogabdeckung oder nicht erfüllte
  synthetische Ziele als Buildfehler. Im Browser werden nur die statischen
  Dateien des Builds benötigt. Fehlt die Saisondatei, zeigt die Oberfläche
  eine Fehlermeldung mit Wiederholungsmöglichkeit.
- Der normale Planner behält seinen bisherigen Einstieg. Die Vorschau bindet
  weder Projektliste noch Bearbeitungswerkzeuge ein und verwendet keine
  SQLite-Datenbank.

## Abnahmekriterien

Alle Katalogprofile sind belegt und direkt ansteuerbar. Zwischen Saisonbeginn
und Saisonende ist jeden Tag mindestens ein Beet im Wachstum oder in der Ernte.
In der Vorschau funktionieren Kartenwechsel, Saisonnavigation und Beetdetails
mit ausschließlich statischen GET-Anfragen. Projekt- und Schreibaktionen sind
in der Vorschau nicht verfügbar.

## Lokaler Prüfstand vor der Veröffentlichung am 18.11.2026

- Implementiert im lokalen Arbeitsstand auf Basis von `e40d58e`.
  Normaler Frontend-Build, Vorschau-Build und TypeScript-Prüfung erfolgreich.
  131 Python- und 89 Frontend-Tests bestanden.
- Im Saisonexport sind auf allen 246 Tagen Kulturen im Wachstum oder in der
  Ernte. Der Scheduler konnte alle 15 Ziele vollständig belegen.
- Playwright mit Chrome und separatem statischem Loopback-Server ohne
  Projektdatenbank. Geprüft wurden Saisonanfang und -ende, Wochenschritt,
  Isometrie, alle 15 Kultursprünge mit passendem Beet und aktiver Kulturkarte,
  Theme-Wechsel, Ernteprognose, fehlende Löschaktion und mobile Bedienung
  bei 390 × 844 px. Die Seite stellte nur lokale statische GET-Anfragen.
  Der geprüfte Ablauf meldete keine Browserfehler.
- Zu diesem Zeitpunkt standen die gemeinsame visuelle Abnahme und
  die Veröffentlichung aus.

## Öffentliche Fassung vom 18.11.2026

[Vorschau öffnen](https://dominiquebriscolini.github.io/MarketGardenPlanner-Preview/) ·
[Öffentliches Repository](https://github.com/dominiquebriscolini/MarketGardenPlanner-Preview)

`./frontend/build.ps1 -PublicPreview` erzeugt `frontend/dist/public-preview`
mit zehn eigenen SVG-Pflanzensymbolen. GitHub Pages veröffentlicht das
Stammverzeichnis von `main` im separaten Vorschau-Repository. Dort liegen
`.nojekyll`, `index.html`, `season.json` und die beiden gebündelten CSS- und
JavaScript-Dateien. Der Planner-Quellstand verbleibt im privaten Hauptrepository.

- Veröffentlichung im Vorschau-Commit `acde34b`. GitHub Pages meldet den
  Build als abgeschlossen. HTTPS und der Zugriff ohne Anmeldung wurden geprüft.
- Chrome-Prüfung der veröffentlichten Seite: 15 Kulturprofile in der Auswahl,
  Wechsel zwischen Draufsicht und Isometrie, Kultursprünge für Tomaten und
  Kohlrabi Superschmelz sowie gezeichnete Symbole zum Saisonstart und im
  Dunkelmodus. Die Anwendung lud ausschließlich statische Ressourcen unter
  der öffentlichen Vorschau-URL. Kein Browserfehler im geprüften Ablauf.
- Der lokale Entwicklungsstand im Hauptrepository blieb uncommittet.
  Gemeinsame visuelle Abnahme steht aus.

## Bereinigte Prüfkopie vom 18.11.2026

Lokaler, uncommitteter Arbeitsstand auf Basis des bereinigten `master`
(`905204b`). Der normale Planner und beide Vorschau-Builds verwenden
denselben [eigenen SVG-Pflanzensatz](../../frontend/src/plantSymbols.ts).
Die Symbole ändern ihre Größe mit der schematischen Wachstumsphase und
haben eine statische Pose. Die archivierten Lab-Versuche benötigen für die
Wiedergabe ihrer früheren Bildsätze neu erzeugte lokale Exporte.

- TypeScript und Produktionsbuild erfolgreich. `-Preview` und `-PublicPreview`
  bauen die statische Fassung. `-PublicPreview` erzeugt auch `.nojekyll` für
  die spätere Bereitstellung aus dem Hauptrepository.
- 131 Python- und 89 Frontend-Tests bestanden. Relative Markdown-Links und
  Sprungmarken geprüft. Archivberichte nennen entfernte Artefakte im Text.
- Playwright/Chrome prüfte den normalen Einstieg mit isolierter synthetischer
  SQLite-Umgebung. Die Isometrie zeichnete die neuen Symbole. Die öffentliche
  Build-Variante wurde lokal von einem separaten statischen Server unter einem
  Unterpfad geladen. Geprüft wurden alle 15 Kultursprünge mit Beetdetails,
  Saisonanfang und -ende, Hell/Dunkel, 2D und Isometrie, Ernteprognose,
  mobiles Layout bei 390 × 844 px und ausschließlich statische GET-Anfragen.
- Gemeinsame visuelle Abnahme und Einbindung in GitHub Pages des Hauptrepos
  stehen aus.
