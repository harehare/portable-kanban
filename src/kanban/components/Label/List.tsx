import * as React from 'react';
import { MdAdd } from 'react-icons/md';
import { styled } from 'styled-components';
import { type Card, type List } from '../../models/kanban';
import { selectors, actions } from '../../store';
import { LabelSelect } from './Select';

const Labels = styled.div`
  display: flex;
  gap: 4px;
  position: relative;
`;

const LabelItem = styled.div`
  font-size: 1rem;
  line-height: 1.5rem;
  color: var(--light-text-color);
  border-radius: var(--border-radius);
  margin-right: 4px;
  font-weight: 600;
  padding: 4px;
  height: 24px;
`;

const AddButton = styled.div`
  padding: 4px 8px;
  font-size: 1.1rem;
  border-radius: var(--border-radius);
  border: 1px solid var(--form-border-color);
  background-color: var(--button-color);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  height: 24px;
`;

type Properties = {
  list: List;
  card: Card;
};

export const LabelList = ({ list, card }: Properties) => {
  const showModal = selectors.useShowModal();
  const setShowModal = actions.useSetShowModal();
  const sortedLabels = React.useMemo(
    () => [...card.labels].sort((a, b) => a.title.localeCompare(b.title)),
    [card.labels]
  );

  return (
    <Labels>
      {sortedLabels.map((l) => (
        <LabelItem
          key={l.id}
          style={{ backgroundColor: l.color, cursor: 'pointer' }}
          onClick={(e: React.MouseEvent<HTMLDivElement>) => {
            e.stopPropagation();
            setShowModal(true);
          }}
        >
          {l.title}
        </LabelItem>
      ))}
      <AddButton
        onClick={(e: React.MouseEvent<HTMLDivElement>) => {
          e.stopPropagation();
          setShowModal(true);
        }}
      >
        <MdAdd />
      </AddButton>
      {showModal && <LabelSelect list={list} card={card} />}
    </Labels>
  );
};
