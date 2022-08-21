import * as React from 'react';
import styled from 'styled-components';

const Button = styled.div`
  cursor: pointer;
  font-size: 1.1rem;
`;

interface Props {
  icon: React.ReactNode;
  onClick: () => void;
}

export const IconButton = ({ icon, onClick }: Props) => {
  return (
    <Button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}>
      {icon}
    </Button>
  );
};
