import { format } from 'date-fns';
import React from 'react';
import DatePicker from 'react-date-picker';
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';
import { Field } from './filter_types';

interface Props {
  value: any;
  onChange: Function;
  field: Field;
}

function DateFilter({ value, onChange, field }: Props): JSX.Element {
  let tempval;
  if (value === '' || !value) {
    tempval = null;
  } else {
    tempval = new Date(value);
  }
  return (
    <DatePicker
      onChange={(date: Date) => {
        if (date) {
          onChange(field.id, format(date, 'yyyy-MM-dd'));
        } else {
          onChange(field.id, '');
        }
      }}
      value={tempval}
      format="dd-MM-y"
    />
  );
}

export default DateFilter;
