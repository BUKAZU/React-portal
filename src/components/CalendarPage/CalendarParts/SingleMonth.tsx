import { useQuery } from '@apollo/client';
import {
  addMonths,
  endOfMonth,
  endOfWeek,
  startOfMonth,
  startOfWeek
} from 'date-fns';
import React, { useContext } from 'react';
import { HouseType } from '../../../types';
import { CALENDAR_QUERY } from '../../../_lib/queries';
import { AppContext } from '../../AppContext';
import Loading from '../../icons/loading.svg';
import MonthHeader from './MonthHeader';
import RenderCells from './RenderCells';
import WeekDays from './WeekDays';

interface Props {
  count: number;
  currentMonth: Date;
  house: HouseType;
  numberOfMonthsInARow: Number;
}

function SingleMonth({
  count,
  currentMonth,
  house,
  numberOfMonthsInARow
}: Props): JSX.Element {
  const { portalCode, objectCode } = useContext(AppContext);

  let month = addMonths(currentMonth, count);
  let monthStart = startOfMonth(month);
  let monthEnd = endOfMonth(month);
  const variables = {
    id: portalCode,
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

  return (
    <div className={`bu-calendar calendar calendar-${numberOfMonthsInARow}`} key={month}>
      <MonthHeader month={month} />
      <WeekDays month={month} />
      <RenderCells
        availabilities={results}
        discounts={discounts}
        month={month}
        house={house}
      />
    </div>
  );
}

export default SingleMonth;
