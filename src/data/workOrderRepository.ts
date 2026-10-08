import type { WorkOrder } from '../domain/workOrder'

export interface WorkOrderRepository {
  getAll(): WorkOrder[]
  getById(id: string): WorkOrder | undefined
  save(workOrder: WorkOrder): void
  reset(): WorkOrder[]
}

const STORAGE_KEY = 'field-service-demo.work-orders.v1'

const seedWorkOrders: WorkOrder[] = [
  {
    id: 'WO-1042',
    title: 'Wärmepumpe prüfen',
    customer: 'Mira Feldmann',
    address: 'Lindenweg 8, 86150 Augsburg',
    status: 'open',
    checklist: {
      safetyCheck: false,
      meterInstallation: false,
      documentationConfirmed: false,
    },
    meterReading: '',
  },
  {
    id: 'WO-1043',
    title: 'Wasserzähler tauschen',
    customer: 'Jonas Winter',
    address: 'Am Stadtgarten 12, 86153 Augsburg',
    status: 'in-progress',
    checklist: {
      safetyCheck: true,
      meterInstallation: false,
      documentationConfirmed: false,
    },
    meterReading: '184.6',
  },
  {
    id: 'WO-1044',
    title: 'Heizungsanlage abnehmen',
    customer: 'Lea Sommer',
    address: 'Birkenallee 3, 86157 Augsburg',
    status: 'completed',
    checklist: {
      safetyCheck: true,
      meterInstallation: true,
      documentationConfirmed: true,
    },
    meterReading: '9021.3',
  },
]

function copyOrders(orders: WorkOrder[]): WorkOrder[] {
  return orders.map((order) => ({ ...order, checklist: { ...order.checklist } }))
}

function isWorkOrder(value: unknown): value is WorkOrder {
  if (!value || typeof value !== 'object') return false
  const order = value as Partial<WorkOrder>
  const checklist = order.checklist
  return (
    typeof order.id === 'string' &&
    typeof order.title === 'string' &&
    typeof order.customer === 'string' &&
    typeof order.address === 'string' &&
    ['open', 'in-progress', 'completed'].includes(order.status ?? '') &&
    typeof order.meterReading === 'string' &&
    !!checklist &&
    typeof checklist.safetyCheck === 'boolean' &&
    typeof checklist.meterInstallation === 'boolean' &&
    typeof checklist.documentationConfirmed === 'boolean'
  )
}

function readStoredOrders(storage: Storage): WorkOrder[] | null {
  const serialized = storage.getItem(STORAGE_KEY)
  if (serialized === null) return null

  let value: unknown
  try {
    value = JSON.parse(serialized)
  } catch (error) {
    throw new Error('Gespeicherte Demo-Daten sind ungültig. Bitte setze die Demo zurück.', {
      cause: error,
    })
  }

  if (!Array.isArray(value) || !value.every(isWorkOrder)) {
    throw new Error('Gespeicherte Demo-Daten haben ein ungültiges Format.')
  }

  return value
}

export function createWorkOrderRepository(storage: Storage = window.localStorage): WorkOrderRepository {
  function getAll(): WorkOrder[] {
    return copyOrders(readStoredOrders(storage) ?? seedWorkOrders)
  }

  return {
    getAll,
    getById(id) {
      return getAll().find((workOrder) => workOrder.id === id)
    },
    save(workOrder) {
      const orders = getAll()
      const index = orders.findIndex((item) => item.id === workOrder.id)
      if (index === -1) throw new Error(`Auftrag ${workOrder.id} wurde nicht gefunden.`)
      orders[index] = { ...workOrder, checklist: { ...workOrder.checklist } }
      storage.setItem(STORAGE_KEY, JSON.stringify(orders))
    },
    reset() {
      storage.removeItem(STORAGE_KEY)
      return copyOrders(seedWorkOrders)
    },
  }
}

export { STORAGE_KEY as WORK_ORDER_STORAGE_KEY }
