import React from 'react';
import { HouseType } from '../../../types';

import BookingOrOption from '../formParts/BookingOrOption';
import { PossibleValues } from '../formParts/form_types';
import CostSummary from './CostSummary';
import ObjectDetails from './Object';

interface Props {
  values: PossibleValues;
  house: HouseType;
}

function Summary({ values, house }: Props): React.ReactNode {
  const objectDetails = new ObjectDetails(house, values);
  return (
    <div>
      <div ref={(ref) => ref && ref.appendChild(objectDetails.render())}></div>
      <BookingOrOption house={house} />
      <CostSummary values={values} house={house} />
    </div>
  );
}

export default Summary;
