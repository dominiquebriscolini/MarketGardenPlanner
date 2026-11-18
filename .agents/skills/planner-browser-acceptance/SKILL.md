---
name: planner-browser-acceptance
description: Prüfe freigegebene MarketGardenPlanner-Oberflächen lokal mit Playwright und isolierten synthetischen Daten. Verwenden für Browserabnahme von Planner-Interaktionen oder Layout, einschließlich projektspezifischer Schreibprüfungen.
---

# Planner-Browserabnahme

1. Die konkreten Abnahmekriterien aus dem Auftrag und der betroffenen
   Spezifikation oder dem relevanten Phasenbericht lesen. Den vorhandenen
   [Produktionsbuild](../../../README.md#entwicklung-und-prüfungen) erstellen
   oder einen nachweislich aktuellen Build verwenden.
2. Ein eindeutiges temporäres Verzeichnis für SQLite und Serverlogs anlegen
   und dessen absoluten Pfad in `$qaDirectory` setzen.
   Die API aus dem Repository-Stamm mit der bestehenden Python-Umgebung starten
   und den vom Betriebssystem zugewiesenen Loopback-Port aus dem Startlog lesen:

   ```powershell
   .\.venv\Scripts\python.exe -B -m market_garden_planner.api.server --database "$qaDirectory\synthetic.sqlite3" --port 0
   ```

   Nur diese Serverinstanz verwenden. Für die schreibgeschützte Demo reichen
   die eingebauten synthetischen Daten. Für Projektinteraktionen ein mit
   Synthetisch/SYNTHETIC gekennzeichnetes Projekt über die API oder den
   Repository-Code anlegen. Vorhandene Fixture-Exporte in
   [frontend/tests](../../../frontend/tests) liefern bei Bedarf Testgeometrie
   und Kulturbeispiele. Die lokale Nutzerdatenbank bleibt unberührt.
3. Im temporären Arbeitsverzeichnis eine eindeutig benannte Playwright-CLI-Sitzung
   öffnen (`playwright-cli -s=<name> open <Loopback-URL> --browser=chrome`).
   Zusammenhängende Interaktionen und Assertions mit
   `run-code --filename=<Skript>` bündeln. Bei Schreibprüfungen den API-Zustand
   vor und nach der Aktion vergleichen und bei Bedarf neu laden. Browserfehler
   erfassen. Viewports und Screenshots aus den Abnahmekriterien ableiten.
4. Auch bei Fehlern die benannte Sitzung mit `playwright-cli -s=<name> close`
   schließen und den selbst gestarteten Server beenden. Benötigte Nachweise
   sichern und übrige temporäre Artefakte entfernen. Datum, geprüften Umfang,
   Ergebnisse und verbleibende Nutzerabnahme im relevanten Bericht festhalten.

Beispiel für eine Projektabnahme mit getrenntem Server und synthetischer
Datenbank: [Phase 3C.2](../../../docs/phase3c2.md#prüfungen-der-ux-fortschreibung).
