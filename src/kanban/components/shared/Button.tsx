import * as React from 'react';
import { styled, css } from 'styled-components';

const ButtonBase = styled.button<{
  background: 'primary' | 'secondary' | 'danger';
}>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: none;
  outline: none;
  cursor: pointer;
  border-radius: var(--border-radius);
  line-height: 20px;
  padding: 6px 12px;
  ${(properties) =>
    properties.background === 'primary'
      ? css`
          color: var(--light-text-color);
          background-color: var(--primary-color);
        `
      : properties.background === 'danger'
        ? css`
            color: var(--light-text-color);
            background-color: var(--danger-color);
          `
        : css`
            color: var(--text-color);
            background-color: var(--button-color);
          `}
  &:hover {
    ${(properties) =>
      properties.background === 'primary'
        ? css`
            background-color: #285f8f !important;
          `
        : properties.background === 'danger'
          ? css`
              background-color: #c02a33 !important;
            `
          : css`
              background-color: var(--selected-color) !important;
            `}
  }
`;

const Label = styled.div`
  font-size: 0.875rem;
  line-height: 1.25rem;
  padding: 4px;
  border: none;
  background-color: transparent;
`;

type Properties = {
  text: string;
  icon?: React.ReactElement;
  type?: 'primary' | 'secondary' | 'danger';
  disabled: boolean;
  onClick: () => void;
};

export const Button = ({ text, icon = undefined, type = 'secondary', disabled = false, onClick }: Properties) => {
  return (
    <ButtonBase
      background={type}
      disabled={disabled}
      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        onClick();
      }}
    >
      {icon}
      <Label>{text}</Label>
    </ButtonBase>
  );
};
