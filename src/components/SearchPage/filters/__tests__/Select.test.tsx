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
  { id: 'BER', name: 'Berlin', country_id: 'DE', region: 'BE' },
  { id: 'ROT', name: 'Rotterdam', country_id: 'NL', region: 'ZH' }
];

const regionOptions = [
  { id: 'NH', name: 'Noord-Holland', country_id: 'NL' },
  { id: 'BE', name: 'Berlin', country_id: 'DE' }
];

const numericOptions = [0, 1, 2, 3, 4, 5];

const objectOptions = [
  { id: 73, name: 'Koelkast' },
  { id: 108, name: 'Keukeninventaris' }
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

describe('Select (filter)', () => {
  describe('countries / cities / regions branch', () => {
    it('renders a select element with one option per country plus an empty option', () => {
      act(() => {
        root.render(
          <Select
            field={{ id: 'countries', type: 'select', label: null }}
            options={countryOptions}
            filters={{}}
            value=""
            onChange={jest.fn()}
          />
        );
      });

      const options = container.querySelectorAll('option');
      expect(options.length).toBe(countryOptions.length + 1);
    });

    it('reflects the selected value on the select element', () => {
      act(() => {
        root.render(
          <Select
            field={{ id: 'countries', type: 'select', label: null }}
            options={countryOptions}
            filters={{}}
            value="NL"
            onChange={jest.fn()}
          />
        );
      });

      const select = container.querySelector('select') as HTMLSelectElement;
      expect(select.value).toBe('NL');
    });

    it('calls onChange with field id and selected value on change', () => {
      const onChange = jest.fn();
      act(() => {
        root.render(
          <Select
            field={{ id: 'countries', type: 'select', label: null }}
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

      expect(onChange).toHaveBeenCalledWith('countries', 'NL');
    });

    it('calls onChange with field id and selected value on blur', () => {
      const onChange = jest.fn();
      act(() => {
        root.render(
          <Select
            field={{ id: 'countries', type: 'select', label: null }}
            options={countryOptions}
            filters={{}}
            value=""
            onChange={onChange}
          />
        );
      });

      const select = container.querySelector('select') as HTMLSelectElement;
      act(() => {
        select.value = 'DE';
        select.focus();
        select.blur();
      });

      expect(onChange).toHaveBeenCalledWith('countries', 'DE');
    });

    it('hides cities whose country is not in the countries filter', () => {
      act(() => {
        root.render(
          <Select
            field={{ id: 'cities', type: 'select', label: null }}
            options={cityOptions}
            filters={{ countries: ['NL'], regions: [] }}
            value=""
            onChange={jest.fn()}
          />
        );
      });

      const berlinOption = container.querySelector('option[value="BER"]') as HTMLOptionElement;
      expect(berlinOption.hidden).toBe(true);

      const amsterdamOption = container.querySelector('option[value="AMS"]') as HTMLOptionElement;
      expect(amsterdamOption.hidden).toBe(false);
    });

    it('hides cities whose region is not in the regions filter when regions are selected', () => {
      act(() => {
        root.render(
          <Select
            field={{ id: 'cities', type: 'select', label: null }}
            options={cityOptions}
            filters={{ countries: ['NL'], regions: ['NH'] }}
            value=""
            onChange={jest.fn()}
          />
        );
      });

      const amsOption = container.querySelector('option[value="AMS"]') as HTMLOptionElement;
      expect(amsOption.hidden).toBe(false);

      const rotOption = container.querySelector('option[value="ROT"]') as HTMLOptionElement;
      expect(rotOption.hidden).toBe(true);
    });

    it('does not hide cities by region when the regions filter is empty', () => {
      act(() => {
        root.render(
          <Select
            field={{ id: 'cities', type: 'select', label: null }}
            options={cityOptions}
            filters={{ countries: ['NL'], regions: [] }}
            value=""
            onChange={jest.fn()}
          />
        );
      });

      const amsOption = container.querySelector('option[value="AMS"]') as HTMLOptionElement;
      const rotOption = container.querySelector('option[value="ROT"]') as HTMLOptionElement;
      expect(amsOption.hidden).toBe(false);
      expect(rotOption.hidden).toBe(false);
    });

    it('hides regions whose country is not in the countries filter', () => {
      act(() => {
        root.render(
          <Select
            field={{ id: 'regions', type: 'select', label: null }}
            options={regionOptions}
            filters={{ countries: ['NL'], regions: [] }}
            value=""
            onChange={jest.fn()}
          />
        );
      });

      const nhOption = container.querySelector('option[value="NH"]') as HTMLOptionElement;
      expect(nhOption.hidden).toBe(false);

      const beOption = container.querySelector('option[value="BE"]') as HTMLOptionElement;
      expect(beOption.hidden).toBe(true);
    });
  });

  describe('generic select branch (non-geo fields)', () => {
    it('renders numeric options with correct values', () => {
      act(() => {
        root.render(
          <Select
            field={{ id: 'persons_min', type: 'select', label: null }}
            options={numericOptions as any}
            filters={{}}
            value=""
            onChange={jest.fn()}
          />
        );
      });

      const options = container.querySelectorAll('option');
      expect(options.length).toBe(numericOptions.length + 1);
      expect((options[1] as HTMLOptionElement).value).toBe('0');
      expect((options[3] as HTMLOptionElement).value).toBe('2');
    });

    it('renders object options (API format) using id as value and name as label', () => {
      act(() => {
        root.render(
          <Select
            field={{ id: 'category_11', type: 'select', label: null }}
            options={objectOptions as any}
            filters={{}}
            value=""
            onChange={jest.fn()}
          />
        );
      });

      const options = container.querySelectorAll('option');
      expect(options.length).toBe(objectOptions.length + 1);
      expect((options[1] as HTMLOptionElement).value).toBe('73');
      expect(options[1].textContent).toBe('Koelkast');
      expect((options[2] as HTMLOptionElement).value).toBe('108');
      expect(options[2].textContent).toBe('Keukeninventaris');
    });

    it('calls onChange with field id and the selected object option id', () => {
      const onChange = jest.fn();
      act(() => {
        root.render(
          <Select
            field={{ id: 'category_11', type: 'select', label: null }}
            options={objectOptions as any}
            filters={{}}
            value=""
            onChange={onChange}
          />
        );
      });

      const select = container.querySelector('select') as HTMLSelectElement;
      act(() => {
        select.value = '73';
        select.dispatchEvent(new Event('change', { bubbles: true }));
      });

      expect(onChange).toHaveBeenCalledWith('category_11', '73');
    });
  });
});
