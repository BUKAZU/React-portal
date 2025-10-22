import React, { useContext } from 'react';
import ArrowRight from '../../icons/ArrowRight.svg';
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
    <div className="calendars-header bu-grid bu-grid-cols-3">
      <div
        className="bu-calendar-col bup-8"
        style={{ textAlign: 'center' }}
        onClick={prev}
        tabIndex={0}
        role="button"
      >
        <div className="icon bu-rounded bu-hover-bright">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            version="1.1"
            x="0px"
            y="0px"
            enableBackground="new 0 0 100 100"
            viewBox="0 0 100 125"
            xmlSpace="preserve"
          >
            <path d="M2.4,44.1l32.9-32.9c3.1-3.1,8.2-3.1,11.4,0c1.6,1.6,2.4,3.6,2.4,5.7c0,2.1-0.8,4.1-2.4,5.7L27.2,42h64.7  c2.2,0,4.2,0.9,5.7,2.4c1.5,1.5,2.4,3.5,2.4,5.7c0,4.4-3.6,8.1-8.1,8.1H27.4l19.3,19.3c1.6,1.6,2.4,3.6,2.4,5.7s-0.8,4.1-2.4,5.7  c-3.1,3.1-8.3,3.1-11.4,0L2.4,55.9C0.8,54.3,0,52.3,0,50.2c0-0.1,0-0.1,0-0.2c0-0.1,0-0.1,0-0.2C0,47.7,0.8,45.7,2.4,44.1z" />
          </svg>
        </div>
      </div>
      <div
        className="bu-calendar-col bup-8"
        onClick={() => {
          dispatch({
            type: 'reset'
          });
        }}
        style={{ textAlign: 'center' }}
        tabIndex={0}
        role="button"
      >
        <div className="icon bu-rounded bu-hover-bright">
          <Reload />
        </div>
      </div>
      <div
        className="bu-calendar-col bup-8 bup-x16"
        onClick={next}
        style={{ textAlign: 'center' }}
        tabIndex={0}
        role="button"
      >
        <div className="icon bu-rounded bu-hover-bright">
          <ArrowRight />
        </div>
      </div>
    </div>
  );
}

export default CalendarHeader;
