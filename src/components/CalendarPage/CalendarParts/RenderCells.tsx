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
  FormatIntl,
  LONG_DATE_FORMAT,
  differenceInCalendarDays,
  isSameMonth
} from '../../../_lib/date_helper';
import { t } from '../../../intl';
import DayClasses, { isDepartureCandidate } from './DayClasses';
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

  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const today = new Date();
  const cells: JSX.Element[] = [];

  // A departure is being chosen: hovering previews the stay.
  const choosingDeparture =
    dates.selectedDate !== null && dates.departureDate === null;

  let day: Date = startDate;

  while (day <= endDate) {
    const date = formatDateKey(day);
    const yesterday = formatDateKey(subDays(day, 1));
    const daz = availabilities.find((x) => x.date === date);
    const prevBooked = availabilities.find((x) => x.date === yesterday);

    // Days of the neighbouring months only keep the grid aligned. The fetched
    // range always covers every rendered day, but guard against a gap so a
    // missing entry renders a disabled cell instead of crashing.
    if (!daz || !isSameMonth(day, monthStart)) {
      cells.push(
        <div className="bu-day disabled" key={date} aria-hidden="true">
          <span>{FormatIntl(day, { day: 'numeric' })}</span>
        </div>
      );
      day = addDays(day, 1);
      continue;
    }

    const cloneDay = daz;
    const cellDate = day;
    const past = isBefore(cellDate, subDays(today, 1));
    const candidate = isDepartureCandidate({
      day: cellDate,
      buDate: daz,
      prevBooked,
      dates,
      house
    });
    const className = DayClasses({
      day: cellDate,
      monthStart,
      discounts,
      buDate: daz,
      prevBooked,
      house,
      dates
    });

    // Explain an invalid hover when the stay would be too short.
    let tip: string | undefined;
    if (
      className.includes('bu-preview-invalid') &&
      dates.arrivalDate &&
      dates.selectedDate &&
      differenceInCalendarDays(cellDate, dates.selectedDate) <
        dates.arrivalDate.min_nights
    ) {
      tip = t('minimum_nights', { minimum: dates.arrivalDate.min_nights });
    }

    const select = () => {
      if (past) {
        return;
      }
      dispatch({
        type: 'clicked',
        day: cloneDay,
        house
      });
    };

    cells.push(
      <div
        className={className}
        key={daz.date}
        role="button"
        tabIndex={past ? -1 : 0}
        aria-label={FormatIntl(cellDate, LONG_DATE_FORMAT)}
        aria-disabled={past || undefined}
        data-bu-tip={tip}
        onClick={select}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            select();
          }
        }}
        onMouseEnter={() => {
          if (choosingDeparture && !past) {
            dispatch({ type: 'hover', date: cellDate, valid: candidate });
          }
        }}
        onMouseLeave={() => {
          if (choosingDeparture) {
            dispatch({ type: 'unhover' });
          }
        }}
      >
        <span>{FormatIntl(cellDate, { day: 'numeric' })}</span>
      </div>
    );
    day = addDays(day, 1);
  }
  return <div className="bu-days bu-grid bu-grid-cols-7">{cells}</div>;
}

export default RenderCells;
