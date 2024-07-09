import React from 'react';
import { FormattedMessage } from 'react-intl';
import { HouseType } from '../../../types';
import { byString, validateAge } from './BookingHelpers';
import { isInt } from './OptionalBookingFields';

export function validateForm(
  values: object,
  house: HouseType,
  bookingFields: []
): [] {
  const { babies_extra, persons } = house;

  let errors = {};

  let babies = Number(values.babies) - Number(babies_extra);
  if (babies < 0) {
    babies = 0;
  }
  values.persons = Number(values.children) + Number(values.adults) + babies;

  for (let field of bookingFields) {
    if (field.required) {
      if (isInt(field.id)) {
        const validateValue = byString(
          values,
          `extra_fields.booking_field_${field.id}`
        );

        if (!validateValue || validateValue === '') {
          errors[field.id] = <FormattedMessage id="required" />;
        }
      } else {
        const validateValue = byString(values, field.id);

        if (!validateValue || validateValue === '') {
          errors[field.id] = <FormattedMessage id="required" />;
        }
      }
    }
  }

  if (values.adults < 1 && persons > 0) {
    errors.adults = <FormattedMessage id="at_least_1_adult" />;
  }
  if (Number(values.discount) > 0 && !values.discount_reason) {
    errors.discount_reason = <FormattedMessage id="you_need_to_give_reason" />;
  }
  if (values.persons > persons) {
    errors.max_persons = <FormattedMessage id="max_persons_reached" />;
  }

  if (
    values.cancel_insurance !== 0 &&
    validateAge(values.extra_fields?.date_of_birth)
  ) {
    errors['extra_fields.date_of_birth'] = (
      <FormattedMessage id="at_least_18y_old" />
    );
    errors['insurances'] = <FormattedMessage id="at_least_18y_old" />;
  }

  return errors;
}
