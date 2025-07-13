import * as React from 'react';
import { styled } from 'styled-components';

const Button = styled.div`
  cursor: pointer;
  font-size: 1.1rem;
`;

type Props = {
  icon: React.ReactNode;
  onClick: () => void;
  title?: string;
};

export const IconButton = ({ icon, onClick, title }: Props) => {
  return (
    <Button
      onClick={(e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        onClick();
      }}
      title={title}
    >
      {icon}
    </Button>
  );
};
