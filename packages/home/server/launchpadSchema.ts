import { z } from 'zod';

export const launchPadAppConfigSchema = z.object({
  id: z.string().min(1),
  displayName: z.string().min(1),
  url: z.string().url(),
  /** Optional URL for reachability checks when the launch URL requires auth (e.g. Pi-hole /admin). */
  probeUrl: z.string().url().optional(),
  iconUrl: z.string().min(1),
  containerMatch: z.string().min(1),
  enabled: z.boolean().optional(),
});

/** Partial override entries may omit fields that stay from defaults. */
export const launchPadAppOverrideSchema = launchPadAppConfigSchema.partial().extend({
  id: z.string().min(1),
});

export const launchPadAppsFileSchema = z.array(z.unknown());

export type LaunchPadAppConfig = z.infer<typeof launchPadAppConfigSchema>;
export type LaunchPadAppOverride = z.infer<typeof launchPadAppOverrideSchema>;

export function parseLaunchPadApps(raw: unknown, label: string): LaunchPadAppConfig[] {
  const parsed = launchPadAppsFileSchema.safeParse(raw);
  if (!parsed.success) {
    console.warn(`[launchpad] ${label}: expected JSON array, skipping`);
    return [];
  }

  const apps: LaunchPadAppConfig[] = [];
  for (const entry of parsed.data) {
    const result = launchPadAppConfigSchema.safeParse(entry);
    if (result.success) {
      apps.push(result.data);
    } else {
      console.warn(`[launchpad] ${label}: invalid app entry`, entry, result.error.message);
    }
  }
  return apps;
}

export function parseLaunchPadOverrides(raw: unknown, label: string): LaunchPadAppOverride[] {
  const parsed = launchPadAppsFileSchema.safeParse(raw);
  if (!parsed.success) {
    console.warn(`[launchpad] ${label}: expected JSON array, skipping`);
    return [];
  }

  const overrides: LaunchPadAppOverride[] = [];
  for (const entry of parsed.data) {
    const result = launchPadAppOverrideSchema.safeParse(entry);
    if (result.success) {
      overrides.push(result.data);
    } else {
      console.warn(`[launchpad] ${label}: invalid override entry`, entry, result.error.message);
    }
  }
  return overrides;
}
