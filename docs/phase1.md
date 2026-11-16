# Phase 1: Datenvertrag und Berechnung

Fortschreibung: Der saisonale Scheduler ist inzwischen als Phase 2 implementiert.
Dieses Dokument beschreibt den unveränderten Phase-1-Kern; die aktuelle
Saisonplanung steht in [phase2.md](phase2.md).

## Herkunft und Status

Jeder agronomische Parameter enthält `value`, `unit`, `source`, `status`.
Fehlend: `value: null`, `source: null`, `status: "missing"`; eine bekannte
Quelle kann auch bei noch fehlendem Wert angegeben werden. Bekannte Werte
benötigen eine nicht leere Quellenangabe. Status: `unverified`, `verified`,
`synthetic`, `source_value` oder `planning_assumption`. Der Rechner meldet verwendete nicht verifizierte Werte als
Warnungen. Der Status ist eine redaktionelle Angabe, kein automatischer Quellenbeweis.

Ein Anbauprofil referenziert eine Pflanzenart und optional eine konkrete Sorte.
Sortenspezifische Parameter gehören in das zugehörige Profil; automatische
Vererbung oder Durchschnittsbildung findet nicht statt. Mehrere Profile pro Art
oder Sorte sind möglich. Die Datenbank enthält keine Produktionsziele;
sie sind separate Planungsaufträge.

| Parameter | Einheit | Bedeutung |
|---|---|---|
| yield_per_plant | kg/plant | geplanter nutzbarer Gesamtertrag je etablierter Pflanze im betrachteten Produktionsauftrag |
| germination_rate | fraction | Keimquote in (0, 1] |
| establishment_rate | fraction | Etablierungsquote nach Keimung in (0, 1] |
| plant_spacing | m | Pflanzabstand innerhalb einer Reihe |
| row_spacing | m | Reihenabstand |
| seeds_per_gram | seeds/g | Saatgutanzahl pro Gramm |

Diese Definitionen sind Modellkonventionen und enthalten keine agronomischen
Empfehlungen. Aufschläge und Ausfallquoten werden nicht automatisch angenommen.
`establishment_rate` berücksichtigt bei Direktsaat die Etablierung im Beet,
bei Pflanzung die Etablierung bis zur produktiven Pflanze einschließlich Anzucht.
Ein separater Jungpflanzenbedarf mit mehreren Ausfallstufen ist noch nicht modelliert.

## Rechenregeln

1. Pflanzenbedarf: `ceil(Ziel_kg / Ertrag_kg_pro_Pflanze)` oder `ceil(Ziel_Pflanzen)`.
2. Saatgutanzahl: `ceil(Pflanzen / (Keimquote * Etablierungsquote))`.
3. Saatgutmasse: `Saatgutanzahl / Samen_pro_Gramm`.
4. Reihenmeter: `Pflanzen * Pflanzabstand`.
5. Reihen pro Beet: `floor(Beetbreite / Reihenabstand)`; beidseitig wird jeweils
   ein halber Reihenabstand reserviert. Ein Beet ohne Platz für eine Reihe ist ungültig.
6. Kontinuierliche Beetfläche: `Reihenmeter / Reihen_pro_Beet * Beetbreite`.
7. Bei fester Beetlänge: Positionen je Reihe `floor(Beetlänge / Pflanzabstand)`,
   Beetanzahl `ceil(Pflanzen / (Positionen * Reihen_pro_Beet))` und reservierte
   Fläche `Beetanzahl * Beetlänge * Beetbreite`. Diese Fläche enthält die Rundung
   auf ganze Beete. Wege und andere Infrastruktur sind nicht enthalten.

Flächen beziehen sich auf die etablierten Pflanzen. Saatgutverluste erhöhen
den Saatgutbedarf, nicht automatisch die produktive Beetfläche. Eine Planung
von Anzuchtflächen oder der Nachsaat in leere Direktsaatpositionen ist nicht enthalten.
Die kontinuierliche Fläche ist eine Bedarfskennzahl und keine Belegungsgeometrie.

Fehlende Werte blockieren nur abhängige Ergebnisse (`None`/JSON `null`).
`missing` nennt die fehlenden Eingangsparameter der jeweils erreichbaren
Rechenschritte. Bei fehlendem Ertrag wird nicht zusätzlich die gesamte
nachgelagerte Parameterliste als fehlend ausgegeben. Ein Nullziel liefert
Nullbedarf ohne agronomische Werte; die Reihenanzahl bleibt dabei unbestimmt.

Mit `calculate(..., required_outputs=("plants", "seeds"))` können Aufrufer
konkrete Ergebnisse verlangen. Fehlen dafür Daten, wird `MissingAgronomicData`
mit Profil-ID, Parameternamen und nicht berechenbaren Ausgaben ausgelöst.
Ohne diese Option bleibt die bisherige Teilergebnisschnittstelle erhalten.

Schema 2 ergänzt pro Profil `facts`: belegte Bereiche, Kalenderfenster,
Ertragsreferenzen und Hinweise mit Wert, Einheit, Quelle, Status, Geltungsbereich
und Notiz. Diese Fakten ersetzen keine fehlenden skalaren Kernparameter.
Der Lader unterstützt weiterhin Schema 1 und prüft auch zusätzliche Fakten.

## Architektur

Der Kern importiert nur die Python-Standardbibliothek. JSON-Transport kann mit
`dataclasses.asdict` erfolgen. Eine spätere Rhino-7-/Grasshopper-Anbindung
übersetzt Ein-/Ausgaben in einem Adapter. Rhino 7 mit IronPython 2.7 kann diesen
Python-3.11-Code nicht direkt laden; dafür ist ein externer Python-Prozess oder
Service vorzusehen. Der spätere Transport ist noch nicht implementiert.
Scheduler, Zeitachsen, Ernteverteilung und 3D-Geometrie sind nicht Teil von Phase 1.

## Bestehende Regressionstestgruppen

| ID | Gegenstand |
|---|---|
| A01 | Datenmodell, Herkunft, Status, Einheiten |
| A02 | externe JSON-Daten und Referenzintegrität |
| A03 | Pflanzenbedarf und Ganzzahlrundung |
| A04 | Saatgutbedarf und Saatgutmasse |
| A05 | Reihenmeter, Beetfläche und feste Beete |
| A06 | fehlende Parameter und unabhängige Teilergebnisse |
| A07 | Grenzwerte, Nullziel, JSON-Ausgabe und deterministischer Kern |

Numerische Ertrags-/Verlust-Testwerte sind ausdrücklich synthetisch und dürfen
nicht in die produktive Kulturdatenbank übernommen werden. Die ursprünglichen
Abnahmefälle sind inzwischen bekannt und separat in [acceptance.md](acceptance.md)
erfasst. Fälle 1, 2 und 7 sind zusätzlich automatisiert implementiert;
Fälle 3–6 bleiben Spezifikationen für spätere Funktionen.

## Noch offen

- Lokale Kalibrierung und konkrete Sortenwahl; bisher ist nur eine konkrete Sorte hinterlegt.
- Belastbare skalare Ertrags-, Keim- und Etablierungsdaten für die operativen Profile.
- Lokale Zeitreihen und betriebliche Kalibrierung für den inzwischen implementierten Phase-2-Scheduler.

Alle zehn vereinbarten Kulturen sind mit insgesamt 15 getrennten Profilen
hinterlegt. Ihre Abdeckung ist jeweils teilweise. Details und Quellen stehen
in [agronomy-sources.md](agronomy-sources.md); der letzte Testlauf steht in
[test-results.txt](test-results.txt). Die vollständige agronomische Kalibrierung
bleibt offen. Fälle 3–6 sind inzwischen mit synthetischen Daten automatisiert
umgesetzt; siehe [phase2.md](phase2.md).
