# Phase 2: einfacher saisonaler Produktions-Scheduler

Implementiert am 16.11.2026, Python 3.11.9, ausschließlich Standardbibliothek.
Kein Optimierer, keine Rhino-Abhängigkeit und keine 3D-Geometrie.
Die produktive Kulturdatenbank wurde für Phase 2 nicht mit erfundenen Werten ergänzt.

## Module und Aufruf

| Modul | Verantwortung |
|---|---|
| `seasonal_models.py` | Ziele, Datumsfenster, saisonale Profile, Ertragsperioden, Beete |
| `batches.py` | Gleichmäßige Satzaufteilung, Rückwärtsrechnung und zeitliche Machbarkeit |
| `harvest.py` | Integration zeitbezogener Erträge und Wochenprognosen |
| `occupancy.py` | Kapazität, ganze Beetreservierungen, Konflikte und Wochenflächen |
| `scheduler.py` | Zusammensetzen dieser Schritte, Produktionsbilanz und Fehlmengen |

Der Einstieg ist `plan_season(targets, profiles, beds, planning_start=...)`.
Profile werden unter ihrer vorhandenen `CropProfile.id` übergeben. Ein
`SeasonalProfile` ergänzt diesen Kern mit ausdrücklich angegebenen Zeit- und
Ertragsparametern; es ändert das zugrunde liegende Profil nicht.
Es gibt keine automatische Ableitung aus den Freitext-Fakten der Kulturdatenbank.
Sorte, Methode und abweichende saisonale Dauer können mit separaten Profil-IDs
getrennt geführt werden. Ein einzelnes Profil hat zunächst konstante Dauern.

Alle agronomischen Zahlen sind `AgronomicParameter` mit Wert, Einheit, Quelle
und Status. Auch Ertragsoffsets, Periodendauern, Anzucht- und Räumzeiten haben
Herkunftsangaben. Kalendergrenzen stehen in `SeasonWindow` mit Quelle und Status.
Fehlende benötigte Eingaben lösen `MissingAgronomicData` aus. Es gibt keine
automatische Übernahme von Erträgen aus anderen Anbaumethoden oder Standorten.

## Ziel und Satzbildung

`SeasonalTarget` enthält Menge, Einheit `kg` oder `pieces` (Stück),
Erntefenster, Satzabstand in Tagen sowie Referenzbeetbreite/-länge für den
Bedarfsnachweis. Stückziele müssen ganzzahlig sein. Das Phase-1-Zielobjekt mit
`kg`/`plants` bleibt unverändert; der Scheduler übersetzt seinen Pflanzenbedarf
für Flächenberechnungen in dieses bestehende Kernformat.

Erste Ernten liegen ab Fensterbeginn im gewählten Abstand, bis ausschließlich
Fensterende. `first_harvest_on` kann den ersten Erntetermin explizit festlegen,
auch vor dem Zielzeitraum, etwa bei bereits beginnender Fruchternte.
Die Gesamtmenge wird gleichmäßig auf die Satzanker verteilt; Stückreste gehen
der Reihe nach an die ersten Sätze. Nullanteile erzeugen keinen Satz.

Für jeden Satz zählt ausschließlich der Ertrag innerhalb des Zielzeitraums.
Pflanzenbedarf = `ceil(Satzanteil / relevanter Ertrag je Pflanze)`.
Es gibt keine zusätzliche Garantie einer gleichmäßigen Wochenversorgung:
ein Ziel verlangt zunächst eine Gesamtmenge im angegebenen Erntezeitraum.
Satzanteile werden nicht nachträglich zwischen Sätzen umverteilt. Rundung kann
einen Überschuss erzeugen. Erträge werden nur dem Ziel des eigenen Satzes
gutgeschrieben, auch wenn andere Ziele dieselbe Kultur enthalten.

## Ertragsmodelle

| Modus | Eingabe und Verhalten |
|---|---|
| `single` | Genau ein Erntepunkt am ersten Erntetag |
| `continuous` | Lückenlose, nicht überlappende Perioden ab erster Ernte |
| `multicut` | Eindeutig sortierte Schnitttermine, erster Schnitt am ersten Erntetag |
| `storage` | Eine gebündelte Lagerernte; die Fläche wird danach freigegeben |

Jede `YieldPeriod` enthält Offset ab erster Ernte in Tagen, Dauer in Tagen
und **Gesamtmenge je Pflanze über die Periode**, nicht Menge pro Tag.
Dauer null bedeutet Punkt-Ernte. Eine Wochenperiode hat beispielsweise Dauer
sieben und eine Gesamtmenge in `kg/plant` oder `pieces/plant`.

Bei kontinuierlicher Ernte wird die explizite Periodenmenge gleichmäßig über
deren Kalendertage verteilt. Diese mathematische Planungsannahme erlaubt eine
nachvollziehbare anteilige Berechnung von Teilwochen und ist keine gemessene
tägliche Ertragskurve. Wer Tageswerte hat, kann Ein-Tages-Perioden liefern.
Fehlende oder überlappende innere Abschnitte sind ungültig. Explizite Nullerträge
sind zulässig. Das Ende der letzten gelieferten Periode definiert das Kulturende;
danach wird kein Ertrag extrapoliert. Eine unbekannte Fortsetzung muss zuerst
als vollständiges Profil geklärt werden, bevor sie geplant werden kann.

`HarvestWeek.quantity` enthält die gesamte Ernte einer Kalenderwoche,
`credited_quantity` nur den Anteil im Zielzeitraum. Wochen beginnen montags,
auch über Jahresgrenzen hinweg. `crop_forecasts` aggregiert nach Kultur und
Einheit, ohne kg und Stück zu vermischen. Prognosen sind Erwartungsmengen;
bei Ertragsquoten können Stückprognosen rechnerisch gebrochene Werte enthalten.

Lagerernte bezeichnet zunächst die tatsächliche gebündelte Ernte. Lagerbestand,
Lagerverluste, Haltbarkeit und spätere Auslieferung werden nicht simuliert.
Mehrfachschnitt reserviert das Beet durchgehend bis nach dem letzten Schnitt.

## Rückwärtsrechnung und Zeitprüfung

- Feldbeginn = erster Erntetag minus Feldtage bis erster Ernte.
- Direktsaat: Aussaat = Feldbeginn, kein Auspflanztermin.
- Jungpflanzen: Pflanzung = Feldbeginn; Aussaat = Pflanzung minus Anzuchttage.
- Eine Aussaat vor dem expliziten `planning_start` ist nicht mehr ausführbar.
- Gelieferte Aussaat-/Pflanzfenster werden überprüft. Ein leeres Tupel bedeutet
  „kein zulässiger Termin“, `None` dagegen „nicht hinterlegt/nicht geprüft“.
  Ungeprüfte Kalendergrenzen erscheinen als Warnung, nicht als Eignungsnachweis.

Anzucht findet außerhalb der produktiven Beete statt. Anzuchtflächen und
Kapazitäten sind noch nicht modelliert. Die Verlustkonvention aus Phase 1
bleibt bestehen: der geplante Bestand ist der produktive Pflanzenbestand,
keine separate Simulation aller Ausfallstufen. Fehlende Saatgutparameter
werden als Warnungen ausgewiesen; sie verhindern keine ansonsten belegte
Flächen-/Ernteplanung. Fehlende Abstände verhindern dagegen die Flächenplanung.

## Belegung und Kapazität

Alle Datumsintervalle sind **`[Beginn, Ende)`**. Bei Punkt-Ernte gehört der
Erntetag zur Belegung; danach folgt die explizit angegebene Räumzeit.
Bei kontinuierlicher Ernte ist das Periodenende bereits exklusiv.
Direkter Anschluss an ein Belegungsende ist erlaubt; frühere Nutzung ist ein Konflikt.

Sätze werden nach Feldbeginn verarbeitet, bei Gleichstand in Eingabereihenfolge.
Beete werden in der übergebenen Reihenfolge gewählt. Diese einfache Erstbelegung
reserviert ganze Beete, auch bei Restkapazität. Ein Satz kann mehrere Beete
nutzen und bei Engpässen teilweise zugewiesen werden. Unterschiedliche Beetmaße
sind möglich. Zu schmale oder kurze Beete liefern null Kapazität.

Die Reihen-/Positionskonvention stammt aus dem bestehenden Kern: ganze Reihen,
ganze Positionen, halber Reihenabstand je Seitenrand. `unused_area_m2` ist die
reservierte Fläche abzüglich des rechnerischen kontinuierlichen Pflanzenbedarfs;
sie beschreibt Restfläche einschließlich Längenrundung, keine freie Teilbeetgeometrie.

Bestehende Reservierungen können übergeben werden und blockieren Kapazität.
Ungültige Beetverweise und bereits überlappende Reservierungen werden abgelehnt.
`find_overlaps` ist außerdem als unabhängige Konfliktprüfung verfügbar.
Es erfolgen keine Terminverschiebung, Prioritätsoptimierung oder zweite Suche
nach einer global besseren Belegung. Gemeldete Engpässe beziehen sich auf
diese deterministische Planung, nicht auf einen Unmöglichkeitsbeweis für jede Alternative.

## Wochenflächen und Defizite

`area_weeks` enthält pro Kalenderwoche zwei **gleichzeitige Tagesmaxima**:

- `required_peak_m2`: Bedarf der geplanten Sätze in ganzen Referenzbeeten,
  einschließlich zeitlich abgelehnter Sätze, damit der ursprüngliche Bedarf sichtbar bleibt.
- `reserved_peak_m2`: tatsächliche Reservierungen im vorhandenen Beetangebot.

Bestehende externe Reservierungen zählen bei beiden Werten zusätzlich.
Die Referenzbeetmaße können von den vorhandenen Beeten abweichen; die Differenz
der beiden Flächen ist deshalb kein allgemeines Maß für fehlende Quadratmeter.
Nacheinander genutzte Beete innerhalb derselben Woche werden nicht doppelt
addiert, wenn ihre Nutzungen zeitlich nicht überlappen.

Je Ziel werden angeforderte Menge, erreichbare Menge im Zeitraum, Fehlmenge,
Überschuss und Gründe ausgegeben. Fehlmenge = `max(0, Ziel - erreichbare Menge)`.
Zeit- und Flächenprobleme sind durch `time:...`/`area:...` getrennt erkennbar.
Fehlende Agronomiedaten werden als Datenfehler behandelt, nicht als bewiesener
Nullertrag oder Produktionsdefizit.

## Ausführen und Prüfergebnis

```powershell
$env:PYTHONPATH = "$PWD/src"
py -3.11 -m unittest discover -s tests -v
py -3.11 examples/synthetic_scheduler.py
```

Das Beispiel verwendet ausschließlich ausdrücklich synthetische Parameter
und gibt einen vollständigen JSON-Plan aus. Datumswerte werden als ISO-Daten
serialisiert. Es liest oder verändert die produktive Kulturdatenbank nicht.

30 Tests bestehen unter Python 3.11.9: 14 bisherige Tests, vier ursprüngliche
Abnahmefälle 3–6 und zwölf weitere saisonale Grenzfalltests. Details:
[Testprotokoll](test-results.txt) und [Abnahmefälle](acceptance.md).

Die Tests belegen Rechenregeln und Schnittstellen, keine realen Luxemburger
Erträge. Reale Planung benötigt weiterhin belegte saisonale Eingaben.
