import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import SingleMonth from '../SingleMonth';
import { CalendarContext, CalendarContextDispatch } from '../CalendarContext';
import type { HouseType } from '../../../../types';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: ReturnType<typeof createRoot>;

beforeEach(() => {
  (window as any).__localeId__ = 'en';
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

const house = { max_nights: 14, last_minute_days: 0 } as HouseType;

function render(props: Partial<React.ComponentProps<typeof SingleMonth>> = {}) {
  act(() => {
    root.render(
      <CalendarContextDispatch.Provider value={jest.fn()}>
        <CalendarContext.Provider
          value={{
            selectedDate: null,
            arrivalDate: null,
            departureDate: null,
            bookingStarted: false,
            persons: 2
          }}
        >
          <SingleMonth
            count={1}
            currentMonth={new Date(2030, 0, 1)}
            house={house}
            availabilities={[]}
            discounts={[]}
            {...props}
          />
        </CalendarContext.Provider>
      </CalendarContextDispatch.Provider>
    );
  });
}

describe('SingleMonth', () => {
  it('renders the month `count` months after the current one', () => {
    render();
    expect(container.querySelector('.bu-calendar')).not.toBeNull();
    expect(container.querySelector('.bu-month-title')?.textContent).toBe(
      'February 2030'
    );
    expect(
      container.querySelectorAll('.bu-weekdays .bu-calendar-col')
    ).toHaveLength(7);
    expect(container.querySelectorAll('.bu-day').length).toBeGreaterThan(27);
  });

  it('passes the navigation handlers to the header', () => {
    const onPrev = jest.fn();
    render({ onPrev, prevDisabled: true });
    const prev = container.querySelector(
      'button[aria-label="Previous month"]'
    ) as HTMLButtonElement;
    expect(prev).not.toBeNull();
    expect(prev.disabled).toBe(true);
    expect(
      container.querySelector('button[aria-label="Next month"]')
    ).toBeNull();
  });
});
