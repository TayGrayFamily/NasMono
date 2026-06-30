import fs from 'fs';
import { z } from 'zod';
import type { ContainerRow, DockerSource } from './types.js';

const containerRowSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  state: z.enum([
    'running',
    'paused',
    'exited',
    'created',
    'restarting',
    'removing',
    'dead',
    'unknown',
  ]),
  statusText: z.string(),
  image: z.string(),
  publicPorts: z.array(
    z.object({
      hostPort: z.number(),
      containerPort: z.number(),
      protocol: z.string(),
      hostIp: z.string().nullable(),
    }),
  ),
  primaryPort: z
    .object({
      hostPort: z.number(),
      containerPort: z.number(),
      protocol: z.string(),
      hostIp: z.string().nullable(),
    })
    .nullable(),
  primaryPortLoopbackOnly: z.boolean(),
});

const fixtureFileSchema = z.array(containerRowSchema);

/** Deterministic container list for integration tests and local smoke runs. */
export class FixtureDockerSource implements DockerSource {
  private readonly containers: ContainerRow[];

  constructor(fixturePath: string) {
    const raw = fs.readFileSync(fixturePath, 'utf8');
    const parsed = fixtureFileSchema.parse(JSON.parse(raw));
    this.containers = parsed;
  }

  async listContainers(): Promise<ContainerRow[]> {
    return this.containers;
  }
}
