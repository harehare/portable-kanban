import * as React from 'react';
import { styled } from 'styled-components';
import { selectors, actions } from '../../store';
import { MenuItem, type Props as MenuItemProperties } from './MenuItem';

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
  width: 232px;
  position: absolute;
  top: 24px;
  font-size: 1rem;
  border-radius: 8px;
  z-index: 100;
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

const Separator = styled.div`
  width: 100%;
  height: 1px;
  background-color: rgba(0, 0, 0, 0.1);
`;

type Properties = {
  id: string;
  position: 'left' | 'right';
  icon: React.ReactElement;
  items: Array<MenuItemProperties | 'separator'>;
};

export const Menu = ({ id, icon, position, items }: Properties) => {
  const menuId = selectors.useMenu();
  const setMenu = actions.useSetMenu();
  const closeMenu = actions.useMenuClose();

  return (
    <>
      <MenuIcon
        onClick={(e: React.MouseEvent<HTMLDivElement>) => {
          e.stopPropagation();
          setMenu(id);
        }}
      >
        {icon}
        {id === menuId && (
          <MenuItems position={position}>
            {items.map((index_, index) =>
              index_ === 'separator' ? (
                <Separator key={index} />
              ) : (
                <div
                  key={index_.text}
                  style={{
                    borderTopLeftRadius: index === 0 ? '8px' : '0',
                    borderTopRightRadius: index === 0 ? '8px' : '0',
                    borderBottomLeftRadius: items.length - 1 === index ? '8px' : '0',
                    borderBottomRightRadius: items.length - 1 === index ? '8px' : '0',
                  }}
                >
                  <MenuItem text={index_.text} icon={index_.icon} onClick={index_.onClick} />
                </div>
              )
            )}
          </MenuItems>
        )}
      </MenuIcon>
    </>
  );
};
