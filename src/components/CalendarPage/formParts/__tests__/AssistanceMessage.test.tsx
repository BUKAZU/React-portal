import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import AssistanceMessage from '../AssistanceMessage';
import {
  CalendarContext,
  CalendarContextDispatch
} from '../../CalendarParts/CalendarContext';
import { HouseType, BuDate } from '../../../../types';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

const noop = () => {};

const baseHouse = {
  id: 1,
  code: 'TEST',
  name: 'Test House',
  house_type: 'house',
  persons: 4,
  max_nights: 14,
  babies_extra: 0
} as unknown as HouseType;

const arrivalDay: BuDate = {
  date: '2025-07-01',
  arrival: true,
  departure: false,
  min_nights: 7,
  max_nights: 14,
  special_offer: 0
};

const departureDay: BuDate = {
  date: '2025-07-08',
  arrival: false,
  departure: true,
  min_nights: 7,
  max_nights: 14,
  special_offer: 0
};

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

function renderAssistanceMessage(
  arrivalDate: BuDate | null = null,
  departureDate: BuDate | null = null
) {
  const calendarState = {
    arrivalDate,
    departureDate,
    selectedDate: arrivalDate ? new Date(arrivalDate.date) : null,
    bookingStarted: false,
    persons: 2
  };

  act(() => {
    root.render(
      <CalendarContextDispatch.Provider value={noop}>
        <CalendarContext.Provider value={calendarState as any}>
          <AssistanceMessage house={baseHouse} />
        </CalendarContext.Provider>
      </CalendarContextDispatch.Provider>
    );
  });
}

describe('AssistanceMessage – no dates selected', () => {
  it('renders a prompt to choose an arrival date', () => {
    renderAssistanceMessage(null, null);
    expect(container.textContent).toContain('Choose an arrival date');
  });

  it('does not show an arrival date when no dates are selected', () => {
    renderAssistanceMessage(null, null);
    expect(container.textContent).not.toContain('Your arrival date is');
  });
});

describe('AssistanceMessage – only arrival date selected', () => {
  it('shows the arrival date message', () => {
    renderAssistanceMessage(arrivalDay, null);
    expect(container.textContent).toContain('Your arrival date is');
  });

  it('shows a prompt to select the departure date', () => {
    renderAssistanceMessage(arrivalDay, null);
    expect(container.textContent).toContain('Select a departure date');
  });

  it('shows the minimum nights requirement', () => {
    renderAssistanceMessage(arrivalDay, null);
    expect(container.textContent).toContain('At least 7 nights');
  });

  it('renders in the bup-16 bu-bold div', () => {
    renderAssistanceMessage(arrivalDay, null);
    expect(container.querySelector('.bup-16.bu-bold')).not.toBeNull();
  });
});

describe('AssistanceMessage – both dates selected', () => {
  it('shows the arrival date message when both dates are set', () => {
    renderAssistanceMessage(arrivalDay, departureDay);
    expect(container.textContent).toContain('Your arrival date is');
  });

  it('shows the departure date message when both dates are set', () => {
    renderAssistanceMessage(arrivalDay, departureDay);
    expect(container.textContent).toContain('Your departure date is');
  });

  it('does not show the departure selection prompt when departure is already chosen', () => {
    renderAssistanceMessage(arrivalDay, departureDay);
    expect(container.textContent).not.toContain('Select a departure date');
  });
});
