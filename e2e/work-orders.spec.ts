import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Demo zurücksetzen' }).click()
  await expect(page.getByRole('heading', { name: 'Serviceaufträge' })).toBeVisible()
})

test('lists the seeded orders and opens an order detail', async ({ page }) => {
  await expect(page.getByRole('button', { name: /Wärmepumpe prüfen/ })).toBeVisible()
  await expect(page.getByRole('button', { name: /Wasserzähler tauschen/ })).toBeVisible()
  await expect(page.getByRole('button', { name: /Heizungsanlage abnehmen/ })).toBeVisible()

  await page.getByRole('button', { name: /Wärmepumpe prüfen/ }).click()
  await expect(page.getByRole('heading', { name: 'Wärmepumpe prüfen' })).toBeVisible()
  await expect(page.getByText('Offen', { exact: true })).toBeVisible()
})

test('rejects completion when required checks and the reading are missing', async ({ page }) => {
  await page.getByRole('button', { name: /Wärmepumpe prüfen/ }).click()
  await page.getByRole('button', { name: 'Auftrag beginnen' }).click()
  await page.getByRole('button', { name: 'Auftrag abschließen' }).click()

  await expect(page.getByRole('alert')).toContainText('Noch nicht abschließbar')
  await expect(page.getByRole('alert')).toContainText('Sicherheitsprüfung bestätigen')
  await expect(page.getByRole('alert')).toContainText('Bitte gib den Zählerstand ein')
  await expect(page.getByText('In Bearbeitung', { exact: true })).toBeVisible()
})

test('rejects an out-of-range meter reading', async ({ page }) => {
  await page.getByRole('button', { name: /Wasserzähler tauschen/ }).click()
  await page.getByRole('checkbox', { name: /Zähler installiert und geprüft/ }).check()
  await page.getByRole('checkbox', { name: /Foto und Dokumentation bestätigt/ }).check()
  await page.getByRole('textbox', { name: 'Zählerstand (kWh)' }).fill('1000000')
  await page.getByRole('button', { name: 'Auftrag abschließen' }).click()

  await expect(page.getByRole('alert')).toContainText('muss zwischen 0 und 999.999,9 kWh liegen')
  await expect(page.getByText('In Bearbeitung', { exact: true })).toBeVisible()
})

test('completes a valid order with a boundary meter reading', async ({ page }) => {
  await page.getByRole('button', { name: /Wasserzähler tauschen/ }).click()
  await page.getByRole('checkbox', { name: /Zähler installiert und geprüft/ }).check()
  await page.getByRole('checkbox', { name: /Foto und Dokumentation bestätigt/ }).check()
  await page.getByRole('textbox', { name: 'Zählerstand (kWh)' }).fill('999999.9')
  await page.getByRole('button', { name: 'Auftrag abschließen' }).click()

  await expect(page.getByRole('status')).toContainText('Auftrag erfolgreich abgeschlossen')
  await expect(page.getByText('Abgeschlossen', { exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Auftrag vollständig dokumentiert' })).toBeVisible()
})

test('preserves checklist and meter changes after reload', async ({ page }) => {
  await page.getByRole('button', { name: /Wasserzähler tauschen/ }).click()
  await page.getByRole('checkbox', { name: /Zähler installiert und geprüft/ }).check()
  await page.getByRole('textbox', { name: 'Zählerstand (kWh)' }).fill('256,4')
  await page.reload()

  await page.getByRole('button', { name: /Wasserzähler tauschen/ }).click()
  await expect(page.getByRole('checkbox', { name: /Zähler installiert und geprüft/ })).toBeChecked()
  await expect(page.getByRole('textbox', { name: 'Zählerstand (kWh)' })).toHaveValue('256,4')
})

test('fits the current viewport without horizontal scrolling', async ({ page }) => {
  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }))

  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth)
})
