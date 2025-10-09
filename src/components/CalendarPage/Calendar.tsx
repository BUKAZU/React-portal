import React, { useState } from 'react';
import CalendarHeader from './CalendarParts/CalendarHeader';
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

function Calendar({
  numberOfMonths,
  house,
  numberOfMonthsInARow
}: Props): JSX.Element {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  return (
    <div className="calendar-container ">
      <StartBooking house={house} />
      <div className="calendar-section">
        <CalendarHeader
          changeMonth={setCurrentMonth}
          currentMonth={currentMonth}
          numberOfMonths={numberOfMonths}
        />
        <Months
          house={house}
          numberOfMonths={numberOfMonths}
          numberOfMonthsInARow={numberOfMonthsInARow}
          currentMonth={currentMonth}
        />
        <Legend house={house} />
        <AssistanceMessage house={house} />
      </div>
    </div>
  );
}

Calendar.defaultProps = {
  numberOfMonths: 4,
  numberOfMonthsInARow: 2
};

export default Calendar;
