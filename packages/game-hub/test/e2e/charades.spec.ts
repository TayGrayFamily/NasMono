/**
 * Solo charades smoke test — no login or lobby required.
 */
import { expect, test, type Page } from '@playwright/test';

async function openCharadesFilters(page: Page) {
  const fabFilters = page.getByRole('button', { name: 'Filters' });
  if (await fabFilters.isVisible()) {
    await fabFilters.click();
    return;
  }

  const filters = page.locator('details.charades-filters--desktop');
  if ((await filters.getAttribute('open')) === null) {
    await filters.locator('summary').click();
  }
}

async function selectOnlyDifficulty(page: Page, level: 'Easy' | 'Normal' | 'Hard') {
  const levels: Array<'Easy' | 'Normal' | 'Hard'> = ['Easy', 'Normal', 'Hard'];
  for (const name of levels) {
    const button = page.getByRole('button', { name, exact: true });
    const pressed = await button.getAttribute('aria-pressed');
    const shouldBeOn = name === level;
    if ((pressed === 'true') !== shouldBeOn) {
      await button.click();
    }
  }
}

test.describe('Charades solo play', () => {
  test('guest can start charades and reveal a card', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'Play', exact: true })).toBeVisible();
    await page.getByRole('button', { name: /Charades/i }).click();
    await page.waitForURL('**/play/charades');

    await page.getByRole('button', { name: 'Animals' }).click();
    await openCharadesFilters(page);
    await selectOnlyDifficulty(page, 'Easy');
    await expect(page.getByText(/\d+ cards in this round/)).toBeVisible();

    await page.getByRole('button', { name: /^Start/ }).click();
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
    await openCharadesFilters(page);
    await selectOnlyDifficulty(page, 'Easy');
    await page.getByRole('button', { name: 'Actors', exact: true }).click();

    await expect(page.getByText(/cards in this round/)).toBeVisible();
    await page.getByRole('button', { name: /^Start/ }).click();
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
    await openCharadesFilters(page);
    await selectOnlyDifficulty(page, 'Hard');

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

    await page.getByRole('button', { name: /^Start/ }).click();
    await page.waitForURL('**/play/charades/game');
  });

  test('reveal extras show context chip for movie quotes', async ({ page }) => {
    await page.goto('/play/charades');

    await page
      .locator('.charades-pack-card')
      .filter({ hasText: /^Movies/ })
      .click();
    await openCharadesFilters(page);
    await page.getByRole('button', { name: 'Titles', exact: true }).click();
    await page.getByRole('button', { name: 'Characters', exact: true }).click();
    await page.getByRole('button', { name: 'Actors', exact: true }).click();
    await page.getByRole('button', { name: /^Start/ }).click();
    await page.waitForURL('**/play/charades/game');

    await page.getByRole('button', { name: 'Reveal', exact: true }).click();
    await expect(page.getByRole('toolbar', { name: 'Extra clues' })).toBeVisible();
    await page.getByRole('button', { name: 'Context', exact: true }).click();
    await expect(page.getByRole('region', { name: 'Context' })).toBeVisible();
  });

  test('filters summary shows difficulty and generations', async ({ page }) => {
    await page.goto('/play/charades');
    await page.getByRole('button', { name: 'Animals' }).click();

    const summary = page.locator('.charades-fab__hint, .charades-filters__value').first();
    await expect(summary).toHaveText('Single pack · All difficulties · All players');

    await openCharadesFilters(page);
    await selectOnlyDifficulty(page, 'Hard');
    await page.getByRole('button', { name: /^Gen Alpha/ }).click();

    await expect(summary).toHaveText('Single pack · Hard · Gen Z, Millennials, Gen X+');
  });

  test('multi-pack mode mixes animals and movies', async ({ page }) => {
    await page.goto('/play/charades');

    await openCharadesFilters(page);
    await page.getByRole('button', { name: 'Multi-pack off', exact: true }).click();

    await page.getByRole('button', { name: 'Animals' }).click();
    await page.getByRole('button', { name: /^Movies/ }).click();
    await expect(page.getByText(/\d+ cards in this round · 2 packs/)).toBeVisible();

    await page.getByRole('button', { name: /^Start/ }).click();
    await page.waitForURL('**/play/charades/game');
    await expect(page.getByRole('heading', { name: 'Mixed · 2 packs' })).toBeVisible();
  });

  test('pick card sheet filters next card by difficulty', async ({ page }) => {
    await page.goto('/play/charades');
    await page.getByRole('button', { name: 'Animals' }).click();
    await page.getByRole('button', { name: /^Start/ }).click();
    await page.waitForURL('**/play/charades/game');

    await page.getByRole('button', { name: 'Pick card' }).click();
    await selectOnlyDifficulty(page, 'Hard');
    await page.getByRole('button', { name: 'Draw', exact: true }).click();

    await page.getByRole('button', { name: 'Reveal', exact: true }).click();
    await expect(page.locator('.card-face--revealed.card-face--difficulty-hard')).toBeVisible();
  });

  test('portrait iPhone 13 Pro Max shows floating action buttons', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 428, height: 926 },
    });
    const page = await context.newPage();

    await page.goto('/play/charades');
    await page.locator('.charades-pack-card').filter({ hasText: 'Animals' }).first().click();
    await expect(page.locator('.charades-fab-dock')).toBeVisible();

    await openCharadesFilters(page);
    await selectOnlyDifficulty(page, 'Easy');
    await page.getByRole('button', { name: 'Done' }).click();
    await page.getByRole('button', { name: /^Start/ }).click();
    await page.waitForURL('**/play/charades/game');

    const reveal = page
      .locator('.charades-fab-dock')
      .getByRole('button', { name: 'Reveal', exact: true });
    const endRound = page
      .locator('.charades-fab-dock')
      .getByRole('button', { name: 'End round', exact: true });
    await expect(reveal).toBeVisible();
    await expect(endRound).toBeVisible();

    const endRoundBox = await endRound.boundingBox();
    const viewport = page.viewportSize();
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
    await openCharadesFilters(page);
    await selectOnlyDifficulty(page, 'Easy');
    await page.getByRole('button', { name: 'Done' }).click();
    await page.getByRole('button', { name: /^Start/ }).click();
    await page.waitForURL('**/play/charades/game');

    await expect(
      page.locator('.charades-fab-dock').getByRole('button', { name: 'Reveal', exact: true }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Reveal', exact: true }).click();
    await expect(page.getByText('Word', { exact: true })).toBeVisible();

    await context.close();
  });
});
