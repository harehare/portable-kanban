import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { autoScrollForElements } from '@atlaskit/pragmatic-drag-and-drop-auto-scroll/element';
import { extractClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { getReorderDestinationIndex } from '@atlaskit/pragmatic-drag-and-drop-hitbox/util/get-reorder-destination-index';
import { DropIndicator } from '@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/box';
import * as React from 'react';
import { ScrollContainer } from 'react-indiana-drag-scroll';
import { styled } from 'styled-components';
import { Header } from '../components/Header';
import { List } from '../components/List';
import { AddItem } from '../components/shared/AddItem';
import { useSortableItem } from '../hooks/useSortableItem';
import {
  moveCard as moveCardFn,
  moveCardAcrossList as moveCardAcrossListFn,
  moveList as moveListFn,
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
  const dragHandleRef = React.useRef<HTMLDivElement>(null);
  const { ref, isDragging, closestEdge } = useSortableItem({
    id: list.id,
    data: { type: 'list' },
    axis: 'horizontal',
    dragHandleRef,
  });

  return (
    <div className="list" ref={ref} style={{ position: 'relative', opacity: isDragging ? 0 : 1 }}>
      <List kanban={kanban} list={list} dragHandleRef={dragHandleRef} />
      {closestEdge ? <DropIndicator edge={closestEdge} /> : null}
    </div>
  );
};

type CardDragData = { type: 'card'; id: string; listId: string };
type ListDragData = { type: 'list'; id: string };
type CardZoneDropData = { type: 'card-zone'; listId: string };
type SourceData = CardDragData | ListDragData;
type TargetData = CardDragData | ListDragData | CardZoneDropData;

const Board = () => {
  const kanban = selectors.useKanban();
  const lists = selectors.useLists();
  const title = selectors.useTitle();
  const setAddCard = actions.useSetAddingCard();
  const addList = kanbanActions.useAddList();
  const setLists = kanbanActions.useSetLists();
  const menuClose = actions.useMenuClose();

  const [showAddListInput, setShowAddListInput] = React.useState(false);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const listsRef = React.useRef(lists);
  listsRef.current = lists;

  React.useEffect(() => {
    const element = scrollContainerRef.current;
    if (!element) return;
    return autoScrollForElements({ element });
  }, []);

  React.useEffect(() => {
    return monitorForElements({
      onDrop({ source, location }) {
        const dropTargets = location.current.dropTargets;
        if (dropTargets.length === 0) return;

        const sourceData = source.data as SourceData;
        const current = listsRef.current;

        if (sourceData.type === 'list') {
          const target = dropTargets.find((t) => (t.data as TargetData).type === 'list');
          if (!target) return;
          const targetData = target.data as ListDragData;
          if (targetData.id === sourceData.id) return;

          const fromIndex = current.findIndex((l) => l.id === sourceData.id);
          const indexOfTarget = current.findIndex((l) => l.id === targetData.id);
          if (fromIndex < 0 || indexOfTarget < 0) return;

          const toIndex = getReorderDestinationIndex({
            startIndex: fromIndex,
            indexOfTarget,
            closestEdgeOfTarget: extractClosestEdge(target.data),
            axis: 'horizontal',
          });
          if (toIndex === fromIndex) return;

          setLists(moveListFn(current, fromIndex, toIndex));
          return;
        }

        const fromList = current.find((l) => l.id === sourceData.listId);
        if (!fromList) return;
        const fromIndex = fromList.cards.findIndex((c) => c.id === sourceData.id);
        if (fromIndex < 0) return;

        const cardTarget = dropTargets.find((t) => (t.data as TargetData).type === 'card');
        const zoneTarget = dropTargets.find((t) => (t.data as TargetData).type === 'card-zone');

        let toListId: string;
        let toIndex: number;

        if (cardTarget) {
          const targetData = cardTarget.data as unknown as CardDragData;
          const toList = current.find((l) => l.id === targetData.listId);
          if (!toList) return;
          const indexOfTarget = toList.cards.findIndex((c) => c.id === targetData.id);
          if (indexOfTarget < 0) return;

          toListId = toList.id;
          if (toListId === fromList.id) {
            toIndex = getReorderDestinationIndex({
              startIndex: fromIndex,
              indexOfTarget,
              closestEdgeOfTarget: extractClosestEdge(cardTarget.data),
              axis: 'vertical',
            });
          } else {
            toIndex = extractClosestEdge(cardTarget.data) === 'bottom' ? indexOfTarget + 1 : indexOfTarget;
          }
        } else if (zoneTarget) {
          const targetData = zoneTarget.data as unknown as CardZoneDropData;
          const toList = current.find((l) => l.id === targetData.listId);
          if (!toList) return;
          toListId = toList.id;
          toIndex = toList.cards.length;
        } else {
          return;
        }

        if (toListId === fromList.id) {
          if (toIndex === fromIndex) return;
          setLists(moveCardFn(current, fromList.id, fromIndex, toIndex));
        } else {
          setLists(moveCardAcrossListFn(current, fromList.id, fromIndex, toListId, toIndex));
        }
      },
    });
  }, [setLists]);

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
      <Contents>
        <ScrollContainer
          // react-indiana-drag-scroll's ref prop type is incompatible with React 19's ReactNode typings
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ref={scrollContainerRef as any}
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
          {lists.map((l) => (
            <SortableListItem key={l.id} list={l} kanban={kanban} />
          ))}
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
    </Container>
  ) : (
    <></>
  );
};

export { Board };
