import React from 'react';
import { HouseType } from '../../../types';

import BookingOrOption from '../formParts/BookingOrOption';
import { PossibleValues } from '../formParts/form_types';
import CostSummary from './CostSummary';
import { Object } from './Object';

interface Props {
  values: PossibleValues;
  house: HouseType;
}

function Summary({ values, house }: Props): React.ReactNode {
  return (
    <div className="space-y-4 rounded-lg border border-gray-100 bg-gray-50 p-6">
      <Object house={house} values={values} />
      <BookingOrOption house={house} />
      <CostSummary values={values} house={house} />
    </div>
  );
}

export default Summary;
