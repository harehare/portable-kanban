# Portable Kanban — Neovim Plugin

A Neovim Lua plugin with a terminal TUI (built with [Ink](https://github.com/vadimdemedes/ink) / React) for `.kanban` files.

Part of the [portable-kanban](https://github.com/harehare/portable-kanban) monorepo.

---

## Features

- 🖥️ Terminal TUI for browsing and editing kanban boards inside Neovim
- ⌨️ Keyboard-driven navigation (vim-style `hjkl`)
- 📝 Add, edit, and delete cards
- ✅ Toggle checkbox tasks from card detail view
- 🗄️ Plain JSON `.kanban` file format — same files used by VS Code and the Web app

---

## Prerequisites

- Node.js 18+
- pnpm 8+
- Neovim 0.8+

---

## Installation

First, build the TUI binary:

```bash
cd apps/nvim
pnpm install
pnpm build
```

Then add the plugin to your Neovim config using your preferred plugin manager:

**vim-plug** (`init.vim` / `init.lua`):

```vim
" init.vim
Plug '/path/to/portable-kanban/apps/nvim'
```

After adding the line, run `:PlugInstall`, then configure:

```vim
" init.vim
lua require("portable-kanban").setup({ auto_open = true })
```

```lua
-- init.lua
require("portable-kanban").setup({ auto_open = true })
```

---

**lazy.nvim**:

```lua
{
  dir = "/path/to/portable-kanban/apps/nvim",
  config = function()
    require("portable-kanban").setup({
      auto_open = true,  -- Auto-open TUI when a .kanban file is opened (optional)
    })
  end,
}
```

---

**packer.nvim**:

```lua
use {
  "/path/to/portable-kanban/apps/nvim",
  config = function()
    require("portable-kanban").setup({ auto_open = true })
  end,
}
```

---

**Manual** (`init.lua` / `init.vim`):

```lua
-- init.lua
vim.opt.rtp:prepend("/path/to/portable-kanban/apps/nvim")
require("portable-kanban").setup()
```

---

## Commands

| Command | Description |
|---------|-------------|
| `:KanbanOpen` | Open the current `.kanban` file in the TUI |
| `:KanbanNew` | Create a new `.kanban` file and open it |

---

## TUI Keybindings

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
| `q` / `Ctrl+C` | Quit |

### Card detail view

| Key | Action |
|-----|--------|
| `1`–`9` | Toggle checkbox task |
| `Esc` / `q` | Back to board |

---

## Development

### Build

```bash
# From the repo root
pnpm build:nvim

# Or from this directory
pnpm build
```

### Watch Mode

```bash
# From the repo root
pnpm dev:nvim

# Or from this directory
pnpm dev
```

### Lint

```bash
pnpm lint
```

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
