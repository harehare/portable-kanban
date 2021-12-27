import { format } from 'date-fns';
import * as React from 'react';

import { Input } from './Form';

interface Props {
  value?: Date;
  onChange: (date: Date) => void;
}

export const DatePicker: React.VFC<Props> = ({ value, onChange }) => {
  const date = value ? format(value, "yyyy-MM-dd'T'hh:mm") : undefined;

  return (
    <Input
      type="datetime-local"
      value={date}
      onChange={(e) => {
        try {
          onChange(new Date(Date.parse(e.target.value)));
        } catch {}
      }}
    />
  );
};
