import * as React from 'react';
import { MdAdd } from 'react-icons/md';
import styled from 'styled-components';

import { Card, List, Settings } from '../../models/kanban';
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

type Props = {
  list: List;
  card: Card;
};

export const LabelList = ({ list, card }: Props) => {
  const showModal = selectors.useShowModal();
  const setShowModal = actions.useSetShowModal();

  return (
    <Labels>
      {card.labels.map((l) => (
        <LabelItem
          key={l.id}
          style={{ backgroundColor: l.color, cursor: 'pointer' }}
          onClick={(e) => {
            e.stopPropagation();
            setShowModal(true);
          }}>
          {l.title}
        </LabelItem>
      ))}
      <AddButton
        onClick={(e) => {
          e.stopPropagation();
          setShowModal(true);
        }}>
        <MdAdd />
      </AddButton>
      {showModal && <LabelSelect list={list} card={card} />}
    </Labels>
  );
};
