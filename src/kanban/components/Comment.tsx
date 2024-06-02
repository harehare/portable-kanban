import * as React from 'react';
import { IoMdTrash } from 'react-icons/io';
import { styled } from 'styled-components';
import { type Comment as CommentModel } from '../models/kanban';
import { Description } from './shared/Description';
import { IconButton } from './shared/IconButton';

const Container = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  background-color: var(--secondary-background-color);
  cursor: pointer;
  border-radius: var(--border-radius);
  margin-left: 16px;
  margin-bottom: 16px;
`;

type Properties = {
  comment: CommentModel;
  onEnter: (title: string) => void;
  onDelete: (comment: CommentModel) => void;
};

export const Comment = ({ comment, onEnter, onDelete }: Properties) => {
  const [showDeleteButton, setShowDeleteButton] = React.useState(false);

  return (
    <Container
      onMouseOver={() => {
        setShowDeleteButton(true);
      }}
      onMouseLeave={() => {
        setShowDeleteButton(false);
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
        <Description description={comment.comment ?? ''} fontSize="medium" onEnter={onEnter} />
      </div>
      {showDeleteButton && (
        <div
          style={{
            position: 'absolute',
            right: '8px',
            top: '8px',
            color: 'var(--text-color)',
          }}
        >
          <IconButton
            icon={<IoMdTrash />}
            onClick={() => {
              onDelete(comment);
            }}
          />
        </div>
      )}
    </Container>
  );
};
