import { test, expect } from '@playwright/test';

test('customer checkout flow (skip if all restaurants closed)', async ({ page }) => {
    await page.goto('http://localhost:3000/');

    // LOGIN
    await page.getByTestId('header-login-link').click();
    await page.getByRole('textbox', { name: 'Username' }).fill('customer');
    await page.getByRole('textbox', { name: 'Password' }).fill('customer');
    await page.getByTestId('login-submit-btn').click();

    // TRY RESTAURANTS ONE BY ONE (simple)
    let restaurantOpened = false;

    for (let restaurantId = 1; restaurantId <= 5; restaurantId++) {
        const restaurantCard = page.getByTestId(`restaurant-view-${restaurantId}`);

        if (!(await restaurantCard.isVisible().catch(() => false))) {
            continue;
        }

        await restaurantCard.click();

        // if restaurant is closed → dialog appears with OK
        const okButton = page.getByRole('button', { name: 'OK' });

        if (await okButton.isVisible().catch(() => false)) {
            await okButton.click();
            await page.goBack();
            continue;
        }

        // restaurant is open
        restaurantOpened = true;

        // ADD PRODUCT (first one)
        await page.getByTestId(`restaurant-add-btn-1`).click();

        // confirmation alert
        await page.getByRole('button', { name: 'OK' }).click();
        break;
    }

    //test.skip(!restaurantOpened, 'All restaurants are CLOSED');

    // CART
    await page.getByTestId('header-cart-link').click();
    await page.getByTestId('order-checkout-btn').click();

    // ADDRESS (hardcoded as requested)
    await page.getByTestId('cart-address-line1')
        .getByRole('textbox', { name: 'Address Line' })
        .fill('Test');

    await page.getByTestId('cart-address-line2')
        .getByRole('textbox', { name: 'Address Line' })
        .fill('Testing');

    await page.getByRole('textbox', { name: 'City' }).fill('Skopje');
    await page.getByRole('textbox', { name: 'Postal Code' }).fill('1000');
    await page.getByRole('textbox', { name: 'Country' }).fill('MK');

    await page.getByTestId('cart-address-save-btn').click();
});