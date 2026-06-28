import type { LaunchPadAppConfig } from './launchpadSchema.js';
import type { ContainerDaemonState, ContainerRow } from './types.js';

export type LaunchPadApp = {
  id: string;
  displayName: string;
  url: string;
  iconUrl: string;
  state: ContainerDaemonState | 'unknown';
  statusText?: string;
  containerName?: string;
};

export type LaunchPadResponse = {
  apps: LaunchPadApp[];
  otherServices: ContainerRow[];
};

function matchesContainer(app: LaunchPadAppConfig, container: ContainerRow): boolean {
  let pattern: RegExp;
  try {
    pattern = new RegExp(app.containerMatch, 'i');
  } catch {
    console.warn(`[launchpad] invalid containerMatch for app "${app.id}": ${app.containerMatch}`);
    return false;
  }
  return pattern.test(container.name) || pattern.test(container.image);
}

function scoreContainerMatch(container: ContainerRow): number {
  let score = 0;
  if (container.state === 'running') score += 100;
  if (container.primaryPort) score += 50;
  return score;
}

function findMatchingContainer(
  app: LaunchPadAppConfig,
  containers: ContainerRow[],
): ContainerRow | null {
  const matches = containers.filter((c) => matchesContainer(app, c));
  if (matches.length === 0) return null;
  if (matches.length === 1) return matches[0];

  // Compose stacks often include stopped sidecar containers (e.g. immich-public-proxy)
  // that match broad patterns before the running web UI container.
  return matches.sort((a, b) => {
    const scoreDiff = scoreContainerMatch(b) - scoreContainerMatch(a);
    if (scoreDiff !== 0) return scoreDiff;
    return a.name.localeCompare(b.name);
  })[0];
}

export function mergeLaunchpadWithContainers(
  apps: LaunchPadAppConfig[],
  containers: ContainerRow[],
): LaunchPadResponse {
  const matchedContainerIds = new Set<string>();

  const mergedApps: LaunchPadApp[] = apps.map((app) => {
    const container = findMatchingContainer(app, containers);
    if (container) {
      matchedContainerIds.add(container.id);
    }

    return {
      id: app.id,
      displayName: app.displayName,
      url: app.url,
      iconUrl: app.iconUrl,
      state: container?.state ?? 'unknown',
      statusText: container?.statusText,
      containerName: container?.name,
    };
  });

  const sortFn = (a: ContainerRow, b: ContainerRow) => {
    if (a.state === 'running' && b.state !== 'running') return -1;
    if (a.state !== 'running' && b.state === 'running') return 1;
    return a.name.localeCompare(b.name);
  };

  const otherServices = containers.filter((c) => !matchedContainerIds.has(c.id)).sort(sortFn);

  mergedApps.sort((a, b) => {
    if (a.state === 'running' && b.state !== 'running') return -1;
    if (a.state !== 'running' && b.state === 'running') return 1;
    return a.displayName.localeCompare(b.displayName);
  });

  return { apps: mergedApps, otherServices };
}
