#!/usr/bin/env node
import * as React from 'react';
import { render } from 'ink';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fromJson, toJson } from '@portable-kanban/core';
import { App } from './App';

const filepath = process.argv[2];

if (!filepath) {
  console.error('Usage: portable-kanban-tui <file.kanban>');
  process.exit(1);
}

const absolutePath = resolve(filepath);

async function main() {
  let text: string;
  try {
    text = readFileSync(absolutePath, 'utf-8');
  } catch (err) {
    console.error(`Failed to read file: ${absolutePath}`);
    process.exit(1);
  }

  let kanban = await fromJson(text);
  const title = absolutePath.split('/').at(-1)?.replace('.kanban', '') ?? 'kanban';

  const { unmount } = render(
    <App
      kanban={kanban}
      title={title}
      onSave={(updated) => {
        kanban = updated;
        try {
          writeFileSync(absolutePath, toJson(updated), 'utf-8');
        } catch (err) {
          console.error('Failed to save file:', err);
        }
      }}
      onQuit={() => {
        unmount();
        process.exit(0);
      }}
    />,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
