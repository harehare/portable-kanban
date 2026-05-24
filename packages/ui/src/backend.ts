import type { Kanban } from '@portable-kanban/core';

export type KanbanBackend = {
  saveKanban: (kanban: Kanban, type: 'edit' | 'reorder') => void | Promise<void>;
  load: () => void;
  openUrl: (url: string) => void;
  reload: () => void | Promise<void>;
  showInfoMessage: (message: string) => void;
};

let backend: KanbanBackend | null = null;

export const initBackend = (b: KanbanBackend) => {
  backend = b;
};

export const getBackend = (): KanbanBackend => {
  if (!backend) throw new Error('KanbanBackend not initialized. Call initBackend() before rendering.');
  return backend;
};
