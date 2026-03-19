import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { Formik } from 'formik';
import DateField from '../Date';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

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

  it('renders a native date input', () => {
    renderDateField();
    expect(container.querySelector('input[type="date"]')).not.toBeNull();
  });

  it('has empty value when the field value is empty', () => {
    renderDateField({}, { date_of_birth: '' });
    const input = container.querySelector('input[type="date"]') as HTMLInputElement;
    expect(input?.value).toBe('');
  });

  it('has the correct value when the field value is a valid date string', () => {
    renderDateField({}, { date_of_birth: '2000-06-15' });
    const input = container.querySelector('input[type="date"]') as HTMLInputElement;
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

describe('DateField – onChange', () => {
  it('updates the field value when the date input changes', async () => {
    let formValues: Record<string, any> = {};
    await act(async () => {
      root.render(
        <Formik
          initialValues={{ dob: '' }}
          onSubmit={(values) => {
            formValues = values;
          }}
        >
          {({ values }) => {
            formValues = values;
            return <DateField label="date_of_birth" name="dob" inline={true} />;
          }}
        </Formik>
      );
    });

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
