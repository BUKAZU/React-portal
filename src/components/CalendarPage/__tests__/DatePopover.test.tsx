import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import DatePopover from '../DatePopover';
import {
  CalendarContext,
  CalendarContextDispatch,
  CalendarContextDispatch as Dispatch
} from '../CalendarParts/CalendarContext';
import type { BookingType } from '../calender_types';
import type { BuDate, HouseType } from '../../../types';

// The months grid is covered by its own tests; here it stands in for the
// visitor picking dates inside the popover's own calendar state.
jest.mock('../CalendarParts/Months', () => {
  const ReactMock = require('react');
  const {
    CalendarContextDispatch: InnerDispatch
  } = require('../CalendarParts/CalendarContext');
  return function MockMonths({ currentMonth }: { currentMonth: Date }) {
    const dispatch = ReactMock.useContext(InnerDispatch);
    return (
      <div data-testid="months" data-month={currentMonth.getMonth()}>
        <button
          data-testid="pick"
          onClick={() =>
            dispatch({
              type: 'set_dates',
              arrivalDate: { date: '2030-07-05', min_nights: 3 },
              departureDate: { date: '2030-07-12' }
            })
          }
        >
          pick
        </button>
        <button data-testid="clear" onClick={() => dispatch({ type: 'reset' })}>
          clear
        </button>
      </div>
    );
  };
});
jest.mock('../CalendarParts/Legend', () => () => <div data-testid="legend" />);
jest.mock('../formParts/AssistanceMessage', () => () => (
  <div data-testid="assistance" />
));

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

const arrival: BuDate = {
  date: '2030-06-03',
  arrival: true,
  departure: false,
  min_nights: 3,
  max_nights: 14,
  special_offer: 0
};
const departure: BuDate = { ...arrival, date: '2030-06-10', departure: true };
const outerState: BookingType = {
  selectedDate: new Date(2030, 5, 3),
  arrivalDate: arrival,
  departureDate: departure,
  bookingStarted: true,
  persons: 2
};
const house = { house_type: 'house', max_nights: 14 } as HouseType;

let container: HTMLDivElement;
let root: ReturnType<typeof createRoot>;
const outerDispatch = jest.fn();
const onClose = jest.fn();

beforeEach(() => {
  (window as any).__localeId__ = 'en';
  container = document.createElement('div');
  document.body.appendChild(container);
  act(() => {
    root = createRoot(container);
  });
  outerDispatch.mockClear();
  onClose.mockClear();
});

afterEach(() => {
  act(() => {
    root.unmount();
  });
  container.remove();
});

function render(state: BookingType = outerState) {
  act(() => {
    root.render(
      <Dispatch.Provider value={outerDispatch}>
        <CalendarContext.Provider value={state}>
          <DatePopover
            house={house}
            numberOfMonths={2}
            numberOfMonthsInARow={2}
            onClose={onClose}
          />
        </CalendarContext.Provider>
      </Dispatch.Provider>
    );
  });
}

const done = () =>
  container.querySelector('.bu-button-primary') as HTMLButtonElement;

describe('DatePopover', () => {
  it('opens on the month of the current arrival with Done enabled', () => {
    render();
    expect(container.querySelector('[role="dialog"]')).not.toBeNull();
    expect(
      container
        .querySelector('[data-testid="months"]')
        ?.getAttribute('data-month')
    ).toBe('5');
    expect(
      container.querySelector('[data-testid="assistance"]')
    ).not.toBeNull();
    expect(container.querySelector('[data-testid="legend"]')).not.toBeNull();
    expect(done().disabled).toBe(false);
  });

  it('opens on the current month when no arrival is chosen yet', () => {
    render({
      ...outerState,
      selectedDate: null,
      arrivalDate: null,
      departureDate: null
    });
    expect(
      container
        .querySelector('[data-testid="months"]')
        ?.getAttribute('data-month')
    ).toBe(String(new Date().getMonth()));
    expect(done().disabled).toBe(true);
  });

  it('applies the dates picked inside to the form and closes', () => {
    render();
    act(() => {
      (container.querySelector('[data-testid="pick"]') as HTMLElement).click();
    });
    act(() => {
      done().click();
    });
    expect(outerDispatch).toHaveBeenCalledWith({
      type: 'set_dates',
      arrivalDate: expect.objectContaining({ date: '2030-07-05' }),
      departureDate: expect.objectContaining({ date: '2030-07-12' })
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('disables Done while the inner stay is incomplete and never touches the form', () => {
    render();
    act(() => {
      (container.querySelector('[data-testid="clear"]') as HTMLElement).click();
    });
    expect(done().disabled).toBe(true);
    act(() => {
      done().click();
    });
    expect(outerDispatch).not.toHaveBeenCalled();
  });

  it('closes without changes on Close, on the backdrop and on Escape', () => {
    render();
    act(() => {
      (container.querySelector('.bu-button-ghost') as HTMLElement).click();
    });
    act(() => {
      (container.querySelector('.bu-popover-backdrop') as HTMLElement).click();
    });
    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    });
    expect(onClose).toHaveBeenCalledTimes(3);
    expect(outerDispatch).not.toHaveBeenCalled();
  });

  it('stops listening for Escape after unmounting', () => {
    render();
    act(() => {
      root.unmount();
    });
    act(() => {
      root = createRoot(container);
    });
    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });
    expect(onClose).not.toHaveBeenCalled();
  });
});

// keep the unused alias import honest for the type-checker
void CalendarContextDispatch;
