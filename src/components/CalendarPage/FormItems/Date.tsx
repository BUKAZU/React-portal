import React from 'react';
import { t } from '../../../intl';
import { useBookingField } from '../BookingFormContext';

interface Props {
  label: string;
  description?: string | React.ReactNode;
  name: string;
  inline: boolean;
  required?: boolean;
}

function DateField({ label, description, name, inline }: Props) {
  const field = useBookingField(name);
  const dateValue =
    typeof field.value === 'string' && field.value !== '' ? field.value : '';

  return (
    <div
      className={`form-row ${inline && 'inline'}`}
      id={`bukazu_form_${name}`}
    >
      <label htmlFor={name}>{t(label)}</label>
      <input
        type="date"
        className="bukazu-date-picker"
        id={name}
        name={name}
        value={dateValue}
        onChange={field.onChange}
        onBlur={field.onBlur}
      />
      <span className="bu-input-description">{description}</span>
      {field.touched && field.error && (
        <div className="error-message bu-error-message">{field.error}</div>
      )}
    </div>
  );
}

DateField.defaultValues = {
  inline: true
};

export default DateField;
