import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { Formik } from 'formik';
import Discount from '../discount';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

const baseHouse = {
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
};

const baseValues = {
  arrivalDate: {} as any,
  departureDate: {} as any,
  is_option: 'false' as const,
  costs: null,
  adults: 2,
  children: 0,
  babies: 0,
  persons: 2,
  discount: 0,
  country: 0,
  cancel_insurance: '0' as const,
  discount_code: ''
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

function renderDiscount(
  housePatch: Partial<typeof baseHouse> = {},
  errors: Record<string, string | undefined> = {}
) {
  const house = { ...baseHouse, ...housePatch } as any;

  act(() => {
    root.render(
      <Formik initialValues={baseValues} onSubmit={() => {}}>
        <Discount
          errors={errors}
          house={house}
          values={baseValues}
        />
      </Formik>
    );
  });
}

describe('Discount – renders nothing', () => {
  it('returns null when house has no discounts', () => {
    renderDiscount({ discounts: undefined });
    expect(container.querySelector('.form-section')).toBeNull();
  });

  it('returns null when discounts is "0"', () => {
    renderDiscount({ discounts: '0' });
    expect(container.querySelector('.form-section')).toBeNull();
  });
});

describe('Discount – discount select branch', () => {
  it('renders the form-section container when house has discounts', () => {
    renderDiscount({ discounts: '10,20' });
    expect(container.querySelector('.form-section')).not.toBeNull();
  });

  it('renders a select element with one <option> per discount value', () => {
    renderDiscount({ discounts: '10,20,30' });
    const options = container.querySelectorAll('select option');
    expect(options).toHaveLength(3);
  });

  it('renders the correct option text including the % sign', () => {
    renderDiscount({ discounts: '15' });
    const option = container.querySelector('select option');
    expect(option?.textContent).toBe('15%');
  });

  it('renders a discount_reason input', () => {
    renderDiscount({ discounts: '10' });
    const input = container.querySelector('input[name="discount_reason"]');
    expect(input).not.toBeNull();
  });

  it('shows the discount_reason error message when an error is present', () => {
    renderDiscount({ discounts: '10' }, {
      discount_reason: 'Reason is required.'
    });
    const errorDiv = container.querySelector('.error-message');
    expect(errorDiv).not.toBeNull();
    expect(errorDiv?.textContent).toBe('Reason is required.');
  });

  it('does not show a discount_reason error when there is no error', () => {
    renderDiscount({ discounts: '10' });
    expect(container.querySelector('.error-message')).toBeNull();
  });

  it('renders discounts_info text when provided', () => {
    renderDiscount({ discounts: '10', discounts_info: 'Special rates apply.' });
    expect(container.textContent).toContain('Special rates apply.');
  });
});
