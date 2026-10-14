import React from 'react';
import { HouseType } from '../../../types';

import BookingOrOption from '../formParts/BookingOrOption';
import { PossibleValues } from '../formParts/form_types';
import CostSummary from './CostSummary';
import { PricesType } from './cost_types';
import StayCard from './StayCard';

interface Props {
  values: PossibleValues;
  house: HouseType;
  /** Reopens the calendar from the stay card. */
  onChangeDates?: () => void;
  /** Reports the latest price calculation (null while loading or failed). */
  onPrices?: (prices: PricesType | null) => void;
}

function Summary({
  values,
  house,
  onChangeDates,
  onPrices
}: Props): JSX.Element {
  return (
    <div className="bu-summary">
      <StayCard house={house} values={values} onChangeDates={onChangeDates} />
      <BookingOrOption house={house} />
      <CostSummary values={values} house={house} onPrices={onPrices} />
    </div>
  );
}

export default Summary;
