import React from 'react';
import PropTypes from 'prop-types';
import { Field } from 'formik';
import { FormattedMessage } from 'react-intl';
import { Countries } from '../../../_lib/countries';
import { DateField } from '../FormItems';
import DefaultBookingFields from './DefaultBookingFields';

export function isInt(value) {
  return (
    !isNaN(value) &&
    (function (x) {
      return (x | 0) === x;
    })(parseFloat(value))
  );
}

export default function OptionalBookingFields({
  bookingFields,
  errors,
  touched,
  PortalSite,
  values
}) {
  let fields = [].concat(bookingFields);
  let labelClass = 'block mb-2 text-sm font-medium text-gray-900';

  const requiredFields = ['address', 'house_number', 'zipcode', 'city'];
  if (values.cancel_insurance === '1' || values.cancel_insurance === '2') {
    requiredFields.forEach((key) => {
      let index = bookingFields.findIndex((x) => x.id === key);
      if (index !== -1) {
        fields[index] = DefaultBookingFields.find((x) => x.id === key);
      } else {
        fields.push(DefaultBookingFields.find((x) => x.id === key));
      }
    });
  }
  return (
    <div className="pt-4">
      <h2 className="mb-4 text-lg font-bold text-gray-900">
        <FormattedMessage id="personal_details" />
      </h2>
      {fields.map((input) => {
        if (input.id === 'telephone') {
          input.id = 'phonenumber';
        }

        if (input.type === 'booking_field' || isInt(input.id)) {
          const bookingField = PortalSite.booking_fields.find(
            (x) => x.id === input.id
          );

          return (
            <div className="mb-5" key={bookingField.id}>
              <label htmlFor={`extra_fields.booking_field_${bookingField.id}`}>
                {bookingField.label} {input.required && <span>*</span>}
              </label>
              <Field
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                onKeyPress={(e) => {
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
                  touched.extra_fields[`booking_field_${bookingField.id}`]) ||
                  touched[input.id]) && (
                  <div className="error-message bu-error-message">
                    {errors[input.id]}
                  </div>
                )}
            </div>
          );
        } else if (input.id === 'country') {
          return (
            <div className="mb-5" key={input.id}>
              <label htmlFor={input.id} className={labelClass}>
                {PortalSite[`${input.id}_label`]}{' '}
                {input.required && <span>*</span>}
              </label>
              <Field
                component="select"
                name={input.id}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              >
                {Countries[window.__localeId__].map((country) => {
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
            <div className="mb-5" key={input.id}>
              <DateField name={input.id} label={input.id} inline={false} />
            </div>
          );
        } else {
          return (
            <div className="mb-5" key={input.id}>
              <label
                className={labelClass}
                htmlFor={input.id}
                name={`${input.id.replace(/\./g, '_')}_label`}
              >
                {PortalSite[`${input.id.replace(/\./g, '_')}_label`]}{' '}
                {input.required && <span>*</span>}
              </label>
              <Field
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5  "
                type={input.type}
                name={input.id}
                onKeyPress={(e) => {
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

OptionalBookingFields.propTypes = {
  bookingFields: PropTypes.array.isRequired,
  errors: PropTypes.object.isRequired,
  PortalSite: PropTypes.object.isRequired
};
