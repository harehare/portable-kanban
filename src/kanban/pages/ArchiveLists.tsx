'use memo';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { styled } from 'styled-components';
import { Card } from '../components/Card';
import { TextBaseBold } from '../components/shared/Text';
import { type List } from '../models/kanban';
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

type Properties = {
  lists: Array<Pick<List, 'title' | 'id'>>;
};

export const ArchiveLists = ({ lists }: Properties) => {
  const restoreList = kanbanActions.useRestoreList();
  const removeList = kanbanActions.useRemoveList();
  const navigate = useNavigate();

  return (
    <Overlay
      onClick={async () => {
        await navigate('/');
      }}
    >
      <ArchiveMenu>
        <div style={{ width: '100%', padding: '8px', textAlign: 'center' }}>
          <TextBaseBold>Archive Lists</TextBaseBold>
        </div>
        {lists.map((l) => (
          <ArchiveCard>
            <Card
              card={{
                ...l,
                listId: l.id,
                description: '',
                dueDate: undefined,
                labels: [],
                checkboxes: [],
                comments: [],
              }}
              isEdit={false}
              editable={false}
            />
            <Menus>
              <MenuItem
                onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                  e.stopPropagation();
                  restoreList({ ...l, cards: [] });
                }}
              >
                Restore
              </MenuItem>
              <MenuItem
                onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                  e.stopPropagation();
                  removeList(l.id);
                }}
              >
                Delete
              </MenuItem>
            </Menus>
          </ArchiveCard>
        ))}
      </ArchiveMenu>
    </Overlay>
  );
};
