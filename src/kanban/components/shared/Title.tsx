import * as React from 'react';
import styled from 'styled-components';

import { Input } from './Form';
import { Linkify } from './Linkify';

const Container = styled.div`
  font-size: 1rem;
  line-height: 1.5rem;
  font-weight: 800;
  padding: 2px 0;
  background-color: transparent;
`;

type Props = {
  title: string;
  fontSize: 'small' | 'medium' | 'large';
  width: number | '100%';
  editable?: boolean;
  onEnter: (text: string) => void;
};

export const Title = ({
  title: defaultTitle,
  fontSize,
  width,
  onEnter,
}: Props) => {
  const [isEdit, setEdit] = React.useState(false);
  const [title, setTitle] = React.useState(defaultTitle);
  const refDefaultTitle = React.useRef(defaultTitle);
  const [isComposing, setIsComposing] = React.useState(false);
  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key !== 'Enter' || isComposing) {
        return;
      }

      if (title === '') {
        setTitle(refDefaultTitle.current);
      }

      onEnter(title === '' ? refDefaultTitle.current : title);
      setEdit(false);
    },
    [title, isComposing]
  );
  const handleBlur = React.useCallback(() => {
    if (title === '') {
      setTitle(refDefaultTitle.current);
    }
    onEnter(title === '' ? refDefaultTitle.current : title);
    setEdit(false);
  }, [title]);

  React.useEffect(() => {
    setTitle(defaultTitle);
  }, [defaultTitle]);

  return (
    <>
      {isEdit ? (
        <Input
          onChange={(e) => {
            setTitle(e.target.value);
          }}
          placeholder="Enter list title"
          style={{
            width: width === '100%' ? '100%' : `${width}px`,
            fontWeight: 800,
            fontFamily: 'var(--font-family)',
            backgroundColor: 'var(--secondary-background-color)',
            color: 'var(--text-color)',
            fontSize:
              fontSize === 'medium'
                ? '1rem'
                : fontSize === 'small'
                ? '0.875rem'
                : '1.5rem',
            lineHeight: '1.5rem',
          }}
          onCompositionStart={() => {
            setIsComposing(true);
          }}
          onCompositionEnd={() => {
            setIsComposing(false);
          }}
          value={title}
          autoFocus={true}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
        />
      ) : (
        <Container
          style={{
            fontSize:
              fontSize === 'medium'
                ? '1rem'
                : fontSize === 'small'
                ? '0.875rem'
                : '1.5rem',
            color: 'var(--text-color)',
            width: width === '100%' ? '100%' : `${width}px`,
            cursor: 'pointer',
          }}
          onClick={(e) => {
            e.stopPropagation();
            setEdit(true);
          }}>
          <Linkify child={<>{title}</>} />
        </Container>
      )}
    </>
  );
};
