# Portable Kanban — Web App

A browser-based kanban board using the [File System Access API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API).  
Reads and writes `.kanban` (plain JSON) files directly from your local filesystem.

Part of the [portable-kanban](https://github.com/harehare/portable-kanban) monorepo.

> **Note:** Requires a Chromium-based browser (Chrome / Edge) for full file read/write support.

---

## Features

- 🌐 Runs entirely in the browser — no backend required
- 📂 Open and save `.kanban` files via File System Access API
- 🖱️ Drag and drop cards between lists
- 📝 Add descriptions, labels, due dates, and comments to cards
- ✅ Task lists with checkboxes
- 🗄️ Archive cards and lists
- 🔍 Search and filter functionality
- 🌙 Dark / Light / System theme support

---

## Usage

1. Open `http://localhost:5173` (dev) or your deployed URL
2. Click **Open file** to open an existing `.kanban` file
3. Click **New file** to create a new board
4. Changes are saved automatically to the file

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

### Dev Server

```bash
# From the repo root
pnpm dev:web

# Or from this directory
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build

```bash
# From the repo root
pnpm build:web

# Or from this directory
pnpm build
```

### Preview Production Build

```bash
pnpm preview
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
