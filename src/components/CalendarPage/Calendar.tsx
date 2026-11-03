import React, { useState } from 'react';
import AssistanceMessage from './formParts/AssistanceMessage';
import Legend from './CalendarParts/Legend';
import Months from './CalendarParts/Months';
import StartBooking from './CalendarParts/StartBooking';
import { HouseType } from '../../types';

interface Props {
  numberOfMonths: number;
  numberOfMonthsInARow: number;
  house: HouseType;
}

/**
 * The availability calendar with the stay bar pinned under it. The bar is
 * sticky inside the portal (never fixed on the host page), so it shows as soon
 * as the calendar block is in view and rests at its end when scrolled past.
 */
function Calendar({
  numberOfMonths,
  house,
  numberOfMonthsInARow
}: Props): JSX.Element {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  return (
    <div className="calendar-container bu-calendar-page">
      <div className="calendar-section bu-calendar-main">
        <AssistanceMessage house={house} />
        <Months
          house={house}
          numberOfMonths={numberOfMonths}
          numberOfMonthsInARow={numberOfMonthsInARow}
          currentMonth={currentMonth}
          changeMonth={setCurrentMonth}
        />
        <Legend house={house} />
      </div>
      <StartBooking house={house} />
    </div>
  );
}

export default Calendar;
