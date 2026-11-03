import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import Price from '../Price';
import { AppContext } from '../../../AppContext';
import { fetchPrice, PriceUnavailableError } from '../../../../_lib/price';
import { t } from '../../../../intl';

jest.mock('../../../../_lib/price', () => ({
  ...jest.requireActual('../../../../_lib/price'),
  fetchPrice: jest.fn()
}));
jest.mock('../../../icons/loading.svg', () => () => (
  <div data-testid="loading" />
));

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

const mockedFetchPrice = jest.mocked(fetchPrice);

let container: HTMLDivElement;
let root: ReturnType<typeof createRoot>;

beforeEach(() => {
  (window as any).__localeId__ = 'en';
  container = document.createElement('div');
  document.body.appendChild(container);
  act(() => {
    root = createRoot(container);
  });
  mockedFetchPrice.mockReset();
});

afterEach(() => {
  act(() => {
    root.unmount();
  });
  container.remove();
});

async function render() {
  await act(async () => {
    root.render(
      <AppContext.Provider
        value={{
          locale: 'en',
          portalCode: 'portal',
          objectCode: 'house',
          apiUrl: 'https://api.example.com'
        }}
      >
        <Price
          persons={2}
          variables={{ starts_at: '2030-06-03', ends_at: '2030-06-10' }}
        />
      </AppContext.Provider>
    );
    await Promise.resolve();
  });
}

describe('Price', () => {
  it('shows a spinner while loading', async () => {
    mockedFetchPrice.mockReturnValue(new Promise(() => undefined));
    await render();
    expect(container.querySelector('.bu-stay-price-loading')).not.toBeNull();
    expect(container.querySelector('[data-testid="loading"]')).not.toBeNull();
  });

  it('shows the rounded total and the persons it is based on', async () => {
    mockedFetchPrice.mockResolvedValue({
      total_price: 1234.6,
      currency: 'EUR'
    } as any);
    await render();
    expect(mockedFetchPrice).toHaveBeenCalledWith(
      expect.objectContaining({
        startsAt: '2030-06-03',
        endsAt: '2030-06-10',
        persons: 2
      })
    );
    expect(container.querySelector('.bu-stay-price-value')?.textContent).toBe(
      '€1,235.00'
    );
    expect(container.querySelector('.bu-stay-price-hint')?.textContent).toBe(
      'Based on 2 persons'
    );
  });

  it('explains when no price exists for the period', async () => {
    mockedFetchPrice.mockRejectedValue(new PriceUnavailableError());
    await render();
    expect(container.querySelector('.bu-stay-price-error')?.textContent).toBe(
      t('no_prices_available_for_period')
    );
  });

  it('shows the generic message on any other failure', async () => {
    mockedFetchPrice.mockRejectedValue(new Error('boom'));
    await render();
    expect(container.querySelector('.bu-stay-price-error')?.textContent).toBe(
      t('something_went_wrong_please_try_again')
    );
  });
});
