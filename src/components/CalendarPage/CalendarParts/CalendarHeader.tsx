import React, { useContext } from 'react';
import ArrowRight from '../../icons/ArrowRight.svg';
import ArrowLeft from '../../icons/ArrowLeft.svg';
import Reload from '../../icons/Reload.svg';
import { CalendarContextDispatch } from './CalendarContext';
import { addMonths, subMonths } from 'date-fns';

interface Props {
  changeMonth: Function;
  currentMonth: Date;
  numberOfMonths: number;
}

function CalendarHeader({
  changeMonth,
  currentMonth,
  numberOfMonths
}: Props): JSX.Element {
  const dispatch = useContext(CalendarContextDispatch);  
  
  function next() {
    changeMonth(addMonths(currentMonth, numberOfMonths));
  }
  function prev() {
    changeMonth(subMonths(currentMonth, numberOfMonths));
  }

  return (
    <div className="calendars-header">
      <div
        className="bu-calendar-col bu-prev"
        style={{ textAlign: 'center' }}
        onClick={prev}
        tabIndex={0}
        role="button"
      >
        <div className="icon">
          {' '}
          <ArrowLeft />
        </div>
      </div>
      <div
        className="bu-calendar-col bu-reset"
        onClick={() => {
          dispatch({
            type: 'reset'
          });
        }}
        style={{ textAlign: 'center' }}
        tabIndex={0}
        role="button"
      >
        <div className="icon">
          <Reload />
        </div>
      </div>
      <div
        className="bu-calendar-col bu-next"
        onClick={next}
        style={{ textAlign: 'center' }}
        tabIndex={0}
        role="button"
      >
        <div className="icon">
          <ArrowRight />
        </div>
      </div>
    </div>
  );
}

export default CalendarHeader;
