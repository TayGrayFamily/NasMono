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

  test('movies pack can disable actors and still start', async ({ page }) => {
    await page.goto('/play/charades');

    await page
      .locator('.charades-pack-card')
      .filter({ hasText: 'Titles, quotes, characters, and actors' })
      .click();
    await page.getByRole('button', { name: 'Easy', exact: true }).click();
    await page.getByRole('button', { name: 'Actors', exact: true }).click();

    await expect(page.getByText(/cards in this round/)).toBeVisible();
    await page.getByRole('button', { name: 'Start' }).click();
    await page.waitForURL('**/play/charades/game');

    await page.getByRole('button', { name: 'Reveal', exact: true }).click();
    await expect(page.getByText('Actor', { exact: true })).not.toBeVisible();
  });

  test('gen-alpha filter narrows movies and still starts', async ({ page }) => {
    await page.goto('/play/charades');

    await page
      .locator('.charades-pack-card')
      .filter({ hasText: /^Movies/ })
      .click();
    await page.getByRole('button', { name: 'Hard', exact: true }).click();

    const allGensCount = Number(
      (await page.getByText(/cards in this round/).textContent())?.match(/\d+/)?.[0],
    );
    expect(allGensCount).toBeGreaterThan(0);

    await page.getByRole('button', { name: /^Gen Z/ }).click();
    await page.getByRole('button', { name: /^Millennials/ }).click();
    await page.getByRole('button', { name: /^Gen X\+/ }).click();

    const genAlphaCount = Number(
      (await page.getByText(/cards in this round/).textContent())?.match(/\d+/)?.[0],
    );
    expect(genAlphaCount).toBeGreaterThan(0);
    expect(genAlphaCount).toBeLessThan(allGensCount);

    await page.getByRole('button', { name: 'Start' }).click();
    await page.waitForURL('**/play/charades/game');
  });
});
