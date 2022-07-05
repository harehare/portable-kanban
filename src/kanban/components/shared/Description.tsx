import * as React from 'react';
import styled from 'styled-components';

import { TextArea } from './Form';
import { Linkify } from './Linkify';

const Container = styled.div`
  width: 100%;
  padding: 8px;
`;

const Text = styled.div`
  width: 100%;
  font-size: 1rem;
  line-height: 1.5rem;
  padding: 8px;
`;

interface Props {
  description: string;
  fontSize: 'medium' | 'large';
  onEnter: (text: string) => void;
}

export const Description: React.VFC<Props> = ({
  description: defaultDescription,
  fontSize,
  onEnter,
}) => {
  const [isEdit, setEdit] = React.useState(false);
  const [description, setDescription] = React.useState(defaultDescription);
  const handleBlur = React.useCallback(() => {
    onEnter(description);
    setEdit(false);
  }, [description]);

  React.useEffect(() => {
    setDescription(defaultDescription);
  }, [defaultDescription]);

  return (
    <Container>
      {isEdit ? (
        <TextArea
          onChange={(e) => {
            setDescription(e.target.value);
          }}
          placeholder="Enter description"
          style={{
            width: 'calc(100% - 24px)',
            height: '100%',
            minHeight: '72px',
            fontFamily: 'var(--font-family)',
            backgroundColor: 'var(--secondary-background-color)',
            color: 'var(--text-color)',
            fontSize: fontSize === 'medium' ? '1rem' : '1.5rem',
            lineHeight: '1.5rem',
          }}
          value={description}
          autoFocus={true}
          onBlur={handleBlur}
        />
      ) : (
        <Text
          style={{
            fontSize: fontSize === 'medium' ? '1rem' : '1.5rem',
            color: 'var(--text-color)',
            backgroundColor: 'var(--secondary-background-color)',
            cursor: 'pointer',
            minHeight: '72px',
            width: 'calc(100% - 24px)',
            borderRadius: 'var(--border-radius)',
            overflow: 'hidden',
          }}
          onClick={(e) => {
            e.stopPropagation();
            setEdit(true);
          }}>
          <Linkify
            child={
              <pre
                style={{
                  whiteSpace: 'break-spaces',
                  margin: '0',
                  fontFamily: 'var(--font-family)',
                }}>
                {description}
              </pre>
            }
          />
        </Text>
      )}
    </Container>
  );
};
