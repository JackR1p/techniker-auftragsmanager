# FieldOps · Service Demo

Eine unabhängige, fiktive Demo für den Außendienst: Techniker:innen öffnen einen Serviceauftrag, erfassen Prüfpunkte und Zählerstand und können den Auftrag erst nach erfolgreicher Pflichtprüfung abschließen. Es gibt weder ein Backend noch eine Synchronisation. Änderungen werden nur im localStorage des aktuellen Browsers gespeichert.

## Starten

Voraussetzung: Node.js `>=22.18` oder `>=24.12`.

```sh
npm install
npx playwright install chromium
npm run dev
```

Vite zeigt die lokale URL im Terminal an. Die verfügbaren Qualitätschecks:

```sh
npm run type-check
npm test
npm run test:e2e
npm run build
```

Playwright startet den Vite-Entwicklungsserver automatisch. Die E2E-Suite läuft mit Chromium in einem Desktop- und einem mobilen Viewport. Jeder Test setzt die Demo über die sichtbare Reset-Aktion zurück. Bei Fehlern wird ein Playwright-Trace behalten; lokal lässt er sich mit `npx playwright show-trace <trace.zip>` öffnen.

## Architektur und Entscheidungen

- `src/domain/` enthält das typisierte Auftragsmodell, reine Messwert-/Abschlussvalidierung und erlaubte Statusübergänge. Die Oberfläche ist nicht die einzige Stelle, die den Abschluss absichert.
- `src/data/workOrderRepository.ts` definiert das kleine Repository-Interface und dessen localStorage-Implementierung. Eine spätere API-Implementierung kann dieselbe Schnittstelle bedienen. Die drei Demo-Aufträge haben stabile, semantische IDs.
- `src/components/` trennt Auftragsliste und Auftragsdetail. `src/App.vue` verbindet UI-Aktionen, Domänenregeln und Persistenz; ein Store-Framework oder Router wäre für diese zwei Ansichten zusätzlicher Aufwand ohne MVP-Nutzen.
- Das Zählerfeld akzeptiert Punkt oder Komma, Werte von `0` bis `999.999,9 kWh` (inklusive) und höchstens eine Nachkommastelle. Es verwendet bewusst ein Textfeld mit numerischer mobiler Tastatur, damit auch fehlerhafte Eingaben verständlich geprüft und angezeigt werden können.
- „Demo zurücksetzen“ entfernt ausschließlich den App-Datensatz aus localStorage und lädt die drei Seeds erneut. So sind manuelle Tests und E2E-Läufe reproduzierbar.
- Bei beschädigten gespeicherten Daten erscheint ein Fehler statt eines stillen Rückfalls. Die Demo behauptet keine Offline-Synchronisation und führt keine Netzwerkaufrufe aus.

## Teststrategie

Vitest prüft Grenzwerte, ungültige Messwerte, Pflichtangaben und Statuswechsel unabhängig von Vue. Playwright deckt die Auftragsliste, unvollständige/ungültige Abschlüsse, einen erfolgreichen Grenzwert-Abschluss und Persistenz nach Reload ab. Die Suite startet vor jedem Test mit denselben Seed-Daten und prüft zusätzlich, dass die Oberfläche in den konfigurierten Viewports horizontal nicht überläuft.

## Mögliche Abbildung auf OutSystems

Dies ist keine OutSystems-Anwendung, sondern ein unabhängiger Prototyp. Als Gesprächsgrundlage ließen sich die Teile später etwa so abbilden:

| Demo | Mögliche OutSystems-Entsprechung |
| --- | --- |
| `WorkOrder` und drei Seeds | Entity/Struktur plus Server-seitig bereitgestellte Datensätze |
| `WorkOrderList` / `WorkOrderDetail` | Reactive-Web-/PWA-Screens und wiederverwendbare UI-Elemente |
| Checkliste und Statuswechsel | Client Actions für Interaktion plus serverseitige Geschäftsregeln |
| `validateWorkOrderCompletion` | gemeinsame Fachregeln; Abschluss zusätzlich serverseitig erzwingen |
| localStorage-Repository | temporärer lokaler Entwurf; spätere Persistenz über Actions/API und definierte Konflikt-/Synchronisationsregeln |
| Playwright-E2E | automatisierte Browserprüfung des kritischen Techniker-Workflows; ergänzend wären Plattform-/Gerätetests sinnvoll |

Für einen realen Außendienstbetrieb müssten insbesondere Autorisierung, serverseitige Validierung, Auditierung, Konfliktbehandlung und Offline-Synchronisation separat entworfen und getestet werden.
