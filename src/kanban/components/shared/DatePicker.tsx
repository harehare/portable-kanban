import { format } from 'date-fns';
import * as React from 'react';

import { Input } from './Form';

interface Props {
  value?: Date;
  onChange: (date: Date) => void;
}

export const DatePicker: React.VFC<Props> = ({ value, onChange }) => {
  const date = React.useMemo(
    () => (value ? format(value, "yyyy-MM-dd'T'hh:mm") : undefined),
    [value]
  );

  return (
    <Input
      type="datetime-local"
      style={{ width: 'calc(100% - 16px)', marginLeft: '8px' }}
      value={date}
      onChange={(e) => {
        try {
          onChange(new Date(Date.parse(e.target.value)));
        } catch {}
      }}
    />
  );
};
