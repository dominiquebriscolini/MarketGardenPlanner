# Produktanforderungen und spätere Entwicklung

## Aktueller Umfang

Phase 3A.2 stellt die lokale, maßstäbliche Karte, unabhängige Beetdetails und
eine kalenderwochengenaue Ernteprognose auf Basis des Python-Schedulers bereit.
Die nachfolgenden Anforderungen sind ausdrücklich **zukünftig** und werden
in dieser Implementierungsphase nicht umgesetzt.

## Planungsvarianten / Bake — zukünftig

- Generierte Pläne als eigenständige Varianten speichern.
- Varianten duplizieren und vergleichen.
- Flächennutzung, Wege und prognostizierte Erträge zwischen Varianten vergleichen.

## Manuelle Geometriebearbeitung — zukünftig

- Automatisch generierte Beete nachträglich präzise verändern.
- Beispiel: Beetbreite von 65 auf 75 cm ändern.
- Einseitige oder symmetrische Verbreiterung ermöglichen.
- Änderungen auf Kollisionen prüfen.
- Manuell bearbeitete Elemente gegen automatische Optimierung sperren.

## Historische Ertragsdaten — zukünftig

- Nutzer können eigene Ertragswerte aus vergangenen Jahren eingeben.
- Prognosen, historische Erfahrungswerte und tatsächliche Ernten getrennt speichern.
- Daten Kultur, Sorte, Beet und Anbaujahr zuordnen.
- Später die Ertragsprognosen mit betriebseigenen Daten kalibrieren können.

Die Kennzeichnung synthetischer Daten, die nachvollziehbare Herkunft aller
agrarischen Eingaben und die Trennung von Fachgeometrie und Darstellung bleiben
dabei verbindlich. Diese Liste beauftragt weder Optimierung noch Speicherung
oder Geometriebearbeitung für den aktuellen Prototypen.
