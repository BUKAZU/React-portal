import React from 'react';
import { FormattedMessage } from 'react-intl';

interface Props {
  house: {
    house_type: string;
  };
}

function Legend({ house }: Props): JSX.Element {
  return (
    <div className="flex gap-2 p-4">
      <div className="arrival p-2 text-xs font-normal">
        <FormattedMessage id={`${house.house_type}.arrival_date`} />
      </div>
      <div className="booked p-2 text-xs font-normal">
        <FormattedMessage id="booked" />
      </div>
      <div className="departure p-2 text-xs font-normal">
        <FormattedMessage id={`${house.house_type}.departure_date`} />
      </div>
      <div className="discount p-2 text-xs font-normal">
        <FormattedMessage id="discount" />
      </div>
    </div>
  );
}

export default Legend;
