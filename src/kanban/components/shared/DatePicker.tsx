import { format } from 'date-fns/format';
import * as React from 'react';

import { Input } from './Input';

type Props = {
  value?: Date;
  onChange: (date?: Date) => void;
};

export const DatePicker = ({ value, onChange }: Props) => {
  const date = React.useMemo(() => {
    try {
      return value ? format(value, "yyyy-MM-dd'T'HH:mm") : undefined;
    } catch {
      return format(new Date(), "yyyy-MM-dd'T'HH:mm");
    }
  }, [value]);

  return (
    <Input
      type="datetime-local"
      style={{ width: 'calc(100% - 16px)', marginLeft: '8px' }}
      value={date}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.value !== '') {
          try {
            onChange(new Date(Date.parse(e.target.value)));
          } catch {
            onChange(undefined);
          }
        } else {
          onChange(undefined);
        }
      }}
    />
  );
};
