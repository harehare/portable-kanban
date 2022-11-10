import * as React from 'react';
import styled, { css } from 'styled-components';

const Input = styled.input`
  height: 0;
  width: 0;
  opacity: 0;
  z-index: -1;
`;

const Label = styled.label`
  position: relative;
  display: inline-block;
  cursor: pointer;
  margin-right: 24px;
`;

const Indicator = styled.div<{ checked: boolean }>`
  width: 1.2em;
  height: 1.2em;
  ${({ checked }) =>
    checked
      ? css`
          background-color: var(--primary-color);
        `
      : css`
          background-color: var(--secondary-background-color);
        `};
  position: absolute;
  top: 0em;
  left: -1.6em;
  border: 2px solid var(--form-border-color);
  border-radius: 0.2em;
  margin-left: 24px;

  &::after {
    content: '';
    position: absolute;
    display: none;
  }

  ${Input}:checked + &::after {
    display: block;
    top: 0.05em;
    left: 0.25rem;
    width: 35%;
    height: 50%;
    border: solid var(--form-border-color);
    border-width: 0 0.2em 0.2em 0;
    transform: rotate(45deg);
  }
`;

type Props = {
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export const CheckBox = ({ checked, onChange }: Props) => {
  return (
    <Label>
      <Input
        type="checkbox"
        checked={checked}
        onChange={(e) => {
          onChange(e.target.checked);
        }}
      />
      <Indicator checked={checked} />
    </Label>
  );
};
