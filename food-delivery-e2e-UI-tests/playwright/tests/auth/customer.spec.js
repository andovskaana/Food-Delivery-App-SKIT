import { test, expect } from '@playwright/test';

test('login as customer', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.getByTestId('header-login-link').click();
    await page.getByRole('textbox', { name: 'Username' }).click();
    await page.getByRole('textbox', { name: 'Username' }).fill('customer');
    await page.getByRole('textbox', { name: 'Password' }).click();
    await page.getByRole('textbox', { name: 'Password' }).fill('customer');
    await page.getByTestId('login-submit-btn').click();
});