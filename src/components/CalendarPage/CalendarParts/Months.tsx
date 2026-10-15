import {
  addMonths,
  endOfMonth,
  endOfWeek,
  formatDateKey,
  isAfter,
  startOfMonth,
  startOfWeek,
  subMonths
} from '../../../_lib/date_helper';
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
  /** Pages the visible range; omitted when the calendar is not navigable. */
  changeMonth?: (month: Date) => void;
}

function Months({
  numberOfMonthsInARow,
  currentMonth,
  numberOfMonths,
  house,
  changeMonth
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

  // Nothing before the current month can be booked, so that is the floor.
  const prevDisabled = !isAfter(
    startOfMonth(currentMonth),
    startOfMonth(new Date())
  );
  const onPrev = changeMonth
    ? () => changeMonth(subMonths(currentMonth, numberOfMonths))
    : undefined;
  const onNext = changeMonth
    ? () => changeMonth(addMonths(currentMonth, numberOfMonths))
    : undefined;

  let template: JSX.Element[] = [];

  for (let i = 0; i < numberOfMonths; i++) {
    template.push(
      <SingleMonth
        key={formatDateKey(addMonths(currentMonth, i)).slice(0, 7)}
        house={house}
        currentMonth={currentMonth}
        count={i}
        availabilities={data.availabilities}
        discounts={data.discounts}
        onPrev={i === 0 ? onPrev : undefined}
        onNext={i === numberOfMonths - 1 ? onNext : undefined}
        prevDisabled={prevDisabled}
      />
    );
  }

  return (
    <div
      className="bu-months"
      style={
        {
          '--bu-months-per-row': numberOfMonthsInARow || 2
        } as React.CSSProperties
      }
    >
      {template}
    </div>
  );
}

export default Months;
