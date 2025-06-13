import { useQuery } from '@apollo/client';
import {
  addMonths,
  endOfMonth,
  endOfWeek,
  startOfMonth,
  startOfWeek
} from 'date-fns';
import React, { useContext } from 'react';
import { HouseType, PortalSiteType } from '../../../types';
import { CALENDAR_QUERY } from '../../../_lib/queries';
import Loading from '../../icons/loading.svg';
import MonthHeader from './MonthHeader';
import RenderCells from './RenderCells';
import WeekDays from './WeekDays';

interface Props {
  count: number;
  currentMonth: Date;
  house: HouseType;
  numberOfMonthsInARow: Number;
  PortalSite: PortalSiteType;
  locale: string;
  objectCode: string;
}

function SingleMonth({
  count,
  currentMonth,
  house,
  numberOfMonthsInARow,
  PortalSite,
  locale,
  objectCode
}: Props): JSX.Element {
  let month = addMonths(currentMonth, count);
  let monthStart = startOfMonth(month);
  let monthEnd = endOfMonth(month);
  const variables = {
    id: PortalSite.portal_code,
    house_id: objectCode,
    starts_at: startOfWeek(monthStart),
    ends_at: endOfWeek(monthEnd)
  };

  const { loading, error, data } = useQuery(CALENDAR_QUERY, { variables });

  if (loading)
    return (
      <div>
        <Loading />
      </div>
    );
  if (error) {
    return <div>Error</div>;
  }

  const results = data.PortalSite.houses[0].availabilities;
  const discounts = data.Discounts;

  const cells = new RenderCells({
    availabilities: results,
    discounts,
    month,
    house
  }).render();

  return (
    <div
      className={`bu-calendar calendar calendar-${numberOfMonthsInARow}`}
      key={month}
    >
      <MonthHeader month={month} />
      <WeekDays month={month} />
      <div>
        <div ref={(ref) => ref && ref.appendChild(cells)}></div>
        {/* {cells.map((cell, index) => (
        ))} */}
      </div>
    </div>
  );
}

export default SingleMonth;
