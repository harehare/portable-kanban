import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Filter } from '../../pages/Filter';
import { TestWrapper } from '../helpers';

const settings = {
  labels: [
    { id: 'l1', title: 'Bug', color: '#eb5a46' as const },
    { id: 'l2', title: 'Feature', color: '#61bd4f' as const },
  ],
};

describe('Filter', () => {
  it('renders filter heading', () => {
    render(
      <TestWrapper>
        <Filter settings={{ labels: [] }} />
      </TestWrapper>,
    );
    expect(screen.getByText('Filter Cards')).toBeInTheDocument();
  });

  it('renders label options from settings', () => {
    render(
      <TestWrapper>
        <Filter settings={settings} />
      </TestWrapper>,
    );
    expect(screen.getByText('Bug')).toBeInTheDocument();
    expect(screen.getByText('Feature')).toBeInTheDocument();
  });

  it('renders checkboxes for each label', () => {
    render(
      <TestWrapper>
        <Filter settings={settings} />
      </TestWrapper>,
    );
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(2);
  });

  it('renders nothing when settings has no labels', () => {
    render(
      <TestWrapper>
        <Filter settings={{ labels: [] }} />
      </TestWrapper>,
    );
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });

  it('toggles label filter on checkbox click', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <Filter settings={settings} />
      </TestWrapper>,
    );
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes[0]).not.toBeChecked();
    await user.click(checkboxes[0]);
    expect(checkboxes[0]).toBeChecked();
    await user.click(checkboxes[0]);
    expect(checkboxes[0]).not.toBeChecked();
  });
});
