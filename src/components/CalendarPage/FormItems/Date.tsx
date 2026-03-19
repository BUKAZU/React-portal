import React from 'react';
import { Field } from 'formik';
import { t } from '../../../intl';

interface Props {
  label: string;
  description?: string | React.ReactNode;
  name: string;
  inline: boolean;
  required?: boolean;
}

function DateField({ label, description, name, inline }: Props) {
  return (
    <Field name={name}>
      {({ field, meta }) => {
        const { value, name } = field;
        const dateValue = value && value !== '' ? value : '';

        return (
          <div
            className={`form-row ${inline && 'inline'}`}
            id={`bukazu_form_${name}`}
          >
            <label htmlFor={name}>
              {t(label)}
            </label>
            <input
              type="date"
              className="bukazu-date-picker"
              id={name}
              name={name}
              value={dateValue}
              onChange={field.onChange}
            />
            <span className="bu-input-description">{description}</span>
            {meta.touched && meta.error && (
              <div className="error-message bu-error-message">{meta.error}</div>
            )}
          </div>
        );
      }}
    </Field>
  );
}

DateField.defaultValues = {
  inline: true
};

export default DateField;
