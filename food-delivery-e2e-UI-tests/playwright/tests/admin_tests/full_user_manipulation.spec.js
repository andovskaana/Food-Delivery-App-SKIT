import { test, expect } from '@playwright/test';

test('Admin can add, edit role, and delete a user', async ({ page }) => {
    await page.goto('http://localhost:3000/');

    await page.getByTestId('header-login-link').click();
    await page.getByRole('textbox', { name: 'Username' }).fill('admin');
    await page.getByRole('textbox', { name: 'Password' }).fill('admin');
    await page.getByTestId('login-submit-btn').click();

    await page.getByTestId('admin-manage-users-btn').click();
    await expect(page.getByTestId('admin-users-page')).toBeVisible();

    await page.getByTestId('admin-users-add-btn').click();
    await expect(page.getByTestId('admin-user-add-dialog')).toBeVisible();

    await page.getByTestId('admin-user-add-username').getByRole('textbox').fill('testuser');
    await page.getByTestId('admin-user-add-name').getByRole('textbox').fill('Test');
    await page.getByTestId('admin-user-add-surname').getByRole('textbox').fill('User');
    await page.getByTestId('admin-user-add-phone').getByRole('textbox').fill('00123456');
    await page.getByTestId('admin-user-add-email').getByRole('textbox').fill('testuser@test.com');
    await page.getByTestId('admin-user-add-password').getByRole('textbox').fill('password');

    await page.getByTestId('admin-user-add-role').click();
    await page.getByRole('option', { name: 'ADMIN' }).click();

    await page.getByTestId('admin-user-add-save-btn').click();

    await expect(page.getByTestId('admin-user-row-testuser')).toBeVisible();

    await page.getByTestId('admin-user-edit-testuser').click();
    await expect(page.getByTestId('admin-user-edit-dialog')).toBeVisible();

    await page.getByTestId('admin-user-edit-role').click();
    await page.getByRole('option', { name: 'CUSTOMER' }).click();
    await page.getByTestId('admin-user-edit-save-btn').click();

    await expect(page.getByTestId('admin-user-role-testuser')).toHaveText('CUSTOMER');

    page.once('dialog', dialog => dialog.accept());
    await page.getByTestId('admin-user-delete-testuser').click();

    await expect(page.getByTestId('admin-user-row-testuser')).toHaveCount(0);
});