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
}: CellProps): JSX.Element {
  const dispatch = useContext(CalendarContextDispatch);
  const dates = useContext(CalendarContext);

  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  let days: JSX.Element[] = [];
  let day: Date = startDate;

  while (day <= endDate) {
    // for (let daz of dayz) {
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
            isBefore(parse(cloneDay.date, 'yyyy-MM-dd', new Date()), new Date())
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
  return (
    <div className="bu_grid bu_grid-cols-7 bu_gap-px bu_max-w-fit bu_mt-2">
      {days}
    </div>
  );
}

export default RenderCells;
