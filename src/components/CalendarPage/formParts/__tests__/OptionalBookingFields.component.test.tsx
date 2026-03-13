import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { Formik } from 'formik';
import OptionalBookingFields from '../OptionalBookingFields';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock('../../FormItems', () => ({
  DateField: ({ name }: { name: string }) => (
    <div data-testid="date-field" data-name={name} />
  )
}));

jest.mock('../../../../_lib/countries', () => ({
  loadCountries: jest.fn().mockResolvedValue([
    { name: 'Netherlands', alpha2: 'nl' },
    { name: 'Germany', alpha2: 'de' }
  ])
}));

const mockPortalSite = {
  first_name_label: 'First name',
  last_name_label: 'Last name',
  email_label: 'Email',
  phonenumber_label: 'Phone',
  country_label: 'Country',
  booking_fields: [{ id: '42', label: 'Custom field', field_type: 'text' }]
};

const defaultValues = {
  first_name: '',
  last_name: '',
  email: '',
  cancel_insurance: '0',
  country: '',
  extra_fields: {}
};

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

function renderFields(
  bookingFields: any[],
  values: Record<string, any> = defaultValues,
  errors: Record<string, string> = {},
  touched: Record<string, any> = {}
) {
  act(() => {
    root.render(
      <Formik initialValues={values} onSubmit={() => {}}>
        <OptionalBookingFields
          bookingFields={bookingFields}
          errors={errors}
          touched={touched}
          PortalSite={mockPortalSite}
          values={values}
        />
      </Formik>
    );
  });
}

describe('OptionalBookingFields - section heading', () => {
  it('renders the personal details heading', () => {
    renderFields([]);
    const heading = container.querySelector('h2');
    expect(heading?.textContent).toBe('Your information');
  });
});

describe('OptionalBookingFields - default (text/email/textarea) fields', () => {
  it('renders a text input for a text field', () => {
    renderFields([{ id: 'first_name', type: 'text', required: false }]);
    const input = container.querySelector('input');
    expect(input).not.toBeNull();
  });

  it('renders a label using the PortalSite label property', () => {
    renderFields([{ id: 'first_name', type: 'text', required: false }]);
    const label = container.querySelector('label');
    expect(label?.textContent?.trim()).toBe('First name');
  });

  it('renders a required indicator (*) for required fields', () => {
    renderFields([{ id: 'first_name', type: 'text', required: true }]);
    const spans = Array.from(container.querySelectorAll('span'));
    const star = spans.find((s) => s.textContent === '*');
    expect(star).not.toBeUndefined();
  });

  it('does not render a required indicator for optional fields', () => {
    renderFields([{ id: 'first_name', type: 'text', required: false }]);
    const spans = Array.from(container.querySelectorAll('span'));
    const star = spans.find((s) => s.textContent === '*');
    expect(star).toBeUndefined();
  });

  it('renders an error message when there is an error and the field is touched', () => {
    renderFields(
      [{ id: 'first_name', type: 'text', required: true }],
      defaultValues,
      { first_name: 'This field is required.' },
      { first_name: true }
    );
    const errorDiv = container.querySelector('.error-message');
    expect(errorDiv).not.toBeNull();
    expect(errorDiv?.textContent).toBe('This field is required.');
  });

  it('does not render an error message when the field is not touched', () => {
    renderFields(
      [{ id: 'first_name', type: 'text', required: true }],
      defaultValues,
      { first_name: 'This field is required.' },
      {}
    );
    const errorDiv = container.querySelector('.error-message');
    expect(errorDiv).toBeNull();
  });

  it('renders an email input for an email field', () => {
    renderFields([{ id: 'email', type: 'email', required: true }]);
    const input = container.querySelector('input');
    expect(input).not.toBeNull();
  });
});

describe('OptionalBookingFields - country field', () => {
  it('renders a select element for the country field', () => {
    renderFields([{ id: 'country', type: 'select', required: true }]);
    const select = container.querySelector('select');
    expect(select).not.toBeNull();
  });

  it('renders country options from the locale list', async () => {
    renderFields([{ id: 'country', type: 'select', required: true }]);
    await act(async () => {});
    const options = container.querySelectorAll('option');
    expect(options.length).toBeGreaterThan(0);
  });

  it('renders a required indicator for a required country field', () => {
    renderFields([{ id: 'country', type: 'select', required: true }]);
    const spans = Array.from(container.querySelectorAll('span'));
    const star = spans.find((s) => s.textContent === '*');
    expect(star).not.toBeUndefined();
  });

  it('renders an error message for the country field when there is an error', () => {
    renderFields(
      [{ id: 'country', type: 'select', required: true }],
      defaultValues,
      { country: 'This field is required.' }
    );
    const errorDiv = container.querySelector('.error-message');
    expect(errorDiv).not.toBeNull();
    expect(errorDiv?.textContent).toBe('This field is required.');
  });
});

describe('OptionalBookingFields - date field', () => {
  it('renders a date field for a date type input', () => {
    renderFields([{ id: 'date_of_birth', type: 'date' }]);
    const dateField = container.querySelector('[data-testid="date-field"]');
    expect(dateField).not.toBeNull();
  });

  it('passes the field name to the date field component', () => {
    renderFields([{ id: 'date_of_birth', type: 'date' }]);
    const dateField = container.querySelector('[data-testid="date-field"]');
    expect(dateField?.getAttribute('data-name')).toBe('date_of_birth');
  });
});

describe('OptionalBookingFields - booking_field type (integer id)', () => {
  it('renders a label with the booking field label from PortalSite', () => {
    renderFields([{ id: '42', type: 'booking_field', required: false }]);
    const label = container.querySelector('label');
    expect(label?.textContent?.trim()).toBe('Custom field');
  });

  it('renders a required indicator for required booking fields', () => {
    renderFields([{ id: '42', type: 'booking_field', required: true }]);
    const spans = Array.from(container.querySelectorAll('span'));
    const star = spans.find((s) => s.textContent === '*');
    expect(star).not.toBeUndefined();
  });

  it('renders an error message when the booking_field has an error and is touched (via extra_fields)', () => {
    renderFields(
      [{ id: '42', type: 'booking_field', required: true }],
      defaultValues,
      { '42': 'This field is required.' },
      { extra_fields: { booking_field_42: true } }
    );
    const errorDiv = container.querySelector('.error-message');
    expect(errorDiv).not.toBeNull();
    expect(errorDiv?.textContent).toBe('This field is required.');
  });

  it('renders an error message when the booking_field has an error and the top-level field is touched', () => {
    renderFields(
      [{ id: '42', type: 'booking_field', required: true }],
      defaultValues,
      { '42': 'This field is required.' },
      { '42': true }
    );
    const errorDiv = container.querySelector('.error-message');
    expect(errorDiv).not.toBeNull();
  });

  it('does not render an error message when the booking_field is not touched', () => {
    renderFields(
      [{ id: '42', type: 'booking_field', required: true }],
      defaultValues,
      { '42': 'This field is required.' },
      {}
    );
    const errorDiv = container.querySelector('.error-message');
    expect(errorDiv).toBeNull();
  });

  it('detects booking_field via integer string id (isInt)', () => {
    // Verify that a numeric string id is treated as a booking_field via isInt.
    // We add it to PortalSite.booking_fields so the component can find the field.
    const portalSiteWithExtraField = {
      ...mockPortalSite,
      booking_fields: [
        ...mockPortalSite.booking_fields,
        { id: '99', label: 'Extra field', field_type: 'text' }
      ]
    };
    act(() => {
      root.render(
        <Formik initialValues={defaultValues} onSubmit={() => {}}>
          <OptionalBookingFields
            bookingFields={[{ id: '99', type: 'text', required: false }]}
            errors={{}}
            touched={{}}
            PortalSite={portalSiteWithExtraField}
            values={defaultValues}
          />
        </Formik>
      );
    });
    const label = container.querySelector('label');
    expect(label?.textContent?.trim()).toBe('Extra field');
  });
});

describe('OptionalBookingFields - telephone id normalisation', () => {
  it('renames a field with id "telephone" to "phonenumber" before rendering', () => {
    renderFields([{ id: 'telephone', type: 'text', required: false }]);
    // After renaming, the label should use the phonenumber_label from PortalSite
    const label = container.querySelector('label');
    expect(label?.textContent?.trim()).toBe('Phone');
  });
});

describe('OptionalBookingFields - cancel_insurance required address fields', () => {
  it('adds required address fields when cancel_insurance is "1"', () => {
    renderFields([], { ...defaultValues, cancel_insurance: '1' });
    const formRows = container.querySelectorAll('.form-row');
    expect(formRows.length).toBeGreaterThan(0);
  });

  it('adds required address fields when cancel_insurance is "2"', () => {
    renderFields([], { ...defaultValues, cancel_insurance: '2' });
    const formRows = container.querySelectorAll('.form-row');
    expect(formRows.length).toBeGreaterThan(0);
  });

  it('does not add address fields when cancel_insurance is "0"', () => {
    renderFields([], { ...defaultValues, cancel_insurance: '0' });
    const formRows = container.querySelectorAll('.form-row');
    expect(formRows.length).toBe(0);
  });
});
