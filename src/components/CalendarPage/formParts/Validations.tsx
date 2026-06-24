import { HouseType } from '../../../types';
import { t } from '../../../intl';
import { byString, calculatePersons, validateAge } from './BookingHelpers';
import { isInt } from './OptionalBookingFields';
import { PossibleValues, SingleBookingFieldType } from './form_types';

export function validateForm(
  values: PossibleValues,
  house: HouseType,
  bookingFields: SingleBookingFieldType[]
): Record<string, string> {
  const { persons } = house;
  const errors: Record<string, string> = {};
  const totalPersons = calculatePersons(house, values);

  for (const field of bookingFields) {
    if (!field.required) {
      continue;
    }

    if (isInt(field.id)) {
      const validateValue = byString(
        values,
        `extra_fields.booking_field_${field.id}`
      );

      if (!validateValue || validateValue === '') {
        errors[field.id] = t('required');
      }

      continue;
    }

    const validateValue = byString(values, field.id);

    if (!validateValue || validateValue === '') {
      errors[field.id] = t('required');
    }
  }

  if (values.adults < 1 && persons > 0) {
    errors.adults = t('at_least_1_adult');
  }

  if (Number(values.discount) > 0 && !values.discount_reason) {
    errors.discount_reason = t('you_need_to_give_reason');
  }

  if (totalPersons > persons) {
    errors.max_persons = t('max_persons_reached');
  }

  const dateOfBirth = values.extra_fields?.date_of_birth;

  if (
    values.cancel_insurance !== '0' &&
    dateOfBirth &&
    validateAge(dateOfBirth)
  ) {
    errors['extra_fields.date_of_birth'] = t('at_least_18y_old');
    errors.insurances = t('at_least_18y_old');
  }

  return errors;
}
