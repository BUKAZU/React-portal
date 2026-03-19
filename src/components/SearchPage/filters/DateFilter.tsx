import React from 'react';
import { Field } from './filter_types';

interface Props {
  value: any;
  onChange: Function;
  field: Field;
}

function DateFilter({ value, onChange, field }: Props): JSX.Element {
  const dateValue = value && value !== '' ? value : '';
  return (
    <input
      type="date"
      value={dateValue}
      onChange={(e) => {
        onChange(field.id, e.target.value);
      }}
    />
  );
}

export default DateFilter;
