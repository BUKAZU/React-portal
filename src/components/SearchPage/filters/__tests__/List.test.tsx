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

function chip(value: string): HTMLButtonElement {
  return container.querySelector(
    `.bu-chip[data-value="${value}"]`
  ) as HTMLButtonElement;
}

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
  it('should render a chip per option for a countries field', () => {
    act(() => {
      root.render(
        <List
          field={{ id: 'countries', type: 'list', label: null }}
          options={countryOptions}
          filters={{}}
          value=""
          onChange={jest.fn()}
        />
      );
    });

    const chips = container.querySelectorAll('.bu-chips .bu-chip');
    expect(chips.length).toBe(countryOptions.length);
    expect(chips[0].textContent).toBe('Netherlands');
  });

  it('should mark the chip whose value matches as pressed', () => {
    act(() => {
      root.render(
        <List
          field={{ id: 'countries', type: 'list', label: null }}
          options={countryOptions}
          filters={{}}
          value="NL"
          onChange={jest.fn()}
        />
      );
    });

    expect(chip('NL').getAttribute('aria-pressed')).toBe('true');
    expect(chip('DE').getAttribute('aria-pressed')).toBe('false');
  });

  it('should pick a chip on click', () => {
    const onChange = jest.fn();
    act(() => {
      root.render(
        <List
          field={{ id: 'countries', type: 'list', label: null }}
          options={countryOptions}
          filters={{}}
          value=""
          onChange={onChange}
        />
      );
    });

    act(() => {
      chip('NL').click();
    });

    expect(onChange).toHaveBeenCalledWith('countries', 'NL');
  });

  it('should clear the filter when the picked chip is clicked again', () => {
    const onChange = jest.fn();
    act(() => {
      root.render(
        <List
          field={{ id: 'countries', type: 'list', label: null }}
          options={countryOptions}
          filters={{}}
          value="NL"
          onChange={onChange}
        />
      );
    });

    act(() => {
      chip('NL').click();
    });

    expect(onChange).toHaveBeenCalledWith('countries', null);
  });

  it('should disable and hide cities from other countries when countries filter is set', () => {
    act(() => {
      root.render(
        <List
          field={{ id: 'cities', type: 'list', label: null }}
          options={cityOptions}
          filters={{ countries: ['NL'] }}
          value=""
          onChange={jest.fn()}
        />
      );
    });

    expect(chip('BER').disabled).toBe(true);
    expect(chip('BER').classList.contains('bu-disabled')).toBe(true);
    expect(chip('AMS').disabled).toBe(false);
    expect(chip('AMS').classList.contains('bu-disabled')).toBe(false);
  });

  it('should name the group after the visible label when given', () => {
    act(() => {
      root.render(
        <List
          field={{ id: 'countries', type: 'list', label: 'Country' }}
          options={countryOptions}
          filters={{}}
          value=""
          onChange={jest.fn()}
          labelledBy="countries-label"
        />
      );
    });

    const group = container.querySelector('.bu-chips') as HTMLElement;
    expect(group.getAttribute('role')).toBe('group');
    expect(group.getAttribute('aria-labelledby')).toBe('countries-label');
    expect(group.getAttribute('aria-label')).toBeNull();
  });

  it('should fall back to the field label as the group name', () => {
    act(() => {
      root.render(
        <List
          field={{ id: 'countries', type: 'list', label: 'Country' }}
          options={countryOptions}
          filters={{}}
          value=""
          onChange={jest.fn()}
        />
      );
    });

    expect(
      container.querySelector('.bu-chips')?.getAttribute('aria-label')
    ).toBe('Country');
  });

  it('should show every city when no country is chosen', () => {
    act(() => {
      root.render(
        <List
          field={{ id: 'cities', type: 'list', label: null }}
          options={cityOptions}
          filters={{}}
          value=""
          onChange={jest.fn()}
        />
      );
    });

    expect(container.querySelectorAll('.bu-disabled')).toHaveLength(0);
  });
});
