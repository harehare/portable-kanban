import * as React from 'react';
import { MdAdd } from 'react-icons/md';
import styled from 'styled-components';

import { AddButton } from './AddButton';
import { Input } from './Form';

const AddItemLabel = styled.div`
  display: flex;
  align-items: center;
  width: var(--list-width);
  height: 40px;
  border-radius: var(--border-radius);
  background-color: var(--primary-background-color);
  cursor: pointer;
  box-sizing: border-box;
`;

const AddItemForm = styled.div`
  width: var(--list-width);
  padding: 8px;
  height: 88px;
  background-color: var(--primary-background-color);
  border-radius: var(--border-radius);
`;

const Label = styled.div`
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: var(--text-color);
`;

const Icon = styled.div`
  color: var(--text-color);
  font-size: 1.3rem;
  margin: 4px 4px 0 0;
`;

type Props = {
  enableContinuousInput?: boolean;
  addText: string;
  placeholder: string;
  type: 'primary' | 'secondary' | 'danger';
  onEnter: (text: string) => void;
};

export const AddItem = ({
  enableContinuousInput = false,
  addText,
  placeholder,
  type,
  onEnter,
}: Props) => {
  const [isAddItem, setIsAddItem] = React.useState(false);
  const [name, setName] = React.useState('');
  const [isComposing, setIsComposing] = React.useState(false);
  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        setIsAddItem(false);
        return;
      }

      if (e.key !== 'Enter' || isComposing) {
        return;
      }

      onEnter(name);
      setName('');
      setIsAddItem(enableContinuousInput);
    },
    [name, isComposing]
  );

  return isAddItem ? (
    <AddItemForm>
      <Input
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setName(e.target.value);
        }}
        placeholder={placeholder}
        style={{
          width: 'calc(100% - 16px)',
          marginTop: '0',
          marginBottom: '16px',
        }}
        onCompositionStart={() => {
          setIsComposing(true);
        }}
        onCompositionEnd={() => {
          setIsComposing(false);
        }}
        value={name}
        autoFocus={true}
        onKeyDown={handleKeyDown}
      />
      <AddButton
        text={addText}
        type={type}
        canClose={true}
        disabled={false}
        onAddClick={() => {
          onEnter(name);
          setIsAddItem(false);
          setName('');
        }}
        onCancel={() => {
          setIsAddItem(false);
          setName('');
        }}
      />
    </AddItemForm>
  ) : (
    <AddItemLabel
      onClick={() => {
        setIsAddItem(true);
      }}>
      <Icon>
        <MdAdd />
      </Icon>
      <Label>{addText}</Label>
    </AddItemLabel>
  );
};
