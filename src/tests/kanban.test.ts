import { randomUUID } from 'node:crypto';
import { describe, it, expect } from 'vitest';
import {
  addCards,
  addCheckBox,
  addList,
  archiveCard,
  fromJson,
  restoreCard,
  updateCard,
} from '../kanban/models/kanban';

describe('fromJson', () => {
  const emptyKanban = fromJson(
    JSON.stringify({
      lists: [],
      settings: { labels: [] },
      archive: { lists: [], cards: [] },
    })
  );

  const newList = () => ({
    id: randomUUID(),
    title: 'test',
    cards: [],
  });

  const newCard = (listId: string) => {
    return {
      id: 'card',
      listId,
      title: 'card',
      description: 'description',
      dueDate: undefined,
      labels: [],
      checkboxes: [],
      comments: [],
    };
  };

  it('kanban can parse', async () => {
    const data = await emptyKanban;
    expect(data?.lists.length).toBe(0);
  });

  it('kanban lists can parse', async () => {
    const data = await fromJson(
      JSON.stringify({
        lists: [
          {
            id: 'listId',
            title: 'title',
            cards: [
              {
                id: 'id',
                listId: 'listId',
                title: 'title',
                description: 'description',
                dueDate: undefined,
                labels: [],
                checkboxes: [],
                comments: [],
              },
            ],
          },
        ],
        settings: {
          labels: [],
        },
        archive: { lists: [], cards: [] },
      })
    );
    expect(data?.lists.length).toBe(1);
    expect(data?.lists[0].cards.length).toBe(1);
    expect(data?.lists[0].cards[0].title).toBe('title');
  });

  it('edit list and cards', async () => {
    const data = await emptyKanban;
    const checkBox = { id: 'checkbox', title: 'checkbox', checked: true };
    const list = newList();
    const card = newCard(list.id);
    const lists = addCheckBox(addCards(addList(data.lists, list), list, [card]), list, card, checkBox);
    const kanban = { ...data, lists };
    expect(lists.length).toBe(1);
    expect(lists[0].cards.length).toBe(1);
    expect(lists[0].cards[0].checkboxes.length).toBe(1);
    expect(updateCard(lists, lists[0], { ...card, title: 'updated' })[0].cards[0].title).toBe('updated');
    expect(archiveCard(kanban, lists[0], card).archive.cards.length).toBe(1);
  });

  it('archive and restore cards', async () => {
    const data = await emptyKanban;
    const list = newList();
    const card = newCard(list.id);
    const lists = addCards(addList(data.lists, list), list, [card]);
    const kanban = { ...data, lists };
    expect(archiveCard(kanban, kanban.lists[0], card).archive.cards.length).toBe(1);
    expect(restoreCard(archiveCard(kanban, kanban.lists[0], card), card).archive.cards.length).toBe(0);
  });
});
