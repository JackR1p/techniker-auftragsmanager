# Interview-Notizen · FieldOps Demo

## 2-Minuten-Vorstellung

> Ich habe einen kleinen, unabhängigen Prototyp für einen Außendienst-Workflow gebaut. Ein Techniker wählt einen fiktiven Serviceauftrag aus, startet ihn, bestätigt drei Pflichtprüfungen und erfasst einen Zählerstand. Der Auftrag lässt sich erst abschließen, wenn alle Angaben gültig sind. Es gibt absichtlich kein Backend: Der aktuelle Stand liegt lokal im Browser und kann jederzeit reproduzierbar zurückgesetzt werden.
>
> Mir war wichtig, Fachregeln nicht in Click-Handlern oder Formular-Markup zu verstecken. Die Messwertvalidierung und Statusübergänge sind reine TypeScript-Funktionen. Das macht Grenzwerte wie `0` und `999.999,9`, ungültige Werte und verbotene Statuswechsel unabhängig von der Oberfläche testbar. Das kleine Repository kapselt localStorage, sodass ich später eine API-Implementierung einsetzen könnte, ohne die UI an einen bestimmten Speicher zu koppeln.
>
> Für die Qualität gibt es zwei Ebenen: Vitest testet die Domänenregeln schnell und gezielt. Playwright prüft den vollständigen Ablauf im Browser – einschließlich Pflichtfeldfehlern, erfolgreichem Abschluss und Persistenz nach einem Reload – in Desktop- und mobiler Chromium-Größe. Die Tests starten mit einem Reset-Button immer auf demselben Datenstand, und bei einem E2E-Fehler wird ein Trace aufgehoben.
>
> In einer produktiven OutSystems-PWA würde ich diese Fachregeln nicht nur im Client ausführen. Ich würde den Abschluss serverseitig absichern, Berechtigungen und Auditierung ergänzen und Offline-Speicherung sowie Konflikt- und Synchronisationsregeln bewusst entwerfen. Der Prototyp beansprucht das nicht; er zeigt den testbaren Kernablauf.

## Architektur verteidigen

### Warum kein Pinia und kein Router?

Es gibt drei Aufträge und genau zwei Ansichten. Ein lokaler Screen-Zustand in `App.vue` ist hier ausreichend. Zusätzlicher globaler Store oder Routing-Schicht würden Abhängigkeiten und Konfiguration einführen, ohne den MVP-Workflow zu vereinfachen. Mit wachsendem Umfang könnte man die Zuständigkeiten neu bewerten.

### Warum ein Repository-Interface?

Die Oberfläche spricht mit `WorkOrderRepository`, nicht direkt mit localStorage. Das hält Persistenzdetails aus den Komponenten heraus und macht den Wechsel zu einem API-Adapter klein. Das Interface ist bewusst minimal und nicht als generisches Datenzugriffs-Framework gedacht.

### Warum wird der Abschluss im Domain-Modul geprüft?

Ein deaktivierter Button wäre nur UX und kein belastbarer Schutz. Die reine Übergangsfunktion erlaubt `in-progress → completed` nur mit vollständiger Checkliste und gültigem Messwert; die UI verwendet dieselbe Validierung für verständliche Fehlermeldungen. Für ein echtes Backend muss dieselbe Regel serverseitig nochmals verbindlich gelten.

### Warum hat das Messfeld den Typ Text?

Ein Browser-Zahlenfeld kann ungültige oder teilweise eingegebene Werte je nach Browser unterschiedlich behandeln. Ein Textfeld mit `inputmode="decimal"` zeigt auf Mobilgeräten eine passende Tastatur, während die Fachfunktion Eingaben wie Buchstaben, negative Werte, zu viele Nachkommastellen und Bereichsüberschreitungen kontrolliert meldet. Punkt und deutsches Dezimalkomma werden angenommen.

### Was leisten die Tests?

- Unit-Tests: Werteformat, inklusive untere/obere Grenze, Pflichtdaten sowie erlaubte und unerlaubte Übergänge.
- Browser-Tests: Auswahl, Sperre bei fehlenden/ungültigen Daten, erfolgreicher Abschluss und localStorage-Persistenz nach Reload.
- Desktop- und Mobile-Chromium-Projekte verwenden dieselben deterministischen Szenarien. Der Reset-Button setzt Browserdaten vor jedem Test zurück; die Tests verwenden Locator über Rollen und Labels statt fragile CSS-Strukturen.

## Bewusste Grenzen

- localStorage ist geräte- und browserlokal, nicht verschlüsselt und kein Ersatz für eine Datenbank. Es gibt keinen Server, keine Anmeldung und keine Synchronisation.
- Fehlerhafte gespeicherte JSON-Daten werden sichtbar gemeldet; der Nutzer kann die Demo gezielt zurücksetzen.
- Fiktive Seeds sind statisch, damit manuelle Vorführungen und Tests reproduzierbar bleiben.
- Die OutSystems-Tabelle im README ist eine mögliche Übersetzung der Konzepte, keine Behauptung, dass dieser Vue-Prototyp OutSystems-Komponenten oder SWM-Systeme verwendet.
