import React from 'react';
import { t } from '../../../intl';
import { HouseType } from '../../../types';
import {
  differenceInCalendarDays,
  FormatIntl,
  LONG_DATE_FORMAT,
  Parse_EN_US
} from '../../../_lib/date_helper';
import { CalendarContext } from '../CalendarParts/CalendarContext';
import { useContext } from 'react';

/**
 * One line above the months: what to do next, with the chosen dates as the
 * muted hint.
 */
function AssistanceMessage({ house }: { house: HouseType }): JSX.Element {
  const { departureDate, arrivalDate } = useContext(CalendarContext);

  if (departureDate?.date && arrivalDate?.date) {
    const arrival = Parse_EN_US(arrivalDate.date);
    const departure = Parse_EN_US(departureDate.date);
    return (
      <div className="bu-assistance" role="status">
        <span className="bu-assistance-title">
          {FormatIntl(arrival, LONG_DATE_FORMAT)} →{' '}
          {FormatIntl(departure, LONG_DATE_FORMAT)}
        </span>
        <span className="bu-assistance-hint">
          {t('nights', { count: differenceInCalendarDays(departure, arrival) })}
        </span>
      </div>
    );
  }

  if (arrivalDate?.date) {
    return (
      <div className="bu-assistance" role="status">
        <span className="bu-assistance-title">
          {t(`${house.house_type}.pick_your_departure_in_the_calendar`)}
        </span>
        <span className="bu-assistance-hint">
          {t(`${house.house_type}.you_picked_arrival_date`)}{' '}
          {FormatIntl(Parse_EN_US(arrivalDate.date), LONG_DATE_FORMAT)} ·{' '}
          {t('minimum_nights', { minimum: arrivalDate.min_nights })}
        </span>
      </div>
    );
  }

  return (
    <div className="bu-assistance" role="status">
      <span className="bu-assistance-title">
        {t(`${house.house_type}.pick_your_arrivaldate_in_the_calendar`)}
      </span>
    </div>
  );
}

export default AssistanceMessage;
