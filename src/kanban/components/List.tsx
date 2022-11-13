import Fuse from 'fuse.js';
import * as React from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { FiPlus } from 'react-icons/fi';
import {
  MdAdd,
  MdArchive,
  MdDriveFileMoveOutline,
  MdMenu,
  MdOutlineArchive,
} from 'react-icons/md';
import styled from 'styled-components';

import {
  Kanban as KanbanModel,
  List as ListModel,
  Card as CardModel,
  addCard as addCardToKanban,
  newCard,
  updateList,
} from '../models/kanban';
import { selectors, actions, kanbanActions } from '../store';
import { uuid } from '../utils';
import { Card } from './Card';
import { SelectList } from './SelectList';
import { AddButton } from './shared/AddButton';
import { Menu } from './shared/Menu';
import { TextSm, TextXs } from './shared/Text';
import { Title } from './shared/Title';

const Container = styled.div`
  width: var(--list-width);
  margin: 8px 0 8px 8px;
`;

const Contents = styled.div`
  padding: 8px;
  border-radius: var(--border-radius);
  background-color: var(--primary-background-color);
  box-shadow: var(--shadow-sm);
`;

const Cards = styled.div`
  overflow: hidden;
`;

const Header = styled.div`
  width: 100%;
`;

const AddLabel = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  border: none;
  outline: none;
  cursor: pointer;
  background-color: transparent;
  color: var(--text-color);
  margin-top: -4px;
`;

const Icon = styled.div`
  background-color: transparent;
  color: var(--text-color);
  border: none;
  outline: none;
  cursor: pointer;
  font-size: 1.125rem;
  line-height: 1.75rem;
  font-weight: 600;
  margin-top: 6px;
`;

const isLabelMatch = (card: CardModel, labels: Set<string>): boolean =>
  labels.size === 0 ||
  [...card.labels.map((l) => l.title)].filter((x) => labels.has(x)).length > 0;

type Props = {
  kanban: KanbanModel;
  list: ListModel;
};

const searchOptions = {
  includeScore: true,
  keys: ['title', 'description', 'comments.comment'],
};

export const List = ({ kanban, list }: Props) => {
  const setKanban = actions.useSetKanban();
  const setAddCard = actions.useSetAddingCard();
  const archiveList = kanbanActions.useArchiveList();
  const moveAllCardsToList = kanbanActions.useMoveAllCardsToList();
  const archiveAllCardInList = kanbanActions.useArchiveAllCardInList();
  const addCard = selectors.useAddCard();
  const filteredText = selectors.useFilterText();
  const filteredLabels = selectors.useFilterLabels();
  const setMenu = actions.useSetMenu();
  const searcher = React.useMemo(
    () => new Fuse(list.cards, searchOptions),
    [list.cards]
  );
  const filteredCards = React.useMemo(() => {
    if (!filteredText) {
      return list.cards.filter((c) => isLabelMatch(c, filteredLabels));
    }

    const result = searcher.search(filteredText || '');
    return result
      .filter((c) => isLabelMatch(c.item, filteredLabels))
      .map((r) => r.item);
  }, [searcher, kanban, list, filteredText, filteredLabels]);
  const cardList = React.useMemo(
    () =>
      filteredCards.map((c, index) => (
        <Draggable key={c.id} draggableId={c.id} index={index}>
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}>
              <Card key={c.id} card={c} />
            </div>
          )}
        </Draggable>
      )),
    [filteredCards]
  );
  const handleAddCard = React.useCallback(
    (card: CardModel) => {
      setKanban(
        card.title.split('\n').reduce((arr, v) => {
          const newList = arr.lists.find((l) => l.id === list.id);
          const tokens = v.split(':').filter((x) => !!x);
          const title = tokens.length > 1 ? tokens[1] : v;
          const labelName = tokens.length > 1 ? tokens[0] : undefined;
          const labels = labelName
            ? kanban.settings.labels.filter((l) => l.title === labelName)
            : [];

          return addCardToKanban(arr, newList ?? list, {
            ...newCard(uuid(), list.id),
            title,
            labels,
          });
        }, kanban)
      );
    },
    [kanban, setKanban]
  );

  return (
    <Container>
      <Contents>
        <Droppable droppableId={list.id} type="cards">
          {(provided) => (
            <div ref={provided.innerRef}>
              <Header>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingLeft: '8px',
                    paddingBottom: '8px',
                    position: 'relative',
                  }}>
                  <Title
                    title={list.title}
                    fontSize={'medium'}
                    width={180}
                    onEnter={(text) => {
                      setKanban(
                        updateList(kanban, {
                          ...list,
                          title: text,
                        })
                      );
                    }}
                  />
                  <Menu
                    id={`list-${list.id}`}
                    position="right"
                    icon={<MdMenu />}
                    items={[
                      {
                        icon: <MdAdd />,
                        text: 'Add Card',
                        onClick: () => {
                          setAddCard(newCard(uuid(), list.id));
                        },
                      },
                      'separator',
                      {
                        icon: <MdDriveFileMoveOutline />,
                        text: 'Move all cards in this list',
                        onClick: () => {
                          setMenu(`select-list-${list.id}`);
                        },
                      },
                      'separator',
                      {
                        icon: <MdArchive />,
                        text: 'Archive this list',
                        onClick: () => {
                          archiveList(list);
                        },
                      },
                      {
                        icon: <MdOutlineArchive />,
                        text: 'Archive all cards in the list',
                        onClick: () => {
                          archiveAllCardInList(list);
                        },
                      },
                    ]}
                  />
                  <SelectList
                    menuId={`select-list-${list.id}`}
                    listId={list.id}
                    lists={kanban.lists}
                    onClick={(toList) => {
                      moveAllCardsToList(list, toList);
                    }}
                  />
                </div>
              </Header>
              <TextXs
                style={{
                  color: 'var(--dark-text-color)',
                  marginTop: '-2px',
                }}>
                {filteredCards.length === 1
                  ? '1 card'
                  : filteredCards.length > 1
                  ? `${filteredCards.length} cards`
                  : ''}
              </TextXs>
              <div
                style={{
                  maxHeight: 'calc(100vh - var(--header-height) - 112px)',
                  overflowY: 'auto',
                }}>
                <Cards>
                  {cardList}
                  {provided.placeholder}
                </Cards>
              </div>
              {list.id === addCard?.listId ? (
                <Card
                  card={addCard}
                  isEdit={true}
                  onEnter={(c) => {
                    setAddCard(undefined);
                    handleAddCard(c);
                  }}
                />
              ) : (
                <></>
              )}
              {list.id === addCard?.listId ? (
                <AddButton
                  text="Add a card"
                  type="primary"
                  disabled={
                    addCard?.title === undefined ||
                    addCard?.title?.replace('\n', '') === ''
                  }
                  canClose={true}
                  onAddClick={() => {
                    setAddCard(undefined);
                    handleAddCard(addCard);
                  }}
                  onCancel={() => {
                    setAddCard(undefined);
                    setKanban(kanban);
                  }}
                />
              ) : (
                <AddLabel
                  onClick={(e) => {
                    e.stopPropagation();
                    setAddCard(newCard(uuid(), list.id));
                  }}>
                  <Icon>
                    <FiPlus />
                  </Icon>
                  <TextSm>{'Add Card'}</TextSm>
                </AddLabel>
              )}
            </div>
          )}
        </Droppable>
      </Contents>
    </Container>
  );
};
