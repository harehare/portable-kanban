import * as React from 'react';
import { MdCheck } from 'react-icons/md';
import styled from 'styled-components';

import { Color, colors, Label } from '../../models/kanban';
import { uuid } from '../../utils';
import { Button } from '../shared/Button';
import { Input } from '../shared/Input';
import { TextSm } from '../shared/Text';

const Modal = styled.div`
  display: flex;
  flex-direction: column;
  width: 11rem;
  padding: 16px;
  background-color: var(--secondary-background-color);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-sm);
  position: absolute;
  right: 0;
`;

const Title = styled.div`
  color: var(--text-color);
`;

const Line = styled.div`
  padding-bottom: 8px;
`;

const Buttons = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Labels = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
`;

const LabelItem = styled.div`
  border-radius: var(--border-radius);
  margin-right: 4px;
  padding: 4px 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 16px;
`;

type Props = {
  label?: Label;
  onEdit: (label: Label) => void;
  onDelete?: (label: Label) => void;
};

export const LabelEdit = ({ label, onEdit, onDelete }: Props) => {
  const [selectedColor, setSelectedColor] = React.useState(
    label ? label.color : ('#ff9f1a' as Color)
  );
  const [labelText, setLabelText] = React.useState(label ? label.title : '');

  return (
    <Modal
      onClick={(e) => {
        e.stopPropagation();
      }}>
      <Line>
        <Title>
          <TextSm>Label name</TextSm>
        </Title>
        <Input
          style={{
            marginLeft: '-3px',
            width: 'calc(100% - 24px)',
            boxShadow: 'var(--shadow-sm)',
            borderBottom: '1px solid var(--form-border-color)',
          }}
          value={labelText}
          onChange={(e) => {
            setLabelText(e.target.value);
          }}
        />
      </Line>
      <Line>
        <Title>
          <TextSm>Select a color</TextSm>
        </Title>
        <Labels>
          {colors.map((c) => (
            <LabelItem
              key={c}
              style={{ backgroundColor: c }}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedColor(c);
              }}>
              {c === selectedColor ? (
                <MdCheck style={{ fontSize: '1.1rem', fontWeight: 600 }} />
              ) : (
                <></>
              )}
            </LabelItem>
          ))}
        </Labels>
      </Line>
      <Line>
        <Buttons>
          <Button
            text={label ? 'Edit' : 'Create'}
            type="primary"
            disabled={false}
            onClick={() => {
              onEdit(
                label
                  ? { ...label, title: labelText, color: selectedColor }
                  : {
                      id: uuid(),
                      title: labelText,
                      color: selectedColor,
                    }
              );
            }}
          />
          {label && (
            <Button
              type="danger"
              text="Delete"
              disabled={false}
              onClick={() => {
                if (!onDelete) {
                  return;
                }
                onDelete(label);
              }}
            />
          )}
        </Buttons>
      </Line>
    </Modal>
  );
};
