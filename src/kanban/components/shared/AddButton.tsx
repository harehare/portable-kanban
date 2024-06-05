import * as React from 'react';
import { MdClose } from 'react-icons/md';
import { styled } from 'styled-components';
import { Button } from './Button';

const Icon = styled.div`
  background-color: transparent;
  color: var(--text-color);
  border: none;
  outline: none;
  cursor: pointer;
  font-size: 1.125rem;
  line-height: 1.75rem;
  font-weight: 600;
  padding: 3px 0 0 8px;
  margin-top: 4px;
`;

const Buttons = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
`;

type Properties = {
  text: string;
  type: 'primary' | 'secondary' | 'danger';
  canClose: boolean;
  disabled: boolean;
  onAddClick: () => void;
  onCancel?: () => void;
};

export const AddButton = ({ text, type, canClose, disabled = false, onAddClick, onCancel }: Properties) => {
  return (
    <Buttons>
      <Button text={text} type={type} onClick={onAddClick} disabled={disabled} />
      {canClose ? (
        <Icon
          onClick={(e: React.MouseEvent<HTMLDivElement>) => {
            e.stopPropagation();
            if (onCancel) {
              onCancel();
            }
          }}
        >
          <MdClose />
        </Icon>
      ) : (
        <></>
      )}
    </Buttons>
  );
};
