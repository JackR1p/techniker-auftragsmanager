export type WorkOrderStatus = 'open' | 'in-progress' | 'completed'

export interface WorkOrderChecklist {
  safetyCheck: boolean
  meterInstallation: boolean
  documentationConfirmed: boolean
}

export interface WorkOrder {
  id: string
  title: string
  customer: string
  address: string
  status: WorkOrderStatus
  checklist: WorkOrderChecklist
  meterReading: string
}

export type StatusTransitionResult =
  | { ok: true; workOrder: WorkOrder }
  | { ok: false; reason: string; errors?: string[] }

export function transitionWorkOrderStatus(
  workOrder: WorkOrder,
  nextStatus: WorkOrderStatus,
): StatusTransitionResult {
  if (workOrder.status === 'open' && nextStatus === 'in-progress') {
    return { ok: true, workOrder: { ...workOrder, status: nextStatus } }
  }

  if (workOrder.status === 'in-progress' && nextStatus === 'completed') {
    const errors = validateWorkOrderCompletion(workOrder)
    if (errors.length) {
      return {
        ok: false,
        reason: 'Der Auftrag kann erst nach allen Pflichtangaben abgeschlossen werden.',
        errors,
      }
    }
    return { ok: true, workOrder: { ...workOrder, status: nextStatus } }
  }

  return {
    ok: false,
    reason: `Der Status kann nicht von „${workOrder.status}“ nach „${nextStatus}“ wechseln.`,
  }
}
import { validateWorkOrderCompletion } from './workOrderValidation'
