# Portable Kanban Extension for Visual Studio Code

A lightweight and portable kanban board extension for Visual Studio Code that allows you to create and manage kanban boards directly within your editor.

![kanban](https://raw.githubusercontent.com/harehare/portable-kanban/refs/heads/main/img/kanban.jpg)
![Dark-kanban](https://raw.githubusercontent.com/harehare/portable-kanban/refs/heads/main/img/dark.jpg)

## Features

- ✅ Create and manage kanban boards within VS Code
- ✅ Drag and drop cards between lists
- ✅ Add descriptions, labels, due dates, and comments to cards
- ✅ Task lists with checkboxes
- ✅ Archive cards and lists
- ✅ Search and filter functionality
- ✅ Dark / Light / System theme support
- ✅ Portable `.kanban` file format — Git-friendly and human-readable

## Installation

### From VS Code Marketplace

1. Open VS Code
2. Go to Extensions (`Ctrl+Shift+X`)
3. Search for **"Portable Kanban"**
4. Click Install

### From Command Line

```bash
ext install portable-kanban
```

## Getting Started

### Creating a New Kanban Board

1. Open Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
2. Run **"Portable Kanban: Create new Kanban"**
3. Choose a location — the `.kanban` file opens as a board in a new editor tab

### Basic Usage

#### Adding Cards

- Click the **"+"** button in any list to add a new card
- **Bulk Add**: Hold `Shift` while typing to add multiple cards (one per line)
- **Add with Labels**: Use the format `Label Name:Card Text` to add a card with a label

#### Managing Cards

- **Drag & Drop**: Move cards between lists by dragging
- **Edit**: Click on a card to edit its content, add descriptions, labels, or comments
- **Archive**: Use the card menu to archive completed cards
- **Delete**: Remove unwanted cards from the board

#### Working with Lists

- Add new lists using the **"Add List"** button
- Rename lists by clicking on the list title
- Archive entire lists when no longer needed
- Move lists by dragging them

#### Filtering and Search

- Use the search bar to find specific cards
- Filter by labels to focus on specific types of work
- View archived cards and lists in separate views

## Configuration

Configure the extension through VS Code settings:

```json
{
  "portable-kanban.theme": "system",        // "dark" | "light" | "system"
  "portable-kanban.show-description": true, // Show card descriptions
  "portable-kanban.show-task-list": true    // Show task lists in cards
}
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Ctrl+Shift+P` | Open Command Palette |
| `Escape` | Close modal / dialog |
| `Enter` | Confirm edit |
| `Shift+Enter` | Add multiple items at once |

## File Format

Kanban boards are stored as `.kanban` files in JSON format, making them:

- **Portable**: Easy to share and version control
- **Human-readable**: Can be edited manually if needed
- **Lightweight**: Small file size, efficient storage

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

## Development

### Prerequisites

- Node.js 18+
- pnpm 8+
- VS Code 1.101.0+

### Setup

```bash
git clone https://github.com/harehare/portable-kanban.git
cd portable-kanban
pnpm install
```

### Building

```bash
# From the repo root
pnpm build:vscode   # Production build

# Or from this directory
pnpm build          # Build extension + kanban UI
pnpm watch          # Development build with watch
pnpm package        # Package for publishing
```

### Linting

```bash
pnpm lint
```

### Packaging (VSIX)

```bash
pnpm vsce:package
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes
4. Push the branch and open a Pull Request

## Roadmap

### Planned Features

- [ ] Sync with GitHub Projects
- [ ] Sync with Trello
- [ ] Related cards functionality
- [ ] Export to various formats (PDF, CSV)
- [ ] Custom card templates
- [ ] Time tracking
- [ ] Collaboration features

## License

MIT License — see the [LICENSE](../../LICENSE) file for details.

## Support

- 🐛 [Report bugs](https://github.com/harehare/portable-kanban/issues)
- 💡 [Request features](https://github.com/harehare/portable-kanban/issues)
- ⭐ [Star the project](https://github.com/harehare/portable-kanban) if you find it useful!
