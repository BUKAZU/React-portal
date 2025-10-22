import React, { useContext } from 'react';
import { FormattedMessage } from 'react-intl';
import { HouseType } from '../../../types';
import {
  FormatIntl,
  LONG_DATE_FORMAT,
  Parse_EN_US
} from '../../../_lib/date_helper';
import { CalendarContext } from '../CalendarParts/CalendarContext';

interface Props {
  house: HouseType;
}

function AssistanceMessage({ house }: Props): JSX.Element {
  const { departureDate, arrivalDate } = useContext(CalendarContext);

  if (departureDate?.date) {
    return (
      <div className="bup-16 bu-bold">
        <FormattedMessage id={`${house.house_type}.you_picked_arrival_date`} />:{' '}
        {FormatIntl(Parse_EN_US(arrivalDate.date), LONG_DATE_FORMAT)}
        <br />
        <FormattedMessage
          id={`${house.house_type}.you_picked_departure_date`}
        />
        : {FormatIntl(Parse_EN_US(departureDate.date), LONG_DATE_FORMAT)}
      </div>
    );
  }

  if (arrivalDate?.date) {
    return (
      <div className="bup-16 bu-bold">
        <FormattedMessage id={`${house.house_type}.you_picked_arrival_date`} />:{' '}
        {FormatIntl(Parse_EN_US(arrivalDate.date), LONG_DATE_FORMAT)}
        <br />
        <FormattedMessage
          id={`${house.house_type}.pick_your_departure_in_the_calendar`}
        />
        <br />
        <FormattedMessage
          id="minimum_nights"
          values={{ minimum: arrivalDate.min_nights }}
          defaultMessage="Minimum {minimum} nights"
        />
      </div>
    );
  }

  return (
    <div className="bup-16 bu-bold">
      <FormattedMessage
        id={`${house.house_type}.pick_your_arrivaldate_in_the_calendar`}
      />
    </div>
  );
}

export default AssistanceMessage;
