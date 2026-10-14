import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import PriceField from '..';
import {
  CalendarContext,
  CalendarContextDispatch
} from '../../CalendarParts/CalendarContext';
import type { BookingType } from '../../calender_types';
import type { BuDate, HouseType } from '../../../../types';

jest.mock('../Price', () => () => <div data-testid="price" />);
jest.mock('../../../CurrencySelector', () => () => (
  <div data-testid="currency" />
));

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

const house = { house_type: 'house', persons: 6 } as HouseType;
const arrival: BuDate = {
  date: '2030-06-03',
  arrival: true,
  departure: false,
  min_nights: 7,
  max_nights: 14,
  special_offer: 0
};
const departure: BuDate = { ...arrival, date: '2030-06-10', departure: true };
const idle: BookingType = {
  selectedDate: null,
  arrivalDate: null,
  departureDate: null,
  bookingStarted: false,
  persons: 2
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

function render(state: BookingType) {
  act(() => {
    root.render(
      <CalendarContextDispatch.Provider value={dispatch}>
        <CalendarContext.Provider value={state}>
          <PriceField house={house} />
        </CalendarContext.Provider>
      </CalendarContextDispatch.Provider>
    );
  });
}

const next = () =>
  container.querySelector('.bu-stay-next') as HTMLButtonElement;
const persons = () => container.querySelector('select') as HTMLSelectElement;

describe('PriceField (stay bar)', () => {
  it('tells the visitor to pick in the calendar while nothing is chosen', () => {
    render(idle);
    const values = container.querySelectorAll('.bu-stay-slot-value');
    expect(values[0].textContent).toBe('Choose an arrival date');
    expect(values[0].classList.contains('bu-empty')).toBe(true);
    expect(values[1].textContent).toBe('—');
    expect(container.textContent).toContain('The price follows your dates');
    expect(container.querySelector('[data-testid="price"]')).toBeNull();
    expect(next().disabled).toBe(true);
    expect(persons().disabled).toBe(true);
    expect(container.querySelector('.bu-stay-clear')).toBeNull();
    expect(container.querySelector('.bu-stay-nights-empty')).toBeNull();
    expect(container.querySelector('[data-testid="currency"]')).not.toBeNull();
  });

  it('asks for the departure and shows the minimum stay after the arrival', () => {
    render({
      ...idle,
      selectedDate: new Date(2030, 5, 3),
      arrivalDate: arrival
    });
    const values = container.querySelectorAll('.bu-stay-slot-value');
    expect(values[0].textContent).toContain('June 2030');
    expect(values[1].textContent).toBe('Select a departure date');
    expect(container.querySelector('.bu-stay-nights-empty')?.textContent).toBe(
      'At least 7 nights'
    );
    expect(next().disabled).toBe(true);
  });

  it('clears the dates from the bar', () => {
    render({
      ...idle,
      selectedDate: new Date(2030, 5, 3),
      arrivalDate: arrival
    });
    act(() => {
      (container.querySelector('.bu-stay-clear') as HTMLElement).click();
    });
    expect(dispatch).toHaveBeenCalledWith({ type: 'reset' });
  });

  it('shows nights, price and an enabled Next once both dates are chosen', () => {
    render({
      ...idle,
      selectedDate: new Date(2030, 5, 3),
      arrivalDate: arrival,
      departureDate: departure
    });
    expect(container.querySelector('.bu-stay-nights')?.textContent).toBe(
      '7 nights'
    );
    expect(container.querySelector('[data-testid="price"]')).not.toBeNull();
    expect(persons().disabled).toBe(false);
    expect(persons().value).toBe('2');
    // createPersonsArray counts from 0 up to the house capacity
    expect(persons().querySelectorAll('option')).toHaveLength(7);
    expect(next().disabled).toBe(false);
  });

  it('starts the booking with the chosen number of persons', () => {
    render({
      ...idle,
      selectedDate: new Date(2030, 5, 3),
      arrivalDate: arrival,
      departureDate: departure
    });
    act(() => {
      const select = persons();
      select.value = '4';
      select.dispatchEvent(new Event('change', { bubbles: true }));
    });
    act(() => {
      next().click();
    });
    expect(dispatch).toHaveBeenCalledWith({ type: 'start', persons: 4 });
  });

  it('defaults persons to the house capacity when that is below two', () => {
    act(() => {
      root.render(
        <CalendarContextDispatch.Provider value={dispatch}>
          <CalendarContext.Provider value={idle}>
            <PriceField house={{ ...house, persons: 1 }} />
          </CalendarContext.Provider>
        </CalendarContextDispatch.Provider>
      );
    });
    expect(persons().value).toBe('1');
  });
});
