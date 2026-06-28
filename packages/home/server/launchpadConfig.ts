import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  parseLaunchPadApps,
  parseLaunchPadOverrides,
  type LaunchPadAppConfig,
  type LaunchPadAppOverride,
} from './launchpadSchema.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function defaultConfigPath(): string {
  return path.resolve(__dirname, '..', 'config', 'launchpad.apps.json');
}

function readJsonFile(filePath: string): unknown | null {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw) as unknown;
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === 'ENOENT') return null;
    console.warn(`[launchpad] failed to read ${filePath}:`, err);
    return null;
  }
}

export function loadDefaultLaunchPadApps(): LaunchPadAppConfig[] {
  const filePath = defaultConfigPath();
  const raw = readJsonFile(filePath);
  if (raw === null) {
    console.warn(`[launchpad] default config not found at ${filePath}`);
    return [];
  }
  return parseLaunchPadApps(raw, 'defaults');
}

export function loadLaunchPadOverrides(): LaunchPadAppOverride[] {
  const overridePath = process.env.LAUNCHPAD_CONFIG_PATH?.trim();
  if (!overridePath) return [];

  const raw = readJsonFile(overridePath);
  if (raw === null) return [];
  return parseLaunchPadOverrides(raw, overridePath);
}

export function mergeLaunchPadConfigs(
  defaults: LaunchPadAppConfig[],
  overrides: LaunchPadAppOverride[],
): LaunchPadAppConfig[] {
  const byId = new Map<string, LaunchPadAppConfig>();
  for (const app of defaults) {
    byId.set(app.id, { ...app });
  }

  for (const override of overrides) {
    const existing = byId.get(override.id);
    if (existing) {
      byId.set(override.id, { ...existing, ...override, id: override.id });
    } else if (
      override.displayName &&
      override.url &&
      override.iconUrl &&
      override.containerMatch
    ) {
      byId.set(override.id, override as LaunchPadAppConfig);
    } else {
      console.warn(
        `[launchpad] override for new app "${override.id}" missing required fields, skipping`,
      );
    }
  }

  return [...byId.values()].filter((app) => app.enabled !== false);
}

export function loadMergedLaunchPadApps(): LaunchPadAppConfig[] {
  return mergeLaunchPadConfigs(loadDefaultLaunchPadApps(), loadLaunchPadOverrides());
}
