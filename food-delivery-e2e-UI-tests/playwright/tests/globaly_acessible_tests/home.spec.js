import { test, expect } from '@playwright/test';

test('User explores home page: categories, restaurant navigation, and search', async ({ page }) => {
    await page.goto('http://localhost:3000/');

    await expect(page.getByTestId('home-page')).toBeVisible();

    await page.getByTestId('home-category-Grill / Balkan').click();
    await expect(page.locator('[data-testid^="restaurant-view-"]').first()).toBeVisible();

    await page.getByTestId('home-category-All').click();
    await expect(page.locator('[data-testid^="restaurant-view-"]').first()).toBeVisible();

    const firstRestaurant = page.locator('[data-testid^="restaurant-view-"]').first();
    await firstRestaurant.click();
    await expect(page).toHaveURL(/restaurant/);

    await page.getByTestId('header-brand').click();
    await expect(page).toHaveURL('http://localhost:3000/');

    const searchBox = page.getByRole('textbox', { name: 'Search for restaurants…' });
    await searchBox.fill('amigos');

    await expect(
        page.locator('[data-testid^="restaurant-view-"]').first()
    ).toBeVisible();
});
