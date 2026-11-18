# Market Garden Planner – Historische Projektübergabe (Teile 1–4)

> Zusammenführung der vier historischen Übergabedokumente ohne inhaltliche Korrekturen. Historische Aussagen sind mit dem aktuellen Repository abzugleichen; keine Implementierungsfreigabe.


---

# Quelldokument Teil 1

# **Market Garden Planner – Historische Projektübergabe**

Teil 1 von 4 · Produktvision, Funktionsumfang und gestalterische Entwicklung

**Ziel dieser Übergabe:** Den bisherigen Gesprächsverlauf in die neue Projektstruktur überführen, ohne Entscheidungen zu verlieren, neue Beschlüsse zu erzeugen oder den dokumentierten Entwicklungsstand zu verfälschen.

Die Auswertung basiert auf dem hier verfügbaren Gesprächsverlauf und ergänzendem historischem Projektkontext. Sie ist **keine vollständige Prüfung der aktuellen Repository-Dateien**.

## **0. Einordnung und Verbindlichkeit**

Die vier neuen Fachchats übernehmen unterschiedliche Aufgaben:

| Fachchat                                | Zuständigkeit                                                      |
| --------------------------------------- | ------------------------------------------------------------------ |
| **01 – Produktvision & Ideensammlung**  | Produktidentität, Funktionsideen, Gestaltung, UX, Arbeitsabläufe   |
| **02 – Entscheidungsarchiv**            | Bestätigte Entscheidungen, Begründungen, historische Änderungen    |
| **03 – Offene Entscheidungen**          | Ungeklärte Fragen, Alternativen, Abhängigkeiten                    |
| **04 – Technische Entwicklungsplanung** | Architektur, Entwicklungsphasen, Codex-Aufträge, Tests und Abnahme |

### **Verwendete Statusbegriffe**

- **Vorgeschlagen:** Eine Idee oder Lösung wurde diskutiert, aber nicht verbindlich beschlossen.
- **Beschlossen:** Der Nutzer hat eine Anforderung oder Richtung ausdrücklich bestätigt.
- **Implementiert:** Codex hat die Umsetzung gemeldet.
- **Getestet:** Automatisierte Tests oder Browserprüfungen wurden berichtet.
- **Abgenommen:** Der Nutzer hat die Funktion selbst überprüft und ausdrücklich akzeptiert.

Ein Beschluss ist nicht automatisch implementiert. Eine erfolgreiche Testmeldung ist nicht automatisch eine Nutzerabnahme.

**Verbindlich bleiben die Markdown-Dateien im lokalen Git-Repository&#x20;**`MarketGardenPlanner`**.** Historische Angaben in dieser Übergabe müssen vor einer Übernahme mit dem aktuellen Repository abgeglichen werden. Insbesondere dürfen bestehende DEC-IDs und OQ-IDs nicht anhand dieser Zusammenfassung neu vergeben oder überschrieben werden.

# **1. Produktvision und Ursprung**

Primär: Fachchat 01 · Entscheidungen: Fachchat 02 · Architektur: Fachchat 04

## **1.1 Ursprung: Grasshopper als Planungswerkzeug**

Die ursprüngliche Idee entstand aus der Arbeit mit Rhino und Grasshopper.

Das Ziel war ein parametrisches Werkzeug für den professionellen Gemüseanbau, das aus einer vorgegebenen Gartenfläche eine sinnvolle Anordnung von Beeten und Wegen entwickeln kann.

Der anfängliche Schwerpunkt lag auf geometrischen und rechnerischen Fragen:

- Grundstücksfläche als geschlossene Kontur definieren.
- Rechteckige Beete innerhalb dieser Fläche anordnen.
- Beetbreite, Wegbreite und Beetlänge parametrisch verändern.
- Anbaufläche und Anzahl der Beete ermitteln.
- Verschiedene Kulturen mit unterschiedlichen Pflanzabständen berücksichtigen.
- Saatgutbedarf, Jungpflanzenbedarf und Reihenmeter berechnen.

Die Erfahrungen mit Grasshopper prägten dabei das gewünschte Bedienkonzept: Parameter verändern und die geometrischen Auswirkungen unmittelbar sehen.

### **Erweiterung zur Anbauplanung**

Die reine Geometrieplanung wurde schrittweise um agronomische Anforderungen erweitert.

Das Werkzeug sollte nicht nur beantworten, *wie viele Beete auf eine Fläche passen*, sondern auch:

- Welche Kulturen sollen angebaut werden?
- Welche Produktionsmengen werden benötigt?
- Wie viele Pflanzen oder Samen sind dafür erforderlich?
- Wann muss ausgesät oder gepflanzt werden?
- Wann ist mit Ernte zu rechnen?
- Wie verteilen sich die Ernten über die Saison?
- Wann werden Beete für einen Folgeanbau frei?
- Reicht die verfügbare Fläche aus?

Damit entwickelte sich die Idee von einem parametrischen Beetgenerator zu einem umfassenderen **Market Garden Planner**.

## **1.2 Übergang zur eigenständigen Anwendung**

Im weiteren Verlauf entstand die Entscheidung, den Market Garden Planner nicht dauerhaft von Rhino oder Grasshopper abhängig zu machen.

Stattdessen wurde eine eigenständige lokale Anwendung entwickelt.

Die im Gespräch dokumentierte Architektur besteht aus:

| Bestandteil        | Funktion                                                   |
| ------------------ | ---------------------------------------------------------- |
| Python             | Agronomische Berechnungen, Scheduler, Geometrievalidierung |
| Shapely            | Metrische Grundstücks- und Beetgeometrie                   |
| React / TypeScript | Benutzeroberfläche                                         |
| SVG                | Interaktive Karten- und Beetdarstellung                    |
| SQLite             | Dauerhafte Projektspeicherung                              |
| Lokale HTTP-API    | Verbindung zwischen Frontend und Backend                   |

**Historisch bestätigt:** Rhino und Grasshopper sollen als mögliche zukünftige Erweiterung erhalten bleiben, aber keine Voraussetzung für die Nutzung des Market Garden Planners sein.

Die technische Umsetzung einer Rhino-/Grasshopper-Schnittstelle wurde im verfügbaren Verlauf nicht berichtet.

Die Entwicklung verlief somit:

**Grasshopper-Idee**

Parametrische Beet- und Wegegeometrie

**Agronomischer Rechenkern**

Kulturen · Mengen · Anbausätze · Erntezeiten

**Eigenständige lokale Anwendung**

Python · React · SVG · SQLite

**Langfristige Produktvision**

Räumliche Planung + Kulturplanung + Optimierung + lebendige Visualisierung

Die unabhängige Architektur wurde tatsächlich implementiert und in mehreren Entwicklungsphasen getestet. Die vollständige technische Chronologie folgt in Teil 4.

# **2. Gartenflächen, Beete und Wege**

Primär: Fachchat 01 · Beschlüsse: Fachchat 02

## **2.1 Freie Grundstücksgeometrie**

Die ursprüngliche Vorstellung einer einfachen geschlossenen Gartenfläche wurde zu einem präzisen geometrischen Modell weiterentwickelt.

Wichtige Anforderungen:

- Grundstücke dürfen unregelmäßige Formen haben.
- Grundstücksgrenzen sind metrisch definiert.
- Aussparungen und Polygonlöcher werden berücksichtigt.
- Beete können beliebige Rotationswinkel besitzen.
- Die Beetgeometrie darf nicht an ein festes Raster gebunden sein.
- Bereits bestehende Beete sollen übernommen werden können.
- Geometrische Änderungen dürfen keine unbemerkten Kollisionen oder Grenzüberschreitungen erzeugen.

**Status:** Die freie Geometrie und die grundlegende manuelle Bearbeitung wurden in Phase 3B implementiert, getestet und vom Nutzer praktisch überprüft.

Die spätere vollständige Bearbeitung der Grundstückskontur selbst ist im verfügbaren Verlauf nicht als implementiert nachgewiesen.

## **2.2 Zwei grundlegende Arbeitsabläufe**

Die Anwendung soll sowohl bei der Neuanlage eines Gartens als auch bei einem bereits bestehenden Betrieb eingesetzt werden können.

| Neuer Garten                      | Bestehender Garten                       |
| --------------------------------- | ---------------------------------------- |
| Grundstück definieren             | Grundstück und vorhandene Beete erfassen |
| Freie Planungsbereiche bestimmen  | Bestehende Strukturen übernehmen         |
| Beete automatisch anordnen lassen | Beete manuell bearbeiten                 |
| Varianten vergleichen             | Freie Teilbereiche optimieren            |
| Ergebnis übernehmen               | Bestehende Strukturen schützen           |

Beide Arbeitsabläufe wurden als wichtig angesehen.

**Beschlossen:** Automatische Planung darf vorhandene oder gesperrte Objekte nicht eigenmächtig verändern. Automatische Änderungen sollen auf ausdrücklich freigegebene Bereiche beschränkt bleiben.

## **2.3 Manuelle Beetbearbeitung**

Im Gespräch wurde ein Editor entwickelt, der folgende Funktionen unterstützt:

- Neue Beete zeichnen.
- Beetbreite vorgeben und anschließend die Längsachse frei ziehen.
- Bestehende Beete auswählen und verschieben.
- Beete über einen Rotationsgriff drehen.
- Winkel numerisch eingeben.
- Breite und Länge numerisch bearbeiten.
- Mittelpunktkoordinaten verändern.
- Beete löschen, einschließlich Bestätigung.
- Gesperrte Beete vor Bearbeitung schützen.
- Ungültige Geometrieänderungen als rote Vorschau darstellen.
- Änderungen erst nach erfolgreicher API-Bestätigung übernehmen.

Bei der visuellen Prüfung wurden zwei zusätzliche UX-Anforderungen beschlossen:

**Zahlenformatierung:** Winkel, Maße und Koordinaten werden mit maximal zwei Nachkommastellen angezeigt, ohne die interne geometrische Genauigkeit zu reduzieren.

**Winkeleinrasten:** Bei gedrückter Shift-Taste soll die Rotation in 15°-Schritten einrasten; ohne Shift bleibt sie frei.

Diese Funktionen wurden von Codex umgesetzt. Der Nutzer bestätigte zuvor die grundsätzliche Funktion der geometrischen Bearbeitung. Die spätere physische Prüfung des Shift-Snappings ist im verfügbaren Verlauf nicht ausdrücklich bestätigt.

# **3. Automatische Beetaufteilung und Optimierung**

Primär: Fachchat 01 · Kernentscheidungen: Fachchat 02 · Offene Verfahren: Fachchat 03

Dies ist einer der wichtigsten Themenbereiche des gesamten Projekts.

## **3.1 Grundidee**

Die automatische Beetaufteilung soll aus einer gegebenen Gartenfläche mehrere sinnvolle Anordnungen von Beeten und Wegen erzeugen.

Der Nutzer soll wesentliche Parameter selbst bestimmen können.

Im Gespräch wurden insbesondere genannt:

| Parameter               | Bedeutung                                       |
| ----------------------- | ----------------------------------------------- |
| Beetbreite              | Breite der Anbaubeete                           |
| Wegbreite               | Breite der Arbeits- und Verbindungswege         |
| Beetlänge               | Einheitlich oder flexibel                       |
| Zielflächendichte       | Angestrebter Anteil nutzbarer Beetfläche        |
| Optimierungsprioritäten | Gewichtung unterschiedlicher Qualitätskriterien |

Die im Gespräch gezeigten Slider-Werte waren illustrative Beispiele, keine verbindlich beschlossenen Parametergrenzen oder Standardwerte.

## **3.2 Zentrale bestätigte Entscheidung: Wegeeffizienz**

Der Nutzer bestätigte ausdrücklich, dass die Wegeeffizienz in einem professionellen Gemüsebaubetrieb besonders wichtig ist.

Die automatische Planung soll deshalb **nicht ausschließlich die maximale Beetfläche optimieren**.

Stattdessen sollen drei Ziele gemeinsam berücksichtigt werden:

**Nutzbare Anbaufläche**

Möglichst viel produktiv nutzbare Beetfläche innerhalb des Grundstücks schaffen.

**Effiziente Arbeitswege**

Tatsächliche Wege vom Eingang zu den Beeten und zwischen relevanten Arbeitsorten möglichst kurz und praktisch gestalten.

**Betriebliche Zugänglichkeit**

Beete und Arbeitsbereiche müssen mit Schubkarre, Erntewagen und anderen benötigten Hilfsmitteln erreichbar bleiben.

Die Bestätigung des Nutzers lautete sinngemäß, dass beide Ziele – Anbaufläche und Wegeeffizienz – unbedingt berücksichtigt werden müssen, da die Effizienz der Wege für einen solchen Betrieb wesentlich ist.

Diese Anforderung ist daher als **beschlossen** einzuordnen.

## **3.3 Reale Wege statt Luftlinien**

Ein besonders wichtiger konzeptioneller Unterschied ist die Bewertung tatsächlicher Lauf- und Transportwege.

Ein Beet kann geometrisch nahe am Eingang liegen, aber nur über einen langen Umweg erreichbar sein.

Deshalb wurde vorgesehen, dass die Optimierung perspektivisch ein Wegenetz berücksichtigt.

Relevante Orte können sein:

- Grundstückseingang
- Beete
- Gewächshäuser
- Wasserstellen
- Kompostbereiche
- Wasch- und Erntestationen

Der Eingang und die Beete bilden den grundlegenden Anwendungsfall. Weitere Betriebsstationen sind als spätere Erweiterung vorgesehen.

**Status:** Produktanforderung bestätigt; konkretes Wegenetzmodell und Bewertungsverfahren offen. Keine Implementierung der vollständigen Wegeoptimierung im hier verfügbaren Verlauf nachgewiesen.

## **3.4 Transparente Gewichtung**

Der Nutzer soll selbst beeinflussen können, welche Optimierungsziele stärker gewichtet werden.

Dabei wurde ausdrücklich Wert auf Nachvollziehbarkeit gelegt.

Die Anwendung soll nicht lediglich eine vermeintlich optimale Lösung erzeugen, ohne zu erklären, weshalb sie ausgewählt wurde.

Vorgesehen ist ein Variantenvergleich, beispielsweise zwischen:

- flächenorientierter Anordnung,
- wegeorientierter Anordnung,
- ausgewogener Anordnung.

Die genauen Bewertungsformeln und Gewichtungen sind noch offen.

Eine beispielhafte Darstellung mit 40 % Flächeneffizienz, 40 % Wegeeffizienz und 20 % Zugänglichkeit war **nur ein UI-Konzept**, keine festgelegte Standardgewichtung.

## **3.5 Varianten und Bake-Funktion**

Mehrere automatisch erzeugte Planungsvarianten sollen vergleichbar sein.

Der Nutzer soll die Auswirkungen auf Flächennutzung, Wege und Zugänglichkeit erkennen können.

Eine ausgewählte Variante soll über eine **Bake-Funktion** dauerhaft übernommen oder gesichert werden können.

Der Begriff stammt aus parametrischen Arbeitsabläufen, insbesondere Rhino/Grasshopper, und beschreibt hier die Überführung eines berechneten Ergebnisses in dauerhaft gespeicherte Projektgeometrie.

Der genaue Speichervertrag ist noch offen:

- Was wird beim Bake dauerhaft gespeichert?
- Bleiben alternative Varianten erhalten?
- Welche bestehenden Objekte werden referenziert?
- Wie wird eine spätere Änderung des Ausgangsgrundstücks behandelt?
- Wie werden automatisch erzeugte Beete anschließend manuell bearbeitet?

**Status:** Variantenvergleich und Sicherung als Produktanforderung bestätigt; technische Spezifikation und Implementierung noch offen.

# **4. Kulturplanung und agronomische Funktionen**

Primär: Fachchat 01 · Implementierungsstand: Fachchat 04

## **4.1 Kultur- und Produktionsplanung**

Der Market Garden Planner soll landwirtschaftliche Produktionsziele mit den verfügbaren Beetflächen verknüpfen.

Die frühen Anforderungen umfassten:

- Bis zu 20 Sorten als anfängliche Größenordnung.
- Produktionsziele in Kilogramm oder Stück.
- Unterschiedliche Pflanz- und Reihenabstände.
- Kulturabhängige Reihenanzahl pro Beet.
- Berechnung von Samen und Jungpflanzen.
- Ermittlung von Reihenmetern und benötigter Beetfläche.
- Mehrere Anbausätze über die Saison.
- Ernteverteilung und mögliche Produktionsdefizite.

Die Grenze von 20 Sorten ist als frühe Zielgröße überliefert; ob sie später als feste technische Grenze bestätigt wurde, muss anhand der Repository-Dokumentation geprüft werden.

## **4.2 Agronomische Datenqualität**

Ein wiederkehrendes Prinzip war die Trennung zwischen:

- fachlich belegten Kulturparametern,
- geschätzten oder abgeleiteten Werten,
- Nutzereingaben,
- synthetischen Demonstrationsdaten,
- später tatsächlich gemessenen Erträgen.

Diese Unterscheidung wurde insbesondere bei der Einführung gespeicherter Gartenprojekte wichtig.

**Beschlossen:** Synthetische Demo-Ertragsdaten dürfen nicht unbemerkt als reale Produktionsdaten in Nutzerprojekte übernommen werden.

Die Herkunft von Parametern soll nachvollziehbar bleiben.

## **4.3 Zeitliche Anbauplanung**

Die agronomische Planung entwickelte sich zu einem System mit mehreren zeitlich gestaffelten Anbausätzen.

Wichtige Anforderungen:

- Aussaat- und Pflanztermine.
- Erntezeiträume.
- Aufeinanderfolgende Kulturen auf demselben Beet.
- Zeitliche Beetbelegung.
- Ermittlung von Beetfreigaben.
- Wochenbezogene Prognosen.
- Berücksichtigung von Jahreswechseln.

Der bereits früh implementierte Python-Scheduler bildete dafür eine Grundlage.

## **4.4 Zeitliche Überschneidungen und Mischkulturen**

Bei der praktischen Prüfung von Phase 3C.1 stellte der Nutzer fest, dass sich Anbauvorgänge auf demselben Beet zeitlich überlagern können.

Daraufhin wurde diskutiert, ob solche Überlagerungen grundsätzlich verhindert werden sollen.

Die gewählte Richtung:

**Zeitliche Überschneidungen erkennen und anzeigen, aber nicht grundsätzlich verbieten.**

Begründung: Parallele Kulturen und Mischkulturen können landwirtschaftlich sinnvoll sein.

Dabei gilt:

- Keine automatische Terminverschiebung.
- Betroffene Anbauvorgänge verständlich kennzeichnen.
- Fehlende Erntetermine nicht willkürlich ergänzen.
- Unvollständige Belegungszeiträume als unklar behandeln.

**Status:** Beschlossen, von Codex implementiert und automatisiert sowie im Browser getestet.

Eine vollständige fachliche Prüfung der Mischkulturverträglichkeit wurde nicht berichtet.

## **4.5 Saison-Slider**

Der Saison-Slider gehört zu den zentralen Interaktionselementen.

Der Nutzer soll durch die Kalenderwochen navigieren und sehen, wie sich der geplante Garten im Jahresverlauf verändert.

Die Entwicklung verlief in zwei Schritten:

**Erster Schritt:** Saison-Slider und Ernteprognose auf Grundlage der Demo.

**Zweiter Schritt:** Verbindung mit den dauerhaft gespeicherten Kulturzuweisungen und Beetgeometrien.

Phase 3C.2 implementierte laut Codex-Bericht:

- ISO-Kalenderwochen einschließlich KW 53.
- Jahreswechsel.
- Zeitabhängige Kulturbelegung.
- Kulturbeschriftungen auf der Karte.
- Sichtbare Überlagerungen.
- Kennzeichnung offener Zeiträume.
- Synchronisierung von Karte, Tooltip und Detailpanel.

**Status:** Implementiert und getestet laut Codex. Eine vollständige ausdrückliche Nutzerabnahme aller Funktionen ist im Gespräch nicht dokumentiert.

## **4.6 Ernteprognose**

Ein eigenständiges, frei verschiebbares Ernteprognose-Fenster wurde bereits in einer frühen Frontend-Phase umgesetzt.

Langfristig soll es mit den gespeicherten Projekten verbunden werden.

Die Prognose soll berücksichtigen:

- ausgewählte Kalenderwoche,
- Kultur und Anbauprofil,
- tatsächliche Beetfläche,
- geplante Anbausätze,
- erwartete Erntemengen,
- Ernteverteilung,
- mögliche Defizite.

Besonders wichtig bleibt die Trennung zwischen:

**Geplanter Ernte ≠ berechneter Prognose ≠ tatsächlich geernteter Menge.**

Im letzten verfügbaren Entwicklungsstand war die neue Ernteprognose für gespeicherte Projekte noch nicht implementiert. Sie war als Phase 3C.3 vorgesehen.

# **5. Benutzeroberfläche und Interaktionskonzept**

Primär: Fachchat 01 · UX-Entscheidungen: Fachchat 02

## **5.1 Map-first-Oberfläche**

Die Benutzeroberfläche soll sich um die Gartenkarte organisieren.

Das bedeutet:

- Die Karte nimmt möglichst viel Platz ein.
- Bedienelemente schweben über der Karte oder sind seitlich angeordnet.
- Ein Beet wird durch Anklicken ausgewählt.
- Details erscheinen in einem rechten Panel.
- Hover-Tooltips liefern schnelle Informationen.
- Der Saison-Slider befindet sich im unteren Bereich.
- Die Ernteprognose erscheint in einem unabhängig verschiebbaren Fenster.

Die Karte ist damit der zentrale Arbeitsbereich, nicht lediglich eine ergänzende Visualisierung.

Diese Struktur wurde in Phase 3A.2 implementiert.

## **5.2 Kompakte Detailansicht**

Bei der Einführung der Kulturplanung stellte der Nutzer fest, dass das rechte Detailpanel zu viel vertikalen Platz beanspruchte.

Seine ausdrückliche Anforderung war, möglichst alle relevanten Informationen direkt sehen zu können, ohne ständig scrollen zu müssen.

Daraufhin wurde eine kompaktere Darstellung umgesetzt:

- Anbauvorgänge als platzsparende Kulturzeilen.
- Kultur und Termine direkt sichtbar.
- Kleine Bearbeitungs- und Löschaktionen.
- Geometrie und Herkunftsinformationen einklappbar.
- Scrollen weiterhin möglich, wenn sehr viele Vorgänge vorhanden sind.

**Status:** Nutzeranforderung bestätigt; Codex meldete Implementierung und Browserprüfungen bei 560, 720 und 900 Pixel Fensterhöhe sowie mit zwölf Anbauvorgängen.

## **5.3 Eindeutige Bearbeitung eines Anbauvorgangs**

Bei einer späteren Browserprüfung stellte der Nutzer fest, dass die Überschrift „Anbauvorgang bearbeiten“ nicht deutlich genug zeigte, welche Kultur gerade bearbeitet wurde.

Als Beispiel wurde die Verwechslungsgefahr zwischen Karotten und Spinat genannt.

Die vereinbarte Verbesserung:

- Aktive Kulturzeile dezent salbeigrün hervorheben.
- Schmale Akzentlinie.
- Dynamische Überschrift wie „Karotten bearbeiten“.
- Anbauart und Startdatum als Untertitel.
- Zuordnung über die stabile Vorgangs-ID.
- Hervorhebung nach Speichern, Abbrechen oder Beetwechsel entfernen.

Codex meldete die Umsetzung und dokumentierte die Entscheidung als `DEC-032`.

**Status:** Implementiert und getestet laut Codex; die abschließende visuelle Nutzerabnahme ist im verfügbaren Verlauf nicht ausdrücklich bestätigt.

## **5.4 UX-Prinzipien**

Über die einzelnen Funktionen hinaus lässt sich aus dem Gespräch eine konsistente Gestaltungsrichtung erkennen:

- Reduzierte, ruhige Benutzeroberfläche.
- Hohe Informationsdichte ohne visuelle Überladung.
- Eindeutige Auswahl- und Bearbeitungszustände.
- Direkte Manipulation geometrischer Objekte.
- Präzise numerische Eingaben als Ergänzung zur Mausbedienung.
- Keine unnötigen Bedienmodi.
- Keine unerwarteten automatischen Änderungen.
- Validierung und Fehlermeldungen sollen verständlich sein.

Einzelne dieser Prinzipien wurden ausdrücklich beschlossen, andere ergeben sich aus wiederholten Nutzerkorrekturen. Sie sollten deshalb nicht pauschal alle als eigenständige dokumentierte Entscheidungen behandelt werden.

# **6. Gestalterische Produktidentität**

Primär: Fachchat 01 · Offene Gestaltungsfragen: Fachchat 03

## **6.1 Monochrome Living Landscape**

Die visuelle Richtung entwickelte sich deutlich weg von klassischer Gartenplanungssoftware mit bunten Flächen und schematischen Pflanzensymbolen.

Der Nutzer bevorzugt eine ruhige, eigenständige Bildsprache.

Als Arbeitsbegriff entstand:

**Monochrome Living Landscape**

Dazu gehören:

- helle, warme Weiß- und Grautöne,
- zurückhaltende Grüntöne,
- sparsame erdige Akzente,
- feine Strukturen statt großflächiger Farbblöcke,
- räumliche Tiefe,
- subtile Bewegung,
- lebendige Vegetation,
- eine insgesamt ruhige Komposition.

Die visuelle Gestaltung soll technisch präzise und gleichzeitig atmosphärisch wirken.

## **6.2 Miniaturmodell und Tilt-Shift**

Ein weiterer wichtiger Einfluss war die Ästhetik von Architekturmodellen und Tilt-Shift-Fotografie.

Der Garten soll perspektivisch wie eine kleine, sorgfältig gestaltete Landschaft erscheinen.

Dabei wurde über folgende Eigenschaften gesprochen:

- räumliche Tiefe,
- architektonischer Modellcharakter,
- dezente Schatten,
- kontrollierte Perspektive,
- fein aufgelöste Vegetation,
- keine übertrieben spielerische Darstellung.

Die Inspirationsrichtung wurde unter anderem mit *Terra Nil* und architektonischen Landschaftsmodellen in Verbindung gebracht.

**Status:** Gestalterische Richtung bestätigt; der endgültige Renderer und die genaue Integration in die Hauptanwendung sind offen.

## **6.3 2D-Planung und perspektivische Darstellung**

Die technische 2D-Ansicht soll erhalten bleiben.

Zusätzlich wurde eine perspektivische beziehungsweise isometrische Darstellung diskutiert.

Wichtig dabei:

- Beide Ansichten sollen auf derselben geometrischen Grundlage beruhen.
- Beliebig gedrehte Beete dürfen nicht durch die Darstellung auf ein starres isometrisches Raster beschränkt werden.
- Die perspektivische Ansicht dient der räumlichen Wahrnehmung.
- Die präzise 2D-Ansicht bleibt für geometrische Bearbeitung relevant.

Eine vollständige isometrische Integration in den Market Garden Planner ist im verfügbaren Verlauf nicht nachgewiesen.

# **7. Botanical ASCII und seine Beziehung zum Market Garden Planner**

Produktvision: Fachchat 01 · Architektur: Fachchat 04

Das Botanical ASCII Lab ist ein eigenständiger experimenteller Entwicklungsbereich, der eng mit der visuellen Produktvision verbunden ist.

## **7.1 Grundidee**

Pflanzen und Landschaftselemente sollen nicht als gewöhnliche Pixel-Art-Sprites dargestellt werden.

Stattdessen wurde eine konsistente generative Bildsprache aus Punkten, Zeichen, Halftone-Strukturen und feinen grafischen Elementen bevorzugt.

Wichtige Merkmale:

- hoher Detailgrad bei näherer Betrachtung,
- ruhige Wirkung in der Gesamtansicht,
- keine Mischung widersprüchlicher Sprite-Stile,
- subtile Animation,
- mögliche Darstellung von Wind und Pflanzenbewegung,
- konsistente Gestaltung von Vegetation und Umgebung.

Diese Richtung soll nicht nur einzelne Pflanzen betreffen, sondern perspektivisch auch Gewächshäuser und andere Landschaftselemente.

## **7.2 Eigenständiges Experiment**

Im Projekt existiert der Entwicklungsbereich:

`experiments/botanical-ascii-lab/`

Im verfügbaren historischen Kontext wurden unter anderem Arbeiten an folgenden Themen berichtet:

- ASCII- und Halftone-Rendering,
- Projektion,
- Tiefe und Sichtbarkeit,
- Licht,
- Wind,
- Vegetationsdarstellung,
- Browserprüfungen.

Die vollständige Chronologie dieser Arbeiten ist im aktuellen Gespräch nicht enthalten. Die Dateien im Repository müssen für eine belastbare technische Bestandsaufnahme gelesen werden.

## **7.3 Light und Dark Mode**

Für das Botanical ASCII Lab wurde eine Umschaltung zwischen Light und Dark Mode umgesetzt.

Die berichteten Eigenschaften:

- Dark Mode als Standard.
- Umschaltung über Sonne-/Mond-Symbol.
- Lokale Speicherung der Auswahl.
- Light Mode mit warmem Off-White und zurückhaltenden Pflanzenfarben.
- Kein bloßes Invertieren der bestehenden Farben.
- Die gesamte Oberfläche wechselt das Theme.

Historisch wurden 44 erfolgreiche Tests für diese Änderung berichtet.

Diese Angaben beziehen sich auf das Botanical ASCII Lab, nicht automatisch auf die Hauptanwendung.

## **7.4 Verhältnis zur Hauptanwendung**

Die beiden Entwicklungsbereiche verfolgen unterschiedliche Aufgaben:

| Market Garden Planner   | Botanical ASCII Lab                 |
| ----------------------- | ----------------------------------- |
| Geometrie               | Vegetationsdarstellung              |
| Kulturplanung           | Generative Pflanzenformen           |
| Agronomische Berechnung | Licht, Tiefe und Bewegung           |
| Projektspeicherung      | Visuelle Experimente                |
| Saisonlogik             | Zukünftige saisonale Visualisierung |

Die langfristige Idee ist, dass die agronomische Planung die Informationen liefert, während die Visualisierung diese räumlich und zeitlich darstellt.

Beispielsweise könnte der Planner bestimmen, dass auf einem Beet in einer bestimmten Kalenderwoche Karotten wachsen. Das Botanical ASCII-System könnte daraus später eine passende visuelle Darstellung erzeugen.

**Wichtig:** Diese Integration wurde noch nicht implementiert. Die Entwicklungsphasen 3C.1 und 3C.2 haben die beiden Systeme ausdrücklich getrennt gehalten.

Die technische Schnittstelle, der Detaillierungsgrad und die botanische Modellierung sind noch offen.

# **8. Produktname und Markenidentität**

Primär: Fachchat 01 · Offene Entscheidung: Fachchat 03

Während der Entwicklung wurde über einen eigenständigen Namen für die Software gesprochen.

Ausgangspunkt waren frühere Namensideen für einen parametrischen 3D-Lehmdrucker:

- TERRAFORMA
- PARAFORMA
- PARAMETRA

Daraus entstand eine neue Namensrichtung, die Erde, Geometrie, Maß und parametrisches Gestalten verbindet.

## **Diskutierte Kandidaten**

| Name           | Assoziation                | Historischer Stand                       |
| -------------- | -------------------------- | ---------------------------------------- |
| **TERRAMETRA** | Erde, Maß, Geometrie       | Positiv bewertet                         |
| **TERRASTRA**  | Erde, Struktur, Landschaft | Vom Nutzer ausdrücklich positiv bewertet |
| PARAMETRA      | Parameter, Geometrie       | Frühere Inspiration                      |
| TERRAFORMA     | Erde, Form                 | Frühere Inspiration                      |
| TERRAMORPH     | Erde, Transformation       | Vorgeschlagen                            |
| GEOMETRA       | Geometrie, Vermessung      | Vorgeschlagen                            |
| AGROMETRA      | Landwirtschaft, Maß        | Vorgeschlagen                            |
| HORTOMETRA     | Gartenbau, Maß             | Vorgeschlagen                            |
| TERRASYLVA     | Erde, Wald                 | Vorgeschlagen                            |

Der Nutzer zeigte insbesondere Interesse an **TERRASTRA** und **TERRAMETRA**.

Im Gespräch wurde darauf hingewiesen, dass einige Namen bereits von anderen Unternehmen verwendet werden.

Eine vollständige Marken-, Register- oder Domainprüfung ist im verfügbaren Verlauf nicht dokumentiert.

**Status: offen. Kein endgültiger Produktname beschlossen.**

# **9. Weitere Produktideen und zurückgestellte Funktionen**

Primär: Fachchat 01 · Offene Punkte: Fachchat 03

## **9.1 Satellitenkarten- und GIS-Import**

Der Nutzer möchte Grundstücke später anhand von Satellitenbildern erfassen können.

Die Grundidee:

- Grundstück auf einer Karte lokalisieren.
- Grundstücksgrenze nachzeichnen.
- Geografische Daten in lokale metrische Koordinaten überführen.
- Geometrie anschließend unabhängig von der Karte bearbeiten.

Im Gespräch wurden Google Maps und mögliche Alternativen wie OpenStreetMap beziehungsweise Leaflet erwähnt.

Ein bestimmter Kartenanbieter wurde nicht verbindlich festgelegt.

Auch die unterstützten Importformate und die Koordinatentransformation sind noch zu spezifizieren.

**Status:** Zukünftige Funktion; nicht implementiert.

## **9.2 Gewächshäuser und Betriebsstationen**

Langfristig sollen nicht nur Beete, sondern auch weitere Objekte in die Planung einbezogen werden.

Dazu gehören Gewächshäuser sowie funktionale Stationen eines Market-Garden-Betriebs.

Diese Objekte können sowohl für die räumliche Planung als auch für die Wegeoptimierung relevant werden.

Die genaue Objektstruktur, ihre Bearbeitungsfunktionen und ihre Einbindung in die Optimierung sind noch offen.

## **9.3 Historische Ertragsdaten**

Die Anwendung soll langfristig nicht ausschließlich mit allgemeinen Ertragsschätzungen arbeiten.

Eigene, tatsächlich gemessene Erträge sollen erfasst und zur Verbesserung künftiger Prognosen genutzt werden können.

Noch offen sind insbesondere:

- Erfassungsstruktur,
- Zuordnung zu Beet, Kultur und Anbausatz,
- Umgang mit unvollständigen Erntedaten,
- Kalibrierung der Prognosen,
- Unterscheidung zwischen Standort- und Sorteneinflüssen.

## **9.4 Undo/Redo und weiterführende Geometriebearbeitung**

Bei Phase 3B.3c wurden Undo/Redo und feste Bezugskanten ausdrücklich als noch nicht implementiert genannt.

Die Architektur wurde laut Codex-Bericht auf spätere feste Bezugskanten vorbereitet.

Die genaue Bedienung dieser Funktionen wurde noch nicht abschließend festgelegt.

# **10. Übergabeverteilung für die vier Fachchats**

## **01 – Produktvision & Ideensammlung**

Aus diesem ersten Teil sollten insbesondere folgende Themen übernommen werden:

- Gesamtvision und Entwicklung des Market Garden Planners.
- Zwei Arbeitsabläufe: Neuanlage und Bestandsplanung.
- Parametrische Beet- und Wegeplanung.
- Automatische Flächenaufteilung und Variantenvergleich.
- Map-first-Oberfläche und kompakte Bedienung.
- Monochrome Living Landscape.
- Miniaturmodell- und Tilt-Shift-Ästhetik.
- Botanical ASCII als mögliche visuelle Grundlage.
- Produktnamen und Markenidentität.
- GIS-Import, Gewächshäuser und historische Ertragsdaten.

## **02 – Entscheidungsarchiv**

Für den Abgleich mit `docs/DECISIONS.md` besonders relevant:

- Eigenständige Anwendung ohne Rhino-Pflicht.
- Freie metrische Geometrie ohne starres Raster.
- Manuelle und automatische Planung kombinieren.
- Bestehende und gesperrte Objekte schützen.
- Flächeneffizienz, Wegeeffizienz und Zugänglichkeit gemeinsam optimieren.
- Tatsächliche Arbeitswege berücksichtigen.
- Nutzerseitige Optimierungsgewichtung.
- Variantenvergleich und Bake-Konzept.
- Keine unbemerkte Übernahme synthetischer Demo-Daten.
- Zeitliche Überschneidungen erkennen, aber nicht pauschal verbieten.
- Kompakte und eindeutige Kulturplanungsoberfläche.

Diese Punkte dürfen nicht ohne Prüfung bestehenden DEC-IDs zugeordnet werden.

## **03 – Offene Entscheidungen**

Wichtige offene Themen:

- Optimierungsalgorithmus und Bewertungsformeln.
- Wegenetzmodell.
- Parametergrenzen und Standardwerte.
- Bake-Datenmodell.
- Umgang mit bestehenden und automatisch erzeugten Varianten.
- GIS-Anbieter und Importformate.
- Technische Integration des Botanical ASCII Lab.
- Saisonale Wachstumsvisualisierung.
- Ertragskalibrierung.
- Undo/Redo und Bezugskanten.
- Endgültiger Produktname.

Diese Themen müssen mit dem bestehenden Register `docs/OPEN_QUESTIONS.md` abgeglichen werden. Es dürfen keine neuen OQ-IDs ohne Prüfung vergeben werden.

## **04 – Technische Entwicklungsplanung**

Aus Teil 1 sind vor allem folgende technische Zusammenhänge relevant:

- Python als unabhängiger Berechnungs- und Geometriekern.
- React/TypeScript/SVG als interaktive Oberfläche.
- SQLite und revisionssichere Projekt-API.
- Verbindung von Beetgeometrie und Kulturplanung.
- Python-basierte Zeit- und Wochenberechnungen.
- Trennung zwischen Demo und gespeicherten Projekten.
- Trennung zwischen Agronomielogik und Visualisierung.
- Zukünftige Anbindung von Botanical ASCII.
- Rhino/Grasshopper als mögliche Erweiterung.

Die detaillierte Chronologie der Entwicklungsphasen, Tests und Git-Commits folgt in Teil 4.

## **11. Quellenlage und Unsicherheiten**

Für die spätere Migration ist wichtig:

**Direkt aus dem verfügbaren Gespräch nachvollziehbar** sind insbesondere die Entwicklung der Phasen 3B.3b bis 3C.2, die Diskussion der automatischen Beetoptimierung, die Wegeeffizienz, die UX-Korrekturen und die Namensfindung.

**Nur aus ergänzendem historischem Projektkontext bekannt** sind Teile der frühen Grasshopper-Analyse, die ersten Scheduler-Phasen und einige Details des Botanical ASCII Lab. Diese Angaben sind für die historische Orientierung hilfreich, sollten aber vor einer verbindlichen Dokumentationsänderung anhand der Originaldateien geprüft werden.

**Nicht aktuell geprüft** wurden:

- `docs/DECISIONS.md`
- `docs/OPEN_QUESTIONS.md`
- `docs/PRODUCT.md`
- `docs/ARCHITECTURE.md`
- `docs/ROADMAP.md`
- `AGENTS.md`

Auch der letzte lokale Git-Stand wurde nicht erneut ausgelesen.

Die Übergabe beschreibt deshalb den **historisch belegbaren Gesprächsstand**, nicht eine unabhängig verifizierte Bestandsaufnahme des Repositorys.

**Teil 1 abgeschlossen**

Dieser Teil umfasst die Produktvision, die wichtigsten funktionalen Anforderungen, das UX-Konzept, die visuelle Identität, Botanical ASCII und die offenen Produktideen.

**Als Nächstes: Teil 2 – Entscheidungsarchiv.** Dort werden wir die bestätigten Beschlüsse, ihre Begründungen, ihren historischen Kontext und ihren jeweiligen Status systematisch aufarbeiten, ohne vorhandene DEC-IDs zu erfinden oder zu überschreiben.

Ich warte auf deine Aufforderung zur Fortsetzung.

---

# Quelldokument Teil 2

# **Market Garden Planner – Historische Projektübergabe**

Teil 2 von 4 · Entscheidungsarchiv, Beschlüsse und Entscheidungsentwicklung

Dieser Teil rekonstruiert die im bisherigen Gespräch getroffenen Produkt-, Design-, Funktions- und Architekturentscheidungen.

**Ziel:** Für den neuen Fachchat **02 – Entscheidungsarchiv** nachvollziehbar festhalten, was wir beschlossen haben, warum wir es beschlossen haben und wie weit die jeweilige Umsetzung fortgeschritten ist.

Dabei gilt weiterhin:

- `docs/DECISIONS.md` im lokalen Git-Repository ist die verbindliche Referenz.
- Die hier verwendeten Kennungen **H-01 bis H-28** sind ausschließlich temporäre historische Referenzen. Sie sind keine DEC-IDs.
- Ein bestätigter Beschluss ist nicht automatisch implementiert oder abgenommen.
- Bestehende DEC-IDs dürfen nicht aus dieser Rekonstruktion abgeleitet oder neu vergeben werden.

## **1. Historischer Stand des Entscheidungsarchivs**

Im Gespräch wurde die Einführung einer dauerhaften Entscheidungsdokumentation ausdrücklich vereinbart.

### **Entwicklung**

| Zeitpunkt / Phase | Ereignis                                                       | Nachweis im Gespräch                                           |
| ----------------- | -------------------------------------------------------------- | -------------------------------------------------------------- |
| Vor Phase 3B.3c   | Wunsch nach dauerhafter Dokumentation wichtiger Entscheidungen | Nutzer fragt ausdrücklich, ob ChatGPT darüber Buch führen kann |
| Nach 3B.3b        | Erstellung von `docs/DECISIONS.md` durch Codex                 | Codex meldet 26 Einträge                                       |
| Anschließend      | Git-Sicherung des Entscheidungsarchivs                         | Commit `f57d9b3`                                               |
| Phase 3B.3c       | Dokumentation der UI-Präzision und Winkelrastung               | Codex meldet `DEC-028`                                         |
| Phase 3C.2        | Dokumentation der eindeutigen Bearbeitung von Anbauvorgängen   | Codex meldet `DEC-032`                                         |

Der Commit `f57d9b3` ist durch die im Chat übermittelte Git-Ausgabe belegt:

`Docs: Add project decision log`

Dabei wurden `docs/DECISIONS.md` und `AGENTS.md` geändert beziehungsweise erstellt.

Der Bericht nennt 26 ursprüngliche Einträge. Später kamen weitere Einträge hinzu. **Die aktuelle Anzahl und die vollständigen Inhalte des Entscheidungsregisters wurden hier nicht erneut aus dem Repository gelesen.**

Die zwischenzeitlich erwähnten 31 Entscheidungen stammen aus der späteren Projektorganisation und müssen anhand der aktuellen Datei überprüft werden.

# **2. Grundlegende Produkt- und Architekturentscheidungen**

## **H-01 – Eigenständige Anwendung statt verpflichtender Rhino-/Grasshopper-Abhängigkeit**

Beschlossen · implementierte Grundarchitektur

**Kontext:** Der Market Garden Planner entstand aus der Idee eines parametrischen Grasshopper-Werkzeugs. Im Laufe der Entwicklung wurde die Funktionalität auf Python und eine eigene Benutzeroberfläche übertragen.

**Beschluss:** Der Market Garden Planner soll eigenständig funktionieren. Rhino und Grasshopper dürfen keine Voraussetzung für den Betrieb sein.

**Begründung:** Eine eigenständige Anwendung ermöglicht eine durchgängige Benutzeroberfläche, dauerhafte Projektspeicherung und eine Nutzung unabhängig von der Rhino-Umgebung.

**Technische Konsequenz:** Python übernimmt Geometrie und agronomische Berechnungen. React/TypeScript/SVG bilden die Oberfläche.

**Status:** Grundarchitektur implementiert und getestet. Eine spätere Rhino-/Grasshopper-Anbindung wurde als Möglichkeit diskutiert, aber nicht implementiert.

## **H-02 – Metrische, frei orientierbare Garten- und Beetgeometrie**

Beschlossen · implementiert · getestet

**Beschluss:** Gartenflächen müssen als präzise metrische Geometrien beschrieben werden können. Beete dürfen beliebige Winkel haben und sind nicht an ein festes Raster gebunden.

**Begründung:** Reale Grundstücke sind selten perfekt rechteckig. Ein starres Raster würde die praktische Nutzbarkeit einschränken.

**Umsetzung:** In Phase 3B.1 entstand ein Python-Geometriekern mit Polygonen, Polygonlöchern und frei gedrehten Rechteckbeeten. Spätere Phasen ergänzten die Bearbeitung.

**Abnahme:** Der Nutzer bestätigte nach Phase 3B.3c, dass die grundlegenden Bearbeitungsfunktionen funktionieren.

## **H-03 – Manuelle und automatische Planung kombinieren**

Beschlossen · teilweise implementiert

**Beschluss:** Der Market Garden Planner soll sowohl manuelle Planung als auch automatische Beetaufteilung unterstützen.

**Begründung:** Nicht jeder Garten wird neu angelegt. Bestehende Betriebe benötigen die Möglichkeit, vorhandene Strukturen zu übernehmen und gezielt zu verändern.

**Umsetzungsstand:** Manuelle Beetbearbeitung implementiert und praktisch geprüft. Automatische Beetaufteilung noch nicht implementiert.

## **H-04 – Bestehende und gesperrte Objekte schützen**

**Beschluss:** Vorhandene oder gesperrte Beete dürfen nicht unbemerkt durch automatische Funktionen verändert werden.

**Begründung:** In einem bestehenden Betrieb sind Beete und Infrastrukturen oft physisch vorhanden und nicht beliebig verschiebbar.

**Umsetzung:** Sperrmechanismen für die manuelle Geometriebearbeitung wurden implementiert und getestet.

**Noch offen:** Die genaue Behandlung gesperrter Objekte innerhalb eines zukünftigen Optimierungsalgorithmus.

## **H-05 – Änderungen erst nach erfolgreicher Validierung speichern**

**Beschluss beziehungsweise bestätigtes technisches Verhalten:** Geometrische Änderungen dürfen nicht als gespeichert erscheinen, bevor sie vom Backend erfolgreich geprüft und bestätigt wurden.

**Begründung:** Kollisionen, Grenzüberschreitungen und Revisionskonflikte dürfen nicht zu inkonsistenten Projektdaten führen.

**Umsetzung:** Codex meldete eine Python-basierte Validierung, rote Vorschau für ungültige Geometrie und revisionssichere API-Operationen.

**Status:** Implementiert, automatisiert getestet und im Browser geprüft.

Die genaue ursprüngliche Entscheidungs-ID ist nicht bekannt.

# **3. Entscheidungen zur automatischen Beetoptimierung**

Diese Gruppe ist besonders wichtig, weil sie im Gespräch ausdrücklich diskutiert und vom Nutzer bestätigt wurde.

## **H-06 – Flächeneffizienz und Wegeeffizienz gemeinsam optimieren**

**Zentrale Produktentscheidung**

Die automatische Beetaufteilung soll nicht nur die maximale Anbaufläche erzeugen, sondern gleichzeitig effiziente Arbeitswege und eine praktische Zugänglichkeit sicherstellen.

**Historischer Kontext:** Der Nutzer schlug einen Button für das automatische Füllen von Gartenflächen vor. Einstellbar sollten unter anderem Beetbreite, Wegbreite und die Dichte der Beete im Verhältnis zur Gesamtfläche sein.

Daraufhin wurde diskutiert, ob der Algorithmus primär Fläche maximieren oder auch die Arbeitswege optimieren soll.

Der Nutzer bestätigte ausdrücklich:

> „ja auf jeden Fall beides. die effizienz der Weg ist wichtig in so einem Betrieb“

**Beschlossen:** Beide Aspekte müssen berücksichtigt werden.

**Begründung:** Ein Market Garden ist ein Arbeitsbetrieb. Eine höhere Beetdichte kann wirtschaftlich nachteilig sein, wenn dadurch lange oder unpraktische Wege entstehen.

**Status:** Produktentscheidung bestätigt und laut Codex-Bericht in das Entscheidungsarchiv aufgenommen. Optimierungsalgorithmus noch nicht implementiert.

## **H-07 – Drei Optimierungsziele**

Aus der Diskussion wurden drei Kriterien herausgearbeitet:

1. **Nutzbare Beetfläche:** Möglichst hoher produktiver Flächenanteil.
2. **Effiziente Arbeitswege:** Kurze tatsächliche Lauf- und Transportwege.
3. **Betriebliche Zugänglichkeit:** Erreichbarkeit mit Schubkarre, Erntewagen und vergleichbaren Hilfsmitteln.

Die gemeinsame Berücksichtigung dieser Ziele wurde bestätigt.

**Wichtig:** Es wurde keine mathematische Gleichgewichtung von exakt einem Drittel pro Ziel beschlossen.

## **H-08 – Tatsächliche Wege statt Luftlinien**

**Beschlossene Richtung:** Wegeeffizienz soll auf tatsächlich begehbaren beziehungsweise befahrbaren Verbindungen beruhen.

**Begründung:** Die geometrische Entfernung zwischen Eingang und Beet sagt nicht zwingend etwas über die reale Arbeitsstrecke aus.

Als relevante Punkte wurden diskutiert:

- Grundstückseingang,
- Beete,
- Gewächshäuser,
- Wasserstellen,
- Kompost,
- Wasch- und Erntestationen.

**Status:** Produktanforderung bestätigt. Konkretes Wegenetzmodell offen.

## **H-09 – Einstellbare Optimierungsprioritäten**

**Beschluss:** Nutzer sollen die Prioritäten der Optimierung beeinflussen können.

Die Diskussion umfasste die Gewichtung von Anbaufläche, Wegeeffizienz und Zugänglichkeit.

**Begründung:** Unterschiedliche Betriebe und Grundstücke benötigen unterschiedliche Kompromisse.

**Abgrenzung:** Die beispielhaft gezeigten Gewichtungen von 40 %, 40 % und 20 % waren ein Gestaltungsvorschlag, keine verbindlichen Standardwerte.

**Status:** Beschlossen als Funktionsprinzip. Konkrete Eingabemethode und Bewertungsformeln offen.

## **H-10 – Parametrisierbare automatische Beetaufteilung**

**Beschlossen als Produktanforderung:** Die automatische Aufteilung soll mindestens folgende Parameter berücksichtigen können:

| Parameter         | Historische Bedeutung                     |
| ----------------- | ----------------------------------------- |
| Beetbreite        | Individuell einstellbare Breite der Beete |
| Wegbreite         | Individuell einstellbare Breite der Wege  |
| Beetlänge         | Einheitlich oder flexibel                 |
| Zielflächendichte | Angestrebter Anteil der Beetfläche        |
| Prioritäten       | Gewichtung der Optimierungsziele          |

**Wichtige Einschränkung:** Die genaue Bedeutung der Zielflächendichte, ihre zulässigen Werte und ihr Verhältnis zur Optimierung sind noch nicht abschließend spezifiziert.

Die im Gespräch gezeigten Zahlen waren illustrative UI-Beispiele.

## **H-11 – Mehrere Varianten transparent vergleichen**

**Beschluss:** Die automatische Planung soll unterschiedliche Lösungen erzeugen und ihre Vor- und Nachteile nachvollziehbar machen.

**Begründung:** Es gibt nicht zwingend eine einzige objektiv beste Gartenaufteilung.

Die Anwendung soll sichtbar machen, wie sich unterschiedliche Prioritäten auf Flächennutzung, Wege und Zugänglichkeit auswirken.

**Status:** Produktanforderung bestätigt. Konkrete Vergleichskennzahlen und Darstellung offen.

## **H-12 – Bake-Funktion zur Sicherung von Varianten**

**Beschlossene Richtung:** Automatisch erzeugte Varianten sollen dauerhaft gesichert beziehungsweise in bearbeitbare Projektgeometrie überführt werden können.

**Begründung:** Der Nutzer soll mit Varianten experimentieren können, ohne seine bestehende Planung zu verlieren.

Der Begriff „Bake“ stammt aus dem parametrischen Rhino-/Grasshopper-Arbeitsablauf.

**Status:** Als zukünftige Funktion vorgesehen. Der technische Speichervertrag ist noch offen.

# **4. Entscheidungen zur Agronomie und Datenqualität**

## **H-13 – Vorhandene Agronomielogik wiederverwenden**

**Beschlossene Entwicklungsrichtung:** Der bereits implementierte Python-Scheduler soll die zentrale Grundlage der Kultur- und Saisonplanung bleiben.

Bei Phase 3C.1 wurde ausdrücklich vorgegeben, kein zweites unabhängiges Agronomiesystem zu entwickeln.

**Begründung:** Doppelte Berechnungslogik würde Inkonsistenzen und unnötige Wartung verursachen.

**Status:** Die spätere Kulturplanung wurde laut Codex-Bericht mit dem bestehenden Katalog verbunden. Die vollständige Scheduler-Integration in die Ernteprognose stand noch aus.

## **H-14 – Demo-Daten und reale Projektdaten strikt trennen**

Beschlossen · implementiert · getestet

**Beschluss:** Synthetische Demonstrationsdaten dürfen nicht unbemerkt in echte Nutzerprojekte übernommen werden.

**Begründung:** Ertragszahlen und Kulturparameter müssen nachvollziehbar und fachlich korrekt eingeordnet werden können.

**Umsetzung:** Die Projektansicht wurde zunächst ohne synthetische Scheduler-Ergebnisse eingeführt. Spätere Kulturzuweisungen basierten auf gespeicherten Nutzereingaben und dem bestehenden Katalog.

## **H-15 – Herkunft und Qualität agronomischer Parameter dokumentieren**

**Beschlossene Richtung:** Parameter sollen mit Wert, Einheit, Quelle und Status nachvollziehbar beschrieben werden.

Im historischen Kontext wurde ein Datenmodell mit `value`, `unit`, `source` und `status` genannt.

**Begründung:** Fachlich belegte Werte, Annahmen und Schätzungen müssen unterscheidbar sein.

**Status:** Als Datenmodellprinzip überliefert. Der genaue Implementierungsstand aller Parameterfelder muss im Repository überprüft werden.

## **H-16 – Mehrere Anbauvorgänge pro Beet ermöglichen**

**Beschluss:** Ein Beet darf mehrere zeitlich aufeinanderfolgende Anbauvorgänge besitzen.

**Begründung:** Professioneller Gemüsebau arbeitet mit Fruchtfolgen, Folgekulturen und gestaffelten Sätzen.

**Umsetzung:** Phase 3C.1 implementierte dauerhaft gespeicherte Anbauvorgänge mit stabilen IDs.

**Status:** Implementiert und getestet.

## **H-17 – Zeitliche Überschneidungen anzeigen, nicht pauschal verbieten**

Beschlossen · implementiert · getestet

**Kontext:** Während der Prüfung der Kulturplanung fiel auf, dass zwei Anbauvorgänge auf demselben Beet denselben Zeitraum belegen konnten.

**Beschluss:** Überschneidungen sollen erkannt und verständlich angezeigt werden, aber nicht grundsätzlich verboten sein.

**Begründung:** Mischkulturen und parallele Anbauvorgänge können fachlich sinnvoll sein.

**Weitere Anforderungen:**

- Keine automatische Terminänderung.
- Fehlende Erntetermine nicht erfinden.
- Unklare Zeiträume als unklar kennzeichnen.
- Betroffene Vorgänge eindeutig benennen.

**Status:** Python-basierte Überschneidungsprüfung implementiert und getestet.

## **H-18 – Geplante, prognostizierte und tatsächliche Ernte unterscheiden**

**Beschlossene fachliche Richtung:** Unterschiedliche Datenqualitäten dürfen nicht vermischt werden.

Eine vom Nutzer eingetragene geplante Ernte ist keine tatsächlich gemessene Ernte. Eine vom Scheduler berechnete Prognose ist ebenfalls kein Ist-Wert.

**Begründung:** Nur so bleiben Produktionsplanung und spätere Auswertungen verlässlich.

**Status:** Als Produktprinzip bestätigt. Vollständige Ernteprognose für gespeicherte Projekte noch nicht implementiert.

# **5. Entscheidungen zur Benutzeroberfläche**

## **H-19 – Map-first als grundlegendes Bedienkonzept**

**Beschlossene und implementierte Richtung:** Die Gartenkarte ist der zentrale Arbeitsbereich.

Die Oberfläche besteht aus:

- großflächiger Karte,
- schwebenden Bedienelementen,
- Hover-Tooltips,
- rechtem Detailpanel,
- unterem Saison-Slider,
- unabhängig verschiebbarem Ernteprognose-Fenster.

**Begründung:** Der Nutzer soll hauptsächlich räumlich und visuell arbeiten.

**Status:** Grundstruktur seit Phase 3A.2 implementiert und getestet.

## **H-20 – Direkte geometrische Bearbeitung mit numerischer Präzision**

**Beschluss:** Geometrische Objekte sollen sowohl mit der Maus als auch über präzise Eingabefelder bearbeitbar sein.

Dazu gehören Verschieben, Drehen, Skalieren und Löschen.

**Begründung:** Direkte Manipulation ist intuitiv; numerische Eingaben sind für maßhaltige Planung unverzichtbar.

**Status:** In Phase 3B.3b und 3B.3c implementiert und getestet. Der Nutzer bestätigte, dass die grundlegenden Funktionen funktionieren.

## **H-21 – Anzeige auf maximal zwei Nachkommastellen begrenzen**

**Beschluss:** Winkel, Maße und Koordinaten sollen nicht mit langen Fließkommazahlen dargestellt werden.

**Begründung:** Die Darstellung war unübersichtlich und für die Bedienung unnötig präzise.

**Wichtige technische Anforderung:** Die interne Genauigkeit darf nicht durch die Anzeigeformatierung reduziert werden.

**Status:** Implementiert und getestet. Codex dokumentierte die Anpassung als `DEC-028`.

## **H-22 – Shift-Snapping beim Drehen**

**Beschluss:** Bei gedrückter Shift-Taste soll der Rotationsgriff in 15°-Schritten einrasten.

Ohne Shift bleibt die Rotation frei.

**Begründung:** Häufig verwendete Winkel wie 45° und 90° sollen schnell erreichbar sein, ohne die freie Geometrie einzuschränken.

**Status:** Implementiert und automatisiert getestet. Die ausdrücklich angekündigte physische Nutzerprüfung ist im verfügbaren Verlauf nicht abschließend dokumentiert.

## **H-23 – Kompaktes Detailpanel mit möglichst wenig Scrollen**

**Kontext:** Nach Einführung der Kulturplanung kritisierte der Nutzer, dass zu viel vertikaler Platz benötigt wurde.

**Beschluss:** Wesentliche Informationen sollen bei wenigen Anbauvorgängen möglichst ohne Scrollen sichtbar sein.

**Umsetzung:**

- kompakte Kulturzeilen,
- kleine Aktionen,
- einklappbare Geometrie- und Herkunftsbereiche,
- Scrollmöglichkeit bei umfangreichen Inhalten.

**Status:** Implementiert und in mehreren Fensterhöhen getestet.

## **H-24 – Bearbeitete Kultur eindeutig hervorheben**

**Kontext:** Die Überschrift „Anbauvorgang bearbeiten“ ließ nicht eindeutig erkennen, ob Karotten oder Spinat bearbeitet wurden.

**Beschluss:**

- aktive Kulturzeile dezent hervorheben,
- dynamische Überschrift mit Kulturnamen,
- Anbauart und Datum als Zusatzinformation,
- eindeutige Zuordnung über die Vorgangs-ID.

**Begründung:** Verwechslungen müssen insbesondere bei mehreren Kulturen oder wiederholten Anbausätzen vermieden werden.

**Status:** Implementiert und getestet laut Codex. Im Gespräch als `DEC-032` dokumentiert.

# **6. Entscheidungen zur visuellen Identität**

## **H-25 – Einheitliche generative ASCII-/Halftone-Bildsprache**

**Beschlossene gestalterische Richtung:** Pflanzen und Landschaftselemente sollen eine zusammenhängende, reduzierte generative Bildsprache erhalten.

Der Nutzer bevorzugte feine Punkte, Zeichen und Strukturen gegenüber einer Mischung aus unterschiedlichen Pixel-Art-Sprites.

**Begründung:** Eine konsistente Bildsprache soll hohe Detailtiefe ermöglichen, ohne die Gesamtwirkung zu überladen.

**Status:** Im Botanical ASCII Lab experimentell implementiert und getestet. Nicht in die Hauptanwendung integriert.

## **H-26 – Monochrome Living Landscape und Miniaturwirkung**

**Beschlossene gestalterische Richtung:** Die Anwendung soll eine ruhige, architektonische Landschaftsästhetik entwickeln.

Wichtige Elemente:

- warme helle und dunkle Neutralfarben,
- zurückhaltende Grün- und Erdtöne,
- subtile Tiefe,
- lebendige Vegetation,
- Modell- beziehungsweise Tilt-Shift-Wirkung.

**Status:** Als Produktvision bestätigt. Konkreter Renderer und vollständige Integration offen.

## **H-27 – Technische 2D-Ansicht erhalten**

**Beschlossene Richtung:** Eine perspektivische oder isometrische Darstellung darf die präzise geometrische 2D-Bearbeitung nicht ersetzen.

Beide Ansichten sollen auf denselben Geometriedaten beruhen.

**Begründung:** Die perspektivische Darstellung unterstützt räumliche Wahrnehmung, während die technische Ansicht für exakte Planung notwendig bleibt.

**Status:** Technische 2D-Ansicht implementiert. Perspektivische Integration offen.

## **H-28 – Produktname bleibt offen**

**Historischer Stand:** Die Namen TERRASTRA, TERRAMETRA und PARAMETRA wurden diskutiert.

Der Nutzer bewertete TERRASTRA und TERRAMETRA positiv.

**Kein Beschluss:** Es wurde kein endgültiger Produktname festgelegt.

Die Namen sind daher Kandidaten und dürfen nicht als verbindliche Produktentscheidung behandelt werden.

# **7. Entscheidungsentwicklung und Abhängigkeiten**

Einige Beschlüsse entstanden nicht unabhängig voneinander, sondern bauen unmittelbar aufeinander auf.

**Geometrie → automatische Planung**

H-02 ermöglicht H-03. Die freie metrische Geometrie ist Voraussetzung dafür, dass automatische Varianten später realitätsnah erzeugt und manuell bearbeitet werden können.

**Automatische Planung → Wegeoptimierung**

H-06 bis H-12 hängen zusammen. Die Gewichtung von Fläche und Wegen setzt ein Wegenetzmodell und nachvollziehbare Vergleichskennzahlen voraus.

**Kulturplanung → Saisonvisualisierung → Ernteprognose**

H-13 bis H-18 bilden die fachliche Grundlage. Die gespeicherten Anbauvorgänge ermöglichen die Wochenansicht; die Ernteprognose benötigt zusätzlich verlässliche Ertragsparameter.

**Agronomische Daten → Botanical ASCII**

H-25 bis H-27 hängen mit der zeitlichen Kulturplanung zusammen. Die Darstellung kann später auf gespeicherte Kulturen und Kalenderwochen reagieren, ohne selbst die agronomischen Berechnungen zu übernehmen.

Diese Abhängigkeiten sind für die technische Entwicklungsplanung wichtig, stellen aber keine zusätzliche Implementierungsfreigabe dar.

# **8. Dokumentierte Entscheidungen versus historische Rekonstruktion**

Die folgende Tabelle trennt, was wir aus dem Gespräch tatsächlich wissen, von dem, was noch geprüft werden muss.

| Sachverhalt                                         | Gesprächsnachweis                               | Weiterer Abgleich                                               |
| --------------------------------------------------- | ----------------------------------------------- | --------------------------------------------------------------- |
| Ursprüngliches Entscheidungsarchiv mit 26 Einträgen | Codex-Bericht                                   | Aktuelle Einträge und IDs prüfen                                |
| Git-Commit `f57d9b3`                                | Git-Ausgabe                                     | Kein weiterer Nachweis erforderlich für den historischen Commit |
| `DEC-028` zur geometrischen UI-Präzision            | Codex-Bericht                                   | Originaleintrag lesen                                           |
| `DEC-032` zur Kulturhervorhebung                    | Codex-Bericht                                   | Originaleintrag lesen                                           |
| Wegeeffizienz als Optimierungsziel                  | Ausdrückliche Nutzerbestätigung                 | Bestehende DEC-ID zuordnen                                      |
| Rhino-/Grasshopper-Unabhängigkeit                   | Gesprächsverlauf und implementierte Architektur | Entscheidungstext prüfen                                        |
| Bake-Funktion                                       | Wiederholt als zukünftige Anforderung behandelt | Verbindlichen Umfang prüfen                                     |
| Botanical ASCII                                     | Historischer Projektkontext                     | Eigenes Entscheidungsregister prüfen                            |
| Endgültiger Produktname                             | Kein Beschluss                                  | Als offen belassen                                              |

**Wichtig:** Diese Übergabe ist kein Ersatz für `docs/DECISIONS.md`. Sie dient dazu, historische Begründungen und Zusammenhänge zu erhalten, die in einer kompakten Entscheidungsdatei möglicherweise nicht vollständig enthalten sind.

# **9. Übergabe an die vier Fachchats**

## **01 – Produktvision & Ideensammlung**

Aus Teil 2 sind besonders die ursprünglichen Beweggründe relevant:

- Warum die Anwendung unabhängig von Rhino sein soll.
- Warum Wegeeffizienz genauso wichtig ist wie Anbaufläche.
- Warum eine reduzierte visuelle Identität angestrebt wird.
- Warum die Kulturplanung und die Karte eng zusammenarbeiten sollen.
- Warum automatische Varianten nachvollziehbar bleiben müssen.

Diese Inhalte dienen als Kontext für weitere Ideen, ohne bestehende Beschlüsse zu verändern.

## **02 – Entscheidungsarchiv**

Dieser Fachchat ist der Hauptempfänger von Teil 2.

Er sollte insbesondere:

- die 28 historischen Referenzen mit vorhandenen DEC-IDs abgleichen,
- Begründungen und Auswirkungen erhalten,
- fehlende historische Zusammenhänge identifizieren,
- Beschlüsse von Vorschlägen unterscheiden,
- dokumentierte Entscheidungen nicht ohne ausdrückliche Bestätigung verändern.

**Keine der H-Referenzen darf automatisch als neue DEC-ID übernommen werden.**

## **03 – Offene Entscheidungen**

Folgende Punkte bleiben entscheidungsbedürftig:

- Mathematische Optimierungsformeln.
- Gewichtung und Normalisierung der Kriterien.
- Wegenetzmodell.
- Definition und Grenzen der Flächendichte.
- Bake-Speichervertrag.
- Behandlung von Mischkulturen in der späteren Ernteprognose.
- GIS-Anbieter und Importformate.
- Integration von Botanical ASCII.
- Produktname.

Die bestehende Datei `docs/OPEN_QUESTIONS.md` bleibt die Referenz für IDs und Prioritäten.

## **04 – Technische Entwicklungsplanung**

Für die technische Planung sind besonders relevant:

- Bestehende Architekturentscheidungen erhalten.
- Kein zweiter Scheduler.
- Keine Vermischung von Demo- und Nutzerdaten.
- Revisionssichere Speicherung.
- Validierung vor Übernahme.
- Bestehende Geometrie als gemeinsame Grundlage.
- Geplante Funktionen nicht mit bereits implementierten Funktionen verwechseln.
- Neue Entwicklungsaufträge erst nach ausdrücklicher Freigabe umsetzen.

## **10. Grenzen dieser Rekonstruktion**

Für die historische Genauigkeit sind folgende Einschränkungen ausdrücklich festzuhalten.

**Nicht vollständig verfügbar:**

- Der gesamte ursprüngliche Chat „Grasshopper Gemüseanbau Analyse“.
- Die vollständigen Originaltexte der frühen Produktentscheidungen.
- Das aktuelle vollständige Entscheidungsregister mit sämtlichen DEC-IDs.
- Die vollständige Entwicklungsgeschichte des Botanical ASCII Lab.
- Alle früheren Codex-Berichte und Testprotokolle.

**Nicht behauptet wird deshalb:**

- Dass alle 28 historischen Referenzen exakt 28 eigenständigen Repository-Entscheidungen entsprechen.
- Dass alle genannten Beschlüsse bereits implementiert wurden.
- Dass sämtliche Codex-Tests vom Nutzer persönlich abgenommen wurden.
- Dass das Entscheidungsregister derzeit vollständig oder widerspruchsfrei ist.
- Dass eine bestimmte offene Frage bereits eine neue OQ-ID erhalten sollte.

Die Übergabe darf ausschließlich als Grundlage für einen späteren Dokumentationsabgleich verwendet werden.

**Teil 2 abgeschlossen**

Wir haben 28 historische Entscheidungsreferenzen mit Kontext, Begründung, Status und Abhängigkeiten rekonstruiert.

**Als Nächstes: Teil 3 – Offene Entscheidungen, ungeklärte Varianten und zurückgestellte Ideen.** Dort ordnen wir die offenen Fragen nach Themen und Abhängigkeiten und unterscheiden zwischen tatsächlichen Entscheidungsbedarfen und bloßen zukünftigen Entwicklungsaufgaben.

Ich warte auf deine Aufforderung zur Fortsetzung.

---

# Quelldokument Teil 3

# **Market Garden Planner – Historische Projektübergabe**

Teil 3 von 4 · Offene Entscheidungen, ungeklärte Varianten und zurückgestellte Ideen

Dieser Teil rekonstruiert die offenen Fragen aus dem bisherigen Gesprächsverlauf und ordnet sie dem neuen Fachchat **03 – Offene Entscheidungen** zu.

Im Mittelpunkt stehen drei Fragen:

- Welche Produkt- und Architekturfragen wurden diskutiert, aber noch nicht abschließend entschieden?
- Welche Funktionen sind grundsätzlich beschlossen, deren genaue Ausgestaltung jedoch noch offen ist?
- Welche Ideen wurden bewusst zurückgestellt, ohne dass sie verworfen wurden?

**Wichtige Abgrenzung:** Die folgende Sammlung ist eine historische Rekonstruktion. Sie ersetzt nicht das bestehende Register `docs/OPEN_QUESTIONS.md`.

Aus der späteren Projektorganisation ist bekannt, dass dieses Register bereits **24 offene Themen mit stabilen OQ-IDs** enthält. Da die aktuelle Datei hier nicht vorliegt, werden keine neuen OQ-IDs vergeben und keine bestehenden Zuordnungen behauptet.

# **1. Übersicht der offenen Themen**

Die nachfolgenden Kennungen `HF-01` bis `HF-28` sind ausschließlich temporäre Referenzen dieser Übergabe.

Sie dienen dazu, die Themen in Teil 4 und beim späteren Dokumentationsabgleich eindeutig ansprechen zu können.

| Bereich                          | Historische Fragen | Bedeutung                                 |
| -------------------------------- | ------------------ | ----------------------------------------- |
| Automatische Beetplanung         | HF-01 bis HF-07    | Zentrale zukünftige Produktfunktion       |
| Wege und Betriebslogistik        | HF-08 bis HF-11    | Grundlage der betrieblichen Optimierung   |
| Varianten und bestehende Gärten  | HF-12 bis HF-14    | Sichere Übernahme von Planungsergebnissen |
| Agronomie und Saisonplanung      | HF-15 bis HF-19    | Verlässliche Produktionsplanung           |
| Geometrie und GIS                | HF-20 bis HF-22    | Erweiterung der räumlichen Planung        |
| Darstellung und Botanical ASCII  | HF-23 bis HF-26    | Langfristige visuelle Produktidentität    |
| Produktidentität und Integration | HF-27 bis HF-28    | Name und Rhino-/Grasshopper-Anbindung     |

Diese Themen überschneiden sich teilweise mit bereits dokumentierten Entscheidungen. Offen ist dann nicht die grundsätzliche Anforderung, sondern ihre konkrete Ausgestaltung.

# **2. Automatische Beetplanung**

Primär: Fachchat 03 · Produktkontext: 01 · spätere technische Planung: 04

## **HF-01 – Welches Optimierungsverfahren soll verwendet werden?**

**Bereits beschlossen:** Die automatische Beetaufteilung soll nutzbare Anbaufläche, Wegeeffizienz und Zugänglichkeit gemeinsam berücksichtigen.

**Offen:** Wie werden geeignete Beet- und Wegeanordnungen algorithmisch erzeugt?

Im bisherigen Gespräch wurde kein bestimmtes Optimierungsverfahren verbindlich ausgewählt.

Denkbare technische Richtungen wären beispielsweise eine regelbasierte Generierung, iterative geometrische Optimierung oder eine mehrzielige Suche. Diese Varianten sind hier lediglich zur Einordnung genannt, nicht als historische Beschlüsse.

Zu klären bleibt insbesondere, wie der Algorithmus mit unregelmäßigen Grundstücken, beliebigen Beetwinkeln und vorhandenen Hindernissen umgehen soll.

**Abhängigkeiten:** HF-02, HF-03, HF-04, HF-08.

## **HF-02 – Wie werden die Optimierungsziele mathematisch bewertet?**

**Bereits beschlossen:** Die Ergebnisse müssen nachvollziehbar und vergleichbar sein.

**Offen:** Welche Kennzahlen und Bewertungsformeln werden verwendet?

Beispielsweise müssen Flächeneffizienz, Wegeeffizienz und Zugänglichkeit in vergleichbare Bewertungen überführt werden.

Die im Gespräch gezeigte Gewichtung von 40 % / 40 % / 20 % war nur eine illustrative Benutzeroberfläche.

Es gibt keinen bestätigten Standardwert.

**Zu klären:** Normalisierung, Gewichtung, Umgang mit Zielkonflikten und Darstellung der Ergebnisse.

## **HF-03 – Wie wird die angestrebte Beetflächendichte interpretiert?**

Der Nutzer schlug ausdrücklich vor, die Dichte der Beete im Verhältnis zur Gesamtfläche einstellen zu können.

Die genaue Bedeutung ist noch nicht festgelegt.

**Beispiel zur begrifflichen Unterscheidung**

Angenommene Grundstücksfläche: 1.000 m²

# **75 %**

Zielwert

750 m² gewünschte Beetfläche

# **63 %**

Mögliches Ergebnis

630 m² nach geometrischer Prüfung

Die Unterscheidung zwischen Zielwert und tatsächlich erreichbarer Dichte wurde im Gespräch ausdrücklich hervorgehoben. Die Zahlen sind illustrative Beispiele, keine berechneten Projektergebnisse.

**Offen:** Soll der Wert eine harte Mindestanforderung, ein weiches Optimierungsziel oder eine bevorzugte Zielgröße sein?

## **HF-04 – Welche Beetwinkel und Ausrichtungsstrategien werden untersucht?**

Die Beetgeometrie unterstützt beliebige Winkel.

Für die automatische Planung ist jedoch noch offen, wie die Software geeignete Orientierungen findet.

Im Gespräch wurden schematisch parallele, gedrehte und zonenweise Anordnungen gezeigt.

Diese Darstellungen waren Konzepte, keine festgelegten Algorithmusvarianten.

**Zu klären:** Suchraum für Winkel, Orientierung an Grundstückskanten und Umgang mit mehreren Teilbereichen.

## **HF-05 – Wie werden Beetlängen behandelt?**

**Bereits vorgesehen:** Die Beetlänge soll einstellbar sein.

Im UI-Konzept wurden zwei Richtungen diskutiert:

- Einheitliche Beetlänge.
- Flexible Beetlänge zur besseren Grundstücksausnutzung.

**Offen:** Welche Regeln gelten für Mindestlängen, maximale Längen, Restflächen und unterschiedliche Beetlängen innerhalb einer Variante?

Die Wahl zwischen beiden Prinzipien wurde noch nicht abschließend spezifiziert.

## **HF-06 – Welche Parametergrenzen und Standardwerte gelten?**

Frühere Konzepte verwendeten beispielsweise Beetbreiten um 75 cm.

Es wurden auch illustrative Slider-Bereiche für Beetbreite, Wegbreite und Flächendichte gezeigt.

**Nicht verbindlich beschlossen** wurden:

- minimale und maximale Beetbreiten,
- minimale und maximale Wegbreiten,
- Standard-Beetlängen,
- zulässige Zielflächendichten,
- Grenzen für Optimierungsgewichtungen.

Diese Werte müssen später anhand praktischer Anforderungen und des vorhandenen Datenmodells geprüft werden.

## **HF-07 – Wie viele Varianten soll die automatische Planung erzeugen?**

**Bereits beschlossen:** Mehrere Lösungen sollen vergleichbar sein.

**Offen:** Wie viele Varianten werden erzeugt, wie werden sie unterschieden und wie präsentiert?

Die im Gespräch gezeigten drei Anordnungsprinzipien waren Beispiele.

Es wurde keine feste Anzahl von Varianten beschlossen.

# **3. Wege und betriebliche Logistik**

Primär: Fachchat 03 · besonders hohe fachliche Bedeutung

Die Wegeoptimierung ist kein nebensächliches Zusatzmerkmal.

Der Nutzer hat ihre Bedeutung für den professionellen Betrieb ausdrücklich hervorgehoben.

## **HF-08 – Wie wird das Wegenetz modelliert?**

**Bereits beschlossen:** Tatsächliche Arbeitswege sollen bewertet werden, nicht bloß Luftlinien.

**Offen:** Wie wird das Wegenetz geometrisch und topologisch beschrieben?

Zu klären sind beispielsweise:

- Verbindung von Beetenden und Hauptwegen.
- Erreichbarkeit aller Beete.
- Kreuzungen und Sackgassen.
- Übergänge zwischen Wegen unterschiedlicher Breite.
- Berücksichtigung von Grundstückslöchern und Hindernissen.

Die genaue technische Repräsentation wurde nicht festgelegt.

## **HF-09 – Welche Wege sollen für die Bewertung maßgeblich sein?**

Die ursprüngliche Planung ging von einem Grundstückseingang aus.

Später wurden zusätzliche Betriebsstationen diskutiert.

**Offen:** Welche Wegbeziehungen werden tatsächlich bewertet?

Mögliche Beziehungen sind:

- Eingang zu Beet.
- Beet zu Beet.
- Beet zu Wasserstelle.
- Beet zu Waschstation.
- Beet zu Kompost.
- Beet zu Gewächshaus.

Die Reihenfolge und Bedeutung dieser Wege hängen von realen Arbeitsabläufen ab.

Ein verbindliches Bewegungs- oder Häufigkeitsmodell wurde noch nicht festgelegt.

## **HF-10 – Wie wird praktische Zugänglichkeit bewertet?**

**Bereits beschlossen:** Schubkarren und Erntewagen müssen berücksichtigt werden.

**Offen:** Welche konkreten Anforderungen folgen daraus?

Beispielsweise könnten Wegbreite, Kurvenradien, Wendeflächen oder die Erreichbarkeit bestimmter Beetkanten relevant sein.

Im Gespräch wurden hierfür keine verbindlichen geometrischen Grenzwerte festgelegt.

**Wichtig:** Eine kurze Wegstrecke bedeutet nicht automatisch, dass sie betrieblich nutzbar ist.

## **HF-11 – Wie wird zwischen Hauptwegen und Nebenwegen unterschieden?**

Die Idee unterschiedlicher Wegfunktionen ergibt sich aus der Diskussion über Zugänglichkeit und Arbeitslogistik.

Eine verbindliche Klassifizierung wurde jedoch nicht beschlossen.

Offen bleibt, ob die Software unterschiedliche Wegtypen mit eigenen Breiten und Anforderungen unterstützen soll.

**Status:** Aus dem bisherigen Konzept abgeleiteter Prüfpunkt, keine ausdrücklich bestätigte eigenständige Anforderung.

# **4. Varianten, Bake und bestehende Gärten**

## **HF-12 – Wie funktioniert das dauerhafte Sichern einer Variante?**

**Bereits beschlossen:** Automatisch erzeugte Varianten sollen dauerhaft gesichert werden können.

Der Begriff „Bake“ wurde aus dem Rhino-/Grasshopper-Kontext übernommen.

**Offen:** Was genau passiert beim Sichern?

Insbesondere:

- Werden die erzeugten Beete zu normalen Projektbeeten?
- Bleibt die ursprüngliche Variante erhalten?
- Kann der Nutzer zwischen Varianten wechseln?
- Welche Parameter werden mitgespeichert?
- Wie werden spätere Änderungen nachvollzogen?

Der technische Bake-Speichervertrag wurde ausdrücklich als offene Frage genannt.

## **HF-13 – Wie werden bestehende und gesperrte Objekte behandelt?**

**Bereits beschlossen:** Bestehende und gesperrte Objekte dürfen nicht automatisch verändert werden.

**Offen:** Wie wird der Optimierungsbereich abgegrenzt?

Die automatische Planung soll nur ausdrücklich freigegebene Flächen bearbeiten.

Die genaue Bedienung für Auswahl, Freigabe und Sperrung solcher Bereiche wurde nicht festgelegt.

## **HF-14 – Wie werden automatisch erzeugte und manuell bearbeitete Beete unterschieden?**

Nach einer automatischen Aufteilung sollen die Ergebnisse manuell bearbeitbar sein.

Offen bleibt, ob die Anwendung die Herkunft eines Beetes dauerhaft speichern muss.

Denkbare Informationen wären etwa die erzeugende Variante oder die ursprünglich verwendeten Parameter.

**Status:** Technische Folgefrage aus dem Bake-Konzept. Keine eigenständige Nutzerentscheidung im verfügbaren Gespräch.

# **5. Agronomie, Saisonplanung und Erträge**

## **HF-15 – Wie werden zeitliche Überschneidungen fachlich interpretiert?**

**Bereits beschlossen und implementiert:** Überlappende Anbauvorgänge werden angezeigt, aber nicht grundsätzlich verboten.

**Offen:** Wann ist eine Überschneidung tatsächlich eine Mischkultur, ein Fehler oder eine bewusst geplante Übergangsphase?

Die bisherige Prüfung erkennt zeitliche Überlagerungen.

Eine vollständige fachliche Mischkulturprüfung wurde nicht implementiert.

Insbesondere bleibt offen, wie gleichzeitig genutzte Beetfläche und unterschiedliche Pflanzdichten bewertet werden sollen.

## **HF-16 – Wie wird die Ernteprognose mit gespeicherten Beeten verbunden?**

Die bestehende Demo besitzt bereits einen Scheduler und ein Ernteprognose-Fenster.

**Offen im letzten dokumentierten Entwicklungsstand:** Wie werden die gespeicherten Kulturzuweisungen mit den bestehenden Ertragsmodellen verbunden?

Die spätere Phase 3C.3 wurde dafür vorgesehen.

Zu berücksichtigen sind:

- tatsächliche Beetfläche,
- Anbauprofil,
- Aussaat- beziehungsweise Pflanzdatum,
- erwarteter Erntezeitraum,
- Datenherkunft,
- mehrere Anbauvorgänge,
- mögliche Überlagerungen.

**Status:** Geplante Entwicklungsphase, keine im Gespräch berichtete Implementierung.

## **HF-17 – Wie werden historische Erträge erfasst und verwendet?**

Der Nutzer möchte langfristig eigene Ertragsdaten nutzen können.

Offen sind:

- Zuordnung der Ernte zu Kultur und Anbauvorgang.
- Erfassung in Kilogramm oder Stück.
- Umgang mit mehreren Ernteterminen.
- Kalibrierung zukünftiger Prognosen.
- Unterscheidung zwischen realen Erträgen und Schätzungen.

Eine konkrete Datenstruktur wurde noch nicht verbindlich beschlossen.

## **HF-18 – Wie werden unvollständige Kulturzeiträume behandelt?**

In Phase 3C.1 und 3C.2 wurde bereits umgesetzt, dass fehlende Erntetermine nicht automatisch ergänzt werden.

**Offen:** Welche weiteren Funktionen sollen bei unvollständigen Daten eingeschränkt werden?

Beispielsweise muss bei einer zukünftigen Ernteprognose geklärt werden, ob und unter welchen Voraussetzungen aus dem Kulturprofil ein geschätzter Erntezeitraum abgeleitet werden darf.

Das bisherige Verhalten der Wochenansicht ist davon zu unterscheiden.

## **HF-19 – Wie wird saisonales Pflanzenwachstum modelliert?**

Der Saison-Slider zeigt bereits zeitabhängige Kulturbelegungen.

Die spätere visuelle Pflanzenentwicklung ist davon getrennt.

**Offen:**

- Welche Wachstumsphasen sollen dargestellt werden?
- Welche Daten bestimmen Pflanzenhöhe und Entwicklungsstand?
- Wie werden saisonale Unterschiede berücksichtigt?
- Was geschieht bei fehlenden Kulturparametern?
- Wie wird vermieden, dass eine visuelle Schätzung als agronomisch gesicherte Aussage erscheint?

Die botanische Wachstumssimulation wurde ausdrücklich aus Phase 3C.2 ausgeschlossen.

# **6. Geometrie, Karten und räumliche Daten**

## **HF-20 – Welcher Kartenanbieter wird verwendet?**

Der Nutzer diskutierte die Möglichkeit, Grundstücke anhand von Satellitenbildern zu erfassen.

Google Maps wurde als Ausgangsidee genannt.

Daneben wurden OpenStreetMap und Leaflet als mögliche technische Bestandteile angesprochen.

**Offen:** Welcher Anbieter oder welche Kombination langfristig verwendet werden soll.

Es wurde keine verbindliche Auswahl getroffen.

## **HF-21 – Welche GIS- und Importformate werden unterstützt?**

Die Grundidee des geografischen Imports wurde als zukünftige Funktion aufgenommen.

**Offen:**

- unterstützte Dateiformate,
- geografische Koordinatensysteme,
- Umrechnung in lokale metrische Koordinaten,
- Genauigkeit,
- Bearbeitung nach dem Import,
- Umgang mit fehlerhaften oder unvollständigen Geometrien.

Eine konkrete technische Spezifikation wurde nicht beschlossen.

## **HF-22 – Welche zusätzlichen Geometriefunktionen benötigt der Editor?**

Die Phasen 3B.3b und 3B.3c implementierten die grundlegende Beetbearbeitung.

Als noch nicht implementiert wurden genannt:

- Undo/Redo.
- Skalierung mit fester Bezugskante.
- Weitergehende Grundstücksbearbeitung.

Die feste Bezugskante wurde technisch vorbereitet, aber nicht als vollständige Funktion umgesetzt.

Auch die Bearbeitung komplexerer räumlicher Objekte ist noch offen.

# **7. Darstellung und Botanical ASCII**

Primär: Fachchat 03 · Produktvision: 01 · technische Schnittstelle: 04

## **HF-23 – Wie wird Botanical ASCII in den Planner integriert?**

Das Botanical ASCII Lab ist ein eigenständiger experimenteller Bereich.

**Bereits festgelegt:** Agronomische Berechnungen und Visualisierung sollen nicht unnötig vermischt werden.

**Offen:** Wie die konkrete Integration erfolgt.

Zu klären sind beispielsweise:

- Welche Daten erhält der Renderer?
- Wie werden Kultur und Entwicklungsstand übergeben?
- Wie wird die Darstellung auf die Beetgeometrie projiziert?
- Welche Aufgaben bleiben beim Planner?
- Welche Aufgaben übernimmt das Botanical ASCII Lab?

Es wurde noch keine verbindliche Schnittstelle spezifiziert.

## **HF-24 – Welches Renderingverfahren wird endgültig verwendet?**

Im Botanical ASCII Lab wurden unterschiedliche Ansätze mit ASCII-, Halftone- und Hybridstrukturen untersucht.

Die gestalterische Richtung ist klarer als die technische Umsetzung.

**Offen:** Welches Verfahren sich für die Hauptanwendung am besten eignet.

Dabei spielen Lesbarkeit, Detailgrad, Performance und Skalierbarkeit eine Rolle.

Die vorhandenen Experimente müssen anhand ihrer eigenen Dokumentation geprüft werden.

## **HF-25 – Wie wird zwischen 2D- und perspektivischer Ansicht gewechselt?**

**Bereits beschlossen:** Die technische 2D-Ansicht soll erhalten bleiben.

Eine perspektivische beziehungsweise isometrische Ansicht wurde als zukünftige Möglichkeit diskutiert.

**Offen:**

- Projektion,
- Kamerasteuerung,
- Wechsel zwischen Ansichten,
- Interaktion mit geometrischen Objekten,
- Darstellung frei gedrehter Beete,
- Verhältnis von technischer Präzision und atmosphärischer Darstellung.

Die perspektivische Ansicht darf die freie Geometrie nicht auf ein starres Raster reduzieren.

## **HF-26 – Wie weit reicht die visuelle Produktidentität?**

Die Richtung „Monochrome Living Landscape“ wurde bestätigt.

Noch nicht abschließend geklärt ist, wie konsequent diese Bildsprache auf sämtliche Bereiche übertragen wird.

Beispielsweise:

- Beetdarstellung,
- Pflanzen,
- Gewächshäuser,
- Wege,
- saisonale Zustände,
- technische Bedienelemente,
- Light und Dark Mode.

Für das Botanical ASCII Lab wurde bereits ein Theme-Switch implementiert. Daraus folgt jedoch nicht automatisch, dass dieselbe Funktion in der Hauptanwendung vorhanden oder beschlossen ist.

# **8. Produktidentität und Rhino-/Grasshopper-Anbindung**

## **HF-27 – Wie soll die Software endgültig heißen?**

Im Gespräch wurden mehrere Namen diskutiert.

Besonders positiv bewertet wurden:

**TERRASTRA** und **TERRAMETRA**.

Weitere Kandidaten waren PARAMETRA, TERRAFORMA und mehrere daraus abgeleitete Varianten.

**Offen:** Endgültiger Name, Markenverfügbarkeit, Domainverfügbarkeit und langfristige Produktidentität.

Es wurde ausdrücklich kein endgültiger Name beschlossen.

## **HF-28 – Welche Rolle sollen Rhino und Grasshopper langfristig spielen?**

**Bereits beschlossen:** Der Market Garden Planner soll unabhängig von Rhino funktionieren.

**Offen:** Welche zusätzliche Rolle Rhino und Grasshopper künftig übernehmen sollen.

Denkbare Möglichkeiten sind:

- Geometrieimport und -export.
- Parametrische Experimente.
- Austausch von Beet- und Wegegeometrien.
- Entwicklung und Vergleich von Optimierungsverfahren.

Im Gespräch wurde keine konkrete Integrationsarchitektur festgelegt.

Die vorhandene Python-Geometrie bildet grundsätzlich eine geeignete Ausgangsbasis, ersetzt aber keine implementierte Schnittstelle.

# **9. Zurückgestellte Ideen und bewusst ausgeschlossene Funktionen**

Nicht jede noch fehlende Funktion ist automatisch eine offene Produktentscheidung.

Mehrere Themen wurden bewusst aus einzelnen Entwicklungsphasen ausgeklammert, um die Umsetzung überschaubar zu halten.

| Funktion                                | Historische Einordnung              | Letzter bekannter Stand |
| --------------------------------------- | ----------------------------------- | ----------------------- |
| Automatische Beetaufteilung             | Zentrale spätere Funktion           | Nicht implementiert     |
| Vollständige Wegeoptimierung            | Bestätigte Produktanforderung       | Nicht implementiert     |
| Bake und Variantenvergleich             | Bestätigte Richtung, Details offen  | Nicht implementiert     |
| Ernteprognose für gespeicherte Projekte | Geplante nächste Entwicklungsphase  | Nicht implementiert     |
| Botanical-ASCII-Integration             | Langfristige Gestaltungsentwicklung | Nicht implementiert     |
| GIS-/Satellitenkartenimport             | Zurückgestellte Funktion            | Nicht implementiert     |
| Undo/Redo                               | Erweiterung des Geometrieeditors    | Nicht implementiert     |
| Feste Skalierungsbezugskanten           | Vorbereitete Erweiterung            | Nicht implementiert     |
| Historische Ertragskalibrierung         | Langfristige Agronomiefunktion      | Nicht implementiert     |
| Vollständige Mischkulturprüfung         | Fachlich noch zu spezifizieren      | Nicht implementiert     |

Diese Angaben beziehen sich auf den letzten im Gespräch dokumentierten Entwicklungsstand. Sie dürfen nicht ohne Repository-Prüfung als aktueller Implementierungsstatus übernommen werden.

# **10. Abhängigkeiten zwischen den offenen Fragen**

Für den neuen Fachchat 03 ist besonders wichtig, dass manche Fragen erst sinnvoll beantwortet werden können, wenn andere geklärt sind.

### **Abhängigkeitsstruktur**

Konzeptionelle Abhängigkeiten für die spätere automatische Planung; keine festgelegte technische Architektur.

Weitere wichtige Zusammenhänge:

**Agronomie:** Kulturzuweisung und Wochenstatus sind bereits vorhanden. Für belastbare Ernteprognosen müssen zusätzlich Ertragsmodelle, Flächenbezug und Datenqualität berücksichtigt werden.

**Visualisierung:** Die saisonale Darstellung setzt eine definierte Verbindung zwischen Kulturdaten, Entwicklungszuständen und Renderer voraus.

**GIS:** Ein Kartenimport benötigt eine nachvollziehbare Transformation geografischer Daten in das bestehende metrische Geometriemodell.

**Bake:** Ein dauerhafter Variantenvergleich benötigt ein klares Verhältnis zwischen berechneten Vorschlägen, gespeicherten Varianten und manuell bearbeiteter Projektgeometrie.

# **11. Historische Prioritäten und Bedeutung**

Die folgende Einordnung beschreibt **keine neu beschlossene Roadmap**.

Sie rekonstruiert lediglich, welche Themen im Gespräch besonders stark betont wurden.

| Themenbereich                | Historische Bedeutung         | Begründung                                                           |
| ---------------------------- | ----------------------------- | -------------------------------------------------------------------- |
| Flächen- und Wegeoptimierung | Sehr hoch                     | Vom Nutzer ausdrücklich als zentrale betriebliche Funktion bestätigt |
| Manuelle Geometrie           | Sehr hoch                     | Voraussetzung für die Arbeit mit realen Gartenflächen                |
| Kultur- und Saisonplanung    | Sehr hoch                     | Kern des Market Garden Planners                                      |
| Transparente Varianten       | Hoch                          | Entscheidungsfreiheit und Nachvollziehbarkeit                        |
| Botanical ASCII              | Hoch für die Produktidentität | Eigenständige visuelle Richtung                                      |
| GIS-Import                   | Zukünftige Erweiterung        | Vereinfachte Grundstückserfassung                                    |
| Historische Erträge          | Langfristig wichtig           | Verbesserung der Prognosequalität                                    |
| Rhino-/Grasshopper-Anbindung | Optionale Erweiterung         | Parametrische Experimente                                            |
| Produktname                  | Offen                         | Keine endgültige Auswahl                                             |

Die tatsächliche Priorisierung der 24 bestehenden OQ-Themen muss im neuen Fachchat 03 anhand von `docs/OPEN_QUESTIONS.md` erfolgen.

# **12. Übergabe an die vier Fachchats**

## **01 – Produktvision & Ideensammlung**

Folgende offenen Ideen gehören in die weitere Produktentwicklung:

- Automatische Beetaufteilung und Variantenvergleich.
- Betriebslogistik und Wegeeffizienz.
- Gewächshäuser und weitere Betriebsstationen.
- Historische Ertragsdaten.
- GIS-Import.
- Botanical ASCII und perspektivische Landschaftsdarstellung.
- Produktname und Markenidentität.

Dabei muss zwischen bereits bestätigten Grundprinzipien und noch offenen Details unterschieden werden.

## **02 – Entscheidungsarchiv**

Dieser Chat sollte vor allem prüfen, welche offenen Themen bereits durch bestehende Entscheidungen teilweise eingeschränkt sind.

Beispielsweise:

- Die Wegeoptimierung ist nicht mehr grundsätzlich offen.
- Offen ist ihre mathematische und technische Umsetzung.
- Die unabhängige Python-Architektur ist beschlossen.
- Offen ist eine mögliche Rhino-/Grasshopper-Schnittstelle.
- Die Trennung von Demo- und Projektdaten ist beschlossen.
- Offen sind bestimmte spätere Ertragsmodelle.

So vermeiden wir, bereits entschiedene Grundsatzfragen erneut zu diskutieren.

## **03 – Offene Entscheidungen**

Dies ist der Hauptempfänger von Teil 3.

Die 28 historischen HF-Referenzen sollten mit den vorhandenen OQ-IDs abgeglichen werden.

Dabei ist zu prüfen:

- Welche Fragen sind bereits dokumentiert?
- Welche wurden inzwischen entschieden?
- Welche sind nur technische Folgefragen?
- Welche fehlen tatsächlich?
- Welche hängen voneinander ab?
- Welche sind für kommende Entwicklungsphasen relevant?

**Es dürfen keine neuen OQ-IDs vergeben werden, bevor das aktuelle Register geprüft wurde.**

## **04 – Technische Entwicklungsplanung**

Dieser Chat benötigt die offenen Fragen als Rahmen für zukünftige Entwicklungsaufträge.

Wichtig ist dabei:

- Keine offenen Produktentscheidungen stillschweigend durch Codex treffen lassen.
- Bestehende Architektur und Datenmodelle berücksichtigen.
- Abhängigkeiten vor einer Implementierung prüfen.
- Neue Entwicklungsphasen nur nach ausdrücklicher Freigabe starten.
- Beschlossen, implementiert, getestet und abgenommen getrennt dokumentieren.

# **13. Grenzen und notwendiger Dokumentationsabgleich**

Die vorliegende Rekonstruktion beruht auf dem verfügbaren Gesprächsverlauf und dem historischen Projektkontext.

Nicht vollständig geprüft wurden:

- die 24 Originaleinträge in `docs/OPEN_QUESTIONS.md`,
- ihre stabilen OQ-IDs,
- ihre Verweise auf DEC-IDs,
- die aktuellen Statusangaben,
- mögliche spätere Entscheidungen,
- die vollständige aktuelle Roadmap.

Deshalb gelten die Kennungen `HF-01` bis `HF-28` ausschließlich innerhalb dieser Übergabe.

Einige Fragen können im Repository bereits präziser formuliert, zusammengefasst oder inzwischen entschieden worden sein.

**Keine der hier beschriebenen Fragen darf ungeprüft als neuer offener Punkt in das Repository übernommen werden.**

**Teil 3 abgeschlossen**

Wir haben 28 historische offene Themen beziehungsweise Folgefragen rekonstruiert, ihre Abhängigkeiten beschrieben und sie den vier neuen Fachchats zugeordnet.

**Als Nächstes: Teil 4 – Technische Entwicklungsplanung und Implementierungschronologie.** Dort dokumentieren wir die Entwicklung von den ersten Python-Berechnungen über die Phasen 3A, 3B und 3C bis zum letzten bekannten Git- und Teststand, einschließlich Codex-Aufträgen, Architektur, Implementierungsberichten, Tests und noch ausstehender Abnahmen.

Ich warte auf deine Aufforderung zur Fortsetzung.

---

# Quelldokument Teil 4

# **Market Garden Planner – Historische Projektübergabe**

Teil 4 von 4 · Technische Entwicklungsplanung, Implementierungschronologie und Projektübergabe

Dieser letzte Teil rekonstruiert die technische Entwicklung des Market Garden Planners – von den ersten Grasshopper-Überlegungen über den Python-Rechenkern bis zur eigenständigen Anwendung mit Geometrieeditor, Kulturplanung und Saisonvisualisierung.

Er ist insbesondere für den neuen Fachchat **04 – Technische Entwicklungsplanung** bestimmt.

Ergänzend enthält er eine abschließende Zuordnung aller vier Übergabeteile zur neuen Projektstruktur.

**Verbindlichkeit:** Die nachfolgenden Angaben beruhen auf den im Gespräch verfügbaren Codex-Berichten, Git-Ausgaben und Nutzerprüfungen. Sie ersetzen keine Inspektion des aktuellen Repositorys. Wo Originaldateien oder vollständige Testprotokolle fehlen, wird dies ausdrücklich gekennzeichnet.

# **1. Technische Entwicklung im Überblick**

## **1.1 Entwicklungslinie**

1. **Grasshopper-Konzept**

   Parametrische Beetgeometrie, Wege, Kulturabstände und Mengenberechnungen.

   Ursprüngliche Produktidee · kein vollständiger Grasshopper-Implementierungsstand nachgewiesen
2. **Phase 1 – Agronomischer Rechenkern**

   Berechnung von Saatgut, Jungpflanzen, Reihenmetern und Flächenbedarf.

   Python · Implementierung und Tests historisch berichtet
3. **Phase 2 – Scheduler**

   Anbausätze, Termine, Erntezeiträume, Wochenprognosen und Beetbelegung.

   Python · Implementierung und Tests historisch berichtet
4. **Phase 3A – Erster visueller Prototyp**

   React/SVG-Karte, Demo-Beete, Saison-Slider und Ernteprognose.

   Implementiert · getestet · in Git gesichert
5. **Phase 3B – Räumliche Projektverwaltung**

   Freie Geometrie, SQLite, Projekt-API, Beeteditor und präzise Bearbeitung.

   Implementiert · getestet · wesentliche Funktionen vom Nutzer geprüft
6. **Phase 3C – Kultur- und Saisonintegration**

   Gespeicherte Anbauvorgänge, Überschneidungsprüfung und ISO-Wochenvisualisierung.

   3C.1 in Git gesichert · 3C.2 implementiert und getestet, letzter Commit nicht bestätigt

Die technische Entwicklung folgte damit einer schrittweisen Integration bereits vorhandener Komponenten.

Die grundlegende Strategie bestand darin, zuerst verlässliche Berechnungen und Datenmodelle zu schaffen und anschließend die räumliche Benutzeroberfläche mit diesen Funktionen zu verbinden.

# **2. Ursprung und frühe Python-Entwicklung**

Historische Angaben aus ergänzendem Projektkontext; Originalberichte nicht vollständig verfügbar

## **2.1 Grasshopper als Ausgangspunkt**

Zu Beginn wurde überlegt, wie sich ein Market-Gardening-Planungswerkzeug in Rhino/Grasshopper aufbauen lässt.

Die wesentlichen Aufgaben waren:

- Geschlossene Gartenfläche als Eingabe.
- Parametrische Beet- und Wegbreiten.
- Rechteckige Beete.
- Automatische Flächenaufteilung.
- Kulturabhängige Pflanz- und Reihenabstände.
- Saatgut- und Jungpflanzenberechnung.
- Produktionsziele.
- Zeitliche Staffelung.

Grasshopper war besonders wegen seiner parametrischen Arbeitsweise interessant.

Später wurde die Entwicklung in eine eigenständige Python-Anwendung überführt.

**Wichtige historische Unterscheidung:** Die Rhino-/Grasshopper-Kompatibilität blieb als mögliche Erweiterung bestehen. Die technische Implementierung wurde jedoch unabhängig von Rhino aufgebaut.

Eine vollständige Grasshopper-Definition für den späteren Market Garden Planner ist im verfügbaren Verlauf nicht nachgewiesen.

## **2.2 Phase 1 – Agronomischer Rechenkern**

Historisch berichtet wurde eine erste Python-Implementierung mit folgenden Funktionen:

| Bereich          | Funktion                            |
| ---------------- | ----------------------------------- |
| Kulturparameter  | Laden strukturierter Kulturdaten    |
| Mengenberechnung | Samen und Jungpflanzen              |
| Reihenberechnung | Reihenmeter und Reihenanzahl        |
| Flächenbedarf    | Erforderliche Beetfläche            |
| Validierung      | Prüfung von Eingaben und Parametern |
| Datenimport      | JSON-basierte Kulturprofile         |

Die Datenstruktur wurde auf nachvollziehbare agronomische Parameter ausgelegt.

Dazu gehörten unter anderem:

- Pflanzenart,
- Sorte,
- Anbauprofil,
- Produktionsziel,
- Anbausatz,
- Beet.

Ein Parameterkonzept mit `value`, `unit`, `source` und `status` wurde ebenfalls überliefert.

**Tests:** Für die frühe Phase wurden sieben Testgruppen berichtet.

Die genaue Zahl einzelner Tests und die vollständigen Testergebnisse liegen hier nicht vor.

## **2.3 Phase 2 – Scheduler**

Die zweite Entwicklungsphase erweiterte den Rechenkern um zeitliche Planung.

Historisch berichtet wurden:

- Produktionsziele in Kilogramm und Stück.
- Erntezeiträume.
- Versetzte Anbausätze.
- Rückwärtsberechnung von Aussaat- und Pflanzterminen.
- Vier Erntemodelle.
- Kalenderwochenbezogene Ernteprognosen.
- Beetfreigaben.
- Zeitliche Überlappungen.
- Wochenbezogener Flächenbedarf.
- Gebündelte Lagerernte.

Für diese Phase wurden 30 erfolgreiche Tests berichtet.

Außerdem entstand ein erster Kulturkatalog mit zehn Startkulturen und insgesamt 15 Anbauprofilen einschließlich saisonaler Varianten.

Als historische Quellen wurden unter anderem LWG Bayern, BLE/BZL und University of Minnesota Extension genannt.

**Einschränkung:** Die vollständigen Originalprofile und ihre Quellenzuordnung sind hier nicht verfügbar. Für verbindliche Aussagen zu einzelnen Kulturdaten müssen die aktuellen Repository-Dateien gelesen werden.

# **3. Phase 3A – Vom Rechenkern zur Benutzeroberfläche**

## **3.1 Phase 3A.1 – Erster funktionaler Prototyp**

**Ziel:** Die vorhandene Python-Logik erstmals in einer interaktiven Oberfläche darstellen.

Berichteter Funktionsumfang:

- React/TypeScript-Frontend.
- SVG-basierte Beetdarstellung.
- Sechs maßhaltige Demo-Beete.
- Zoomfunktion.
- Verbindung zum Python-Scheduler.
- Saison-Slider.
- Ernteinformationen.

Die erste Version verwendete synthetische Demo-Daten.

**Status:** Implementiert, getestet und historisch in Git gesichert.

Ein eindeutiger Commit-Hash für diese Phase liegt im hier verfügbaren Verlauf nicht vor.

## **3.2 Phase 3A.2 – Map-first-Oberfläche**

Die Benutzeroberfläche wurde anschließend stärker auf die Gartenkarte ausgerichtet.

Implementiert wurden laut historischem Bericht:

- großflächige Karte,
- schwebende Bedienelemente,
- Auswahl von Beeten,
- rechtes Detailpanel,
- Saison-Slider am unteren Bildschirmrand,
- unabhängiges verschiebbares Ernteprognose-Fenster.

Das Ernteprognose-Fenster reagierte auf die ausgewählte Kalenderwoche.

Die Demo blieb zunächst die Grundlage für die saisonale Darstellung.

**Status:** Implementiert und getestet.

Die genaue Testzahl dieser Phase ist nicht vollständig verfügbar.

# **4. Phase 3B – Räumliches Datenmodell und Geometrieeditor**

Dies ist die am ausführlichsten dokumentierte technische Entwicklungsphase vor der Kulturintegration.

## **4.1 Phase 3B.0 – Architekturprüfung**

Vor der Erweiterung um echte Projekte wurde die bestehende Architektur untersucht.

Historisch berichtete Dokumentationsarbeiten:

- `docs/ARCHITECTURE.md`
- `docs/ROADMAP.md`
- Aktualisierung von `docs/PRODUCT.md`
- Aktualisierung von `AGENTS.md`

**Ziel:** Die Entwicklung von der Demo zu einer dauerhaft speicherbaren Projektanwendung vorbereiten.

Die Architekturprüfung war eine Dokumentations- und Planungsphase, keine eigenständige neue Benutzerfunktion.

## **4.2 Phase 3B.1 – Spatial Geometry Core**

54 Python-Tests

12 Frontend-Tests historisch berichtet

**Ziel:** Ein eigenständiges metrisches Geometriemodell für Grundstücke und Beete schaffen.

Berichtete Funktionen:

- Grundstückspolygone mit Löchern.
- Rechteckige Beete mit beliebiger Rotation.
- Stabile UUIDs.
- Unveränderliche beziehungsweise kontrolliert aktualisierte Geometriedaten.
- Sperren.
- Revisionen.
- Shapely-basierte Validierung.
- Symmetrische und einseitige Breitenänderung.
- JSON-Roundtrip.
- Read-only-Adapter zum Scheduler.
- Erkennung veralteter Prognosen nach Geometrieänderungen.

**Git-Commit:** `bfca02b` – `Phase 3B.1: Spatial geometry core`

Die erfolgreiche Implementierung und die Tests wurden im historischen Verlauf berichtet.

Die vollständigen Testprotokolle liegen hier nicht vor.

## **4.3 Phase 3B.2 – SQLite und Projekt-API**

81 Python-Tests

12 Frontend-Tests historisch berichtet

**Ziel:** Dauerhafte Speicherung echter Gartenprojekte.

Implementiert wurden laut Codex-Bericht:

- SQLite-Projektspeicherung.
- Projekt anlegen.
- Projektliste laden.
- Projekt speichern und öffnen.
- Geometrieänderungen.
- Validierung.
- Erwartete Projektrevision.
- HTTP 409 bei Revisionskonflikten.
- Transaktionale Änderungen.
- Optionale idempotente Befehlskennungen.

Die API lief lokal unter:

`http://127.0.0.1:8766`

Der verwendete Startbefehl:

```
cd "~\Documents\MarketGardenPlanner"
.\.venv\Scripts\python.exe -B -m market_garden_planner.api.server
```

Als lokaler SQLite-Pfad wurde `.local/projects.sqlite3` berichtet.

**Git-Commit:** `106f30c` – `Phase 3B.2: SQLite persistence and project API`

### **Historisches Testproblem**

Bei einer frühen Prüfung erschien zunächst kein gespeichertes Projekt in der Auswahlliste.

Die Ursache war, dass die Projektliste noch leer war.

Daraufhin wurde ein Testprojekt angelegt:

**„Testgarten – Geometrie“**

Es enthielt:

- eine unregelmäßige Gartenfläche,
- sechs Beete,
- unterschiedliche Beetbreiten,
- mindestens ein um 17° gedrehtes Beet,
- ein Polygonloch.

Dieses Projekt diente anschließend als Grundlage für Browserprüfungen.

Eine weitere Besonderheit: Bei lokalen API-Links konnte ein angehängter Tracking-Parameter zu Fehlern führen. Für technische API-Prüfungen wurde deshalb empfohlen, die lokale Adresse direkt einzugeben oder `curl.exe` zu verwenden.

## **4.4 Phase 3B.3a – Darstellung gespeicherter Projekte**

**Ziel:** Die vorhandene React/SVG-Karte mit echten gespeicherten Projekten verbinden.

Berichteter Umfang:

- Projektauswahl.
- Darstellung unregelmäßiger Grundstücke.
- Darstellung von Polygonlöchern.
- Frei gedrehte Beete.
- Auswahl und Detailinformationen.
- Zoom.
- Read-only-Projektansicht.
- Strikte Trennung von Demo und gespeichertem Projekt.

### **UX-Korrektur**

Bei der Browserprüfung fiel auf, dass Maßbeschriftungen auf gedrehten Beeten teilweise auf dem Kopf standen.

Daraufhin wurde umgesetzt:

- Maßinformationen nur im Hover-Tooltip.
- Dauerhafte Beetnamen bleiben horizontal und aufrecht.
- Detailpanel unverändert.

Ein kleiner Beschriftungskonflikt bei Testbeet 04 wurde vom Nutzer erkannt, aber ausdrücklich für eine spätere allgemeine UI-Überarbeitung zurückgestellt.

**Tests:** Zuletzt 25 Frontend-Tests berichtet.

**Git-Commit:** `012cbc3` – `Phase 3B.3a: Project map visualization`

Der Commit wurde durch die im Gespräch übermittelte Git-Ausgabe bestätigt.

## **4.5 Phase 3B.3b – Interaktiver Beeteditor**

**Ziel:** Gespeicherte Beete direkt auf der Karte erstellen und verschieben.

Implementiert wurden:

- Beet zeichnen durch Vorgabe der Breite und Ziehen der Längsachse.
- Freie Winkel ohne Raster.
- Beet auswählen.
- Beet verschieben.
- Gesperrte Beete respektieren.
- Rote Vorschau für ungültige Geometrie.
- Speichern erst nach erfolgreicher Backend-Validierung.
- Revisionskonflikte ohne Überschreiben bestehender Daten.

Die endgültige Zeicheninteraktion wich von der ursprünglichen einfachen Rechteckidee ab.

Statt zwei gegenüberliegender Rechteckpunkte wurde eine Breite vorgegeben und die Längsachse frei gezogen.

Das ermöglichte beliebige Beetwinkel bereits beim Erstellen.

**Tests:** 87 Python-Tests und 36 Frontend-Tests.

TypeScript, Build und Browserprüfung wurden als erfolgreich gemeldet.

**Git-Status:** Die Phase wurde nach Nutzerprüfung gesichert. Der genaue Commit-Hash ist im verfügbaren Gespräch nicht enthalten.

## **4.6 Phase 3B.3c – Präzise Beetbearbeitung**

**Ziel:** Den geometrischen Editor um numerische und interaktive Bearbeitungsfunktionen ergänzen.

Implementiert wurden laut Codex-Bericht:

- Rotation über Griff.
- Numerische Winkel.
- Numerische Beetbreite und -länge.
- Numerische X-/Y-Mittelpunktkoordinaten.
- Löschen mit Bestätigung.
- Entf-Taste.
- Schutz gesperrter Beete.
- Validierung und revisionssichere Speicherung.

### **Nutzerprüfung**

Der Nutzer bestätigte ausdrücklich:

> „alles funktioniert“

Danach wurden zwei weitere UX-Verbesserungen gewünscht.

### **Zahlenformatierung**

Lange Fließkommazahlen sollten nicht mehr sichtbar sein.

**Beschlossene Regel:** Maximal zwei Nachkommastellen in der Anzeige, ohne Verlust der internen Genauigkeit.

### **Shift-Snapping**

Beim Drehen mit gedrückter Shift-Taste sollte der Winkel in 15°-Schritten einrasten.

Ohne Shift bleibt die Rotation frei.

Codex meldete die Umsetzung und ergänzte `DEC-028`.

**Tests nach Feinschliff:**

| Testbereich    | Ergebnis                       |
| -------------- | ------------------------------ |
| Python         | 95 bestanden                   |
| Frontend       | 57 bestanden                   |
| TypeScript     | Erfolgreich                    |
| Build          | Erfolgreich                    |
| Browserprüfung | Erfolgreich, mit Einschränkung |

Die Einschränkung betraf die physische Prüfung des Shift-Ziehens: Die Berechnung wurde automatisiert getestet, eine ausdrückliche Bestätigung der manuellen Shift-Prüfung durch den Nutzer liegt im Gespräch nicht vor.

**Git-Status:** Die Phase wurde laut späterer Gesprächsbestätigung gesichert. Der genaue Commit-Hash wurde nicht übermittelt.

# **5. Einführung des dauerhaften Entscheidungsarchivs**

Zwischen den Phasen 3B.3b und 3B.3c wurde die Projektdokumentation grundlegend erweitert.

## **5.1 Anlass**

Der Nutzer äußerte ausdrücklich die Sorge, dass wichtige Produktentscheidungen im Verlauf der Entwicklung verloren gehen könnten.

Besonders die Diskussion über die automatische Beetaufteilung und die Wegeeffizienz sollte dauerhaft festgehalten werden.

Daraus entstand die Vereinbarung, ein verbindliches Entscheidungsarchiv im Repository zu führen.

## **5.2 Umsetzung**

Codex erstellte:

`docs/DECISIONS.md`

und aktualisierte:

`AGENTS.md`

Der erste Bericht nannte 26 dokumentierte Entscheidungen.

Die Einträge enthielten laut Codex:

- stabile IDs,
- Datum beziehungsweise historische Einordnung,
- Status,
- Begründung,
- Auswirkungen,
- Quellen.

Zusätzlich wurde in `AGENTS.md` die Pflicht ergänzt, das Entscheidungsarchiv bei zukünftigen Entwicklungsaufträgen zu lesen und fortzuschreiben.

## **5.3 Git-Sicherung**

Der Commit wurde durch die im Gespräch übermittelte Git-Ausgabe bestätigt:

`f57d9b3` – `Docs: Add project decision log`

Die Ausgabe zeigte:

- zwei geänderte Dateien,
- 505 hinzugefügte Zeilen,
- neu angelegte `docs/DECISIONS.md`,
- sauberes Git-Arbeitsverzeichnis.

**Historische Bedeutung:** Ab diesem Zeitpunkt war die Entscheidungspflege nicht mehr nur eine informelle Chat-Aufgabe, sondern ein verbindlicher Bestandteil des Entwicklungsprozesses.

# **6. Phase 3C – Kulturplanung und Saisonintegration**

## **6.1 Phase 3C.1 – Kulturplanung und Beetzuweisung**

**Ziel:** Gespeicherte Beete mit agronomischen Anbauvorgängen verbinden.

Codex implementierte laut Bericht:

- Kulturwahl aus dem bestehenden Python-Katalog.
- Mehrere Anbauvorgänge je Beet.
- Anbauart.
- Aussaat- beziehungsweise Pflanzdatum.
- Optionalen geplanten Erntetermin.
- Bearbeiten und Entfernen.
- Stabile Vorgangs-IDs.
- SQLite-Speicherung.
- Revisionssichere API-Operationen.
- Schutz von Beeten mit bestehenden Anbauvorgängen vor versehentlichem Löschen.

Die SQLite-Datenbank wurde transaktional auf Schema-Version 2 migriert.

Der bestehende Scheduler und die Beetgeometrie blieben unverändert.

**Erster Teststand:** 106 Python-Tests und 66 Frontend-Tests bestanden.

TypeScript, Build und Browserprüfung wurden erfolgreich gemeldet.

### **UX-Problem: Zeitliche Überschneidungen**

Bei der Prüfung fiel auf, dass mehrere Anbauvorgänge auf demselben Beet denselben Zeitraum belegen konnten.

Daraufhin wurde entschieden:

- Überschneidungen erkennen.
- Betroffene Vorgänge kennzeichnen.
- Keine automatische Terminverschiebung.
- Mischkulturen weiterhin ermöglichen.
- Fehlende Erntetermine als unklar behandeln.

Codex implementierte eine Python-basierte Überschneidungsprüfung.

### **UX-Problem: Zu viel Scrollen**

Der Nutzer kritisierte außerdem, dass das rechte Detailpanel zu viel Platz beanspruchte.

Die Oberfläche wurde deshalb verdichtet:

- kompakte Kulturzeilen,
- kleinere Aktionen,
- einklappbare Geometrieinformationen,
- einklappbare Herkunftsinformationen,
- Scrollen nur bei entsprechend umfangreichen Inhalten.

**Abschließender berichteter Teststand:**

| Testbereich | Ergebnis                                |
| ----------- | --------------------------------------- |
| Python      | 115 bestanden                           |
| Frontend    | 73 bestanden                            |
| TypeScript  | Erfolgreich                             |
| Build       | Erfolgreich                             |
| Browser     | 560, 720 und 900 px Fensterhöhe geprüft |

Zusätzlich wurde ein Projekt mit zwölf Anbauvorgängen geprüft.

## **6.2 Git-Commit für Phase 3C.1**

Der Nutzer übermittelte eine vollständige Git-Ausgabe.

**Commit:** `a8192e8`

**Beschreibung:** `Phase 3C.1: Crop assignments and overlap detection`

Die Ausgabe bestätigte:

- 63 Dateien im Commit,
- 2.890 hinzugefügte Zeilen,
- 57 entfernte Zeilen,
- anschließend `nothing to commit, working tree clean`.

### **Besonderheit: Botanical ASCII im selben Commit**

Durch `git add .` wurden nicht nur die Änderungen der Kulturplanung, sondern auch zahlreiche Dateien aus dem Botanical ASCII Lab aufgenommen.

Darunter:

- Renderer-Dateien,
- Projektions- und Lichtmodule,
- Windmodule,
- Testseiten,
- QA-Snapshots,
- Screenshots,
- eigene Dokumentationsdateien.

Das ist für die Versionshistorie relevant.

**Feststellung:** Beide Entwicklungsbereiche befanden sich zu diesem Zeitpunkt innerhalb desselben Git-Repositories.

**Nicht daraus abzuleiten:** Dass Botanical ASCII bereits in den Market Garden Planner integriert war.

Der Commit enthält lediglich Dateien beider Entwicklungsbereiche.

Für spätere Entwicklungsaufträge wurde empfohlen, die Änderungen möglichst getrennt zu committen.

# **7. Phase 3C.2 – Saisonvisualisierung gespeicherter Projekte**

## **7.1 Ziel**

Die bereits vorhandene Saisonvisualisierung der Demo sollte mit den echten, gespeicherten Kulturzuweisungen verbunden werden.

Damit entstand erstmals ein durchgängiger Zusammenhang:

**Grundstück → Beet → Anbauvorgang → Kalenderwoche → zeitlicher Beetstatus**

## **7.2 Implementierte Funktionen**

Codex meldete:

- ISO-Kalenderwochenregler.
- Unterstützung von KW 53.
- Jahreswechsel.
- Python-basierte Wochenstatusberechnung.
- Kulturbeschriftungen auf den Beeten.
- Darstellung gleichzeitiger Anbauvorgänge.
- Kennzeichnung offener Belegungszeiträume.
- Synchronisierung von Karte, Tooltip und Detailpanel.
- Aktualisierung nach gespeicherten Kulturänderungen.

Wichtig war die Trennung zwischen zeitlicher Belegung und botanischer Entwicklung.

Die Saisonvisualisierung zeigt den geplanten Zustand eines Beetes, aber noch keine vollständige Pflanzenwachstumssimulation.

## **7.3 Technische Abgrenzung**

Codex berichtete ausdrücklich, dass folgende Bereiche unverändert blieben:

- Scheduler.
- SQLite-Datenformat.
- Beetgeometrie.

Die bestehende Demo blieb erhalten.

Nicht implementiert wurden in dieser Phase:

- neue Ernteprognose,
- Botanical-ASCII-Integration,
- automatische Beetaufteilung.

## **7.4 Tests**

126 Python-Tests

84 Frontend-Tests bestanden

Zusätzlich wurden erfolgreich berichtet:

- TypeScript-Prüfung,
- Build,
- Browserprüfung,
- Bearbeiten von Kulturterminen,
- Neuladen,
- Demo-Wechsel,
- Revisionskonflikte,
- API-Ausfall.

**Status:** Implementiert und getestet laut Codex.

Eine vollständige ausdrückliche Nutzerabnahme der gesamten Phase ist im verfügbaren Verlauf nicht dokumentiert.

# **8. UX-Feinschliff zu Phase 3C.2**

## **8.1 Anlass**

Bei einer Browserprüfung zeigte der Nutzer einen Screenshot des rechten Detailpanels.

Darin war die Bearbeitung eines Anbauvorgangs nicht eindeutig genug einer bestimmten Kultur zugeordnet.

Der Nutzer formulierte sinngemäß, dass „Anbauvorgang bearbeiten“ stärker wie eine Überschrift aussehen müsse und erkennbar sein solle, ob Karotten oder Spinat bearbeitet werden.

## **8.2 Beschlossene Anpassung**

- Aktive Kulturzeile salbeigrün hervorheben.
- Schmale Akzentlinie ergänzen.
- Dynamische Überschrift mit Kulturbezeichnung.
- Anbauart und Startdatum als Untertitel.
- Stabile Vorgangs-ID als Grundlage der Zuordnung.
- Hervorhebung nach Speichern, Abbrechen oder Beetwechsel entfernen.

Die Überschrift sollte beispielsweise lauten:

**„Karotten bearbeiten“**

anstatt lediglich:

„Anbauvorgang bearbeiten“.

## **8.3 Umsetzung**

Codex meldete die vollständige Implementierung.

Die Änderung wurde in `docs/phase3c2.md` dokumentiert und als `DEC-032` in das Entscheidungsarchiv aufgenommen.

**Tests:**

| Bereich    | Ergebnis               |
| ---------- | ---------------------- |
| Frontend   | 88 bestanden           |
| TypeScript | Erfolgreich            |
| Build      | Erfolgreich            |
| Browser    | 720 und 900 px geprüft |

Die Browserprüfung umfasste Speichern, Abbrechen und Beetwechsel.

**Status:** Implementiert und getestet laut Codex.

Ein abschließender Git-Commit für Phase 3C.2 wurde im verfügbaren Gespräch nicht bestätigt.

# **9. Git-Historie und gesicherte Entwicklungsstände**

Die folgende Tabelle enthält nur Commit-Hashes, die im verfügbaren Gespräch oder historischen Projektkontext konkret genannt wurden.

| Commit            | Phase                              | Historischer Status             |
| ----------------- | ---------------------------------- | ------------------------------- |
| `bfca02b`         | 3B.1 – Spatial Geometry Core       | Commit berichtet                |
| `106f30c`         | 3B.2 – SQLite und Projekt-API      | Commit berichtet                |
| `012cbc3`         | 3B.3a – Projektvisualisierung      | Git-Ausgabe vorhanden           |
| Nicht übermittelt | 3B.3b – Interaktiver Beeteditor    | Sicherung im Gespräch bestätigt |
| `f57d9b3`         | Entscheidungsarchiv                | Git-Ausgabe vorhanden           |
| Nicht übermittelt | 3B.3c – Präzise Beetbearbeitung    | Sicherung im Gespräch bestätigt |
| `a8192e8`         | 3C.1 – Kulturplanung               | Git-Ausgabe vorhanden           |
| Nicht bestätigt   | 3C.2 – Saisonvisualisierung und UX | Kein Commit-Nachweis            |

**Wichtig:** Die Reihenfolge der tatsächlich vorhandenen Commits muss bei Bedarf mit `git log` überprüft werden.

Die Tabelle ist eine historische Rekonstruktion, kein aktueller Git-Report.

## **9.1 Umgang mit Git**

Während der Entwicklung traten wiederholt folgende Warnungen auf:

`LF will be replaced by CRLF`

Diese Warnungen betrafen die Zeilenenden unter Windows und wurden als unkritisch eingeordnet.

Ein weiteres wiederkehrendes Problem war, dass PowerShell zunächst im Verzeichnis `C:\WINDOWS\System32` geöffnet wurde.

Dadurch meldete Git:

`fatal: not a git repository`

Die Lösung bestand darin, zuerst in den Projektordner zu wechseln:

```
cd "~\Documents\MarketGardenPlanner"
```

Danach funktionierten die Git-Befehle.

Es wurde ausdrücklich darauf hingewiesen, **kein neues Repository mit&#x20;**`git init`**&#x20;anzulegen**, da das bestehende Repository bereits vorhanden war.

# **10. Aktuelle technische Architektur – letzter bekannter Stand**

Rekonstruktion aus Codex-Berichten, keine erneute Quellcodeprüfung

**React / TypeScript**

Karte · Geometrieeditor · Kulturplanung · Saison-Slider

**Lokale HTTP-API**

Projektoperationen · Validierung · Revisionen

**Python Spatial**

Shapely · Polygone · Beete

**Python Agronomie**

Kulturkatalog · Scheduler · Wochenstatus

**SQLite**

Projekte · Beetgeometrien · Anbauvorgänge

**Botanical ASCII Lab**

Eigenständiges Visualisierungsexperiment · noch nicht integriert

## **10.1 Wichtige Architekturprinzipien**

Aus den bisherigen Entwicklungsaufträgen ergeben sich mehrere wiederkehrende Prinzipien:

**Ein zentraler Geometriekern:** Das Frontend soll nicht unabhängig eine zweite verbindliche Geometriewahrheit entwickeln.

**Ein zentraler Scheduler:** Die agronomische Berechnungslogik soll nicht im Frontend dupliziert werden.

**Revisionssichere Speicherung:** Änderungen müssen auf einem bekannten Projektstand beruhen und dürfen Konflikte nicht stillschweigend überschreiben.

**Trennung von Demo und Projekt:** Synthetische Demonstrationsdaten dürfen nicht unbemerkt in gespeicherte Gartenprojekte gelangen.

**Trennung von Agronomie und Darstellung:** Botanical ASCII soll nicht die fachliche Berechnung übernehmen.

Diese Prinzipien wurden wiederholt in Codex-Aufträgen verwendet. Ihre genaue verbindliche Formulierung muss anhand von `AGENTS.md`, `docs/ARCHITECTURE.md` und `docs/DECISIONS.md` überprüft werden.

# **11. Entwicklungs- und Testmethodik**

## **11.1 Zusammenarbeit zwischen ChatGPT und Codex**

Im Projekt entwickelte sich eine klare Arbeitsteilung.

**ChatGPT:**

- Produktideen strukturieren.
- Anforderungen präzisieren.
- Entscheidungen vorbereiten.
- Codex-Aufträge formulieren.
- Implementierungsberichte einordnen.
- Test- und Abnahmekriterien definieren.

**Codex:**

- Repository-Dateien lesen.
- Änderungen implementieren.
- Tests durchführen.
- Browserprüfungen ausführen.
- Projektdokumentation aktualisieren.
- Implementierungsberichte erstellen.

**Nutzer:**

- Produktentscheidungen treffen.
- Bedienung praktisch prüfen.
- Ergebnisse abnehmen oder Korrekturen verlangen.
- Implementierungsaufträge ausdrücklich freigeben.

Diese Rollenverteilung ist für die neue Projektstruktur verbindlich.

## **11.2 Kein automatischer Implementierungsauftrag durch Dokumentation**

Ein besonders wichtiger Grundsatz lautet:

**Eine dokumentierte Entscheidung ist keine automatische Freigabe zur Implementierung.**

Codex soll erst dann eine Funktion umsetzen, wenn ein entsprechender Entwicklungsauftrag ausdrücklich erteilt wurde.

Umgekehrt ist ein ausdrücklich erteilter Codex-Auftrag die Freigabe zur Umsetzung des beschriebenen Umfangs.

## **11.3 Testen vor dem Commit**

Die bisherige Arbeitsweise sah meist folgende Reihenfolge vor:

1. ChatGPT formuliert einen abgegrenzten Codex-Auftrag.
2. Codex implementiert die Funktion und aktualisiert die Dokumentation.
3. Codex führt automatisierte Tests und Browserprüfungen aus.
4. Der Nutzer prüft die Funktion selbst im Browser.
5. Bei Bedarf folgen gezielte UX-Korrekturen.
6. Erst anschließend wird der Stand in Git gesichert.

Diese Vorgehensweise hat sich insbesondere bei der Geometriebearbeitung und Kulturplanung bewährt.

Ein Git-Commit ist dabei eine Versionssicherung, aber nicht automatisch eine vollständige fachliche Abnahme.

# **12. Entwicklung der Testergebnisse**

Die Testzahlen zeigen die schrittweise Erweiterung der Anwendung.

| Phase                  | Python-Tests           | Frontend-Tests |
| ---------------------- | ---------------------- | -------------- |
| 3B.1                   | 54                     | 12             |
| 3B.2                   | 81                     | 12             |
| 3B.3a                  | 81\*                   | 25             |
| 3B.3b                  | 87                     | 36             |
| 3B.3c                  | 95                     | 48             |
| 3B.3c nach Feinschliff | 95                     | 57             |
| 3C.1                   | 106                    | 66             |
| 3C.1 nach UX-Korrektur | 115                    | 73             |
| 3C.2                   | 126                    | 84             |
| 3C.2 nach UX-Korrektur | Nicht erneut berichtet | 88             |

\*Für 3B.3a wurde die Python-Testzahl aus dem vorherigen Stand übernommen; ein eigenständiger neuer Python-Testbericht ist im verfügbaren Verlauf nicht vollständig belegt.

Diese Zahlen sind **berichtete Testergebnisse**.

Sie wurden nicht erneut durch Ausführung der aktuellen Tests verifiziert.

Außerdem sind Testzahlen keine Qualitätsgarantie. Sie dokumentieren lediglich, welche Prüfungen zum jeweiligen Zeitpunkt erfolgreich gemeldet wurden.

# **13. Bekannte Einschränkungen und technische Schulden**

Im Gespräch wurden verschiedene Punkte bewusst zurückgestellt.

## **13.1 Geometrieeditor**

Noch nicht als implementiert nachgewiesen:

- Undo/Redo.
- Feste Bezugskanten bei Maßänderungen.
- Vollständige interaktive Bearbeitung der Grundstückskontur.
- Erweiterte Hindernisobjekte außerhalb der Polygonloch-Repräsentation.

Ein kleiner Beschriftungskonflikt bei Testbeet 04 wurde ausdrücklich für eine spätere allgemeine UI-Überarbeitung akzeptiert.

## **13.2 Agronomie**

Noch nicht als vollständig implementiert nachgewiesen:

- Fachliche Mischkulturverträglichkeit.
- Automatische Korrektur zeitlicher Überlagerungen.
- Ernteprognose für gespeicherte Projekte.
- Erfassung tatsächlicher Ernten.
- Historische Ertragskalibrierung.
- Vollständige botanische Wachstumsmodelle.

Die vorhandene Überschneidungsprüfung ist eine zeitliche Prüfung, keine vollständige agronomische Verträglichkeitsanalyse.

## **13.3 Automatische räumliche Planung**

Noch nicht implementiert:

- Automatische Beetaufteilung.
- Vollständige Wegeoptimierung.
- Variantenvergleich.
- Bake-Funktion.
- GIS-/Satellitenkartenimport.

Diese Funktionen gehören zur bestätigten beziehungsweise diskutierten langfristigen Produktentwicklung, sind aber nicht Teil des letzten berichteten Implementierungsstands.

## **13.4 Visualisierung**

Das Botanical ASCII Lab wurde unabhängig weiterentwickelt.

Eine Integration in den Market Garden Planner wurde noch nicht berichtet.

Ebenso ist eine vollständige perspektivische beziehungsweise isometrische Hauptansicht nicht nachgewiesen.

# **14. Letzter bekannter Projektstand und nächster historischer Entwicklungsschritt**

## **14.1 Letzter bekannter Stand**

Zum Ende des hier ausgewerteten Gesprächs war Phase 3C.2 einschließlich des UX-Feinschliffs laut Codex umgesetzt.

Die zuletzt berichteten Ergebnisse waren:

Python-Tests

# **126**

Letzter berichteter vollständiger Stand

Frontend-Tests

# **88**

Nach UX-Feinschliff

TypeScript und Build waren erfolgreich.

Der zuletzt ausdrücklich bestätigte Git-Commit war:

`a8192e8` – Phase 3C.1.

Für Phase 3C.2 liegt im verfügbaren Gespräch kein bestätigter Git-Commit vor.

## **14.2 Historisch vorgesehene nächste Phase**

Als nächster Entwicklungsschritt war **Phase 3C.3 – Ernteprognose für gespeicherte Projekte** vorgesehen.

Das Ziel war, den vorhandenen Scheduler mit den realen Beetflächen und gespeicherten Kulturzuweisungen zu verbinden.

Die Prognose sollte im bestehenden frei verschiebbaren Ernteprognose-Fenster erscheinen und auf die ausgewählte Kalenderwoche reagieren.

Besonders wichtig:

- Keine erfundenen Erträge.
- Nachvollziehbare Datenquellen.
- Trennung zwischen geplanten Terminen, berechneten Prognosen und tatsächlichen Ernten.
- Berücksichtigung mehrerer Anbauvorgänge.
- Keine zweite unabhängige Scheduler-Implementierung.

**Status:** Historisch geplanter nächster Schritt, kein in diesem Teil erteilter Implementierungsauftrag.

Vor einer tatsächlichen Umsetzung muss die aktuelle Roadmap geprüft werden.

# **15. Übergabe an die vier neuen Fachchats**

Dieser Abschnitt fasst zusammen, welche Informationen aus der gesamten vierteiligen Übergabe in welchen Fachchat gehören.

## **01 – Produktvision & Ideensammlung**

**Primäre Inhalte aus Teil 1:**

- Ursprung und langfristige Produktvision.
- Manuelle und automatische Gartenplanung.
- Parametrische Beet- und Wegegestaltung.
- Agronomische Produktionsplanung.
- Map-first-Bedienkonzept.
- Monochrome Living Landscape.
- Botanical ASCII.
- Tilt-Shift-/Miniaturmodell-Ästhetik.
- GIS-Import.
- Produktnamen.

**Aus Teil 2 ergänzen:** Die Begründungen bereits bestätigter Produktentscheidungen.

**Aus Teil 3 ergänzen:** Zurückgestellte Ideen und noch nicht ausgearbeitete Funktionen.

**Aus Teil 4 ergänzen:** Den technischen Ist-Stand, damit neue Ideen nicht bereits vorhandene Funktionen ignorieren.

## **02 – Entscheidungsarchiv**

**Primäre Inhalte aus Teil 2:**

- 28 historische Entscheidungsreferenzen.
- Kontext und Begründungen.
- Bestätigte Produktprinzipien.
- Historische Änderungen.
- Unterschiede zwischen Beschluss, Implementierung, Test und Abnahme.

**Aus Teil 1 ergänzen:** Ursprung und gestalterische Zusammenhänge.

**Aus Teil 3 ergänzen:** Noch offene Details bereits beschlossener Grundprinzipien.

**Aus Teil 4 ergänzen:** Implementierungsnachweise, Codex-Berichte und Git-Commits.

Die aktuelle Datei `docs/DECISIONS.md` bleibt verbindlich.

## **03 – Offene Entscheidungen**

**Primäre Inhalte aus Teil 3:**

- 28 historische offene Themen.
- Abhängigkeiten.
- Ungeklärte Varianten.
- Zurückgestellte Funktionen.
- Noch nicht spezifizierte technische und fachliche Fragen.

**Aus Teil 1 ergänzen:** Produktvision und Nutzungsziele.

**Aus Teil 2 ergänzen:** Bereits festgelegte Grenzen und Anforderungen.

**Aus Teil 4 ergänzen:** Technische Voraussetzungen und vorhandene Implementierungen.

Die aktuelle Datei `docs/OPEN_QUESTIONS.md` bleibt verbindlich.

## **04 – Technische Entwicklungsplanung**

**Primäre Inhalte aus Teil 4:**

- Architekturentwicklung.
- Entwicklungsphasen 1, 2, 3A, 3B und 3C.
- Codex-Aufträge und Umsetzungsergebnisse.
- Testzahlen.
- Git-Historie.
- Bekannte Einschränkungen.
- Letzter berichteter Implementierungsstand.
- Trennung von Codex-Umsetzung und Nutzerabnahme.

**Aus Teil 1 ergänzen:** Die Produktvision als Zielrahmen.

**Aus Teil 2 ergänzen:** Verbindliche Architektur- und Produktentscheidungen.

**Aus Teil 3 ergänzen:** Offene Fragen und Abhängigkeiten, die vor weiteren Implementierungen geklärt werden müssen.

# **16. Erforderlicher Abgleich mit dem aktuellen Repository**

Vor einer verbindlichen Übernahme der historischen Übergabe sollte der aktuelle Dokumentationsstand geprüft werden.

| Repository-Datei                   | Bedeutung für den Abgleich                          |
| ---------------------------------- | --------------------------------------------------- |
| `AGENTS.md`                        | Zusammenarbeit, Codex-Regeln, Dokumentationspflicht |
| `docs/PRODUCT.md`                  | Aktuelle Produktanforderungen                       |
| `docs/DECISIONS.md`                | Verbindliche Entscheidungen und DEC-IDs             |
| `docs/OPEN_QUESTIONS.md`           | Offene Fragen und OQ-IDs                            |
| `docs/ARCHITECTURE.md`             | Tatsächliche Systemarchitektur                      |
| `docs/ROADMAP.md`                  | Aktuelle Entwicklungsphasen und Reihenfolge         |
| `docs/phase3c1.md`                 | Kulturplanung und Überschneidungsprüfung            |
| `docs/phase3c2.md`                 | Saisonvisualisierung und UX-Feinschliff             |
| `experiments/botanical-ascii-lab/` | Eigenständige Visualisierungsexperimente            |

**Wichtig:** Die Übergabe enthält keine Aufforderung, diese Dateien jetzt zu verändern.

Erst nach dem Abgleich lässt sich zuverlässig feststellen, ob historische Informationen fehlen, bereits dokumentiert sind oder inzwischen durch spätere Entscheidungen ersetzt wurden.

# **17. Abschließende Einordnung**

Die Entwicklung des Market Garden Planners lässt sich anhand des bisherigen Gesprächs in drei wesentliche Bewegungen einordnen.

**Erstens: Vom parametrischen Geometriewerkzeug zum vollständigen Anbauplaner.** Die ursprüngliche Grasshopper-Idee wurde um Produktionsziele, Kulturprofile, zeitliche Planung und Ernteprognosen erweitert.

**Zweitens: Von der Demo zur eigenständigen Projektanwendung.** Mit Python, React, SVG, SQLite und einer revisionssicheren API entstand eine technische Grundlage für echte gespeicherte Gartenprojekte.

**Drittens: Von einzelnen Funktionen zu einer langfristigen Produktarchitektur.** Die Einführung des Entscheidungsarchivs, die Trennung von Agronomie und Visualisierung sowie die klare Rolle von Codex und ChatGPT schaffen die Voraussetzung für eine nachvollziehbare Weiterentwicklung.

Besonders charakteristisch für das Projekt sind drei miteinander verbundene Ziele:

- **Räumliche Präzision:** Frei bearbeitbare, maßhaltige Garten- und Beetgeometrie.
- **Betriebliche Effizienz:** Gemeinsame Optimierung von Anbaufläche, Arbeitswegen und Zugänglichkeit.
- **Lebendige Darstellung:** Eine reduzierte, eigenständige visuelle Sprache, die die zeitliche Entwicklung des Gartens sichtbar machen kann.

Diese Ziele bilden den historischen Kern der Produktvision. Ihre konkrete Umsetzung ist unterschiedlich weit fortgeschritten und muss weiterhin sauber nach Status unterschieden werden.

**Historische Übergabe abgeschlossen – Teile 1 bis 4**

Die vierteilige Auswertung umfasst:

1. Produktvision, Funktionen, UX und Botanical ASCII.
2. 28 historische Entscheidungsreferenzen mit Begründungen.
3. 28 historische offene Themen und Abhängigkeiten.
4. Technische Entwicklung, Codex-Berichte, Tests und Git-Historie.

**Status:** Historische Rekonstruktion erstellt. Noch kein Abgleich mit den aktuellen Repository-Dateien durchgeführt. Keine neuen Produktentscheidungen getroffen und keine Implementierungsaufträge erteilt.
