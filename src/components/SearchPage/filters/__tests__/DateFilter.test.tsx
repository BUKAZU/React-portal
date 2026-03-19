import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import DateFilter from '../DateFilter';

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
  it('should render a native date input', () => {
    act(() => {
      root.render(
        <DateFilter
          field={{ id: 'arrival_date', type: 'date' }}
          value=""
          onChange={jest.fn()}
        />
      );
    });

    const input = container.querySelector('input[type="date"]');
    expect(input).not.toBeNull();
  });

  it('should have an empty value when value is empty string', () => {
    act(() => {
      root.render(
        <DateFilter
          field={{ id: 'arrival_date', type: 'date' }}
          value=""
          onChange={jest.fn()}
        />
      );
    });

    const input = container.querySelector('input[type="date"]');
    expect(input).not.toBeNull();
    expect((input as HTMLInputElement).value).toBe('');
  });

  it('should have an empty value when value is falsy', () => {
    act(() => {
      root.render(
        <DateFilter
          field={{ id: 'arrival_date', type: 'date' }}
          value={null as any}
          onChange={jest.fn()}
        />
      );
    });

    const input = container.querySelector('input[type="date"]');
    expect(input).not.toBeNull();
    expect((input as HTMLInputElement).value).toBe('');
  });

  it('should call onChange with date string when date is selected', () => {
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

    const input = container.querySelector('input[type="date"]');
    expect(input).not.toBeNull();
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      'value'
    )!.set!;
    act(() => {
      nativeInputValueSetter.call(input as HTMLInputElement, '2025-06-15');
      (input as HTMLInputElement).dispatchEvent(new Event('change', { bubbles: true }));
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

    const input = container.querySelector('input[type="date"]');
    expect(input).not.toBeNull();
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      'value'
    )!.set!;
    act(() => {
      nativeInputValueSetter.call(input as HTMLInputElement, '');
      (input as HTMLInputElement).dispatchEvent(new Event('change', { bubbles: true }));
    });

    expect(onChange).toHaveBeenCalledWith('departure_date', '');
  });
});
