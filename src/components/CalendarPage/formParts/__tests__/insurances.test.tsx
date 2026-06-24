import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { Formik } from 'formik';
import { Insurances } from '../insurances';
import { HouseType } from '../../../../types';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock('../../../Modal', () => ({ children, buttonText }: any) => (
  <div data-testid="modal">{children}</div>
));

jest.mock('../../../icons/info.svg', () => () => (
  <span data-testid="info-icon" />
));

jest.mock('../CancelInsuranceText', () => () => (
  <div data-testid="cancel-insurance-text" />
));

jest.mock('../../FormItems', () => ({
  DateField: ({ name, label }: { name: string; label: string }) => (
    <div data-testid="date-field" data-name={name} data-label={label} />
  )
}));

const baseHouse = {
  id: 1,
  code: 'TEST',
  name: 'Test House',
  house_type: 'house',
  persons: 4,
  max_nights: 14,
  cancel_insurance: false,
  babies_extra: 0
} as unknown as HouseType;

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

function renderInsurances(
  housePatch: Partial<typeof baseHouse> = {},
  cancelInsuranceValue: string = '0'
) {
  const house = { ...baseHouse, ...housePatch };
  const values = { cancel_insurance: cancelInsuranceValue };

  act(() => {
    root.render(
      <Formik initialValues={values} onSubmit={() => {}}>
        <Insurances house={house as unknown as HouseType} values={values as any} />
      </Formik>
    );
  });
}

describe('Insurances – house.cancel_insurance is false', () => {
  it('does not render the insurances section when cancel_insurance is false', () => {
    renderInsurances({ cancel_insurance: false });
    expect(container.querySelector('#insurances')).toBeNull();
  });

  it('renders an empty div (no visible content) when cancel_insurance is false', () => {
    renderInsurances({ cancel_insurance: false });
    expect(container.textContent).toBe('');
  });
});

describe('Insurances – house.cancel_insurance is true', () => {
  it('renders the insurances section with correct id', () => {
    renderInsurances({ cancel_insurance: true });
    expect(container.querySelector('#insurances')).not.toBeNull();
  });

  it('renders the "Insurances" heading', () => {
    renderInsurances({ cancel_insurance: true });
    const heading = container.querySelector('h2');
    expect(heading?.textContent).toBe('Insurances');
  });

  it('renders a select element for cancel_insurance', () => {
    renderInsurances({ cancel_insurance: true });
    const select = container.querySelector('select[name="cancel_insurance"]');
    expect(select).not.toBeNull();
  });

  it('renders the "Standard" option with value "1"', () => {
    renderInsurances({ cancel_insurance: true });
    const option = container.querySelector('option[value="1"]');
    expect(option).not.toBeNull();
    expect(option?.textContent).toBe('Standard');
  });

  it('renders the "None" option with value "0"', () => {
    renderInsurances({ cancel_insurance: true });
    const option = container.querySelector('option[value="0"]');
    expect(option).not.toBeNull();
    expect(option?.textContent).toBe('None');
  });

  it('renders the "Choose" placeholder option with empty value', () => {
    renderInsurances({ cancel_insurance: true });
    const option = container.querySelector('option[value=""]');
    expect(option).not.toBeNull();
    expect(option?.textContent).toBe('Choose');
  });

  it('renders a modal with the cancel insurance info text', () => {
    renderInsurances({ cancel_insurance: true });
    expect(container.querySelector('[data-testid="modal"]')).not.toBeNull();
    expect(
      container.querySelector('[data-testid="cancel-insurance-text"]')
    ).not.toBeNull();
  });
});

describe('Insurances – date of birth field visibility', () => {
  it('does NOT show the date-of-birth field when cancel_insurance value is "0"', () => {
    renderInsurances({ cancel_insurance: true }, '0');
    expect(container.querySelector('[data-testid="date-field"]')).toBeNull();
  });

  it('does NOT show the date-of-birth field when cancel_insurance value is empty string', () => {
    renderInsurances({ cancel_insurance: true }, '');
    expect(container.querySelector('[data-testid="date-field"]')).toBeNull();
  });

  it('shows the date-of-birth field when cancel_insurance value is "1"', () => {
    renderInsurances({ cancel_insurance: true }, '1');
    const dateField = container.querySelector('[data-testid="date-field"]');
    expect(dateField).not.toBeNull();
    expect(dateField?.getAttribute('data-name')).toBe(
      'extra_fields.date_of_birth'
    );
  });

  it('shows the date-of-birth field when cancel_insurance value is "2"', () => {
    renderInsurances({ cancel_insurance: true }, '2');
    const dateField = container.querySelector('[data-testid="date-field"]');
    expect(dateField).not.toBeNull();
    expect(dateField?.getAttribute('data-name')).toBe(
      'extra_fields.date_of_birth'
    );
  });
});
