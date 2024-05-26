import * as React from 'react';
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';
import { atomFamily, selectAtom } from 'jotai/utils';

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
  moveCheckBox,
  moveAllCardsToList,
} from './models/kanban';

const titleAtom = atom('');
const addCardAtom = atom<Card | undefined>(undefined);
const filterAtom = atom<{ text: string; labels: Set<string> } | undefined>(
  undefined,
);
const showModalState = atom<boolean>(false);
const menuState = atom<string | null>(null);
const kanbanAtom = atom<Kanban>({
  lists: [],
  archive: { lists: [], cards: [] },
  settings: {
    labels: [],
  },
});
const kanbanState = atom(
  (get) => get(kanbanAtom),
  (_get, set, newValue: Kanban) => {
    vscode.postMessage({
      type: 'edit',
      kanban: newValue,
    });
    set(kanbanAtom, newValue);
  },
);

const cardSelector = atomFamily(
  ({ listId, cardId }: { listId: string; cardId: string }) =>
    atom((get) =>
      get(kanbanState)
        .lists.find((v) => v.id === listId)
        ?.cards.find((v) => v.id === cardId),
    ),
);

const filteredTextState = selectAtom(
  filterAtom,
  (filter: { text: string; labels: Set<string> } | undefined) =>
    filter ? filter.text : '',
);

const filteredLabelState = selectAtom(
  filterAtom,
  (filter: { text: string; labels: Set<string> } | undefined) =>
    filter ? filter.labels : new Set([]),
);

export const selectors = {
  useTitle: () => useAtomValue(titleAtom),
  useFilterText: () => useAtomValue(filteredTextState),
  useFilterLabels: () => useAtomValue(filteredLabelState),
  useShowModal: () => useAtomValue(showModalState),
  useAddCard: () => useAtomValue(addCardAtom),
  useKanban: () => useAtomValue(kanbanState),
  useCard: (listId: string, cardId: string) =>
    useAtomValue(cardSelector({ listId, cardId })),
  useMenu: () => useAtomValue(menuState),
};

export const actions = {
  useSetTitle: () => {
    const setState = useSetAtom(titleAtom);
    return React.useCallback((title: string) => setState(title), []);
  },
  useSetKanban: () => {
    const setState = useSetAtom(kanbanState);
    return React.useCallback((kanban: Kanban) => setState(kanban), []);
  },
  useSetFilter: () => {
    const setState = useSetAtom(filterAtom);
    return React.useCallback(
      (text: string, labels: Set<string>) => setState({ text, labels }),
      [],
    );
  },
  useSetShowModal: () => {
    const setState = useSetAtom(showModalState);
    return React.useCallback((showModal: boolean) => setState(showModal), []);
  },
  useSetAddingCard: () => {
    const setState = useSetAtom(addCardAtom);
    return React.useCallback((card: Card | undefined) => setState(card), []);
  },
  useSetMenu: () => {
    const setState = useSetAtom(menuState);
    return React.useCallback((menuId: string) => setState(menuId), []);
  },
  useMenuClose: () => {
    const setState = useSetAtom(menuState);
    return React.useCallback(() => setState(''), []);
  },
};

export const kanbanActions = {
  useAddList: () => {
    const [kanban, setState] = useAtom(kanbanState);
    return React.useCallback(
      (list: List) => {
        setState(addList(kanban, list));
      },
      [kanban],
    );
  },
  useUpdateList: () => {
    const [kanban, setState] = useAtom(kanbanState);
    return React.useCallback(
      (list: List) => {
        setState(updateList(kanban, list));
      },
      [kanban],
    );
  },
  useMoveList: () => {
    const [kanban, setState] = useAtom(kanbanState);
    return React.useCallback(
      (fromListId: number, toListId: number) => {
        setState(moveList(kanban, fromListId, toListId));
      },
      [kanban],
    );
  },
  useRemoveList: () => {
    const [kanban, setState] = useAtom(kanbanState);
    return React.useCallback(
      (listId: string) => {
        setState(removeList(kanban, listId));
      },
      [kanban],
    );
  },
  useArchiveList: () => {
    const [kanban, setState] = useAtom(kanbanState);
    return React.useCallback(
      (list: List) => {
        setState(archiveList(kanban, list));
      },
      [kanban],
    );
  },
  useArchiveAllCardInList: () => {
    const [kanban, setState] = useAtom(kanbanState);
    return React.useCallback(
      (list: List) => {
        setState(archiveAllCardInList(kanban, list));
      },
      [kanban],
    );
  },
  useRestoreList: () => {
    const [kanban, setState] = useAtom(kanbanState);
    return React.useCallback(
      (list: List) => {
        setState(restoreList(kanban, list));
      },
      [kanban],
    );
  },
  useMoveAllCardsToList: () => {
    const [kanban, setState] = useAtom(kanbanState);
    return React.useCallback(
      (fromList: List, toList: List) => {
        setState(moveAllCardsToList(kanban, fromList, toList));
      },
      [kanban],
    );
  },
  useAddCard: () => {
    const [kanban, setState] = useAtom(kanbanState);
    return React.useCallback(
      (list: List, card: Card) => {
        setState(addCard(kanban, list, card));
      },
      [kanban],
    );
  },
  useUpdateCard: () => {
    const [kanban, setState] = useAtom(kanbanState);
    return React.useCallback(
      (list: List, card: Card) => {
        setState(updateCard(kanban, list, card));
      },
      [kanban],
    );
  },
  useDeleteCard: () => {
    const [kanban, setState] = useAtom(kanbanState);
    return React.useCallback(
      (card: Card) => {
        setState(deleteCard(kanban, card));
      },
      [kanban],
    );
  },
  useCopyCard: () => {
    const [kanban, setState] = useAtom(kanbanState);
    return React.useCallback(
      (card: Card) => {
        setState(copyCard(kanban, card));
      },
      [kanban],
    );
  },
  useMoveCard: () => {
    const [kanban, setState] = useAtom(kanbanState);
    return React.useCallback(
      (listId: string, fromCardIndex: number, toCardIndex: number) => {
        setState(moveCard(kanban, listId, fromCardIndex, toCardIndex));
      },
      [kanban],
    );
  },
  useMoveCardAcrossList: () => {
    const [kanban, setState] = useAtom(kanbanState);
    return React.useCallback(
      (
        fromListId: string,
        fromCardIndex: number,
        toListId: string,
        toCardIndex: number,
      ) => {
        setState(
          moveCardAcrossList(
            kanban,
            fromListId,
            fromCardIndex,
            toListId,
            toCardIndex,
          ),
        );
      },
      [kanban],
    );
  },
  useArchiveCard: () => {
    const [kanban, setState] = useAtom(kanbanState);
    return React.useCallback(
      (list: List, card: Card) => {
        setState(archiveCard(kanban, list, card));
      },
      [kanban],
    );
  },
  useRestoreCard: () => {
    const [kanban, setState] = useAtom(kanbanState);
    return React.useCallback(
      (card: Card) => {
        setState(restoreCard(kanban, card));
      },
      [kanban],
    );
  },
  useUpdateCardDueDate: () => {
    const [kanban, setState] = useAtom(kanbanState);
    return React.useCallback(
      (list: List, card: Card, dueDate?: Date) => {
        setState(updateCard(kanban, list, { ...card, dueDate }));
      },
      [kanban],
    );
  },
  useAddCheckBox: () => {
    const [kanban, setState] = useAtom(kanbanState);
    return React.useCallback(
      (list: List, card: Card, checkbox: CheckBox) => {
        setState(addCheckBox(kanban, list, card, checkbox));
      },
      [kanban],
    );
  },
  useUpdateCheckBox: () => {
    const [kanban, setState] = useAtom(kanbanState);
    return React.useCallback(
      (list: List, card: Card, checkbox: CheckBox) => {
        setState(updateCheckBox(kanban, list, card, checkbox));
      },
      [kanban],
    );
  },
  useDeleteCheckBox: () => {
    const [kanban, setState] = useAtom(kanbanState);
    return React.useCallback(
      (list: List, card: Card, id: string) => {
        setState(deleteCheckBox(kanban, list, card, id));
      },
      [kanban],
    );
  },
  useMoveCheckBox: () => {
    const [kanban, setState] = useAtom(kanbanState);
    return React.useCallback(
      (
        listId: string,
        cardId: string,
        fromCheckBoxIndex: number,
        toCheckBoxIndex: number,
      ) => {
        setState(
          moveCheckBox(
            kanban,
            listId,
            cardId,
            fromCheckBoxIndex,
            toCheckBoxIndex,
          ),
        );
      },
      [kanban],
    );
  },
  useAddLabel: () => {
    const [kanban, setState] = useAtom(kanbanState);
    return React.useCallback(
      (list: List, card: Card, label: Label) => {
        setState(addLabel(kanban, list, card, label));
      },
      [kanban],
    );
  },
  useUpdateLabel: () => {
    const [kanban, setState] = useAtom(kanbanState);
    return React.useCallback(
      (list: List, card: Card, label: Label) => {
        setState(updateLabel(kanban, list, card, label));
      },
      [kanban],
    );
  },
  useDeleteLabel: () => {
    const [kanban, setState] = useAtom(kanbanState);
    return React.useCallback(
      (list: List, card: Card, id: string) => {
        setState(deleteLabel(kanban, list, card, id));
      },
      [kanban],
    );
  },
  useAddComments: () => {
    const [kanban, setState] = useAtom(kanbanState);
    return React.useCallback(
      (list: List, card: Card, comment: Comment) => {
        setState(addComments(kanban, list, card, comment));
      },
      [kanban],
    );
  },
  useUpdateComments: () => {
    const [kanban, setState] = useAtom(kanbanState);
    return React.useCallback(
      (list: List, card: Card, comment: Comment) => {
        setState(updateComments(kanban, list, card, comment));
      },
      [kanban],
    );
  },
  useDeleteComments: () => {
    const [kanban, setState] = useAtom(kanbanState);
    return React.useCallback(
      (list: List, card: Card, id: string) => {
        setState(deleteComments(kanban, list, card, id));
      },
      [kanban],
    );
  },
  useUpdateSettings: () => {
    const [kanban, setState] = useAtom(kanbanState);
    return React.useCallback(
      (settings: Settings) => {
        setState(updateSettings(kanban, settings));
      },
      [kanban],
    );
  },
};
