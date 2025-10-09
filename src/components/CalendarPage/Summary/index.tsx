import React, { useRef, useEffect } from 'react';
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
  const objectDetailsRef = useRef<ObjectDetails | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize ObjectDetails once
  if (!objectDetailsRef.current) {
    objectDetailsRef.current = new ObjectDetails(house, values);
  }

  // Update values when they change
  useEffect(() => {
    if (objectDetailsRef.current) {
      objectDetailsRef.current.updateValues(values);
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
        containerRef.current.appendChild(objectDetailsRef.current.render());
      }
    }
  }, [values, house]);

  return (
    <div>
      <div ref={containerRef} />
      <BookingOrOption house={house} />
      <CostSummary values={values} house={house} />
    </div>
  );
}

export default Summary;
