import * as React from 'react';
import { Box, Text, useInput } from 'ink';

type Props = {
  prompt?: string;
  initialValue?: string;
  onSubmit: (value: string) => void;
  onCancel: () => void;
};

export const TextInput = ({ prompt = '', initialValue = '', onSubmit, onCancel }: Props) => {
  const [value, setValue] = React.useState(initialValue);

  useInput((input, key) => {
    if (key.escape) {
      onCancel();
      return;
    }
    if (key.return) {
      onSubmit(value);
      return;
    }
    if (key.backspace || key.delete) {
      // Use spread to split by Unicode code point (handles surrogate pairs / rare kanji)
      setValue((v) => [...v].slice(0, -1).join(''));
      return;
    }
    // Accept printable input including multi-char IME commits (e.g. Japanese)
    if (!key.ctrl && !key.meta && input.length >= 1) {
      setValue((v) => v + input);
    }
  });

  return (
    <Box>
      <Text color="cyan">{prompt}</Text>
      <Text>{value}</Text>
      <Text color="cyan">█</Text>
      <Box marginLeft={2}>
        <Text color="gray" dimColor>
          (Enter: confirm  Esc: cancel)
        </Text>
      </Box>
    </Box>
  );
};
