import { initBackend } from 'portable-kanban-ui';
import { vscode } from './vscode';

initBackend({
  saveKanban: (kanban, _type) => {
    vscode.postMessage({ type: 'edit', kanban });
  },
  load: () => {
    vscode.postMessage({ type: 'load' });
  },
  openUrl: (url) => {
    vscode.postMessage({ type: 'open', url });
  },
  reload: () => {
    vscode.postMessage({ type: 'reload' });
  },
  showInfoMessage: (message) => {
    vscode.postMessage({ type: 'info-message', message });
  },
});
