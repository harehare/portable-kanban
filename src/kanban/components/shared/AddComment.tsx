import CodeEditor from '@uiw/react-textarea-code-editor';
import * as React from 'react';
import styled from 'styled-components';

import { AddButton } from './AddButton';

const AddItemForm = styled.div`
  min-height: 128px;
  background-color: var(--primary-background-color);
  border-radius: var(--border-radius);
  padding: 0 8px 8px 8px;
  margin: 0 8px 8px 8px;
`;

const TextArea = styled.textarea`
  font-family: var(--font-family);
  color: var(--secondary-color);
  border-radius: var(--border-radius);
  outline: none;
  border: none;
  resize: none;
  padding: 8px;
  font-size: 1rem;
  line-height: 1.5rem;
  background-color: transparent;
  &:focus {
    outline: none;
  }
`;

type Props = {
  addText: string;
  placeholder: string;
  type: 'primary' | 'secondary' | 'danger';
  onEnter: (text: string) => void;
};

export const AddComment = ({ addText, placeholder, type, onEnter }: Props) => {
  const [text, setText] = React.useState('');
  return (
    <AddItemForm>
      <CodeEditor
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
          setText(e.target.value);
        }}
        style={{
          color: 'var(--text-color)',
          backgroundColor: 'var(--secondary-background-color)',
          width: '100%',
          minHeight: '72px',
          marginBottom: '8px',
        }}
        placeholder={placeholder}
        value={text}
        autoFocus={true}
      />
      <AddButton
        text={addText}
        type={type}
        canClose={false}
        disabled={false}
        onAddClick={() => {
          onEnter(text);
          setText('');
        }}
      />
    </AddItemForm>
  );
};
