import React from 'react';
import { HouseType } from '../../../types';
import PriceField from '../PriceField';

interface Props {
  house: HouseType;
}

/** Sticky wrapper for the stay bar; `position: sticky` lives on this element. */
function StartBooking({ house }: Props): JSX.Element {
  return (
    <div className="price-overview bu-stay-bar-wrap">
      <PriceField house={house} />
    </div>
  );
}

export default StartBooking;
