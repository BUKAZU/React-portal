/**
 * Integration test: full booking flow
 *
 * Covers the end-to-end path from the calendar view (date selection)
 * through to the success modal that is shown after a booking is created.
 *
 * Strategy
 * --------
 * • Real components: CalendarWrapper, CalendarPage, GenerateCalendar,
 *   BookingForm, FormCreator, PriceField, Modal, SuccessMessage, CalendarProvider.
 * • Mocked external dependencies: @apollo/client (useQuery / useMutation),
 *   _lib/gql (returns string constants so useQuery mock can branch on them),
 *   _lib/Tracking, loading SVG icon.
 * • Mocked heavy sub-components that are already covered by their own unit
 *   tests: Calendar (replaced with simple arrival/departure buttons that drive
 *   the CalendarContext), Guests, Summary, Discount, Insurances, OptionalCosts,
 *   OptionalBookingFields, DefaultBookingFields (→ [] so no required fields).
 */

import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import CalendarWrapper from '../CalendarPage';
import { AppContext } from '../../AppContext';

// ---------------------------------------------------------------------------
// Mock @apollo/client – provide controllable useQuery / useMutation stubs
// ---------------------------------------------------------------------------
jest.mock('@apollo/client', () => ({
  useQuery: jest.fn(),
  useMutation: jest.fn(() => [
    jest.fn().mockResolvedValue({}),
    { loading: false, error: null, data: null, reset: jest.fn() }
  ]),
  gql: (q: TemplateStringsArray) => q
}));

// ---------------------------------------------------------------------------
// Mock gql module with opaque string constants so useQuery mock can branch
// ---------------------------------------------------------------------------
jest.mock('../../../_lib/gql', () => ({
  SINGLE_HOUSE_QUERY: 'SINGLE_HOUSE_QUERY',
  BOOKING_PRICE_QUERY: 'BOOKING_PRICE_QUERY',
  CALENDAR_QUERY: 'CALENDAR_QUERY',
  CREATE_BOOKING_MUTATION: 'CREATE_BOOKING_MUTATION',
  PRICE_FIELD_BOOKING_PRICE_QUERY: 'PRICE_FIELD_BOOKING_PRICE_QUERY'
}));

// ---------------------------------------------------------------------------
// Mock Tracking to avoid cookie / fetch side-effects
// ---------------------------------------------------------------------------
jest.mock('../../../_lib/Tracking', () => ({
  getSessionIdentifier: jest.fn(() => 'test-session'),
  TrackEvent: jest.fn()
}));

// ---------------------------------------------------------------------------
// Mock Error components
// ---------------------------------------------------------------------------
jest.mock('../../Error', () => ({
  ApiError: () => <div data-testid="api-error" />
}));

// ---------------------------------------------------------------------------
// Mock loading SVG
// ---------------------------------------------------------------------------
jest.mock('../../icons/loading.svg', () => () => (
  <div data-testid="loading-icon" />
));

// ---------------------------------------------------------------------------
// Mock DefaultBookingFields → empty array so validation never blocks submit
// ---------------------------------------------------------------------------
jest.mock('../formParts/DefaultBookingFields', () => []);

// ---------------------------------------------------------------------------
// Mock heavy form sub-components (each has its own unit-test suite)
// ---------------------------------------------------------------------------
jest.mock('../formParts/Guests', () => () => <div data-testid="guests" />);
jest.mock('../formParts/discount', () => () => <div data-testid="discount" />);
jest.mock('../formParts/insurances', () => ({
  Insurances: () => <div data-testid="insurances" />
}));
jest.mock('../formParts/OptionalCosts', () => () => (
  <div data-testid="optional-costs" />
));
jest.mock('../formParts/OptionalBookingFields', () => () => (
  <div data-testid="optional-booking-fields" />
));
jest.mock('../Summary', () => () => <div data-testid="summary" />);

// ---------------------------------------------------------------------------
// Mock Calendar with simple date-selection buttons that drive CalendarContext
// dispatch, plus the real StartBooking component (which contains PriceField
// and the Calculate button).  Rendering only these two things avoids the
// complex SingleMonth / RenderCells calendar grid (covered by its own tests)
// while still exercising the full state-transition flow.
// ---------------------------------------------------------------------------
jest.mock('../Calendar', () => {
  const ReactMock = require('react');
  const { CalendarContextDispatch } = require('../CalendarParts/CalendarContext');
  const StartBooking = require('../CalendarParts/StartBooking').default;

  const arrivalDay = {
    date: '2025-07-01',
    arrival: true,
    departure: false,
    min_nights: 7,
    max_nights: 14,
    special_offer: 0
  };

  const departureDay = {
    date: '2025-07-08',
    arrival: false,
    departure: true,
    min_nights: 7,
    max_nights: 14,
    special_offer: 0
  };

  return function MockCalendar({ house }: { house: any }) {
    const dispatch = ReactMock.useContext(CalendarContextDispatch);
    return (
      <div data-testid="mock-calendar">
        {/* Simple helpers for date selection without a real calendar grid */}
        <button
          data-testid="select-arrival"
          onClick={() => dispatch({ type: 'clicked', day: arrivalDay, house })}
        >
          Select Arrival
        </button>
        <button
          data-testid="select-departure"
          onClick={() =>
            dispatch({ type: 'clicked', day: departureDay, house })
          }
        >
          Select Departure
        </button>
        {/* Render the real StartBooking / PriceField so the Calculate button
            and persons picker are exercised by the integration test. */}
        <StartBooking house={house} />
      </div>
    );
  };
});

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

// ---------------------------------------------------------------------------
// Fixture data
// ---------------------------------------------------------------------------

const mockHouse = {
  id: 1,
  code: 'HOUSE1',
  name: 'Test House',
  house_type: 'house',
  persons: 6,
  max_nights: 14,
  allow_option: false,
  cancel_insurance: false,
  discounts: '',
  discounts_info: '',
  babies_extra: 0,
  last_minute_days: 0,
  rental_terms: 'https://example.com/terms',
  booking_price: {
    total_price: 1500,
    optional_house_costs: []
  }
};

const mockBookingFormConfiguration = {
  adultsFromAge: 18,
  babiesAllowed: false,
  babiesTillAge: 2,
  childrenAllowed: false,
  childrenFromAge: 3,
  childrenTillAge: 17,
  languageSelectorVisible: false,
  redirectUrl: '',
  redirectUrlNl: '',
  redirectUrlEn: '',
  redirectUrlDe: '',
  redirectUrlFr: '',
  redirectUrlEs: '',
  redirectUrlIt: '',
  showDiscountCode: false,
  showMonthsAmount: 2,
  showMonthsInARow: 2,
  showMonthsInARowAmount: 2
};

/** Data returned by SINGLE_HOUSE_QUERY (GenerateCalendar) */
const singleHouseData = {
  PortalSite: {
    id: 'TEST',
    options: {
      bookingFields: [],
      bookingForm: {}
    },
    bookingFormConfiguration: mockBookingFormConfiguration,
    houses: [mockHouse]
  }
};

/** Data returned by BOOKING_PRICE_QUERY (BookingForm) */
const bookingPriceData = {
  PortalSite: {
    id: 'TEST',
    options: {
      bookingFields: [],
      bookingForm: {
        adults_from: 18,
        children: false,
        children_from: 0,
        children_til: 12,
        babies: false,
        babies_til: 2,
        showDiscountCode: false,
        redirectUrl: null,
        redirectUrlEn: null,
        redirectUrlNl: null,
        redirectUrlDe: null,
        redirectUrlFr: null,
        redirectUrlEs: null,
        redirectUrlIt: null
      }
    },
    bookingFormConfiguration: mockBookingFormConfiguration,
    max_persons: 10,
    name: 'Test Portal',
    max_bedrooms: 5,
    max_bathrooms: 3,
    max_weekprice: 5000,
    form_submit_text: 'By booking you agree to our',
    form_submit_button_text: 'Book now',
    houses: [{ ...mockHouse }]
  }
};

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

let container: HTMLDivElement;
let root: ReturnType<typeof createRoot>;

function renderApp() {
  act(() => {
    root.render(
      <AppContext.Provider
        value={{ locale: 'en', portalCode: 'TEST', objectCode: 'HOUSE1' }}
      >
        <CalendarWrapper />
      </AppContext.Provider>
    );
  });
}

/** Simulate clicking on an arrival date then a departure date */
function selectDates() {
  act(() => {
    (
      container.querySelector('[data-testid="select-arrival"]') as HTMLElement
    ).click();
  });
  act(() => {
    (
      container.querySelector('[data-testid="select-departure"]') as HTMLElement
    ).click();
  });
}

/** Click the "Calculate / Start booking" button in PriceField */
function clickCalculate() {
  act(() => {
    (container.querySelector('button.button') as HTMLElement).click();
  });
}

beforeEach(() => {
  (window as any).__localeId__ = 'en';
  container = document.createElement('div');
  document.body.appendChild(container);
  act(() => {
    root = createRoot(container);
  });
  jest.clearAllMocks();

  // Default useQuery behaviour: return appropriate fixture data per query
  const { useQuery } = require('@apollo/client');
  (useQuery as jest.Mock).mockImplementation((query: string) => {
    if (query === 'SINGLE_HOUSE_QUERY') {
      return { data: singleHouseData, loading: false, error: null };
    }
    if (query === 'BOOKING_PRICE_QUERY') {
      return { data: bookingPriceData, loading: false, error: null };
    }
    if (query === 'PRICE_FIELD_BOOKING_PRICE_QUERY') {
      return {
        data: {
          PortalSite: {
            houses: [
              { id: 1, name: 'Test House', booking_price: { total_price: 1500 } }
            ]
          }
        },
        loading: false,
        error: null
      };
    }
    return { data: null, loading: false, error: null };
  });
});

afterEach(() => {
  act(() => {
    root.unmount();
  });
  container.remove();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Booking flow – integration', () => {
  it('renders the calendar view (GenerateCalendar) on initial load', () => {
    renderApp();

    expect(
      container.querySelector('[data-testid="mock-calendar"]')
    ).not.toBeNull();
    // BookingForm / form element should not be present yet
    expect(container.querySelector('form.form')).toBeNull();
  });

  it('displays the house name in the calendar view', () => {
    renderApp();

    expect(container.textContent).toContain('Test House');
  });

  it('disables the Calculate button before any date is selected', () => {
    renderApp();

    const calcButton = container.querySelector(
      'button.button'
    ) as HTMLButtonElement | null;
    expect(calcButton).not.toBeNull();
    expect(calcButton!.disabled).toBe(true);
  });

  it('enables the Calculate button once arrival and departure dates are selected', () => {
    renderApp();

    selectDates();

    const calcButton = container.querySelector(
      'button.button'
    ) as HTMLButtonElement;
    expect(calcButton.disabled).toBe(false);
  });

  it('transitions from the calendar view to the booking form after clicking Calculate', () => {
    renderApp();

    selectDates();
    clickCalculate();

    // Calendar is no longer shown
    expect(container.querySelector('[data-testid="mock-calendar"]')).toBeNull();
    // Booking form is now rendered
    expect(container.querySelector('form.form')).not.toBeNull();
  });

  it('renders the submit button inside the booking form', () => {
    renderApp();

    selectDates();
    clickCalculate();

    const submitButton = container.querySelector('button[type="submit"]');
    expect(submitButton).not.toBeNull();
    expect(submitButton!.textContent).toBe('Book now');
  });

  it('shows the success modal after a booking is successfully created', () => {
    // Make the mutation return success data immediately so the modal is visible
    const { useMutation } = require('@apollo/client');
    (useMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValue({}),
      {
        loading: false,
        error: null,
        data: { createBooking: { id: 42 } },
        reset: jest.fn()
      }
    ]);

    renderApp();

    selectDates();
    clickCalculate();

    // The success modal container and SuccessMessage component must be rendered
    const modalContainer = container.querySelector('.bukazu-modal');
    expect(modalContainer).not.toBeNull();
    expect(modalContainer!.querySelector('.success-message')).not.toBeNull();
  });

  it('shows "Creating booking..." loading text while the mutation is in flight', () => {
    const { useMutation } = require('@apollo/client');
    (useMutation as jest.Mock).mockReturnValue([
      jest.fn(),
      { loading: true, error: null, data: null, reset: jest.fn() }
    ]);

    renderApp();

    selectDates();
    clickCalculate();

    const loadingMsg = container.querySelector('.return-message');
    expect(loadingMsg).not.toBeNull();
    expect(loadingMsg!.textContent).toBe('Creating booking...');
  });

  it('shows an error modal when the booking mutation returns an error', () => {
    const { useMutation } = require('@apollo/client');
    (useMutation as jest.Mock).mockReturnValue([
      jest.fn(),
      {
        loading: false,
        error: { message: 'Network error', graphQLErrors: [] },
        data: null,
        reset: jest.fn()
      }
    ]);

    renderApp();

    selectDates();
    clickCalculate();

    expect(
      container.querySelector('[data-testid="api-error"]')
    ).not.toBeNull();
  });

  it('returns to the calendar view when the return link is clicked', () => {
    renderApp();

    selectDates();
    clickCalculate();

    // Confirm the form is showing
    expect(container.querySelector('form.form')).not.toBeNull();

    // Click the "return to calendar" link
    act(() => {
      (container.querySelector('.return-link') as HTMLElement)?.click();
    });

    // Calendar should be restored, booking form gone
    expect(
      container.querySelector('[data-testid="mock-calendar"]')
    ).not.toBeNull();
    expect(container.querySelector('form.form')).toBeNull();
  });
});
