import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  plugins: [
    react({
      babel: {
        plugins: ['babel-plugin-react-compiler'],
      },
    }),
  ],
  resolve: {
    alias: {
      'portable-kanban-core': resolve(__dirname, '../../packages/core/src/index.ts'),
      'portable-kanban-ui': resolve(__dirname, '../../packages/ui/src/index.ts'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    lib: {
      entry: 'src/kanban.tsx',
      name: 'kanban',
      formats: ['iife'],
      fileName: () => 'kanban.js',
    },
    sourcemap: true,
  },
});
