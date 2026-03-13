import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import List from '../List';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

const countryOptions = [
  { id: 'NL', name: 'Netherlands', country_id: 'NL' },
  { id: 'DE', name: 'Germany', country_id: 'DE' }
];

const cityOptions = [
  { id: 'AMS', name: 'Amsterdam', country_id: 'NL' },
  { id: 'BER', name: 'Berlin', country_id: 'DE' }
];

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

describe('List (filter)', () => {
  it('should render a list of options for a countries field', () => {
    act(() => {
      root.render(
        <List
          field={{ id: 'countries', type: 'list' }}
          options={countryOptions}
          filters={{}}
          value=""
          onChange={jest.fn()}
        />
      );
    });

    const items = container.querySelectorAll('.bu-list-item');
    expect(items.length).toBe(countryOptions.length);
  });

  it('should mark an option as checked when value matches', () => {
    act(() => {
      root.render(
        <List
          field={{ id: 'countries', type: 'list' }}
          options={countryOptions}
          filters={{}}
          value="NL"
          onChange={jest.fn()}
        />
      );
    });

    const checkedInput = container.querySelector('input[value="NL"]') as HTMLInputElement;
    expect(checkedInput?.checked).toBe(true);
  });

  it('should call onChange when a checkbox is clicked', () => {
    const onChange = jest.fn();
    act(() => {
      root.render(
        <List
          field={{ id: 'countries', type: 'list' }}
          options={countryOptions}
          filters={{}}
          value=""
          onChange={onChange}
        />
      );
    });

    const input = container.querySelector('input[value="NL"]') as HTMLInputElement;
    act(() => {
      input.click();
    });

    expect(onChange).toHaveBeenCalled();
  });

  it('should disable cities from other countries when countries filter is set', () => {
    act(() => {
      root.render(
        <List
          field={{ id: 'cities', type: 'list' }}
          options={cityOptions}
          filters={{ countries: ['NL'] }}
          value=""
          onChange={jest.fn()}
        />
      );
    });

    const berlinInput = container.querySelector('input[value="BER"]') as HTMLInputElement;
    expect(berlinInput?.disabled).toBe(true);

    const amsterdamInput = container.querySelector('input[value="AMS"]') as HTMLInputElement;
    expect(amsterdamInput?.disabled).toBe(false);
  });

  it('should apply bu-disabled class to items from non-selected countries', () => {
    act(() => {
      root.render(
        <List
          field={{ id: 'cities', type: 'list' }}
          options={cityOptions}
          filters={{ countries: ['NL'] }}
          value=""
          onChange={jest.fn()}
        />
      );
    });

    const berlinItem = container.querySelector('.bu-disabled');
    expect(berlinItem).not.toBeNull();
  });

  it('should render a radioList container', () => {
    act(() => {
      root.render(
        <List
          field={{ id: 'countries', type: 'list' }}
          options={countryOptions}
          filters={{}}
          value=""
          onChange={jest.fn()}
        />
      );
    });

    expect(container.querySelector('.radioList')).not.toBeNull();
  });
});
