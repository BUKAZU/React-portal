import { addMonths, format } from 'date-fns';
import React from 'react';
import { HouseType, PortalSiteType } from '../../../types';
import SingleMonth from './SingleMonth';

interface Props {
  house: HouseType;
  numberOfMonths: number;
  numberOfMonthsInARow: number;
  currentMonth: Date;
  PortalSite: PortalSiteType;
  locale: string;
  objectCode: string;
}

function Months({
  numberOfMonthsInARow,
  currentMonth,
  numberOfMonths,
  PortalSite,
  locale,
  objectCode,
  house
}: Props): JSX.Element {
  let template: JSX.Element[] = [];

  for (let i = 0; i < numberOfMonths; i++) {
    template.push(
      <SingleMonth
        key={format(addMonths(currentMonth, i), 'MM-yyyy')}
        house={house}
        numberOfMonthsInARow={numberOfMonthsInARow}
        currentMonth={currentMonth}
        count={i}
        PortalSite={PortalSite}
        locale={locale}
        objectCode={objectCode}
      />
    );
  }

  return <div className="calendars-row">{template}</div>;
}

export default Months;
