import React, { useContext } from 'react';
import {
  addDays,
  endOfMonth,
  endOfWeek,
  startOfMonth,
  startOfWeek,
  subDays,
  isBefore,
  parse
} from 'date-fns';
import { FormatIntl } from '../../../_lib/date_helper';
import DayClasses from './DayClasses';
import { HouseType } from '../../../types';
import { CalendarContext, CalendarContextDispatch } from './CalendarContext';

interface CellProps {
  availabilities: [];
  month: Date;
  discounts: [];
  house: HouseType;
}

function RenderCells({
  availabilities,
  month,
  discounts,
  house
}: CellProps): Array<JSX.Element> {
  const dispatch = useContext(CalendarContextDispatch);
  const dates = useContext(CalendarContext);

  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const rows: JSX.Element[] = [];

  let days: JSX.Element[] = [];
  let day: Date = startDate;

  while (day <= endDate) {
    // for (let daz of dayz) {
    for (let i = 0; i < 7; i++) {
      let date = FormatIntl(day, 'yyyy-MM-dd');
      let yesterday = FormatIntl(subDays(day, 1), 'yyyy-MM-dd');
      let daz = availabilities.find((x) => x.date === date);

      const prevBooked = availabilities.find((x) => x.date === yesterday);
      const cloneDay = daz;

      days.push(
        <div
          className={DayClasses({
            day,
            monthStart,
            discounts,
            buDate: daz,
            prevBooked,
            house,
            dates
          })}
          key={daz.date}
          role="button"
          tabIndex={0}
          onClick={() => {
            if (
              isBefore(
                parse(cloneDay.date, 'yyyy-MM-dd', new Date()),
                new Date()
              )
            ) {
              return;
            }
            dispatch({
              type: 'clicked',
              day: cloneDay,
              house
            });
          }}
        >
          <span>{FormatIntl(day, 'd')}</span>
        </div>
      );
      day = addDays(day, 1);
    }
    rows.push(days);
    days = [];
  }
  return <div className="bu-grid bu-grid-cols-7">{rows}</div>;
}

export default RenderCells;
