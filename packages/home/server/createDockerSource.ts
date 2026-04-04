import type { DockerSource } from './types.js';
import { DockerodeSource } from './dockerodeSource.js';
import { UnraidDockerSource } from './unraidSource.js';

export function createDockerSource(): DockerSource {
  const url = process.env.UNRAID_GRAPHQL_URL?.trim();
  const key = process.env.UNRAID_API_KEY?.trim();
  if (url && key) {
    return new UnraidDockerSource(url, key);
  }
  return new DockerodeSource();
}
