import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { autoScrollForElements } from '@atlaskit/pragmatic-drag-and-drop-auto-scroll/element';
import { DropIndicator } from '@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/box';
import Fuse from 'fuse.js';
import * as React from 'react';
import { FiPlus } from 'react-icons/fi';
import { MdAdd, MdArchive, MdDriveFileMoveOutline, MdMenu, MdOutlineArchive, MdSortByAlpha } from 'react-icons/md';
import { styled } from 'styled-components';
import { type Card as CardModel, type Kanban as KanbanModel, type List as ListModel, newCard } from 'portable-kanban-core';
import { useSortableItem } from '../hooks/useSortableItem';
import { actions, kanbanActions, selectors } from '../store';
import { uuid } from 'portable-kanban-core';
import { Card } from './Card';
import { SelectList } from './SelectList';
import { AddButton } from './shared/AddButton';
import { Menu } from './shared/Menu';
import { TextSm } from './shared/Text';
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
  cursor: grab;
  &:active {
    cursor: grabbing;
  }
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

const CardCountBadge = styled.span`
  color: var(--secondary-text-color);
  font-size: 0.8rem;
  font-weight: 500;
  margin-left: 6px;
  flex-shrink: 0;
  line-height: 1;
`;

const EmptyState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px 8px;
  color: var(--text-color);
  font-size: 0.75rem;
  opacity: 0.35;
  font-style: italic;
  user-select: none;
`;

const isLabelMatch = (card: CardModel, labels: Set<string>): boolean =>
  labels.size === 0 || card.labels.map((l) => l.title).some((x) => labels.has(x));

type SortableCardItemProps = {
  card: CardModel;
  listId: string;
};

const SortableCardItem = ({ card, listId }: SortableCardItemProps) => {
  const { ref, isDragging, closestEdge } = useSortableItem({
    id: card.id,
    data: { type: 'card', listId },
    axis: 'vertical',
  });

  return (
    <div ref={ref} style={{ position: 'relative', opacity: isDragging ? 0 : 1 }}>
      <Card key={card.id} card={card} />
      {closestEdge ? <DropIndicator edge={closestEdge} /> : null}
    </div>
  );
};

type Properties = {
  kanban: KanbanModel;
  list: ListModel;
  dragHandleRef?: React.RefObject<HTMLElement | null>;
};

const searchOptions = {
  includeScore: true,
  keys: ['title', 'description', 'comments.comment'],
};

export const List = ({ kanban, list, dragHandleRef }: Properties) => {
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

    const currentSortOrder = sortOrder[list.id] ?? 'none';
    if (currentSortOrder === 'titleAsc') {
      cards = [...cards].sort((a, b) => a.title.localeCompare(b.title));
    } else if (currentSortOrder === 'titleDesc') {
      cards = [...cards].sort((a, b) => b.title.localeCompare(a.title));
    }

    return cards;
  }, [searcher, list, filteredText, filteredLabels, sortOrder]);

  const cardsContainerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const element = cardsContainerRef.current;
    if (!element) return;
    return combine(
      dropTargetForElements({
        element,
        getData: () => ({ type: 'card-zone', listId: list.id }),
      }),
      autoScrollForElements({ element }),
    );
  }, [list.id]);

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

              if (matchingLabels.length > 0) {
                return {
                  ...newCard(uuid(), list.id),
                  title: potentialTitle,
                  labels: matchingLabels,
                };
              }
            }

            return {
              ...newCard(uuid(), list.id),
              title: v.trim(),
              labels: [],
            };
          })
          .filter((c) => c.title !== ''),
      );
    },
    [lists, list, settings.labels, addCards],
  );

  return (
    <Container>
      <Contents>
        <div
          onClick={(e: React.MouseEvent<HTMLDivElement>) => {
            if (list.id === addingCard?.listId) {
              e.stopPropagation();
            }
          }}
        >
          <Header ref={dragHandleRef as React.RefObject<HTMLDivElement>}>
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
              <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                <Title
                  title={list.title}
                  fontSize={'medium'}
                  width='100%'
                  onEnter={(text) => {
                    updateList({
                      ...list,
                      title: text,
                    });
                  }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                {filteredCards.length > 0 && <CardCountBadge>{filteredCards.length}</CardCountBadge>}
              </div>
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
                      sortListCards(list.id, 'titleAsc');
                      setSortOrder(list.id, 'none');
                    },
                  },
                  {
                    icon: <MdSortByAlpha style={{ transform: 'scaleY(-1)' }} />,
                    text: 'Sort by Title Z-A',
                    onClick() {
                      sortListCards(list.id, 'titleDesc');
                      setSortOrder(list.id, 'none');
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
          <div
            ref={cardsContainerRef}
            style={{
              maxHeight: 'calc(100vh - var(--header-height) - 112px)',
              overflowY: 'auto',
            }}
          >
            <Cards>
              {filteredCards.map((c) => (
                <SortableCardItem key={c.id} card={c} listId={list.id} />
              ))}
              {filteredCards.length === 0 && list.id !== addingCard?.listId && (
                <EmptyState>{filteredText || filteredLabels.size > 0 ? 'No matching cards' : 'No cards'}</EmptyState>
              )}
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
              onBlur={(c) => {
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
      </Contents>
    </Container>
  );
};
