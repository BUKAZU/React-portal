import React, { useState } from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { Insurances } from '../insurances';
import { BookingFormContext } from '../../BookingFormContext';
import { setByString } from '../BookingHelpers';
import { HouseType } from '../../../../types';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock('../../../Modal', () => ({ children }: any) => (
  <div data-testid="modal">{children}</div>
));

jest.mock('../../../icons/info.svg', () => () => (
  <span data-testid="info-icon" />
));

jest.mock('../CancelInsuranceText', () => () => (
  <div data-testid="cancel-insurance-text" />
));

jest.mock('../../FormItems', () => ({
  DateField: ({ name, label }: { name: string; label: string }) => (
    <div data-testid="date-field" data-name={name} data-label={label} />
  )
}));

const baseHouse = {
  id: 1,
  code: 'TEST',
  name: 'Test House',
  house_type: 'house',
  persons: 4,
  max_nights: 14,
  cancel_insurance: true,
  babies_extra: 0
} as unknown as HouseType;

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
  delete (window as any).__localeId__;
  act(() => {
    root.unmount();
  });
  container.remove();
});

/** Holds the form values so the chips can change cancel_insurance for real. */
function Harness({ house, initial }: { house: HouseType; initial: string }) {
  const [values, setValues] = useState<Record<string, unknown>>({
    cancel_insurance: initial
  });
  return (
    <BookingFormContext.Provider
      value={{
        values: values as any,
        errors: {},
        touched: {},
        isSubmitting: false,
        setFieldValue: (name, value) => {
          setValues((current) => setByString(current, name, value));
        },
        setFieldTouched: () => undefined
      }}
    >
      <Insurances house={house} values={values as any} />
    </BookingFormContext.Provider>
  );
}

function renderInsurances(
  housePatch: Partial<HouseType> = {},
  cancelInsuranceValue = '0'
) {
  act(() => {
    root.render(
      <Harness
        house={{ ...baseHouse, ...housePatch }}
        initial={cancelInsuranceValue}
      />
    );
  });
}

const chips = () =>
  Array.from(container.querySelectorAll<HTMLButtonElement>('.bu-chip'));
const pressed = () =>
  chips()
    .filter((chip) => chip.getAttribute('aria-pressed') === 'true')
    .map((chip) => chip.textContent);
const hidden = () =>
  container.querySelector(
    'input[type="hidden"][name="cancel_insurance"]'
  ) as HTMLInputElement;

describe('Insurances – house.cancel_insurance is false', () => {
  it('does not render the insurances section', () => {
    renderInsurances({ cancel_insurance: false });
    expect(container.querySelector('#insurances')).toBeNull();
    expect(container.textContent).toBe('');
  });
});

describe('Insurances – house.cancel_insurance is true', () => {
  it('renders the section with its heading', () => {
    renderInsurances();
    expect(container.querySelector('#insurances')).not.toBeNull();
    expect(container.querySelector('h2')?.textContent).toBe('Insurances');
    expect(
      container.querySelector('#cancel_insurance_label')?.textContent
    ).toBe('Cancellation insurance');
  });

  it('offers None and Standard as chips, with None pressed by default', () => {
    renderInsurances();
    expect(chips().map((chip) => chip.textContent)).toEqual([
      'None',
      'Standard'
    ]);
    expect(pressed()).toEqual(['None']);
    expect(hidden().value).toBe('0');
    expect(
      container.querySelector('.bu-chips')?.getAttribute('aria-labelledby')
    ).toBe('cancel_insurance_label');
  });

  it('leaves both chips unpressed while nothing is chosen', () => {
    renderInsurances({}, '');
    expect(pressed()).toEqual([]);
    expect(hidden().value).toBe('');
  });

  it('renders the explanation behind the info button', () => {
    renderInsurances();
    expect(container.querySelector('[data-testid="modal"]')).not.toBeNull();
    expect(
      container.querySelector('[data-testid="cancel-insurance-text"]')
    ).not.toBeNull();
  });

  it('does not ask for a date of birth without insurance', () => {
    renderInsurances({}, '0');
    expect(container.querySelector('[data-testid="date-field"]')).toBeNull();
    renderInsurances({}, '');
    expect(container.querySelector('[data-testid="date-field"]')).toBeNull();
  });

  it('asks for the date of birth once Standard is pressed and drops it on None', () => {
    renderInsurances();
    act(() => {
      chips()[1].click();
    });
    expect(pressed()).toEqual(['Standard']);
    expect(hidden().value).toBe('1');
    const dateField = container.querySelector('[data-testid="date-field"]');
    expect(dateField?.getAttribute('data-name')).toBe(
      'extra_fields.date_of_birth'
    );
    expect(dateField?.getAttribute('data-label')).toBe(
      'extra_fields.date_of_birth'
    );

    act(() => {
      chips()[0].click();
    });
    expect(pressed()).toEqual(['None']);
    expect(container.querySelector('[data-testid="date-field"]')).toBeNull();
  });

  it('shows the date of birth for the second insurance option as well', () => {
    renderInsurances({}, '2');
    expect(
      container.querySelector('[data-testid="date-field"]')
    ).not.toBeNull();
  });
});
