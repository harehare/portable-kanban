import * as React from 'react';
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';
import { atomFamily } from 'jotai/utils';
import { vscode } from '../vscode';
import {
  type Comment,
  addCheckBox,
  addComments,
  addLabel,
  addList,
  archiveCard,
  type Card,
  type CheckBox,
  deleteCard,
  deleteCheckBox,
  deleteLabel,
  type Kanban,
  type Label,
  type List,
  moveCard,
  moveCardAcrossList,
  moveList,
  removeArchivedList,
  restoreCard,
  updateCard,
  updateCheckBox,
  updateLabel,
  updateList,
  updateComments,
  deleteComments,
  type Settings,
  archiveList,
  restoreList,
  archiveAllCardInList,
  copyCard,
  moveCheckBox,
  moveAllCardsToList,
  type ArchiveList,
  addCards,
  sortListCards,
} from './models/kanban';

const titleAtom = atom('');
const addingCardAtom = atom<Card | undefined>(undefined);
const filterAtom = atom<{ text: string; labels: Set<string> }>({
  text: '',
  labels: new Set([]),
});
const showModalAtom = atom<boolean>(false);
const menuAtom = atom<string | undefined>(undefined);
const sortOrderAtom = atom<Record<string, 'none' | 'titleAsc' | 'titleDesc'>>({});

const lists = atom<List[]>([]);
const archiveLists = atom<ArchiveList[]>([]);
const archiveCards = atom<Card[]>([]);
const settings = atom<Settings>({ labels: [] });

const listsAtom = atom(
  (get) => get(lists),
  (get, set, newValue: List[]) => {
    const kanban: Kanban = get(kanbanAtom);
    set(lists, newValue);
    vscode.postMessage({
      type: 'edit',
      kanban: { ...kanban, lists: newValue },
    });
  }
);
const archiveListsAtom = atom(
  (get) => get(archiveLists),
  (get, set, newValue: ArchiveList[]) => {
    const kanban: Kanban = get(kanbanAtom);
    set(archiveLists, newValue);
    vscode.postMessage({
      type: 'edit',
      kanban: { ...kanban, archive: { ...kanban.archive, lists: newValue } },
    });
  }
);
const archiveCardsAtom = atom(
  (get) => get(archiveCards),
  (get, set, newValue: Card[]) => {
    const kanban: Kanban = get(kanbanAtom);
    set(archiveCards, newValue);
    vscode.postMessage({
      type: 'edit',
      kanban: {
        ...kanban,
        archive: { ...kanban.archive, cards: newValue },
      },
    });
  }
);
const settingsAtom = atom(
  (get) => get(settings),
  (get, set, newValue: Settings) => {
    const kanban: Kanban = get(kanbanAtom);
    set(settings, newValue);
    vscode.postMessage({
      type: 'edit',
      kanban: {
        ...kanban,
        settings: newValue,
      },
    });
  }
);

const kanbanAtom = atom(
  (get) => ({
    lists: get(lists),
    archive: { lists: get(archiveLists), cards: get(archiveCards) },
    settings: get(settings),
  }),
  (_get, set, newValue: Kanban) => {
    set(lists, newValue.lists);
    set(archiveLists, newValue.archive.lists);
    set(archiveCards, newValue.archive.cards);
    set(settings, newValue.settings);
    vscode.postMessage({
      type: 'edit',
      kanban: newValue,
    });
  }
);

const cardSelector = atomFamily(({ listId, cardId }: { listId: string; cardId: string }) =>
  atom((get) =>
    get(kanbanAtom)
      .lists.find((v) => v.id === listId)
      ?.cards.find((v) => v.id === cardId)
  )
);
const filteredTextSelector = atom(
  (get) => get(filterAtom).text,
  (get, set, newText: string) => {
    const current = get(filterAtom);
    set(filterAtom, { ...current, text: newText });
  }
);
const filteredLabelSelector = atom(
  (get) => get(filterAtom).labels,
  (get, set, newLabels: Set<string>) => {
    const current = get(filterAtom);
    set(filterAtom, { ...current, labels: newLabels });
  }
);

type Selectors = {
  useTitle: () => string;
  useFilterText: () => string;
  useFilterLabels: () => Set<string>;
  useShowModal: () => boolean;
  useAddingCard: () => Card | undefined;
  useKanban: () => Kanban;
  useLists: () => List[];
  useArchiveLists: () => ArchiveList[];
  useArchiveCards: () => Card[];
  useSettings: () => Settings;
  useCard: (listId: string, cardId: string) => Card | undefined;
  useMenu: () => string | undefined;
  useSortOrder: () => Record<string, 'none' | 'titleAsc' | 'titleDesc'>;
};

export const selectors: Selectors = {
  useTitle: () => useAtomValue(titleAtom),
  useFilterText: () => useAtomValue(filteredTextSelector),
  useFilterLabels: () => useAtomValue(filteredLabelSelector),
  useShowModal: () => useAtomValue(showModalAtom),
  useAddingCard: () => useAtomValue(addingCardAtom),
  useKanban: () => useAtomValue(kanbanAtom),
  useLists: () => useAtomValue(listsAtom),
  useArchiveLists: () => useAtomValue(archiveListsAtom),
  useArchiveCards: () => useAtomValue(archiveCardsAtom),
  useSettings: () => useAtomValue(settingsAtom),
  useCard: (listId: string, cardId: string) => useAtomValue(cardSelector({ listId, cardId })),
  useMenu: () => useAtomValue(menuAtom),
  useSortOrder: () => useAtomValue(sortOrderAtom),
};

export const actions = {
  useSetTitle() {
    const setState = useSetAtom(titleAtom);
    return React.useCallback((title: string) => {
      setState(title);
    }, []);
  },
  useSetKanban() {
    const setState = useSetAtom(kanbanAtom);
    return React.useCallback((kanban: Kanban) => {
      setState(kanban);
    }, []);
  },
  useSetFilter() {
    const setState = useSetAtom(filterAtom);
    return React.useCallback((text: string, labels: Set<string>) => {
      setState({ text, labels });
    }, []);
  },
  useSetShowModal() {
    const setState = useSetAtom(showModalAtom);
    return React.useCallback((showModal: boolean) => {
      setState(showModal);
    }, []);
  },
  useSetAddingCard() {
    const setState = useSetAtom(addingCardAtom);
    return React.useCallback((card: Card | undefined) => {
      setState(card);
    }, []);
  },
  useSetMenu() {
    const setState = useSetAtom(menuAtom);
    return React.useCallback((menuId: string) => {
      setState(menuId);
    }, []);
  },
  useMenuClose() {
    const setState = useSetAtom(menuAtom);
    return React.useCallback(() => {
      setState('');
    }, []);
  },
  useSetSortOrder() {
    const setState = useSetAtom(sortOrderAtom);
    return React.useCallback((listId: string, sortOrder: 'none' | 'titleAsc' | 'titleDesc') => {
      setState((current) => ({ ...current, [listId]: sortOrder }));
    }, []);
  },
};

export const kanbanActions = {
  useAddList() {
    const [lists, setLists] = useAtom(listsAtom);
    return React.useCallback(
      (list: List) => {
        setLists(addList(lists, list));
      },
      [lists, setLists]
    );
  },
  useUpdateList() {
    const [lists, setLists] = useAtom(listsAtom);
    return React.useCallback(
      (list: List) => {
        setLists(updateList(lists, list));
      },
      [lists, setLists]
    );
  },
  useMoveList() {
    const [lists, setLists] = useAtom(listsAtom);
    return React.useCallback(
      (fromListId: number, toListId: number) => {
        setLists(moveList(lists, fromListId, toListId));
      },
      [lists, setLists]
    );
  },
  useRemoveList() {
    const [lists, setLists] = useAtom(archiveListsAtom);
    return React.useCallback(
      (listId: string) => {
        setLists(removeArchivedList(lists, listId));
      },
      [lists, setLists]
    );
  },
  useArchiveList() {
    const [kanban, setState] = useAtom(kanbanAtom);
    return React.useCallback(
      (list: List) => {
        setState(archiveList(kanban, list));
      },
      [kanban, setState]
    );
  },
  useArchiveAllCardInList() {
    const [kanban, setState] = useAtom(kanbanAtom);
    return React.useCallback(
      (list: List) => {
        setState(archiveAllCardInList(kanban, list));
      },
      [kanban, setState]
    );
  },
  useRestoreList() {
    const [kanban, setState] = useAtom(kanbanAtom);
    return React.useCallback(
      (list: List) => {
        setState(restoreList(kanban, list));
      },
      [kanban, setState]
    );
  },
  useMoveAllCardsToList() {
    const [lists, setLists] = useAtom(listsAtom);
    return React.useCallback(
      (fromList: List, toList: List) => {
        setLists(moveAllCardsToList(lists, fromList, toList));
      },
      [lists, setLists]
    );
  },
  useAddCards() {
    const [lists, setLists] = useAtom(listsAtom);
    return React.useCallback(
      (list: List, cards: Card[]) => {
        setLists(addCards(lists, list, cards));
      },
      [lists, setLists]
    );
  },
  useUpdateCard() {
    const [lists, setLists] = useAtom(listsAtom);
    return React.useCallback(
      (list: List, card: Card) => {
        setLists(updateCard(lists, list, card));
      },
      [lists, setLists]
    );
  },
  useDeleteCard() {
    const [archiveCards, setArchiveCards] = useAtom(archiveCardsAtom);
    return React.useCallback(
      (card: Card) => {
        setArchiveCards(deleteCard(archiveCards, card));
      },
      [archiveCards, setArchiveCards]
    );
  },
  useCopyCard() {
    const [lists, setLists] = useAtom(listsAtom);
    return React.useCallback(
      (card: Card) => {
        setLists(copyCard(lists, card));
      },
      [lists, setLists]
    );
  },
  useMoveCard() {
    const [lists, setLists] = useAtom(listsAtom);
    return React.useCallback(
      (listId: string, fromCardIndex: number, toCardIndex: number) => {
        setLists(moveCard(lists, listId, fromCardIndex, toCardIndex));
      },
      [lists, setLists]
    );
  },
  useMoveCardAcrossList() {
    const [lists, setLists] = useAtom(listsAtom);
    return React.useCallback(
      (fromListId: string, fromCardIndex: number, toListId: string, toCardIndex: number) => {
        setLists(moveCardAcrossList(lists, fromListId, fromCardIndex, toListId, toCardIndex));
      },
      [lists, setLists]
    );
  },
  useArchiveCard() {
    const [kanban, setKanban] = useAtom(kanbanAtom);
    return React.useCallback(
      (list: List, card: Card) => {
        setKanban(archiveCard(kanban, list, card));
      },
      [kanban, setKanban]
    );
  },
  useRestoreCard() {
    const [kanban, setKanban] = useAtom(kanbanAtom);
    return React.useCallback(
      (card: Card) => {
        setKanban(restoreCard(kanban, card));
      },
      [kanban, setKanban]
    );
  },
  useUpdateCardDueDate() {
    const [lists, setLists] = useAtom(listsAtom);
    return React.useCallback(
      (list: List, card: Card, dueDate?: Date) => {
        setLists(updateCard(lists, list, { ...card, dueDate }));
      },
      [lists, setLists]
    );
  },
  useAddCheckBox() {
    const [lists, setLists] = useAtom(listsAtom);
    return React.useCallback(
      (list: List, card: Card, checkbox: CheckBox) => {
        setLists(addCheckBox(lists, list, card, checkbox));
      },
      [lists, setLists]
    );
  },
  useUpdateCheckBox() {
    const [lists, setLists] = useAtom(listsAtom);
    return React.useCallback(
      (list: List, card: Card, checkbox: CheckBox) => {
        setLists(updateCheckBox(lists, list, card, checkbox));
      },
      [lists, setLists]
    );
  },
  useDeleteCheckBox() {
    const [lists, setLists] = useAtom(listsAtom);
    return React.useCallback(
      (list: List, card: Card, id: string) => {
        setLists(deleteCheckBox(lists, list, card, id));
      },
      [lists, setLists]
    );
  },
  useMoveCheckBox() {
    const [lists, setLists] = useAtom(listsAtom);
    return React.useCallback(
      (listId: string, cardId: string, fromCheckBoxIndex: number, toCheckBoxIndex: number) => {
        setLists(moveCheckBox(lists, listId, cardId, fromCheckBoxIndex, toCheckBoxIndex));
      },
      [lists, setLists]
    );
  },
  useAddLabel() {
    const [lists, setLists] = useAtom(listsAtom);
    return React.useCallback(
      (list: List, card: Card, label: Label) => {
        setLists(addLabel(lists, list, card, label));
      },
      [lists, setLists]
    );
  },
  useUpdateLabel() {
    const [lists, setLists] = useAtom(listsAtom);
    return React.useCallback(
      (list: List, card: Card, label: Label) => {
        setLists(updateLabel(lists, list, card, label));
      },
      [lists, setLists]
    );
  },
  useDeleteLabel() {
    const [lists, setLists] = useAtom(listsAtom);
    return React.useCallback(
      (list: List, card: Card, id: string) => {
        setLists(deleteLabel(lists, list, card, id));
      },
      [lists, setLists]
    );
  },
  useAddComments() {
    const [lists, setLists] = useAtom(listsAtom);
    return React.useCallback(
      (list: List, card: Card, comment: Comment) => {
        setLists(addComments(lists, list, card, comment));
      },
      [lists, setLists]
    );
  },
  useUpdateComments() {
    const [lists, setLists] = useAtom(listsAtom);
    return React.useCallback(
      (list: List, card: Card, comment: Comment) => {
        setLists(updateComments(lists, list, card, comment));
      },
      [lists, setLists]
    );
  },
  useDeleteComments() {
    const [lists, setLists] = useAtom(listsAtom);
    return React.useCallback(
      (list: List, card: Card, id: string) => {
        setLists(deleteComments(lists, list, card, id));
      },
      [lists, setLists]
    );
  },
  useUpdateSettings() {
    const setSettings = useSetAtom(settingsAtom);
    return React.useCallback(
      (newSettings: Settings) => {
        setSettings(newSettings);
      },
      [setSettings]
    );
  },
  useSortListCards() {
    const [lists, setLists] = useAtom(listsAtom);
    return React.useCallback(
      (listId: string, sortOrder: 'titleAsc' | 'titleDesc') => {
        setLists(sortListCards(lists, listId, sortOrder));
      },
      [lists, setLists]
    );
  },
};
