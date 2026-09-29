import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import BookingForm from '../BookingForm';
import { AppContext } from '../../AppContext';
import { CalendarContext } from '../CalendarParts/CalendarContext';
import { TrackEvent } from '../../../_lib/Tracking';
import type { AppPortalSite } from '../../loadPortalSite';
import type { BuDate } from '../../../types';

const mockFetchPrice = jest.fn();
jest.mock('../../../_lib/price', () => ({
  ...jest.requireActual('../../../_lib/price'),
  fetchPrice: (...args: unknown[]) => mockFetchPrice(...args)
}));

jest.mock('../../../_lib/Tracking', () => ({
  getSessionIdentifier: jest.fn(() => 'test-session'),
  TrackEvent: jest.fn()
}));

jest.mock('../../CurrencyContext', () => ({
  useCurrency: () => ({ currency: 'EUR' })
}));

jest.mock('../FormCreator', () => () => <div data-testid="form-creator" />);

jest.mock('../../icons/loading.svg', () => () => (
  <div data-testid="loading-icon" />
));

(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const mockTrackEvent = TrackEvent as jest.Mock;

function day(date: string): BuDate {
  return {
    date,
    arrival: true,
    departure: true,
    min_nights: 1,
    max_nights: 14,
    special_offer: 0
  };
}

let container: HTMLDivElement;
let root: ReturnType<typeof createRoot>;

function renderForm(arrival: string, departure: string) {
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
        <CalendarContext.Provider
          value={{
            selectedDate: null,
            arrivalDate: day(arrival),
            departureDate: day(departure),
            bookingStarted: true,
            persons: 2
          }}
        >
          <BookingForm portalSite={{} as AppPortalSite} />
        </CalendarContext.Provider>
      </AppContext.Provider>
    );
  });
}

async function flush() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  mockFetchPrice.mockResolvedValue({
    total_price: 1500,
    currency: 'EUR',
    optional_house_costs: [],
    accommodation: { id: 'HOUSE1', name: 'House' }
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

describe('BookingForm tracking', () => {
  it('tracks booking_started once the form is shown', async () => {
    renderForm('2025-07-01', '2025-07-08');
    await flush();

    expect(mockTrackEvent).toHaveBeenCalledTimes(1);
    expect(mockTrackEvent).toHaveBeenCalledWith({
      house_code: 'HOUSE1',
      portal_code: 'TEST',
      locale: 'en',
      interaction_type: 'booking_started',
      interaction_info: {
        arrival_date: '2025-07-01',
        departure_date: '2025-07-08'
      }
    });
  });

  it('does not track while the price is loading', () => {
    mockFetchPrice.mockReturnValue(new Promise(() => {}));

    renderForm('2025-07-01', '2025-07-08');

    expect(mockTrackEvent).not.toHaveBeenCalled();
  });

  it('does not track again when re-rendered for the same stay', async () => {
    renderForm('2025-07-01', '2025-07-08');
    await flush();
    renderForm('2025-07-01', '2025-07-08');
    await flush();

    expect(mockTrackEvent).toHaveBeenCalledTimes(1);
  });

  it('tracks again when the dates change', async () => {
    renderForm('2025-07-01', '2025-07-08');
    await flush();
    renderForm('2025-07-08', '2025-07-15');
    await flush();

    expect(mockTrackEvent).toHaveBeenCalledTimes(2);
    expect(mockTrackEvent).toHaveBeenLastCalledWith(
      expect.objectContaining({
        interaction_info: {
          arrival_date: '2025-07-08',
          departure_date: '2025-07-15'
        }
      })
    );
  });

  it('does not track new dates until their price has loaded', async () => {
    renderForm('2025-07-01', '2025-07-08');
    await flush();
    mockFetchPrice.mockReturnValue(new Promise(() => {}));

    renderForm('2025-07-08', '2025-07-15');
    await flush();

    expect(mockTrackEvent).toHaveBeenCalledTimes(1);
  });

  it('does not track when the price request fails', async () => {
    mockFetchPrice.mockRejectedValue(new Error('unavailable'));

    renderForm('2025-07-01', '2025-07-08');
    await flush();

    expect(mockTrackEvent).not.toHaveBeenCalled();
  });

  it('tracks a stay once when returning to earlier dates', async () => {
    renderForm('2025-07-01', '2025-07-08');
    await flush();
    renderForm('2025-07-08', '2025-07-15');
    await flush();
    renderForm('2025-07-01', '2025-07-08');
    await flush();

    expect(mockTrackEvent).toHaveBeenCalledTimes(2);
  });
});
