import { test, expect } from '@playwright/test';

test('Admin can add, edit, and delete a product', async ({ page }) => {
    const productName = `TestProduct_${Date.now()}`;

    await page.goto('http://localhost:3000/');
    await page.getByTestId('header-login-link').click();
    await page.getByRole('textbox', { name: 'Username' }).fill('admin');
    await page.getByRole('textbox', { name: 'Password' }).fill('admin');
    await page.getByTestId('login-submit-btn').click();

    await page.getByTestId('admin-manage-products-btn').click();
    await expect(page.getByTestId('admin-products-page')).toBeVisible();

    await page.getByTestId('admin-products-add-btn').click();
    await expect(page.getByTestId('admin-product-dialog')).toBeVisible();

    await page
        .getByTestId('admin-product-name-input')
        .getByRole('textbox')
        .fill(productName);

    await page
        .getByTestId('admin-product-description-input')
        .getByRole('textbox')
        .fill('Test description');

    await page
        .getByTestId('admin-product-price-input')
        .getByRole('spinbutton')
        .fill('200');

    await page.getByTestId('admin-product-restaurant-select').click();
    await page.getByRole('option').first().click();

    await page.getByTestId('admin-product-save-btn').click();

    const row = page.locator('[data-testid^="admin-product-row-"]', {
        hasText: productName,
    });
    await expect(row).toBeVisible();

    const rowTestId = await row.getAttribute('data-testid');
    const productId = rowTestId.split('admin-product-row-')[1];

    await page.getByTestId(`admin-product-edit-${productId}`).click();
    await page
        .getByTestId('admin-product-description-input')
        .getByRole('textbox')
        .fill('Updated description');
    await page.getByTestId('admin-product-save-btn').click();

    page.once('dialog', d => d.accept());
    await page.getByTestId(`admin-product-delete-${productId}`).click();

    await expect(page.getByTestId(`admin-product-row-${productId}`)).toHaveCount(0);
});
