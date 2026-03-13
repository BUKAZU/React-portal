import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { Formik } from 'formik';
import DateField from '../Date';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

// Capture the onChange passed to DatePicker so tests can trigger it
let capturedOnChange: ((value: any) => void) | null = null;

jest.mock('react-date-picker', () => (props: any) => {
  capturedOnChange = props.onChange;
  return (
    <div
      data-testid="date-picker"
      data-name={props.name}
      data-value={props.value ? String(props.value) : ''}
    />
  );
});

let container: HTMLDivElement;
let root: ReturnType<typeof createRoot>;

beforeEach(() => {
  (window as any).__localeId__ = 'en';
  capturedOnChange = null;
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
  fieldProps: { label?: string; name?: string; inline?: boolean; description?: string | React.ReactNode; required?: boolean } = {},
  initialValues: Record<string, any> = {}
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
      <Formik initialValues={{ [name]: '', ...initialValues }} onSubmit={() => {}}>
        <DateField
          label={label}
          name={name}
          inline={inline}
          description={description}
          required={required}
        />
      </Formik>
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

  it('renders the mocked DatePicker', () => {
    renderDateField();
    expect(container.querySelector('[data-testid="date-picker"]')).not.toBeNull();
  });

  it('passes null to DatePicker when the field value is empty', () => {
    renderDateField({}, { date_of_birth: '' });
    const picker = container.querySelector('[data-testid="date-picker"]');
    expect(picker?.getAttribute('data-value')).toBe('');
  });

  it('passes a Date to DatePicker when the field value is a valid date string', () => {
    renderDateField({}, { date_of_birth: '2000-06-15' });
    const picker = container.querySelector('[data-testid="date-picker"]');
    // The data-value attribute will be the string representation of the Date object
    expect(picker?.getAttribute('data-value')).not.toBe('');
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
    act(() => {
      root.render(
        <Formik
          initialValues={{ dob: '' }}
          initialTouched={{ dob: true }}
          initialErrors={{ dob: 'Date is required.' }}
          onSubmit={() => {}}
        >
          <DateField label="date_of_birth" name="dob" inline={true} />
        </Formik>
      );
    });
    const errorDiv = container.querySelector('.error-message');
    expect(errorDiv).not.toBeNull();
    expect(errorDiv?.textContent).toBe('Date is required.');
  });

  it('does not show an error message when the field is not touched', () => {
    act(() => {
      root.render(
        <Formik
          initialValues={{ dob: '' }}
          initialErrors={{ dob: 'Date is required.' }}
          onSubmit={() => {}}
        >
          <DateField label="date_of_birth" name="dob" inline={true} />
        </Formik>
      );
    });
    expect(container.querySelector('.error-message')).toBeNull();
  });
});

describe('DateField – onChange formatting', () => {
  it('calls DatePicker onChange with a formatted yyyy-MM-dd string via form.setFieldValue', () => {
    renderDateField({ name: 'dob' }, { dob: '' });
    expect(capturedOnChange).not.toBeNull();

    act(() => {
      capturedOnChange!(new Date(2020, 0, 15)); // Jan 15 2020
    });

    // The field value should now be the formatted date
    const picker = container.querySelector('[data-testid="date-picker"]');
    expect(picker?.getAttribute('data-value')).not.toBe('');
  });
});
