import React from 'react';
import { t } from '../../../intl';
import { HouseType } from '../../../types';
import { useBookingField } from '../BookingFormContext';
import { RadioButtonGroup, RadioButton } from './radioButtons';

interface Props {
  house: HouseType;
}

export default function BookingOrOption({ house }: Props): JSX.Element {
  const field = useBookingField('is_option');

  return (
    <>
      {house.allow_option && (
        <div>
          <RadioButtonGroup id="is_option" className="booking_option">
            <RadioButton
              name="is_option"
              value="true"
              currentValue={String(field.value)}
              onChange={field.onChange}
              onBlur={field.onBlur}
              id="true"
              disabled={!house.allow_option}
              label={t('option')}
            />
            <RadioButton
              name="is_option"
              value="false"
              currentValue={String(field.value)}
              onChange={field.onChange}
              onBlur={field.onBlur}
              id="false"
              label={t('booking')}
            />
          </RadioButtonGroup>
        </div>
      )}
    </>
  );
}
