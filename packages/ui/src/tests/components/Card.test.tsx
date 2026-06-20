import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Card } from '../../components/Card';
import { TestWrapper, createCard } from '../helpers';

describe('Card', () => {
  it('renders card title', () => {
    const card = createCard({ title: 'My Task' });
    render(
      <TestWrapper>
        <Card card={card} />
      </TestWrapper>,
    );
    expect(screen.getByText('My Task')).toBeInTheDocument();
  });

  it('renders labels', () => {
    const card = createCard({
      labels: [{ id: 'l1', title: 'Bug', color: '#eb5a46' }],
    });
    render(
      <TestWrapper>
        <Card card={card} />
      </TestWrapper>,
    );
    expect(screen.getByText('Bug')).toBeInTheDocument();
  });

  it('renders checkbox count when checkboxes exist', () => {
    const card = createCard({
      checkboxes: [
        { id: 'c1', title: 'Step 1', checked: true },
        { id: 'c2', title: 'Step 2', checked: false },
      ],
    });
    render(
      <TestWrapper>
        <Card card={card} />
      </TestWrapper>,
    );
    expect(screen.getByText('1/2')).toBeInTheDocument();
  });

  it('renders comment count when comments exist', () => {
    const card = createCard({
      comments: [
        { id: 'cm1', comment: 'first comment' },
        { id: 'cm2', comment: 'second comment' },
      ],
    });
    render(
      <TestWrapper>
        <Card card={card} />
      </TestWrapper>,
    );
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('renders due date when set', () => {
    const dueDate = new Date('2026-06-01');
    const card = createCard({ dueDate });
    render(
      <TestWrapper>
        <Card card={card} />
      </TestWrapper>,
    );
    expect(screen.getByText(dueDate.toDateString())).toBeInTheDocument();
  });

  it('shows textarea input when in edit mode', () => {
    const card = createCard({ title: '' });
    render(
      <TestWrapper>
        <Card card={card} isEdit={true} />
      </TestWrapper>,
    );
    expect(screen.getByPlaceholderText('Enter title of card')).toBeInTheDocument();
  });

  it('calls onEnter when Enter key is pressed in edit mode', async () => {
    const user = userEvent.setup();
    const onEnter = vi.fn();
    const card = createCard({ title: '' });
    render(
      <TestWrapper>
        <Card card={card} isEdit={true} onEnter={onEnter} />
      </TestWrapper>,
    );
    const textarea = screen.getByPlaceholderText('Enter title of card');
    await user.type(textarea, 'New Task{Enter}');
    expect(onEnter).toHaveBeenCalledWith(expect.objectContaining({ title: 'New Task' }));
  });

  it('calls onEnter with keepOpen=true when Ctrl+Enter is pressed in edit mode', async () => {
    const user = userEvent.setup();
    const onEnter = vi.fn();
    const card = createCard({ title: '' });
    render(
      <TestWrapper>
        <Card card={card} isEdit={true} onEnter={onEnter} />
      </TestWrapper>,
    );
    const textarea = screen.getByPlaceholderText('Enter title of card');
    await user.type(textarea, 'New Task{Control>}{Enter}{/Control}');
    expect(onEnter).toHaveBeenCalledWith(expect.objectContaining({ title: 'New Task' }), true);
  });

  it('renders title without link when editable is false', () => {
    const card = createCard({ title: 'Read Only Card' });
    render(
      <TestWrapper>
        <Card card={card} editable={false} />
      </TestWrapper>,
    );
    expect(screen.getByText('Read Only Card')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('renders multiple labels', () => {
    const card = createCard({
      labels: [
        { id: 'l1', title: 'Bug', color: '#eb5a46' },
        { id: 'l2', title: 'Feature', color: '#61bd4f' },
      ],
    });
    render(
      <TestWrapper>
        <Card card={card} />
      </TestWrapper>,
    );
    expect(screen.getByText('Bug')).toBeInTheDocument();
    expect(screen.getByText('Feature')).toBeInTheDocument();
  });

  it('does not render checkbox count when no checkboxes', () => {
    const card = createCard({ checkboxes: [] });
    render(
      <TestWrapper>
        <Card card={card} />
      </TestWrapper>,
    );
    expect(screen.queryByText(/\d+\/\d+/)).not.toBeInTheDocument();
  });
});
