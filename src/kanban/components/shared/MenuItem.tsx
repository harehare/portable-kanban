import * as React from 'react';
import styled from 'styled-components';

import { actions } from '../../store';

const Item = styled.div`
  display: flex;
  align-items: center;
  color: var(--text-color);
  background-color: var(--primary-background-color);
  padding: 8px;
  &:hover {
    background-color: rgba(0, 0, 0, 0.1);
  }
`;

export type Props = {
  icon?: React.ReactElement;
  text: string;
  onClick: () => void;
};

export const MenuItem = ({ onClick, text, icon }: Props) => {
  const closeMenu = actions.useMenuClose();
  const handleClick = (e: React.SyntheticEvent) => {
    e.stopPropagation();
    closeMenu();
    onClick();
  };

  return (
    <Item onClick={handleClick}>
      <div
        style={{
          fontSize: '1.2rem',
          marginTop: '2px',
          marginRight: '8px',
        }}>
        {icon}
      </div>
      <div>{text}</div>
    </Item>
  );
};
