import React from 'react';
import { NumberSelect } from '../FormItems';
import { t } from '../../../intl';
import { HouseType, BookingFormConfiguration } from '../../../types';

interface Props {
  bookingFormConfiguration: BookingFormConfiguration;
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
            {t('adults_from', {
              age: bookingFormConfiguration.adultsFromAge
            })}
          </div>
        }
      />
      {!bookingFormConfiguration.childrenAllowed ? null : (
        <NumberSelect
          name="children"
          label="children"
          count={house.persons - 1}
          description={
            <div className="age-description">
              {t('children_from', {
                from: bookingFormConfiguration.childrenFromAge,
                til: bookingFormConfiguration.childrenTillAge
              })}
            </div>
          }
        />
      )}
      {!bookingFormConfiguration.babiesAllowed ? null : (
        <NumberSelect
          name="babies"
          label="babies"
          count={house.persons - 1}
          description={
            <div className="age-description">
              {t('babies_from', {
                babies: bookingFormConfiguration.babiesTillAge
              })}
            </div>
          }
        />
      )}
    </>
  );
}
