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

export const IconButton: React.VFC<Props> = ({ icon, onClick }) => {
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
