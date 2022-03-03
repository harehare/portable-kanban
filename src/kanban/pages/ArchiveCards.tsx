import * as React from 'react';
import { useHistory } from 'react-router';
import styled from 'styled-components';

import { Card } from '../components/Card';
import { TextBaseBold } from '../components/shared/Text';
import { Card as CardModel } from '../models/kanban';
import { kanbanActions } from '../store';

const Overlay = styled.div`
  width: 100%;
  height: 100vh;
  position: absolute;
  display: flex;
  flex-direction: column;
  background-color: rgba(0, 0, 0, 0.1);
  top: 0;
`;

const ArchiveMenu = styled.div`
  position: absolute;
  right: 0;
  top: var(--header-height);
  color: var(--text-color);
  background-color: var(--primary-background-color);
  width: var(--list-width);
  height: calc(100vh - var(--header-height));
  padding: 16px;
  overflow-y: scroll;
`;

const ArchiveCard = styled.div``;
const Menus = styled.div`
  display: flex;
`;
const MenuItem = styled.div`
  color: var(--dark-text-color);
  padding-left: 8px;
  padding-bottom: 16px;
  cursor: pointer;
`;

interface Props {
  cards: CardModel[];
}

export const ArchiveCards: React.VFC<Props> = ({ cards }) => {
  const restoreCard = kanbanActions.useRestoreCard();
  const deleteCard = kanbanActions.useDeleteCard();
  const history = useHistory();

  return (
    <Overlay
      onClick={() => {
        history.push('/');
      }}>
      <ArchiveMenu>
        <div style={{ width: '100%', padding: '8px', textAlign: 'center' }}>
          <TextBaseBold>Archive Cards</TextBaseBold>
        </div>
        {cards.map((c) => (
          <ArchiveCard>
            <Card card={c} isEdit={false} editable={false} />
            <Menus>
              <MenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  restoreCard(c);
                }}>
                Restore
              </MenuItem>
              <MenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  deleteCard(c);
                }}>
                Delete
              </MenuItem>
            </Menus>
          </ArchiveCard>
        ))}
      </ArchiveMenu>
    </Overlay>
  );
};
