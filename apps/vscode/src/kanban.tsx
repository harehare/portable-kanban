import './vscodeBackend';
import { KanbanApp } from 'portable-kanban-ui';
import { Provider } from 'jotai';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';

const root = createRoot(document.querySelector('#root')!);

root.render(
  <Provider>
    <Router>
      <KanbanApp />
    </Router>
  </Provider>,
);
