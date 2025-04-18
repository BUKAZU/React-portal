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
    <div className="bu_grid bu_grid-cols-7 bu_text-center bu_mt-6 bu_gap-px">
      {days}
    </div>
  );
}

export default WeekDays;
