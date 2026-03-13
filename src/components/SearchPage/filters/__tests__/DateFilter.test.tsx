import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import DateFilter from '../DateFilter';

// Mock react-date-picker to avoid complex setup in unit tests.
// The mock captures onChange and exposes it via a data attribute
// so tests can invoke it directly without relying on native event dispatch.
let capturedOnChange: ((date: Date | null) => void) | null = null;
jest.mock('react-date-picker', () => ({ onChange, value }: any) => {
  capturedOnChange = onChange;
  return (
    <input
      data-testid="date-picker"
      type="text"
      defaultValue={value ? String(value) : ''}
    />
  );
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

describe('DateFilter', () => {
  it('should render the date picker', () => {
    act(() => {
      root.render(
        <DateFilter
          field={{ id: 'arrival_date', type: 'date' }}
          value=""
          onChange={jest.fn()}
        />
      );
    });

    expect(container.querySelector('[data-testid="date-picker"]')).not.toBeNull();
  });

  it('should pass null to picker when value is empty string', () => {
    act(() => {
      root.render(
        <DateFilter
          field={{ id: 'arrival_date', type: 'date' }}
          value=""
          onChange={jest.fn()}
        />
      );
    });

    const picker = container.querySelector('[data-testid="date-picker"]') as HTMLInputElement;
    expect(picker?.value).toBe('');
  });

  it('should pass null to picker when value is falsy', () => {
    act(() => {
      root.render(
        <DateFilter
          field={{ id: 'arrival_date', type: 'date' }}
          value={null as any}
          onChange={jest.fn()}
        />
      );
    });

    const picker = container.querySelector('[data-testid="date-picker"]') as HTMLInputElement;
    expect(picker?.value).toBe('');
  });

  it('should call onChange with formatted date string when date is selected', () => {
    const onChange = jest.fn();
    act(() => {
      root.render(
        <DateFilter
          field={{ id: 'arrival_date', type: 'date' }}
          value=""
          onChange={onChange}
        />
      );
    });

    act(() => {
      capturedOnChange!(new Date('2025-06-15'));
    });

    expect(onChange).toHaveBeenCalledWith('arrival_date', '2025-06-15');
  });

  it('should call onChange with empty string when date is cleared', () => {
    const onChange = jest.fn();
    act(() => {
      root.render(
        <DateFilter
          field={{ id: 'departure_date', type: 'date' }}
          value="2025-06-20"
          onChange={onChange}
        />
      );
    });

    act(() => {
      capturedOnChange!(null);
    });

    expect(onChange).toHaveBeenCalledWith('departure_date', '');
  });
});
