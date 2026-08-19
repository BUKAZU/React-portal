import { startOfWeek, addDays } from '../../../_lib/date_helper';
import React from 'react';
import { FormatIntl } from '../../../_lib/date_helper';

interface Props {
  month: Date;
}

function WeekDays({ month }: Props): JSX.Element {
  const dateFormat: Intl.DateTimeFormatOptions = { weekday: 'short' };
  let days: JSX.Element[] = [];

  let startDate: Date = startOfWeek(month);

  for (let i = 0; i < 7; i++) {
    days.push(
      <div className="bu-calendar-col bu-text-center" key={i}>
        {FormatIntl(addDays(startDate, i), dateFormat)}
      </div>
    );
  }

  return <div className="bu-grid bu-grid-cols-7">{days}</div>;
}

export default WeekDays;
