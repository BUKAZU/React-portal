import React from 'react';
import { NumberSelect } from '../FormItems';
import { FormattedMessage } from 'react-intl';
import { BookingFormConfiguration, HouseType } from '../../../types';

interface Props {
  bookingFormConfiguration: BookingFormConfiguration;
  house: HouseType;
}

export default function Guests({ bookingFormConfiguration, house }: Props): React.ReactNode {
  return (
    <>
      <NumberSelect
        name="adults"
        label="adults"
        count={house.persons}
        description={
          <div className="age-description">
            <FormattedMessage
              id="adults_from"
              defaultMessage="> {age}"
              values={{ age: bookingFormConfiguration.adultsFromAge }}
            />
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
              <FormattedMessage
                id="children_from"
                defaultMessage="{from} - {til}"
                values={{
                  from: bookingFormConfiguration.childrenFromAge,
                  til: bookingFormConfiguration.childrenTillAge
                }}
              />
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
              <FormattedMessage
                id="babies_from"
                defaultMessage="til {babies_til}"
                values={{ babies: bookingFormConfiguration.babiesTillAge }}
              />
            </div>
          }
        />
      )}
    </>
  );
}
