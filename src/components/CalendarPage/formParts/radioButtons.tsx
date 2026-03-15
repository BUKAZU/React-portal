import React from 'react';
import { FieldInputProps } from 'formik';

interface InputFeedbackProps {
  error?: React.ReactNode;
}

// Input feedback
const InputFeedback = ({ error }: InputFeedbackProps) =>
  error ? <div className="input-feedback">{error}</div> : null;

interface RadioButtonProps {
  field: FieldInputProps<string>;
  id: string;
  label: React.ReactNode;
}

// Radio input
export const RadioButton = ({
  field: { name, value, onChange, onBlur },
  id,
  label,
  ...props
}: RadioButtonProps) => {
  return (
    <div>
      <input
        name={name}
        id={id}
        type="radio"
        value={id} // could be something else for output?
        checked={id === value}
        onChange={onChange}
        onBlur={onBlur}
        className="radio-button"
        {...props}
      />
      <label htmlFor={id}>{label}</label>
    </div>
  );
};

interface RadioButtonGroupProps {
  id?: string;
  error?: React.ReactNode;
  touched?: boolean | Record<string, boolean>;
  label?: string;
  className?: string;
  children: React.ReactNode;
}

// Radio group
export const RadioButtonGroup = ({
  error,
  touched,
  label,
  className,
  children,
}: RadioButtonGroupProps) => {
  return (
    <div className={className}>
      <div className="legend">{label}</div>
      {children}
      {touched && <InputFeedback error={error} />}
    </div>
  );
};
