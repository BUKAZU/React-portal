import { startOfWeek, addDays } from 'date-fns';
import React from 'react';
import { FormatIntl } from '../../../_lib/date_helper';

interface Props {
  month: Date;
}

function WeekDays({ month }: Props): JSX.Element {
  const dateFormat = 'E';
  let days: JSX.Element[] = [];

  let startDate: Date = startOfWeek(month);

  for (let i = 0; i < 7; i++) {
    days.push(
      <div key={i}>{FormatIntl(addDays(startDate, i), dateFormat)}</div>
    );
  }

  return (
    <div className="mt-6 grid grid-cols-7 text-xs leading-6 text-gray-500 text-center">
      {days}
    </div>
  );
}

export default WeekDays;
