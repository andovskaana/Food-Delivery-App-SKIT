import { test, expect } from '@playwright/test';

test('The basic courier flow of getting assigned an order.', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.getByTestId('header-login-link').click();
    await page.getByRole('textbox', { name: 'Username' }).click();
    await page.getByRole('textbox', { name: 'Username' }).fill('courier');
    await page.getByRole('textbox', { name: 'Password' }).click();
    await page.getByRole('textbox', { name: 'Password' }).fill('courier');
    await page.getByTestId('login-submit-btn').click();

    await expect(page.getByTestId('courier-page')).toBeVisible();

    const availableRows = page.getByTestId(/^courier-available-row-/);
    const count = await availableRows.count();

    test.skip(count === 0, 'No available orders to assign');

    const firstRow = availableRows.first();
    const rowTestId = await firstRow.getAttribute('data-testid');
    const orderId = rowTestId.split('courier-available-row-')[1];

    await page.getByTestId(`courier-assign-${orderId}`).click();
    await page.getByRole('button', { name: 'OK' }).click();

    await expect(page.getByTestId(`courier-active-row-${orderId}`)).toBeVisible();

    await page.getByTestId(`courier-complete-${orderId}`).click();
    await page.getByRole('button', { name: 'OK' }).click();

    await expect(page.getByTestId(`courier-delivered-row-${orderId}`)).toBeVisible();
});