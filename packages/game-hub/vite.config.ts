import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs'; // Import the fs module

// Determine the root directory and read the root package.json
const rootDir = path.resolve(__dirname, '../..'); // Go up two levels from packages/game-hub
const packageJsonPath = path.join(rootDir, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
const appVersion = packageJson.version;

// Load environment variables
const env = loadEnv('development', process.cwd()); // Load environment variables

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      charades: path.resolve(__dirname, '../charades/src/index.ts'),
    },
  },
  // Define application-wide constants
  define: {
    __APP_VERSION__: JSON.stringify(appVersion), // Inject the version
  },
  server: {
    port: Number(process.env.GAME_HUB_DEV_PORT) || 3000,
    proxy: {
      '/api': {
        target: `http://localhost:${process.env.GAME_SERVER_PORT || 3001}`,
        changeOrigin: true,
      },
      '/socket.io': {
        target: `http://localhost:${process.env.GAME_SERVER_PORT || 3001}`,
        ws: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
