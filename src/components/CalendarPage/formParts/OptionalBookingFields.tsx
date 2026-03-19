import React, { useEffect, useState } from 'react';
import { Field } from 'formik';
import { t } from '../../../intl';
import { loadCountries, type CountryEntry } from '../../../_lib/countries';
import { DateField } from '../FormItems';
import DefaultBookingFields from './DefaultBookingFields';
import { SingleBookingFieldType, PossibleValues } from './form_types';

interface BookingFieldDefinition {
  id: string;
  label: string;
  field_type: string;
}

interface PortalSiteForBookingFields {
  booking_fields?: BookingFieldDefinition[];
  [key: string]: unknown;
}

interface Props {
  bookingFields: SingleBookingFieldType[];
  errors: Record<string, string | undefined>;
  touched: Record<string, boolean | Record<string, boolean> | undefined> & {
    extra_fields?: Record<string, boolean>;
  };
  PortalSite: PortalSiteForBookingFields;
  values: PossibleValues;
}

export function isInt(value: unknown): boolean {
  if (typeof value !== 'string' && typeof value !== 'number') return false;
  return (
    !isNaN(value as number) &&
    (function (x) {
      return (x | 0) === x;
    })(parseFloat(value as string))
  );
}

export default function OptionalBookingFields({
  bookingFields,
  errors,
  touched,
  PortalSite,
  values
}: Props) {
  const [countries, setCountries] = useState<CountryEntry[]>([]);
  const [countriesLoading, setCountriesLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const locale: string =
      (typeof window !== 'undefined' && window.__localeId__) || 'en';

    const fetchCountries = async () => {
      try {
        const data = await loadCountries(locale);
        if (mounted) {
          setCountries(data);
        }
      } catch {
        // If the locale chunk fails to load, leave the list empty.
      } finally {
        if (mounted) {
          setCountriesLoading(false);
        }
      }
    };

    fetchCountries();

    return () => {
      mounted = false;
    };
  }, []);

  let fields: SingleBookingFieldType[] = [...bookingFields];

  const requiredFields = ['address', 'house_number', 'zipcode', 'city'];
  if (values.cancel_insurance === '1' || values.cancel_insurance === '2') {
    requiredFields.forEach((key) => {
      const defaultField = DefaultBookingFields.find((x) => x.id === key);
      if (!defaultField) return;
      let index = bookingFields.findIndex((x) => x.id === key);
      if (index !== -1) {
        fields[index] = defaultField;
      } else {
        fields.push(defaultField);
      }
    });
  }
  return (
    <div className="form-section bup-16">
      <h2>{t('personal_details')}</h2>
      {fields.map((input) => {
        if (input.id === 'telephone') {
          input.id = 'phonenumber';
        }

        if (input.type === 'booking_field' || isInt(input.id)) {
          const bookingField = PortalSite.booking_fields?.find(
            (x) => x.id === input.id
          );

          if (!bookingField) return null;

          return (
            <div className="form-row" key={bookingField.id}>
              <label htmlFor={`extra_fields.booking_field_${bookingField.id}`}>
                {bookingField.label} {input.required && <span>*</span>}
              </label>
              <Field
                onKeyPress={(e: React.KeyboardEvent) => {
                  e.which === 13 && e.preventDefault();
                }}
                id={`extra_fields.booking_field_${bookingField.id}`}
                type={
                  bookingField.field_type === 'text'
                    ? 'input'
                    : bookingField.field_type
                }
                component={
                  bookingField.field_type === 'text'
                    ? 'input'
                    : bookingField.field_type
                }
                name={`extra_fields.booking_field_${bookingField.id}`}
              />
              {errors[input.id] &&
                ((touched.extra_fields &&
                  (touched.extra_fields as Record<string, boolean>)[
                    `booking_field_${bookingField.id}`
                  ]) ||
                  touched[input.id]) && (
                  <div className="error-message bu-error-message">
                    {errors[input.id]}
                  </div>
                )}
            </div>
          );
        } else if (input.id === 'country') {
          return (
            <div className="form-row" key={input.id}>
              <label htmlFor={input.id}>
                {PortalSite[`${input.id}_label`] as React.ReactNode}{' '}
                {input.required && <span>*</span>}
              </label>
              <Field
                component="select"
                name={input.id}
                disabled={countriesLoading}
              >
                {countries.map((country) => {
                  return (
                    <option value={country.alpha2} key={country.alpha2}>
                      {country.name}
                    </option>
                  );
                })}
              </Field>
              {errors[input.id] && (
                <div className="error-message bu-error-message">
                  {errors[input.id]}
                </div>
              )}
            </div>
          );
        } else if (input.type === 'date') {
          return (
            <div className="form-row" key={input.id}>
              <DateField name={input.id} label={input.id} inline={false} />
            </div>
          );
        } else {
          return (
            <div className="form-row" key={input.id}>
              <label
                htmlFor={input.id}
              >
                {PortalSite[`${input.id.replace(/\./g, '_')}_label`] as React.ReactNode}{' '}
                {input.required && <span>*</span>}
              </label>
              <Field
                type={input.type}
                name={input.id}
                onKeyPress={(e: React.KeyboardEvent) => {
                  e.which === 13 && e.preventDefault();
                }}
              />
              {errors[input.id] && touched[input.id] && (
                <div className="error-message bu-error-message">
                  {errors[input.id]}
                </div>
              )}
            </div>
          );
        }
      })}
    </div>
  );
}
