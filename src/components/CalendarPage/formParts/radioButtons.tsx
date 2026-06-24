import React from 'react';

interface InputFeedbackProps {
  error?: React.ReactNode;
}

const InputFeedback = ({ error }: InputFeedbackProps) =>
  error ? <div className="input-feedback">{error}</div> : null;

interface RadioButtonProps {
  name: string;
  value: string;
  currentValue: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: () => void;
  id: string;
  label: React.ReactNode;
  disabled?: boolean;
}

export const RadioButton = ({
  name,
  value,
  currentValue,
  onChange,
  onBlur,
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
        value={id}
        checked={id === currentValue}
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

export const RadioButtonGroup = ({
  error,
  touched,
  label,
  className,
  children
}: RadioButtonGroupProps) => {
  return (
    <div className={className}>
      <div className="legend">{label}</div>
      {children}
      {touched && <InputFeedback error={error} />}
    </div>
  );
};
