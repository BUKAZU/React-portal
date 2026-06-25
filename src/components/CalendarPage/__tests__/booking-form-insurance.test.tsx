/**
 * Integration test: booking form with cancellation insurance
 *
 * This test exercises the full path from calendar → booking form with a house
 * that has cancel_insurance enabled.  Unlike booking-flow.test.tsx, the real
 * Insurances component is rendered so we can verify:
 *   • the insurance section appears in the form
 *   • the date-of-birth field is hidden initially (value = "0" / not chosen)
 *   • the date-of-birth field appears after selecting an insurance type
 *
 * The setup mirrors booking-flow.test.tsx with two key differences:
 *   1. insurances.tsx is NOT mocked.
 *   2. DateField from FormItems is mocked so the native date input is replaced
 *      with a simple div, keeping the test environment stable.
 */

import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import CalendarWrapper from '../CalendarPage';
import { AppContext } from '../../AppContext';

// ---------------------------------------------------------------------------
// Mock @apollo/client
// ---------------------------------------------------------------------------
jest.mock('@apollo/client', () => ({
  useQuery: jest.fn(),
  useMutation: jest.fn(() => [
    jest.fn().mockResolvedValue({}),
    { loading: false, error: null, data: null, reset: jest.fn() }
  ]),
  gql: (q: TemplateStringsArray) => q
}));

jest.mock('../../../_lib/gql', () => ({
  SINGLE_HOUSE_QUERY: 'SINGLE_HOUSE_QUERY',
  BOOKING_PRICE_QUERY: 'BOOKING_PRICE_QUERY',
  CREATE_BOOKING_MUTATION: 'CREATE_BOOKING_MUTATION',
  PRICE_FIELD_BOOKING_PRICE_QUERY: 'PRICE_FIELD_BOOKING_PRICE_QUERY'
}));

jest.mock('../../../_lib/Tracking', () => ({
  getSessionIdentifier: jest.fn(() => 'test-session'),
  TrackEvent: jest.fn()
}));

jest.mock('../../Error', () => ({
  ApiError: () => <div data-testid="api-error" />
}));

jest.mock('../../icons/loading.svg', () => () => (
  <div data-testid="loading-icon" />
));

// insurances.tsx uses an info SVG and Modal – keep them lightweight
jest.mock('../../icons/info.svg', () => () => <span data-testid="info-icon" />);

jest.mock('../../Modal', () => ({ children, buttonText, show }: any) => {
  if (show === false || show === undefined) {
    return (
      <button type="button" data-testid="modal-button">
        {buttonText}
      </button>
    );
  }
  return <div data-testid="modal">{children}</div>;
});

// Mock DateField so we don't need a full date-picker in jsdom
jest.mock('../FormItems', () => ({
  DateField: ({ name }: { name: string }) => (
    <div data-testid="date-field" data-name={name} />
  ),
  NumberSelect: ({ name }: { name: string }) => (
    <div data-testid={`number-select-${name}`} />
  ),
  Select: () => <div data-testid="select-field" />
}));

// ---------------------------------------------------------------------------
// Mock DefaultBookingFields → [] so no extra required fields block submit
// ---------------------------------------------------------------------------
jest.mock('../formParts/DefaultBookingFields', () => []);

// ---------------------------------------------------------------------------
// Mock heavy sub-components NOT under test
// ---------------------------------------------------------------------------
jest.mock('../formParts/Guests', () => () => <div data-testid="guests" />);
jest.mock('../formParts/discount', () => () => <div data-testid="discount" />);
jest.mock('../formParts/OptionalCosts', () => () => (
  <div data-testid="optional-costs" />
));
jest.mock('../formParts/OptionalBookingFields', () => () => (
  <div data-testid="optional-booking-fields" />
));
jest.mock('../Summary', () => () => <div data-testid="summary" />);
jest.mock('../formParts/SuccessMessage', () => () => (
  <div data-testid="success-message" />
));
jest.mock('../formParts/CancelInsuranceText', () => () => (
  <div data-testid="cancel-insurance-text" />
));

// ---------------------------------------------------------------------------
// Mock Calendar with arrival/departure buttons + real StartBooking
// ---------------------------------------------------------------------------
jest.mock('../Calendar', () => {
  const ReactMock = require('react');
  const {
    CalendarContextDispatch
  } = require('../CalendarParts/CalendarContext');
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
        <StartBooking house={house} />
      </div>
    );
  };
});

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

// ---------------------------------------------------------------------------
// Fixture helpers
// ---------------------------------------------------------------------------

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

function makeHouseWithInsurance(cancelInsurance: boolean) {
  return {
    id: 1,
    code: 'HOUSE1',
    name: 'Insurance Test House',
    house_type: 'house',
    persons: 6,
    max_nights: 14,
    allow_option: false,
    cancel_insurance: cancelInsurance,
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
}

function makeSingleHouseData(house: ReturnType<typeof makeHouseWithInsurance>) {
  return {
    PortalSite: {
      id: 'TEST',
      options: { bookingFields: [], bookingForm: {} },
      bookingFormConfiguration: mockBookingFormConfiguration,
      houses: [house]
    }
  };
}

function makeBookingPriceData(house: ReturnType<typeof makeHouseWithInsurance>) {
  return {
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
      houses: [{ ...house }]
    }
  };
}

const mockPortalSite = {
  id: 'TEST',
  portal_code: 'TEST',
  name: 'Test Portal',
  options: {
    bookingFields: [],
    bookingForm: {},
    filtersForm: {},
    searchFields: []
  },
  colorsConfiguration: {},
  bookingFormConfiguration: mockBookingFormConfiguration,
  booking_fields: [],
  categories: [],
  max_persons: 10,
  max_bedrooms: 5,
  max_bathrooms: 3,
  max_weekprice: 5000,
  form_submit_text: 'By booking you agree to our',
  form_submit_button_text: 'Book now'
} as any;

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

let container: HTMLDivElement;
let root: ReturnType<typeof createRoot>;
let consoleSpy: jest.SpyInstance;

function setupUseQuery(house: ReturnType<typeof makeHouseWithInsurance>) {
  const { useQuery } = require('@apollo/client');
  (useQuery as jest.Mock).mockImplementation((query: string) => {
    if (query === 'SINGLE_HOUSE_QUERY') {
      return {
        data: makeSingleHouseData(house),
        loading: false,
        error: null
      };
    }
    if (query === 'BOOKING_PRICE_QUERY') {
      return {
        data: makeBookingPriceData(house),
        loading: false,
        error: null
      };
    }
    if (query === 'PRICE_FIELD_BOOKING_PRICE_QUERY') {
      return {
        data: {
          PortalSite: {
            houses: [
              {
                id: 1,
                name: 'Insurance Test House',
                booking_price: { total_price: 1500 }
              }
            ]
          }
        },
        loading: false,
        error: null
      };
    }
    return { data: null, loading: false, error: null };
  });
}

function renderApp() {
  act(() => {
    root.render(
      <AppContext.Provider
        value={{
          locale: 'en',
          portalCode: 'TEST',
          objectCode: 'HOUSE1',
          apiUrl: 'https://api.bukazu.com/graphql'
        }}
      >
        <CalendarWrapper portalSite={mockPortalSite} />
      </AppContext.Provider>
    );
  });
}

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

function clickCalculate() {
  act(() => {
    (container.querySelector('button.button') as HTMLElement).click();
  });
}

function navigateToBookingForm() {
  selectDates();
  clickCalculate();
}

beforeEach(() => {
  consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  (window as any).__localeId__ = 'en';
  container = document.createElement('div');
  document.body.appendChild(container);
  act(() => {
    root = createRoot(container);
  });
  jest.clearAllMocks();

  const { useMutation } = require('@apollo/client');
  (useMutation as jest.Mock).mockReturnValue([
    jest.fn().mockResolvedValue({}),
    { loading: false, error: null, data: null, reset: jest.fn() }
  ]);
});

afterEach(() => {
  consoleSpy.mockRestore();
  act(() => {
    root.unmount();
  });
  container.remove();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Booking form – cancel_insurance disabled on house', () => {
  it('does not render the insurances section when house.cancel_insurance is false', () => {
    setupUseQuery(makeHouseWithInsurance(false));
    renderApp();
    navigateToBookingForm();

    expect(container.querySelector('#insurances')).toBeNull();
  });

  it('renders the booking form without any insurance select', () => {
    setupUseQuery(makeHouseWithInsurance(false));
    renderApp();
    navigateToBookingForm();

    const selects = container.querySelectorAll(
      'select[name="cancel_insurance"]'
    );
    expect(selects).toHaveLength(0);
  });
});

describe('Booking form – cancel_insurance enabled on house', () => {
  it('renders the insurances section when house.cancel_insurance is true', () => {
    setupUseQuery(makeHouseWithInsurance(true));
    renderApp();
    navigateToBookingForm();

    expect(container.querySelector('#insurances')).not.toBeNull();
  });

  it('renders the "Insurances" heading', () => {
    setupUseQuery(makeHouseWithInsurance(true));
    renderApp();
    navigateToBookingForm();

    const heading = container.querySelector('#insurances h2');
    expect(heading?.textContent).toBe('Insurances');
  });

  it('renders the cancel_insurance select dropdown', () => {
    setupUseQuery(makeHouseWithInsurance(true));
    renderApp();
    navigateToBookingForm();

    const select = container.querySelector('select[name="cancel_insurance"]');
    expect(select).not.toBeNull();
  });

  it('does NOT show the date-of-birth field before any insurance is selected', () => {
    setupUseQuery(makeHouseWithInsurance(true));
    renderApp();
    navigateToBookingForm();

    // The default value is '' (the choose option), so DOB must be hidden
    expect(container.querySelector('[data-testid="date-field"]')).toBeNull();
  });

  it('shows the date-of-birth field after selecting insurance option "1"', async () => {
    setupUseQuery(makeHouseWithInsurance(true));
    renderApp();
    navigateToBookingForm();

    const select = container.querySelector(
      'select[name="cancel_insurance"]'
    ) as HTMLSelectElement;
    expect(select).not.toBeNull();

    await act(async () => {
      const nativeSelectValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLSelectElement.prototype,
        'value'
      )!.set!;
      nativeSelectValueSetter.call(select, '1');
      select.dispatchEvent(new Event('change', { bubbles: true }));
    });

    const dobField = container.querySelector('[data-testid="date-field"]');
    expect(dobField).not.toBeNull();
    expect(dobField?.getAttribute('data-name')).toBe(
      'extra_fields.date_of_birth'
    );
  });

  it('hides the date-of-birth field after switching back to "None" (value "0")', async () => {
    setupUseQuery(makeHouseWithInsurance(true));
    renderApp();
    navigateToBookingForm();

    const select = container.querySelector(
      'select[name="cancel_insurance"]'
    ) as HTMLSelectElement;

    // Select insurance
    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(
        window.HTMLSelectElement.prototype,
        'value'
      )!.set!;
      setter.call(select, '1');
      select.dispatchEvent(new Event('change', { bubbles: true }));
    });

    expect(container.querySelector('[data-testid="date-field"]')).not.toBeNull();

    // Switch back to None
    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(
        window.HTMLSelectElement.prototype,
        'value'
      )!.set!;
      setter.call(select, '0');
      select.dispatchEvent(new Event('change', { bubbles: true }));
    });

    expect(container.querySelector('[data-testid="date-field"]')).toBeNull();
  });
});
