import React, { useContext, useEffect, useState } from 'react';
import { t } from '../../intl';
import { startOfMonth } from '../../_lib/date_helper';
import { BuDate, HouseType } from '../../types';
import {
  CalendarContext,
  CalendarContextDispatch,
  CalendarProvider
} from './CalendarParts/CalendarContext';
import Legend from './CalendarParts/Legend';
import Months from './CalendarParts/Months';
import AssistanceMessage from './formParts/AssistanceMessage';

interface Props {
  house: HouseType;
  numberOfMonths: number;
  numberOfMonthsInARow: number;
  onClose: () => void;
}

interface BodyProps {
  house: HouseType;
  numberOfMonths: number;
  numberOfMonthsInARow: number;
  onClose: () => void;
  onApply: (arrivalDate: BuDate, departureDate: BuDate) => void;
}

/**
 * The calendar inside the popover works on its own copy of the dates, so the
 * form keeps its stay until "Done" applies the new one.
 */
function PopoverBody({
  house,
  numberOfMonths,
  numberOfMonthsInARow,
  onClose,
  onApply
}: BodyProps): JSX.Element {
  const { selectedDate, arrivalDate, departureDate } =
    useContext(CalendarContext);
  const [currentMonth, setCurrentMonth] = useState(() =>
    startOfMonth(selectedDate ?? new Date())
  );

  return (
    <>
      <AssistanceMessage house={house} />
      <Months
        house={house}
        numberOfMonths={numberOfMonths}
        numberOfMonthsInARow={numberOfMonthsInARow}
        currentMonth={currentMonth}
        changeMonth={setCurrentMonth}
      />
      <div className="bu-popover-footer">
        <Legend house={house} />
        <div className="bu-popover-actions">
          <button type="button" className="bu-button-ghost" onClick={onClose}>
            {t('close')}
          </button>
          <button
            type="button"
            className="bu-button-primary"
            disabled={!arrivalDate || !departureDate}
            onClick={() => {
              if (arrivalDate && departureDate) {
                onApply(arrivalDate, departureDate);
              }
            }}
          >
            {t('done')}
          </button>
        </div>
      </div>
    </>
  );
}

/**
 * Reopens the calendar under the date strip. Clicking outside or pressing
 * Escape closes it without changes; "Done" hands the new dates to the form.
 */
function DatePopover({
  house,
  numberOfMonths,
  numberOfMonthsInARow,
  onClose
}: Props): JSX.Element {
  const booking = useContext(CalendarContext);
  const dispatch = useContext(CalendarContextDispatch);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <>
      <div className="bu-popover-backdrop" onClick={onClose} />
      <div
        className="bu-popover"
        role="dialog"
        aria-modal="true"
        aria-label={t('change_dates')}
      >
        <CalendarProvider
          initialState={{
            selectedDate: booking.selectedDate,
            arrivalDate: booking.arrivalDate,
            departureDate: booking.departureDate,
            persons: booking.persons,
            bookingStarted: true
          }}
        >
          <PopoverBody
            house={house}
            numberOfMonths={numberOfMonths}
            numberOfMonthsInARow={numberOfMonthsInARow}
            onClose={onClose}
            onApply={(arrivalDate, departureDate) => {
              dispatch({ type: 'set_dates', arrivalDate, departureDate });
              onClose();
            }}
          />
        </CalendarProvider>
      </div>
    </>
  );
}

export default DatePopover;
