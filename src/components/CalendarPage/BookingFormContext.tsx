import React, { createContext, useContext } from 'react';
import { byString } from './formParts/BookingHelpers';
import { PossibleValues } from './formParts/form_types';

export type BookingFormErrors = Record<string, string | undefined>;
export type BookingFormTouched = Record<string, boolean | BookingFormTouched>;

export interface BookingFormContextValue {
  values: PossibleValues;
  errors: BookingFormErrors;
  touched: BookingFormTouched;
  isSubmitting: boolean;
  setFieldValue: (name: string, value: unknown) => void;
  setFieldTouched: (name: string, touched?: boolean) => void;
}

export const BookingFormContext = createContext<BookingFormContextValue | null>(
  null
);

export function useBookingFormContext(): BookingFormContextValue {
  const context = useContext(BookingFormContext);

  if (!context) {
    throw new Error('BookingFormContext is not available');
  }

  return context;
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
