import { describe, expect, it } from 'vitest'
import { transitionWorkOrderStatus, type WorkOrder } from './workOrder'
import {
  METER_READING_MAX,
  validateMeterReading,
  validateWorkOrderCompletion,
} from './workOrderValidation'

const completeOrder: WorkOrder = {
  id: 'WO-TEST',
  title: 'Testauftrag',
  customer: 'Alex Beispiel',
  address: 'Testweg 1',
  status: 'in-progress',
  checklist: {
    safetyCheck: true,
    meterInstallation: true,
    documentationConfirmed: true,
  },
  meterReading: '0',
}

describe('validateMeterReading', () => {
  it.each(['0', '0,1', '184.6', '999999.9'])('accepts an in-range value: %s', (value) => {
    expect(validateMeterReading(value)).toBeNull()
  })

  it.each(['', '  ', 'abc', '-0.1', '1000000', '10.25', 'Infinity'])(
    'rejects an invalid value: %s',
    (value) => {
      expect(validateMeterReading(value)).not.toBeNull()
    },
  )

  it('accepts the inclusive maximum boundary', () => {
    expect(validateMeterReading(String(METER_READING_MAX))).toBeNull()
  })
})

describe('work order completion', () => {
  it('reports all missing required data', () => {
    const incomplete: WorkOrder = {
      ...completeOrder,
      checklist: {
        safetyCheck: false,
        meterInstallation: false,
        documentationConfirmed: false,
      },
      meterReading: '',
    }

    expect(validateWorkOrderCompletion(incomplete)).toHaveLength(4)
    const result = transitionWorkOrderStatus(incomplete, 'completed')
    expect(result.ok).toBe(false)
  })

  it('allows completion only when every check and the meter reading are valid', () => {
    const result = transitionWorkOrderStatus(completeOrder, 'completed')

    expect(result.ok).toBe(true)
    if (result.ok) expect(result.workOrder.status).toBe('completed')
  })

  it('allows starting an open order and prevents reopening a completed order', () => {
    const opened = transitionWorkOrderStatus({ ...completeOrder, status: 'open' }, 'in-progress')
    const reopened = transitionWorkOrderStatus(
      { ...completeOrder, status: 'completed' },
      'in-progress',
    )

    expect(opened.ok).toBe(true)
    expect(reopened.ok).toBe(false)
  })
})
