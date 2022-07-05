import * as React from 'react';
import { MdCheck, MdEdit } from 'react-icons/md';
import styled from 'styled-components';

import { Card, Label, List } from '../../models/kanban';
import { selectors, kanbanActions } from '../../store';
import { IconButton } from '../shared/IconButton';
import { LabelEdit } from './Edit';

const Modal = styled.div`
  position: absolute;
  right: 0px;
  display: flex;
  flex-direction: column;
  width: 11rem;
  padding: 16px;
  background-color: var(--secondary-background-color);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-sm);
  z-index: 100;
`;

const Line = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const LabelItem = styled.div`
  width: 100%;
  max-width: 140px;
  font-size: 1rem;
  line-height: 1.5rem;
  color: var(--light-text-color);
  border-radius: var(--border-radius);
  margin-right: 4px;
  font-weight: 600;
  padding: 4px 8px;
  margin-bottom: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const AddLabel = styled.div`
  font-size: 1rem;
  line-height: 1.5rem;
  color: var(--text-color);
  background-color: var(--button-color);
  border-radius: var(--border-radius);
  margin-right: 4px;
  font-weight: 600;
  padding: 4px 8px;
  cursor: pointer;
  max-width: 140px;
`;

interface Props {
  list: List;
  card: Card;
}

export const LabelSelect: React.VFC<Props> = ({ list, card }) => {
  const kanban = selectors.useKanban();
  const addLabel = kanbanActions.useAddLabel();
  const updateLabel = kanbanActions.useUpdateLabel();
  const updateSettings = kanbanActions.useUpdateSettings();
  const deleteLabel = kanbanActions.useDeleteLabel();
  const [showEditLabel, setShowEditLabel] = React.useState<{
    label?: Label;
    show: boolean;
  }>({
    label: undefined,
    show: false,
  });
  const selectedLabelNames = React.useMemo(
    () => card.labels.map((l) => l.title),
    [card.labels]
  );
  const handleCreate = React.useCallback((label: Label) => {
    if (kanban.settings.labels.map((l) => l.title).includes(label.title)) {
      return;
    }

    addLabel(list, card, label);
    updateSettings({
      labels: [...kanban.settings.labels, label],
    });
    setShowEditLabel({ show: false });
  }, []);

  const handleEdit = React.useCallback((label: Label) => {
    updateLabel(list, card, label);
    updateSettings({
      labels: kanban.settings.labels.map((l) =>
        l.id === label.id ? label : l
      ),
    });
    setShowEditLabel({ show: false });
  }, []);

  const handleDelete = React.useCallback((label: Label) => {
    deleteLabel(list, card, label.id);
    updateSettings({
      labels: kanban.settings.labels.filter((l) => l.id !== label.id),
    });
    setShowEditLabel({ show: false });
  }, []);

  return (
    <>
      {showEditLabel.show ? (
        <LabelEdit
          label={showEditLabel.label}
          onEdit={showEditLabel.label ? handleEdit : handleCreate}
          onDelete={handleDelete}
        />
      ) : (
        <Modal>
          {kanban.settings.labels.map((l: Label) => (
            <Line key={l.id}>
              <LabelItem
                key={l.id}
                style={{ backgroundColor: l.color }}
                onClick={(e) => {
                  e.stopPropagation();
                  const isSelected = selectedLabelNames.includes(l.title);
                  if (isSelected) {
                    deleteLabel(list, card, l.id);
                  } else {
                    addLabel(list, card, l);
                  }
                }}>
                {l.title}
                {selectedLabelNames.includes(l.title) && (
                  <MdCheck style={{ fontSize: '1.1rem' }} />
                )}
              </LabelItem>
              <div
                style={{
                  marginBottom: '8px',
                  marginLeft: '8px',
                }}>
                <IconButton
                  icon={<MdEdit />}
                  onClick={() => {
                    setShowEditLabel({ show: true, label: l });
                  }}
                />
              </div>
            </Line>
          ))}
          <AddLabel
            style={{ width: '131px' }}
            onClick={(e) => {
              e.stopPropagation();
              setShowEditLabel({ show: true, label: undefined });
            }}>
            Add new label
          </AddLabel>
        </Modal>
      )}
    </>
  );
};
