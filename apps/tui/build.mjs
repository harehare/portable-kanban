import { build } from 'esbuild';
import { chmodSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

await build({
  entryPoints: [resolve(__dirname, 'src/index.tsx')],
  bundle: true,
  platform: 'node',
  target: 'node18',
  format: 'esm',
  outfile: resolve(__dirname, 'dist/tui.mjs'),
  banner: { js: '#!/usr/bin/env node' },
  // ink and react are kept as runtime deps; everything else (core, jtv, uuid) is bundled in
  external: ['ink', 'react', 'react/jsx-runtime', 'node:*'],
  jsx: 'automatic',
  alias: {
    '@portable-kanban/core': resolve(__dirname, '../../packages/core/src/index.ts'),
  },
});

chmodSync(resolve(__dirname, 'dist/tui.mjs'), 0o755);
console.log('Built dist/tui.mjs');
