import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
// import tsconfigPaths from 'vite-tsconfig-paths';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  envDir: path.resolve(__dirname, '../../'),
  server: {
    port: 8080,
    // proxy: {
    //   '/api': {
    //     target: 'http://tower:2283/api',
    //     changeOrigin: true,
    //     secure: false,
    //     // rewrite: (path) => path.replace(/^\/api/, ''), // Rewrite path if needed
    //   },
    // },
  },
});
