import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { Formik } from 'formik';
import BookingOrOption from '../BookingOrOption';
import { HouseType } from '../../../../types';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

const baseHouse = {
  id: 1,
  code: 'TEST',
  name: 'Test House',
  house_type: 'house',
  persons: 4,
  max_nights: 14,
  allow_option: false,
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

function renderBookingOrOption(housePatch: Partial<typeof baseHouse> = {}) {
  const house = { ...baseHouse, ...housePatch };
  act(() => {
    root.render(
      <Formik initialValues={{ is_option: 'false' }} onSubmit={() => {}}>
        <BookingOrOption house={house as unknown as HouseType} />
      </Formik>
    );
  });
}

describe('BookingOrOption – allow_option is false', () => {
  it('renders nothing when allow_option is false', () => {
    renderBookingOrOption({ allow_option: false });
    // No radio inputs should be present
    expect(container.querySelector('input[type="radio"]')).toBeNull();
  });

  it('renders an empty fragment when allow_option is false', () => {
    renderBookingOrOption({ allow_option: false });
    expect(container.textContent).toBe('');
  });
});

describe('BookingOrOption – allow_option is true', () => {
  it('renders two radio inputs when allow_option is true', () => {
    renderBookingOrOption({ allow_option: true });
    const radios = container.querySelectorAll('input[type="radio"]');
    expect(radios).toHaveLength(2);
  });

  it('renders the radio button group container', () => {
    renderBookingOrOption({ allow_option: true });
    expect(container.querySelector('.booking_option')).not.toBeNull();
  });

  it('renders an "Option" radio button with value "true"', () => {
    renderBookingOrOption({ allow_option: true });
    const optionRadio = container.querySelector(
      'input[type="radio"][value="true"]'
    );
    expect(optionRadio).not.toBeNull();
  });

  it('renders a "Booking" radio button with value "false"', () => {
    renderBookingOrOption({ allow_option: true });
    const bookingRadio = container.querySelector(
      'input[type="radio"][value="false"]'
    );
    expect(bookingRadio).not.toBeNull();
  });

  it('renders the "Option" label', () => {
    renderBookingOrOption({ allow_option: true });
    const labels = Array.from(container.querySelectorAll('label'));
    const optionLabel = labels.find((l) => l.textContent === 'Option');
    expect(optionLabel).not.toBeUndefined();
  });

  it('renders the "Booking" label', () => {
    renderBookingOrOption({ allow_option: true });
    const labels = Array.from(container.querySelectorAll('label'));
    const bookingLabel = labels.find((l) => l.textContent === 'Booking');
    expect(bookingLabel).not.toBeUndefined();
  });

  it('sets both radio buttons to the same name "is_option"', () => {
    renderBookingOrOption({ allow_option: true });
    const radios = container.querySelectorAll('input[type="radio"]');
    radios.forEach((r) => {
      expect((r as HTMLInputElement).name).toBe('is_option');
    });
  });
});
