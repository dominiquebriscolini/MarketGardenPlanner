# Ursprüngliche Abnahmefälle

Alle sieben Fälle sind automatisiert ausführbar. Numerische Ertrags-/Verlustwerte
in Tests sind **synthetisch**, keine Empfehlungen und keine Produktivdaten.

| Fall | Status | Prüfung |
|---|---|---|
| 1: 150 Salatköpfe | implementiert | 150 produktive Pflanzen, ein Kopf je Pflanze; synthetisch 80 % Keimung und 90 % Etablierung → 209 Samen. Ohne Verluste → 150. Recherchiertes Profil ohne Quoten verweigert angeforderten Saatgutbedarf. |
| 2: 100 kg Karotten | implementiert | Synthetisch 0,1 kg/Pflanze → 1.000 Positionen, bei explizit gewählten 0,04 m Abstand 40 Reihenmeter; synthetisch 80 %/90 % → 1.389 Samen. Ohne kg/Pflanze keine erfundene Positionenzahl. |
| 7: fehlender Ertrag | implementiert | Für alle 15 Profile bleiben abhängige Ergebnisse `None`. Angeforderte Vollergebnisse lösen `MissingAgronomicData` mit Profil-ID, `yield_per_plant` und Ausgaben aus. Nullziele/Pflanzenzahlziele brauchen keinen kg-Ertrag. |

Die bestehende Verlustformel lautet
`ceil(produktive Pflanzen / (Keimrate * Etablierungsrate))`.
Etablierung ist eine zusammengefasste Quote nach der Keimung. `plants`
bezeichnet den produktiven Zielbestand, nicht alle ursprünglich ausgepflanzten
Pflanzen. Die Fläche folgt diesem Zielbestand. Getrennte Anzucht-, Pflanz- und
Ernteverluststufen und eine anfänglich höhere Beetbelegung sind damit noch
nicht nachgewiesen. Auch Samenmehrbedarf durch manuelles Vereinzeln ist
nicht ohne zusätzliche explizite Eingaben abgebildet.

## Automatisierte Abnahme Phase 2

### 3: 50 kg Tomaten mit zeitbezogenem Ertragsprofil

Gegeben: Sorten-/methodenspezifische Tages-/Wochenerträge je Pflanze, Zeitanker,
Ziel-Ernteintervall, Zielmenge 50 kg. Erwartet: Nur Ertragsanteile im Zielintervall
summieren, Pflanzen aufrunden; außerhalb liegende Erträge zählen nicht.
Eine Verdopplung der relevanten Ertragssumme halbiert den ungerundeten Bedarf.
Fehlende Zeitabschnitte erzeugen eine eindeutige Meldung, keine Ersatzschätzung.
Kein Einsatz einer Saisonpauschale oder eines Gewächshausertrags.

Implementiert in `test_seasonal_acceptance.py`: 50 kg im Zweiwochenfenster
benötigen bei synthetisch 1 + 2 kg/Pflanze 17 Pflanzen. Eine dritte Ertragswoche
wird prognostiziert, aber nicht dem Ziel gutgeschrieben. Lokale Zeitreihen fehlen weiterhin.

### 4: Salatsätze alle 14 Tage

Gegeben: erster Pflanztermin, Satzanzahl, 14-Tage-Pflanzintervall und saisonale
Dauerprofile. Erwartet: Pflanztermine exakt 14 Tage auseinander; Anzucht,
Pflanzung, Ernte und Beetbelegung getrennt ausweisen. Ungültige Saisonfenster
melden. Gleiches Pflanzintervall garantiert kein gleiches Ernteintervall.

Implementiert: vier Sätze mit jeweils 20 Stück; Aussaat-, Pflanz- und erste
Erntetermine liegen bei gleicher synthetischer Dauer jeweils 14 Tage auseinander.
Saisonale Dauerunterschiede sind über getrennte Profile abzubilden; kein Klimamodell.

### 5: Radieschen → Salat ohne Belegungsüberschneidung

Gegeben: gleiches Beet, Radieschenende, Salatbeginn und explizite Räum-/Vorbereitungsdauer.
Erwartet: Salatbeginn frühestens am Radieschenende plus Vorbereitung. Frühere
Belegung als Konflikt melden. Intervalle `[Beginn, Ende)` erlauben bei Vorbereitung
null einen direkten Anschluss. Externe Jungpflanzenanzucht belegt dieses Beet nicht.

Implementiert: dasselbe Beet wird nach Radieschen für Salat freigegeben.
Direkter Anschluss ist konfliktfrei, eine zusätzliche Räumzeit verhindert
die sonst zu frühe Salatbelegung und erzeugt ein Defizit.

### 6: Unzureichende Beetfläche

Gegeben: verfügbare Beetmaße/-anzahl, Abstände, Ziel und vollständiges passendes
Ertrags-/Verlustmodell. Erwartet: Ganze nutzbare Positionen und erreichbare
Produktion ausgeben, Fehlmenge `max(0, Ziel - Produktion)`, Restflächen ausweisen.
Keine Bruchpflanzen, negative Fehlmengen oder Doppelbelegung bei mehreren Kulturen.
Fehlender Ertrag erzeugt eine Datenfehlermeldung.

Implementiert: ein synthetisches 1,20 × 1,00-m-Beet fasst zwölf produktive
Pflanzen. Bei synthetisch 0,5 kg/Pflanze werden vom 10-kg-Ziel sechs kg
erreicht; vier kg fehlen. Bedarf, reservierte Fläche und Restfläche werden geprüft.

Fälle 3–6 sind bestandene automatisierte Tests. Ergänzende saisonale Tests
decken unter anderem Datenlücken, Ertragsprofil-Lücken, Kalenderfenster,
Mehrfachschnitt, Lagerernte, Teilwochen und zeitlichen Kapazitätsmangel ab.
Grenzen und Modellkonventionen stehen in [phase2.md](phase2.md).
3D-Geometrie wurde nicht implementiert.
