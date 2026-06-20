import {
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  startOfMonth,
  startOfWeek
} from 'date-fns';
import React, { useContext, useEffect, useState } from 'react';
import { HouseType } from '../../../types';
import {
  AvailabilityResponse,
  fetchAvailability
} from '../../../_lib/availability';
import { AppContext } from '../../AppContext';
import Loading from '../../icons/loading.svg';
import SingleMonth from './SingleMonth';

interface Props {
  house: HouseType;
  numberOfMonths: number;
  numberOfMonthsInARow: number;
  currentMonth: Date;
}

function Months({
  numberOfMonthsInARow,
  currentMonth,
  numberOfMonths,
  house
}: Props): JSX.Element {
  const { portalCode, objectCode, locale, apiUrl } = useContext(AppContext);

  const [data, setData] = useState<AvailabilityResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Fetch the whole visible range in a single REST call (one request instead of
  // one per month). Re-runs when the range or accommodation changes.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    const startsDate = startOfWeek(startOfMonth(currentMonth));
    const endDate = endOfWeek(
      endOfMonth(addMonths(currentMonth, numberOfMonths - 1))
    );

    fetchAvailability({
      apiUrl,
      locale,
      portalCode,
      objectCode,
      startsDate,
      endDate
    })
      .then((result) => {
        if (!cancelled) {
          setData(result);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [apiUrl, locale, portalCode, objectCode, currentMonth, numberOfMonths]);

  if (loading)
    return (
      <div>
        <Loading />
      </div>
    );
  if (error || !data) {
    return <div>Error</div>;
  }

  let template: JSX.Element[] = [];

  for (let i = 0; i < numberOfMonths; i++) {
    template.push(
      <SingleMonth
        key={format(addMonths(currentMonth, i), 'MM-yyyy')}
        house={house}
        currentMonth={currentMonth}
        count={i}
        availabilities={data.availabilities}
        discounts={data.discounts}
      />
    );
  }

  return (
    <div
      className={`bu-grid bu-grid-cols-${numberOfMonthsInARow || 2} bu-gap-16`}
    >
      {template}
    </div>
  );
}

export default Months;
