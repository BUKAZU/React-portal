import React from 'react';
import { NumberSelect } from '../FormItems';
import { t } from '../../../intl';
import { HouseType, PortalOptions } from '../../../types';

interface Props {
  options: PortalOptions;
  house: HouseType;
}

export default function Guests({ options, house }: Props): React.ReactNode {
  return (
    <>
      <NumberSelect
        name="adults"
        label="adults"
        count={house.persons}
        description={
          <div className="age-description">
            {t('adults_from', {
              age: options.bookingForm
                ? options.bookingForm.adults_from || '18'
                : '18'
            })}
          </div>
        }
      />
      {options.bookingForm && !options.bookingForm.children ? null : (
        <NumberSelect
          name="children"
          label="children"
          count={house.persons - 1}
          description={
            <div className="age-description">
              {t('children_from', {
                from: options.bookingForm
                  ? options.bookingForm.children_from || '3'
                  : '3',
                til: options.bookingForm
                  ? options.bookingForm.children_til || '17'
                  : '17'
              })}
            </div>
          }
        />
      )}
      {options.bookingForm && !options.bookingForm.babies ? null : (
        <NumberSelect
          name="babies"
          label="babies"
          count={house.persons - 1}
          description={
            <div className="age-description">
              {t('babies_from', {
                babies: options.bookingForm
                  ? options.bookingForm.babies_til || '2'
                  : '2'
              })}
            </div>
          }
        />
      )}
    </>
  );
}
