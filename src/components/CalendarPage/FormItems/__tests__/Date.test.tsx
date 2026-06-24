import React, { useEffect, useState } from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import DateField from '../Date';
import { BookingFormContext } from '../../BookingFormContext';
import { setByString } from '../../formParts/BookingHelpers';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

function DateFieldHarness({
  fieldProps,
  initialValues,
  initialErrors = {},
  initialTouched = {},
  onValuesChange
}: {
  fieldProps: {
    label: string;
    name: string;
    inline: boolean;
    description?: string | React.ReactNode;
    required?: boolean;
  };
  initialValues: Record<string, any>;
  initialErrors?: Record<string, string>;
  initialTouched?: Record<string, any>;
  onValuesChange?: (values: Record<string, any>) => void;
}) {
  const [values, setValues] = useState(initialValues);
  const [touched, setTouched] = useState(initialTouched);

  useEffect(() => {
    onValuesChange?.(values);
  }, [onValuesChange, values]);

  return (
    <BookingFormContext.Provider
      value={{
        values: values as any,
        errors: initialErrors,
        touched,
        isSubmitting: false,
        setFieldValue: (name, value) => {
          setValues((currentValues) => setByString(currentValues, name, value));
        },
        setFieldTouched: (name, value = true) => {
          setTouched((currentTouched) =>
            setByString(currentTouched, name, value)
          );
        }
      }}
    >
      <DateField {...fieldProps} />
    </BookingFormContext.Provider>
  );
}

let container: HTMLDivElement;
let root: ReturnType<typeof createRoot>;

beforeEach(() => {
  (window as any).__localeId__ = 'en';
  container = document.createElement('div');
  document.body.appendChild(container);
  act(() => {
    root = createRoot(container);
  });
});

afterEach(() => {
  delete (window as any).__localeId__;
  act(() => {
    root.unmount();
  });
  container.remove();
});

function renderDateField(
  fieldProps: {
    label?: string;
    name?: string;
    inline?: boolean;
    description?: string | React.ReactNode;
    required?: boolean;
  } = {},
  initialValues: Record<string, any> = {},
  initialErrors: Record<string, string> = {},
  initialTouched: Record<string, any> = {},
  onValuesChange?: (values: Record<string, any>) => void
) {
  const {
    label = 'date_of_birth',
    name = 'date_of_birth',
    inline = true,
    description,
    required
  } = fieldProps;

  act(() => {
    root.render(
      <DateFieldHarness
        fieldProps={{ label, name, inline, description, required }}
        initialValues={{ [name]: '', ...initialValues }}
        initialErrors={initialErrors}
        initialTouched={initialTouched}
        onValuesChange={onValuesChange}
      />
    );
  });
}

describe('DateField – basic rendering', () => {
  it('renders a form-row div', () => {
    renderDateField();
    expect(container.querySelector('.form-row')).not.toBeNull();
  });

  it('applies the "inline" class when inline is true', () => {
    renderDateField({ inline: true });
    expect(container.querySelector('.form-row.inline')).not.toBeNull();
  });

  it('does not apply the "inline" class when inline is false', () => {
    renderDateField({ inline: false });
    expect(container.querySelector('.form-row.inline')).toBeNull();
  });

  it('renders a label element', () => {
    renderDateField({ label: 'date_of_birth', name: 'dob' });
    const label = container.querySelector('label');
    expect(label).not.toBeNull();
  });

  it('sets the bukazu_form_ id on the wrapper div', () => {
    renderDateField({ name: 'dob' });
    expect(container.querySelector('#bukazu_form_dob')).not.toBeNull();
  });

  it('renders a native date input', () => {
    renderDateField();
    expect(container.querySelector('input[type="date"]')).not.toBeNull();
  });

  it('has empty value when the field value is empty', () => {
    renderDateField({}, { date_of_birth: '' });
    const input = container.querySelector(
      'input[type="date"]'
    ) as HTMLInputElement;
    expect(input?.value).toBe('');
  });

  it('has the correct value when the field value is a valid date string', () => {
    renderDateField({}, { date_of_birth: '2000-06-15' });
    const input = container.querySelector(
      'input[type="date"]'
    ) as HTMLInputElement;
    expect(input?.value).toBe('2000-06-15');
  });
});

describe('DateField – description', () => {
  it('renders the description text when provided', () => {
    renderDateField({ description: 'Enter your date of birth' });
    const span = container.querySelector('.bu-input-description');
    expect(span?.textContent).toBe('Enter your date of birth');
  });

  it('renders an empty description span when description is not provided', () => {
    renderDateField();
    const span = container.querySelector('.bu-input-description');
    expect(span).not.toBeNull();
    expect(span?.textContent).toBe('');
  });
});

describe('DateField – validation error display', () => {
  it('shows the error message when the field is touched and has an error', () => {
    renderDateField(
      { label: 'date_of_birth', name: 'dob', inline: true },
      { dob: '' },
      { dob: 'Date is required.' },
      { dob: true }
    );
    const errorDiv = container.querySelector('.error-message');
    expect(errorDiv).not.toBeNull();
    expect(errorDiv?.textContent).toBe('Date is required.');
  });

  it('does not show an error message when the field is not touched', () => {
    renderDateField(
      { label: 'date_of_birth', name: 'dob', inline: true },
      { dob: '' },
      { dob: 'Date is required.' }
    );
    expect(container.querySelector('.error-message')).toBeNull();
  });
});

describe('DateField – onChange', () => {
  it('updates the field value when the date input changes', async () => {
    let formValues: Record<string, any> = {};

    renderDateField(
      { label: 'date_of_birth', name: 'dob', inline: true },
      { dob: '' },
      {},
      {},
      (values) => {
        formValues = values;
      }
    );

    const input = container.querySelector('input[type="date"]');
    expect(input).not.toBeNull();
    const dateInput = input as HTMLInputElement;
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      'value'
    )!.set!;
    await act(async () => {
      nativeInputValueSetter.call(dateInput, '2020-01-15');
      dateInput.dispatchEvent(new Event('change', { bubbles: true }));
    });

    expect(formValues.dob).toBe('2020-01-15');
  });
});
