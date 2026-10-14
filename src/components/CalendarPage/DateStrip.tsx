import React, { useContext } from 'react';
import { t } from '../../intl';
import {
  differenceInCalendarDays,
  FormatIntl,
  LONG_DATE_FORMAT,
  Parse_EN_US
} from '../../_lib/date_helper';
import Arrow from '../icons/Arrow.svg';
import Calendar from '../icons/Calendar.svg';
import Edit from '../icons/Edit.svg';
import { CalendarContext } from './CalendarParts/CalendarContext';

interface Props {
  house: { house_type: string };
  persons: number;
  /** Opens the calendar to change the dates. */
  onChange: () => void;
}

/**
 * The chosen stay as a strip of pills above the booking form: arrival,
 * departure, nights and persons. The date pills and "Change dates" reopen the
 * calendar.
 */
function DateStrip({ house, persons, onChange }: Props): JSX.Element | null {
  const { arrivalDate, departureDate } = useContext(CalendarContext);

  if (!arrivalDate || !departureDate) {
    return null;
  }

  const arrival = Parse_EN_US(arrivalDate.date);
  const departure = Parse_EN_US(departureDate.date);
  const nights = differenceInCalendarDays(departure, arrival);

  const datePill = (label: string, date: Date) => (
    <button type="button" className="bu-date-pill" onClick={onChange}>
      <Calendar />
      <span className="bu-date-pill-text">
        <span className="bu-date-pill-label">{label}</span>
        <span className="bu-date-pill-value">
          {FormatIntl(date, LONG_DATE_FORMAT)}
        </span>
      </span>
    </button>
  );

  return (
    <div className="bu-date-strip">
      <div className="bu-date-strip-dates">
        {datePill(t(`${house.house_type}.arrival`), arrival)}
        <span className="bu-date-strip-arrow" aria-hidden="true">
          <Arrow size={18} />
        </span>
        {datePill(t(`${house.house_type}.departure`), departure)}
        <span className="bu-pill">{t('nights', { count: nights })}</span>
        <span className="bu-pill">
          {persons} {t('persons')}
        </span>
      </div>
      <button
        type="button"
        className="bu-link-button bu-date-strip-change"
        onClick={onChange}
      >
        <Edit />
        {t('change_dates')}
      </button>
    </div>
  );
}

export default DateStrip;
