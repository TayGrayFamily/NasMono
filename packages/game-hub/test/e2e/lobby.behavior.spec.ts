import { expect, test } from '@playwright/test';

const suffix = () => Date.now().toString(36);

async function waitConnected(page: import('@playwright/test').Page) {
  await expect(page.getByText('Connected', { exact: true })).toBeVisible({ timeout: 15_000 });
}

async function login(page: import('@playwright/test').Page, name: string) {
  await page.goto('/login');
  await page.getByLabel('Display Name').fill(name);
  await page.getByRole('button', { name: 'Join Game' }).click();
  await page.waitForURL('**/lobbies**');
  await waitConnected(page);
}

test.describe('Game Hub lobby behavior (ADR-0009)', () => {
  test('host can create a lobby and sees host controls', async ({ page }) => {
    const lobbyName = `Smoke Lobby ${suffix()}`;
    await login(page, `Host-${suffix()}`);

    await page.getByPlaceholder('Enter lobby name...').fill(lobbyName);
    await page.getByRole('button', { name: 'Create Lobby' }).click();
    await page.waitForURL('**/lobbies/*');

    await expect(page.getByRole('heading', { name: lobbyName })).toBeVisible();
    await expect(page.getByText('👑 HOST')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Start Game' })).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Leave Lobby' })).toBeVisible();
  });

  test('lobby cards show leader and player count', async ({ browser }) => {
    const id = suffix();
    const lobbyName = `Card Lobby ${id}`;
    const hostName = `CardHost-${id}`;

    const hostContext = await browser.newContext();
    const hostPage = await hostContext.newPage();
    await login(hostPage, hostName);
    await hostPage.getByPlaceholder('Enter lobby name...').fill(lobbyName);
    await hostPage.getByRole('button', { name: 'Create Lobby' }).click();
    await hostPage.waitForURL('**/lobbies/*');

    const guestContext = await browser.newContext();
    const guestPage = await guestContext.newPage();
    await login(guestPage, `CardGuest-${id}`);

    const card = guestPage.getByRole('button', {
      name: new RegExp(`${lobbyName}.*Leader: ${hostName}`),
    });
    await expect(card).toBeVisible();
    await expect(card).toContainText('1 player');

    await hostContext.close();
    await guestContext.close();
  });

  test('guest auto-joins from lobby card and waits for host', async ({ browser }) => {
    const id = suffix();
    const lobbyName = `Join Lobby ${id}`;
    const hostName = `JoinHost-${id}`;

    const hostContext = await browser.newContext();
    const hostPage = await hostContext.newPage();
    await login(hostPage, hostName);
    await hostPage.getByPlaceholder('Enter lobby name...').fill(lobbyName);
    await hostPage.getByRole('button', { name: 'Create Lobby' }).click();
    await hostPage.waitForURL('**/lobbies/*');
    const lobbyUrl = hostPage.url();

    const guestContext = await browser.newContext();
    const guestPage = await guestContext.newPage();
    await login(guestPage, `JoinGuest-${id}`);
    await guestPage
      .getByRole('button', {
        name: new RegExp(`${lobbyName}.*Leader: ${hostName}`),
      })
      .click();
    await guestPage.waitForURL(lobbyUrl);

    await expect(guestPage.getByText('Waiting for host to start')).toBeVisible();
    await expect(guestPage.getByRole('button', { name: 'Leave Lobby' })).toBeVisible();

    await hostContext.close();
    await guestContext.close();
  });

  test('refresh restores lobby membership for a guest', async ({ browser }) => {
    const id = suffix();
    const lobbyName = `Restore Lobby ${id}`;

    const hostContext = await browser.newContext();
    const hostPage = await hostContext.newPage();
    await login(hostPage, `RestoreHost-${id}`);
    await hostPage.getByPlaceholder('Enter lobby name...').fill(lobbyName);
    await hostPage.getByRole('button', { name: 'Create Lobby' }).click();
    await hostPage.waitForURL('**/lobbies/*');

    const guestContext = await browser.newContext();
    const guestPage = await guestContext.newPage();
    await login(guestPage, `RestoreGuest-${id}`);
    await guestPage
      .getByRole('button', {
        name: new RegExp(`${lobbyName}.*Leader: RestoreHost-${id}`),
      })
      .click();
    await guestPage.waitForURL('**/lobbies/*', { timeout: 15_000 });
    const lobbyUrl = guestPage.url();

    await guestPage.reload();
    await waitConnected(guestPage);
    await expect(guestPage).toHaveURL(lobbyUrl);
    await expect(guestPage.getByText('Waiting for host to start')).toBeVisible();

    await hostContext.close();
    await guestContext.close();
  });

  test('host can open transfer menu for another player', async ({ browser }) => {
    const id = suffix();
    const lobbyName = `Transfer Lobby ${id}`;
    const guestName = `TransferGuest-${id}`;

    const hostName = `TransferHost-${id}`;

    const hostContext = await browser.newContext();
    const hostPage = await hostContext.newPage();
    await login(hostPage, hostName);
    await hostPage.getByPlaceholder('Enter lobby name...').fill(lobbyName);
    await hostPage.getByRole('button', { name: 'Create Lobby' }).click();
    await hostPage.waitForURL('**/lobbies/*');

    const guestContext = await browser.newContext();
    const guestPage = await guestContext.newPage();
    await login(guestPage, guestName);
    await guestPage
      .getByRole('button', {
        name: new RegExp(`${lobbyName}.*Leader: ${hostName}`),
      })
      .click();
    await guestPage.waitForURL('**/lobbies/*');

    await hostPage.bringToFront();
    await expect(hostPage.getByText(guestName)).toBeVisible({ timeout: 10_000 });
    await hostPage.getByRole('button', { name: '⋯' }).click();
    await expect(hostPage.getByRole('menuitem', { name: 'Make host' })).toBeVisible();

    await hostContext.close();
    await guestContext.close();
  });

  test('guest soft disconnect shows disconnected on host while membership persists', async ({
    browser,
  }) => {
    const id = suffix();
    const lobbyName = `Presence Lobby ${id}`;
    const guestName = `PresenceGuest-${id}`;
    const hostName = `PresenceHost-${id}`;

    const hostContext = await browser.newContext();
    const hostPage = await hostContext.newPage();
    await login(hostPage, hostName);
    await hostPage.getByPlaceholder('Enter lobby name...').fill(lobbyName);
    await hostPage.getByRole('button', { name: 'Create Lobby' }).click();
    await hostPage.waitForURL('**/lobbies/*');

    const guestContext = await browser.newContext();
    const guestPage = await guestContext.newPage();
    await login(guestPage, guestName);
    await guestPage
      .getByRole('button', {
        name: new RegExp(`${lobbyName}.*Leader: ${hostName}`),
      })
      .click();
    await guestPage.waitForURL('**/lobbies/*');

    await hostPage.bringToFront();
    const guestRow = hostPage.locator('.player-row', { hasText: guestName });
    await expect(guestRow).toBeVisible();
    await expect(guestRow.getByText('Disconnected')).not.toBeVisible();

    await guestContext.setOffline(true);
    await expect(guestPage.getByText('Offline', { exact: true })).toBeVisible({ timeout: 10_000 });
    await expect(guestPage.getByRole('button', { name: 'Leave Lobby' })).toBeVisible();
    await expect(guestRow.getByText('Disconnected')).toBeVisible({ timeout: 15_000 });

    await guestContext.setOffline(false);
    await guestPage.reload();
    await waitConnected(guestPage);
    await expect(guestPage.getByText('Waiting for host to start')).toBeVisible();

    await hostPage.bringToFront();
    await expect(guestRow.getByText('Disconnected')).not.toBeVisible({ timeout: 15_000 });

    await hostContext.close();
    await guestContext.close();
  });

  test('sign out leaves the lobby and does not auto-restore on next login', async ({ page }) => {
    const id = suffix();
    const lobbyName = `SignOut Lobby ${id}`;

    await login(page, `SignOutUser-${id}`);
    await page.getByPlaceholder('Enter lobby name...').fill(lobbyName);
    await page.getByRole('button', { name: 'Create Lobby' }).click();
    await page.waitForURL('**/lobbies/*');

    await page.getByRole('button', { name: new RegExp(`SignOutUser-${id}`) }).click();
    await page.getByRole('button', { name: 'Sign Out' }).click();
    await page.waitForURL('**/login');

    await login(page, `SignOutUser-${id}`);
    await expect(page).toHaveURL(/\/lobbies$/);
    await expect(page.getByRole('heading', { name: 'Game Lobbies' })).toBeVisible();
  });
});
