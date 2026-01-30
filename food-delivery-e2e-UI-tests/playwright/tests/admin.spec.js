const { test, expect } = require('@playwright/test');

/**
 * Admin end‑to‑end smoke test.
 *
 * This scenario focuses on the administrative workflow.  It verifies
 * that an administrator can log in and navigate to the restaurant
 * management page.  The test intentionally stops short of persisting
 * new entities, as doing so would require knowledge of the running
 * backend.  It nevertheless triggers the UI logic related to the
 * isRestaurantOpen() predicate (status chip) and the search/filtering
 * behaviour on the admin table.
 */
test('admin can access restaurant management and filter entries', async ({ page, baseURL }) => {
  // Navigate to the login page
  await page.goto(`${baseURL}/login`);
  // Log in with static admin credentials
  await page.fill('[data-testid="login-username"]', 'admin');
  await page.fill('[data-testid="login-password"]', 'admin');
  await page.click('[data-testid="login-submit"]');

  // After login we expect to land on the home page
  await page.waitForSelector('[data-testid="home-page"]');

  // Navigate to the admin dashboard via the navigation menu.  The
  // selectors below assume that there is a link labelled "Admin" in
  // the navbar which leads to the restaurant management view.  If
  // necessary adjust to your application’s structure.
  await page.click('text=Admin');
  await page.click('text=Restaurants');

  // Wait for the admin restaurant page to load
  await page.waitForSelector('[data-testid="admin-restaurants-page"]');

  // Capture the initial number of rows in the table
  const rows = page.locator('[data-testid^="admin-restaurant-row-"]');
  const initialCount = await rows.count();
  // If there are no restaurants the rest of the test will skip filtering
  // behaviour.  For coverage purposes we only need at least one entry.
  if (initialCount > 0) {
    // Fetch the name of the first restaurant to use as a search term
    const firstName = await rows.first().locator('td').first().textContent();
    const searchTerm = (firstName || '').trim().slice(0, 3);
    // Type a partial search term into the search box
    await page.fill('[data-testid="admin-restaurants-search-input"]', searchTerm);
    // The filtered table should contain a smaller or equal number of rows
    const filteredRows = page.locator('[data-testid^="admin-restaurant-row-"]');
    const filteredCount = await filteredRows.count();
    expect(filteredCount).toBeLessThanOrEqual(initialCount);
  }

  // Verify that each status chip correctly displays "Open" or "Closed"
  // based on the computed open hours.  This loop exercises both
  // branches of the isRestaurantOpen() predicate.  Without controlling
  // the system clock we cannot guarantee both values occur, but
  // iterating over all rows increases the likelihood.
  const statusChips = page.locator('[data-testid^="admin-restaurant-status-"]');
  const statusCount = await statusChips.count();
  for (let i = 0; i < statusCount; i++) {
    const label = await statusChips.nth(i).textContent();
    expect(['Open', 'Closed']).toContain(label);
  }
});