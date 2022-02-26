import * as React from 'react';
import {
  atom,
  selector,
  selectorFamily,
  useRecoilState,
  useRecoilValue,
  useSetRecoilState,
} from 'recoil';

import { vscode } from '../vscode';
import {
  Comment,
  addCard,
  addCheckBox,
  addComments,
  addLabel,
  addList,
  archiveCard,
  Card,
  CheckBox,
  deleteCard,
  deleteCheckBox,
  deleteLabel,
  Kanban,
  Label,
  List,
  moveCard,
  moveCardAcrossList,
  moveList,
  removeList,
  restoreCard,
  updateCard,
  updateCheckBox,
  updateLabel,
  updateList,
  updateComments,
  deleteComments,
  updateSettings,
  Settings,
  archiveList,
  restoreList,
  archiveAllCardInList,
  copyCard,
} from './models/kanban';

const titleState = atom({
  key: 'titleState',
  default: '',
});

const addCardState = atom<Card | undefined>({
  key: 'addCardState',
  default: undefined,
});

const filterState = atom<{ text: string; labels: Set<string> } | undefined>({
  key: 'filterState',
  default: undefined,
});

const showModalState = atom<boolean>({
  key: 'showModalState',
  default: false,
});

const menuState = atom<string | null>({
  key: 'menuState',
  default: null,
});

const kanbanState = atom<Kanban>({
  key: 'kanbanState',
  default: {
    lists: [],
    archive: { lists: [], cards: [] },
    settings: {
      labels: [],
    },
  },
  effects_UNSTABLE: [
    ({ onSet }) => {
      onSet((kanban) => {
        vscode.postMessage({
          type: 'edit',
          kanban: kanban,
        });
      });
    },
  ],
});

const cardSelector = selectorFamily<Card | undefined, string[]>({
  key: 'cardSelector',
  get:
    ([listId, cardId]) =>
    ({ get }) => {
      return get(kanbanState)
        .lists.find((v) => v.id === listId)
        ?.cards.find((v) => v.id === cardId);
    },
});

const filteredTextState = selector({
  key: 'filteredTextState',
  get: ({ get }) => {
    const filter = get(filterState);
    if (!filter) {
      return '';
    }

    return filter.text;
  },
});

const filteredLabelState = selector({
  key: 'filteredLabelState',
  get: ({ get }) => {
    const filter = get(filterState);
    if (!filter) {
      return new Set([]);
    }

    return filter.labels;
  },
});

export const selectors = {
  useTitle: () => useRecoilValue(titleState),
  useFilterText: () => useRecoilValue(filteredTextState),
  useFilterLabels: () => useRecoilValue(filteredLabelState),
  useShowModal: () => useRecoilValue(showModalState),
  useAddCard: () => useRecoilValue(addCardState),
  useKanban: () => useRecoilValue(kanbanState),
  useCard: (listId: string, cardId: string) =>
    useRecoilValue(cardSelector([listId, cardId])),
  useMenu: () => useRecoilValue(menuState),
};

export const actions = {
  useSetTitle: () => {
    const setState = useSetRecoilState(titleState);
    return React.useCallback((title: string) => setState(title), []);
  },
  useSetKanban: () => {
    const setState = useSetRecoilState(kanbanState);
    return React.useCallback((kanban: Kanban) => setState(kanban), []);
  },
  useSetFilter: () => {
    const setState = useSetRecoilState(filterState);
    return React.useCallback(
      (text: string, labels: Set<string>) => setState({ text, labels }),
      []
    );
  },
  useSetShowModal: () => {
    const setState = useSetRecoilState(showModalState);
    return React.useCallback((showModal: boolean) => setState(showModal), []);
  },
  useSetAddingCard: () => {
    const setState = useSetRecoilState(addCardState);
    return React.useCallback((card: Card | undefined) => setState(card), []);
  },
  useSetMenu: () => {
    const setState = useSetRecoilState(menuState);
    return React.useCallback((menuId: string) => setState(menuId), []);
  },
  useMenuClose: () => {
    const setState = useSetRecoilState(menuState);
    return React.useCallback(() => setState(''), []);
  },
};

export const kanbanActions = {
  useAddList: () => {
    const [kanban, setState] = useRecoilState(kanbanState);
    return React.useCallback(
      (list: List) => {
        setState(addList(kanban, list));
      },
      [kanban]
    );
  },
  useUpdateList: () => {
    const [kanban, setState] = useRecoilState(kanbanState);
    return React.useCallback(
      (list: List) => {
        setState(updateList(kanban, list));
      },
      [kanban]
    );
  },
  useMoveList: () => {
    const [kanban, setState] = useRecoilState(kanbanState);
    return React.useCallback(
      (fromListId: number, toListId: number) => {
        setState(moveList(kanban, fromListId, toListId));
      },
      [kanban]
    );
  },
  useRemoveList: () => {
    const [kanban, setState] = useRecoilState(kanbanState);
    return React.useCallback(
      (listId: string) => {
        setState(removeList(kanban, listId));
      },
      [kanban]
    );
  },
  useArchiveList: () => {
    const [kanban, setState] = useRecoilState(kanbanState);
    return React.useCallback(
      (list: List) => {
        setState(archiveList(kanban, list));
      },
      [kanban]
    );
  },
  useArchiveAllCardInList: () => {
    const [kanban, setState] = useRecoilState(kanbanState);
    return React.useCallback(
      (list: List) => {
        setState(archiveAllCardInList(kanban, list));
      },
      [kanban]
    );
  },
  useRestoreList: () => {
    const [kanban, setState] = useRecoilState(kanbanState);
    return React.useCallback(
      (list: List) => {
        setState(restoreList(kanban, list));
      },
      [kanban]
    );
  },
  useAddCard: () => {
    const [kanban, setState] = useRecoilState(kanbanState);
    return React.useCallback(
      (list: List, card: Card) => {
        setState(addCard(kanban, list, card));
      },
      [kanban]
    );
  },
  useUpdateCard: () => {
    const [kanban, setState] = useRecoilState(kanbanState);
    return React.useCallback(
      (list: List, card: Card) => {
        setState(updateCard(kanban, list, card));
      },
      [kanban]
    );
  },
  useDeleteCard: () => {
    const [kanban, setState] = useRecoilState(kanbanState);
    return React.useCallback(
      (card: Card) => {
        setState(deleteCard(kanban, card));
      },
      [kanban]
    );
  },
  useCopyCard: () => {
    const [kanban, setState] = useRecoilState(kanbanState);
    return React.useCallback(
      (card: Card) => {
        setState(copyCard(kanban, card));
      },
      [kanban]
    );
  },
  useMoveCard: () => {
    const [kanban, setState] = useRecoilState(kanbanState);
    return React.useCallback(
      (listId: string, fromCardIndex: number, toCardIndex: number) => {
        setState(moveCard(kanban, listId, fromCardIndex, toCardIndex));
      },
      [kanban]
    );
  },
  useMoveCardAcrossList: () => {
    const [kanban, setState] = useRecoilState(kanbanState);
    return React.useCallback(
      (
        fromListId: string,
        fromCardIndex: number,
        toListId: string,
        toCardIndex: number
      ) => {
        setState(
          moveCardAcrossList(
            kanban,
            fromListId,
            fromCardIndex,
            toListId,
            toCardIndex
          )
        );
      },
      [kanban]
    );
  },
  useArchiveCard: () => {
    const [kanban, setState] = useRecoilState(kanbanState);
    return React.useCallback(
      (list: List, card: Card) => {
        setState(archiveCard(kanban, list, card));
      },
      [kanban]
    );
  },
  useRestoreCard: () => {
    const [kanban, setState] = useRecoilState(kanbanState);
    return React.useCallback(
      (card: Card) => {
        setState(restoreCard(kanban, card));
      },
      [kanban]
    );
  },
  useUpdateCardDueDate: () => {
    const [kanban, setState] = useRecoilState(kanbanState);
    return React.useCallback(
      (list: List, card: Card, dueDate: Date) => {
        setState(updateCard(kanban, list, { ...card, dueDate }));
      },
      [kanban]
    );
  },
  useAddCheckBox: () => {
    const [kanban, setState] = useRecoilState(kanbanState);
    return React.useCallback(
      (list: List, card: Card, checkbox: CheckBox) => {
        setState(addCheckBox(kanban, list, card, checkbox));
      },
      [kanban]
    );
  },
  useUpdateCheckBox: () => {
    const [kanban, setState] = useRecoilState(kanbanState);
    return React.useCallback(
      (list: List, card: Card, checkbox: CheckBox) => {
        setState(updateCheckBox(kanban, list, card, checkbox));
      },
      [kanban]
    );
  },
  useDeleteCheckBox: () => {
    const [kanban, setState] = useRecoilState(kanbanState);
    return React.useCallback(
      (list: List, card: Card, id: string) => {
        setState(deleteCheckBox(kanban, list, card, id));
      },
      [kanban]
    );
  },
  useAddLabel: () => {
    const [kanban, setState] = useRecoilState(kanbanState);
    return React.useCallback(
      (list: List, card: Card, label: Label) => {
        setState(addLabel(kanban, list, card, label));
      },
      [kanban]
    );
  },
  useUpdateLabel: () => {
    const [kanban, setState] = useRecoilState(kanbanState);
    return React.useCallback(
      (list: List, card: Card, label: Label) => {
        setState(updateLabel(kanban, list, card, label));
      },
      [kanban]
    );
  },
  useDeleteLabel: () => {
    const [kanban, setState] = useRecoilState(kanbanState);
    return React.useCallback(
      (list: List, card: Card, id: string) => {
        setState(deleteLabel(kanban, list, card, id));
      },
      [kanban]
    );
  },
  useAddComments: () => {
    const [kanban, setState] = useRecoilState(kanbanState);
    return React.useCallback(
      (list: List, card: Card, comment: Comment) => {
        setState(addComments(kanban, list, card, comment));
      },
      [kanban]
    );
  },
  useUpdateComments: () => {
    const [kanban, setState] = useRecoilState(kanbanState);
    return React.useCallback(
      (list: List, card: Card, comment: Comment) => {
        setState(updateComments(kanban, list, card, comment));
      },
      [kanban]
    );
  },
  useDeleteComments: () => {
    const [kanban, setState] = useRecoilState(kanbanState);
    return React.useCallback(
      (list: List, card: Card, id: string) => {
        setState(deleteComments(kanban, list, card, id));
      },
      [kanban]
    );
  },
  useUpdateSettings: () => {
    const [kanban, setState] = useRecoilState(kanbanState);
    return React.useCallback(
      (settings: Settings) => {
        setState(updateSettings(kanban, settings));
      },
      [kanban]
    );
  },
};
