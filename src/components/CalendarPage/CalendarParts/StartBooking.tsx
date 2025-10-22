import React from 'react';
import { HouseType } from '../../../types';
import PriceField from '../PriceField';

interface Props {
  house: HouseType;
}

function StartBooking({ house }: Props): JSX.Element {
  return (
    <div className="price-overview bup-16">
      <PriceField house={house} />
    </div>
  );
}

export default StartBooking;
