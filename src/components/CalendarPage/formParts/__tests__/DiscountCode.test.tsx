import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import DiscountCode from '../DiscountCode';
import { HouseType } from '../../../../types';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock('@apollo/client', () => ({
  useMutation: jest.fn(() => [
    jest.fn().mockResolvedValue({}),
    { loading: false, error: null, data: null }
  ]),
  gql: (q: TemplateStringsArray) => q
}));

jest.mock('../../../../_lib/gql', () => ({
  CHECK_DISCOUNT_CODE: 'CHECK_DISCOUNT_CODE'
}));

const baseHouse = {
  id: 1,
  code: 'HOUSE1',
  name: 'Test House',
  house_type: 'house',
  persons: 4,
  max_nights: 14,
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
  jest.clearAllMocks();
});

afterEach(() => {
  delete (window as any).__localeId__;
  act(() => {
    root.unmount();
  });
  container.remove();
});

function renderDiscountCode(mutationState: {
  loading?: boolean;
  error?: any;
  data?: any;
} = {}) {
  const { loading = false, error = null, data = null } = mutationState;
  const { useMutation } = require('@apollo/client');
  (useMutation as jest.Mock).mockReturnValue([
    jest.fn().mockResolvedValue({}),
    { loading, error, data }
  ]);

  act(() => {
    root.render(<DiscountCode house={baseHouse} />);
  });
}

describe('DiscountCode – basic rendering', () => {
  it('renders the "Discount code" label', () => {
    renderDiscountCode();
    const label = container.querySelector('label[for="discount_code"]');
    expect(label?.textContent).toBe('Discount code');
  });

  it('renders a text input for the discount code', () => {
    renderDiscountCode();
    const input = container.querySelector('input');
    expect(input).not.toBeNull();
  });

  it('renders inside a form-row inline container', () => {
    renderDiscountCode();
    expect(container.querySelector('.form-row.inline')).not.toBeNull();
  });
});

describe('DiscountCode – loading state', () => {
  it('shows "Loading..." text while the mutation is in flight', () => {
    renderDiscountCode({ loading: true });
    const loadingDiv = container.querySelector('.bu_discount_code');
    expect(loadingDiv).not.toBeNull();
    expect(loadingDiv?.textContent).toBe('Loading...');
  });

  it('does not show loading text when not loading', () => {
    renderDiscountCode({ loading: false });
    // No .bu_discount_code unless there is data or error
    const divs = container.querySelectorAll('.bu_discount_code');
    expect(divs).toHaveLength(0);
  });
});

describe('DiscountCode – error state', () => {
  it('shows "No discount found with entered code" when there is an error', () => {
    renderDiscountCode({ error: { message: 'Not found' } });
    const errorDiv = container.querySelector('.bu_discount_code');
    expect(errorDiv).not.toBeNull();
    expect(errorDiv?.textContent).toBe('No discount found with entered code');
  });
});

describe('DiscountCode – success state', () => {
  it('shows the discount name when data is returned', () => {
    renderDiscountCode({
      data: {
        checkDiscountCode: {
          name: 'SUMMER20',
          percentage: 20,
          use_price: false,
          price: 0
        }
      }
    });
    expect(container.textContent).toContain('SUMMER20');
  });

  it('shows the percentage when use_price is false', () => {
    renderDiscountCode({
      data: {
        checkDiscountCode: {
          name: 'SAVE20',
          percentage: 20,
          use_price: false,
          price: 0
        }
      }
    });
    expect(container.textContent).toContain('20%');
  });

  it('shows the price amount when use_price is true', () => {
    renderDiscountCode({
      data: {
        checkDiscountCode: {
          name: 'FLATDEAL',
          percentage: 0,
          use_price: true,
          price: 50
        }
      }
    });
    expect(container.textContent).toContain('50');
    expect(container.textContent).toContain('€');
  });
});

describe('DiscountCode – input interaction', () => {
  it('calls the checkCode mutation when the input value changes', async () => {
    const mockCheckCode = jest.fn().mockResolvedValue({});
    const { useMutation } = require('@apollo/client');
    (useMutation as jest.Mock).mockReturnValue([
      mockCheckCode,
      { loading: false, error: null, data: null }
    ]);

    act(() => {
      root.render(<DiscountCode house={baseHouse} />);
    });

    const input = container.querySelector('input') as HTMLInputElement;
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      'value'
    )!.set!;

    await act(async () => {
      nativeInputValueSetter.call(input, 'PROMO10');
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });

    expect(mockCheckCode).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: { code: 'PROMO10', house_code: 'HOUSE1' }
      })
    );
  });
});
