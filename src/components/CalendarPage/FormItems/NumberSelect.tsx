import React from 'react';
import { t } from '../../../intl';
import { useBookingField } from '../BookingFormContext';
import { createPeronsArray } from '../formParts/BookingHelpers';

interface Props {
  label: string;
  description?: React.ReactNode;
  count?: number;
  name: string;
}

export default function NumberSelect({
  label,
  description,
  count = 0,
  name
}: Props) {
  const numbers = createPeronsArray(count);
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
        {numbers.map((option) => {
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
