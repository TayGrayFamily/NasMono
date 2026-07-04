import { z } from 'zod';

/** Canonical Domains editor model — source of truth; Caddyfile + DNS are generated. */
export const domainRouteSchema = z.object({
  hostname: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i, {
      message: 'hostname must look like home.tower',
    }),
  port: z.number().int().min(1).max(65535),
});

export const domainsConfigSchema = z.object({
  /** LAN IP (or host gateway) used as upstream for every route — e.g. 192.168.1.50 */
  upstreamHost: z.ipv4(),
  routes: z.array(domainRouteSchema).min(1),
});

export type DomainRoute = z.infer<typeof domainRouteSchema>;
export type DomainsConfig = z.infer<typeof domainsConfigSchema>;

export function parseDomainsConfig(raw: unknown, label: string): DomainsConfig | null {
  const result = domainsConfigSchema.safeParse(raw);
  if (!result.success) {
    console.warn(`[domains] ${label}: invalid config`, result.error.message);
    return null;
  }
  return result.data;
}
