# Portable Kanban — MCP Server

An MCP (Model Context Protocol) server that lets AI assistants read and manipulate `.kanban` files.  
Works with Claude Desktop, GitHub Copilot, and any MCP-compatible AI tool.

Part of the [portable-kanban](https://github.com/harehare/portable-kanban) monorepo.

---

## Features

- 🤖 Exposes kanban board operations as MCP tools
- 📋 Full CRUD for cards, lists, tasks, and comments
- ⚡ Agentic workflow tools (`get_next_card`, `start_card`, `complete_card`) for autonomous task execution
- 📂 Scoped to a directory — only accesses `.kanban` files within the specified path

---

## Build

```bash
# From the repo root
pnpm build:mcp

# Or from this directory
pnpm build
```

---

## Setup

### Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "portable-kanban": {
      "command": "node",
      "args": [
        "/path/to/portable-kanban/apps/mcp/dist/index.js",
        "/path/to/your/boards/"
      ]
    }
  }
}
```

### GitHub Copilot CLI

```json
{
  "mcpServers": {
    "portable-kanban": {
      "command": "node",
      "args": ["/path/to/portable-kanban/apps/mcp/dist/index.js", "."]
    }
  }
}
```

---

## Available Tools

### Basic operations

| Tool | Description |
|------|-------------|
| `list_boards` | List all `.kanban` files |
| `read_board` | Read a board (all lists and cards) |
| `get_card` | Get full details of a single card |
| `add_card` | Add a card to a list |
| `edit_card` | Edit title / description / due date |
| `move_card` | Move a card to another list |
| `delete_card` | Delete a card |
| `add_list` | Add a new list |
| `add_task` | Add a task (checkbox) to a card |
| `toggle_task` | Toggle a task checkbox |
| `add_comment` | Add a comment to a card |

### Agentic workflow tools

| Tool | Description |
|------|-------------|
| `get_next_card` | Get the first card from a list (pick next task to work on) |
| `start_card` | Move card to "Doing" + record start timestamp comment |
| `complete_card` | Check all tasks + move to "Done" + record completion comment |

---

## Agentic Task Execution Workflow

The intended pattern for an AI agent working through a backlog:

```
1. get_next_card(board="work", list="To Do")
   → returns card title, ID, description, and task list

2. start_card(board="work", card_id="<id>")
   → moves card to "Doing", records "[agent] Started at 2026-05-24 12:00"

3. ... agent performs the actual work ...
   → toggle_task(card_id, task_index=1)  ← mark each subtask done
   → toggle_task(card_id, task_index=2)
   → add_comment(card_id, "Found issue X, resolved by Y")

4. complete_card(board="work", card_id="<id>", summary="Implemented X, fixed Y")
   → checks all remaining tasks, moves to "Done"
   → records "[agent] Completed at 2026-05-24 12:05\nImplemented X, fixed Y"

5. Repeat from step 1 for the next card
```

---

## Example Prompts

```
"Work through all cards in the To Do list"
"Show me my kanban board"
"Move the 'Fix login bug' card to Done"
"Add a card 'Write tests' to the To Do list with due date 2026-06-01"
"Mark task 2 on card abc-123 as done"
"Add a comment 'Reviewed and approved' to the API card"
```

---

## Development

### Prerequisites

- Node.js 18+
- pnpm 8+

### Setup

```bash
git clone https://github.com/harehare/portable-kanban.git
cd portable-kanban
pnpm install
```

### Build

```bash
pnpm build
```

### Dev (watch mode with tsx)

```bash
pnpm dev
```

### Start

```bash
pnpm start
```

---

## License

MIT License
