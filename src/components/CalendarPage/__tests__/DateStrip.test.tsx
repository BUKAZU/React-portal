import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import DateStrip from '../DateStrip';
import { CalendarContext } from '../CalendarParts/CalendarContext';
import type { BookingType } from '../calender_types';
import type { BuDate } from '../../../types';

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
const state: BookingType = {
  selectedDate: new Date(2030, 5, 3),
  arrivalDate: arrival,
  departureDate: departure,
  bookingStarted: true,
  persons: 2
};

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

function render(booking: BookingType, onChange = jest.fn()) {
  act(() => {
    root.render(
      <CalendarContext.Provider value={booking}>
        <DateStrip
          house={{ house_type: 'house' }}
          persons={4}
          onChange={onChange}
        />
      </CalendarContext.Provider>
    );
  });
  return onChange;
}

describe('DateStrip', () => {
  it('shows both dates, the nights and the persons as pills', () => {
    render(state);
    const pills = container.querySelectorAll('.bu-date-pill');
    expect(pills).toHaveLength(2);
    expect(pills[0].textContent).toContain('Arrival');
    expect(pills[0].textContent).toContain('June 2030');
    expect(pills[1].textContent).toContain('Departure');
    const plain = container.querySelectorAll('.bu-pill');
    expect(plain[0].textContent).toBe('7 nights');
    expect(plain[1].textContent).toBe('4 persons');
  });

  it('reopens the calendar from a date pill and from "Change dates"', () => {
    const onChange = render(state);
    act(() => {
      (container.querySelector('.bu-date-pill') as HTMLElement).click();
    });
    act(() => {
      (container.querySelector('.bu-date-strip-change') as HTMLElement).click();
    });
    expect(onChange).toHaveBeenCalledTimes(2);
    expect(container.querySelector('.bu-date-strip-change')?.textContent).toBe(
      'Change dates'
    );
  });

  it('renders nothing while a date is missing', () => {
    render({ ...state, departureDate: null });
    expect(container.innerHTML).toBe('');
  });
});
