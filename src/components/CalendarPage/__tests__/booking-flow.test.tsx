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
 * • Mocked external dependencies: _lib/accommodation, _lib/create_booking,
 *   _lib/price, _lib/Tracking, loading SVG icon.
 * • Mocked heavy sub-components that are already covered by their own unit
 *   tests: Calendar (replaced with simple arrival/departure buttons that drive
 *   the CalendarContext), Guests, Summary, Discount, Insurances, OptionalCosts,
 *   OptionalBookingFields, RequiredBookingFields (→ [] so no required fields).
 */

import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import CalendarWrapper from '../CalendarPage';
import { AppContext } from '../../AppContext';
import { AccommodationDetailError } from '../../../_lib/accommodation';

// ---------------------------------------------------------------------------
// Mock the REST accommodation client (replaces the legacy SINGLE_HOUSE_QUERY).
// requireActual keeps AccommodationDetailError real, so GenerateCalendar's
// instanceof check still works.
// ---------------------------------------------------------------------------
const mockFetchAccommodationDetail = jest.fn();
jest.mock('../../../_lib/accommodation', () => ({
  ...jest.requireActual('../../../_lib/accommodation'),
  fetchAccommodationDetail: (...args: unknown[]) =>
    mockFetchAccommodationDetail(...args)
}));

// ---------------------------------------------------------------------------
// Mock the REST bookings client (replaces the legacy GraphQL createBooking)
// ---------------------------------------------------------------------------
const mockCreateBooking = jest.fn();
jest.mock('../../../_lib/create_booking', () => ({
  ...jest.requireActual('../../../_lib/create_booking'),
  createBooking: (...args: unknown[]) => mockCreateBooking(...args)
}));

// ---------------------------------------------------------------------------
// Mock navigation — jsdom's window.location cannot navigate
// ---------------------------------------------------------------------------
const mockRedirectTo = jest.fn();
jest.mock('../../../_lib/navigation', () => ({
  redirectTo: (...args: unknown[]) => mockRedirectTo(...args)
}));

const bookingResponse = {
  booking_nr: 'B2600123',
  status: 'new',
  is_option: false,
  arrival_date: '2025-07-01',
  departure_date: '2025-07-08',
  adults: 2,
  children: 0,
  babies: 0,
  language: 'en',
  payment_url: null,
  redirect_url: null,
  success_message: 'Thanks',
  portal_code: 'TEST',
  house_code: 'HOUSE1',
  first_name: null,
  last_name: null,
  email: null
};

// ---------------------------------------------------------------------------
// Mock the REST price client (replaces the legacy GraphQL price queries)
// ---------------------------------------------------------------------------
const mockFetchPrice = jest.fn();
jest.mock('../../../_lib/price', () => ({
  fetchPrice: (...args: unknown[]) => mockFetchPrice(...args)
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
// Mock RequiredBookingFields → empty array so validation never blocks submit
// ---------------------------------------------------------------------------
jest.mock('../formParts/RequiredBookingFields', () => []);

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
  image_url: null,
  damage_insurance: false,
  damage_insurance_required: false,
  travel_insurance: false,
  rental_terms: 'https://example.com/terms',
  booking_price: {
    total_price: 1500,
    optional_house_costs: []
  }
};

const mockBookingFormConfiguration = {
  adults_from_age: 18,
  babies_allowed: false,
  babies_till_age: 2,
  children_allowed: false,
  children_from_age: 3,
  children_till_age: 17,
  language_selector_visible: false,
  redirect_urls: { nl: '', en: '', de: '', fr: '', es: '', it: '' },
  show_discount_code: false,
  show_months_amount: 2,
  show_months_in_a_row_amount: 2
};

/**
 * Portal settings now arrive via props (loaded over REST by App), not through the
 * GraphQL queries. This mirrors the AppPortalSite the adapter produces.
 */
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
  countries: [],
  regions: [],
  cities: [],
  extra_search: [],
  max_persons: 10,
  max_bedrooms: 5,
  max_bathrooms: 3,
  max_nights: 14,
  max_weekprice: 5000,
  form_submit_text: 'By booking you agree to our',
  form_submit_button_text: 'Book now'
} as any;

/** Accommodation metadata as returned by the detail endpoint and under the
 * `accommodation` key of the price response. */
const { booking_price: _ignoredBookingPrice, ...mockAccommodation } = mockHouse;

/** Price returned by the REST price endpoint (fetchPrice), used by both
 * PriceField/Price (calendar preview) and BookingForm (accommodation + costs). */
const mockPriceResponse = {
  total_price: 1500,
  currency: 'EUR',
  optional_house_costs: [],
  accommodation: mockAccommodation
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

/** Flush the microtask queue so pending fetchPrice promises resolve. */
async function flush() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

/** Simulate clicking on an arrival date then a departure date */
async function selectDates() {
  // The calendar only appears once the accommodation request resolved.
  await flush();
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
  // Selecting both dates renders PriceField's <Price>, which fetches via REST.
  await flush();
}

/** Click the "Calculate / Start booking" button in PriceField */
async function clickCalculate() {
  act(() => {
    (container.querySelector('button.button') as HTMLElement).click();
  });
  // BookingForm fetches its own price (for optional_house_costs) on mount.
  await flush();
}

/** Submit the booking form and let the request settle */
async function submitBookingForm() {
  await act(async () => {
    (container.querySelector('button[type="submit"]') as HTMLElement).click();
  });
  await flush();
}

/** Navigate from the calendar view to the booking form */
async function navigateToBookingForm() {
  await selectDates();
  await clickCalculate();
}

beforeEach(() => {
  (window as any).__localeId__ = 'en';
  container = document.createElement('div');
  document.body.appendChild(container);
  act(() => {
    root = createRoot(container);
  });
  jest.clearAllMocks();

  mockCreateBooking.mockResolvedValue(bookingResponse);
  mockFetchAccommodationDetail.mockResolvedValue(mockAccommodation);
  mockFetchPrice.mockResolvedValue(mockPriceResponse);
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
  it('renders the calendar view (GenerateCalendar) on initial load', async () => {
    renderApp();
    await flush();

    expect(
      container.querySelector('[data-testid="mock-calendar"]')
    ).not.toBeNull();
    // BookingForm / form element should not be present yet
    expect(container.querySelector('form.form')).toBeNull();
  });

  it('displays the house name in the calendar view', async () => {
    renderApp();
    await flush();

    expect(container.textContent).toContain('Test House');
  });

  it('disables the Calculate button before any date is selected', async () => {
    renderApp();
    await flush();

    const calcButton = container.querySelector(
      'button.button'
    ) as HTMLButtonElement | null;
    expect(calcButton).not.toBeNull();
    expect(calcButton!.disabled).toBe(true);
  });

  it('fetches the accommodation through the REST detail endpoint', async () => {
    renderApp();
    await flush();

    expect(mockFetchAccommodationDetail).toHaveBeenCalledWith({
      apiUrl: 'https://api.bukazu.com/graphql',
      locale: 'en',
      portalCode: 'TEST',
      objectCode: 'HOUSE1'
    });
  });

  it('shows the loading indicator until the accommodation resolves', async () => {
    renderApp();

    expect(container.querySelector('[data-testid="mock-calendar"]')).toBeNull();
    expect(container.textContent).not.toContain('Test House');

    // Settle the request so the state update stays inside act().
    await flush();
  });

  it('shows the api error when the request rejects with a non-Error', async () => {
    mockFetchAccommodationDetail.mockRejectedValue('boom');

    renderApp();
    await flush();

    expect(container.querySelector('[data-testid="api-error"]')).not.toBeNull();
  });

  it('shows "no house found" when the accommodation is not on the portal site', async () => {
    mockFetchAccommodationDetail.mockRejectedValue(
      new AccommodationDetailError(404)
    );

    renderApp();
    await flush();

    expect(container.querySelector('[data-testid="mock-calendar"]')).toBeNull();
    expect(container.querySelector('[data-testid="api-error"]')).toBeNull();
    expect(container.textContent).toContain(
      'No object found for this combination of PortalCode and ObjectCode'
    );
  });

  it('shows the api error when the accommodation request fails', async () => {
    mockFetchAccommodationDetail.mockRejectedValue(
      new AccommodationDetailError(500)
    );

    renderApp();
    await flush();

    expect(container.querySelector('[data-testid="api-error"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="mock-calendar"]')).toBeNull();
  });

  it('enables the Calculate button once arrival and departure dates are selected', async () => {
    renderApp();

    await selectDates();

    const calcButton = container.querySelector(
      'button.button'
    ) as HTMLButtonElement;
    expect(calcButton.disabled).toBe(false);
  });

  it('transitions from the calendar view to the booking form after clicking Calculate', async () => {
    renderApp();

    await navigateToBookingForm();

    // Calendar is no longer shown
    expect(container.querySelector('[data-testid="mock-calendar"]')).toBeNull();
    // Booking form is now rendered
    expect(container.querySelector('form.form')).not.toBeNull();
  });

  it('requests the accommodation metadata along with the price for the booking form', async () => {
    renderApp();

    await navigateToBookingForm();

    expect(mockFetchPrice).toHaveBeenCalledWith(
      expect.objectContaining({ includeAccommodation: true })
    );
  });

  it('renders the submit button inside the booking form', async () => {
    renderApp();

    await navigateToBookingForm();

    const submitButton = container.querySelector('button[type="submit"]');
    expect(submitButton).not.toBeNull();
    expect(submitButton!.textContent).toBe('Book now');
  });

  it('posts the booking payload when the form is submitted', async () => {
    renderApp();
    await navigateToBookingForm();

    await submitBookingForm();

    expect(mockCreateBooking).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({
          starts_at: '2025-07-01',
          ends_at: '2025-07-08',
          object_code: 'HOUSE1',
          portal_code: 'TEST'
        })
      })
    );
  });

  it('shows the success modal when the booking is created', async () => {
    renderApp();
    await navigateToBookingForm();

    await submitBookingForm();

    // The success modal container and SuccessMessage component must be rendered
    const modalContainer = container.querySelector('.bukazu-modal');
    expect(modalContainer).not.toBeNull();
    expect(modalContainer!.querySelector('.success-message')).not.toBeNull();
  });

  describe('post-booking redirects', () => {
    it('redirects to the payment page when the backend asks for it', async () => {
      mockCreateBooking.mockResolvedValue({
        ...bookingResponse,
        payment_url: 'https://payments.bukazu.com/psp/token',
        redirect_to_payment: true
      });

      renderApp();
      await navigateToBookingForm();
      await submitBookingForm();

      expect(mockRedirectTo).toHaveBeenCalledWith(
        'https://payments.bukazu.com/psp/token'
      );
    });

    it('prefers the payment page over a configured thank-you page', async () => {
      mockCreateBooking.mockResolvedValue({
        ...bookingResponse,
        payment_url: 'https://payments.bukazu.com/psp/token',
        redirect_to_payment: true,
        redirect_url: 'https://example.com/thanks'
      });

      renderApp();
      await navigateToBookingForm();
      await submitBookingForm();

      expect(mockRedirectTo).toHaveBeenCalledWith(
        'https://payments.bukazu.com/psp/token'
      );
    });

    it('falls back to the thank-you page when the payment url is missing', async () => {
      mockCreateBooking.mockResolvedValue({
        ...bookingResponse,
        payment_url: null,
        redirect_to_payment: true,
        redirect_url: 'https://example.com/thanks'
      });

      renderApp();
      await navigateToBookingForm();
      await submitBookingForm();

      expect(mockRedirectTo).toHaveBeenCalledWith('https://example.com/thanks');
    });

    it('redirects to the response redirect_url when no payment redirect is requested', async () => {
      mockCreateBooking.mockResolvedValue({
        ...bookingResponse,
        redirect_url: 'https://example.com/thanks'
      });

      renderApp();
      await navigateToBookingForm();
      await submitBookingForm();

      expect(mockRedirectTo).toHaveBeenCalledWith('https://example.com/thanks');
    });

    it('does not navigate when neither a payment nor a thank-you redirect applies', async () => {
      renderApp();
      await navigateToBookingForm();
      await submitBookingForm();

      expect(mockRedirectTo).not.toHaveBeenCalled();
    });
  });

  it('shows "Creating booking..." loading text while the request is in flight', async () => {
    mockCreateBooking.mockReturnValue(new Promise(() => undefined));

    renderApp();
    await navigateToBookingForm();

    await submitBookingForm();

    const loadingMsg = container.querySelector('.return-message');
    expect(loadingMsg).not.toBeNull();
    expect(loadingMsg!.textContent).toBe('Creating booking...');
  });

  it('shows an error modal when the booking request fails', async () => {
    mockCreateBooking.mockRejectedValue(new Error('Network error'));

    renderApp();
    await navigateToBookingForm();

    await submitBookingForm();

    expect(container.querySelector('[data-testid="api-error"]')).not.toBeNull();
  });

  it('returns to the calendar view when the return link is clicked', async () => {
    renderApp();

    await navigateToBookingForm();

    // Confirm the form is showing
    expect(container.querySelector('form.form')).not.toBeNull();

    // Click the "return to calendar" link
    act(() => {
      (container.querySelector('.return-link') as HTMLElement)?.click();
    });
    // GenerateCalendar remounts and refetches the accommodation.
    await flush();

    // Calendar should be restored, booking form gone
    expect(
      container.querySelector('[data-testid="mock-calendar"]')
    ).not.toBeNull();
    expect(container.querySelector('form.form')).toBeNull();
  });
});
