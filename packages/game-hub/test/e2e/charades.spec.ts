/**
 * Solo charades smoke test — no login or lobby required.
 */
import { expect, test } from '@playwright/test';

test.describe('Charades solo play', () => {
  test('guest can start charades and reveal a card', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'Play', exact: true })).toBeVisible();
    await page.getByRole('button', { name: /Charades/i }).click();
    await page.waitForURL('**/play/charades');

    await page.getByRole('button', { name: 'Animals' }).click();
    await page.getByRole('button', { name: 'Easy', exact: true }).click();
    await expect(page.getByText(/\d+ cards in this round/)).toBeVisible();

    await page.getByRole('button', { name: 'Start' }).click();
    await page.waitForURL('**/play/charades/game');

    await expect(page.getByText('Tap to reveal')).toBeVisible();
    await page.getByRole('button', { name: 'Reveal', exact: true }).click();
    await expect(page.getByText('Word', { exact: true })).toBeVisible();

    await page.getByRole('button', { name: 'Next card' }).click();
    await expect(page.getByText('Tap to reveal')).toBeVisible();
  });
});
