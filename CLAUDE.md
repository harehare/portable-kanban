# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Portable Kanban is a VSCode extension that provides an embedded kanban board editor for `.kanban` files. The project consists of two main parts:

1. **VSCode Extension** (`src/extension.ts`, `src/kanbanEditor.ts`) - Handles VSCode integration, custom editor registration, and file management
2. **React Kanban App** (`src/kanban/`) - The actual kanban board UI that runs in VSCode's webview

## Development Commands

### Building and Development
- `npm run build` - Production build
- `npm run watch` - Development build with file watching
- `npm run package` - Create production bundle for extension publishing
- `npm run vscode:prepublish` - Prepublish script (runs package)

### Testing and Linting
- `npm test` - Run tests (xo linting + Jest)
- `npm run lint` - Run XO linter with auto-fix and Prettier formatting

Note: Tests are located in `src/tests/` and the project uses Jest with XO for linting.

## Architecture

### Extension Architecture
The extension uses a **dual-build system** (webpack produces two bundles):

1. **Extension Bundle** (`dist/extension.js`) - Node.js target for VSCode extension host
2. **Kanban Bundle** (`dist/kanban.js`) - Web target for the webview UI

### State Management
The kanban app uses **Jotai** for state management with a sophisticated atom-based architecture:

- `src/kanban/store.ts` - Central state management with atoms for lists, cards, settings, filters, and UI state
- State is automatically synchronized with VSCode via `vscode.postMessage()` calls
- Uses `jotai-optics` for granular state updates and `atomFamily` for dynamic card selectors

### Data Models
Core data structures are defined in `src/kanban/models/kanban.ts`:

- `Kanban` - Root structure containing lists, archive, and settings
- `List` - Contains cards and has id/title
- `Card` - Has title, description, due date, labels, checkboxes, comments
- `Label`, `CheckBox`, `Comment` - Supporting structures
- JSON validation using `@mojotech/json-type-validation`

### React Component Structure
- `src/kanban/App.tsx` - Main app component
- `src/kanban/components/` - Reusable UI components
- `src/kanban/pages/` - Main views (Board, EditCard, Filter, Archives)
- Uses `react-beautiful-dnd` for drag-and-drop functionality
- Styled with `styled-components`

## File Structure Notes

### TypeScript Configuration
- `tsconfig.json` - For extension code (excludes kanban app)
- `tsconfig-kanban.json` - For React kanban code
- Extension uses CommonJS modules, kanban app uses modern React setup

### Build Configuration
- `webpack.config.js` - Exports array with both extension and kanban configs
- Kanban config uses `libraryTarget: 'window'` to expose code to webview
- Uses `@svgr/webpack` for SVG components and handles CSS files

### VSCode Integration
- Extension activates on startup (`onStartupFinished`)
- Registers custom editor for `.kanban` files
- Creates new kanban files with default structure (Backlog, To Do, Doing, Done lists)

## Development Workflow

### Adding New Features
1. Model changes go in `src/kanban/models/kanban.ts`
2. State management in `src/kanban/store.ts`  
3. UI components in `src/kanban/components/`
4. Update JSON decoder if adding new fields

### Testing
- Run tests with `npm test` before committing
- Linting rules are configured in `package.json` under `xo` config
- Some files are excluded from linting (webpack config, babel config, vscode integration files)

### Extension Development
- Use `npm run watch` for development builds
- Extension entry point is `src/extension.ts`
- Webview communication handled in `src/kanbanEditor.ts`
- CSS themes located in `assets/css/` (dark.css, light.css, system.css)