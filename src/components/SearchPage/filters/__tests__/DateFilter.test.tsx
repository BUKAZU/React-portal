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

  function renderFilter(value: string, onChange = jest.fn()) {
    act(() => {
      root.render(
        <DateFilter
          field={{ id: 'arrival_date', type: 'date' }}
          value={value}
          onChange={onChange}
        />
      );
    });
    return {
      onChange,
      input: container.querySelector('input[type="date"]') as HTMLInputElement
    };
  }

  function typeDate(input: HTMLInputElement, date: string) {
    const setter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      'value'
    )!.set!;
    act(() => {
      setter.call(input, date);
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
  }

  function blur(input: HTMLInputElement) {
    act(() => {
      input.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
    });
  }

  function pressKey(input: HTMLInputElement, key: string) {
    act(() => {
      input.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
    });
  }

  it('should not commit while the picker changes the value', () => {
    const { input, onChange } = renderFilter('');

    typeDate(input, '2025-07-15');

    expect(onChange).not.toHaveBeenCalled();
    expect(input.value).toBe('2025-07-15');
  });

  it('should commit the date on blur', () => {
    const { input, onChange } = renderFilter('');

    typeDate(input, '2025-06-15');
    typeDate(input, '2025-07-15');
    blur(input);

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('arrival_date', '2025-07-15');
  });

  it('should commit the date on Enter', () => {
    const { input, onChange } = renderFilter('');

    typeDate(input, '2025-06-15');
    pressKey(input, 'Enter');

    expect(onChange).toHaveBeenCalledWith('arrival_date', '2025-06-15');
  });

  it('should ignore other keys', () => {
    const { input, onChange } = renderFilter('');

    typeDate(input, '2025-06-15');
    pressKey(input, 'Tab');

    expect(onChange).not.toHaveBeenCalled();
  });

  it('should not commit on blur when the value is unchanged', () => {
    const { input, onChange } = renderFilter('2025-06-20');

    blur(input);

    expect(onChange).not.toHaveBeenCalled();
  });

  it('should commit an empty string when the date is cleared', () => {
    const { input, onChange } = renderFilter('2025-06-20');

    typeDate(input, '');
    blur(input);

    expect(onChange).toHaveBeenCalledWith('arrival_date', '');
  });

  it('should follow a new value from the parent', () => {
    const { input } = renderFilter('2025-06-20');

    renderFilter('2025-08-01');

    expect(input.value).toBe('2025-08-01');
  });
});
