# Erste integrierte Garten-Isometrie

Der Mehrkultur-Bildsatz liegt als
[Integrationsvorbereitung](features/VIS-GRAIN-004-INTEGRATION.md) vor.

**18.11.2026** · [DEC-033](DECISIONS.md#dec-033),
[DEC-034](DECISIONS.md#dec-034), [OQ-019](OPEN_QUESTIONS.md#oq-019).
Implementiert im lokalen Arbeitsstand auf HEAD `20e6a63` mit vorhandenen
nicht eingecheckten Änderungen. Gemeinsame Abnahme offen.

## Bedienung und Umfang

- Im Projektkopf schaltet **Draufsicht / Iso** zwischen geometrischer
  Bearbeitung und isometrischer Information um. Die gewählte Ansicht ändert
  weder das Projekt noch die Beetauswahl oder die Saisonposition. Die
  Draufsicht behält beim Wechsel ihren Zoom und Verschiebeausschnitt.
- Die beiden Modi verwenden dieselbe metrische Geometrie einschließlich
  schräger Beete, Grundstücksaussparungen und der vorhandenen Demo-Weglinie.
  Auswahl per Maus und Tastatur führt zum gemeinsamen Informationspanel.
  In der Isometrie sind Geometrie- und Kulturbearbeitung ausgeblendet und
  das Löschkürzel ist deaktiviert. Geometrieentwürfe und laufende
  Speicheraktionen sperren den Ansichtswechsel bis zur Auflösung.
- **Hell / Dunkel** gilt für beide Ansichten im gleichen Browser.
  Beim ersten Aufruf dient die Systemeinstellung als Ausgangswert.
  Feine Kanten, Monospace-Beschriftung und eine zurückhaltende Palette
  greifen die Gestaltung von [Grainrad](https://grainrad.com/) auf.
- Nur die Isometrie zeigt ASCII-Tomaten. Die Demo nutzt bestehende
  Scheduler-Phasen für Wachstum und Ernte. Gespeicherte Projekte zeigen
  Symbole für Tomatenvorgänge mit bestätigtem Planungszeitraum in der
  ausgewählten Woche. Unklare Enden und andere Kulturen bleiben über die
  jeweiligen vorhandenen Statusfarben und Kulturinformationen ablesbar.
  Die Kalenderwoche bildet eine Planungsabsicht ab.
- Der vorbereitete [VIS-GRAIN-003-Atlas](../experiments/botanical-ascii-lab/VIS-GRAIN-003.md)
  wird lokal als Bildsatz eingebunden. Die drei Posen wechseln zeitversetzt
  mit festem Fußpunkt. Bei reduzierter Bewegung bleibt die mittlere Pose
  stehen. Der Planner benötigt im Betrieb keine Verbindung zu Grainrad.

## Darstellungsgrenzen

Pro Beet steht zunächst eine schematische Reihe entlang der Beetlänge.
Die reine Darstellungsregel verwendet aufgerundet ein Zeichen je 1,25 m,
mindestens eins und höchstens zwölf pro Beet. Reale Reihen und Pflanzabstände
sind für diese Darstellung nicht hinterlegt. Symbolzahl und -größe haben
keine agronomische Bedeutung. Die feste Projektion und automatische
Einpassung bilden die erste Ausbaustufe. Weitere Kulturen, Verdeckung
dichter Bestände und Leistungsgrenzen großer Gärten bleiben
Gegenstand von OQ-019. Vor externer Veröffentlichung sind die Nutzungsrechte
der Bildreferenz zu klären. Backend, Scheduler, API und SQLite-Schema wurden
für diese Ausbaustufe nicht geändert.

## Prüfstand

- Python-Suite: 126 Tests bestanden. Frontend-Suite: 88 Tests bestanden.
  TypeScript-Prüfung und Frontend-Produktionsbuild erfolgreich.
- Headless Chromium mit isoliertem, synthetischem SQLite-Testprojekt:
  Demo-Saisontag und Projektwoche bleiben beim Ansichtswechsel erhalten.
  Bedienung des Saisonreglers innerhalb der Isometrie blendet die
  Tomatensymbole passend ein und aus. Geprüft wurden gemeinsame Auswahl,
  schreibgeschützte Isometrie, erhaltener 2D-Ausschnitt, gespeicherte
  Beetverschiebung mit aktualisierter Isometrie, Windzyklus und reduzierte
  Bewegung sowie der wiederhergestellte Dunkelmodus nach Neuladen.
  Hell und Dunkel bei 1440 × 900 visuell geprüft, schmales Layout bei
  390 × 844 geprüft. Keine unbeabsichtigten Schreibanfragen oder Seitenfehler.
- Gemeinsame Nutzerabnahme weiterhin offen.
- Kein Git-Commit.

## Fortschreibung — Pan und Zoom, 18.11.2026

[DEC-035](DECISIONS.md#dec-035) erweitert die isometrische Bedienung.
Ziehen per Maus oder Touch verschiebt den Ausschnitt. Das Mausrad zoomt
am Mauszeiger. Die Plus-/Minus-Schaltflächen zoomen um die Bildmitte.
Auf breiten Bildschirmen können Pfeilschaltflächen den Ausschnitt auch
per Tastatur verschieben. „Garten einpassen“ stellt den Ausgangsausschnitt
wieder her. Beim erneuten Öffnen der Isometrie wird der Garten eingepasst.
Die 2D-Kamera, die gemeinsame Auswahl und der Saisonzeitpunkt bleiben
beim Ansichtswechsel erhalten.

Geprüft im lokalen Arbeitsstand auf HEAD `20e6a63`: 88 Frontend-Tests,
TypeScript und Produktionsbuild erfolgreich. Chromium mit synthetischen
Demodaten prüfte Beetauswahl per Klick, Maus- und Touch-Pan, Auswahlerhalt
beim Ziehen, am Mauszeiger verankerten Zoom, tastaturbedienbare
Kartenwerkzeuge, Einpassen und den unveränderten 2D-Ausschnitt. Der mobile
Test lief bei 390 × 844. Die Beetgeometrie blieb gleich und die Navigation
löste keine Schreibanfragen aus. Nutzerabnahme der Navigation offen.
Kein Git-Commit.

## Fortschreibung — Beetnamen und Winkelanzeige, 18.11.2026

[DEC-036](DECISIONS.md#dec-036) beschränkt die Winkelanzeige auf Geometrie
in der Beetplanung. Mausrotation und Shift-Raster bleiben verfügbar.
Bei Bestandsnamen in der Form „Testbeet 06 / 320°“ bleibt der gespeicherte
Name bis zur ausdrücklichen Umbenennung erhalten. Die Oberfläche blendet
den Winkelzusatz aus. Im Geometrieformular kann ein ungesperrtes Beet
umbenannt werden. Der revisionsgesicherte Beet-PATCH nimmt dafür das Feld
`name` an und weist leere neue Namen ab.

Die Iso-Kästchen bleiben horizontal und haben eine feste Bildschirmhöhe.
Feine Linien verbinden sie mit den projizierten Beetmittelpunkten.
Bei engem Platz haben ausgewählte Beete Vorrang. Kästchen ohne freie
Position erscheinen wieder, sobald mehr Platz verfügbar ist. Lange Namen
können im Kästchen gekürzt werden und sind im Beetdetail vollständig lesbar.

Lokaler Stand auf HEAD `20e6a63`: 126 Python-Tests, 88 Frontend-Tests und
Produktionsbuild erfolgreich. Chromium mit isolierter synthetischer
SQLite-Datenbank bestätigte Umbenennung nach Neuladen, unveränderte
Geometrie und Kulturen beim Umbenennen, Mausrotation und zwölf horizontale
Kästchen ohne Überdeckung bei 1440 × 900. Zoom und das schmale Layout bei
390 × 844 wurden ebenfalls geprüft. Gemeinsame Nutzerabnahme offen.
Kein Git-Commit.

### Nachbesserung am 18.11.2026

Die Umbenennung steht mit eigener Speicherschaltfläche direkt im Beetpanel.
Die Geo-Felder und Sperren bleiben unverändert. Die Iso-Kästchen halten
mindestens 14 CSS-Pixel Abstand zur projizierten Begrenzungsbox des
zugehörigen Beets. Die Prüfung auf Kästchenüberdeckung bleibt aktiv.

Produktionsbuild und 88 Frontend-Tests erfolgreich. Chromium prüfte mit
einer isolierten Kopie des synthetischen Testgartens die Umbenennung von
„Testbeet 04“ bei geschlossener Geometrie und nach Neuladen. Geometrie und
Kulturplan blieben gleich. Abstand und Überdeckung am Desktop, nach Zoom
und bei 390 × 844 geprüft. Nutzerabnahme offen. Kein Git-Commit.

## Fortschreibung — Beetplanung und Kulturplanung, 18.11.2026

[DEC-037](DECISIONS.md#dec-037) benennt die Modi und ordnet die Bearbeitung
zu. In der Beetplanung stehen Name und Geometrie im rechten Beetpanel.
Die Kulturübersicht zeigt gespeicherte Vorgänge samt Aussaat- oder
Pflanztermin und geplantem Erntezeitpunkt zur Einsicht. In der
Kulturplanung werden Anbauvorgänge rechts angelegt, geändert und entfernt.
Geometrie und Herkunft werden dort ausgeblendet. Ein offener Kulturentwurf
kann nach einem Ansichtswechsel in der Kulturplanung fortgesetzt werden.
Die Demo bleibt in beiden Modi schreibgeschützt.

Produktionsbuild und 88 Frontend-Tests erfolgreich. Chromium prüfte im
lokalen Arbeitsstand auf HEAD `20e6a63` mit einer isolierten synthetischen
Projektkopie die Anzeige der jeweiligen Werkzeuge und die Speicherung
eines Erntedatums in der Kulturplanung. Die Beetplanung zeigte das
gespeicherte Datum auch nach Neuladen. Geometrie und Geometrie-Token waren
unverändert. Beetauswahl, Saisonposition sowie Kulturentwurf blieben beim
Ansichtswechsel erhalten. Das Layout wurde auch bei 390 × 844 auf
horizontalen Überlauf geprüft. Nutzerabnahme offen. Kein Git-Commit.

## Fortschreibung — Automatisches Speichern der Kulturplanung, 18.11.2026

[DEC-038](DECISIONS.md#dec-038) speichert gültige Kultur-, Anbau- und
Datumsänderungen nach 650 ms Eingabepause. Beim Anlegen sind Kultur und
Startdatum Pflicht. Die geplante Ernte kann leer bleiben. Der neu angelegte
Vorgang bleibt geöffnet und weitere Änderungen verwenden seine gespeicherte ID.
„Fertig“ schließt das Formular. Solange eine Speicherung aussteht oder
läuft, sind Beet- und Ansichtswechsel gesperrt. Ein Speicherfehler wird
angezeigt, ohne eine Speicherung vorzutäuschen. Endgültiges Entfernen
behält die Bestätigung. Eine Undo-Funktion wurde optional angesprochen.

Produktionsbuild und 88 Frontend-Tests erfolgreich. Chromium prüfte im
lokalen Arbeitsstand auf HEAD `20e6a63` mit isolierter synthetischer
Projektkopie, dass ungültige Daten keine Schreibanfrage auslösen,
schnelle Start-/Ernteänderungen gemeinsam gespeichert werden und ein
automatisch angelegter Vorgang anschließend über dieselbe ID aktualisiert
wird. Termine nach Neuladen bestätigt. Geometrie und Geometrie-Token
unverändert. Nutzerabnahme offen. Kein Git-Commit.

## Fortschreibung — Legende der Wochenbelegung, 18.11.2026

[DEC-039](DECISIONS.md#dec-039) vereinheitlicht Konturen und Legende in
beiden Ansichten. Gestrichelt sind Beete ohne Anbauvorgang. Die
Grundstücksaussparung hat eine durchgezogene Kontur. „In dieser Woche
laut Plan unbelegt“ fasst die vorhandenen Wochenstatus vor dem ersten
Anbau, zwischen zwei Vorgängen und nach dem letzten geplanten Enddatum
zusammen. Das bestätigt keine tatsächliche Räumung. Ohne geplantes
Erntedatum ist der Starttag bekannt, die Dauer bleibt unklar.
Punkte kennzeichnen fehlende Ernteangaben. Überlagerungen behalten die
Schraffur. Die Python-Wochenlogik und der Zeitvertrag bleiben unverändert.

Lokaler Arbeitsstand auf HEAD `20e6a63`. Produktionsbuild und alle
88 Frontend-Tests bestanden. Chromium prüfte mit isoliertem
synthetischem Projekt sieben Wochenzustände, Kartenmuster, Konturen und
Legende in Beet- und Kulturplanung. Hell/Dunkel und 390 × 844 wurden
geprüft. Nutzerabnahme offen. Kein Git-Commit.

## Fortschreibung — Neues Projekt, 18.11.2026

[DEC-040](DECISIONS.md#dec-040) ergänzt „Neues Projekt“ bei der
Projektauswahl. Name, Breite und Länge sind Pflicht. Die eingegebenen
Metermaße definieren ein leeres Rechteck im bestehenden metrischen Raum.
Die Anlage öffnet die Beetplanung. Das Projekt bleibt in der Auswahlliste
verfügbar. Die Dialog-ID bleibt bei einem erneuten Sendeversuch gleich,
damit eine verlorene Antwort kein Duplikat erzeugt. Freie Umrisse und
nachträgliche Grundstücksbearbeitung bleiben offen.

Lokaler Arbeitsstand auf HEAD `20e6a63`. Produktionsbuild, 127 Python-
und 88 Frontend-Tests erfolgreich. Chromium prüfte mit isolierter SQLite-
Datenbank Abbrechen, ungültige Breite, Anlage mit Dezimalmaßen,
automatische Auswahl, Zeichnen des ersten Beets und Wiederöffnen nach
Neuladen. Dialog bei 390 × 844 geprüft. API-Regressionstest bestätigt
Wiederholung ohne Duplikat und Konflikt bei abweichenden Eingaben.
Nutzerabnahme offen. Kein Git-Commit.

## Fortschreibung — Pflanzraster je Kultur, 18.11.2026

[DEC-042](DECISIONS.md#dec-042), erste Ausbaustufe. Die ISO-Wochenprojektion
liefert pro Anbauvorgang Reihenanzahl, Plätze in der Reihe, Abstände,
Kapazität und Herkunft der Abstände. Der bestehende Katalog enthält alle
15 Profile samt Kennzeichnung von Quellenwerten und Planungsannahmen.
Referenzen unter anderem [LWG Gemüse und Kräuter](https://www.lwg.bayern.de/mam/cms06/landespflege/dateien/merkblatt_gemuese_in.pdf),
[BZL Rote Bete](https://www.landwirtschaft.de/garten/selbst-anbauen/gemuesesteckbriefe/rote-bete-selbst-im-garten-anbauen)
und [Agronomiequellen](agronomy-sources.md). Die Werte sind kulturbezogene
Abstandssysteme mit jeweils dokumentiertem Geltungsbereich.

Die Belegungskapazität verwendet ganze Reihen und Positionen. Das Raster
liegt mittig im Beet, seine Abstände bleiben beim Zentrieren erhalten.
Das Panel zeigt das Potenzial pro Kulturvorgang für das ganze Beet.
Die Draufsicht zeigt nur bei genau einer bekannten aktiven Kultur ohne
gemeldete mögliche Überlagerung das X-Raster. Lücken, unklare Wochen
und Mehrfachbelegung erhalten kein räumlich zugewiesenes Raster.

Ausstehend: VIS-GRAIN-004 an dieselben Pflanzenpositionen anbinden,
Zeitzuordnung der Wachstumsstufen und belegbare Ertragsgrundlage.
Die Lab-Größenstufen ordnen sich bislang keinen fachlichen Zeitpunkten zu.
Die katalogweiten Ertragslücken werden weder durch synthetische Zahlen
noch durch Übernahme fachlich andersartiger Reihenwerte geschlossen.
OQ-007 bis OQ-010 und OQ-019 bleiben relevant.

Lokaler Arbeitsstand auf HEAD `20e6a63`. 128 Python- und 89 Frontend-Tests
sowie Produktionsbuild erfolgreich. Chromium mit synthetischem
Projekt prüfte bei 1,20 × 6,00 m den Wechsel von 80 Kopfsalatplätzen auf
1.200 Radieschenplätze, die kulturspezifischen Abstände sowie Wochen
ohne X bei leeren oder überlagerten Beeten. Kein Git-Commit.

## Fortschreibung — Projektpflanzen und Referenzertrag, 18.11.2026

[DEC-043](DECISIONS.md#dec-043) ergänzt VIS-GRAIN-004 für alle zehn Arten
bzw. 15 Katalogprofile im Projektmodus. Die Iso-Pflanzen stehen auf dem
Raster der X-Markierungen. Eine gemeinsam genutzte Canvas-Ebene cullt
Ausserhalbpositionen und zeichnet bei weniger als drei Pixel Punktabstand
eine Teilmenge der Rasterpunkte. Kapazitäten bleiben exakt.
Die Darstellung nutzt vier Größenstufen am Mittelpunkt des bekannten
Belegungsabschnitts der ausgewählten Woche, bezogen auf den geplanten
Zeitraum von Start bis Ernte. Bei offenem Ende erscheint nur in der
bekannten Startwoche die kleinste Stufe. Die Stufen sind schematisch.
Für unklare oder gleichzeitig mehrfach belegte Beetflächen wird kein
gemeinsames Raster erfunden. Die Lab-Untergrundebene und lokal
kalibrierte Wachstumsphasen bleiben offen.

Das Beetpanel zeigt veröffentlichte Referenzwerte pro Pflanze oder
Reihenlänge, auf Vollbelegung hochgerechnet und mit Quelle versehen.
Bei fehlender passender Referenz bleibt der Beetertrag offen.
Die Schätzung fließt weder in den Scheduler noch in Wochenprognosen ein.
[Umrechnung und Quellen](agronomy-sources.md).

Lokaler Stand auf HEAD `20e6a63`. Produktionsbuild, 129 Python- und
89 Frontend-Tests bestanden. Chromium mit isolierter synthetischer
Projektkopie prüfte Quelle und Ertragsspanne, fehlende Referenz,
vier verschiedene gezeichnete Größenstufen, Kulturwechsel, Zeitpunkt
ohne eindeutig bekannte Belegung, Hell/Dunkel, reduzierte Bewegung
und 390 × 844. Nutzerabnahme offen. Kein Git-Commit.

## Fortschreibung — Mischkulturreihen, 18.11.2026

[DEC-044](DECISIONS.md#dec-044) ergänzt „Reihen von links“ in der
Kulturplanung. Beim bestehenden Anbauvorgang eine Liste wie `1, 3, 5`
eingeben. Die automatische Speicherung verwendet die ID und Revision
des Vorgangs. Eine leere Angabe bleibt die bisherige Ganzbeetplanung.
Gleichzeitig darzustellende Kulturen benötigen eigene Reihennummern.
Nachfolgende Vorgänge können dieselben Nummern neu vergeben.

Reihennummern definieren die Reihenfolge, ausgelassene Nummern reservieren
keinen Platz. Python zentriert die belegten Reihen in der Beetbreite.
Zwischen benachbarten Reihen liegt je ein halber Reihenabstand beider
Kulturen. Die Zahl der Positionen entlang der Reihe bleibt kulturabhängig.
Für explizite Zuordnungen zeigt die Wochenkarte die Aufteilung am letzten
bekannten belegten Tag der Woche. Doppelte Reihennummern, zu breite
Aufteilungen, fehlende Zuordnungen oder unsichere Überlagerungen bleiben
als Planungsprobleme sichtbar, bis korrigiert wird. In solchen Wochen
wird kein widersprüchliches Raster eingezeichnet. Es wird keine
Verträglichkeit zwischen Kulturen behauptet.

API: optionales `row_numbers` in bestehenden Kulturvorgängen.
Auslassen beim Bearbeiten erhält gespeicherte Reihen, `null` setzt
auf Ganzbeetplanung zurück. Alte Daten bleiben lesbar. Die Wochenprojektion
liefert `row_positions_m`, `row_layout_day` oder `row_layout_issue`.
X und Iso-Atlas nutzen dieselben Mittellinien. Referenzschätzungen werden
aus der Anzahl zugeteilter Reihen skaliert und bleiben bei blockierter
Aufteilung für die betroffenen Vorgänge in der gewählten Woche ausgeblendet.

Lokaler Stand auf HEAD `20e6a63`. Produktionsbuild, 131 Python- und
89 Frontend-Tests erfolgreich. Chromium prüfte an einem synthetischen,
rotierten Testbeet die automatische und dauerhafte Speicherung,
eine Tomatenreihe mit vier Radieschenreihen, Referenzertrag, X und
Iso-Atlas, Folgebelegung, doppelte Nummer und zu breite Planung.
Beetgeometrie und Geometrie-Token blieben unverändert. Nutzerabnahme
offen. Kein Git-Commit.

## Fortschreibung — Gleichmäßige ASCII-Füllung, 18.11.2026

[DEC-045](DECISIONS.md#dec-045) entkoppelt die Iso-Symbole vom fachlichen
Pflanzraster. Eindeutig belegte Bereiche erhalten eine mittig angeordnete
Füllung mit 0,8 m Darstellungsabstand und mindestens einem Zeichen je
Bereich. Zugeordnete Mischkulturen behalten ihre Bereiche. Ungeklärte
Belegung bleibt kenntlich. Beetplanung, Pflanzzählung und Referenzertrag
rechnen weiterhin mit ihren fachlichen Abständen.

Die vier sichtbaren Größenstufen ändern die Glyphengröße am festen
Fußpunkt. Die Projekt-Isometrie verwendet die geplanten Termine.
In der Demo bestimmt der Scheduler die Belegung und den geplanten
Erntebeginn. Die separate HTML-Canvas-Ebene macht die Symbole im
Chromium-Compositing sichtbar. Namenskärtchen und Auswahlkonturen
liegen darüber.

Lokaler Stand auf HEAD `20e6a63`. Produktionsbuild und 89 Frontend-Tests
bestanden. Chromium prüfte auf einem synthetischen Beet von 2,40 × 6,40 m
bei Tomaten und Radieschen jeweils 24 sichtbare Positionen, vier
steigende Symbolgrößen mit gleichem Fußpunkt, das separate X-Raster,
Bedienung bei 390 × 844 und eine weitere Kultur in der Demo.
Die Sichtbarkeit wurde anhand der Browseraufnahme geprüft.
Gemeinsame Nutzerabnahme offen. Kein Git-Commit.

## Korrektur — Sichtbarer Ausschnitt der Pflanzenebene, 18.11.2026

Die ASCII-Pflanzenebene verwendet die vollständige sichtbare Fläche der
isometrischen SVG-Karte. Beim Zoomen, Verschieben und bei abweichenden
Fensterproportionen stimmen die Ränder beider Ebenen überein.

Produktionsbuild und 89 Frontend-Tests bestanden. Die Chromium-Prüfung
mit synthetischen Demodaten erfasste bei 1881 × 671 und 600 % Zoom
Pflanzenpixel in beiden zuvor abgeschnittenen Randbereichen sowie
deckungsgleiche Ebenen bei 390 × 844. Nutzerabnahme offen. Kein Git-Commit.

## Gestaltungsanpassung — Pflanzen im Vordergrund, 18.11.2026

Die Kulturplanung zeichnet die vorhandenen ASCII-Pflanzen rund 40 % größer.
Beetkonturen haben eine konstante Strichstärke von 0,75 px, die
Hervorhebung 1,25 px. Zeichenabstand und Wachstumsstufen bleiben erhalten.

Lokaler Stand auf HEAD `20e6a63`. Produktionsbuild und 89 Frontend-Tests
bestanden. Chromium prüfte die größere Zeichnung in der synthetischen Demo
und die konstante Beetkontur bei 100 % und 600 % Zoom.
Nutzerabnahme offen. Kein Git-Commit.
