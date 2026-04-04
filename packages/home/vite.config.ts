import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import type { Connect, Plugin } from 'vite';
import { createApiRouter } from './server/apiRouter.js';

function nasmonoApiPlugin(mode: string): Plugin {
  return {
    name: 'nasmono-api',
    configureServer(server) {
      const envDir = path.resolve(__dirname, '../../');
      const env = loadEnv(mode, envDir, '');
      for (const key of ['UNRAID_GRAPHQL_URL', 'UNRAID_API_KEY', 'DOCKER_SOCKET_PATH'] as const) {
        const v = env[key];
        if (v !== undefined && v !== '' && process.env[key] === undefined) {
          process.env[key] = v;
        }
      }
      const router = createApiRouter();
      server.middlewares.use('/api', router as unknown as Connect.NextHandleFunction);
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    react(),
    nasmonoApiPlugin(mode),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  envDir: path.resolve(__dirname, '../../'),
  server: { port: 8888 },
}));
