import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import type { HouseType } from '../../../../types';
import { AppContext } from '../../../AppContext';
import Months from '../Months';
import { fetchAvailability } from '../../../../_lib/availability';

jest.mock('../../../../_lib/availability', () => ({
  fetchAvailability: jest.fn()
}));

jest.mock('../SingleMonth', () => {
  return function MockSingleMonth({ count }: { count: number }) {
    return <div data-testid={`single-month-${count}`} />;
  };
});

jest.mock('../../../icons/loading.svg', () => () => <div data-testid="loading" />);

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

const mockedFetchAvailability = jest.mocked(fetchAvailability);

let container: HTMLDivElement;
let root: ReturnType<typeof createRoot>;

const house: HouseType = {
  id: 1,
  code: 'HOUSE-1',
  name: 'Test House',
  house_type: 'house',
  persons: 4,
  bedrooms: 2,
  bathrooms: 1,
  minimum_week_price: 1000,
  max_nights: 14,
  babies_extra: 0,
  city: 'Test City',
  province: 'Test Province',
  country_name: 'Test Country',
  description: 'Test description'
};

function flushPromises(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  act(() => {
    root = createRoot(container);
  });
  mockedFetchAvailability.mockReset();
});

afterEach(() => {
  act(() => {
    root.unmount();
  });
  container.remove();
});

function renderMonths(): void {
  act(() => {
    root.render(
      <AppContext.Provider
        value={{
          locale: 'nl',
          portalCode: 'portal',
          objectCode: 'house',
          apiUrl: 'https://api.example.com/graphql'
        }}
      >
        <Months
          house={house}
          numberOfMonths={2}
          numberOfMonthsInARow={2}
          currentMonth={new Date(2025, 0, 15)}
        />
      </AppContext.Provider>
    );
  });
}

describe('Months', () => {
  it('fetches availability and renders months on success', async () => {
    mockedFetchAvailability.mockResolvedValue({
      name: 'House',
      last_minute_days: 0,
      availabilities: [],
      discounts: []
    });

    renderMonths();

    await act(async () => {
      await flushPromises();
    });

    expect(mockedFetchAvailability).toHaveBeenCalledTimes(1);
    expect(mockedFetchAvailability).toHaveBeenCalledWith({
      apiUrl: 'https://api.example.com/graphql',
      locale: 'nl',
      portalCode: 'portal',
      objectCode: 'house',
      startsDate: new Date(2024, 11, 29),
      endDate: new Date(2025, 2, 1, 23, 59, 59, 999)
    });
    expect(container.querySelector('[data-testid="single-month-0"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="single-month-1"]')).not.toBeNull();
  });

  it('renders an error when availability fetch fails', async () => {
    mockedFetchAvailability.mockRejectedValue(new Error('failed'));

    renderMonths();

    await act(async () => {
      await flushPromises();
    });

    expect(container.textContent).toContain('Error');
  });
});
