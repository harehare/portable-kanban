import * as ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import { RecoilRoot } from 'recoil';

import KanbanApp from './App';

ReactDOM.render(
  <RecoilRoot>
    <Router>
      <KanbanApp />
    </Router>
  </RecoilRoot>,
  document.getElementById('root') as HTMLElement
);
