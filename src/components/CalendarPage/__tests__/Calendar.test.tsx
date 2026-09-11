import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import Calendar from '../Calendar';
import type { HouseType } from '../../../types';

jest.mock('../formParts/AssistanceMessage', () => () => (
  <div data-testid="assistance" />
));
jest.mock('../CalendarParts/Legend', () => () => <div data-testid="legend" />);
jest.mock('../CalendarParts/StartBooking', () => () => (
  <div data-testid="stay-bar" />
));
jest.mock('../CalendarParts/Months', () => {
  return function MockMonths({
    currentMonth,
    changeMonth,
    numberOfMonths,
    numberOfMonthsInARow
  }: {
    currentMonth: Date;
    changeMonth: (d: Date) => void;
    numberOfMonths: number;
    numberOfMonthsInARow: number;
  }) {
    return (
      <div data-testid="months">
        <span data-testid="month">{currentMonth.getMonth()}</span>
        <span data-testid="config">
          {numberOfMonths}/{numberOfMonthsInARow}
        </span>
        <button
          data-testid="jump"
          onClick={() => changeMonth(new Date(2031, 4, 1))}
        >
          jump
        </button>
      </div>
    );
  };
});

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: ReturnType<typeof createRoot>;

beforeEach(() => {
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

describe('Calendar', () => {
  it('lays out assistance, months, legend and the stay bar', () => {
    act(() => {
      root.render(
        <Calendar
          numberOfMonths={3}
          numberOfMonthsInARow={3}
          house={{ persons: 4 } as HouseType}
        />
      );
    });
    const page = container.querySelector('.bu-calendar-page') as HTMLElement;
    expect(page).not.toBeNull();
    const main = page.querySelector('.bu-calendar-main') as HTMLElement;
    expect(main.children[0].getAttribute('data-testid')).toBe('assistance');
    expect(main.children[1].getAttribute('data-testid')).toBe('months');
    expect(main.children[2].getAttribute('data-testid')).toBe('legend');
    expect(page.children[1].getAttribute('data-testid')).toBe('stay-bar');
    expect(container.querySelector('[data-testid="config"]')?.textContent).toBe(
      '3/3'
    );
  });

  it('starts on the current month and pages through changeMonth', () => {
    act(() => {
      root.render(
        <Calendar
          numberOfMonths={2}
          numberOfMonthsInARow={2}
          house={{ persons: 4 } as HouseType}
        />
      );
    });
    expect(container.querySelector('[data-testid="month"]')?.textContent).toBe(
      String(new Date().getMonth())
    );
    act(() => {
      (container.querySelector('[data-testid="jump"]') as HTMLElement).click();
    });
    expect(container.querySelector('[data-testid="month"]')?.textContent).toBe(
      '4'
    );
  });
});
