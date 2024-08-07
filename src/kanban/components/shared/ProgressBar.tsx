import { styled } from 'styled-components';

const Container = styled.div`
  width: 100%;
  height: 8px;
  background-color: var(--selected-color);
`;

const Progress = styled.div<{
  progress: number;
}>`
  background-color: var(--primary-color);
  width: ${({ progress }) => `${Number.isNaN(progress) ? 0 : progress}%`};
  height: 8px;
`;

type Props = {
  progress: number;
};

export const ProgressBar = ({ progress }: Props) => {
  return (
    <Container>
      <Progress progress={progress} />
    </Container>
  );
};
