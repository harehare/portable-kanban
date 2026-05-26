import * as React from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { fromJson } from 'portable-kanban-core';
import { getBackend } from './backend';
import { ArchiveCards } from './pages/ArchiveCards';
import { ArchiveLists } from './pages/ArchiveLists';
import { Board } from './pages/Board';
import { EditCard } from './pages/EditCard';
import { Filter } from './pages/Filter';
import { actions, selectors, setIsLoadingFromFile } from './store';

const App = () => {
  const location = useLocation();
  const state = location.state as { backgroundLocation?: Location };
  const navigate = useNavigate();
  const archiveLists = selectors.useArchiveLists();
  const archiveCards = selectors.useArchiveCards();
  const settings = selectors.useSettings();
  const setKanban = actions.useSetKanban();
  const setTitle = actions.useSetTitle();

  React.useEffect(() => {
    const onMessage = async (error: MessageEvent<{ type: 'update'; text: string; title: string }>) => {
      const message = error.data;
      switch (message.type) {
        case 'update': {
          const k = await fromJson(message.text);
          setTitle(message.title);
          setIsLoadingFromFile(true);
          setKanban(k);
          setIsLoadingFromFile(false);
        }
      }
    };

    window.addEventListener('message', onMessage);
    navigate('/');
    getBackend().load();
    return () => {
      window.removeEventListener('message', onMessage);
    };
  }, []);

  return (
    <>
      <Routes location={state?.backgroundLocation ?? location}>
        <Route path="/" element={<Board />} />
      </Routes>
      {(state?.backgroundLocation ?? location.pathname.startsWith('/list')) && (
        <Routes>
          <Route path="/archive/cards" element={<ArchiveCards cards={archiveCards} />} />
          <Route path="/archive/lists" element={<ArchiveLists lists={archiveLists} />} />
          <Route path="/filters" element={<Filter settings={settings} />} />
          <Route path="/list/:listId/card/:cardId" element={<EditCard />} />
        </Routes>
      )}
    </>
  );
};

export default App;
