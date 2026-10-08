<script setup lang="ts">
import type { WorkOrder, WorkOrderStatus } from '../domain/workOrder'

defineProps<{ orders: WorkOrder[] }>()
defineEmits<{ select: [id: string] }>()

const statusLabels: Record<WorkOrderStatus, string> = {
  open: 'Offen',
  'in-progress': 'In Bearbeitung',
  completed: 'Abgeschlossen',
}
</script>

<template>
  <section aria-labelledby="page-title">
    <div class="page-heading">
      <div>
        <p class="eyebrow">Dein Arbeitstag</p>
        <h1 id="page-title">Serviceaufträge</h1>
        <p class="page-intro">Prüfe deine Einsätze und dokumentiere deine Arbeit vor Ort.</p>
      </div>
      <span class="order-count" aria-label="Anzahl Aufträge">{{ orders.length }} Aufträge</span>
    </div>

    <div class="order-list" aria-label="Auftragsliste">
      <button
        v-for="order in orders"
        :key="order.id"
        class="order-card"
        type="button"
        :aria-label="`${order.title}, ${statusLabels[order.status]}, Auftrag ${order.id}`"
        @click="$emit('select', order.id)"
      >
        <span class="order-card-top">
          <span class="order-id">{{ order.id }}</span>
          <span class="status-pill" :class="`status-${order.status}`">
            <span class="status-dot" aria-hidden="true"></span>
            {{ statusLabels[order.status] }}
          </span>
        </span>
        <span class="order-card-title">{{ order.title }}</span>
        <span class="order-card-customer">{{ order.customer }}</span>
        <span class="order-card-address">
          <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
            <path d="M16 8.3c0 4.2-6 9-6 9s-6-4.8-6-9a6 6 0 1 1 12 0Z" />
            <circle cx="10" cy="8" r="2" />
          </svg>
          {{ order.address }}
        </span>
        <span class="card-arrow" aria-hidden="true">↗</span>
      </button>
    </div>
  </section>
</template>
