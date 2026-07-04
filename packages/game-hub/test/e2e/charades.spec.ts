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

    await expect(page.getByText('Card hidden')).toBeVisible();
    await page.getByRole('button', { name: 'Reveal', exact: true }).click();
    await expect(page.getByText('Word', { exact: true })).toBeVisible();

    await page.getByRole('button', { name: 'Next card' }).click();
    await expect(page.getByText('Card hidden')).toBeVisible();
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

  test('portrait iPhone 13 Pro Max shows action buttons without scrolling', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 428, height: 926 },
    });
    const page = await context.newPage();

    await page.goto('/play/charades');
    await page.locator('.charades-pack-card').filter({ hasText: 'Animals' }).first().click();
    await page.getByRole('button', { name: 'Easy', exact: true }).click();
    await page.getByRole('button', { name: 'Start' }).click();
    await page.waitForURL('**/play/charades/game');

    const reveal = page.getByRole('button', { name: 'Reveal', exact: true });
    const endRound = page.getByRole('button', { name: 'End round', exact: true });
    await expect(reveal).toBeVisible();
    await expect(endRound).toBeVisible();

    const revealBox = await reveal.boundingBox();
    const endRoundBox = await endRound.boundingBox();
    const viewport = page.viewportSize();
    expect(revealBox).not.toBeNull();
    expect(endRoundBox).not.toBeNull();
    expect(viewport).not.toBeNull();
    expect(endRoundBox!.y + endRoundBox!.height).toBeLessThanOrEqual(viewport!.height);

    await context.close();
  });

  test('landscape iPhone 13 Pro Max can start and reveal a card', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 926, height: 428 },
    });
    const page = await context.newPage();

    await page.goto('/play/charades');
    await page.locator('.charades-pack-card').filter({ hasText: 'Animals' }).first().click();
    await page.getByRole('button', { name: 'Easy', exact: true }).click();
    await page.getByRole('button', { name: 'Start' }).click();
    await page.waitForURL('**/play/charades/game');

    await expect(page.getByRole('button', { name: 'Reveal', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Reveal', exact: true }).click();
    await expect(page.getByText('Word', { exact: true })).toBeVisible();

    await context.close();
  });
});
