import * as React from 'react';
import { DragDropContext, Droppable, Draggable, type DropResult } from 'react-beautiful-dnd';
import { ScrollContainer } from 'react-indiana-drag-scroll';
import { styled } from 'styled-components';
import { Header } from '../components/Header';
import { List } from '../components/List';
import { AddItem } from '../components/shared/AddItem';
import { type Kanban as KanbanModel } from '../models/kanban';
import { selectors, kanbanActions, actions } from '../store';
import { uuid } from '../utils';

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

type Properties = {
  kanban: KanbanModel;
};

const Board = ({ kanban }: Properties) => {
  const title = selectors.useTitle();
  const setAddCard = actions.useSetAddingCard();
  const moveList = kanbanActions.useMoveList();
  const moveCard = kanbanActions.useMoveCard();
  const moveCardAcrossList = kanbanActions.useMoveCardAcrossList();
  const addList = kanbanActions.useAddList();
  const menuClose = actions.useMenuClose();
  const [showAddListInput, setShowAddListInput] = React.useState(false);
  const list = React.useMemo(
    () =>
      kanban?.lists.map((l, index) => (
        <Draggable key={l.id} draggableId={l.id} index={index}>
          {(provided) => (
            <div className="list" ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
              <List kanban={kanban} list={l} />
            </div>
          )}
        </Draggable>
      )),
    [kanban]
  );
  const onDragEnd = React.useCallback(
    (result: DropResult) => {
      if (!result.destination || !kanban) {
        return;
      }

      switch (result.type) {
        case 'lists': {
          moveList(result.source.index, result.destination.index);
          break;
        }

        case 'cards': {
          if (result.source.droppableId === result.destination.droppableId) {
            moveCard(result.source.droppableId, result.source.index, result.destination.index);
            break;
          } else {
            moveCardAcrossList(
              result.source.droppableId,
              result.source.index,
              result.destination.droppableId,
              result.destination.index
            );
            break;
          }
        }

        default: {
          throw new Error('invalid type');
        }
      }
    },
    [kanban]
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
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="list" direction="horizontal" type="lists">
          {(provided) => (
            <Contents {...provided.droppableProps} ref={provided.innerRef}>
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
                {list}
                {provided.placeholder}
                <div style={{ margin: '8px' }}>
                  <AddItem
                    showInput={showAddListInput}
                    addText="Add List"
                    placeholder="Enter list title"
                    type="primary"
                    onEnter={(title) => {
                      addList({
                        id: uuid(),
                        title,
                        cards: [],
                      });
                    }}
                  />
                </div>
              </ScrollContainer>
            </Contents>
          )}
        </Droppable>
      </DragDropContext>
    </Container>
  ) : (
    <></>
  );
};

export { Board };
