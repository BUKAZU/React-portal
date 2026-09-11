import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import type { HouseType } from '../../../../types';
import { AppContext } from '../../../AppContext';
import Months from '../Months';
import { fetchAvailability } from '../../../../_lib/availability';
import {
  addMonths,
  startOfMonth,
  subMonths
} from '../../../../_lib/date_helper';

jest.mock('../../../../_lib/availability', () => ({
  fetchAvailability: jest.fn()
}));

// Surface the navigation props so the paging logic can be exercised without
// the real month grid.
jest.mock('../SingleMonth', () => {
  return function MockSingleMonth({
    count,
    onPrev,
    onNext,
    prevDisabled
  }: {
    count: number;
    onPrev?: () => void;
    onNext?: () => void;
    prevDisabled?: boolean;
  }) {
    return (
      <div data-testid={`single-month-${count}`}>
        {onPrev && (
          <button data-testid={`prev-${count}`} onClick={onPrev}>
            {prevDisabled ? 'prev-disabled' : 'prev'}
          </button>
        )}
        {onNext && (
          <button data-testid={`next-${count}`} onClick={onNext}>
            next
          </button>
        )}
      </div>
    );
  };
});

jest.mock('../../../icons/loading.svg', () => () => (
  <div data-testid="loading" />
));

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

const mockedFetchAvailability = jest.mocked(fetchAvailability);
const house = { max_nights: 14, last_minute_days: 0 } as HouseType;

let container: HTMLDivElement;
let root: ReturnType<typeof createRoot>;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  act(() => {
    root = createRoot(container);
  });
  mockedFetchAvailability.mockReset();
  mockedFetchAvailability.mockResolvedValue({
    name: 'House',
    last_minute_days: 0,
    availabilities: [],
    discounts: []
  });
});

afterEach(() => {
  act(() => {
    root.unmount();
  });
  container.remove();
});

async function renderMonths(
  currentMonth: Date,
  changeMonth?: jest.Mock,
  perRow = 2
) {
  await act(async () => {
    root.render(
      <AppContext.Provider
        value={{
          locale: 'nl',
          portalCode: 'portal',
          objectCode: 'house',
          apiUrl: 'https://api.example.com'
        }}
      >
        <Months
          house={house}
          numberOfMonths={2}
          numberOfMonthsInARow={perRow}
          currentMonth={currentMonth}
          changeMonth={changeMonth}
        />
      </AppContext.Provider>
    );
    await Promise.resolve();
  });
}

describe('Months navigation', () => {
  it('puts previous on the first month and next on the last', async () => {
    const changeMonth = jest.fn();
    const future = addMonths(startOfMonth(new Date()), 3);
    await renderMonths(future, changeMonth);

    expect(container.querySelector('[data-testid="prev-0"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="next-0"]')).toBeNull();
    expect(container.querySelector('[data-testid="prev-1"]')).toBeNull();
    expect(container.querySelector('[data-testid="next-1"]')).not.toBeNull();

    act(() => {
      (
        container.querySelector('[data-testid="prev-0"]') as HTMLElement
      ).click();
    });
    expect(changeMonth).toHaveBeenCalledWith(subMonths(future, 2));
    act(() => {
      (
        container.querySelector('[data-testid="next-1"]') as HTMLElement
      ).click();
    });
    expect(changeMonth).toHaveBeenCalledWith(addMonths(future, 2));
    expect(container.querySelector('[data-testid="prev-0"]')?.textContent).toBe(
      'prev'
    );
  });

  it('disables paging back from the current month', async () => {
    await renderMonths(new Date(), jest.fn());
    expect(container.querySelector('[data-testid="prev-0"]')?.textContent).toBe(
      'prev-disabled'
    );
  });

  it('renders no navigation without a changeMonth handler', async () => {
    await renderMonths(new Date());
    expect(container.querySelectorAll('button')).toHaveLength(0);
  });

  it('sets the months-per-row variable from the portal setting', async () => {
    await renderMonths(new Date(), undefined, 3);
    const wrapper = container.querySelector('.bu-months') as HTMLElement;
    expect(wrapper.style.getPropertyValue('--bu-months-per-row')).toBe('3');
  });

  it('falls back to two months per row when the setting is missing', async () => {
    await renderMonths(new Date(), undefined, 0);
    const wrapper = container.querySelector('.bu-months') as HTMLElement;
    expect(wrapper.style.getPropertyValue('--bu-months-per-row')).toBe('2');
  });
});
