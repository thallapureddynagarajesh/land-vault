import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:5173/')
})

test('displays LandVault header & brand identity', async ({ page }) => {
  await expect(page.locator('body')).toContainText('LandVault')
})

test('allows searching properties by PIN', async ({ page }) => {
  const searchInput = page.locator('input[placeholder*="Search PIN"]')
  await expect(searchInput).toBeVisible()
  await searchInput.fill('PRCL-2026-8801')
  await page.locator('button:has-text("Verify")').first().click()
  await expect(page.locator('body')).toContainText('PRCL-2026-8801')
})

test('renders Government Registrar Portal queue', async ({ page }) => {
  await page.locator('button:has-text("Gov Portal")').first().click()
  await expect(page.locator('body')).toContainText('Government Registrar Authority Portal')
  await expect(page.locator('body')).toContainText('Pending Verification Requests')
})

test('renders Atomic Land Marketplace listings', async ({ page }) => {
  await page.locator('button:has-text("Marketplace")').first().click()
  await expect(page.locator('body')).toContainText('Algorand Atomic Land Marketplace')
  await expect(page.locator('body')).toContainText('Buy Property Instant')
})

test('opens Audit Trail modal for a land parcel', async ({ page }) => {
  await page.locator('button:has-text("Marketplace")').first().click()
  const auditLink = page.locator('button:has-text("Audit Trail")').first()
  await auditLink.click()
  await expect(page.locator('body')).toContainText('Immutable Title Provenance & Audit Log')
})
