import {
  Decoder,
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
  archive: { lists: Pick<List, 'id' | 'title'>[]; cards: Card[] };
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

export const colors = [
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

export type Color = typeof colors[number];

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

export const addList = (kanban: Kanban, list: List): Kanban => {
  if (!list.title) {
    return kanban;
  }

  return {
    ...kanban,
    lists: [...kanban.lists, list],
  };
};

export const updateList = (kanban: Kanban, list: List): Kanban => {
  if (!list.title) {
    return kanban;
  }

  return {
    ...kanban,
    lists: kanban.lists.map((l) => (l.id === list.id ? list : l)),
  };
};

export const moveList = (
  kanban: Kanban,
  fromListId: number,
  toListId: number
): Kanban => {
  const list = kanban.lists[fromListId];
  const lists = kanban.lists.filter((l) => l.id !== list.id);
  return {
    ...kanban,
    lists: insert(lists, toListId, list),
  };
};

export const removeList = (kanban: Kanban, listId: string): Kanban => {
  return {
    ...kanban,
    archive: {
      ...kanban.archive,
      lists: kanban.archive.lists.filter((l) => l.id !== listId),
    },
  };
};

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
    lists: kanban.lists.map((l) =>
      l.id === list.id ? { ...l, cards: [] } : l
    ),
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

export const addCard = (kanban: Kanban, list: List, card: Card): Kanban => {
  if (!card.title) {
    return kanban;
  }

  return {
    ...kanban,
    lists: kanban.lists.map((l) =>
      l.id === list.id ? { ...list, cards: [...list.cards, card] } : l
    ),
  };
};

export const updateCard = (kanban: Kanban, list: List, card: Card): Kanban => {
  if (!card.title) {
    return kanban;
  }

  return {
    ...kanban,
    lists: kanban.lists.map((l) =>
      l.id === list.id
        ? {
            ...list,
            cards: list.cards.map((c) => (c.id === card.id ? card : c)),
          }
        : l
    ),
  };
};

export const deleteCard = (kanban: Kanban, card: Card): Kanban => {
  return {
    ...kanban,
    archive: {
      ...kanban.archive,
      cards: kanban.archive.cards.filter((c) => c.id !== card.id),
    },
  };
};

export const copyCard = (kanban: Kanban, card: Card): Kanban => {
  return {
    ...kanban,
    lists: kanban.lists.map((l) =>
      l.id === card.listId
        ? {
            ...l,
            cards: [...l.cards, { ...card, id: uuid() }],
          }
        : l
    ),
  };
};

export const moveCardAcrossList = (
  kanban: Kanban,
  fromListId: string,
  fromCardIndex: number,
  toListId: string,
  toCardIndex: number
): Kanban => {
  const fromList = kanban.lists.filter((l) => l.id === fromListId)[0];
  const fromCard = fromList.cards[fromCardIndex];
  const toList = kanban.lists.filter((l) => l.id === toListId)[0];

  if (!fromList || !toList || !fromCard) {
    return kanban;
  }

  const fromCards = fromList.cards?.filter((_, i) => i !== fromCardIndex);
  const toCards = insert(toList.cards, toCardIndex, {
    ...fromCard,
    listId: toList.id,
  });

  return {
    ...kanban,
    lists: kanban.lists.map((l) =>
      l.id === fromList.id
        ? { ...fromList, cards: fromCards }
        : l.id === toList.id
        ? { ...toList, cards: toCards }
        : l
    ),
  };
};

export const moveCard = (
  kanban: Kanban,
  listId: string,
  fromCardIndex: number,
  toCardIndex: number
): Kanban => {
  const list = kanban.lists.filter((l) => l.id === listId)[0];
  const fromCard = list?.cards[fromCardIndex];

  if (!list || !fromCard) {
    return kanban;
  }

  const movedCards = list?.cards?.filter((_, i) => i !== fromCardIndex);

  return {
    ...kanban,
    lists: kanban.lists.map((l) =>
      l.id === list.id
        ? { ...list, cards: insert(movedCards, toCardIndex, fromCard) }
        : l
    ),
  };
};

export const archiveCard = (kanban: Kanban, list: List, card: Card): Kanban => {
  return {
    ...kanban,
    archive: { ...kanban.archive, cards: [...kanban.archive.cards, card] },
    lists: kanban.lists.map((l) =>
      l.id === list.id
        ? { ...list, cards: l.cards.filter((c) => c.id !== card.id) }
        : l
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
    lists: kanban.lists.map((l) =>
      l.id === card.listId ? { ...l, cards: [...l.cards, card] } : l
    ),
  };
};

export const addCheckBox = (
  kanban: Kanban,
  list: List,
  card: Card,
  checkbox: CheckBox
): Kanban => {
  if (!checkbox.title) {
    return kanban;
  }

  return {
    ...kanban,
    lists: kanban.lists.map((l) =>
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
    ),
  };
};

export const updateCheckBox = (
  kanban: Kanban,
  list: List,
  card: Card,
  checkbox: CheckBox
): Kanban => {
  if (!checkbox.title) {
    return kanban;
  }

  return {
    ...kanban,
    lists: kanban.lists.map((l) =>
      l.id === list.id
        ? {
            ...list,
            cards: l.cards.map((c) =>
              card.id === c.id
                ? {
                    ...card,
                    checkboxes: card.checkboxes.map((check) =>
                      check.id === checkbox.id ? checkbox : check
                    ),
                  }
                : c
            ),
          }
        : l
    ),
  };
};

export const deleteCheckBox = (
  kanban: Kanban,
  list: List,
  card: Card,
  id: string
): Kanban => {
  return {
    ...kanban,
    lists: kanban.lists.map((l) =>
      l.id === list.id
        ? {
            ...list,
            cards: l.cards.map((c) =>
              card.id === c.id
                ? {
                    ...card,
                    checkboxes: card.checkboxes.filter(
                      (check) => check.id !== id
                    ),
                  }
                : c
            ),
          }
        : l
    ),
  };
};

export const addLabel = (
  kanban: Kanban,
  list: List,
  card: Card,
  label: Label
): Kanban => {
  if (!label.title) {
    return kanban;
  }

  return {
    ...kanban,
    lists: kanban.lists.map((l) =>
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
    ),
  };
};

export const updateLabel = (
  kanban: Kanban,
  list: List,
  card: Card,
  label: Label
): Kanban => {
  if (!label.title) {
    return kanban;
  }

  return {
    ...kanban,
    lists: kanban.lists.map((l) =>
      l.id === list.id
        ? {
            ...list,
            cards: l.cards.map((c) =>
              card.id === c.id
                ? {
                    ...card,
                    labels: card.labels.map((l) =>
                      l.id === label.id ? label : l
                    ),
                  }
                : c
            ),
          }
        : l
    ),
  };
};

export const deleteLabel = (
  kanban: Kanban,
  list: List,
  card: Card,
  id: string
): Kanban => {
  return {
    ...kanban,
    lists: kanban.lists.map((l) =>
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
    ),
  };
};

export const addComments = (
  kanban: Kanban,
  list: List,
  card: Card,
  comment: Comment
): Kanban => {
  if (!comment.comment) {
    return kanban;
  }

  return {
    ...kanban,
    lists: kanban.lists.map((l) =>
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
    ),
  };
};

export const updateComments = (
  kanban: Kanban,
  list: List,
  card: Card,
  comment: Comment
): Kanban => {
  if (!comment.comment) {
    return kanban;
  }

  return {
    ...kanban,
    lists: kanban.lists.map((l) =>
      l.id === list.id
        ? {
            ...list,
            cards: l.cards.map((c) =>
              card.id === c.id
                ? {
                    ...card,
                    comments: c.comments.map((cc) =>
                      cc.id === comment.id ? comment : cc
                    ),
                  }
                : c
            ),
          }
        : l
    ),
  };
};

export const deleteComments = (
  kanban: Kanban,
  list: List,
  card: Card,
  id: string
): Kanban => {
  return {
    ...kanban,
    lists: kanban.lists.map((l) =>
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
    ),
  };
};

export const updateSettings = (kanban: Kanban, settings: Settings): Kanban => {
  return {
    ...kanban,
    settings,
  };
};

export const toJson = (kanban: Kanban) => {
  return JSON.stringify(kanban);
};

export const fromJson = async (json: string): Promise<Kanban> => {
  return new Promise(async (resolve, reject) => {
    try {
      resolve(await kanbanDecoder.runPromise(JSON.parse(json)));
    } catch (e) {
      // @ts-expect-error
      reject(`invalid input json ${e.message}`);
    }
  });
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

const insert = <T>(arr: T[], index: number, newItem: T) => [
  ...arr.slice(0, index),
  newItem,
  ...arr.slice(index),
];
