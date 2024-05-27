import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'jotai';

import KanbanApp from './App';

const root = createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <Provider>
    <Router>
      <KanbanApp />
    </Router>
  </Provider>,
);
