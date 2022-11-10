import * as React from 'react';
import { MdList } from 'react-icons/md';
import styled from 'styled-components';

import { List } from '../models/kanban';
import { selectors, actions } from '../store';
import { MenuItem } from './shared/MenuItem';

const Items = styled.div`
  box-shadow: var(--shadow-sm);
  background-color: var(--primary-background-color);
  border: 1px solid var(--primary-background-color);
  width: 192px;
  position: absolute;
  font-size: 1rem;
  border-radius: 8px;
  z-index: 100;
  top: 24px;
  right: -172px;
`;

type Props = {
  menuId: string;
  listId: string;
  lists: List[];
  onClick: (clickList: List) => void;
};

export const SelectList = ({ menuId, listId, lists, onClick }: Props) => {
  const currentMenuId = selectors.useMenu();
  const targetLists = React.useMemo(
    () => lists.filter((l) => l.id !== listId),
    [listId, lists]
  );

  return currentMenuId === menuId ? (
    <Items>
      {targetLists.map((l) => (
        <MenuItem
          onClick={() => {
            onClick(l);
          }}
          icon={<MdList />}
          text={l.title}
        />
      ))}
    </Items>
  ) : null;
};
