import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@portable-kanban/core': resolve(__dirname, '../core/src/index'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts'],
    environmentOptions: {
      jsdom: {
        resources: 'usable',
      },
    },
  },
});
