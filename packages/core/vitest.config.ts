import { resolve } from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@portable-kanban/core': resolve(__dirname, './src/index'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
  },
});
