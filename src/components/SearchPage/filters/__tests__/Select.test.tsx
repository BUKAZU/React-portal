import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import Select from '../Select';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

const countryOptions = [
  { id: 'NL', name: 'Netherlands', country_id: 'NL' },
  { id: 'DE', name: 'Germany', country_id: 'DE' }
];

const cityOptions = [
  { id: 'AMS', name: 'Amsterdam', country_id: 'NL', region: 'NH' },
  { id: 'BER', name: 'Berlin', country_id: 'DE', region: 'BE' }
];

const numericOptions = [0, 1, 2, 3, 4, 5];

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

describe('Select (filter)', () => {
  it('should render a select element for country options', () => {
    act(() => {
      root.render(
        <Select
          field={{ id: 'countries', type: 'select' }}
          options={countryOptions}
          filters={{}}
          value=""
          onChange={jest.fn()}
        />
      );
    });

    const select = container.querySelector('select');
    expect(select).not.toBeNull();
  });

  it('should render an option for each country', () => {
    act(() => {
      root.render(
        <Select
          field={{ id: 'countries', type: 'select' }}
          options={countryOptions}
          filters={{}}
          value=""
          onChange={jest.fn()}
        />
      );
    });

    // +1 for the empty option
    const options = container.querySelectorAll('option');
    expect(options.length).toBe(countryOptions.length + 1);
  });

  it('should show the selected value', () => {
    act(() => {
      root.render(
        <Select
          field={{ id: 'countries', type: 'select' }}
          options={countryOptions}
          filters={{}}
          value="NL"
          onChange={jest.fn()}
        />
      );
    });

    const select = container.querySelector('select') as HTMLSelectElement;
    expect(select?.value).toBe('NL');
  });

  it('should call onChange when selection changes', () => {
    const onChange = jest.fn();
    act(() => {
      root.render(
        <Select
          field={{ id: 'countries', type: 'select' }}
          options={countryOptions}
          filters={{}}
          value=""
          onChange={onChange}
        />
      );
    });

    const select = container.querySelector('select') as HTMLSelectElement;
    act(() => {
      select.value = 'NL';
      select.dispatchEvent(new Event('change', { bubbles: true }));
    });

    expect(onChange).toHaveBeenCalled();
  });

  it('should hide cities from unselected countries', () => {
    act(() => {
      root.render(
        <Select
          field={{ id: 'cities', type: 'select' }}
          options={cityOptions}
          filters={{ countries: ['NL'], regions: [] }}
          value=""
          onChange={jest.fn()}
        />
      );
    });

    const berlinOption = container.querySelector('option[value="BER"]') as HTMLOptionElement;
    expect(berlinOption?.hidden).toBe(true);

    const amsterdamOption = container.querySelector('option[value="AMS"]') as HTMLOptionElement;
    expect(amsterdamOption?.hidden).toBe(false);
  });

  it('should render numeric options with a plain select when not a country/city/region field', () => {
    act(() => {
      root.render(
        <Select
          field={{ id: 'persons_min', type: 'select' }}
          options={numericOptions as any}
          filters={{}}
          value=""
          onChange={jest.fn()}
        />
      );
    });

    // +1 for the empty option
    const options = container.querySelectorAll('option');
    expect(options.length).toBe(numericOptions.length + 1);
  });
});
