import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chmodSync, writeFileSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Create a launcher that runs the TypeScript source via tsx.
// This avoids all CJS/ESM bundling issues with ink/yoga-layout.
const launcherCode = `#!/usr/bin/env node
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const tsx = resolve(__dirname, '..', 'node_modules', '.bin', 'tsx');
const entry = resolve(__dirname, '..', 'src', 'index.tsx');

const child = spawn(tsx, [entry, ...process.argv.slice(2)], { stdio: 'inherit' });
child.on('exit', (code) => process.exit(code ?? 0));
`;

const outfile = resolve(__dirname, 'dist/tui.mjs');
writeFileSync(outfile, launcherCode, 'utf8');
chmodSync(outfile, 0o755);
console.log('Built dist/tui.mjs (tsx launcher)');
