import { render } from 'ink';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fromJson, toJson } from 'portable-kanban-core';
import { App } from './App';

const [subcommand, ...args] = process.argv.slice(2);

function printUsage() {
  console.error('Usage:');
  console.error('  pkb <file.kanban>        Open a kanban file');
  console.error('  pkb new <file.kanban>    Create and open a new kanban file');
}

async function openKanban(filepath: string) {
  const absolutePath = resolve(filepath);
  let text: string;
  try {
    text = readFileSync(absolutePath, 'utf-8');
  } catch {
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

async function newKanban(filepath: string) {
  const absolutePath = resolve(
    filepath.endsWith('.kanban') ? filepath : `${filepath}.kanban`,
  );
  if (existsSync(absolutePath)) {
    console.error(`File already exists: ${absolutePath}`);
    process.exit(1);
  }
  const initial = JSON.stringify(
    {
      lists: [
        { id: crypto.randomUUID(), title: 'Backlog', cards: [] },
        { id: crypto.randomUUID(), title: 'To Do', cards: [] },
        { id: crypto.randomUUID(), title: 'Doing', cards: [] },
        { id: crypto.randomUUID(), title: 'Done', cards: [] },
      ],
      archive: { lists: [], cards: [] },
      settings: { labels: [] },
    },
    null,
    2,
  );
  try {
    writeFileSync(absolutePath, initial, 'utf-8');
  } catch {
    console.error(`Failed to create file: ${absolutePath}`);
    process.exit(1);
  }
  await openKanban(absolutePath);
}

async function main() {
  if (!subcommand) {
    printUsage();
    process.exit(1);
  }

  if (subcommand === 'new') {
    const target = args[0];
    if (!target) {
      console.error('Usage: pkb new <file.kanban>');
      process.exit(1);
    }
    await newKanban(target);
  } else {
    // subcommand is treated as the filepath
    await openKanban(subcommand);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
