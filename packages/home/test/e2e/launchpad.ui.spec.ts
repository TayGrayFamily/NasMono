import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('**/api/reachability**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true, status: 200, method: 'direct' }),
    });
  });
});

async function waitForLaunchPad(page: import('@playwright/test').Page) {
  await expect(page.getByRole('heading', { name: 'Web Applications' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Immich' })).toBeVisible();
}

test('LaunchPad page renders curated app tiles from fixtures', async ({ page }) => {
  await page.goto('/');
  await waitForLaunchPad(page);

  await expect(page.getByRole('heading', { name: 'Jellyfin' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Pihole' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Game Hub' })).toBeVisible();
});

test('running app tiles show container state and launch links', async ({ page }) => {
  await page.goto('/');
  await waitForLaunchPad(page);

  const immichCard = page.getByRole('link', { name: /^Immich\b/ });
  await expect(immichCard).toHaveAttribute('href', 'http://immich.tower');
  await expect(immichCard).toContainText('running');

  const jellyfinCard = page.getByRole('link', { name: /^Jellyfin\b/ });
  await expect(jellyfinCard).toHaveAttribute('href', 'http://jellyfin.tower');
  await expect(jellyfinCard).toContainText('running');

  const gameHubCard = page.getByRole('link', { name: /^Game Hub\b/ });
  await expect(gameHubCard).toHaveAttribute('href', 'http://games.tower');
  await expect(gameHubCard).toContainText('running');
});

test('apps without a matching container show no container status', async ({ page }) => {
  await page.goto('/');
  await waitForLaunchPad(page);

  const radarrCard = page.getByRole('link', { name: /^Radarr\b/ });
  await expect(radarrCard).toBeVisible();
  await expect(radarrCard).toContainText('no container');
});

test('reachability probes render for running apps', async ({ page }) => {
  await page.goto('/');
  await waitForLaunchPad(page);

  await expect(page.getByText('Responding (HTTP 200)').first()).toBeVisible({ timeout: 10_000 });
});

test('unmatched containers appear under System Services', async ({ page }) => {
  await page.goto('/');
  await waitForLaunchPad(page);

  // Exited immich-public-proxy (no app match) + game_server (secondary match) + watchtower
  await expect(page.getByText('System Services (3)')).toBeVisible();
  await page.getByText('System Services (3)').click();
  await expect(page.getByRole('heading', { name: 'watchtower' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'immich-public-proxy' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'game_server' })).toBeVisible();
});
