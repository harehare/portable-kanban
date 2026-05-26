import * as React from 'react';
import { Box, Text } from 'ink';
import type { Card } from 'portable-kanban-core';

type Props = {
  card: Card;
  listTitle: string;
  boardTitle: string;
  onBack: () => void;
};

export const CardDetail = ({ card, listTitle, boardTitle }: Props) => {
  const checkedCount = card.checkboxes.filter((c) => c.checked).length;

  return (
    <Box flexDirection="column" padding={1}>
      {/* Breadcrumb */}
      <Box marginBottom={1}>
        <Text bold color="cyan">{boardTitle}</Text>
        <Text color="gray"> › {listTitle} › </Text>
        <Text bold color="white">{card.title}</Text>
      </Box>

      {/* Title row */}
      <Box marginBottom={1}>
        <Text color="gray" dimColor>Title  </Text>
        <Text bold>{card.title}</Text>
        <Text color="gray" dimColor>  [e: edit]</Text>
      </Box>

      {/* Description */}
      <Box marginBottom={1}>
        <Text color="gray" dimColor>Desc   </Text>
        {card.description ? (
          <Text>{card.description}</Text>
        ) : (
          <Text color="gray" dimColor>(empty)</Text>
        )}
        <Text color="gray" dimColor>  [d: edit]</Text>
      </Box>

      {/* Due Date */}
      {card.dueDate && (
        <Box marginBottom={1}>
          <Text color="gray" dimColor>Due    </Text>
          <Text color="yellow">{new Date(card.dueDate).toLocaleDateString()}</Text>
        </Box>
      )}

      {/* Labels */}
      {card.labels.length > 0 && (
        <Box marginBottom={1} flexDirection="row">
          <Text color="gray" dimColor>Labels </Text>
          {card.labels.map((l) => (
            <Text key={l.id} color="magenta"> [{l.title}]</Text>
          ))}
        </Box>
      )}

      {/* Checkboxes */}
      {card.checkboxes.length > 0 && (
        <Box borderStyle="single" borderColor="gray" flexDirection="column" paddingX={1} marginBottom={1}>
          <Text bold color="cyan">Tasks {checkedCount}/{card.checkboxes.length}</Text>
          {card.checkboxes.map((cb, i) => (
            <Text key={cb.id} color={cb.checked ? 'green' : 'white'}>
              {i + 1}. {cb.checked ? '[x]' : '[ ]'} {cb.title}
            </Text>
          ))}
        </Box>
      )}

      {/* Comments */}
      {card.comments.length > 0 && (
        <Box borderStyle="single" borderColor="gray" flexDirection="column" paddingX={1} marginBottom={1}>
          <Text bold color="cyan">Comments</Text>
          {card.comments.map((c) => (
            <Box key={c.id} marginTop={1}>
              <Text color="gray" dimColor>› </Text>
              <Text>{c.comment}</Text>
            </Box>
          ))}
        </Box>
      )}

      {/* Footer keymap */}
      <Box marginTop={1} borderStyle="single" borderColor="gray" paddingX={1}>
        <Text color="gray" dimColor>
          q/Esc: back   e: title   d: desc   D: due   t: add task   c: add comment   1-9: toggle   Q: quit
        </Text>
      </Box>
    </Box>
  );
};
