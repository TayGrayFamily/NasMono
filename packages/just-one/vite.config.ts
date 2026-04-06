import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/main.tsx'), // Assuming your main entry point is src/index.ts
      name: 'Just One', // A global variable name for UMD build
      formats: ['es', 'cjs', 'umd'], // Output formats
      fileName: (format) => `just-one.${format}.js`,
    },
    rollupOptions: {
      // Make sure to externalize dependencies that shouldn't be bundled
      external: ['react', 'react-dom', 'socket.io-client'],
      output: {
        // Provide global variables for UMD build
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'socket.io-client': 'io',
        },
      },
    },
    outDir: 'dist', // Output directory for library builds
    emptyOutDir: true, // Clean the output directory before building
  },
});
