import React from 'react';
import { Field } from 'formik';
import { createPeronsArray } from '../formParts/BookingHelpers';
import { FormattedMessage } from 'react-intl';

export default function NumberSelect({ label, description, count, ...props }) {
  const numbers = createPeronsArray(count);

  return (
    <Field name={props.name}>
      {({ field, meta }) => {
        return (
          <div className="mb-4" id={`bukazu_form_${props.name}`}>
            <label htmlFor={props.name}>
              <FormattedMessage id={label} />
            </label>
            <select
              {...field}
              {...props}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            >
              {numbers.map((opt) => {
                return (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                );
              })}
            </select>
            {description}
            {meta.touched && meta.error && (
              <div className="mt-2 text-sm text-gray-500 ">{meta.error}</div>
            )}
          </div>
        );
      }}
    </Field>
  );
}

NumberSelect.defaultProps = {
  count: 0
};
