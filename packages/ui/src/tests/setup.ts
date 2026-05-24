import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { initBackend } from '../backend';

// Initialize a mock backend for tests (replaces vscode.postMessage)
initBackend({
  saveKanban: vi.fn(),
  load: vi.fn(),
  openUrl: vi.fn(),
  reload: vi.fn(),
  showInfoMessage: vi.fn(),
});

(globalThis as any).settings = {
  showDescription: true,
  showTaskList: true,
};

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
