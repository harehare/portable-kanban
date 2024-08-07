import { styled } from 'styled-components';

export const Input = styled.input`
  font-family: var(--font-family);
  outline: none;
  border: none;
  padding: 4px;
  font-size: 1rem;
  line-height: 1.3rem;
  color: var(--text-color);
  border-radius: var(--border-radius);
  background-color: var(--secondary-background-color);
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  &:focus {
    outline: none;
  }
`;
