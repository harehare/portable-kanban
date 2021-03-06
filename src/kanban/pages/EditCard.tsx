import * as React from 'react';
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from 'react-beautiful-dnd';
import {
  MdClose,
  MdComment,
  MdSubtitles,
  MdOutlineDescription,
  MdCheck,
  MdOutlineDeleteOutline,
  MdRestore,
} from 'react-icons/md';
import { MdContentCopy, MdOutlineArchive } from 'react-icons/md';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { vscode } from '../../vscode';
import { Comment } from '../components/Comment';
import { LabelList } from '../components/Label/List';
import { Task } from '../components/Task';
import { AddComment } from '../components/shared/AddComment';
import { AddItem } from '../components/shared/AddItem';
import { Button } from '../components/shared/Button';
import { DatePicker } from '../components/shared/DatePicker';
import { Description } from '../components/shared/Description';
import { ProgressBar } from '../components/shared/ProgressBar';
import { TextBaseBold } from '../components/shared/Text';
import { Title } from '../components/shared/Title';
import { Kanban as KanbanModel } from '../models/kanban';
import { selectors, actions, kanbanActions } from '../store';
import { uuid } from '../utils';

const Overlay = styled.div`
  width: 100%;
  height: 100vh;
  position: absolute;
  display: flex;
  flex-direction: column;
  background-color: rgba(0, 0, 0, 0.4);
  top: 0;
`;

const Container = styled.div`
  position: absolute;
  width: calc(100% - 16px);
  max-width: 748px;
  display: flex;
  flex-direction: column;
  background-color: var(--primary-background-color);
  border-radius: var(--border-radius);
  overflow-x: hidden;
  overflow-y: auto;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 100;
`;

const Line = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
  border-bottom: 1px solid var(--selected-color);
  padding: 16px;
`;

const Head = styled.div`
  display: flex;
  align-items: center;
  color: var(--text-color);
`;

const Icon = styled.div`
  margin-top: 4px;
  font-size: 1.05rem;
  padding: 10px 8px 8px 0;
`;

const CloseButton = styled.div`
  position: absolute;
  cursor: pointer;
  font-size: 1.4rem;
  top: 8px;
  right: 8px;
`;

const BUttons = styled.div`
  display: flex;
  justify-content: flex-end;
  cursor: pointer;
  gap: 16px;
  margin: 16px;
`;

interface Props {
  kanban?: KanbanModel;
}

const EditCard: React.VFC<Props> = ({ kanban }) => {
  const showModal = selectors.useShowModal();
  const setShowModal = actions.useSetShowModal();
  const navigate = useNavigate();

  const updateCard = kanbanActions.useUpdateCard();
  const updateCardDueDate = kanbanActions.useUpdateCardDueDate();
  const addCheckBox = kanbanActions.useAddCheckBox();
  const updateCheckBox = kanbanActions.useUpdateCheckBox();
  const deleteCheckBox = kanbanActions.useDeleteCheckBox();
  const moveCheckBox = kanbanActions.useMoveCheckBox();
  const addComments = kanbanActions.useAddComments();
  const updateComments = kanbanActions.useUpdateComments();
  const deleteComments = kanbanActions.useDeleteComments();
  const archiveCard = kanbanActions.useArchiveCard();
  const restoreCard = kanbanActions.useRestoreCard();
  const deleteCard = kanbanActions.useDeleteCard();
  const copyCard = kanbanActions.useCopyCard();

  const { listId, cardId } = useParams();
  const list = React.useMemo(
    () => kanban?.lists.filter((l) => l.id === listId)[0],
    [listId, kanban?.lists]
  );
  const card = React.useMemo(
    () => list?.cards.filter((c) => c.id === cardId)[0],
    [cardId, list?.cards]
  );

  const handlers = {
    CLOSE: () => navigate('/'),
    MOVE_PREV: () => {
      if (!list) {
        return;
      }

      const index = list.cards.findIndex((c) => c.id === cardId);
      const prev =
        list.cards[index - 1 <= 0 ? list.cards.length - 1 : index - 1];
      if (!prev) {
        return;
      }

      navigate(`/list/${list.id}/card/${prev.id}`);
    },
    MOVE_NEXT: () => {
      console.log(list);
      if (!list) {
        return;
      }

      const index = list.cards.findIndex((c) => c.id === cardId);
      const next =
        list.cards[index + 1 >= list.cards.length - 1 ? 0 : index + 1];
      if (!next) {
        return;
      }

      navigate(`/list/${list.id}/card/${next.id}`);
    },
  };

  const comments = React.useMemo(
    () => [...(card?.comments ?? [])].reverse(),
    [card]
  );
  const archivedCard = React.useMemo(
    () =>
      card ? null : kanban?.archive.cards.filter((c) => c.id === cardId)[0],
    [cardId, list?.cards]
  );
  const [isArchived, setArchived] = React.useState(!!archivedCard);
  const taskList = React.useMemo(
    () =>
      card?.checkboxes.map((c, index) => (
        <Draggable key={c.id} draggableId={c.id} index={index}>
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}>
              <Task
                key={c.id}
                checkbox={c}
                onEnter={(title) => {
                  if (!kanban || !list || !card) {
                    return;
                  }
                  updateCheckBox(list, card, {
                    ...c,
                    title,
                  });
                }}
                onChecked={(checked) => {
                  if (!kanban || !list || !card) {
                    return;
                  }
                  updateCheckBox(list, card, {
                    ...c,
                    checked,
                  });
                }}
                onDelete={(checkbox) => {
                  if (!kanban || !list || !card) {
                    return;
                  }
                  deleteCheckBox(list, card, checkbox.id);
                }}
              />
            </div>
          )}
        </Draggable>
      )),
    [card?.checkboxes]
  );

  const onDragEnd = React.useCallback(
    (result: DropResult) => {
      if (!result.destination || !kanban || !list || !card) {
        return;
      }

      switch (result.type) {
        case 'tasks':
          moveCheckBox(
            list.id,
            card.id,
            result.source.index,
            result.destination.index
          );
          break;
      }
    },
    [kanban]
  );

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Overlay
        onClick={() => {
          if (showModal) {
            setShowModal(false);
            return;
          }

          navigate('/');
        }}>
        <Container
          onClick={(e) => {
            if (showModal) {
              setShowModal(false);
              return;
            }
            e.stopPropagation();
          }}>
          <CloseButton
            onClick={() => {
              navigate('/');
            }}>
            <MdClose />
          </CloseButton>
          {isArchived && (
            <Line>
              <Head>
                <Icon>
                  <MdOutlineArchive />
                </Icon>
                This card has been archived.
              </Head>
            </Line>
          )}
          <Line>
            <Head>
              <Icon>
                <MdSubtitles />
              </Icon>
              <Title
                title={card?.title ?? ''}
                fontSize={'large'}
                width={'100%'}
                onEnter={(title) => {
                  if (!kanban || !list || !card) {
                    return;
                  }
                  updateCard(list, {
                    ...card,
                    title,
                  });
                }}
              />
            </Head>
          </Line>
          <Line>
            <Head>
              <Icon>
                <MdOutlineDescription />
              </Icon>
              <TextBaseBold>Description</TextBaseBold>
            </Head>
            <Description
              description={card?.description ?? ''}
              fontSize="medium"
              onEnter={(description) => {
                if (!kanban || !list || !card) {
                  return;
                }
                updateCard(list, {
                  ...card,
                  description,
                });
              }}
            />
          </Line>
          {kanban && list && card ? (
            <Line>
              <LabelList list={list} card={card} />
            </Line>
          ) : (
            <></>
          )}
          <Line>
            <Head>
              <Icon>
                <MdOutlineDescription />
              </Icon>
              <TextBaseBold>Due Date</TextBaseBold>
            </Head>
            <DatePicker
              value={card?.dueDate ? card.dueDate : undefined}
              onChange={(date) => {
                if (!kanban || !list || !card) {
                  return;
                }
                updateCardDueDate(list, card, date);
              }}
            />
          </Line>
          <Line>
            <Head>
              <Icon>
                <MdCheck />
              </Icon>
              <TextBaseBold>Task List</TextBaseBold>
            </Head>
            <div style={{ margin: '8px -16px 8px -16px' }}>
              <ProgressBar
                progress={
                  ((card?.checkboxes.filter((c) => c.checked).length ?? 0.0) /
                    (card?.checkboxes.length ?? 1.0)) *
                  100
                }
              />
            </div>
            <Droppable droppableId={card?.id || ''} type="tasks">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  style={{ width: 'calc(100% - 16px)' }}>
                  <div>
                    {taskList} {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
            <div style={{ margin: '0 12px' }}>
              <AddItem
                addText="Add item"
                placeholder="Add item"
                type="primary"
                onEnter={(text) => {
                  if (!kanban || !list || !card) {
                    return;
                  }
                  addCheckBox(list, card, {
                    id: uuid(),
                    title: text,
                    checked: false,
                  });
                }}
              />
            </div>
          </Line>
          <Line>
            <Head>
              <Icon>
                <MdComment />
              </Icon>
              <TextBaseBold>Comments</TextBaseBold>
            </Head>
            <AddComment
              addText="Save"
              placeholder="Enter a comment"
              type="primary"
              onEnter={(comment) => {
                if (!kanban || !list || !card) {
                  return;
                }
                addComments(list, card, {
                  id: uuid(),
                  comment,
                });
              }}
            />
            {comments.map((c) => (
              <Comment
                key={c.id}
                comment={c}
                onEnter={(text) => {
                  if (!kanban || !list || !card) {
                    return;
                  }
                  updateComments(list, card, {
                    ...c,
                    comment: text,
                  });
                }}
                onDelete={(comment) => {
                  if (!kanban || !list || !card) {
                    return;
                  }
                  deleteComments(list, card, comment.id);
                }}
              />
            ))}
          </Line>
          <BUttons>
            <Button
              text="Copy"
              icon={<MdContentCopy />}
              disabled={false}
              onClick={() => {
                if (!kanban || !list || !card) {
                  return;
                }
                copyCard(card);
              }}
            />
            {!isArchived && (
              <Button
                text="Archive"
                icon={<MdOutlineArchive />}
                disabled={false}
                onClick={() => {
                  if (!kanban || !list || !card) {
                    return;
                  }
                  archiveCard(list, card);
                  setArchived(true);
                }}
              />
            )}
            {isArchived && (
              <Button
                text="Restore"
                icon={<MdRestore />}
                disabled={false}
                onClick={() => {
                  if (!kanban || !list || !archivedCard) {
                    return;
                  }
                  restoreCard(archivedCard);
                  setArchived(false);
                }}
              />
            )}
            {isArchived && (
              <Button
                text="Delete"
                icon={<MdOutlineDeleteOutline />}
                type="danger"
                disabled={false}
                onClick={() => {
                  if (!kanban || !list || !archivedCard) {
                    return;
                  }
                  deleteCard(archivedCard);
                  vscode.postMessage({
                    type: 'info-message',
                    message: `Delete ${archivedCard.title}`,
                  });
                  navigate('/');
                }}
              />
            )}
          </BUttons>
        </Container>
      </Overlay>
    </DragDropContext>
  );
};

export { EditCard };
