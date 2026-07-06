/**
 * Solo charades smoke test — no login or lobby required.
 */
import { expect, test, type Page } from '@playwright/test';

async function openCharadesSetupFilters(page: Page) {
  const desktopFilters = page.locator('details.charades-filters--desktop');
  if (await desktopFilters.isVisible()) {
    if ((await desktopFilters.getAttribute('open')) === null) {
      await desktopFilters.evaluate((el) => {
        (el as HTMLDetailsElement).open = true;
      });
    }
    return;
  }

  await page.locator('.charades-fab-dock--setup').getByRole('button', { name: 'Filters' }).click();
}

async function selectOnlyDifficulty(page: Page, level: 'Easy' | 'Normal' | 'Hard') {
  const panel = page
    .locator(
      '.charades-sheet[role="dialog"] .charades-filters__body, details.charades-filters--desktop[open] .charades-filters__body',
    )
    .first();
  await panel.getByRole('button', { name: level, exact: true }).click();
}

async function openPlayFilters(page: Page) {
  await page.getByRole('button', { name: 'Filters' }).click();
  await expect(page.locator('.charades-play-footer__popup')).toBeVisible();
}

async function openPlayDifficultyOptions(page: Page) {
  await openPlayFilters(page);
  const difficultyCategory = page.getByRole('button', { name: 'Difficulty', exact: true });
  if (await difficultyCategory.isVisible()) {
    await difficultyCategory.click();
  }
}

/** Play screen: open filters and choose a level to draw a card. */
async function drawCardAtDifficulty(page: Page, level: 'Easy' | 'Normal' | 'Hard') {
  await openPlayDifficultyOptions(page);
  await page.getByRole('option', { name: level, exact: true }).click();
}

test.describe('Charades solo play', () => {
  test('guest can start charades and reveal a card', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'Play', exact: true })).toBeVisible();
    await page.getByRole('button', { name: /Charades/i }).click();
    await page.waitForURL('**/play/charades');

    await page.getByRole('button', { name: 'Animals' }).click();
    await openCharadesSetupFilters(page);
    await selectOnlyDifficulty(page, 'Easy');
    await expect(page.getByText(/\d+ cards in this round/)).toBeVisible();

    await page.getByRole('button', { name: /^Start/ }).click();
    await page.waitForURL('**/play/charades/game');

    await expect(page.getByText('Pick a difficulty in filters')).toBeVisible();
    const flipCard = page.getByRole('button', { name: 'Flip card', exact: true });
    await expect(flipCard).toBeDisabled();
    await drawCardAtDifficulty(page, 'Easy');
    await expect(flipCard).toBeEnabled();
    await flipCard.click();
    await expect(page.getByText('Word', { exact: true })).toBeVisible();

    await page.getByRole('button', { name: 'Done', exact: true }).click();
    await expect(page.getByText('Tap to flip')).toBeVisible();
    await expect(flipCard).toBeEnabled();
  });

  test('movies pack can disable actors and still start', async ({ page }) => {
    await page.goto('/play/charades');

    await page
      .locator('.charades-pack-card')
      .filter({ hasText: 'Titles, quotes, characters, and actors' })
      .click();
    await openCharadesSetupFilters(page);
    await selectOnlyDifficulty(page, 'Easy');
    await page.getByRole('button', { name: 'Actors', exact: true }).click();

    await expect(page.getByText(/cards in this round/)).toBeVisible();
    await page.getByRole('button', { name: /^Start/ }).click();
    await page.waitForURL('**/play/charades/game');

    await drawCardAtDifficulty(page, 'Easy');
    await page.getByRole('button', { name: 'Flip card', exact: true }).click();
    await expect(page.getByText('Actor', { exact: true })).not.toBeVisible();
  });

  test('gen-alpha filter narrows movies and still starts', async ({ page }) => {
    await page.goto('/play/charades');

    await page
      .locator('.charades-pack-card')
      .filter({ hasText: /^Movies/ })
      .click();
    await openCharadesSetupFilters(page);
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
    await openCharadesSetupFilters(page);
    await page.getByRole('button', { name: 'Titles', exact: true }).click();
    await page.getByRole('button', { name: 'Characters', exact: true }).click();
    await page.getByRole('button', { name: 'Actors', exact: true }).click();
    await page.getByRole('button', { name: /^Start/ }).click();
    await page.waitForURL('**/play/charades/game');

    await drawCardAtDifficulty(page, 'Easy');
    await page.getByRole('button', { name: 'Flip card', exact: true }).click();
    await expect(page.getByRole('toolbar', { name: 'Extra clues' })).toBeVisible();
    await page.getByRole('button', { name: 'Context', exact: true }).click();
    await expect(page.getByRole('region', { name: 'Context' })).toBeVisible();
  });

  test('filters summary shows difficulty and generations', async ({ page }) => {
    await page.goto('/play/charades');
    await page.getByRole('button', { name: 'Animals' }).click();

    const summary = page.locator('.charades-fab__hint, .charades-filters__value').first();
    await expect(summary).toHaveText('Single pack · All difficulties · All players');

    await openCharadesSetupFilters(page);
    await selectOnlyDifficulty(page, 'Hard');
    await page.getByRole('button', { name: /^Gen Alpha/ }).click();

    await expect(summary).toHaveText('Single pack · Hard · Gen Z, Millennials, Gen X+');
  });

  test('multi-pack mode mixes animals and movies', async ({ page }) => {
    await page.goto('/play/charades');

    await openCharadesSetupFilters(page);
    await page.getByRole('button', { name: 'Multi-pack off', exact: true }).click();

    await page.getByRole('button', { name: 'Animals' }).click();
    await page.getByRole('button', { name: /^Movies/ }).click();
    await expect(page.getByText(/\d+ cards in this round.*2 packs/)).toBeVisible();

    await page.getByRole('button', { name: /^Start/ }).click();
    await page.waitForURL('**/play/charades/game');
    await expect(page.getByRole('heading', { name: 'Mixed · 2 packs' })).toBeVisible();
  });

  test('play filters draw card by difficulty', async ({ page }) => {
    await page.goto('/play/charades');
    await page.getByRole('button', { name: 'Animals' }).click();
    await page.getByRole('button', { name: /^Start/ }).click();
    await page.waitForURL('**/play/charades/game');

    await expect(
      page.getByText('Open filters to pick a difficulty, then flip your card'),
    ).toBeVisible();
    await drawCardAtDifficulty(page, 'Hard');
    await page.getByRole('button', { name: 'Flip card', exact: true }).click();
    await expect(page.locator('.card-flip--revealed.card-flip--difficulty-level')).toBeVisible();
    await expect(page.locator('.card-face__difficulty')).toHaveText(/^(7|8|9|10)$/);
  });

  test('tap card back reveals without filter controls visible', async ({ page }) => {
    await page.goto('/play/charades');
    await page.getByRole('button', { name: 'Animals' }).click();
    await page.getByRole('button', { name: /^Start/ }).click();
    await page.waitForURL('**/play/charades/game');

    await drawCardAtDifficulty(page, 'Easy');
    await expect(page.getByRole('button', { name: 'Filters' })).toBeVisible();
    await page.getByRole('button', { name: 'Flip charades card' }).click();
    await expect(page.getByText('Word', { exact: true })).toBeVisible();
    await expect(page.locator('.charades-play-footer__filter-trigger')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Done', exact: true })).toBeVisible();
  });

  test('play footer shows filter, end round, and flip card in one row', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 428, height: 926 },
    });
    const page = await context.newPage();

    await page.goto('/play/charades');
    await page.locator('.charades-pack-card').filter({ hasText: 'Animals' }).first().click();
    await page.getByRole('button', { name: /^Start/ }).click();
    await page.waitForURL('**/play/charades/game');

    const footer = page.locator('.charades-play-footer');
    const filter = footer.locator('.charades-play-footer__filter-trigger');
    const endRound = footer.getByRole('button', { name: 'End round', exact: true });
    const flipCard = footer.getByRole('button', { name: 'Flip card', exact: true });
    await expect(filter).toBeVisible();
    await expect(endRound).toBeVisible();
    await expect(flipCard).toBeVisible();
    await expect(flipCard).toBeDisabled();

    const filterBox = await filter.boundingBox();
    const endBox = await endRound.boundingBox();
    const flipBox = await flipCard.boundingBox();
    expect(filterBox).not.toBeNull();
    expect(endBox).not.toBeNull();
    expect(flipBox).not.toBeNull();
    expect(Math.abs(filterBox!.y - endBox!.y)).toBeLessThan(8);
    expect(Math.abs(endBox!.y - flipBox!.y)).toBeLessThan(8);

    await context.close();
  });

  test('mobile Start button does not click through to pack cards behind dock', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 428, height: 926 },
    });
    const page = await context.newPage();

    await page.goto('/play/charades');
    await page.locator('.charades-pack-card').filter({ hasText: 'Animals' }).first().click();
    await expect(page.locator('.charades-pack-card--selected')).toHaveCount(1);

    const scroll = page.locator('.charades-page__scroll');
    await scroll.evaluate((el) => {
      el.scrollTop = el.scrollHeight;
    });

    const moviesPack = page.locator('.charades-pack-card').filter({ hasText: /^Movies/ });
    const startButton = page
      .locator('.charades-fab-dock--setup')
      .getByRole('button', { name: /^Start/ });
    const moviesBox = await moviesPack.boundingBox();
    const startBox = await startButton.boundingBox();
    expect(moviesBox).not.toBeNull();
    expect(startBox).not.toBeNull();

    // After scrolling, a pack tile often sits under the dock; Start must win the hit test.
    if (
      moviesBox!.y < startBox!.y + startBox!.height &&
      moviesBox!.y + moviesBox!.height > startBox!.y
    ) {
      await startButton.click({ position: { x: startBox!.width / 2, y: startBox!.height / 2 } });
      await page.waitForURL('**/play/charades/game');
      await expect(page.locator('.charades-pack-card--selected')).toHaveCount(0);
    } else {
      await startButton.click();
      await page.waitForURL('**/play/charades/game');
    }

    await context.close();
  });

  test('landscape iPhone 13 Pro Max can start and flip a card', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 926, height: 428 },
    });
    const page = await context.newPage();

    await page.goto('/play/charades');
    await page.locator('.charades-pack-card').filter({ hasText: 'Animals' }).first().click();
    await openCharadesSetupFilters(page);
    await selectOnlyDifficulty(page, 'Easy');
    await page.getByRole('button', { name: 'Done' }).click();
    await page.getByRole('button', { name: /^Start/ }).click();
    await page.waitForURL('**/play/charades/game');

    await expect(
      page.locator('.charades-play-footer').getByRole('button', { name: 'Flip card', exact: true }),
    ).toBeVisible();
    await drawCardAtDifficulty(page, 'Easy');
    await page.getByRole('button', { name: 'Flip card', exact: true }).click();
    await expect(page.getByText('Word', { exact: true })).toBeVisible();

    await context.close();
  });
});
