import * as React from 'react';
import { IoMdTrash } from 'react-icons/io';
import styled from 'styled-components';

import { CheckBox as CheckBoxModel } from '../models/kanban';
import { CheckBox } from './shared/CheckBox';
import { IconButton } from './shared/IconButton';
import { Title } from './shared/Title';

const Container = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 8px;
  &:hover {
    background-color: var(--selected-color);
  }
`;

type Props = {
  checkbox: CheckBoxModel;
  onChecked: (checked: boolean) => void;
  onEnter: (title: string) => void;
  onDelete: (checkbox: CheckBoxModel) => void;
};

export const Task = ({ checkbox, onChecked, onEnter, onDelete }: Props) => {
  const [showDeleteButton, setShowDeleteButton] = React.useState(false);

  return (
    <Container
      onMouseOver={() => {
        setShowDeleteButton(true);
      }}
      onMouseLeave={() => {
        setShowDeleteButton(false);
      }}>
      <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
        <CheckBox checked={checkbox.checked} onChange={onChecked} />
        <Title
          title={checkbox.title}
          fontSize="small"
          width="100%"
          onEnter={onEnter}
        />
      </div>
      {showDeleteButton && (
        <div style={{ marginTop: '4px', color: 'var(--text-color)' }}>
          <IconButton
            icon={<IoMdTrash />}
            onClick={() => {
              onDelete(checkbox);
            }}
          />
        </div>
      )}
    </Container>
  );
};
