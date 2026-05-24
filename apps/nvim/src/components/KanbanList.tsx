import * as React from 'react';
import { Box, Text } from 'ink';
import type { Card, List } from '@portable-kanban/core';

type Props = {
  list: List;
  isSelected: boolean;
  selectedCardIndex: number;
  width?: number;
};

export const KanbanList = ({ list, isSelected, selectedCardIndex, width = 32 }: Props) => {
  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={isSelected ? 'cyan' : 'gray'}
      width={width}
      marginRight={1}
    >
      <Box paddingX={1} marginBottom={1}>
        <Text bold color={isSelected ? 'cyan' : 'white'}>
          {list.title}
        </Text>
        <Text color="gray"> ({list.cards.length})</Text>
      </Box>
      <Box flexDirection="column" paddingX={1}>
        {list.cards.length === 0 ? (
          <Text color="gray" dimColor>
            (empty)
          </Text>
        ) : (
          list.cards.map((card: Card, i: number) => (
            <KanbanCard
              key={card.id}
              card={card}
              isSelected={isSelected && i === selectedCardIndex}
            />
          ))
        )}
      </Box>
    </Box>
  );
};

type CardProps = {
  card: Card;
  isSelected: boolean;
};

const KanbanCard = ({ card, isSelected }: CardProps) => {
  const hasCheckboxes = card.checkboxes.length > 0;
  const checkedCount = card.checkboxes.filter((c) => c.checked).length;
  const hasLabels = card.labels.length > 0;

  return (
    <Box
      flexDirection="column"
      marginBottom={1}
      paddingX={1}
      borderStyle={isSelected ? 'single' : undefined}
      borderColor="cyan"
    >
      <Text wrap="truncate" color={isSelected ? 'cyan' : 'white'} bold={isSelected}>
        {isSelected ? '▶ ' : '  '}
        {card.title}
      </Text>
      {hasLabels && (
        <Text color="magenta" dimColor>
          {'    '}
          {card.labels.map((l) => `[${l.title}]`).join(' ')}
        </Text>
      )}
      {hasCheckboxes && (
        <Text color={checkedCount === card.checkboxes.length ? 'green' : 'gray'} dimColor>
          {'    '}
          [{checkedCount}/{card.checkboxes.length}] tasks
        </Text>
      )}
      {card.dueDate && (
        <Text color="yellow" dimColor>
          {'    '}📅 {new Date(card.dueDate).toLocaleDateString()}
        </Text>
      )}
    </Box>
  );
};

