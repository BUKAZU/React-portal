import React from 'react';
import { NumberSelect } from '../FormItems';
import { FormattedMessage } from 'react-intl';
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
          <div className="mt-2 text-sm text-gray-500 ">
            <FormattedMessage
              id="adults_from"
              defaultMessage="> {age}"
              values={{
                age: options.bookingForm
                  ? options.bookingForm.adults_from || '18'
                  : '18'
              }}
            />
          </div>
        }
      />
      {options.bookingForm && !options.bookingForm.children ? null : (
        <NumberSelect
          name="children"
          label="children"
          count={house.persons - 1}
          description={
            <div className="mt-2 text-sm text-gray-500 ">
              <FormattedMessage
                id="children_from"
                defaultMessage="{from} - {til}"
                values={{
                  from: options.bookingForm
                    ? options.bookingForm.children_from || '3'
                    : '3',
                  til: options.bookingForm
                    ? options.bookingForm.children_til || '17'
                    : '17'
                }}
              />
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
            <div className="mt-2 text-sm text-gray-500 ">
              <FormattedMessage
                id="babies_from"
                defaultMessage="til {babies_til}"
                values={{
                  babies: options.bookingForm
                    ? options.bookingForm.babies_til || '2'
                    : '2'
                }}
              />
            </div>
          }
        />
      )}
    </>
  );
}
