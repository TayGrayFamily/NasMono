import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vitest/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDir = path.resolve(__dirname, 'test/fixtures');

export default defineConfig({
  test: {
    environment: 'node',
    include: ['test/**/*.test.ts'],
    env: {
      NODE_ENV: 'test',
      DOCKER_FIXTURE_PATH: path.join(fixturesDir, 'containers.json'),
      UNRAID_API_KEY: '',
      UNRAID_GRAPHQL_URL: '',
      DOCKER_SOCKET_PATH: 'null',
    },
  },
});
