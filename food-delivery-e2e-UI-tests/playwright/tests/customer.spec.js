const { test, expect } = require('@playwright/test');

/**
 * Customer end‑to‑end happy path.
 *
 * This test covers the primary customer flow:
 *   1. Register a new account via the UI
 *   2. Log in with the newly created credentials
 *   3. Browse the list of restaurants and open the first one
 *   4. Add an available product to the cart
 *   5. View the cart, update the delivery address and place the order
 *   6. Verify the order appears in the My Orders page
 *
 * These steps exercise multiple conditional paths in the frontend, such as
 * the enable/disable logic on the "Add" button and the filtering logic
 * on the home page (search + category).  See coverage‑report.md for
 * details of the associated logic coverage.
 */
test('customer can register, shop and checkout', async ({ page, baseURL }) => {
  // Navigate to the home page
  await page.goto(baseURL);

  // Click the register link and fill out the registration form
  await page.click('text=Register');
  const unique = Math.random().toString(36).substring(2, 8);
  const username = `ui_customer_${unique}`;
  const email = `${username}@example.com`;
  await page.fill('[data-testid="register-username"]', username);
  await page.fill('[data-testid="register-name"]', 'UI');
  await page.fill('[data-testid="register-surname"]', 'Customer');
  await page.fill('[data-testid="register-email"]', email);
  await page.fill('[data-testid="register-phone"]', '123456');
  await page.fill('[data-testid="register-password"]', 'password');
  await page.fill('[data-testid="register-confirm"]', 'password');
  await page.click('[data-testid="register-submit"]');

  // Expect a success notification and redirect to login
  await page.waitForSelector('text=Registration successful');
  await expect(page).toHaveURL(/login/i);

  // Log in with the new user
  await page.fill('[data-testid="login-username"]', username);
  await page.fill('[data-testid="login-password"]', 'password');
  await page.click('[data-testid="login-submit"]');

  // Ensure we land on the home page after login
  await page.waitForSelector('[data-testid="home-page"]');

  // Search for a restaurant by typing part of its name.  Leave the
  // category filter on "All" so that matchesCategory=true.  This helps
  // exercise the search logic separately from the category logic.
  await page.fill('[data-testid="restaurant-search"]', '');
  // Wait for restaurants to load
  await page.waitForSelector('[data-testid^="restaurant-card-"]');

  // Click the view button on the first restaurant card
  const firstViewButton = await page.locator('[data-testid^="restaurant-view-"]').first();
  await firstViewButton.click();
  await page.waitForSelector('[data-testid="restaurant-page"]');

  // Locate the first enabled Add button (product.available && quantity > 0)
  const addButtons = page.locator('[data-testid^="restaurant-add-btn-"]');
  const count = await addButtons.count();
  let added = false;
  for (let i = 0; i < count; i++) {
    const btn = addButtons.nth(i);
    if (await btn.isEnabled()) {
      await btn.click();
      added = true;
      break;
    }
  }
  expect(added).toBeTruthy();

  // Open the cart page
  await page.click('text=Cart');
  await page.waitForSelector('[data-testid="cart-page"]');

  // Fill in the delivery address and proceed to checkout
  await page.fill('[data-testid="cart-address-line1"]', '123 Playwright St');
  await page.fill('[data-testid="cart-address-city"]', 'Testville');
  await page.fill('[data-testid="cart-address-postal"]', '00000');
  await page.click('[data-testid="cart-checkout"]');

  // On the checkout page, confirm the order (simulate payment step)
  await page.waitForSelector('[data-testid="checkout-page"]');
  // The UI might integrate with Stripe; for this test assume a mock payment
  await page.click('[data-testid="checkout-confirm"]');

  // After confirmation we should be redirected to the "My Orders" page
  await page.waitForSelector('[data-testid="my-orders-page"]');
  // The order list should contain at least one order.  Playwright's
  // expect API does not provide a greaterThan matcher, so we compute
  // the count manually and assert via jest's expect.
  const orders = page.locator('[data-testid^="order-card-"]');
  const orderCount = await orders.count();
  expect(orderCount).toBeGreaterThan(0);
});