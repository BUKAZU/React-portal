import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import StayCard from '../StayCard';
import type { HouseType } from '../../../../types';
import type { PossibleValues } from '../../formParts/form_types';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

const house = {
  name: 'Chalet Alpenrose',
  house_type: 'house',
  image_url: 'https://example.com/chalet.jpg'
} as HouseType;

const values = {
  arrivalDate: {
    date: '2030-06-03',
    arrival_time_from: '15:00',
    arrival_time_to: '18:00'
  },
  departureDate: { date: '2030-06-10', departure_time: '10:00' },
  persons: 4
} as unknown as PossibleValues;

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
  act(() => {
    root.unmount();
  });
  container.remove();
});

describe('StayCard', () => {
  it('shows the house with its photo, the stay and the times', () => {
    act(() => {
      root.render(<StayCard house={house} values={values} />);
    });
    expect(container.querySelector('h2')?.textContent).toBe('Booking details');
    expect(container.querySelector('.bu-stay-card-name')?.textContent).toBe(
      'Chalet Alpenrose'
    );
    expect(container.querySelector('img')?.getAttribute('src')).toBe(
      'https://example.com/chalet.jpg'
    );
    expect(container.querySelector('.bu-stay-card-range')?.textContent).toBe(
      'Mon 3 Jun → Mon 10 Jun'
    );
    const meta = container.querySelectorAll('.bu-stay-card-meta');
    expect(meta[0].textContent).toBe('7 nights4 persons');
    expect(meta[1].textContent).toBe('Arrival 15:00 - 18:00Departure 10:00');
    expect(container.querySelector('.bu-link-button')).toBeNull();
  });

  it('falls back to a placeholder without a photo and hides unknown times', () => {
    act(() => {
      root.render(
        <StayCard
          house={{ ...house, image_url: null }}
          values={
            {
              ...values,
              arrivalDate: { date: '2030-06-03' },
              departureDate: { date: '2030-06-10' }
            } as unknown as PossibleValues
          }
        />
      );
    });
    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('.bu-stay-card-placeholder')).not.toBeNull();
    expect(container.querySelectorAll('.bu-stay-card-meta')).toHaveLength(1);
  });

  it('offers to change the dates when a handler is given', () => {
    const onChangeDates = jest.fn();
    act(() => {
      root.render(
        <StayCard house={house} values={values} onChangeDates={onChangeDates} />
      );
    });
    const link = container.querySelector('.bu-link-button') as HTMLElement;
    expect(link.textContent).toBe('Change dates');
    act(() => {
      link.click();
    });
    expect(onChangeDates).toHaveBeenCalledTimes(1);
  });
});
