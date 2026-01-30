const { test, expect } = require('@playwright/test');

/**
 * Courier end‑to‑end navigation test.
 *
 * This test verifies that a courier can log in and access their
 * dashboard.  The actual assignment and completion workflows depend
 * on backend state, so this scenario focuses on rendering the list of
 * available and delivered orders and ensuring the UI elements are
 * present.  It touches both positive and negative paths in the
 * underlying logic (e.g. an empty list of orders should render a
 * placeholder message).
 */
test('courier can access dashboard and delivered orders', async ({ page, baseURL }) => {
  // Navigate to login page
  await page.goto(`${baseURL}/login`);
  await page.fill('[data-testid="login-username"]', 'courier');
  await page.fill('[data-testid="login-password"]', 'courier');
  await page.click('[data-testid="login-submit"]');
  // Wait for home page
  await page.waitForSelector('[data-testid="home-page"]');
  // Navigate to courier dashboard via navbar
  await page.click('text=Courier');
  // Wait for courier dashboard
  await page.waitForSelector('[data-testid="courier-dashboard-page"]');
  // The dashboard should either show a list of orders awaiting pick up
  // or a message indicating there are none.  Check that at least one of
  // these elements is present.
  const awaitingList = page.locator('[data-testid^="courier-awaiting-order-"]');
  const emptyAwaiting = page.locator('text=No available orders');
  expect(await awaitingList.count() > 0 || await emptyAwaiting.isVisible()).toBeTruthy();
  // Navigate to delivered orders
  await page.click('text=Delivered Orders');
  await page.waitForSelector('[data-testid="courier-delivered-page"]');
  // Delivered orders list may be empty or populated
  const deliveredRows = page.locator('[data-testid^="courier-delivered-order-"]');
  const emptyDelivered = page.locator('text=No delivered orders');
  expect(await deliveredRows.count() > 0 || await emptyDelivered.isVisible()).toBeTruthy();
});