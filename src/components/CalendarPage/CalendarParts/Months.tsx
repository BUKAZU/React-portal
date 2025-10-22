import { addMonths, format } from 'date-fns';
import React from 'react';
import { HouseType } from '../../../types';
import SingleMonth from './SingleMonth';

interface Props {
  house: HouseType;
  numberOfMonths: number;
  numberOfMonthsInARow: number;
  currentMonth: Date;
}

function Months({
  numberOfMonthsInARow,
  currentMonth,
  numberOfMonths,

  house
}: Props): JSX.Element {
  let template: JSX.Element[] = [];

  for (let i = 0; i < numberOfMonths; i++) {
    template.push(
      <SingleMonth
        key={format(addMonths(currentMonth, i), 'MM-yyyy')}
        house={house}
        currentMonth={currentMonth}
        count={i}
      />
    );
  }

  return (
    <div
      className={`bu-grid bu-grid-cols-${numberOfMonthsInARow || 2} bu-gap-16`}
    >
      {template}
    </div>
  );
}

export default Months;
