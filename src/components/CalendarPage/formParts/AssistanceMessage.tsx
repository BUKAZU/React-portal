import React from 'react';
import { t } from '../../../intl';
import { HouseType } from '../../../types';
import {
  FormatIntl,
  LONG_DATE_FORMAT,
  Parse_EN_US
} from '../../../_lib/date_helper';
import { CalendarContext } from '../CalendarParts/CalendarContext';
import { useContext } from 'react';

function AssistanceMessage({ house }: { house: HouseType }): JSX.Element {
  const { departureDate, arrivalDate } = useContext(CalendarContext);

  if (departureDate?.date) {
    return (
      <div className="bup-16 bu-bold">
        {t(`${house.house_type}.you_picked_arrival_date`)}:{' '}
        {FormatIntl(Parse_EN_US(arrivalDate.date), LONG_DATE_FORMAT)}
        <br />
        {t(`${house.house_type}.you_picked_departure_date`)}
        : {FormatIntl(Parse_EN_US(departureDate.date), LONG_DATE_FORMAT)}
      </div>
    );
  }

  if (arrivalDate?.date) {
    return (
      <div className="bup-16 bu-bold">
        {t(`${house.house_type}.you_picked_arrival_date`)}:{' '}
        {FormatIntl(Parse_EN_US(arrivalDate.date), LONG_DATE_FORMAT)}
        <br />
        {t(`${house.house_type}.pick_your_departure_in_the_calendar`)}
        <br />
        {t('minimum_nights', { minimum: arrivalDate.min_nights })}
      </div>
    );
  }

  return (
    <div className="bup-16 bu-bold">
      {t(`${house.house_type}.pick_your_arrivaldate_in_the_calendar`)}
    </div>
  );
}

export default AssistanceMessage;
