import React from 'react';
import { t } from '../../../intl';

interface Props {
  house: {
    house_type: string;
  };
}

/** The four portal colours as pills: arrival, booked, departure, discount. */
function Legend({ house }: Props): JSX.Element {
  return (
    <div className="legend bu-legend">
      <div className="bu-legend-item">
        <span className="legend-field bu-legend-swatch arrival" />
        {t(`${house.house_type}.arrival_date`)}
      </div>
      <div className="bu-legend-item">
        <span className="legend-field bu-legend-swatch booked" />
        {t('booked')}
      </div>
      <div className="bu-legend-item">
        <span className="legend-field bu-legend-swatch departure" />
        {t(`${house.house_type}.departure_date`)}
      </div>
      <div className="bu-legend-item">
        <span className="legend-field bu-legend-swatch last_minute_discount" />
        {t('discount')}
      </div>
    </div>
  );
}

export default Legend;
