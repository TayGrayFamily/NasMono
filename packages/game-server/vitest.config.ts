import { defineConfig } from 'vitest/config';
import dotenv from 'dotenv';
import path from 'path';

export default defineConfig({
  test: {
    env: {
      ...dotenv.config({ path: path.resolve(__dirname, '../../.env') }).parsed,
      NODE_ENV: 'test',
    },
  },
});
