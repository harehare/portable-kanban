import { closestCenter, DndContext, type DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import * as React from 'react';
import {
  MdCheck,
  MdClose,
  MdComment,
  MdContentCopy,
  MdOutlineArchive,
  MdOutlineDeleteOutline,
  MdOutlineDescription,
  MdRestore,
  MdSubtitles,
} from 'react-icons/md';
import { useNavigate, useParams } from 'react-router-dom';
import { styled } from 'styled-components';
import { getBackend } from '../backend';
import { Comment } from '../components/Comment';
import { LabelList } from '../components/Label/List';
import { AddComment } from '../components/shared/AddComment';
import { AddItem } from '../components/shared/AddItem';
import { Button } from '../components/shared/Button';
import { DatePicker } from '../components/shared/DatePicker';
import { Description } from '../components/shared/Description';
import { ProgressBar } from '../components/shared/ProgressBar';
import { TextBaseBold } from '../components/shared/Text';
import { Title } from '../components/shared/Title';
import { Task } from '../components/Task';
import { type CheckBox as CheckBoxModel, type Comment as CommentModel } from '@portable-kanban/core';
import { actions, kanbanActions, selectors } from '../store';
import { uuid } from '@portable-kanban/core';

declare global {
  interface Window {
    settings: {
      showDescription: boolean;
      showTaskList: boolean;
    };
  }
}

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
  max-height: calc(100vh - 32px);
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

type SortableTaskItemProps = {
  id: string;
  checkbox: CheckBoxModel;
  onChecked: (checked: boolean) => void;
  onEnter: (title: string) => void;
  onDelete: (checkbox: CheckBoxModel) => void;
};

const SortableTaskItem = ({ id, checkbox, onChecked, onEnter, onDelete }: SortableTaskItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Task checkbox={checkbox} onChecked={onChecked} onEnter={onEnter} onDelete={onDelete} />
    </div>
  );
};

const EditCard = () => {
  const showModal = selectors.useShowModal();
  const archiveCards = selectors.useArchiveCards();
  const lists = selectors.useLists();
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
  const list = React.useMemo(() => lists.find((l) => l.id === listId), [listId, lists]);
  const card = React.useMemo(() => list?.cards.find((c) => c.id === cardId), [cardId, list?.cards]);

  const comments = React.useMemo(() => [...(card?.comments ?? [])].reverse(), [card]);
  const archivedCard = React.useMemo(
    () => (card ? null : archiveCards.find((c) => c.id === cardId)),
    [cardId, list?.cards],
  );
  const [isArchived, setArchived] = React.useState(Boolean(archivedCard));

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const checkboxIds = React.useMemo(() => card?.checkboxes.map((c) => c.id) ?? [], [card?.checkboxes]);

  const taskList = React.useMemo(
    () =>
      card?.checkboxes.map((c) => (
        <SortableTaskItem
          key={c.id}
          id={c.id}
          checkbox={c}
          onEnter={(title) => {
            if (!list || !card) return;
            if (title.trim() === '') {
              deleteCheckBox(list, card, c.id);
              return;
            }

            updateCheckBox(list, card, { ...c, title });
          }}
          onChecked={(checked) => {
            if (!list || !card) return;
            updateCheckBox(list, card, { ...c, checked });
          }}
          onDelete={(checkbox) => {
            if (!list || !card) return;
            deleteCheckBox(list, card, checkbox.id);
          }}
        />
      )),
    [card?.checkboxes, list, card, deleteCheckBox, updateCheckBox],
  );

  const onDragEnd = React.useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || !list || !card || active.id === over.id) return;

      const fromIndex = card.checkboxes.findIndex((c) => c.id === active.id);
      const toIndex = card.checkboxes.findIndex((c) => c.id === over.id);
      if (fromIndex >= 0 && toIndex >= 0) {
        moveCheckBox(list.id, card.id, fromIndex, toIndex);
      }
    },
    [list, card, moveCheckBox],
  );

  const handleEditDescription = React.useCallback(
    (description: string) => {
      if (!list || !card) {
        return;
      }

      updateCard(list, {
        ...card,
        description,
      });
    },
    [list, card],
  );

  const handleEditDate = React.useCallback(
    (date?: Date) => {
      if (!list || !card) {
        return;
      }

      updateCardDueDate(list, card, date);
    },
    [list, card],
  );

  const handleAddTask = React.useCallback(
    (text: string) => {
      if (!list || !card) {
        return;
      }

      addCheckBox(list, card, {
        id: uuid(),
        title: text,
        checked: false,
      });
    },
    [list, card],
  );

  const handleAddComment = React.useCallback(
    (comment: string) => {
      if (!list || !card) {
        return;
      }

      addComments(list, card, {
        id: uuid(),
        comment,
      });
    },
    [list, card],
  );

  const handleEditComment = React.useCallback(
    (c: CommentModel) => (text: string) => {
      if (!list || !card) {
        return;
      }

      updateComments(list, card, {
        ...c,
        comment: text,
      });
    },
    [list, card],
  );

  const handleDeleteComment = React.useCallback(
    (comment: CommentModel) => {
      if (!list || !card) {
        return;
      }

      deleteComments(list, card, comment.id);
    },
    [list, card],
  );

  const handleCopyCard = React.useCallback(() => {
    if (!list || !card) {
      return;
    }

    copyCard(card);
  }, [list, card]);

  const handleArchiveCard = React.useCallback(() => {
    if (!list || !card) {
      return;
    }

    archiveCard(list, card);
    setArchived(true);
  }, [list, card]);

  const handleRestoreCard = React.useCallback(() => {
    if (!list || !archivedCard) {
      return;
    }

    restoreCard(archivedCard);
    setArchived(false);
  }, [list, card]);

  const handleDeleteCard = React.useCallback(() => {
    if (!list || !archivedCard) {
      return;
    }

    deleteCard(archivedCard);
    navigate('/');

    getBackend().showInfoMessage(`Delete ${archivedCard.title}`);
  }, [list, card]);

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <Overlay
        onClick={(e: React.MouseEvent<HTMLDivElement>) => {
          if (showModal) {
            setShowModal(false);
            return;
          }

          // Ensure click is on the overlay itself, not a child element
          if (e.target === e.currentTarget) {
            if (list && card) {
              updateCard(list, card);
            }

            navigate('/');
          }
        }}
      >
        <Container
          onClick={(e: React.MouseEvent<HTMLDivElement>) => {
            if (showModal) {
              setShowModal(false);
              return;
            }

            e.stopPropagation();
          }}
        >
          <CloseButton
            onClick={() => {
              navigate('/');
            }}
          >
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
                  if (!list || !card) {
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
          {((globalThis as any).settings?.showDescription ?? true) && (
            <Line>
              <Head>
                <Icon>
                  <MdOutlineDescription />
                </Icon>
                <TextBaseBold>Description</TextBaseBold>
              </Head>
              <Description description={card?.description ?? ''} fontSize="medium" onEnter={handleEditDescription} />
            </Line>
          )}
          {list && card ? (
            <Line>
              <LabelList list={list} card={card} />
            </Line>
          ) : (
            <></>
          )}
          <Line
            onClick={(e: React.MouseEvent<HTMLDivElement>) => {
              e.stopPropagation();
            }}
          >
            <Head>
              <Icon>
                <MdOutlineDescription />
              </Icon>
              <TextBaseBold>Due Date</TextBaseBold>
            </Head>
            <DatePicker value={card?.dueDate} onChange={handleEditDate} />
          </Line>
          {((globalThis as any).settings?.showTaskList ?? true) && (
            <Line>
              <Head>
                <Icon>
                  <MdCheck />
                </Icon>
                <TextBaseBold>Task List</TextBaseBold>
              </Head>
              <div style={{ margin: '8px -16px 8px -16px' }}>
                {card && card.checkboxes.length > 0 && (
                  <ProgressBar
                    progress={
                      ((card.checkboxes.filter((c) => c.checked).length ?? 0) / (card.checkboxes.length ?? 1)) * 100
                    }
                  />
                )}
              </div>
              <SortableContext items={checkboxIds} strategy={verticalListSortingStrategy}>
                <div style={{ width: 'calc(100% - 16px)' }}>{taskList}</div>
              </SortableContext>
              <div style={{ margin: '0 12px' }}>
                <AddItem
                  enableContinuousInput
                  addText="Add item"
                  placeholder="Add item"
                  type="primary"
                  onEnter={handleAddTask}
                />
              </div>
            </Line>
          )}
          <Line>
            <Head>
              <Icon>
                <MdComment />
              </Icon>
              <TextBaseBold>Comments</TextBaseBold>
            </Head>
            <AddComment addText="Save" placeholder="Enter a comment" type="primary" onEnter={handleAddComment} />
            {comments.map((c) => (
              <Comment key={c.id} comment={c} onEnter={handleEditComment(c)} onDelete={handleDeleteComment} />
            ))}
          </Line>
          <BUttons>
            <Button text="Copy" icon={<MdContentCopy />} disabled={false} onClick={handleCopyCard} />
            {!isArchived && (
              <Button text="Archive" icon={<MdOutlineArchive />} disabled={false} onClick={handleArchiveCard} />
            )}
            {isArchived && <Button text="Restore" icon={<MdRestore />} disabled={false} onClick={handleRestoreCard} />}
            {isArchived && (
              <Button
                text="Delete"
                icon={<MdOutlineDeleteOutline />}
                type="danger"
                disabled={false}
                onClick={handleDeleteCard}
              />
            )}
          </BUttons>
        </Container>
      </Overlay>
    </DndContext>
  );
};

export { EditCard };
