import type { DockerSource } from './types.js';
import { DockerodeSource } from './dockerodeSource.js';
import { FixtureDockerSource } from './fixtureDockerSource.js';
import { UnraidDockerSource } from './unraidSource.js';

export function createDockerSource(): DockerSource {
  const fixturePath = process.env.DOCKER_FIXTURE_PATH?.trim();
  if (fixturePath) {
    return new FixtureDockerSource(fixturePath);
  }

  const url = process.env.UNRAID_GRAPHQL_URL?.trim();
  const key = process.env.UNRAID_API_KEY?.trim();
  if (url && key) {
    return new UnraidDockerSource();
  }
  return new DockerodeSource();
}
