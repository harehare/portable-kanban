#!/usr/bin/env node
/**
 * portable-kanban MCP server
 *
 * Exposes .kanban files as MCP tools so AI assistants (Claude Desktop,
 * GitHub Copilot, etc.) can read and manipulate kanban boards.
 *
 * Usage:
 *   node dist/index.js [board-path-or-directory]
 *
 * If a directory is given, all *.kanban files inside are accessible.
 * If a single file is given, only that board is accessible.
 * If omitted, defaults to the current working directory.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { resolve, join, basename, normalize } from 'node:path';
import { fromJson, toJson } from '@portable-kanban/core';
import type { Kanban, Card, List } from '@portable-kanban/core';

// ---------------------------------------------------------------------------
// Board file helpers
// ---------------------------------------------------------------------------

const rootPath = resolve(process.argv[2] ?? process.cwd());

function findBoards(): string[] {
  if (!existsSync(rootPath)) return [];
  const stat = statSync(rootPath);
  if (stat.isFile() && rootPath.endsWith('.kanban')) return [rootPath];
  if (stat.isDirectory()) {
    return readdirSync(rootPath)
      .filter((f) => f.endsWith('.kanban'))
      .map((f) => join(rootPath, f));
  }
  return [];
}

async function readBoard(path: string): Promise<Kanban> {
  const text = readFileSync(path, 'utf-8');
  return fromJson(text);
}

function saveBoard(path: string, kanban: Kanban): void {
  writeFileSync(path, toJson(kanban), 'utf-8');
}

function resolveBoardPath(name: string): string {
  const withExt = name.endsWith('.kanban') ? name : `${name}.kanban`;

  // When rootPath is itself a .kanban file, only that board is accessible.
  const rootStat = existsSync(rootPath) ? statSync(rootPath) : null;
  if (rootStat?.isFile()) {
    if (basename(withExt) === basename(rootPath)) return rootPath;
    throw new Error(`Board not found: ${name}`);
  }

  // rootPath is a directory — strip all directory components to prevent traversal,
  // then resolve strictly inside rootPath.
  const safeName = basename(withExt);
  const resolved = normalize(join(rootPath, safeName));
  if (!resolved.startsWith(rootPath + '/') && resolved !== rootPath) {
    throw new Error(`Board not found: ${name}`);
  }
  if (!resolved.endsWith('.kanban')) {
    throw new Error(`Board not found: ${name}`);
  }
  if (existsSync(resolved)) return resolved;
  throw new Error(`Board not found: ${name}`);
}

function findCard(kanban: Kanban, cardId: string): { card: Card; listIndex: number; cardIndex: number } | null {
  for (let li = 0; li < kanban.lists.length; li++) {
    const ci = kanban.lists[li].cards.findIndex((c) => c.id === cardId);
    if (ci !== -1) return { card: kanban.lists[li].cards[ci], listIndex: li, cardIndex: ci };
  }
  return null;
}

function findList(kanban: Kanban, listNameOrId: string): { list: List; index: number } | null {
  const byId = kanban.lists.findIndex((l) => l.id === listNameOrId);
  if (byId !== -1) return { list: kanban.lists[byId], index: byId };
  const byTitle = kanban.lists.findIndex((l) => l.title.toLowerCase() === listNameOrId.toLowerCase());
  if (byTitle !== -1) return { list: kanban.lists[byTitle], index: byTitle };
  return null;
}

function formatBoard(kanban: Kanban, boardName: string): string {
  const lines: string[] = [`# ${boardName}\n`];
  for (const list of kanban.lists) {
    lines.push(`## ${list.title} (${list.cards.length} cards)`);
    if (list.cards.length === 0) {
      lines.push('  (empty)');
    }
    for (const card of list.cards) {
      lines.push(`  - [${card.id}] ${card.title}`);
      if (card.description) lines.push(`      desc: ${card.description}`);
      if (card.dueDate) lines.push(`      due:  ${card.dueDate}`);
      if (card.labels.length) lines.push(`      labels: ${card.labels.map((l) => l.title).join(', ')}`);
      if (card.checkboxes.length) {
        const done = card.checkboxes.filter((c) => c.checked).length;
        lines.push(`      tasks: ${done}/${card.checkboxes.length} done`);
        card.checkboxes.forEach((cb, i) => {
          lines.push(`        ${i + 1}. [${cb.checked ? 'x' : ' '}] ${cb.title}`);
        });
      }
      if (card.comments.length) {
        lines.push(`      comments (${card.comments.length}):`);
        card.comments.forEach((c) => lines.push(`        › ${c.comment}`));
      }
    }
    lines.push('');
  }
  if (kanban.archive.cards.length > 0) {
    lines.push(`## Archive: ${kanban.archive.cards.length} cards`);
  }
  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// MCP Server
// ---------------------------------------------------------------------------

const server = new Server(
  { name: 'portable-kanban', version: '1.0.0' },
  { capabilities: { tools: {}, resources: {} } },
);

// ---------------------------------------------------------------------------
// Resources — expose .kanban files as readable resources
// ---------------------------------------------------------------------------

server.setRequestHandler(ListResourcesRequestSchema, async () => {
  const boards = findBoards();
  return {
    resources: boards.map((p) => ({
      uri: `kanban:///${p}`,
      name: basename(p, '.kanban'),
      description: `Kanban board: ${p}`,
      mimeType: 'application/json',
    })),
  };
});

server.setRequestHandler(ReadResourceRequestSchema, async (req) => {
  const uri = req.params.uri;
  if (!uri.startsWith('kanban:///')) {
    throw new Error(`Invalid resource URI: ${uri}`);
  }
  const rawPath = uri.slice('kanban:///'.length);
  const path = resolveBoardPath(rawPath);
  const kanban = await readBoard(path);
  return {
    contents: [
      {
        uri: req.params.uri,
        mimeType: 'application/json',
        text: toJson(kanban),
      },
    ],
  };
});

// ---------------------------------------------------------------------------
// Tools
// ---------------------------------------------------------------------------

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'list_boards',
      description: 'List all available .kanban board files.',
      inputSchema: { type: 'object', properties: {} },
    },
    {
      name: 'read_board',
      description: 'Read a kanban board and return a human-readable summary of all lists and cards.',
      inputSchema: {
        type: 'object',
        required: ['board'],
        properties: {
          board: { type: 'string', description: 'Board file path or name (e.g. "work" or "/path/to/work.kanban")' },
        },
      },
    },
    {
      name: 'add_card',
      description: 'Add a new card to a list on the kanban board.',
      inputSchema: {
        type: 'object',
        required: ['board', 'list', 'title'],
        properties: {
          board:       { type: 'string', description: 'Board file path or name' },
          list:        { type: 'string', description: 'List title or ID to add the card to' },
          title:       { type: 'string', description: 'Card title' },
          description: { type: 'string', description: 'Card description (optional)' },
          due_date:    { type: 'string', description: 'Due date in YYYY-MM-DD format (optional)' },
        },
      },
    },
    {
      name: 'edit_card',
      description: 'Edit an existing card\'s title, description, or due date.',
      inputSchema: {
        type: 'object',
        required: ['board', 'card_id'],
        properties: {
          board:       { type: 'string', description: 'Board file path or name' },
          card_id:     { type: 'string', description: 'Card ID (shown in read_board output)' },
          title:       { type: 'string', description: 'New title (optional)' },
          description: { type: 'string', description: 'New description (optional)' },
          due_date:    { type: 'string', description: 'New due date YYYY-MM-DD, or "" to clear (optional)' },
        },
      },
    },
    {
      name: 'move_card',
      description: 'Move a card to a different list.',
      inputSchema: {
        type: 'object',
        required: ['board', 'card_id', 'target_list'],
        properties: {
          board:       { type: 'string', description: 'Board file path or name' },
          card_id:     { type: 'string', description: 'Card ID' },
          target_list: { type: 'string', description: 'Target list title or ID' },
        },
      },
    },
    {
      name: 'delete_card',
      description: 'Delete a card from the board.',
      inputSchema: {
        type: 'object',
        required: ['board', 'card_id'],
        properties: {
          board:   { type: 'string', description: 'Board file path or name' },
          card_id: { type: 'string', description: 'Card ID' },
        },
      },
    },
    {
      name: 'add_list',
      description: 'Add a new list to the kanban board.',
      inputSchema: {
        type: 'object',
        required: ['board', 'title'],
        properties: {
          board: { type: 'string', description: 'Board file path or name' },
          title: { type: 'string', description: 'List title' },
        },
      },
    },
    {
      name: 'add_task',
      description: 'Add a task (checkbox item) to a card.',
      inputSchema: {
        type: 'object',
        required: ['board', 'card_id', 'task'],
        properties: {
          board:   { type: 'string', description: 'Board file path or name' },
          card_id: { type: 'string', description: 'Card ID' },
          task:    { type: 'string', description: 'Task title' },
        },
      },
    },
    {
      name: 'toggle_task',
      description: 'Toggle a task checkbox on a card (checked ↔ unchecked).',
      inputSchema: {
        type: 'object',
        required: ['board', 'card_id', 'task_index'],
        properties: {
          board:      { type: 'string', description: 'Board file path or name' },
          card_id:    { type: 'string', description: 'Card ID' },
          task_index: { type: 'number', description: '1-based task index (as shown in read_board)' },
        },
      },
    },
    {
      name: 'add_comment',
      description: 'Add a comment to a card.',
      inputSchema: {
        type: 'object',
        required: ['board', 'card_id', 'comment'],
        properties: {
          board:   { type: 'string', description: 'Board file path or name' },
          card_id: { type: 'string', description: 'Card ID' },
          comment: { type: 'string', description: 'Comment text' },
        },
      },
    },
    // ---- Agentic workflow tools ----
    {
      name: 'get_card',
      description: 'Get full details of a single card by ID.',
      inputSchema: {
        type: 'object',
        required: ['board', 'card_id'],
        properties: {
          board:   { type: 'string', description: 'Board file path or name' },
          card_id: { type: 'string', description: 'Card ID' },
        },
      },
    },
    {
      name: 'get_next_card',
      description:
        'Get the first card from a specified list (e.g. "To Do"). ' +
        'Use this to pick the next task for an agent to work on.',
      inputSchema: {
        type: 'object',
        required: ['board', 'list'],
        properties: {
          board: { type: 'string', description: 'Board file path or name' },
          list:  { type: 'string', description: 'List title or ID to pick from (e.g. "To Do")' },
        },
      },
    },
    {
      name: 'start_card',
      description:
        'Mark a card as "in progress": moves it to the specified in-progress list and ' +
        'records a start comment with the current timestamp. ' +
        'Call this before the agent begins working on a card.',
      inputSchema: {
        type: 'object',
        required: ['board', 'card_id'],
        properties: {
          board:         { type: 'string', description: 'Board file path or name' },
          card_id:       { type: 'string', description: 'Card ID to start' },
          in_progress_list: {
            type: 'string',
            description: 'Name of the in-progress list (default: "Doing" or "In Progress")',
          },
        },
      },
    },
    {
      name: 'complete_card',
      description:
        'Mark a card as done: checks all remaining tasks, adds a completion comment, ' +
        'and moves the card to the done list. ' +
        'Call this after the agent has finished all work for a card.',
      inputSchema: {
        type: 'object',
        required: ['board', 'card_id'],
        properties: {
          board:     { type: 'string', description: 'Board file path or name' },
          card_id:   { type: 'string', description: 'Card ID to complete' },
          summary:   { type: 'string', description: 'Optional summary of what was done' },
          done_list: { type: 'string', description: 'Name of the done list (default: "Done")' },
        },
      },
    },
  ],
}));

// ---------------------------------------------------------------------------
// Tool handlers
// ---------------------------------------------------------------------------

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name, arguments: args } = req.params;
  const a = (args ?? {}) as Record<string, unknown>;

  try {
    // --- list_boards ---
    if (name === 'list_boards') {
      const boards = findBoards();
      if (boards.length === 0) {
        return { content: [{ type: 'text', text: `No .kanban files found in: ${rootPath}` }] };
      }
      const lines = boards.map((p) => `- ${basename(p, '.kanban')}  (${p})`);
      return { content: [{ type: 'text', text: `Found ${boards.length} board(s):\n${lines.join('\n')}` }] };
    }

    // --- read_board ---
    if (name === 'read_board') {
      const path = resolveBoardPath(String(a.board));
      const kanban = await readBoard(path);
      return { content: [{ type: 'text', text: formatBoard(kanban, basename(path, '.kanban')) }] };
    }

    // --- add_card ---
    if (name === 'add_card') {
      const path = resolveBoardPath(String(a.board));
      const kanban = await readBoard(path);
      const listResult = findList(kanban, String(a.list));
      if (!listResult) throw new Error(`List not found: ${a.list}`);

      const newCard: Card = {
        id: crypto.randomUUID(),
        listId: listResult.list.id,
        title: String(a.title),
        description: a.description ? String(a.description) : '',
        dueDate: a.due_date ? new Date(String(a.due_date)) : undefined,
        labels: [],
        checkboxes: [],
        comments: [],
      };

      kanban.lists[listResult.index].cards.push(newCard);
      saveBoard(path, kanban);
      return { content: [{ type: 'text', text: `Added card "${newCard.title}" [${newCard.id}] to "${listResult.list.title}"` }] };
    }

    // --- edit_card ---
    if (name === 'edit_card') {
      const path = resolveBoardPath(String(a.board));
      const kanban = await readBoard(path);
      const result = findCard(kanban, String(a.card_id));
      if (!result) throw new Error(`Card not found: ${a.card_id}`);

      const card = kanban.lists[result.listIndex].cards[result.cardIndex];
      if (a.title !== undefined) card.title = String(a.title);
      if (a.description !== undefined) card.description = String(a.description);
      if (a.due_date !== undefined) card.dueDate = String(a.due_date) === '' ? undefined : new Date(String(a.due_date));

      saveBoard(path, kanban);
      return { content: [{ type: 'text', text: `Updated card "${card.title}" [${card.id}]` }] };
    }

    // --- move_card ---
    if (name === 'move_card') {
      const path = resolveBoardPath(String(a.board));
      const kanban = await readBoard(path);
      const cardResult = findCard(kanban, String(a.card_id));
      if (!cardResult) throw new Error(`Card not found: ${a.card_id}`);
      const targetResult = findList(kanban, String(a.target_list));
      if (!targetResult) throw new Error(`Target list not found: ${a.target_list}`);

      const { card, listIndex, cardIndex } = cardResult;
      kanban.lists[listIndex].cards.splice(cardIndex, 1);
      card.listId = targetResult.list.id;
      kanban.lists[targetResult.index].cards.push(card);

      saveBoard(path, kanban);
      return { content: [{ type: 'text', text: `Moved card "${card.title}" to "${targetResult.list.title}"` }] };
    }

    // --- delete_card ---
    if (name === 'delete_card') {
      const path = resolveBoardPath(String(a.board));
      const kanban = await readBoard(path);
      const result = findCard(kanban, String(a.card_id));
      if (!result) throw new Error(`Card not found: ${a.card_id}`);

      const title = result.card.title;
      kanban.lists[result.listIndex].cards.splice(result.cardIndex, 1);
      saveBoard(path, kanban);
      return { content: [{ type: 'text', text: `Deleted card "${title}" [${a.card_id}]` }] };
    }

    // --- add_list ---
    if (name === 'add_list') {
      const path = resolveBoardPath(String(a.board));
      const kanban = await readBoard(path);
      const newList: List = { id: crypto.randomUUID(), title: String(a.title), cards: [] };
      kanban.lists.push(newList);
      saveBoard(path, kanban);
      return { content: [{ type: 'text', text: `Added list "${newList.title}" [${newList.id}]` }] };
    }

    // --- add_task ---
    if (name === 'add_task') {
      const path = resolveBoardPath(String(a.board));
      const kanban = await readBoard(path);
      const result = findCard(kanban, String(a.card_id));
      if (!result) throw new Error(`Card not found: ${a.card_id}`);

      const card = kanban.lists[result.listIndex].cards[result.cardIndex];
      card.checkboxes.push({ id: crypto.randomUUID(), title: String(a.task), checked: false });
      saveBoard(path, kanban);
      return { content: [{ type: 'text', text: `Added task "${a.task}" to card "${card.title}"` }] };
    }

    // --- toggle_task ---
    if (name === 'toggle_task') {
      const path = resolveBoardPath(String(a.board));
      const kanban = await readBoard(path);
      const result = findCard(kanban, String(a.card_id));
      if (!result) throw new Error(`Card not found: ${a.card_id}`);

      const card = kanban.lists[result.listIndex].cards[result.cardIndex];
      const idx = Number(a.task_index) - 1;
      if (idx < 0 || idx >= card.checkboxes.length) {
        throw new Error(`Task index ${a.task_index} out of range (1–${card.checkboxes.length})`);
      }
      card.checkboxes[idx].checked = !card.checkboxes[idx].checked;
      const state = card.checkboxes[idx].checked ? 'checked' : 'unchecked';
      saveBoard(path, kanban);
      return { content: [{ type: 'text', text: `Task "${card.checkboxes[idx].title}" is now ${state}` }] };
    }

    // --- add_comment ---
    if (name === 'add_comment') {
      const path = resolveBoardPath(String(a.board));
      const kanban = await readBoard(path);
      const result = findCard(kanban, String(a.card_id));
      if (!result) throw new Error(`Card not found: ${a.card_id}`);

      const card = kanban.lists[result.listIndex].cards[result.cardIndex];
      card.comments.push({ id: crypto.randomUUID(), comment: String(a.comment) });
      saveBoard(path, kanban);
      return { content: [{ type: 'text', text: `Added comment to card "${card.title}"` }] };
    }

    // --- get_card ---
    if (name === 'get_card') {
      const path = resolveBoardPath(String(a.board));
      const kanban = await readBoard(path);
      const result = findCard(kanban, String(a.card_id));
      if (!result) throw new Error(`Card not found: ${a.card_id}`);

      const { card, listIndex } = result;
      const listTitle = kanban.lists[listIndex].title;
      const lines = [
        `Card: ${card.title}`,
        `ID: ${card.id}`,
        `List: ${listTitle}`,
      ];
      if (card.description) lines.push(`Description: ${card.description}`);
      if (card.dueDate) lines.push(`Due: ${card.dueDate instanceof Date ? card.dueDate.toISOString().slice(0, 10) : card.dueDate}`);
      if (card.labels.length) lines.push(`Labels: ${card.labels.map((l) => l.title).join(', ')}`);
      if (card.checkboxes.length) {
        const done = card.checkboxes.filter((c) => c.checked).length;
        lines.push(`Tasks (${done}/${card.checkboxes.length} done):`);
        card.checkboxes.forEach((cb, i) => {
          lines.push(`  ${i + 1}. [${cb.checked ? 'x' : ' '}] ${cb.title}`);
        });
      }
      if (card.comments.length) {
        lines.push(`Comments (${card.comments.length}):`);
        card.comments.forEach((c) => lines.push(`  › ${c.comment}`));
      }
      return { content: [{ type: 'text', text: lines.join('\n') }] };
    }

    // --- get_next_card ---
    if (name === 'get_next_card') {
      const path = resolveBoardPath(String(a.board));
      const kanban = await readBoard(path);
      const listResult = findList(kanban, String(a.list));
      if (!listResult) throw new Error(`List not found: ${a.list}`);

      const { list } = listResult;
      if (list.cards.length === 0) {
        return { content: [{ type: 'text', text: `No cards in "${list.title}" — nothing to do.` }] };
      }
      const card = list.cards[0];
      const lines = [
        `Next card in "${list.title}":`,
        `  Title: ${card.title}`,
        `  ID: ${card.id}`,
      ];
      if (card.description) lines.push(`  Description: ${card.description}`);
      if (card.checkboxes.length) {
        lines.push(`  Tasks (${card.checkboxes.length}):`);
        card.checkboxes.forEach((cb, i) => lines.push(`    ${i + 1}. [ ] ${cb.title}`));
      }
      lines.push(`\nUse start_card with card_id="${card.id}" to begin working on it.`);
      return { content: [{ type: 'text', text: lines.join('\n') }] };
    }

    // --- start_card ---
    if (name === 'start_card') {
      const path = resolveBoardPath(String(a.board));
      const kanban = await readBoard(path);
      const result = findCard(kanban, String(a.card_id));
      if (!result) throw new Error(`Card not found: ${a.card_id}`);

      // Resolve in-progress list (try provided name, then common names)
      const inProgressName = a.in_progress_list ? String(a.in_progress_list) : '';
      const candidates = inProgressName
        ? [inProgressName]
        : ['Doing', 'In Progress', 'In progress', 'WIP', 'Active'];
      let inProgressResult = null;
      for (const c of candidates) {
        inProgressResult = findList(kanban, c);
        if (inProgressResult) break;
      }
      if (!inProgressResult) {
        throw new Error(
          `Could not find an in-progress list. Tried: ${candidates.join(', ')}. ` +
          `Specify in_progress_list explicitly.`,
        );
      }

      const { card, listIndex, cardIndex } = result;
      const fromList = kanban.lists[listIndex].title;

      // Move card
      kanban.lists[listIndex].cards.splice(cardIndex, 1);
      card.listId = inProgressResult.list.id;
      kanban.lists[inProgressResult.index].cards.push(card);

      // Add start comment
      const ts = new Date().toISOString().slice(0, 16).replace('T', ' ');
      card.comments.push({
        id: crypto.randomUUID(),
        comment: `[agent] Started at ${ts} (moved from "${fromList}")`,
      });

      saveBoard(path, kanban);
      return {
        content: [{
          type: 'text',
          text: [
            `Started card "${card.title}" [${card.id}]`,
            `Moved: "${fromList}" → "${inProgressResult.list.title}"`,
            card.checkboxes.length
              ? `Tasks to complete:\n${card.checkboxes.map((cb, i) => `  ${i + 1}. ${cb.title}`).join('\n')}`
              : '(no sub-tasks)',
          ].join('\n'),
        }],
      };
    }

    // --- complete_card ---
    if (name === 'complete_card') {
      const path = resolveBoardPath(String(a.board));
      const kanban = await readBoard(path);
      const result = findCard(kanban, String(a.card_id));
      if (!result) throw new Error(`Card not found: ${a.card_id}`);

      // Resolve done list
      const doneName = a.done_list ? String(a.done_list) : '';
      const doneCandidates = doneName ? [doneName] : ['Done', 'Completed', 'Complete', 'Finished'];
      let doneResult = null;
      for (const c of doneCandidates) {
        doneResult = findList(kanban, c);
        if (doneResult) break;
      }
      if (!doneResult) {
        throw new Error(
          `Could not find a done list. Tried: ${doneCandidates.join(', ')}. ` +
          `Specify done_list explicitly.`,
        );
      }

      const { card, listIndex, cardIndex } = result;
      const fromList = kanban.lists[listIndex].title;

      // Check all remaining tasks
      const unchecked = card.checkboxes.filter((cb) => !cb.checked).length;
      if (unchecked > 0) {
        card.checkboxes = card.checkboxes.map((cb) => ({ ...cb, checked: true }));
      }

      // Move to done
      kanban.lists[listIndex].cards.splice(cardIndex, 1);
      card.listId = doneResult.list.id;
      kanban.lists[doneResult.index].cards.push(card);

      // Add completion comment
      const ts = new Date().toISOString().slice(0, 16).replace('T', ' ');
      const summary = a.summary ? String(a.summary) : '';
      card.comments.push({
        id: crypto.randomUUID(),
        comment: `[agent] Completed at ${ts}${summary ? `\n${summary}` : ''}`,
      });

      saveBoard(path, kanban);
      const taskSummary = card.checkboxes.length
        ? `  Tasks: ${card.checkboxes.length}/${card.checkboxes.length} done`
        : '';
      return {
        content: [{
          type: 'text',
          text: [
            `Completed card "${card.title}" [${card.id}]`,
            `Moved: "${fromList}" → "${doneResult.list.title}"`,
            taskSummary,
            summary ? `Summary: ${summary}` : '',
          ].filter(Boolean).join('\n'),
        }],
      };
    }

    return { content: [{ type: 'text', text: `Unknown tool: ${name}` }], isError: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { content: [{ type: 'text', text: `Error: ${msg}` }], isError: true };
  }
});

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------

const transport = new StdioServerTransport();
await server.connect(transport);
