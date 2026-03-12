import React from 'react';
import { t } from '../../../intl';

interface Props {
  house: {
    house_type: string;
  };
}

function Legend({ house }: Props): JSX.Element {
  return (
    <div className="legend">
      <div>
        <span className="legend-field arrival" />
        {t(`${house.house_type}.arrival_date`)}
      </div>
      <div>
        <span className="legend-field booked" />
        {t('booked')}
      </div>
      <div>
        <span className="legend-field departure" />
        {t(`${house.house_type}.departure_date`)}
      </div>
      <div>
        <span className="legend-field last_minute_discount" />
        {t('discount')}
      </div>
    </div>
  );
}

export default Legend;
