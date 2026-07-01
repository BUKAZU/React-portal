import React, { createContext, useContext } from 'react';
import { byString } from './formParts/BookingHelpers';
import { PossibleValues } from './formParts/form_types';

export type BookingFormErrors = Record<string, string | undefined>;
export interface BookingFormTouched {
  [key: string]: boolean | BookingFormTouched | undefined;
}

export interface BookingFormContextValue {
  values: PossibleValues;
  errors: BookingFormErrors;
  touched: BookingFormTouched;
  isSubmitting: boolean;
  setFieldValue: (name: string, value: unknown) => void;
  setFieldTouched: (name: string, touched?: boolean) => void;
}

const defaultBookingFormContextValue: BookingFormContextValue = {
  values: {
    arrivalDate: {} as PossibleValues['arrivalDate'],
    departureDate: {} as PossibleValues['departureDate'],
    is_option: 'false',
    costs: {},
    adults: 0,
    children: 0,
    babies: 0,
    persons: 0,
    discount: 0,
    country: '',
    cancel_insurance: '0',
    discount_code: '',
    extra_fields: {}
  },
  errors: {},
  touched: {},
  isSubmitting: false,
  setFieldValue: () => undefined,
  setFieldTouched: () => undefined
};

export const BookingFormContext = createContext<BookingFormContextValue>(
  defaultBookingFormContextValue
);

export function useBookingFormContext(): BookingFormContextValue {
  return useContext(BookingFormContext);
}

export function useBookingField(name: string) {
  const { values, errors, touched, setFieldValue, setFieldTouched } =
    useBookingFormContext();

  const directError = errors[name];
  const nestedError = byString(errors, name);
  const fieldError =
    typeof directError === 'string'
      ? directError
      : typeof nestedError === 'string'
        ? nestedError
        : undefined;

  const directTouched = touched[name];
  const nestedTouched = byString(touched, name);
  const isTouched =
    typeof directTouched === 'boolean'
      ? directTouched
      : typeof nestedTouched === 'boolean'
        ? nestedTouched
        : false;

  const fieldValue = byString(values, name);

  return {
    error: fieldError,
    touched: isTouched,
    value: fieldValue ?? '',
    onBlur: () => setFieldTouched(name, true),
    onChange: (
      event: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >
    ) => {
      setFieldValue(name, event.target.value);
    }
  };
}
