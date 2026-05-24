declare module '*.svg' {
  const content: string;
  export default content;
}

declare module '*.svg?url' {
  const content: string;
  export default content;
}

export { default as KanbanApp } from './App';
export { initBackend, getBackend } from './backend';
export type { KanbanBackend } from './backend';
export { actions, kanbanActions, selectors, setIsLoadingFromFile } from './store';
