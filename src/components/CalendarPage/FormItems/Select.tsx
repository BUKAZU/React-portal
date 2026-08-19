import React from 'react';
import { t } from '../../../intl';
import { useBookingField } from '../BookingFormContext';

interface Props {
  label: string;
  description?: React.ReactNode;
  options: string[];
  name: string;
}

export default function Select({ label, description, options, name }: Props) {
  const field = useBookingField(name);

  return (
    <div className="form-row inline" id={`bukazu_form_${name}`}>
      <label htmlFor={name}>{t(label)}</label>
      <select
        id={name}
        name={name}
        value={String(field.value)}
        onChange={field.onChange}
        onBlur={field.onBlur}
      >
        {options.map((option) => {
          return (
            <option key={option} value={option}>
              {option}
            </option>
          );
        })}
      </select>
      {description}
      {field.touched && field.error && (
        <div className="error-message bu-error-message">{field.error}</div>
      )}
    </div>
  );
}
