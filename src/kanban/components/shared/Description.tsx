import * as React from 'react';
import ReactMarkdown from 'react-markdown';
import TextareaAutosize from 'react-textarea-autosize';
import styled from 'styled-components';

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

type Props = {
  description: string;
  fontSize: 'medium' | 'large';
  onEnter: (text: string) => void;
};

export const Description = ({
  description: defaultDescription,
  fontSize,
  onEnter,
}: Props) => {
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
        <TextareaAutosize
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
            setDescription(e.target.value);
          }}
          placeholder="Enter description"
          minRows={3}
          maxRows={20}
          style={{
            width: 'calc(100% - 24px)',
            fontFamily: 'var(--font-family)',
            backgroundColor: 'var(--secondary-background-color)',
            color: 'var(--text-color)',
            fontSize: fontSize === 'medium' ? '1rem' : '1.5rem',
            lineHeight: '1.5rem',
            padding: '24px 8px 16px 8px',
            resize: 'none',
            borderColor: 'var(--form-border-color)',
            borderRadius: 'var(--border-radius)',
            outline: 'none',
          }}
          value={description}
          autoFocus={true}
          onBlur={handleBlur}
        />
      ) : (
        <div
          style={{
            fontSize: fontSize === 'medium' ? '1rem' : '1.5rem',
            color: 'var(--text-color)',
            backgroundColor: 'var(--secondary-background-color)',
            cursor: 'pointer',
            minHeight: '96px',
            width: 'calc(100% - 24px)',
            borderRadius: 'var(--border-radius)',
            overflow: 'hidden',
            padding: '8px',
          }}
          onClick={(e) => {
            e.stopPropagation();
            setEdit(true);
          }}>
          <ReactMarkdown>{description}</ReactMarkdown>
        </div>
      )}
    </Container>
  );
};
