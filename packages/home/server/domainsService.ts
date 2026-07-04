import fs from 'node:fs';
import path from 'node:path';
import { generateCaddyfile, generateDnsFile, parseCaddyfileRoutes } from './domainRoutes.js';
import { parseDomainsConfig, type DomainsConfig } from './domainRoutesSchema.js';

export type DomainsPaths = {
  configPath: string;
  caddyfilePath: string;
  dnsPath: string;
};

export type DomainsSaveResult = DomainsPaths & {
  caddyRestarted: boolean;
};

function resolvePath(primary: string | undefined, fallback: string | undefined): string {
  const value = primary?.trim() || fallback?.trim();
  if (!value) {
    throw new Error(
      'Domains paths not configured (DOMAINS_CONFIG_PATH / CADDYFILE_PATH / PIHOLE_DNS_PATH)',
    );
  }
  return value;
}

export function getDomainsPaths(): DomainsPaths {
  return {
    configPath: resolvePath(
      process.env.DOMAINS_CONFIG_PATH,
      process.env.DOMAINS_CONFIG_FIXTURE_PATH,
    ),
    caddyfilePath: resolvePath(process.env.CADDYFILE_PATH, process.env.CADDYFILE_FIXTURE_PATH),
    dnsPath: resolvePath(process.env.PIHOLE_DNS_PATH, process.env.PIHOLE_DNS_FIXTURE_PATH),
  };
}

function readJsonFile(filePath: string): unknown {
  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(raw) as unknown;
}

export function loadDomainsConfig(): DomainsConfig {
  const paths = getDomainsPaths();

  if (fs.existsSync(paths.configPath)) {
    const parsed = parseDomainsConfig(readJsonFile(paths.configPath), paths.configPath);
    if (parsed) return parsed;
  }

  if (fs.existsSync(paths.caddyfilePath)) {
    const caddyfile = fs.readFileSync(paths.caddyfilePath, 'utf8');
    const fromCaddy = parseCaddyfileRoutes(caddyfile);
    if (fromCaddy) return fromCaddy;
  }

  throw new Error('No domains config found — add domains.json or a parseable Caddyfile');
}

async function restartCaddyContainer(): Promise<boolean> {
  const fixture = process.env.CADDY_RESTART_FIXTURE?.trim();
  if (fixture) {
    if (fixture === 'ok') return true;
    if (fixture === 'fail') {
      throw new Error('Caddy container restart failed (fixture)');
    }
    throw new Error(`Invalid CADDY_RESTART_FIXTURE: ${fixture}`);
  }

  const containerName = process.env.CADDY_CONTAINER_NAME?.trim();
  const socketPath = process.env.DOCKER_SOCKET_PATH?.trim();
  if (!containerName || !socketPath || socketPath === 'null') {
    throw new Error('Caddy restart not configured (CADDY_CONTAINER_NAME / DOCKER_SOCKET_PATH)');
  }

  const Docker = (await import('dockerode')).default;
  const docker = new Docker({ socketPath });
  const container = docker.getContainer(containerName);
  await container.restart();
  return true;
}

export async function saveDomainsConfig(config: DomainsConfig): Promise<DomainsSaveResult> {
  const paths = getDomainsPaths();
  const caddyfile = generateCaddyfile(config);
  const dnsFile = generateDnsFile(config);

  for (const filePath of [paths.configPath, paths.caddyfilePath, paths.dnsPath]) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
  }

  fs.writeFileSync(paths.configPath, `${JSON.stringify(config, null, 2)}\n`, 'utf8');
  fs.writeFileSync(paths.caddyfilePath, caddyfile, 'utf8');
  fs.writeFileSync(paths.dnsPath, dnsFile, 'utf8');

  const caddyRestarted = await restartCaddyContainer();

  return { ...paths, caddyRestarted };
}
