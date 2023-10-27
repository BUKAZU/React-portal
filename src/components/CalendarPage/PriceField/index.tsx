import React, { useContext, useState } from 'react';
import {
  FormatIntl,
  LONG_DATE_FORMAT,
  Parse_EN_US
} from '../../../_lib/date_helper';
import { FormattedMessage } from 'react-intl';
import { createPeronsArray } from '../formParts/BookingHelpers';
import Price from './Price';
import { HouseType } from '../../../types';
import {
  CalendarContext,
  CalendarContextDispatch
} from '../CalendarParts/CalendarContext';

const dateFormat = LONG_DATE_FORMAT;

interface Props {
  house: HouseType;
}

function PriceField({ house }: Props) {
  const defaultMaxPersons = house.persons > 2 ? 2 : house.persons;
  const [persons, setPersons] = useState(defaultMaxPersons);

  const { arrivalDate, departureDate } = useContext(CalendarContext);
  const dispatch = useContext(CalendarContextDispatch);

  let adults = createPeronsArray(house.persons);


  return (
    <div className="calendar--picker">
      <div className="calendar--picker--date">
        <span className="name">
          <FormattedMessage id={`${house.house_type}.arrival`} />
        </span>
        <span className="detail">
          {arrivalDate?.date ? (
            <span>
              {FormatIntl(Parse_EN_US(arrivalDate?.date), dateFormat)}
            </span>
          ) : (
            <FormattedMessage
              id={`${house.house_type}.pick_your_arrivaldate_in_the_calendar`}
            />
          )}
        </span>
      </div>
      <div className="calendar--picker--date">
        <span className="name">
          <FormattedMessage id={`${house.house_type}.departure`} />
        </span>
        <span className="detail">
          {departureDate?.date ? (
            <span>
              {FormatIntl(Parse_EN_US(departureDate?.date), dateFormat)}
            </span>
          ) : (
            <div>
              <div>
                <FormattedMessage
                  id={`${house.house_type}.pick_your_departure_in_the_calendar`}
                />
              </div>
              {arrivalDate && (
                <FormattedMessage
                  id="minimum_nights"
                  defaultMessage="Minimum {minimum} nights"
                  values={{ minimum: arrivalDate?.min_nights }}
                />
              )}
            </div>
          )}
        </span>
      </div>
      <div className="calendar--picker--date">
        <span className="detail">
          <select
            className="calendar--picker--persons"
            value={persons}
            onChange={(e) => {
              setPersons(e.target.value);
            }}
          >
            {adults.map((person) => (
              <FormattedMessage
                id="persons"
                key={person}
                children={(text) => (
                  <option value={person} key={person}>
                    {person} {text}
                  </option>
                )}
              />
            ))}
          </select>
        </span>
      </div>
      <div className="calendar--picker--date">
        {arrivalDate && departureDate && (
          <Price
            persons={parseInt(persons)}
            variables={{
              starts_at: arrivalDate?.date,
              ends_at: departureDate?.date
            }}
          />
        )}
      </div>
      <button
        className="button"
        disabled={!arrivalDate || !departureDate}
        onClick={() => {
          if (arrivalDate && departureDate) {
            dispatch({
              type: 'start',
              persons
            });
          }
        }}
      >
        <FormattedMessage id="calculate" />
      </button>
    </div>
  );
}

export default PriceField;
