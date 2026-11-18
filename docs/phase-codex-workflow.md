# Codex-Workflow und Testläufe

**18.11.2026** · Arbeitsstand auf HEAD `20e6a63` einschließlich vorhandener
lokaler Änderungen. Auftrag und Freigabe im Chat „Codex-Workflow optimieren“.

- [AGENTS.md](../AGENTS.md) bündelt den Einstieg in neue Phasen und präzisiert
  das Nachlesen bei Folgeaufträgen. Das Entscheidungsprotokoll und die
  gesonderte Freigabe für Implementierungen gelten weiter.
- Der [Frontend-Runner](../frontend/test.ps1) übernimmt mit `-TestFile` eine
  Dateiauswahl und leitet frische Bundles und Fixtures aus den literalen
  `../.test-build/`-Pfaden in den ausgewählten Tests ab. Er bündelt TS-Module
  und TSX-Komponenten in getrennten esbuild-Aufrufen. Ein Dateilock schützt
  gemeinsam genutzte Testausgaben im selben Checkout.
- Der [Browserabnahme-Skill](../.agents/skills/planner-browser-acceptance/SKILL.md)
  dokumentiert den Ablauf mit einem isolierten Testserver, synthetischer SQLite-
  Datenbank und benannter Playwright-Sitzung. Kommandos stehen im [README](../README.md).

## Automatische Prüfung am 18.11.2026

| Lauf | Ergebnis |
|---|---|
| Python, `test_project_season.py` | 11 bestanden |
| Python, vollständige Suite | 126 bestanden |
| Frontend, `interactions.test.mjs` | 4 bestanden, keine Python-Fixtures benötigt |
| Frontend, `cultivation.test.mjs` und `project-season.test.mjs` | 24 bestanden |
| Frontend, vollständige Suite | 88 bestanden |
| Frontend, unbekannter Testdateiname | Vor dem Testlauf mit verständlicher Meldung abgewiesen |
| Frontend, Testausgaben bereits gesperrt | Zweiter Zugriff vor Build und Fixture-Erzeugung abgewiesen |
| TypeScript und Produktionsbuild | Bestanden |
| Playwright mit Headless Chrome | Synthetisches Projekt geladen und beide Beete per Tastatur ausgewählt. Jeweilige Geometriedetails angezeigt, Projektrevision erhalten. Keine JavaScript-Seitenfehler, bekannter HTTP 404 für `favicon.ico`. Sitzung, Server und temporäre Dateien aufgeräumt. |

Lokale Einzelmessungen für den vollständigen Lauf mit PowerShell-Start:
etwa 2,26 s vorher, 1,92 s danach.
`interactions.test.mjs` allein dauerte etwa 0,70 s. In einem separaten Volltest
zeigte `-Verbose` 95 ms Bundling, 856 ms Python-Fixtures und 277 ms Node-Tests.
Die Werte beschreiben einzelne Läufe. Die Tokenersparnis wurde nicht gemessen.

Die Skill-Metadaten und Links wurden statisch geprüft. Dem mitgelieferten
Python-Validator fehlte PyYAML. Der Browserlauf prüfte den Arbeitsablauf anhand
eines lesenden Projektfalls. Gemeinsame Nutzerabnahme steht aus. Es gab keine
Anpassungen am Anwendungscode und keinen Git-Commit.
