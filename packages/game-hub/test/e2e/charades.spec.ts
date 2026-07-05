/**
 * Solo charades smoke test — no login or lobby required.
 */
import { expect, test, type Page } from '@playwright/test';

async function openCharadesFilters(page: Page) {
  const desktopFilters = page.locator('details.charades-filters--desktop');
  if (await desktopFilters.isVisible()) {
    if ((await desktopFilters.getAttribute('open')) === null) {
      await desktopFilters.evaluate((el) => {
        (el as HTMLDetailsElement).open = true;
      });
    }
    return;
  }

  await page.locator('.charades-fab-dock').getByRole('button', { name: 'Filters' }).click();
}

async function selectOnlyDifficulty(page: Page, level: 'Easy' | 'Normal' | 'Hard') {
  const panel = page
    .locator(
      '.charades-sheet[role="dialog"] .charades-filters__body, details.charades-filters--desktop[open] .charades-filters__body',
    )
    .first();
  await panel.getByRole('button', { name: level, exact: true }).click();
}

/** Play screen: open difficulty picker and choose a level to draw a card. */
async function drawCardAtDifficulty(page: Page, level: 'Easy' | 'Normal' | 'Hard') {
  const trigger = page.locator('.charades-difficulty-picker__trigger').locator('visible=true');
  await trigger.click();
  await page
    .locator('.charades-difficulty-picker--open')
    .getByRole('option', { name: level, exact: true })
    .click();
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

    await expect(page.getByText('Pick a difficulty first')).toBeVisible();
    const reveal = page.getByRole('button', { name: 'Reveal', exact: true });
    await expect(reveal).toBeDisabled();
    await drawCardAtDifficulty(page, 'Easy');
    await expect(reveal).toBeEnabled();
    await reveal.click();
    await expect(page.getByText('Word', { exact: true })).toBeVisible();

    await page.getByRole('button', { name: 'Next card' }).click();
    await expect(page.locator('.card-face__cover-text', { hasText: 'Card back' })).toBeVisible();
    await expect(page.getByText('Tap to reveal')).toBeVisible();
    await expect(reveal).toBeEnabled();
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

    await drawCardAtDifficulty(page, 'Easy');
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

    await drawCardAtDifficulty(page, 'Easy');
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

  test('play difficulty picker draws card by level', async ({ page }) => {
    await page.goto('/play/charades');
    await page.getByRole('button', { name: 'Animals' }).click();
    await page.getByRole('button', { name: /^Start/ }).click();
    await page.waitForURL('**/play/charades/game');

    await expect(page.getByText('Choose a difficulty below, then reveal your card')).toBeVisible();
    await drawCardAtDifficulty(page, 'Hard');
    await page.getByRole('button', { name: 'Reveal', exact: true }).click();
    await expect(page.locator('.card-flip--revealed.card-flip--difficulty-hard')).toBeVisible();
  });

  test('tap card back reveals without filter controls visible', async ({ page }) => {
    await page.goto('/play/charades');
    await page.getByRole('button', { name: 'Animals' }).click();
    await page.getByRole('button', { name: /^Start/ }).click();
    await page.waitForURL('**/play/charades/game');

    await drawCardAtDifficulty(page, 'Easy');
    await expect(page.getByRole('button', { name: 'Filters' })).toBeVisible();
    await page.getByRole('button', { name: 'Reveal charades card' }).click();
    await expect(page.getByText('Word', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Filters' })).toHaveCount(0);
    await expect(page.locator('.charades-difficulty-picker__trigger')).toHaveCount(0);
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
    await expect(reveal).toBeDisabled();
    await expect(
      page.locator('.charades-fab-dock .charades-difficulty-picker__trigger'),
    ).toBeVisible();
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
    await drawCardAtDifficulty(page, 'Easy');
    await page.getByRole('button', { name: 'Reveal', exact: true }).click();
    await expect(page.getByText('Word', { exact: true })).toBeVisible();

    await context.close();
  });
});
