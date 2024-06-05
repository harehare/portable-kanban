import * as React from 'react';
import { Route, useLocation, Routes, useNavigate } from 'react-router-dom';
import { vscode } from '../vscode';
import { fromJson } from './models/kanban';
import { ArchiveCards } from './pages/ArchiveCards';
import { ArchiveLists } from './pages/ArchiveLists';
import { Board } from './pages/Board';
import { EditCard } from './pages/EditCard';
import { Filter } from './pages/Filter';
import { selectors, actions } from './store';

const App = () => {
  const location = useLocation();
  const state = location.state as { backgroundLocation?: Location };
  const navigate = useNavigate();
  const kanban = selectors.useKanban();
  const setKanban = actions.useSetKanban();
  const setTitle = actions.useSetTitle();

  React.useEffect(() => {
    const onMessage = async (error: MessageEvent<{ type: 'update'; text: string; title: string }>) => {
      const message = error.data;
      switch (message.type) {
        case 'update': {
          const k = await fromJson(message.text);
          setTitle(message.title);
          setKanban(k);
        }
      }
    };

    window.addEventListener('message', onMessage);
    navigate('/');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    vscode.postMessage({
      type: 'load',
    });
    return () => {
      window.removeEventListener('message', onMessage);
    };
  }, []);

  return (
    <>
      <Routes location={state?.backgroundLocation ?? location}>
        <Route path="/" element={<Board kanban={kanban} />} />
      </Routes>
      {(state?.backgroundLocation ?? location.pathname.startsWith('/list')) && (
        <Routes>
          <Route path="/archive/cards" element={<ArchiveCards cards={kanban.archive.cards} />} />
          <Route path="/archive/lists" element={<ArchiveLists lists={kanban.archive.lists} />} />
          <Route path="/filters" element={<Filter settings={kanban.settings} />} />
          <Route path="/list/:listId/card/:cardId" element={<EditCard kanban={kanban} />} />
        </Routes>
      )}
    </>
  );
};

export default App;
