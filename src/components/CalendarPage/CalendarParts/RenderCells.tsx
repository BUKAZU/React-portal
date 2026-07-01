import React, { useContext } from 'react';
import {
  addDays,
  endOfMonth,
  endOfWeek,
  startOfMonth,
  startOfWeek,
  subDays,
  isBefore,
  Parse_EN_US,
  formatDateKey,
  FormatIntl
} from '../../../_lib/date_helper';
import DayClasses from './DayClasses';
import { HouseType } from '../../../types';
import {
  AvailabilityDiscount,
  AvailabilityEntry
} from '../../../_lib/availability';
import { CalendarContext, CalendarContextDispatch } from './CalendarContext';

interface CellProps {
  availabilities: AvailabilityEntry[];
  month: Date;
  discounts: AvailabilityDiscount[];
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

  function selectDay(cloneDay: AvailabilityEntry) {
    if (isBefore(Parse_EN_US(cloneDay.date), new Date())) {
      return;
    }
    dispatch({
      type: 'clicked',
      day: cloneDay,
      house
    });
  }

  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const rows: React.ReactNode[] = [];

  let days: JSX.Element[] = [];
  let day: Date = startDate;

  while (day <= endDate) {
    // for (let daz of dayz) {
    for (let i = 0; i < 7; i++) {
      let date = formatDateKey(day);
      let yesterday = formatDateKey(subDays(day, 1));
      const daz = availabilities.find((x) => x.date === date);
      const prevBooked = availabilities.find((x) => x.date === yesterday);

      // The fetched range always covers every rendered day, but guard against a
      // gap so a missing entry renders a disabled cell instead of crashing.
      if (!daz) {
        days.push(
          <div className="bu-grid bu-center disabled" key={date}>
            <span>{FormatIntl(day, { day: 'numeric' })}</span>
          </div>
        );
        day = addDays(day, 1);
        continue;
      }

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
          onClick={() => selectDay(cloneDay)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              selectDay(cloneDay);
            }
          }}
        >
          <span>{FormatIntl(day, { day: 'numeric' })}</span>
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
