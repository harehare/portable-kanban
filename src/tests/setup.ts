import '@testing-library/jest-dom';
import { vi } from 'vitest';

const mockVscode = {
  postMessage: vi.fn(),
  getState: vi.fn(),
  setState: vi.fn(),
};

(globalThis as any).acquireVsCodeApi = () => mockVscode;

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
