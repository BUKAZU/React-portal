import React from 'react';
import { t } from '../../../intl';
import {
  differenceInCalendarDays,
  FormatIntl,
  Parse_EN_US
} from '../../../_lib/date_helper';
import Calendar from '../../icons/Calendar.svg';
import Image from '../../icons/Image.svg';
import { HouseType } from '../../../types';
import { PossibleValues } from '../formParts/form_types';

const SHORT_DATE_FORMAT: Intl.DateTimeFormatOptions = {
  weekday: 'short',
  day: 'numeric',
  month: 'short'
};

interface Props {
  house: HouseType;
  values: PossibleValues;
  /** Reopens the calendar; the link is left out when not provided. */
  onChangeDates?: () => void;
}

/** The accommodation and the chosen stay at the top of the summary column. */
function StayCard({ house, values, onChangeDates }: Props): JSX.Element {
  const { arrivalDate, departureDate } = values;
  const arrival = Parse_EN_US(arrivalDate.date);
  const departure = Parse_EN_US(departureDate.date);
  const nights = differenceInCalendarDays(departure, arrival);
  const times = [
    arrivalDate.arrival_time_from && arrivalDate.arrival_time_to
      ? `${t(`${house.house_type}.arrival`)} ${arrivalDate.arrival_time_from} - ${arrivalDate.arrival_time_to}`
      : null,
    departureDate.departure_time
      ? `${t(`${house.house_type}.departure`)} ${departureDate.departure_time}`
      : null
  ].filter((time): time is string => time !== null);

  return (
    <div className="house-details bu-stay-card">
      <h2 className="bu-visually-hidden">{t('booking_details')}</h2>
      <div className="bu-stay-card-house">
        {house.image_url ? (
          <img src={house.image_url} alt="" className="bu-stay-card-image" />
        ) : (
          <div className="bu-stay-card-image bu-stay-card-placeholder">
            <Image />
          </div>
        )}
        <div className="bu-stay-card-name">{house.name}</div>
      </div>
      <div className="bu-stay-card-dates">
        <div className="bu-stay-card-row">
          <span className="bu-stay-card-range">
            <Calendar />
            {FormatIntl(arrival, SHORT_DATE_FORMAT)} →{' '}
            {FormatIntl(departure, SHORT_DATE_FORMAT)}
          </span>
          {onChangeDates && (
            <button
              type="button"
              className="bu-link-button"
              onClick={onChangeDates}
            >
              {t('change_dates')}
            </button>
          )}
        </div>
        <div className="bu-stay-card-meta">
          <span>{t('nights', { count: nights })}</span>
          <span>
            {values.persons} {t('persons')}
          </span>
        </div>
        {times.length > 0 && (
          <div className="bu-stay-card-meta">
            {times.map((time) => (
              <span key={time}>{time}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default StayCard;
