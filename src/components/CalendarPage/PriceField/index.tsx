import React, { useContext, useState } from 'react';
import {
  differenceInCalendarDays,
  FormatIntl,
  LONG_DATE_FORMAT,
  Parse_EN_US
} from '../../../_lib/date_helper';
import { t } from '../../../intl';
import { createPersonsArray } from '../formParts/BookingHelpers';
import CurrencySelector from '../../CurrencySelector';
import Arrow from '../../icons/Arrow.svg';
import Price from './Price';
import { HouseType } from '../../../types';
import {
  CalendarContext,
  CalendarContextDispatch
} from '../CalendarParts/CalendarContext';

interface Props {
  house: HouseType;
}

/**
 * The stay bar under the calendar: arrival, departure, nights, persons, price
 * and Next. It is visible from the start (the empty slots say what to do) and
 * Next only enables once both dates are chosen.
 */
function PriceField({ house }: Props) {
  const defaultMaxPersons = house.persons > 2 ? 2 : house.persons;
  const [persons, setPersons] = useState(defaultMaxPersons);

  const { arrivalDate, departureDate } = useContext(CalendarContext);
  const dispatch = useContext(CalendarContextDispatch);

  const adults = createPersonsArray(house.persons);
  const complete = Boolean(arrivalDate && departureDate);
  const nights =
    arrivalDate && departureDate
      ? differenceInCalendarDays(
          Parse_EN_US(departureDate.date),
          Parse_EN_US(arrivalDate.date)
        )
      : 0;

  return (
    <div className="calendar--picker bu-stay-bar">
      <div className="bu-stay-bar-dates">
        <div className="bu-stay-slot">
          <span className="bu-stay-slot-label">
            {t(`${house.house_type}.arrival`)}
          </span>
          <span
            className={`bu-stay-slot-value${arrivalDate ? '' : ' bu-empty'}`}
          >
            {arrivalDate
              ? FormatIntl(Parse_EN_US(arrivalDate.date), LONG_DATE_FORMAT)
              : t(`${house.house_type}.pick_your_arrivaldate_in_the_calendar`)}
          </span>
        </div>
        <span className="bu-stay-arrow" aria-hidden="true">
          <Arrow size={18} />
        </span>
        <div className="bu-stay-slot">
          <span className="bu-stay-slot-label">
            {t(`${house.house_type}.departure`)}
          </span>
          <span
            className={`bu-stay-slot-value${departureDate ? '' : ' bu-empty'}`}
          >
            {departureDate
              ? FormatIntl(Parse_EN_US(departureDate.date), LONG_DATE_FORMAT)
              : arrivalDate
                ? t(`${house.house_type}.pick_your_departure_in_the_calendar`)
                : '—'}
          </span>
        </div>
        {complete ? (
          <span className="bu-pill bu-stay-nights">
            {t('nights', { count: nights })}
          </span>
        ) : arrivalDate ? (
          <span className="bu-stay-nights bu-stay-nights-empty">
            {t('minimum_nights', { minimum: arrivalDate.min_nights })}
          </span>
        ) : null}
        <label className="bu-stay-persons">
          <span className="bu-visually-hidden">{t('persons')}</span>
          <select
            className="calendar--picker--persons"
            value={persons}
            disabled={!complete}
            onChange={(e) => {
              setPersons(Number(e.target.value));
            }}
          >
            {adults.map((person) => (
              <option value={person} key={person}>
                {person} {t('persons')}
              </option>
            ))}
          </select>
        </label>
        <CurrencySelector />
      </div>
      <div className="bu-stay-bar-actions">
        {arrivalDate && departureDate ? (
          <Price
            persons={persons}
            variables={{
              starts_at: arrivalDate.date,
              ends_at: departureDate.date
            }}
          />
        ) : (
          <div className="bu-stay-price bu-empty">
            <div className="bu-stay-price-value">—</div>
            <div className="bu-stay-price-hint">{t('price_follows_dates')}</div>
          </div>
        )}
        {arrivalDate && (
          <button
            type="button"
            className="bu-link-button bu-stay-clear"
            onClick={() => dispatch({ type: 'reset' })}
          >
            {t('clear_dates')}
          </button>
        )}
        <button
          type="button"
          className="button bu-stay-next"
          disabled={!complete}
          onClick={() => {
            if (arrivalDate && departureDate) {
              dispatch({
                type: 'start',
                persons
              });
            }
          }}
        >
          {t('calculate')}
          <Arrow />
        </button>
      </div>
    </div>
  );
}

export default PriceField;
