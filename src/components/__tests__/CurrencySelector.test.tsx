import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import CurrencySelector from '../CurrencySelector';
import { CurrencyProvider, useCurrency } from '../CurrencyContext';
import type { SettingsCurrencies } from '../../_lib/currencies';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

const multiCurrency: SettingsCurrencies = {
  multi_currency: true,
  default: 'EUR',
  allowed: ['EUR', 'USD']
};

let container: HTMLDivElement;
let root: ReturnType<typeof createRoot>;

function CurrentCurrency(): JSX.Element {
  const { currency } = useCurrency();
  return <span data-testid="current">{currency ?? 'none'}</span>;
}

function renderSelector(currencies?: SettingsCurrencies) {
  act(() => {
    root.render(
      <CurrencyProvider currencies={currencies}>
        <CurrencySelector />
        <CurrentCurrency />
      </CurrencyProvider>
    );
  });
}

function select(): HTMLSelectElement | null {
  return container.querySelector('select');
}

function current(): string | undefined {
  return container.querySelector('[data-testid="current"]')?.textContent ?? undefined;
}

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  act(() => {
    root = createRoot(container);
  });
  window.localStorage.clear();
});

afterEach(() => {
  act(() => {
    root.unmount();
  });
  container.remove();
  window.localStorage.clear();
});

describe('CurrencySelector', () => {
  it('is inert outside a CurrencyProvider (default context)', () => {
    function SelectOutsideProvider(): JSX.Element {
      const { currency, setCurrency } = useCurrency();
      return (
        <button
          type="button"
          onClick={() => {
            setCurrency('USD');
          }}
        >
          {currency ?? 'none'}
        </button>
      );
    }

    act(() => {
      root.render(
        <>
          <CurrencySelector />
          <SelectOutsideProvider />
        </>
      );
    });

    expect(select()).toBeNull();

    act(() => {
      container.querySelector('button')!.click();
    });

    expect(container.querySelector('button')?.textContent).toBe('none');
  });

  it('renders nothing when the settings carry no currency configuration', () => {
    renderSelector(undefined);

    expect(select()).toBeNull();
    expect(current()).toBe('none');
  });

  it('renders nothing when multi-currency is off', () => {
    renderSelector({ multi_currency: false, default: 'EUR', allowed: ['EUR', 'USD'] });

    expect(select()).toBeNull();
    expect(current()).toBe('none');
  });

  it('renders nothing when only one currency is allowed', () => {
    renderSelector({ multi_currency: true, default: 'EUR', allowed: ['EUR'] });

    expect(select()).toBeNull();
  });

  it('offers every allowed currency, defaulting to the portal default', () => {
    renderSelector(multiCurrency);

    const options = Array.from(container.querySelectorAll('option'));
    expect(options.map((option) => option.value)).toEqual(['EUR', 'USD']);
    expect(select()?.value).toBe('EUR');
    expect(current()).toBe('EUR');
  });

  it('changes the selected currency and persists it', () => {
    renderSelector(multiCurrency);

    act(() => {
      const element = select()!;
      element.value = 'USD';
      element.dispatchEvent(new Event('change', { bubbles: true }));
    });

    expect(current()).toBe('USD');
    expect(window.localStorage.getItem('bukazuCurrency')).toBe('USD');
  });

  it('restores a stored currency that is still allowed', () => {
    window.localStorage.setItem('bukazuCurrency', 'USD');

    renderSelector(multiCurrency);

    expect(current()).toBe('USD');
  });

  it('falls back to the default when the stored currency is not allowed', () => {
    window.localStorage.setItem('bukazuCurrency', 'GBP');

    renderSelector(multiCurrency);

    expect(current()).toBe('EUR');
  });

  it('ignores a selection outside the allowed list', () => {
    function SelectInvalid(): JSX.Element {
      const { setCurrency } = useCurrency();
      return (
        <button
          type="button"
          onClick={() => {
            setCurrency('GBP');
          }}
        >
          set
        </button>
      );
    }

    act(() => {
      root.render(
        <CurrencyProvider currencies={multiCurrency}>
          <SelectInvalid />
          <CurrentCurrency />
        </CurrencyProvider>
      );
    });

    act(() => {
      container.querySelector('button')!.click();
    });

    expect(current()).toBe('EUR');
    expect(window.localStorage.getItem('bukazuCurrency')).toBeNull();
  });
});
