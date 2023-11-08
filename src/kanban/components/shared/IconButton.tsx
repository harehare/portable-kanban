import * as React from 'react';
import styled from 'styled-components';

const Button = styled.div`
  cursor: pointer;
  font-size: 1.1rem;
`;

type Props = {
  icon: React.ReactNode;
  onClick: () => void;
};

export const IconButton = ({ icon, onClick }: Props) => {
  return (
    <Button
      onClick={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.stopPropagation();
        onClick();
      }}>
      {icon}
    </Button>
  );
};
