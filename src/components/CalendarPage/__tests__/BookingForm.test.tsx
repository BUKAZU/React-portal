import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import BookingForm from '../BookingForm';
import { AppContext } from '../../AppContext';
import { CalendarContext } from '../CalendarParts/CalendarContext';
import { fetchPrice, PriceUnavailableError } from '../../../_lib/price';
import type { BookingType } from '../calender_types';
import type { BuDate } from '../../../types';

jest.mock('../../../_lib/price', () => ({
  ...jest.requireActual('../../../_lib/price'),
  fetchPrice: jest.fn()
}));
jest.mock('../../../_lib/Tracking', () => ({
  getSessionIdentifier: jest.fn(() => 'test-session'),
  TrackEvent: jest.fn()
}));
jest.mock('../../icons/loading.svg', () => () => <div data-testid="loading" />);
jest.mock('../FormCreator', () => ({ house }: { house: any }) => (
  <div data-testid="form-creator">
    {house.name}:{house.booking_price.optional_house_costs.length}:
    {house.booking_price.optional_house_costs[0]?.id}
  </div>
));

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

const mockedFetchPrice = jest.mocked(fetchPrice);

const arrival: BuDate = {
  date: '2030-06-03',
  arrival: true,
  departure: false,
  min_nights: 3,
  max_nights: 14,
  special_offer: 0
};
const departure: BuDate = { ...arrival, date: '2030-06-10', departure: true };
const booking: BookingType = {
  selectedDate: new Date(2030, 5, 3),
  arrivalDate: arrival,
  departureDate: departure,
  bookingStarted: true,
  persons: 2
};
const accommodation = { id: 1, code: 'H1', name: 'Chalet', persons: 6 };
const priceResponse = (name = 'Chalet') => ({
  total_price: 1100,
  currency: 'EUR',
  optional_house_costs: [
    {
      id: 11,
      name: 'Linen',
      method: 'per_person',
      max_available: 6,
      amount: 12.5,
      method_name: 'per person',
      description: 'Fresh linen'
    }
  ],
  accommodation: { ...accommodation, name }
});

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

async function render(state: BookingType = booking) {
  await act(async () => {
    root.render(
      <AppContext.Provider
        value={{
          locale: 'en',
          portalCode: 'TEST',
          objectCode: 'H1',
          apiUrl: 'https://api.example.com'
        }}
      >
        <CalendarContext.Provider value={state}>
          <BookingForm portalSite={{} as any} />
        </CalendarContext.Provider>
      </AppContext.Provider>
    );
    await Promise.resolve();
  });
}

describe('BookingForm', () => {
  it('shows a spinner until the price with the accommodation arrives', async () => {
    mockedFetchPrice.mockReturnValue(new Promise(() => undefined));
    await render();
    expect(container.querySelector('[data-testid="loading"]')).not.toBeNull();
  });

  it('builds the house with its bookable extras and renders the form', async () => {
    mockedFetchPrice.mockResolvedValue(priceResponse() as any);
    await render();
    expect(mockedFetchPrice).toHaveBeenCalledWith(
      expect.objectContaining({
        startsAt: '2030-06-03',
        endsAt: '2030-06-10',
        includeAccommodation: true
      })
    );
    expect(
      container.querySelector('[data-testid="form-creator"]')?.textContent
    ).toBe('Chalet:1:11');
  });

  it('keeps the form mounted while the dates change', async () => {
    mockedFetchPrice.mockResolvedValue(priceResponse() as any);
    await render();
    mockedFetchPrice.mockReturnValue(new Promise(() => undefined));
    await render({
      ...booking,
      arrivalDate: { ...arrival, date: '2030-07-01' },
      departureDate: { ...departure, date: '2030-07-08' }
    });
    expect(mockedFetchPrice).toHaveBeenCalledTimes(2);
    expect(container.querySelector('[data-testid="loading"]')).toBeNull();
    expect(
      container.querySelector('[data-testid="form-creator"]')
    ).not.toBeNull();
  });

  it('explains when the period has no price', async () => {
    mockedFetchPrice.mockRejectedValue(new PriceUnavailableError());
    await render();
    expect(container.textContent).toContain('No prices');
  });

  it('shows the generic message on other failures and on a response without accommodation', async () => {
    mockedFetchPrice.mockRejectedValue(new Error('down'));
    await render();
    expect(container.textContent).toContain('something went wrong');

    mockedFetchPrice.mockResolvedValue({
      ...priceResponse(),
      accommodation: undefined
    } as any);
    act(() => {
      root.unmount();
    });
    act(() => {
      root = createRoot(container);
    });
    await render();
    expect(container.textContent).toContain('something went wrong');
  });
});
