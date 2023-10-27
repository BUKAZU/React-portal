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
          <div className="form-row inline" id={`bukazu_form_${props.name}`}>
            <label htmlFor={props.name}>
              <FormattedMessage id={label} />
            </label>
            <select {...field} {...props}>
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
              <div className="error-message bu-error-message">{meta.error}</div>
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
