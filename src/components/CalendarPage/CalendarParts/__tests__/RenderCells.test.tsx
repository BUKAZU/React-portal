import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import RenderCells from '../RenderCells';
import { CalendarContext, CalendarContextDispatch } from '../CalendarContext';
import {
  addDays,
  endOfMonth,
  endOfWeek,
  formatDateKey,
  startOfMonth,
  startOfWeek,
  subMonths
} from '../../../../_lib/date_helper';
import type { AvailabilityEntry } from '../../../../_lib/availability';
import type { HouseType } from '../../../../types';
import type { BookingType } from '../../calender_types';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

const house = { max_nights: 14, last_minute_days: 0 } as HouseType;

/** Every day of the rendered grid is an arrival and departure day. */
function availabilityFor(
  month: Date,
  skip: string[] = []
): AvailabilityEntry[] {
  const entries: AvailabilityEntry[] = [];
  let day = startOfWeek(startOfMonth(month));
  const end = endOfWeek(endOfMonth(month));
  while (day <= end) {
    const date = formatDateKey(day);
    if (!skip.includes(date)) {
      entries.push({
        date,
        arrival: true,
        arrival_time_from: null,
        arrival_time_to: null,
        departure: true,
        departure_time: null,
        min_nights: 3,
        max_nights: 14,
        special_offer: 0
      });
    }
    day = addDays(day, 1);
  }
  return entries;
}

const idle: BookingType = {
  selectedDate: null,
  arrivalDate: null,
  departureDate: null,
  bookingStarted: false,
  persons: 2,
  hoverDate: null,
  hoverValid: false
};

let container: HTMLDivElement;
let root: ReturnType<typeof createRoot>;
const dispatch = jest.fn();

beforeEach(() => {
  (window as any).__localeId__ = 'en';
  container = document.createElement('div');
  document.body.appendChild(container);
  act(() => {
    root = createRoot(container);
  });
  dispatch.mockClear();
});

afterEach(() => {
  act(() => {
    root.unmount();
  });
  container.remove();
});

function render(
  month: Date,
  state: BookingType = idle,
  availabilities = availabilityFor(month)
) {
  act(() => {
    root.render(
      <CalendarContextDispatch.Provider value={dispatch}>
        <CalendarContext.Provider value={state}>
          <RenderCells
            availabilities={availabilities}
            discounts={[]}
            month={month}
            house={house}
          />
        </CalendarContext.Provider>
      </CalendarContextDispatch.Provider>
    );
  });
}

const cell = (date: string) =>
  container.querySelector(
    `[aria-label="${new Intl.DateTimeFormat('en-GB', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).format(new Date(`${date}T00:00:00`))}"]`
  ) as HTMLElement;

// A month far enough ahead that no day is in the past. 1 June 2030 is a
// Saturday, so the Monday-start grid runs 27 May – 30 June: 35 cells.
const JUNE_2030 = new Date(2030, 5, 1);

describe('RenderCells', () => {
  it('renders Monday-start weeks covering the month', () => {
    render(JUNE_2030);
    const days = container.querySelectorAll('.bu-day');
    expect(days).toHaveLength(35);
    expect(days[0].classList.contains('disabled')).toBe(true); // 27 May
    expect(days[0].getAttribute('role')).toBeNull();
    expect(days[5].textContent).toBe('1'); // Saturday 1 June
    expect(days[5].getAttribute('role')).toBe('button');
  });

  it('renders a hidden disabled cell when an entry is missing', () => {
    render(JUNE_2030, idle, availabilityFor(JUNE_2030, ['2030-06-10']));
    const missing = Array.from(container.querySelectorAll('.bu-day')).find(
      (d) => d.textContent === '10' && d.getAttribute('aria-hidden') === 'true'
    );
    expect(missing).toBeDefined();
    expect(missing?.getAttribute('role')).toBeNull();
  });

  it('dispatches a click for a bookable day', () => {
    render(JUNE_2030);
    act(() => {
      cell('2030-06-10').click();
    });
    expect(dispatch).toHaveBeenCalledWith({
      type: 'clicked',
      day: expect.objectContaining({ date: '2030-06-10' }),
      house
    });
  });

  it('activates a day with Enter and Space but not other keys', () => {
    render(JUNE_2030);
    const target = cell('2030-06-10');
    act(() => {
      target.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })
      );
      target.dispatchEvent(
        new KeyboardEvent('keydown', { key: ' ', bubbles: true })
      );
      target.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Tab', bubbles: true })
      );
    });
    expect(dispatch).toHaveBeenCalledTimes(2);
  });

  it('ignores clicks on past days and takes them out of the tab order', () => {
    const lastMonth = subMonths(new Date(), 1);
    render(lastMonth);
    const past = container.querySelector('.bu-day.bu-past') as HTMLElement;
    expect(past).not.toBeNull();
    expect(past.getAttribute('tabindex')).toBe('-1');
    expect(past.getAttribute('aria-disabled')).toBe('true');
    act(() => {
      past.click();
    });
    expect(dispatch).not.toHaveBeenCalled();
  });

  describe('while a departure is being chosen', () => {
    const arrival = availabilityFor(JUNE_2030).find(
      (d) => d.date === '2030-06-03'
    )!;
    const choosing: BookingType = {
      ...idle,
      selectedDate: new Date(2030, 5, 3),
      arrivalDate: arrival
    };

    it('previews the stay on hover and clears it on leave', () => {
      render(JUNE_2030, choosing);
      const target = cell('2030-06-10');
      act(() => {
        target.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
      });
      expect(dispatch).toHaveBeenCalledWith({
        type: 'hover',
        date: new Date(2030, 5, 10),
        valid: true
      });
      act(() => {
        target.dispatchEvent(
          new MouseEvent('mouseout', {
            bubbles: true,
            relatedTarget: document.body
          })
        );
      });
      expect(dispatch).toHaveBeenCalledWith({ type: 'unhover' });
    });

    it('marks a hover under the minimum stay as invalid', () => {
      render(JUNE_2030, choosing);
      act(() => {
        cell('2030-06-04').dispatchEvent(
          new MouseEvent('mouseover', { bubbles: true })
        );
      });
      expect(dispatch).toHaveBeenCalledWith({
        type: 'hover',
        date: new Date(2030, 5, 4),
        valid: false
      });
    });

    it('explains an invalid hover with the minimum stay', () => {
      render(JUNE_2030, {
        ...choosing,
        hoverDate: new Date(2030, 5, 4),
        hoverValid: false
      });
      const hovered = cell('2030-06-04');
      expect(hovered.classList.contains('bu-preview-invalid')).toBe(true);
      expect(hovered.getAttribute('data-bu-tip')).toBe('At least 3 nights');
    });

    it('adds no tip when the hover is invalid for another reason', () => {
      render(JUNE_2030, {
        ...choosing,
        hoverDate: new Date(2030, 5, 25),
        hoverValid: false
      });
      const hovered = cell('2030-06-25');
      expect(hovered.classList.contains('bu-preview-invalid')).toBe(true);
      expect(hovered.getAttribute('data-bu-tip')).toBeNull();
    });
  });

  it('does not track hover before an arrival is chosen', () => {
    render(JUNE_2030);
    const target = cell('2030-06-10');
    act(() => {
      target.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
      target.dispatchEvent(
        new MouseEvent('mouseout', {
          bubbles: true,
          relatedTarget: document.body
        })
      );
    });
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('does not track hover on past days', () => {
    const lastMonth = subMonths(new Date(), 1);
    const entries = availabilityFor(lastMonth);
    render(
      lastMonth,
      {
        ...idle,
        selectedDate: new Date(2000, 0, 1),
        arrivalDate: entries[0]
      },
      entries
    );
    const past = container.querySelector('.bu-day.bu-past') as HTMLElement;
    act(() => {
      past.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
    });
    expect(dispatch).not.toHaveBeenCalled();
  });
});
