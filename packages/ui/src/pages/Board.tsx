import {
  closestCenter,
  DndContext,
  DragOverlay,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  PointerSensor,
  pointerWithin,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { horizontalListSortingStrategy, SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import * as React from 'react';
import { ScrollContainer } from 'react-indiana-drag-scroll';
import { styled } from 'styled-components';
import { Card } from '../components/Card';
import { Header } from '../components/Header';
import { List } from '../components/List';
import { AddItem } from '../components/shared/AddItem';
import {
  moveCard as moveCardFn,
  moveCardAcrossList as moveCardAcrossListFn,
  moveList as moveListFn,
  type Card as CardModel,
  type Kanban as KanbanModel,
  type List as ListModel,
} from 'portable-kanban-core';
import { actions, kanbanActions, selectors } from '../store';
import { uuid } from 'portable-kanban-core';

const Container = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--main-background-color);
`;

const Contents = styled.div`
  width: 100%;
  height: calc(100vh - var(--header-height));
  display: flex;
  background-color: transparent;
  overflow-x: auto;
  align-items: flex-start;
  align-content: flex-start;
`;

type SortableListItemProps = {
  list: ListModel;
  kanban: KanbanModel;
};

const SortableListItem = ({ list, kanban }: SortableListItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: list.id,
    data: { type: 'list' },
  });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,
  };

  return (
    <div className="list" ref={setNodeRef} style={style}>
      <List kanban={kanban} list={list} dragHandleListeners={listeners} dragHandleAttributes={attributes} />
    </div>
  );
};

type ActiveDrag = { type: 'card'; cardId: string } | { type: 'list'; listId: string } | null;

const Board = () => {
  const kanban = selectors.useKanban();
  const storeLists = selectors.useLists();
  const title = selectors.useTitle();
  const setAddCard = actions.useSetAddingCard();
  const addList = kanbanActions.useAddList();
  const setLists = kanbanActions.useSetLists();
  const menuClose = actions.useMenuClose();

  const [showAddListInput, setShowAddListInput] = React.useState(false);
  const [activeDrag, setActiveDrag] = React.useState<ActiveDrag>(null);
  const [localLists, setLocalLists] = React.useState<ListModel[] | null>(null);
  // Ref for synchronous access in callbacks without stale closures
  const localListsRef = React.useRef<ListModel[] | null>(null);
  // Cache the dragged card/list at drag start to avoid searching on every onDragOver
  const overlayCardRef = React.useRef<CardModel | null>(null);
  const overlayListRef = React.useRef<ListModel | null>(null);

  // During drag use local state for rendering; otherwise use store state
  const lists = localLists ?? storeLists;

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
  const listIds = React.useMemo(() => lists.map((l) => l.id), [lists]);

  const updateLocalLists = React.useCallback((newLists: ListModel[] | null) => {
    localListsRef.current = newLists;
    setLocalLists(newLists);
  }, []);

  const onDragStart = React.useCallback(
    (event: DragStartEvent) => {
      const { active } = event;
      const type = active.data.current?.type as string | undefined;
      const snapshot = [...storeLists];
      // Snapshot store lists into local state at drag start
      updateLocalLists(snapshot);
      if (type === 'card') {
        const cardId = active.id as string;
        for (const l of snapshot) {
          const found = l.cards.find((c) => c.id === cardId);
          if (found) {
            overlayCardRef.current = found;
            break;
          }
        }
        overlayListRef.current = null;
        setActiveDrag({ type: 'card', cardId });
      } else if (type === 'list') {
        const listId = active.id as string;
        overlayListRef.current = snapshot.find((l) => l.id === listId) ?? null;
        overlayCardRef.current = null;
        setActiveDrag({ type: 'list', listId });
      }
    },
    [storeLists, updateLocalLists],
  );

  // Prefer card-level droppables over list-level droppables to avoid
  // the DragOverlay center landing on a list container when the pointer
  // is still within a card (e.g. hovering near the bottom edge of a card).
  const collisionDetection = React.useCallback((args: Parameters<typeof closestCenter>[0]) => {
    const pointerCollisions = pointerWithin(args);
    const cardCollisions = pointerCollisions.filter(({ id }) => {
      const container = args.droppableContainers.find((c) => c.id === id);
      return container?.data?.current?.type === 'card';
    });
    if (cardCollisions.length > 0) return cardCollisions;
    if (pointerCollisions.length > 0) return pointerCollisions;
    return closestCenter(args);
  }, []);

  const onDragOver = React.useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;
      if (!over) return;

      const activeType = active.data.current?.type as string | undefined;
      if (activeType !== 'card') return;

      const current = localListsRef.current;
      if (!current) return;

      // Search local state for the card's current list (active.data.listId is stale after cross-list moves)
      const fromList = current.find((l) => l.cards.some((c) => c.id === active.id));
      if (!fromList) return;

      const overType = over.data.current?.type as string | undefined;
      const toListId = overType === 'card' ? (over.data.current?.listId as string) : (over.id as string);
      const toList = current.find((l) => l.id === toListId);
      if (!toList) return;

      const fromIndex = fromList.cards.findIndex((c) => c.id === active.id);

      if (fromList.id === toListId) {
        // Same-list reorder — handle here so position is always up-to-date
        if (overType !== 'card') return;
        const toIndex = toList.cards.findIndex((c) => c.id === over.id);
        if (toIndex < 0 || fromIndex === toIndex) return;
        updateLocalLists(moveCardFn(current, fromList.id, fromIndex, toIndex));
      } else {
        // Cross-list move
        const toIndex =
          overType === 'card' ? (toList.cards.findIndex((c) => c.id === over.id) ?? 0) : toList.cards.length;
        updateLocalLists(moveCardAcrossListFn(current, fromList.id, fromIndex, toListId, toIndex));
      }
    },
    [updateLocalLists],
  );

  const onDragEnd = React.useCallback(
    (event: DragEndEvent) => {
      setActiveDrag(null);
      const { active, over } = event;
      const current = localListsRef.current ?? storeLists;

      // Dropped outside any droppable — revert without saving
      if (!over) {
        updateLocalLists(null);
        return;
      }

      let finalLists = current;

      // Card moves are fully applied by onDragOver; only list reorder remains
      if (active.id !== over.id) {
        const activeType = active.data.current?.type as string | undefined;
        if (activeType === 'list') {
          const fromIndex = current.findIndex((l) => l.id === active.id);
          const toIndex = current.findIndex((l) => l.id === over.id);
          if (fromIndex >= 0 && toIndex >= 0 && fromIndex !== toIndex) {
            finalLists = moveListFn(current, fromIndex, toIndex);
          }
        }
      }

      // Commit to store (triggers VSCode file save)
      setLists(finalLists);
      updateLocalLists(null);
    },
    [storeLists, setLists, updateLocalLists],
  );

  return kanban ? (
    <Container
      onClick={() => {
        setAddCard(undefined);
        setShowAddListInput(false);
        menuClose();
      }}
      onDoubleClick={() => {
        setShowAddListInput(true);
      }}
      onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Escape') {
          setAddCard(undefined);
          setShowAddListInput(false);
          menuClose();
        }
      }}
    >
      <Header title={title ?? 'untitled'} />
      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetection}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
      >
        <Contents>
          <ScrollContainer
            mouseScroll={{ ignoreElements: '.list' }}
            style={{
              width: '100%',
              height: 'calc(100vh - var(--header-height))',
              display: 'flex',
              backgroundColor: 'transparent',
              overflowX: 'auto',
              alignItems: 'flex-start',
              alignContent: 'flex-start',
            }}
          >
            <SortableContext items={listIds} strategy={horizontalListSortingStrategy}>
              {lists.map((l) => (
                <SortableListItem key={l.id} list={l} kanban={kanban} />
              ))}
            </SortableContext>
            <div style={{ margin: '8px' }}>
              <AddItem
                showInput={showAddListInput}
                addText="Add List"
                placeholder="Enter list title"
                type="primary"
                onEnter={(t) => {
                  addList({
                    id: uuid(),
                    title: t,
                    cards: [],
                  });
                }}
              />
            </div>
          </ScrollContainer>
        </Contents>
        <DragOverlay>
          {activeDrag?.type === 'card' && overlayCardRef.current ? (
            <Card card={overlayCardRef.current} editable={false} />
          ) : null}
          {activeDrag?.type === 'list' && overlayListRef.current ? (
            <List kanban={kanban} list={overlayListRef.current} />
          ) : null}
        </DragOverlay>
      </DndContext>
    </Container>
  ) : (
    <></>
  );
};

export { Board };
