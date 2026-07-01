import React from 'react';
import { NumberSelect } from '../FormItems';
import { t } from '../../../intl';
import { HouseType, BookingFormConfigurationType } from '../../../types';

interface Props {
  bookingFormConfiguration: BookingFormConfigurationType;
  house: HouseType;
}

export default function Guests({
  bookingFormConfiguration,
  house
}: Props): React.ReactNode {
  return (
    <>
      <NumberSelect
        name="adults"
        label="adults"
        count={house.persons}
        description={
          <div className="age-description">
            {t('adults_from', { age: bookingFormConfiguration.adults_from_age })}
          </div>
        }
      />
      {!bookingFormConfiguration.children_allowed ? null : (
        <NumberSelect
          name="children"
          label="children"
          count={house.persons - 1}
          description={
            <div className="age-description">
              {t('children_from', {
                from: bookingFormConfiguration.children_from_age,
                til: bookingFormConfiguration.children_till_age
              })}
            </div>
          }
        />
      )}
      {!bookingFormConfiguration.babies_allowed ? null : (
        <NumberSelect
          name="babies"
          label="babies"
          count={house.persons - 1}
          description={
            <div className="age-description">
              {t('babies_from', {
                babies: bookingFormConfiguration.babies_till_age
              })}
            </div>
          }
        />
      )}
    </>
  );
}
