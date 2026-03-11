import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import Radio from '../Radio';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

const countryOptions = [
  { id: 'NL', name: 'Netherlands', country_id: 'NL' },
  { id: 'DE', name: 'Germany', country_id: 'DE' }
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

describe('Radio (filter)', () => {
  it('should render a radioList container', () => {
    act(() => {
      root.render(
        <Radio
          field={{ id: 'countries', type: 'radio' }}
          options={countryOptions}
          filters={{}}
          onChange={jest.fn()}
        />
      );
    });

    expect(container.querySelector('.radioList')).not.toBeNull();
  });

  it('should render a radio input for each option', () => {
    act(() => {
      root.render(
        <Radio
          field={{ id: 'countries', type: 'radio' }}
          options={countryOptions}
          filters={{}}
          onChange={jest.fn()}
        />
      );
    });

    const radios = container.querySelectorAll('input[type="radio"]');
    expect(radios.length).toBe(countryOptions.length);
  });

  it('should render labels with option names', () => {
    act(() => {
      root.render(
        <Radio
          field={{ id: 'countries', type: 'radio' }}
          options={countryOptions}
          filters={{}}
          onChange={jest.fn()}
        />
      );
    });

    const labels = container.querySelectorAll('label');
    expect(labels[0].textContent).toBe('Netherlands');
    expect(labels[1].textContent).toBe('Germany');
  });

  it('should disable options from countries not in the filter', () => {
    act(() => {
      root.render(
        <Radio
          field={{ id: 'cities', type: 'radio' }}
          options={[
            { id: 'AMS', name: 'Amsterdam', country_id: 'NL' },
            { id: 'BER', name: 'Berlin', country_id: 'DE' }
          ]}
          filters={{ countries: ['NL'] }}
          onChange={jest.fn()}
        />
      );
    });

    const berlinInput = container.querySelector('input[value="BER"]') as HTMLInputElement;
    expect(berlinInput?.disabled).toBe(true);

    const amsterdamInput = container.querySelector('input[value="AMS"]') as HTMLInputElement;
    expect(amsterdamInput?.disabled).toBe(false);
  });

  it('should apply bu-disabled class to items from non-matching countries', () => {
    act(() => {
      root.render(
        <Radio
          field={{ id: 'cities', type: 'radio' }}
          options={[
            { id: 'AMS', name: 'Amsterdam', country_id: 'NL' },
            { id: 'BER', name: 'Berlin', country_id: 'DE' }
          ]}
          filters={{ countries: ['NL'] }}
          onChange={jest.fn()}
        />
      );
    });

    const disabledItem = container.querySelector('.bu-disabled');
    expect(disabledItem).not.toBeNull();
  });

  it('should call onChange when a radio input changes', () => {
    const onChange = jest.fn();
    act(() => {
      root.render(
        <Radio
          field={{ id: 'countries', type: 'radio' }}
          options={countryOptions}
          filters={{}}
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
});
