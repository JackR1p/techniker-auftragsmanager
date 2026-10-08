import type { WorkOrder } from './workOrder'

export const METER_READING_MIN = 0
export const METER_READING_MAX = 999_999.9

export function validateMeterReading(value: string): string | null {
  const trimmed = value.trim()
  if (!trimmed) return 'Bitte gib den Zählerstand ein.'

  if (!/^[+-]?\d+(?:[.,]\d+)?$/.test(trimmed)) {
    return 'Gib einen gültigen Zahlenwert ein.'
  }

  const decimalPart = trimmed.replace(',', '.').split('.')[1]
  if (decimalPart && decimalPart.length > 1) {
    return 'Der Zählerstand darf höchstens eine Nachkommastelle haben.'
  }

  const reading = Number(trimmed.replace(',', '.'))
  if (!Number.isFinite(reading)) return 'Gib einen gültigen Zahlenwert ein.'
  if (reading < METER_READING_MIN || reading > METER_READING_MAX) {
    return `Der Zählerstand muss zwischen ${METER_READING_MIN} und ${METER_READING_MAX.toLocaleString('de-DE')} kWh liegen.`
  }

  return null
}

export function validateWorkOrderCompletion(workOrder: WorkOrder): string[] {
  const errors: string[] = []

  if (!workOrder.checklist.safetyCheck) errors.push('Sicherheitsprüfung bestätigen.')
  if (!workOrder.checklist.meterInstallation) errors.push('Zählerinstallation bestätigen.')
  if (!workOrder.checklist.documentationConfirmed) {
    errors.push('Foto und Dokumentation bestätigen.')
  }

  const meterReadingError = validateMeterReading(workOrder.meterReading)
  if (meterReadingError) errors.push(meterReadingError)

  return errors
}
