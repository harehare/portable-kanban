import * as React from 'react';
import { Provider } from 'jotai';
import { KanbanApp } from 'portable-kanban-ui';
import { BrowserRouter as Router } from 'react-router-dom';
import { fromJson, toJson } from 'portable-kanban-core';
import type { Kanban } from 'portable-kanban-core';
import { initBackend } from 'portable-kanban-ui';
import { LandingPage } from './LandingPage';
import type { Theme } from './LandingPage';

type FileState =
  | { status: 'idle' }
  | { status: 'loaded'; kanban: Kanban; title: string };

let fileHandle: FileSystemFileHandle | null = null;

// Holds the kanban to be dispatched when KanbanApp calls load()
let pendingKanban: { kanban: Kanban; title: string } | null = null;

const dispatchKanban = (kanban: Kanban, title: string) => {
  window.dispatchEvent(
    new MessageEvent('message', {
      data: { type: 'update', text: JSON.stringify(kanban), title },
    }),
  );
};

export const WebApp = () => {
  const [fileState, setFileState] = React.useState<FileState>({ status: 'idle' });
  const [theme, setTheme] = React.useState<Theme>('system');

  // Apply theme to <html> data-theme attribute
  React.useEffect(() => {
    if (theme === 'system') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme]);

  // Initialize backend once. load() is called by KanbanApp's useEffect after
  // the message listener is registered, so dispatching here is safe.
  React.useEffect(() => {
    initBackend({
      saveKanban: async (kanban, _type) => {
        if (!fileHandle) return;
        try {
          const writable = await fileHandle.createWritable();
          await writable.write(toJson(kanban));
          await writable.close();
        } catch (err) {
          console.error('Failed to save kanban:', err);
        }
      },
      load: () => {
        // Called by KanbanApp after its message listener is registered
        if (pendingKanban) {
          dispatchKanban(pendingKanban.kanban, pendingKanban.title);
          pendingKanban = null;
        }
      },
      openUrl: (url) => window.open(url, '_blank', 'noopener,noreferrer'),
      reload: async () => {
        if (!fileHandle) return;
        try {
          const file = await fileHandle.getFile();
          const text = await file.text();
          const kanban = await fromJson(text);
          dispatchKanban(kanban, file.name.replace('.kanban', ''));
        } catch (err) {
          console.error('Failed to reload:', err);
        }
      },
      showInfoMessage: (message) => console.info(message),
    });
  }, []);

  const handleOpen = async () => {
    try {
      const picker = (window as any).showOpenFilePicker;
      if (!picker) {
        alert('File System Access API is not supported in this browser.');
        return;
      }
      [fileHandle] = await picker({
        types: [{ description: 'Kanban files', accept: { 'application/json': ['.kanban'] } }],
      });
      const file = await fileHandle!.getFile();
      const text = await file.text();
      const kanban = await fromJson(text);
      const title = file.name.replace('.kanban', '');
      // Store for load() to dispatch once KanbanApp is mounted
      pendingKanban = { kanban, title };
      setFileState({ status: 'loaded', kanban, title });
    } catch (err: any) {
      if (err?.name !== 'AbortError') console.error('Failed to open file:', err);
    }
  };

  const handleNew = async () => {
    try {
      const picker = (window as any).showSaveFilePicker;
      if (!picker) {
        alert('File System Access API is not supported in this browser.');
        return;
      }
      fileHandle = await picker({
        suggestedName: 'kanban.kanban',
        types: [{ description: 'Kanban files', accept: { 'application/json': ['.kanban'] } }],
      });
      const emptyKanban: Kanban = {
        lists: [
          { id: crypto.randomUUID(), title: 'Backlog', cards: [] },
          { id: crypto.randomUUID(), title: 'To Do', cards: [] },
          { id: crypto.randomUUID(), title: 'Doing', cards: [] },
          { id: crypto.randomUUID(), title: 'Done', cards: [] },
        ],
        archive: { lists: [], cards: [] },
        settings: { labels: [] },
      };
      const writable = await fileHandle!.createWritable();
      await writable.write(toJson(emptyKanban));
      await writable.close();
      const file = await fileHandle!.getFile();
      const title = file.name.replace('.kanban', '');
      pendingKanban = { kanban: emptyKanban, title };
      setFileState({ status: 'loaded', kanban: emptyKanban, title });
    } catch (err: any) {
      if (err?.name !== 'AbortError') console.error('Failed to create file:', err);
    }
  };

  if (fileState.status === 'idle') {
    return (
      <LandingPage
        theme={theme}
        onThemeChange={setTheme}
        onOpen={handleOpen}
        onNew={handleNew}
      />
    );
  }

  return (
    <Provider>
      <Router>
        <KanbanApp />
      </Router>
    </Provider>
  );
};
