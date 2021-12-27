import * as React from 'react';
import { Switch, Route, useLocation, useHistory } from 'react-router-dom';

import { vscode } from '../vscode';
import { fromJson } from './models/kanban';
import { ArchiveCards } from './pages/ArchiveCards';
import { ArchiveLists } from './pages/ArchiveLists';
import { Board } from './pages/Board';
import { EditCard } from './pages/EditCard';
import { Filter } from './pages/Filter';
import { selectors, actions } from './store';

const App: React.VFC = () => {
  const location = useLocation();
  // @ts-expect-error
  const background = location?.state?.background;
  const history = useHistory();
  const kanban = selectors.useKanban();
  const setKanban = actions.useSetKanban();
  const setTitle = actions.useSetTitle();

  React.useEffect(() => {
    history.push('/');
    vscode.postMessage({
      type: 'load',
    });
    window.addEventListener('message', async (e) => {
      const message = e.data;
      switch (message.type) {
        case 'update':
          const k = await fromJson(message.text);
          setTitle(message.title);
          setKanban(k);
          return;
      }
    });
  }, []);

  return (
    <>
      <Route path="/">
        <Board kanban={kanban} />
      </Route>
      {background && (
        <Switch>
          <Route path="/archive/cards">
            <ArchiveCards cards={kanban.archive.cards} />
          </Route>
          <Route path="/archive/lists">
            <ArchiveLists lists={kanban.archive.lists} />
          </Route>
          <Route path="/filters">
            <Filter settings={kanban.settings} />
          </Route>
          <Route path="/list/:listId/card/:cardId">
            <EditCard kanban={kanban} />
          </Route>
        </Switch>
      )}
    </>
  );
};

export default App;
