import { expect, test } from '@playwright/test';

test('Domains page shows upstream IP and route table from fixtures', async ({ page }) => {
  await page.goto('/system/domains');

  await expect(page.getByRole('heading', { name: 'Domains' })).toBeVisible();
  await expect(page.getByText('Upstream IP')).toBeVisible();
  await expect(page.locator('input').first()).toHaveValue('192.168.1.50');
  await expect(page.getByPlaceholder('home.tower').first()).toHaveValue('home.tower');
  await expect(page.locator('input[type="number"]').first()).toHaveValue('8888');
  await expect(page.getByRole('button', { name: 'Add route' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Save' })).toBeVisible();
});

test('Domains save regenerates files and shows success', async ({ page }) => {
  await page.goto('/system/domains');
  await expect(page.getByPlaceholder('home.tower').first()).toHaveValue('home.tower');

  await page.getByRole('button', { name: 'Add route' }).click();
  await page.getByPlaceholder('home.tower').last().fill('demo.tower');
  await page.locator('input[type="number"]').last().fill('3456');

  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByText('Saved — Caddy restarted.')).toBeVisible();
});
