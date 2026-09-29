import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import Price from '../PriceField/Price';
import { AppContext } from '../../AppContext';
import { TrackEvent } from '../../../_lib/Tracking';
import { PriceUnavailableError } from '../../../_lib/price';
import { resetTrackOnce } from '../../../_lib/track_once';

const mockFetchPrice = jest.fn();
jest.mock('../../../_lib/price', () => ({
  ...jest.requireActual('../../../_lib/price'),
  fetchPrice: (...args: unknown[]) => mockFetchPrice(...args)
}));

jest.mock('../../../_lib/Tracking', () => ({
  ...jest.requireActual('../../../_lib/Tracking'),
  TrackEvent: jest.fn()
}));

jest.mock('../../CurrencyContext', () => ({
  useCurrency: () => ({ currency: 'EUR' })
}));

jest.mock('../../icons/loading.svg', () => () => <div data-testid="loading" />);

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

const mockTrackEvent = TrackEvent as jest.Mock;

let container: HTMLDivElement;
let root: ReturnType<typeof createRoot>;

async function renderPrice(startsAt: string, endsAt: string, persons = 2) {
  act(() => {
    root.render(
      <AppContext.Provider
        value={{
          locale: 'en',
          portalCode: 'TEST',
          objectCode: 'HOUSE1',
          apiUrl: 'https://api.bukazu.com/graphql'
        }}
      >
        <Price
          persons={persons}
          variables={{ starts_at: startsAt, ends_at: endsAt }}
        />
      </AppContext.Provider>
    );
  });
  await act(async () => {
    await Promise.resolve();
  });
}

function remount() {
  act(() => {
    root.unmount();
    root = createRoot(container);
  });
}

beforeEach(() => {
  (window as any).__localeId__ = 'en';
  jest.clearAllMocks();
  resetTrackOnce();
  mockFetchPrice.mockResolvedValue({
    total_price: 1234.565,
    currency: 'EUR',
    optional_house_costs: []
  });
  container = document.createElement('div');
  document.body.appendChild(container);
  act(() => {
    root = createRoot(container);
  });
});

afterEach(() => {
  act(() => {
    root.unmount();
  });
  container.remove();
});

describe('Price tracking', () => {
  it('tracks quote_shown once per stay and persons, also across remounts', async () => {
    await renderPrice('2026-07-01', '2026-07-08');
    remount();
    await renderPrice('2026-07-01', '2026-07-08');

    expect(mockTrackEvent).toHaveBeenCalledTimes(1);
    expect(mockTrackEvent).toHaveBeenCalledWith({
      house_code: 'HOUSE1',
      portal_code: 'TEST',
      locale: 'en',
      interaction_type: 'quote_shown',
      interaction_info: {
        arrival: '2026-07-01',
        departure: '2026-07-08',
        persons: 2,
        total_cents: 123457,
        currency: 'EUR'
      }
    });
  });

  it('tracks another quote when the persons change', async () => {
    await renderPrice('2026-08-01', '2026-08-08', 2);
    await renderPrice('2026-08-01', '2026-08-08', 4);

    expect(mockTrackEvent).toHaveBeenCalledTimes(2);
    expect(mockTrackEvent.mock.calls[1][0].interaction_info.persons).toBe(4);
  });

  it('tracks price_unavailable once for a stay without prices', async () => {
    mockFetchPrice.mockRejectedValue(
      new PriceUnavailableError('2026-09-01', '2026-09-08')
    );

    await renderPrice('2026-09-01', '2026-09-08');
    remount();
    await renderPrice('2026-09-01', '2026-09-08');

    expect(mockTrackEvent).toHaveBeenCalledTimes(1);
    expect(mockTrackEvent).toHaveBeenCalledWith({
      house_code: 'HOUSE1',
      portal_code: 'TEST',
      locale: 'en',
      interaction_type: 'price_unavailable',
      interaction_info: { arrival: '2026-09-01', departure: '2026-09-08' }
    });
  });

  it('tracks price_unavailable once per stay whatever the persons', async () => {
    mockFetchPrice.mockRejectedValue(
      new PriceUnavailableError('2026-09-01', '2026-09-08')
    );

    await renderPrice('2026-09-01', '2026-09-08', 2);
    await renderPrice('2026-09-01', '2026-09-08', 4);

    expect(mockTrackEvent).toHaveBeenCalledTimes(1);
  });

  it('does not track other price errors', async () => {
    mockFetchPrice.mockRejectedValue(new Error('500'));

    await renderPrice('2026-10-01', '2026-10-08');

    expect(mockTrackEvent).not.toHaveBeenCalled();
  });
});
