import Fuse from 'fuse.js';
import * as React from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { FiPlus } from 'react-icons/fi';
import { MdAdd, MdArchive, MdDriveFileMoveOutline, MdMenu, MdOutlineArchive, MdSortByAlpha } from 'react-icons/md';
import { styled } from 'styled-components';
import { type Kanban as KanbanModel, type List as ListModel, type Card as CardModel, newCard } from '../models/kanban';
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
  labels.size === 0 || card.labels.map((l) => l.title).some((x) => labels.has(x));

type Properties = {
  kanban: KanbanModel;
  list: ListModel;
};

const searchOptions = {
  includeScore: true,
  keys: ['title', 'description', 'comments.comment'],
};

export const List = ({ kanban, list }: Properties) => {
  const lists = selectors.useLists();
  const settings = selectors.useSettings();
  const setKanban = actions.useSetKanban();

  const addCards = kanbanActions.useAddCards();
  const updateList = kanbanActions.useUpdateList();
  const setAddCard = actions.useSetAddingCard();
  const archiveList = kanbanActions.useArchiveList();

  const moveAllCardsToList = kanbanActions.useMoveAllCardsToList();
  const archiveAllCardInList = kanbanActions.useArchiveAllCardInList();
  const addingCard = selectors.useAddingCard();
  const filteredText = selectors.useFilterText();
  const filteredLabels = selectors.useFilterLabels();
  const setMenu = actions.useSetMenu();
  const sortOrder = selectors.useSortOrder();
  const setSortOrder = actions.useSetSortOrder();
  const sortListCards = kanbanActions.useSortListCards();
  const searcher = React.useMemo(() => new Fuse(list.cards, searchOptions), [list.cards]);
  const filteredCards = React.useMemo(() => {
    let cards: CardModel[];

    if (filteredText) {
      const result = searcher.search(filteredText);
      cards = result.filter((c) => isLabelMatch(c.item, filteredLabels)).map((r) => r.item);
    } else {
      cards = list.cards.filter((c) => isLabelMatch(c, filteredLabels));
    }

    // Apply sorting
    const currentSortOrder = sortOrder[list.id] ?? 'none';
    if (currentSortOrder === 'titleAsc') {
      cards = [...cards].sort((a, b) => a.title.localeCompare(b.title));
    } else if (currentSortOrder === 'titleDesc') {
      cards = [...cards].sort((a, b) => b.title.localeCompare(a.title));
    }

    return cards;
  }, [searcher, kanban, list, filteredText, filteredLabels, sortOrder]);
  const cardList = React.useMemo(
    () =>
      filteredCards.map((c, index) => (
        <Draggable key={c.id} draggableId={c.id} index={index}>
          {(provided) => (
            <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
              <Card key={c.id} card={c} />
            </div>
          )}
        </Draggable>
      )),
    [filteredCards]
  );
  const handleAddCard = React.useCallback(
    (card: CardModel) => {
      const newList = lists.find((l) => l.id === list.id);
      addCards(
        newList ?? list,
        card.title
          .split('\n')
          .map((v) => {
            const tokens = v.split(':').filter(Boolean);
            if (tokens.length > 1) {
              const potentialLabelName = tokens[0].trim();
              const potentialTitle = tokens.slice(1).join(':').trim();
              const matchingLabels = settings.labels.filter((l) => l.title === potentialLabelName);

              // Only treat as label:title format if the label actually exists
              if (matchingLabels.length > 0) {
                return {
                  ...newCard(uuid(), list.id),
                  title: potentialTitle,
                  labels: matchingLabels,
                };
              }
            }

            // If no valid label found or no colon, use the entire text as title
            return {
              ...newCard(uuid(), list.id),
              title: v.trim(),
              labels: [],
            };
          })
          .filter((c) => c.title !== '')
      );
    },
    [kanban, list]
  );

  return (
    <Container>
      <Contents>
        <Droppable droppableId={list.id} type="cards">
          {(provided) => (
            <div
              ref={provided.innerRef}
              onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                // Prevent click from bubbling up to Board container when adding a card
                if (list.id === addingCard?.listId) {
                  e.stopPropagation();
                }
              }}
            >
              <Header>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingLeft: '8px',
                    paddingBottom: '8px',
                    position: 'relative',
                  }}
                >
                  <Title
                    title={list.title}
                    fontSize={'medium'}
                    width={180}
                    onEnter={(text) => {
                      updateList({
                        ...list,
                        title: text,
                      });
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
                        onClick() {
                          setAddCard(newCard(uuid(), list.id));
                        },
                      },
                      'separator',
                      {
                        icon: <MdSortByAlpha />,
                        text: 'Sort by Title A-Z',
                        onClick() {
                          setSortOrder(list.id, 'titleAsc');
                          sortListCards(list.id, 'titleAsc');
                        },
                      },
                      {
                        icon: <MdSortByAlpha style={{ transform: 'scaleY(-1)' }} />,
                        text: 'Sort by Title Z-A',
                        onClick() {
                          setSortOrder(list.id, 'titleDesc');
                          sortListCards(list.id, 'titleDesc');
                        },
                      },
                      'separator',
                      {
                        icon: <MdDriveFileMoveOutline />,
                        text: 'Move all cards in this list',
                        onClick() {
                          setMenu(`select-list-${list.id}`);
                        },
                      },
                      'separator',
                      {
                        icon: <MdArchive />,
                        text: 'Archive this list',
                        onClick() {
                          archiveList(list);
                        },
                      },
                      {
                        icon: <MdOutlineArchive />,
                        text: 'Archive all cards in the list',
                        onClick() {
                          archiveAllCardInList(list);
                        },
                      },
                    ]}
                  />
                  <SelectList
                    menuId={`select-list-${list.id}`}
                    listId={list.id}
                    lists={lists}
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
                }}
              >
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
                }}
              >
                <Cards>
                  {cardList}
                  {provided.placeholder}
                </Cards>
              </div>
              {list.id === addingCard?.listId ? (
                <Card
                  card={addingCard}
                  isEdit={true}
                  onEnter={(c) => {
                    setAddCard(undefined);
                    handleAddCard(c);
                  }}
                />
              ) : (
                <></>
              )}
              {list.id === addingCard?.listId ? (
                <AddButton
                  text="Add a card"
                  type="primary"
                  disabled={addingCard?.title === undefined || addingCard?.title?.replace('\n', '') === ''}
                  canClose={true}
                  onAddClick={() => {
                    setAddCard(undefined);
                    handleAddCard(addingCard);
                  }}
                  onCancel={() => {
                    setAddCard(undefined);
                    setKanban(kanban);
                  }}
                />
              ) : (
                <AddLabel
                  onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                    e.stopPropagation();
                    setAddCard(newCard(uuid(), list.id));
                  }}
                >
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
