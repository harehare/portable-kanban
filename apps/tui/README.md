# Portable Kanban — TUI CLI

A standalone terminal TUI for `.kanban` files, built with [Ink](https://github.com/vadimdemedes/ink) / React.

Part of the [portable-kanban](https://github.com/harehare/portable-kanban) monorepo.

---

## Features

- Terminal TUI for browsing and editing kanban boards
- Keyboard-driven navigation (arrow keys or vim-style `hjkl`)
- Add, edit, and delete cards
- Toggle checkbox tasks from card detail view
- Plain JSON `.kanban` file format — same files used by VS Code and the Web app

---

## Prerequisites

- Node.js 18+
- pnpm 8+

---

## Build

```bash
# From the repo root
pnpm build:tui

# Or from this directory
pnpm build
```

---

## Usage

```bash
# Open an existing kanban file
pkb my-board.kanban

# Create a new kanban file and open it
pkb new my-board.kanban
```

---

## Keybindings

### Board view

| Key | Action |
|-----|--------|
| `←` / `h` | Move to left list |
| `→` / `l` | Move to right list |
| `↑` / `k` | Select card above |
| `↓` / `j` | Select card below |
| `Enter` | Open card detail |
| `a` | Add new card to current list |
| `e` | Edit selected card title |
| `d` | Delete selected card |
| `H` | Move selected card to left list |
| `L` | Move selected card to right list |
| `?` | Show help |
| `q` / `Ctrl+C` | Quit |

### Card detail view

| Key | Action |
|-----|--------|
| `e` | Edit title |
| `d` | Edit description |
| `D` | Edit due date |
| `t` | Add task |
| `c` | Add comment |
| `1`–`9` | Toggle checkbox task |
| `Esc` / `q` | Back to board |
| `Q` | Quit |

### Customising keybindings

Set the `PORTABLE_KANBAN_KEYMAPS` environment variable to a JSON object with any keys you want to override:

```bash
PORTABLE_KANBAN_KEYMAPS='{"quit":"q","list_prev":"h","list_next":"l"}' pkb my-board.kanban
```

Available keys: `quit`, `list_prev`, `list_next`, `card_up`, `card_down`, `card_add`, `card_edit`, `card_delete`, `card_move_left`, `card_move_right`, `help`.

---

## File Format

`.kanban` files are plain JSON — Git-friendly and human-readable:

```json
{
  "lists": [
    {
      "id": "uuid",
      "title": "To Do",
      "cards": [
        {
          "id": "uuid",
          "listId": "parent-list-uuid",
          "title": "My task",
          "description": "Details here",
          "dueDate": "2026-06-01",
          "labels": [{ "id": "uuid", "title": "bug", "color": "#eb5a46" }],
          "checkboxes": [{ "id": "uuid", "title": "Step 1", "checked": false }],
          "comments": [{ "id": "uuid", "comment": "Looks good!" }]
        }
      ]
    }
  ],
  "archive": { "lists": [], "cards": [] },
  "settings": { "labels": [] }
}
```

---

## License

MIT License
