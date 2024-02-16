import { format } from 'date-fns/format';
import { sub } from 'date-fns/sub';
import * as React from 'react';
import { FaRegComment } from 'react-icons/fa';
import { MdDateRange } from 'react-icons/md';
import { RiTaskLine } from 'react-icons/ri';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';

import { useAutoFocus } from '../hooks/useAutoFocus';
import { Card as CardModel } from '../models/kanban';
import { actions } from '../store';
import { TextXs } from './shared/Text';

const Container = styled.div`
  min-height: 20px;
  padding: 8px;
  margin-bottom: 8px;
  border-radius: var(--border-radius);
  background-color: var(--secondary-background-color);
  cursor: pointer;
  box-sizing: content-box;
  box-shadow: var(--shadow-sm);
  &:hover {
    background-color: var(--hover-color);
  }
`;

const Input = styled.textarea.attrs({
  autoFocus: true,
})`
  font-family: var(--font-family);
  min-height: 56px;
  overflow: hidden;
  resize: none;
  border: none;
  outline: none;
  background-color: transparent;
  color: var(--text-color);
  font-size: 1rem;
  line-height: 1.5rem;
  margin: 0px;
  padding: 0px;
  &:focus {
    outline: none;
  }
`;

const Title = styled.div`
  width: 100%;
  color: var(--text-color);
  font-size: 1rem;
  line-height: 1.5rem;
  word-break: break-all;
`;

const Labels = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  flex-wrap: wrap;
  gap: 4px;
`;

const CardInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 8px;
  margin-left: 8px;
  color: var(--primary-color);
`;

const CardInfoIcon = styled.div`
  margin-right: 2px;
`;

const Label = styled.div`
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: var(--light-text-color);
  border-radius: var(--border-radius);
  margin-right: 2px;
  font-weight: 600;
  padding: 0 8px;
`;

type Props = {
  card: CardModel;
  isEdit?: boolean;
  editable?: boolean;
  onEnter?: (card: CardModel) => void;
};

export const Card = ({
  card,
  onEnter,
  editable = true,
  isEdit = false,
}: Props) => {
  const location = useLocation();
  const setAddCard = actions.useSetAddingCard();
  const [isComposing, setIsComposing] = React.useState(false);
  const [state, setState] = React.useState<{
    card: CardModel;
    isEdit: boolean;
  }>({ card, isEdit });
  const checkedCount = React.useMemo(
    () => state.card.checkboxes.filter((c) => c.checked).length,
    [state.card, isComposing],
  );

  React.useEffect(() => {
    setState({ card, isEdit });
  }, [card, isEdit]);
  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key !== 'Enter' || isComposing || e.shiftKey) {
        return;
      }

      if (!state.card.title) {
        return;
      }

      if (onEnter) {
        onEnter(state.card);
      }
      setState({ ...state, isEdit: false });
    },
    [state.card, isComposing],
  );
  const inputRef = useAutoFocus();

  const isOneDayLeft = React.useMemo(
    () =>
      state.card.dueDate
        ? format(Date.now(), 'yyyy-MM-dd') ===
          format(
            sub(state.card.dueDate, {
              days: 1,
            }),
            'yyyy-MM-dd',
          )
        : false,
    [state.card.dueDate],
  );

  console.log(
    format(
      sub(state.card.dueDate ?? Date.now(), {
        days: 1,
      }),
      'yyyy-MM-dd',
    ),
  );

  const isDueDate = React.useMemo(
    () =>
      state.card.dueDate
        ? format(state.card.dueDate, 'yyyy-MM-dd') ===
          format(Date.now(), 'yyyy-MM-dd')
        : false,
    [state.card.dueDate],
  );

  const dueDateColor = React.useMemo(
    () =>
      isDueDate ? '#FF4500' : isOneDayLeft ? '#FF7F50' : 'var(--primary-color)',
    [isDueDate, isOneDayLeft],
  );

  return (
    <Container>
      {!editable ? (
        <>
          {state.card.labels.length > 0 && (
            <Labels>
              {state.card.labels.map((l) => (
                <Label key={l.id} style={{ backgroundColor: l.color }}>
                  {l.title}
                </Label>
              ))}
            </Labels>
          )}
          <Title>{state.card.title}</Title>
        </>
      ) : state.isEdit ? (
        <Input
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
            const card = { ...state.card, title: e.target.value };
            setState({
              ...state,
              card,
            });
            setAddCard(card);
          }}
          value={state.card.title}
          onCompositionStart={() => {
            setIsComposing(true);
          }}
          onCompositionEnd={() => {
            setIsComposing(false);
          }}
          onKeyDown={handleKeyDown}
          placeholder={'Enter title of card'}
          ref={inputRef}
        />
      ) : (
        <Link
          key={card.id}
          to={{
            pathname: `/list/${state.card.listId}/card/${state.card.id}`,
          }}
          state={{ backgroundLocation: location }}>
          {state.card.labels.length > 0 && (
            <Labels>
              {state.card.labels.map((l) => (
                <Label key={l.id} style={{ backgroundColor: l.color }}>
                  {l.title}
                </Label>
              ))}
            </Labels>
          )}
          <Title>{state.card.title}</Title>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
            }}>
            {state.card.dueDate && (
              <CardInfo>
                <CardInfoIcon style={{ color: dueDateColor }}>
                  <MdDateRange />
                </CardInfoIcon>
                <div
                  style={{
                    marginBottom: '2px',
                    color: dueDateColor,
                  }}>
                  <TextXs>
                    {typeof state.card.dueDate === 'string'
                      ? state.card.dueDate
                      : state.card.dueDate.toDateString()}
                  </TextXs>
                </div>
              </CardInfo>
            )}
            {state.card.checkboxes.length > 0 && (
              <CardInfo>
                <CardInfoIcon>
                  <RiTaskLine />
                </CardInfoIcon>
                <div style={{ marginBottom: '2px' }}>
                  <TextXs>
                    {checkedCount}/{state.card.checkboxes.length}
                  </TextXs>
                </div>
              </CardInfo>
            )}
            {state.card.comments.length > 0 && (
              <CardInfo>
                <CardInfoIcon>
                  <FaRegComment />
                </CardInfoIcon>
                <div style={{ marginBottom: '2px' }}>
                  <TextXs>{state.card.comments.length}</TextXs>
                </div>
              </CardInfo>
            )}
          </div>
        </Link>
      )}
    </Container>
  );
};
