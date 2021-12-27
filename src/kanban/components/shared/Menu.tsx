import * as React from 'react';
import styled from 'styled-components';

import { selectors, actions } from '../../store';

const MenuIcon = styled.div`
  font-size: 1.1rem;
  cursor: pointer;
  position: relative;
  color: var(--text-color);
`;

const MenuItems = styled.div<{
  position: 'left' | 'right';
}>`
  box-shadow: var(--shadow-sm);
  background-color: var(--primary-background-color);
  width: 192px;
  position: absolute;
  top: 24px;
  font-size: 1rem;
  border-radius: 8px;
  ${({ position }) =>
    position === 'right' &&
    `
      left: 0;
  `}
  ${({ position }) =>
    position === 'left' &&
    `
      right: 0;
  `}
`;

const MenuItem = styled.div`
  display: flex;
  align-items: center;
  color: var(--text-color);
  background-color: var(--primary-background-color);
  padding: 8px;
  :hover {
    background-color: rgba(0, 0, 0, 0.1);
  }
`;

const Separator = styled.div`
  width: 100%;
  height: 1px;
  background-color: rgba(0, 0, 0, 0.1);
`;

interface MenuItem {
  icon?: React.ReactElement;
  text: string;
  onClick: () => void;
}

interface Props {
  id: string;
  position: 'left' | 'right';
  icon: React.ReactElement;
  items: (MenuItem | 'separator')[];
}

export const Menu: React.VFC<Props> = ({ id, icon, position, items }) => {
  const menuId = selectors.useMenu();
  const setMenu = actions.useSetMenu();
  const closeMenu = actions.useMenuClose();

  return (
    <>
      <MenuIcon
        onClick={(e) => {
          e.stopPropagation();
          setMenu(id);
        }}>
        {icon}
        {id === menuId && (
          <MenuItems position={position}>
            {items.map((i, index) =>
              i === 'separator' ? (
                <Separator key={index} />
              ) : (
                <MenuItem
                  key={i.text}
                  style={{
                    borderTopLeftRadius: index === 0 ? '8px' : '0',
                    borderTopRightRadius: index === 0 ? '8px' : '0',
                    borderBottomLeftRadius:
                      items.length - 1 === index ? '8px' : '0',
                    borderBottomRightRadius:
                      items.length - 1 === index ? '8px' : '0',
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    i.onClick();
                    closeMenu();
                  }}>
                  <div
                    style={{
                      fontSize: '1.2rem',
                      marginTop: '2px',
                      marginRight: '8px',
                    }}>
                    {i.icon}
                  </div>
                  <div>{i.text}</div>
                </MenuItem>
              )
            )}
          </MenuItems>
        )}
      </MenuIcon>
    </>
  );
};
