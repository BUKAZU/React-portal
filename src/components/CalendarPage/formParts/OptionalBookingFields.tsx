import React, { useEffect, useState } from 'react';
import { t } from '../../../intl';
import { loadCountries, type CountryEntry } from '../../../_lib/countries';
import { DateField } from '../FormItems';
import { useBookingField } from '../BookingFormContext';
import DefaultBookingFields from './DefaultBookingFields';
import { PossibleValues, SingleBookingFieldType } from './form_types';

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

interface RenderOptionalFieldParams {
  input: SingleBookingFieldType;
  PortalSite: PortalSiteForBookingFields;
  countries: CountryEntry[];
  countriesLoading: boolean;
  errors: Record<string, string | undefined>;
  touched: Record<string, boolean | Record<string, boolean> | undefined> & {
    extra_fields?: Record<string, boolean>;
  };
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

function NativeField({
  name,
  type = 'text',
  onKeyPress
}: {
  name: string;
  type?: string;
  onKeyPress?: (event: React.KeyboardEvent) => void;
}) {
  const field = useBookingField(name);

  if (type === 'textarea') {
    return (
      <textarea
        id={name}
        name={name}
        value={String(field.value)}
        onChange={field.onChange}
        onBlur={field.onBlur}
        onKeyPress={onKeyPress}
      />
    );
  }

  return (
    <input
      id={name}
      type={type}
      name={name}
      value={String(field.value)}
      onChange={field.onChange}
      onBlur={field.onBlur}
      onKeyPress={onKeyPress}
    />
  );
}

function BookingFieldInput({
  bookingField
}: {
  bookingField: BookingFieldDefinition;
}) {
  const field = useBookingField(
    `extra_fields.booking_field_${bookingField.id}`
  );

  if (bookingField.field_type === 'textarea') {
    return (
      <textarea
        id={`extra_fields.booking_field_${bookingField.id}`}
        name={`extra_fields.booking_field_${bookingField.id}`}
        value={String(field.value)}
        onChange={field.onChange}
        onBlur={field.onBlur}
        onKeyPress={(event) => {
          if (event.which === 13) {
            event.preventDefault();
          }
        }}
      />
    );
  }

  return (
    <input
      id={`extra_fields.booking_field_${bookingField.id}`}
      type={
        bookingField.field_type === 'text' ? 'text' : bookingField.field_type
      }
      name={`extra_fields.booking_field_${bookingField.id}`}
      value={String(field.value)}
      onChange={field.onChange}
      onBlur={field.onBlur}
      onKeyPress={(event) => {
        if (event.which === 13) {
          event.preventDefault();
        }
      }}
    />
  );
}

function CountryField({
  countries,
  disabled
}: {
  countries: CountryEntry[];
  disabled: boolean;
}) {
  const field = useBookingField('country');

  return (
    <select
      name="country"
      id="country"
      disabled={disabled}
      value={String(field.value)}
      onChange={field.onChange}
      onBlur={field.onBlur}
    >
      {countries.map((country) => {
        return (
          <option value={country.alpha2} key={country.alpha2}>
            {country.name}
          </option>
        );
      })}
    </select>
  );
}

function renderOptionalField({
  input,
  PortalSite,
  countries,
  countriesLoading,
  errors,
  touched
}: RenderOptionalFieldParams) {
  const normalizedId = input.id === 'telephone' ? 'phonenumber' : input.id;

  if (input.type === 'booking_field' || isInt(normalizedId)) {
    const bookingField = PortalSite.booking_fields?.find(
      (bookingFieldDef) => bookingFieldDef.id === normalizedId
    );

    if (!bookingField) {
      return null;
    }

    return (
      <div className="form-row" key={bookingField.id}>
        <label htmlFor={`extra_fields.booking_field_${bookingField.id}`}>
          {bookingField.label} {input.required && <span>*</span>}
        </label>
        <BookingFieldInput bookingField={bookingField} />
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
  }

  if (normalizedId === 'country') {
    return (
      <div className="form-row" key={normalizedId}>
        <label htmlFor={normalizedId}>
          {PortalSite[`${normalizedId}_label`] as React.ReactNode}{' '}
          {input.required && <span>*</span>}
        </label>
        <CountryField countries={countries} disabled={countriesLoading} />
        {errors[normalizedId] && (
          <div className="error-message bu-error-message">
            {errors[normalizedId]}
          </div>
        )}
      </div>
    );
  }

  if (input.type === 'date') {
    return (
      <div className="form-row" key={normalizedId}>
        <DateField name={normalizedId} label={normalizedId} inline={false} />
      </div>
    );
  }

  return (
    <div className="form-row" key={normalizedId}>
      <label htmlFor={normalizedId}>
        {
          PortalSite[
            `${normalizedId.replace(/\./g, '_')}_label`
          ] as React.ReactNode
        }{' '}
        {input.required && <span>*</span>}
      </label>
      <NativeField
        type={input.type}
        name={normalizedId}
        onKeyPress={(event) => {
          if (event.which === 13) {
            event.preventDefault();
          }
        }}
      />
      {errors[normalizedId] && touched[normalizedId] && (
        <div className="error-message bu-error-message">
          {errors[normalizedId]}
        </div>
      )}
    </div>
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

  const fields: SingleBookingFieldType[] = [...bookingFields];

  const requiredFields = ['address', 'house_number', 'zipcode', 'city'];
  if (values.cancel_insurance === '1' || values.cancel_insurance === '2') {
    requiredFields.forEach((key) => {
      const defaultField = DefaultBookingFields.find((x) => x.id === key);
      if (!defaultField) return;
      const index = bookingFields.findIndex((x) => x.id === key);
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
      {fields.map((input) =>
        renderOptionalField({
          input,
          PortalSite,
          countries,
          countriesLoading,
          errors,
          touched
        })
      )}
    </div>
  );
}
