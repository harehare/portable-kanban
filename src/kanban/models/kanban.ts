import {
  type Decoder,
  object,
  string,
  optional,
  array,
  boolean,
  union,
  constant,
} from '@mojotech/json-type-validation';
import { uuid } from '../utils';

export type Kanban = {
  lists: List[];
  archive: { lists: Array<Pick<List, 'id' | 'title'>>; cards: Card[] };
  settings: Settings;
};

export type Settings = {
  labels: Label[];
};

export type List = {
  id: string;
  title: string;
  cards: Card[];
};

export type ArchiveList = Pick<List, 'id' | 'title'>;

export type Card = {
  id: string;
  listId: string;
  title: string;
  description: string;
  dueDate: Date | undefined;
  labels: Label[];
  checkboxes: CheckBox[];
  comments: Comment[];
};

export type Label = {
  id: string;
  title: string;
  color: Color;
};

export type CheckBox = {
  id: string;
  title: string;
  checked: boolean;
};

export type Comment = {
  id: string;
  comment: string;
};

export const colors: ReadonlyArray<`#${string}`> = [
  '#61bd4f',
  '#f2d600',
  '#ff9f1a',
  '#eb5a46',
  '#c377e0',
  '#0079bf',
  '#00c2e0',
  '#51e898',
  '#ff78cb',
  '#344563',
] as const;

export type Color = (typeof colors)[number];

export const newCard = (id: string, listId: string) => {
  return {
    id,
    listId,
    title: '',
    description: '',
    dueDate: undefined,
    labels: [],
    checkboxes: [],
    comments: [],
  };
};

export const addList = (lists: List[], list: List): List[] => {
  if (!list.title) {
    return lists;
  }

  return [...lists, list];
};

export const updateList = (lists: List[], list: List): List[] => {
  if (!list.title) {
    return lists;
  }

  return lists.map((l) => (l.id === list.id ? list : l));
};

export const moveList = (lists: List[], fromListId: number, toListId: number): List[] => {
  const list = lists[fromListId];
  const newLists = lists.filter((l) => l.id !== list.id);
  return insert(newLists, toListId, list);
};

export const removeArchivedList = (archivedLists: ArchiveList[], listId: string): ArchiveList[] =>
  archivedLists.filter((l) => l.id !== listId);

export const archiveList = (kanban: Kanban, list: List): Kanban => {
  return {
    ...kanban,
    archive: {
      lists: [...kanban.archive.lists, list],
      cards: [...kanban.archive.cards, ...list.cards],
    },
    lists: kanban.lists.filter((l) => l.id !== list.id),
  };
};

export const archiveAllCardInList = (kanban: Kanban, list: List): Kanban => {
  return {
    ...kanban,
    archive: {
      ...kanban.archive,
      cards: [...kanban.archive.cards, ...list.cards],
    },
    lists: kanban.lists.map((l) => (l.id === list.id ? { ...l, cards: [] } : l)),
  };
};

export const restoreList = (kanban: Kanban, list: List): Kanban => {
  return {
    ...kanban,
    archive: {
      lists: kanban.archive.lists.filter((l) => l.id !== list.id),
      cards: kanban.archive.cards.filter((c) => c.listId !== list.id),
    },
    lists: [
      ...kanban.lists,
      {
        ...list,
        cards: kanban.archive.cards.filter((c) => c.listId === list.id),
      },
    ],
  };
};

export const moveAllCardsToList = (lists: List[], fromList: List, toList: List): List[] => {
  return lists.map((l) =>
    l.id === toList.id
      ? {
          ...l,
          cards: [...l.cards, ...fromList.cards.map((c) => ({ ...c, listId: toList.id }))],
        }
      : l.id === fromList.id
        ? { ...fromList, cards: [] }
        : l
  );
};

export const addCards = (lists: List[], list: List, cards: Card[]): List[] => {
  const addCards = cards.filter((c) => c.title);

  if (addCards.length === 0) {
    return lists;
  }

  return updateList(lists, { ...list, cards: [...list.cards, ...cards] });
};

export const updateCard = (lists: List[], list: List, card: Card): List[] => {
  if (!card.title) {
    return lists;
  }

  return lists.map((l) =>
    l.id === list.id
      ? {
          ...list,
          cards: list.cards.map((c) => (c.id === card.id ? card : c)),
        }
      : l
  );
};

export const deleteCard = (archiveCards: Card[], card: Card): Card[] => {
  return archiveCards.filter((c) => c.id !== card.id);
};

export const copyCard = (lists: List[], card: Card): List[] => {
  return lists.map((l) =>
    l.id === card.listId
      ? {
          ...l,
          cards: [...l.cards, { ...card, id: uuid() }],
        }
      : l
  );
};

export const moveCardAcrossList = (
  lists: List[],
  fromListId: string,
  fromCardIndex: number,
  toListId: string,
  toCardIndex: number
): List[] => {
  const fromList = lists.find((l) => l.id === fromListId);
  const fromCard = fromList?.cards[fromCardIndex];
  const toList = lists.find((l) => l.id === toListId);

  if (!fromList || !toList || !fromCard) {
    return lists;
  }

  const fromCards = fromList.cards?.filter((_, i) => i !== fromCardIndex);
  const toCards = insert(toList.cards, toCardIndex, {
    ...fromCard,
    listId: toList.id,
  });

  return lists.map((l) =>
    l.id === fromList.id ? { ...fromList, cards: fromCards } : l.id === toList.id ? { ...toList, cards: toCards } : l
  );
};

export const moveCard = (lists: List[], listId: string, fromCardIndex: number, toCardIndex: number): List[] => {
  const list = lists.find((l) => l.id === listId);
  const fromCard = list?.cards[fromCardIndex];

  if (!list || !fromCard) {
    return lists;
  }

  const movedCards = list?.cards?.filter((_, i) => i !== fromCardIndex);

  return lists.map((l) => (l.id === list.id ? { ...list, cards: insert(movedCards, toCardIndex, fromCard) } : l));
};

export const archiveCard = (kanban: Kanban, list: List, card: Card): Kanban => {
  return {
    ...kanban,
    archive: { ...kanban.archive, cards: [...kanban.archive.cards, card] },
    lists: kanban.lists.map((l) =>
      l.id === list.id ? { ...list, cards: l.cards.filter((c) => c.id !== card.id) } : l
    ),
  };
};

export const restoreCard = (kanban: Kanban, card: Card): Kanban => {
  return {
    ...kanban,
    archive: {
      ...kanban.archive,
      cards: kanban.archive.cards.filter((a) => a.id !== card.id),
    },
    lists: kanban.lists.map((l) => (l.id === card.listId ? { ...l, cards: [...l.cards, card] } : l)),
  };
};

export const addCheckBox = (lists: List[], list: List, card: Card, checkbox: CheckBox): List[] => {
  if (!checkbox.title) {
    return lists;
  }

  return lists.map((l) =>
    l.id === list.id
      ? {
          ...list,
          cards: l.cards.map((c) =>
            card.id === c.id
              ? {
                  ...card,
                  checkboxes: [...card.checkboxes, checkbox],
                }
              : c
          ),
        }
      : l
  );
};

export const updateCheckBox = (lists: List[], list: List, card: Card, checkbox: CheckBox): List[] => {
  if (!checkbox.title) {
    return lists;
  }

  return lists.map((l) =>
    l.id === list.id
      ? {
          ...list,
          cards: l.cards.map((c) =>
            card.id === c.id
              ? {
                  ...card,
                  checkboxes: card.checkboxes.map((check) => (check.id === checkbox.id ? checkbox : check)),
                }
              : c
          ),
        }
      : l
  );
};

export const deleteCheckBox = (lists: List[], list: List, card: Card, id: string): List[] => {
  return lists.map((l) =>
    l.id === list.id
      ? {
          ...list,
          cards: l.cards.map((c) =>
            card.id === c.id
              ? {
                  ...card,
                  checkboxes: card.checkboxes.filter((check) => check.id !== id),
                }
              : c
          ),
        }
      : l
  );
};

export const moveCheckBox = (
  lists: List[],
  listId: string,
  cardId: string,
  fromCheckboxIndex: number,
  toCheckboxIndex: number
): List[] => {
  const list = lists.find((l) => l.id === listId);
  const card = list?.cards.find((c) => c.id === cardId);
  const checkbox = card?.checkboxes[fromCheckboxIndex];
  const movedCheckBox = card?.checkboxes.filter((_, i) => i !== fromCheckboxIndex);

  if (!list || !card || !checkbox || !movedCheckBox) {
    return lists;
  }

  return lists.map((l) =>
    l.id === list.id
      ? {
          ...list,
          cards: l.cards.map((c) =>
            card.id === c.id
              ? {
                  ...card,
                  checkboxes: insert(movedCheckBox, toCheckboxIndex, checkbox),
                }
              : c
          ),
        }
      : l
  );
};

export const addLabel = (lists: List[], list: List, card: Card, label: Label): List[] => {
  if (!label.title) {
    return lists;
  }

  return lists.map((l) =>
    l.id === list.id
      ? {
          ...list,
          cards: l.cards.map((c) =>
            card.id === c.id
              ? {
                  ...card,
                  labels: [...card.labels, label],
                }
              : c
          ),
        }
      : l
  );
};

export const updateLabel = (lists: List[], list: List, card: Card, label: Label): List[] => {
  if (!label.title) {
    return lists;
  }

  return lists.map((l) =>
    l.id === list.id
      ? {
          ...list,
          cards: l.cards.map((c) =>
            card.id === c.id
              ? {
                  ...card,
                  labels: card.labels.map((l) => (l.id === label.id ? label : l)),
                }
              : c
          ),
        }
      : l
  );
};

export const deleteLabel = (lists: List[], list: List, card: Card, id: string): List[] => {
  return lists.map((l) =>
    l.id === list.id
      ? {
          ...list,
          cards: l.cards.map((c) =>
            card.id === c.id
              ? {
                  ...card,
                  labels: card.labels.filter((l) => l.id !== id),
                }
              : c
          ),
        }
      : l
  );
};

export const addComments = (lists: List[], list: List, card: Card, comment: Comment): List[] => {
  if (!comment.comment) {
    return lists;
  }

  return lists.map((l) =>
    l.id === list.id
      ? {
          ...list,
          cards: l.cards.map((c) =>
            card.id === c.id
              ? {
                  ...card,
                  comments: [...card.comments, comment],
                }
              : c
          ),
        }
      : l
  );
};

export const updateComments = (lists: List[], list: List, card: Card, comment: Comment): List[] => {
  if (!comment.comment) {
    return lists;
  }

  return lists.map((l) =>
    l.id === list.id
      ? {
          ...list,
          cards: l.cards.map((c) =>
            card.id === c.id
              ? {
                  ...card,
                  comments: c.comments.map((cc) => (cc.id === comment.id ? comment : cc)),
                }
              : c
          ),
        }
      : l
  );
};

export const deleteComments = (lists: List[], list: List, card: Card, id: string): List[] => {
  return lists.map((l) =>
    l.id === list.id
      ? {
          ...list,
          cards: l.cards.map((c) =>
            card.id === c.id
              ? {
                  ...card,
                  comments: c.comments.filter((cc) => cc.id !== id),
                }
              : c
          ),
        }
      : l
  );
};

export const toJson = (kanban: Kanban) => {
  return JSON.stringify(kanban, null, 2);
};

export const fromJson = async (json: string): Promise<Kanban> => {
  return kanbanDecoder.runPromise(JSON.parse(json));
};

const colorDecoder: Decoder<Color> = union(
  constant('#ff78cb'),
  constant('#344563'),
  union(
    constant('#61bd4f'),
    constant('#f2d600'),
    constant('#ff9f1a'),
    constant('#eb5a46'),
    constant('#c377e0'),
    constant('#0079bf'),
    constant('#00c2e0'),
    constant('#51e898')
  )
);

const labelDecoder: Decoder<Label> = object({
  id: string(),
  title: string(),
  color: colorDecoder,
});

const checkboxDecoder: Decoder<CheckBox> = object({
  id: string(),
  title: string(),
  checked: boolean(),
});

const commentDecoder: Decoder<Comment> = object({
  id: string(),
  comment: string(),
});

const cardDecoder: Decoder<Card> = object({
  id: string(),
  listId: string(),
  title: string(),
  description: string(),
  dueDate: optional(string().map((x) => new Date(Date.parse(x)))),
  labels: array(labelDecoder),
  checkboxes: array(checkboxDecoder),
  comments: array(commentDecoder),
});

const listDecoder: Decoder<List> = object({
  id: string(),
  title: string(),
  cards: array(cardDecoder),
});

const archiveListDecoder: Decoder<ArchiveList> = object({
  id: string(),
  title: string(),
});

const settingsDecoder: Decoder<Settings> = object({
  labels: array(labelDecoder),
});

const kanbanDecoder: Decoder<Kanban> = object({
  lists: array(listDecoder),
  archive: object({
    lists: array(archiveListDecoder),
    cards: array(cardDecoder),
  }),
  settings: settingsDecoder,
});

const insert = <T>(arr: T[], index: number, newItem: T) => [...arr.slice(0, index), newItem, ...arr.slice(index)];
