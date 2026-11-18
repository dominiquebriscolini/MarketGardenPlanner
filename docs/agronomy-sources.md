# Kulturdaten: Quellen und Datenlücken

Recherche: 16.11.2026. Zielstandort: Luxemburg, Freiland.
Zehn Kulturen sind in 15 Anbauprofilen erfasst. Botanische Art, Sorte und
Anbaumethode bleiben getrennt. Nur für Kohlrabi `Superschmelz` wurde eine
konkret belegte Sorte eingetragen. Sonst bedeutet `variety_id: null` ausdrücklich
„keine Sorte festgelegt“, nicht einen Durchschnitt aller Sorten.

## Herkunft und Geltung

- `source_value`: übernommener Quellenwert, gegebenenfalls cm → m umgerechnet.
  Keine automatische Standortvalidierung für Luxemburg.
- `planning_assumption`: offengelegte Auswahl oder Modellkonvention.
- `missing`: `value: null`, kein Ersatzwert.
- `synthetic`: ausschließlich Rechentestdaten.
- `verified`/`unverified`: für bestehende Dateien weiterhin unterstützt.

Alle Parameter haben Wert, Einheit, Quelle und Status. Ergänzende `facts`
enthalten außerdem `scope` und `note`. Bereiche bleiben Bereiche, Kalenderfenster
behalten die Genauigkeit der Quelle. Der Kern verwendet ausschließlich skalare
Kernparameter; er mittelt keine Bereiche und interpretiert keine Freitextfenster.
Verwendete Werte mit Status ungleich `verified` erscheinen als Warnungen.

Deutsche Gartenbauempfehlungen sind Ausgangsreferenzen. Minnesota-Angaben sind
separate US-Referenzen und keine Luxemburger Betriebsvorgaben. Lokale Versuche,
Höhenlage, Boden, gewählte Sorten und konkrete Kulturführung fehlen. Besonders
frühe Termine bleiben von Witterung und Schutzmaßnahmen abhängig.

## Quellenregister

Die vollständigen URLs stehen auch direkt an den Daten. Recherche am 16.11.2026;
die Originalquellen wurden nicht als lokale Volltextkopien gespeichert.

| Quelle | Übernommene Angaben und Grenzen |
|---|---|
| [LWG: Gemüse und Kräuter](https://www.lwg.bayern.de/mam/cms06/landespflege/dateien/merkblatt_gemuese_in.pdf), PDF S. 5–6 | Abstände und Kalenderbeispiele früher Karotten, Radieschen, Spinat, Buschbohnen, Zucchini und Tomaten. Kleinstflächenkontext; kompakter Zucchiniabstand ist keine allgemeine Erwerbsanbauempfehlung. |
| [LWG: Fruchtfolge für Gemüsebeete](https://www.lwg.bayern.de/mam/cms06/gartenakademie/dateien/2111-2016.pdf), PDF S. 1 | Salat- und Radieschenabstände; nicht mit anderen Abstandssystemen gemittelt. |
| [BZL/BLE: Möhren](https://www.landwirtschaft.de/garten/selbst-anbauen/gemuesesteckbriefe/moehren-selbst-im-garten-anbauen), Aussaat/Pflanzung, Pflege | Abstandsspanne, Aussaatfenster und Bodentemperaturbedingung; kein kg/Pflanze-Ertrag. |
| [BZL/BLE: Rote Bete](https://www.landwirtschaft.de/garten/selbst-anbauen/gemuesesteckbriefe/rote-bete-selbst-im-garten-anbauen), Aussaat und Ernte | Abstände, Fenster, Dauer ausgewachsener Rüben. Mehrsamige Knäuel sind keine einzelnen Samen; Babybeets benötigen ein eigenes Nutzungsprofil. |
| [Hortipendium: Kopfsalat](https://www.hortipendium.de/Kopfsalat_im_Hausgarten), Anbauplanung Buttersalat, Ernte | 14-tägige Pflanzungen, saisonale Standzeiten und Kopfgewichte. Tabelle für wärmere deutsche Weinbauregionen. Der offenbar Radicchio beschreibende Abschnitt „Salat Anbau“ wurde nicht übernommen. Kopfgrößen garantieren keine marktfähigen Erträge. |
| [Hortipendium: Kohlrabi Hausgarten](https://www.hortipendium.de/Kohlrabi_im_Hausgarten), Pflanzung | Getrennte Abstände üblicher Sorten und Superschmelz. |
| [Hortipendium: Kohlrabi Erwerbsanbau](https://www.hortipendium.de/Kohlrabi_Erwerbsanbau), Anbauplanung, Saatgut | Ausgewählte Mai–August-Pflanzsätze: Anzucht-/Standzeitbereiche, wöchentliche Staffelung. Saatgutuntergrenzen und Kornzahlspanne bleiben Referenzfakten, keine gemessenen Partiewerte. |
| [LWG: Nachkultur](https://www.lwg.bayern.de/gartenakademie/gartendokumente/infoschriften/148345/) | Herbstfenster für Radieschen, Spinat und Buschbohnen. Auffällig widersprüchliche Salat-/Kohlrabi-Nachkulturzeiten nicht übernommen. |
| [LWG: Vorbereitungen für den Gemüsegarten](https://www.lwg.bayern.de/gartenakademie/gartendokumente/gartencast/370792/index.php) | Geschützte Tomatenaussaat und Zucchini-Anzuchtdauer, keine Erfolgsquote. |
| [University of Minnesota: Crop and field planning](https://extension.umn.edu/agriculture/specialty-crops/vegetable-farming/crop-and-field-planning-tools-for-vegetable-farmers), Step 2/3 | Freiland-Referenzerträge in Originaleinheiten, getrennte Tomatentypen und Buschbohnen-Referenzdauer. Planungshilfe, kein lokaler Luxemburger Versuch. |
| [University of Minnesota: Climate resilience](https://extension.umn.edu/agriculture/specialty-crops/vegetable-farming/climate-resilience-resources-for-vegetable-growers-in-minnesota), Succession planting | Referenzintervalle zur Staffelung. Kopfsalat verwendet stattdessen die deutsche 14-Tage-Angabe. |
| [University of Minnesota: Growing onions](https://extension.umn.edu/garden-and-home/yard-and-garden/gardening-in-minnesota/growing-onions), Planting/Transplanting | Saatzwiebeln aus Direktsaat und Jungpflanzen getrennt, Abstandsbereiche und Anzucht. US-Termine sind kein Luxemburger Kalender. |

Hortipendium ist ein gartenbauliches Fachwiki mit benannten Fachautoren;
regionale Schätzwerte werden nicht als Versuchsergebnisse behandelt.
Eine Keimdauer wurde niemals als Keimquote interpretiert.

## Planungsannahmen

- Das reguläre Karottenprofil wählt die untere Grenze des belegten
  Pflanzabstandsbereichs. Der gesamte Bereich bleibt separat erhalten.
- Beide Saatzwiebelprofile wählen untere Abstandsgrenzen. Die Umrechnung
  verwendet exakt `1 inch = 0.0254 m`. Die Auswahl ist keine Quellenempfehlung
  für Luxemburg.
- Layoutbeispiele verwenden 1,20 m Beetbreite. Reihenanzahl:
  `floor(Breite / Reihenabstand)`. Breite für n Reihen: `n * Reihenabstand`.
  Je Seitenrand bleibt ein halber Reihenabstand. Dies ist eine Kernkonvention;
  Wege, Pflanzenüberhang, Pflegezugang und Stützsysteme werden nicht geprüft.
- Die Klassen `single_harvest`, `repeated_harvest` und für Tomaten
  `time_profile_required` beschreiben das vorgesehene Ertragsmodell.
  Die Metadaten führen noch keine zeitbezogene Berechnung aus.

## Datenstand je Kultur

„Vollständig“ setzt alle benötigten Betriebsparameter einschließlich lokaler
Ertragsgrundlage, Partiekeimung und Erfolgsquoten voraus.

| Kultur | Stand | Belegt | Wesentliche Lücken |
|---|---|---|---|
| Karotten | teilweise | Zwei Abstandssysteme, Fenster, Staffelung, Reihen-Ertragsreferenz | Lokales Wurzelgewicht/marktfähiger Ertrag je Pflanze, Kulturzeit, Partiekeimung/Feldaufgang |
| Kopfsalat | teilweise | Abstand, Pflanzfenster, saisonale Standzeiten, 14-Tage-Staffelung, Kopfgrößen | Aussaat-/Anzuchtprofil, Partiekeimung, Anzucht-/Felderfolg, marktfähige Quote |
| Radieschen | teilweise | Frühjahrs-/Herbstprofile, Abstände/Fenster, Staffelung, Reihen-Ertragsreferenz | Lokale Satzdauer, Knollengewicht, Ausfallquoten |
| Kohlrabi | teilweise | Standard-/Superschmelz-Abstände, Standard-Satzzeiten, Saatgutreferenzen | Superschmelz-Zeiten, tatsächliche Keim-/Anwuchsquote, marktfähiger Ertrag |
| Rote Bete | teilweise | Abstände, Fenster, Dauer ausgewachsener Rüben, Staffelung, Reihen-Ertragsreferenz | Monogerm-/Knäuelfestlegung, Partiedaten, Rübengewicht, Ausfälle |
| Spinat | teilweise | Frühjahrs-/Herbstprofile, Abstände/Fenster, Staffelung, Mehrschnitt-Ertragsreferenz | Nutzungsform, Zahl/Verlauf der Schnitte, Ertrag je Pflanze, Ausfälle |
| Buschbohnen | teilweise | Direktsaatabstände/-fenster, Herbstgrenze, Referenzdauer/-staffelung/-ertrag | Sorte, lokaler Ernteverlauf, Keim-/Feldquoten |
| Zucchini | teilweise | Kompaktes Abstandssystem, Pflanz-/Erntefenster, Anzuchtdauer, US-Staffelungs-/Ertragsspanne | Lokale Dichteprüfung, Sorte, zeitlicher Ertrag, Erfolgsquoten |
| Tomaten | teilweise | Abstände, Anzucht-/Pflanz-/Erntefenster, getrennte Cherry-/Slicer-Roma-Referenzen | Sorte, Führungssystem, zeitbezogener lokaler Ertrag, Erfolgsquoten |
| Zwiebeln | teilweise | Direktsaat-/Jungpflanzenprofile, Abstandsbereiche, US-Anzucht-/Kalender-/Ertragsreferenzen | Luxemburger Kalender/Kulturzeit, geeignete Sorte, Partiekeimung, marktfähiger Ertrag |

**Vollständig: 0. Teilweise: alle 10. Ohne jegliche belastbaren Angaben: 0.**
Das Superschmelz-Unterprofil enthält bislang nur den belegten Sortenabstand.
Steckzwiebeln sind als Alternative dokumentiert, aber kein Saatgutprofil;
der Kern modelliert vegetatives Pflanzgut derzeit nicht.

In allen 15 Profilen bleiben die operativen `yield_per_plant`, `germination_rate`,
`establishment_rate` und `seeds_per_gram` vorerst `null`. Reihen-/Flächenerträge
oder unkalibrierte Spannen werden nicht als kg/Pflanze eingesetzt. Kopfgröße,
Marktfähigkeit und Überlebensquote werden nicht gleichgesetzt.

## Referenzschätzung pro Anbauvorgang

[DEC-043](DECISIONS.md#dec-043) erlaubt eine separate, nicht lokal
kalibrierte Referenzschätzung für Vollbelegung. Die Projektprojektion
nutzt ausdrücklich passende Katalogfakten in lb/Pflanze oder lb je
100 ft Reihe. Erstere werden mit der Anzahl der Pflanzplätze multipliziert.
Bei Reihenwerten wird die rechnerisch genutzte Reihenlänge
(Pflanzplätze × Pflanzabstand) skaliert. 100 ft entsprechen 30,48 m,
1 lb entspricht 0,45359237 kg. Mehrschnittwerte werden als solche angezeigt.
Die beiden Freiland-Tomatenreferenzen haben in der Quelle dieselbe Spanne.
Die operative Ertragsgrundlage bleibt unverändert. Kopfsalat-Kopfgewichte
allein werden weiterhin nicht als marktfähiger Ertrag verwendet.
[Quellentabelle der University of Minnesota](https://extension.umn.edu/agriculture/specialty-crops/vegetable-farming/crop-and-field-planning-tools-for-vegetable-farmers).
