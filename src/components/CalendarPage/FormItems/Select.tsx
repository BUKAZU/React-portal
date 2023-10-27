import React from 'react';
import { Field } from 'formik';
import { FormattedMessage } from 'react-intl';

export default function Select({
  label,
  description,
  options,
  name,
  ...props
}) {
  return (
    <Field name={name}>
      {({ field, meta }) => {
        return (
          <div className="form-row inline" id={`bukazu_form_${props.name}`}>
            <label htmlFor={props.name}>
              <FormattedMessage id={label} />
            </label>
            <select {...field} {...props}>
              {options.map((opt) => {
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
