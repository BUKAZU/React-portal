import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { Formik } from 'formik';
import Guests from '../Guests';
import { BookingFormConfigurationType, HouseType } from '../../../../types';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

// Mock NumberSelect to render a simple labelled div so we can assert presence
jest.mock('../../FormItems', () => ({
  NumberSelect: ({ name, label, description }: any) => (
    <div data-testid={`number-select-${name}`}>
      <span data-testid={`label-${name}`}>{label}</span>
      <span data-testid={`description-${name}`}>{description}</span>
    </div>
  )
}));

const baseHouse: HouseType = {
  id: 1,
  code: 'TEST',
  name: 'Test House',
  house_type: 'house',
  persons: 4,
  bedrooms: 2,
  bathrooms: 1,
  minimum_week_price: 500,
  max_nights: 14,
  babies_extra: 0,
  city: 'Amsterdam',
  province: 'NH',
  country_name: 'Netherlands',
  description: ''
} as any;

const baseConfig: BookingFormConfigurationType = {
  adultsFromAge: 18,
  babiesAllowed: true,
  babiesTillAge: 2,
  childrenAllowed: true,
  childrenFromAge: 3,
  childrenTillAge: 17,
  languageSelectorVisible: false,
  redirectUrl: '',
  redirectUrl_nl: '',
  redirectUrl_en: '',
  redirectUrl_de: '',
  redirectUrl_fr: '',
  redirectUrl_es: '',
  redirectUrl_it: '',
  showDiscountCode: false,
  showMonthsAmount: 2,
  showMonthsInARowAmount: 2
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

function renderGuests(configPatch: Partial<BookingFormConfigurationType> = {}) {
  const config = { ...baseConfig, ...configPatch };
  act(() => {
    root.render(
      <Formik initialValues={{}} onSubmit={() => {}}>
        <Guests bookingFormConfiguration={config} house={baseHouse} />
      </Formik>
    );
  });
}

describe('Guests', () => {
  it('always renders the adults NumberSelect', () => {
    renderGuests();
    expect(container.querySelector('[data-testid="number-select-adults"]')).not.toBeNull();
  });

  it('renders children NumberSelect when childrenAllowed is true', () => {
    renderGuests({ childrenAllowed: true });
    expect(container.querySelector('[data-testid="number-select-children"]')).not.toBeNull();
  });

  it('does not render children NumberSelect when childrenAllowed is false', () => {
    renderGuests({ childrenAllowed: false });
    expect(container.querySelector('[data-testid="number-select-children"]')).toBeNull();
  });

  it('renders babies NumberSelect when babiesAllowed is true', () => {
    renderGuests({ babiesAllowed: true });
    expect(container.querySelector('[data-testid="number-select-babies"]')).not.toBeNull();
  });

  it('does not render babies NumberSelect when babiesAllowed is false', () => {
    renderGuests({ babiesAllowed: false });
    expect(container.querySelector('[data-testid="number-select-babies"]')).toBeNull();
  });
});
