import { test, expect } from '@playwright/test';

test('Admin can add, edit, and delete a restaurant', async ({ page }) => {
    const restaurantName = `TestRestaurant_${Date.now()}`;

    await page.goto('http://localhost:3000/');
    await page.getByTestId('header-login-link').click();
    await page.getByRole('textbox', { name: 'Username' }).fill('admin');
    await page.getByRole('textbox', { name: 'Password' }).fill('admin');
    await page.getByTestId('login-submit-btn').click();

    await page.getByTestId('admin-manage-restaurants-btn').click();
    await expect(page.getByTestId('admin-restaurants-page')).toBeVisible();

    await page.getByTestId('admin-restaurants-add-btn').click();
    await expect(page.getByTestId('admin-restaurant-dialog')).toBeVisible();

    await page.getByTestId('admin-restaurant-name-input').getByRole('textbox').fill(restaurantName);
    await page.getByTestId('admin-restaurant-description-input').getByRole('textbox').fill('Test description');
    await page.getByTestId('admin-restaurant-openhours-input').getByRole('textbox').fill('08:00-22:00');
    await page.getByTestId('admin-restaurant-deliverytime-input').getByRole('spinbutton').fill('30');
    await page.getByTestId('admin-restaurant-rating-input').getByRole('spinbutton').fill('4.5');

    await page.getByTestId('admin-restaurant-save-btn').click();

    const row = page.locator('[data-testid^="admin-restaurant-row-"]', {
        hasText: restaurantName,
    });
    await expect(row).toBeVisible();

    const rowTestId = await row.getAttribute('data-testid');
    const restaurantId = rowTestId.split('admin-restaurant-row-')[1];

    await page.getByTestId(`admin-restaurant-edit-${restaurantId}`).click();
    await page.getByTestId('admin-restaurant-deliverytime-input').getByRole('spinbutton').fill('35');
    await page.getByTestId('admin-restaurant-save-btn').click();

    page.once('dialog', d => d.accept());
    await page.getByTestId(`admin-restaurant-delete-${restaurantId}`).click();

    await expect(page.getByTestId(`admin-restaurant-row-${restaurantId}`)).toHaveCount(0);
});
