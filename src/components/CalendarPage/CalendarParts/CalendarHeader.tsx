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
    <div className="grid grid-cols-3 gap-4 my-4">
      <button
        className="bg-primary focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center flex justify-center border"
        onClick={prev}
        tabIndex={0}
        role="button"
      >
        <div className="h-4 w-4">
          <ArrowLeft />
        </div>
      </button>
      <button
        className="bg-primary focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center flex justify-center border"
        onClick={() => {
          dispatch({
            type: 'reset'
          });
        }}
      >
        <div className="h-4 w-4">
          <Reload />
        </div>
      </button>
      <button
        className="bg-primary focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center flex justify-center border"
        onClick={next}
      >
        <div className="h-4 w-4">
          <ArrowRight />
        </div>
      </button>
    </div>
  );
}

export default CalendarHeader;
