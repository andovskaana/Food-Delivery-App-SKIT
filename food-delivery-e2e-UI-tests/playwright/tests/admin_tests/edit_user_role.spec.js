import { test, expect } from '@playwright/test';

test('Admin Edits Customer Role to a Courier Role.', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.getByTestId('header-login-link').click();
    await page.getByRole('textbox', { name: 'Username' }).click();
    await page.getByRole('textbox', { name: 'Username' }).fill('admin');
    await page.getByRole('textbox', { name: 'Password' }).click();
    await page.getByRole('textbox', { name: 'Password' }).click();
    await page.getByRole('textbox', { name: 'Password' }).fill('admin');
    await page.getByTestId('login-submit-btn').click();

    await page.getByTestId('admin-manage-users-btn').click();
    await expect(page.getByTestId('admin-users-page')).toBeVisible();

    const userRows = page.getByTestId(/^admin-user-row-/);
    const count = await userRows.count();

    test.skip(count === 0, 'No users available');

    const firstRow = userRows.first();
    const rowTestId = await firstRow.getAttribute('data-testid');
    const username = rowTestId.split('admin-user-row-')[1];

    await page.getByTestId(`admin-user-edit-${username}`).click();
    await expect(page.getByTestId('admin-user-edit-dialog')).toBeVisible();

    await page.getByTestId('admin-user-edit-role').click();
    await page.getByRole('option', { name: 'Courier' }).click();

    await page.getByTestId('admin-user-edit-save-btn').click();

    await expect(page.getByTestId(`admin-user-role-${username}`)).toHaveText('COURIER');
});