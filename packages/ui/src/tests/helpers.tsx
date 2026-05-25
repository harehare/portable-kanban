import { Provider } from 'jotai';
import * as React from 'react';
import { MemoryRouter } from 'react-router-dom';
import type { Card, Kanban, List } from 'portable-kanban-core';

export const createCard = (overrides: Partial<Card> = {}): Card => ({
  id: 'card-1',
  listId: 'list-1',
  title: 'Test Card',
  description: '',
  dueDate: undefined,
  labels: [],
  checkboxes: [],
  comments: [],
  ...overrides,
});

export const createList = (overrides: Partial<List> = {}): List => ({
  id: 'list-1',
  title: 'Test List',
  cards: [],
  ...overrides,
});

export const createKanban = (overrides: Partial<Kanban> = {}): Kanban => ({
  lists: [],
  archive: { lists: [], cards: [] },
  settings: { labels: [] },
  ...overrides,
});

type WrapperProps = {
  children: React.ReactNode;
  initialPath?: string;
};

export const TestWrapper = ({ children, initialPath = '/' }: WrapperProps) => (
  <Provider>
    <MemoryRouter initialEntries={[initialPath]}>{children}</MemoryRouter>
  </Provider>
);
