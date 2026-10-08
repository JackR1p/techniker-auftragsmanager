<script setup lang="ts">
import type { WorkOrder, WorkOrderChecklist, WorkOrderStatus } from '../domain/workOrder'

defineProps<{
  workOrder: WorkOrder
  errors: string[]
  feedbackMessage: string
}>()

const emit = defineEmits<{
  back: []
  updateChecklist: [key: keyof WorkOrderChecklist, value: boolean]
  updateMeterReading: [value: string]
  changeStatus: [status: WorkOrderStatus]
}>()

const statusLabels: Record<WorkOrderStatus, string> = {
  open: 'Offen',
  'in-progress': 'In Bearbeitung',
  completed: 'Abgeschlossen',
}

const checklistItems: { key: keyof WorkOrderChecklist; label: string; detail: string }[] = [
  { key: 'safetyCheck', label: 'Sicherheitsprüfung durchgeführt', detail: 'Arbeitsbereich und Anlage geprüft' },
  { key: 'meterInstallation', label: 'Zähler installiert und geprüft', detail: 'Einbau und Anschluss kontrolliert' },
  { key: 'documentationConfirmed', label: 'Foto und Dokumentation bestätigt', detail: 'Arbeitsschritte nachvollziehbar dokumentiert' },
]

function handleMeterInput(event: Event) {
  emit('updateMeterReading', (event.target as HTMLInputElement).value)
}
</script>

<template>
  <section class="detail-view" aria-labelledby="detail-title">
    <button class="back-link" type="button" @click="emit('back')">
      <span aria-hidden="true">←</span> Alle Aufträge
    </button>

    <div class="detail-heading">
      <div>
        <p class="eyebrow">{{ workOrder.id }} · Serviceeinsatz</p>
        <h1 id="detail-title">{{ workOrder.title }}</h1>
        <p class="page-intro">{{ workOrder.customer }} <span aria-hidden="true">·</span> {{ workOrder.address }}</p>
      </div>
      <span class="status-pill" :class="`status-${workOrder.status}`">
        <span class="status-dot" aria-hidden="true"></span>
        {{ statusLabels[workOrder.status] }}
      </span>
    </div>

    <p v-if="feedbackMessage" class="notice notice-success" role="status">{{ feedbackMessage }}</p>

    <div v-if="workOrder.status === 'open'" class="start-panel">
      <div class="start-icon" aria-hidden="true">↗</div>
      <div>
        <h2>Bereit für den Einsatz?</h2>
        <p>Starte den Auftrag, um die Prüfpunkte und den Zählerstand zu erfassen.</p>
      </div>
      <button class="button button-primary" type="button" @click="emit('changeStatus', 'in-progress')">
        Auftrag beginnen
      </button>
    </div>

    <form v-else-if="workOrder.status === 'in-progress'" class="inspection-form" @submit.prevent="emit('changeStatus', 'completed')">
      <section class="form-section" aria-labelledby="checklist-title">
        <div class="section-heading">
          <div>
            <p class="eyebrow">Schritt 1 · Prüfung</p>
            <h2 id="checklist-title">Checkliste</h2>
          </div>
          <span class="section-number">01</span>
        </div>

        <div class="checklist">
          <label v-for="item in checklistItems" :key="item.key" class="check-row">
            <input
              type="checkbox"
              :checked="workOrder.checklist[item.key]"
              @change="emit('updateChecklist', item.key, ($event.target as HTMLInputElement).checked)"
            />
            <span class="check-indicator" aria-hidden="true">
              <svg viewBox="0 0 16 16" fill="none"><path d="m3.5 8 3 3 6-6" /></svg>
            </span>
            <span class="check-copy">
              <strong>{{ item.label }}</strong>
              <small>{{ item.detail }}</small>
            </span>
          </label>
        </div>
      </section>

      <section class="form-section meter-section" aria-labelledby="meter-title">
        <div class="section-heading">
          <div>
            <p class="eyebrow">Schritt 2 · Messwert</p>
            <h2 id="meter-title">Zählerstand erfassen</h2>
          </div>
          <span class="section-number">02</span>
        </div>
        <label class="field-label" for="meter-reading">Zählerstand (kWh)</label>
        <div class="input-with-unit">
          <input
            id="meter-reading"
            name="meter-reading"
            type="text"
            inputmode="decimal"
            autocomplete="off"
            placeholder="z. B. 184,6"
            :value="workOrder.meterReading"
            :aria-invalid="errors.length > 0 && errors.some((error) => error.includes('Zählerstand'))"
            aria-describedby="meter-help"
            @input="handleMeterInput"
          />
          <span aria-hidden="true">kWh</span>
        </div>
        <p id="meter-help" class="field-hint">Erlaubter Bereich: 0 bis 999.999,9 kWh · max. 1 Nachkommastelle</p>
      </section>

      <div v-if="errors.length" class="notice notice-error validation-summary" role="alert" aria-labelledby="validation-title">
        <strong id="validation-title">Noch nicht abschließbar</strong>
        <ul>
          <li v-for="error in errors" :key="error">{{ error }}</li>
        </ul>
      </div>

      <div class="form-actions">
        <p>Alle Prüfpunkte und der Zählerstand sind erforderlich.</p>
        <button class="button button-primary button-complete" type="submit">Auftrag abschließen</button>
      </div>
    </form>

    <div v-else class="completed-panel">
      <div class="completed-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none"><path d="m5 12 4.5 4.5L19 7" /></svg>
      </div>
      <div>
        <h2>Auftrag vollständig dokumentiert</h2>
        <p>Zählerstand: <strong>{{ workOrder.meterReading }} kWh</strong></p>
      </div>
    </div>
  </section>
</template>
