import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import DiscountCode from '../DiscountCode';
import { AppContext } from '../../../AppContext';
import { BookingFormContext } from '../../BookingFormContext';
import { DiscountCodeError } from '../../../../_lib/discount_code';
import { HouseType } from '../../../../types';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock('../../../../_lib/discount_code', () => {
  const actual = jest.requireActual('../../../../_lib/discount_code');
  return { ...actual, fetchDiscountCode: jest.fn() };
});

import { fetchDiscountCode } from '../../../../_lib/discount_code';

const mockFetch = fetchDiscountCode as jest.MockedFunction<
  typeof fetchDiscountCode
>;

const baseHouse = {
  id: 1,
  code: 'HOUSE1',
  name: 'Test House',
  house_type: 'house',
  persons: 4,
  max_nights: 14,
  babies_extra: 0
} as unknown as HouseType;

const appContext = {
  locale: 'nl' as const,
  portalCode: 'PORTAL1',
  objectCode: 'HOUSE1',
  apiUrl: 'https://api.bukazu.com/graphql'
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
  jest.clearAllMocks();
});

afterEach(() => {
  delete (window as any).__localeId__;
  act(() => {
    root.unmount();
  });
  container.remove();
});

/** Wrapper that keeps the discount_code field value, so the input is really controlled. */
function Wrapper() {
  const [value, setValue] = React.useState('');
  const formContext = {
    values: { discount_code: value } as any,
    errors: {},
    touched: {},
    isSubmitting: false,
    setFieldValue: (_name: string, fieldValue: unknown) =>
      setValue(String(fieldValue)),
    setFieldTouched: () => undefined
  };

  return (
    <AppContext.Provider value={appContext}>
      <BookingFormContext.Provider value={formContext}>
        <DiscountCode house={baseHouse} />
      </BookingFormContext.Provider>
    </AppContext.Provider>
  );
}

function renderDiscountCode() {
  act(() => {
    root.render(<Wrapper />);
  });
}

/** Type a code into the input and blur it, which is what triggers the lookup. */
async function enterCode(code: string) {
  const input = container.querySelector('input') as HTMLInputElement;
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    'value'
  )!.set!;

  await act(async () => {
    nativeInputValueSetter.call(input, code);
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });

  await act(async () => {
    input.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
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
    expect(container.querySelector('input')).not.toBeNull();
  });

  it('renders inside a form-row inline container', () => {
    renderDiscountCode();
    expect(container.querySelector('.form-row.inline')).not.toBeNull();
  });

  it('shows no result or message before a code is entered', () => {
    renderDiscountCode();
    expect(container.querySelectorAll('.bu_discount_code')).toHaveLength(0);
  });
});

describe('DiscountCode – looking a code up', () => {
  it('looks the code up on blur, with the portal, accommodation and locale', async () => {
    mockFetch.mockResolvedValue({
      name: 'SUMMER20',
      use_price: false,
      percentage: 20,
      price: null,
      currency: 'EUR'
    });
    renderDiscountCode();

    await enterCode('SUMMER20');

    expect(mockFetch).toHaveBeenCalledWith({
      apiUrl: 'https://api.bukazu.com/graphql',
      locale: 'nl',
      portalCode: 'PORTAL1',
      objectCode: 'HOUSE1',
      code: 'SUMMER20'
    });
  });

  it('does not look anything up while typing', async () => {
    renderDiscountCode();
    const input = container.querySelector('input') as HTMLInputElement;
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      'value'
    )!.set!;

    await act(async () => {
      nativeInputValueSetter.call(input, 'SUMM');
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('does not look up an empty code', async () => {
    renderDiscountCode();

    await enterCode('   ');

    expect(mockFetch).not.toHaveBeenCalled();
    expect(container.querySelectorAll('.bu_discount_code')).toHaveLength(0);
  });

  it('shows the loading text while the lookup is in flight', async () => {
    let resolveLookup: (value: any) => void = () => undefined;
    mockFetch.mockReturnValue(
      new Promise((resolve) => {
        resolveLookup = resolve;
      })
    );
    renderDiscountCode();

    await enterCode('SUMMER20');
    expect(container.querySelector('.bu_discount_code')?.textContent).toBe(
      'Loading...'
    );

    await act(async () => {
      resolveLookup({
        name: 'SUMMER20',
        use_price: false,
        percentage: 20,
        price: null,
        currency: 'EUR'
      });
    });
    expect(container.textContent).toContain('SUMMER20');
  });
});

describe('DiscountCode – success state', () => {
  it('shows the discount name and percentage when use_price is false', async () => {
    mockFetch.mockResolvedValue({
      name: 'SAVE20',
      use_price: false,
      percentage: 20,
      price: null,
      currency: 'EUR'
    });
    renderDiscountCode();

    await enterCode('SAVE20');

    expect(container.textContent).toContain('SAVE20');
    expect(container.textContent).toContain('20%');
  });

  it('formats the price in the currency of the response when use_price is true', async () => {
    mockFetch.mockResolvedValue({
      name: 'FLATDEAL',
      use_price: true,
      percentage: null,
      price: 50,
      currency: 'EUR'
    });
    renderDiscountCode();

    await enterCode('FLATDEAL');

    expect(container.textContent).toContain('FLATDEAL');
    expect(container.textContent).toContain('€50.00');
  });

  it('uses a non-euro currency when the portal is priced in one', async () => {
    mockFetch.mockResolvedValue({
      name: 'FLATDEAL',
      use_price: true,
      percentage: null,
      price: 50,
      currency: 'GBP'
    });
    renderDiscountCode();

    await enterCode('FLATDEAL');

    expect(container.textContent).toContain('£50.00');
    expect(container.textContent).not.toContain('€');
  });

  it('clears an earlier result when the field is emptied', async () => {
    mockFetch.mockResolvedValue({
      name: 'SAVE20',
      use_price: false,
      percentage: 20,
      price: null,
      currency: 'EUR'
    });
    renderDiscountCode();
    await enterCode('SAVE20');
    expect(container.textContent).toContain('SAVE20');

    await enterCode('');

    expect(container.querySelectorAll('.bu_discount_code')).toHaveLength(0);
  });
});

describe('DiscountCode – failure states', () => {
  it('shows "No discount found with entered code" on a 404', async () => {
    mockFetch.mockRejectedValue(new DiscountCodeError(404));
    renderDiscountCode();

    await enterCode('NOPE');

    expect(container.querySelector('.bu_discount_code')?.textContent).toBe(
      'No discount found with entered code'
    );
  });

  it('shows the generic error message on a server error', async () => {
    mockFetch.mockRejectedValue(new DiscountCodeError(500));
    renderDiscountCode();

    await enterCode('SUMMER20');

    expect(container.querySelector('.bu_discount_code')?.textContent).toBe(
      'Oops, something went wrong, please try again later.'
    );
  });

  it('shows the generic error message when the request never reaches the API', async () => {
    mockFetch.mockRejectedValue(new Error('Network failure'));
    renderDiscountCode();

    await enterCode('SUMMER20');

    expect(container.querySelector('.bu_discount_code')?.textContent).toBe(
      'Oops, something went wrong, please try again later.'
    );
  });

  it('drops a stale response that lands after a newer one', async () => {
    let resolveFirst: (value: any) => void = () => undefined;
    mockFetch.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveFirst = resolve;
      })
    );
    mockFetch.mockResolvedValueOnce({
      name: 'SECOND',
      use_price: false,
      percentage: 10,
      price: null,
      currency: 'EUR'
    });
    renderDiscountCode();

    await enterCode('FIRST');
    await enterCode('SECOND');
    expect(container.textContent).toContain('SECOND');

    await act(async () => {
      resolveFirst({
        name: 'FIRST',
        use_price: false,
        percentage: 50,
        price: null,
        currency: 'EUR'
      });
    });

    expect(container.textContent).toContain('SECOND');
    expect(container.textContent).not.toContain('FIRST');
  });
});
