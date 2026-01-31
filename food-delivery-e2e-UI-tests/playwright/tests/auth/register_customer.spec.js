import { test, expect } from '@playwright/test';

test('Registering a new Customer', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.getByTestId('header-register-link').click();
    await page.getByRole('textbox', { name: 'Username' }).click();
    await page.getByRole('textbox', { name: 'Username' }).fill('Test1');
    await page.getByRole('textbox', { name: 'First name' }).click();
    await page.getByRole('textbox', { name: 'First name' }).fill('tester1');
    await page.getByRole('textbox', { name: 'Last name' }).click();
    await page.getByRole('textbox', { name: 'Last name' }).fill('tester1');
    await page.getByRole('textbox', { name: 'Phone number' }).click();
    await page.getByRole('textbox', { name: 'Phone number' }).fill('000764032');
    await page.getByRole('textbox', { name: 'Email' }).click();
    await page.getByRole('textbox', { name: 'Email' }).fill('a1@gmail.com');
    await page.getByRole('textbox', { name: 'Password' }).click();
    await page.getByRole('textbox', { name: 'Password' }).fill('password');
    page.once('dialog', dialog => {
        console.log(`Dialog message: ${dialog.message()}`);
        dialog.dismiss().catch(() => {});
    });
    await page.getByTestId('register-submit-btn').click();
    await page.getByRole('textbox', { name: 'Username' }).click();
    await page.getByRole('textbox', { name: 'Username' }).fill('Test1');
    await page.getByRole('textbox', { name: 'Password' }).click();
    await page.getByRole('textbox', { name: 'Password' }).fill('password');
    await page.getByTestId('login-submit-btn').click();
});