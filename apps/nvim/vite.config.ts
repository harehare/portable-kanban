import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: ['babel-plugin-react-compiler'],
      },
    }),
  ],
  resolve: {
    alias: {
      '@portable-kanban/core': resolve(__dirname, '../../packages/core/src/index.ts'),
    },
  },
  build: {
    outDir: 'dist',
    target: 'node18',
    lib: {
      entry: 'src/index.tsx',
      name: 'tui',
      formats: ['es'],
      fileName: () => 'tui.js',
    },
    rollupOptions: {
      external: ['ink', 'react', 'node:fs', 'node:path', 'node:process'],
    },
  },
});
