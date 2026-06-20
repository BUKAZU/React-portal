import { addMonths } from 'date-fns';
import React from 'react';
import { HouseType } from '../../../types';
import {
  AvailabilityDiscount,
  AvailabilityEntry
} from '../../../_lib/availability';
import MonthHeader from './MonthHeader';
import RenderCells from './RenderCells';
import WeekDays from './WeekDays';

interface Props {
  count: number;
  currentMonth: Date;
  house: HouseType;
  availabilities: AvailabilityEntry[];
  discounts: AvailabilityDiscount[];
}

function SingleMonth({
  count,
  currentMonth,
  house,
  availabilities,
  discounts
}: Props): JSX.Element {
  const month = addMonths(currentMonth, count);

  return (
    <div className="bu-calendar calendar bup-16" key={month}>
      <MonthHeader month={month} />
      <WeekDays month={month} />
      <RenderCells
        availabilities={availabilities}
        discounts={discounts}
        month={month}
        house={house}
      />
    </div>
  );
}

export default SingleMonth;
