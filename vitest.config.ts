import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'portable-kanban-core': resolve(__dirname, 'packages/core/src/index'),
      'portable-kanban-ui': resolve(__dirname, 'packages/ui/src/index'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['packages/ui/src/tests/setup.ts'],
    include: [
      'packages/core/src/tests/**/*.test.ts',
      'packages/ui/src/tests/**/*.test.tsx',
      'packages/ui/src/tests/**/*.test.ts',
    ],
    environmentOptions: {
      jsdom: {
        resources: 'usable',
      },
    },
  },
});
