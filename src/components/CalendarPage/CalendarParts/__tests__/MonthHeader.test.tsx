/**
 * @jest-environment jsdom
 */

import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import MonthHeader from '../MonthHeader';

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

const january = new Date(2025, 0, 1);

describe('MonthHeader', () => {
  it('shows the month and year', () => {
    act(() => {
      root.render(<MonthHeader month={january} />);
    });
    const title = container.querySelector('.bu-month-title span');
    expect(title?.textContent).toBe('January 2025');
  });

  it('formats another month', () => {
    act(() => {
      root.render(<MonthHeader month={new Date(2025, 5, 1)} />);
    });
    expect(container.querySelector('.bu-month-title')?.textContent).toBe(
      'June 2025'
    );
  });

  it('renders spacers instead of buttons when it cannot navigate', () => {
    act(() => {
      root.render(<MonthHeader month={january} />);
    });
    expect(container.querySelectorAll('button')).toHaveLength(0);
    expect(container.querySelectorAll('.bu-month-nav-spacer')).toHaveLength(2);
  });

  it('renders labelled previous and next buttons that call back', () => {
    const onPrev = jest.fn();
    const onNext = jest.fn();
    act(() => {
      root.render(
        <MonthHeader month={january} onPrev={onPrev} onNext={onNext} />
      );
    });
    const prev = container.querySelector(
      'button[aria-label="Previous month"]'
    ) as HTMLButtonElement;
    const next = container.querySelector(
      'button[aria-label="Next month"]'
    ) as HTMLButtonElement;
    expect(prev.disabled).toBe(false);
    act(() => {
      prev.click();
      next.click();
    });
    expect(onPrev).toHaveBeenCalledTimes(1);
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it('disables the previous button at the floor', () => {
    act(() => {
      root.render(
        <MonthHeader month={january} onPrev={jest.fn()} prevDisabled />
      );
    });
    const prev = container.querySelector(
      'button[aria-label="Previous month"]'
    ) as HTMLButtonElement;
    expect(prev.disabled).toBe(true);
    // Only the first month pages back; the last one pages forward.
    expect(container.querySelectorAll('.bu-month-nav-spacer')).toHaveLength(1);
  });
});
