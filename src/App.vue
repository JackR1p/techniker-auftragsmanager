<script setup lang="ts">
import { computed, ref } from 'vue'
import WorkOrderDetail from './components/WorkOrderDetail.vue'
import WorkOrderList from './components/WorkOrderList.vue'
import { createWorkOrderRepository } from './data/workOrderRepository'
import type { WorkOrder, WorkOrderChecklist, WorkOrderStatus } from './domain/workOrder'
import { transitionWorkOrderStatus } from './domain/workOrder'
import { validateWorkOrderCompletion } from './domain/workOrderValidation'

const repository = createWorkOrderRepository()
const orders = ref<WorkOrder[]>([])
const selectedId = ref<string | null>(null)
const completionErrors = ref<string[]>([])
const feedbackMessage = ref('')
const errorMessage = ref('')

try {
  orders.value = repository.getAll()
} catch (error) {
  errorMessage.value =
    error instanceof Error ? error.message : 'Die Demo-Daten konnten nicht geladen werden.'
}

const selectedOrder = computed(() =>
  orders.value.find((order) => order.id === selectedId.value),
)

function persist(updated: WorkOrder) {
  try {
    repository.save(updated)
    orders.value = orders.value.map((order) => (order.id === updated.id ? updated : order))
    errorMessage.value = ''
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Die Änderung konnte nicht gespeichert werden.'
  }
}

function updateChecklist(key: keyof WorkOrderChecklist, value: boolean) {
  const order = selectedOrder.value
  if (!order || order.status === 'completed') return
  completionErrors.value = []
  persist({ ...order, checklist: { ...order.checklist, [key]: value } })
}

function updateMeterReading(value: string) {
  const order = selectedOrder.value
  if (!order || order.status === 'completed') return
  completionErrors.value = []
  persist({ ...order, meterReading: value })
}

function changeStatus(nextStatus: WorkOrderStatus) {
  const order = selectedOrder.value
  if (!order) return

  if (nextStatus === 'completed') {
    const errors = validateWorkOrderCompletion(order)
    if (errors.length) {
      completionErrors.value = errors
      feedbackMessage.value = ''
      return
    }
  }

  const result = transitionWorkOrderStatus(order, nextStatus)
  if (!result.ok) {
    feedbackMessage.value = result.reason
    return
  }

  completionErrors.value = []
  feedbackMessage.value =
    nextStatus === 'completed' ? 'Auftrag erfolgreich abgeschlossen.' : 'Auftrag begonnen.'
  persist(result.workOrder)
}

function resetDemo() {
  try {
    orders.value = repository.reset()
    selectedId.value = null
    completionErrors.value = []
    feedbackMessage.value = 'Demo-Daten wurden zurückgesetzt.'
    errorMessage.value = ''
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Die Demo-Daten konnten nicht zurückgesetzt werden.'
  }
}
</script>

<template>
  <div class="app-shell">
    <header class="topbar">
      <a class="brand" href="#" aria-label="FieldOps Demo Startseite" @click.prevent="selectedId = null">
        <span class="brand-mark" aria-hidden="true">F</span>
        <span>
          <strong>FieldOps</strong>
          <small>Service Demo</small>
        </span>
      </a>
      <button class="button button-quiet reset-button" type="button" @click="resetDemo">
        Demo zurücksetzen
      </button>
    </header>

    <main class="main-content">
      <p v-if="errorMessage" class="notice notice-error" role="alert">{{ errorMessage }}</p>
      <p v-else-if="feedbackMessage && !selectedOrder" class="notice notice-success" role="status">
        {{ feedbackMessage }}
      </p>

      <WorkOrderDetail
        v-if="selectedOrder"
        :work-order="selectedOrder"
        :errors="completionErrors"
        :feedback-message="feedbackMessage"
        @back="selectedId = null; completionErrors = []; feedbackMessage = ''"
        @update-checklist="updateChecklist"
        @update-meter-reading="updateMeterReading"
        @change-status="changeStatus"
      />
      <WorkOrderList
        v-else
        :orders="orders"
        @select="selectedId = $event; feedbackMessage = ''"
      />
    </main>
    <footer class="app-footer">
      <span>Unabhängige Demo mit fiktiven Aufträgen</span>
      <span>Alle Änderungen bleiben auf diesem Gerät</span>
    </footer>
  </div>
</template>
