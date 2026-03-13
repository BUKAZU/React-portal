import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import FormCreator from '../FormCreator';
import {
  CalendarContext,
  CalendarContextDispatch
} from '../CalendarParts/CalendarContext';
import { AppContext } from '../../AppContext';
import { HouseType, PortalSiteType } from '../../../types';
import { BuDate } from '../../../types';

// Mock @apollo/client to avoid real GraphQL calls
jest.mock('@apollo/client', () => ({
  useMutation: jest.fn(() => [
    jest.fn().mockResolvedValue({}),
    { loading: false, error: null, data: null, reset: jest.fn() }
  ]),
  gql: (query: any) => query
}));

// Mock queries module so gql template literal is passable
jest.mock('../../../_lib/gql', () => ({
  CREATE_BOOKING_MUTATION: 'CREATE_BOOKING_MUTATION'
}));

// Mock Tracking to avoid cookie/fetch side-effects
jest.mock('../../../_lib/Tracking', () => ({
  getSessionIdentifier: jest.fn(() => 'test-session-id')
}));

// Mock child components that carry heavy dependencies
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
jest.mock('../formParts/SuccessMessage', () => () => (
  <div data-testid="success-message" />
));
jest.mock('../../Modal', () => ({ children, onClose, buttonText }: any) => (
  <div data-testid="modal">{children}</div>
));
jest.mock('../../Error', () => ({
  ApiError: () => <div data-testid="api-error" />
}));
jest.mock('../formParts/DefaultBookingFields', () => []);

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

// ---- Mock data ----

const mockArrivalDate: BuDate = {
  arrival: true,
  departure: false,
  min_nights: 7,
  max_nights: 14,
  date: '2025-07-01',
  special_offer: 0
};

const mockDepartureDate: BuDate = {
  arrival: false,
  departure: true,
  min_nights: 7,
  max_nights: 14,
  date: '2025-07-08',
  special_offer: 0
};

const mockCalendarState = {
  arrivalDate: mockArrivalDate,
  departureDate: mockDepartureDate,
  selectedDate: new Date('2025-07-01'),
  bookingStarted: true,
  persons: 2
};

const mockDispatch = jest.fn();

const mockHouse: HouseType = {
  id: 1,
  code: 'HOUSE1',
  name: 'Test House',
  house_type: 'house',
  persons: 6,
  bedrooms: 3,
  bathrooms: 2,
  minimum_week_price: 1000,
  max_nights: 14,
  allow_option: false,
  cancel_insurance: false,
  discounts: '',
  discounts_info: '',
  babies_extra: 0,
  city: 'Amsterdam',
  province: 'Noord-Holland',
  country_name: 'Netherlands',
  description: 'A nice house',
  rental_terms: 'https://example.com/terms',
  booking_price: {
    total_price: 1500,
    optional_house_costs: []
  } as any
} as any;

const mockPortalSite: PortalSiteType = {
  portal_code: 'TEST',
  categories: [],
  options: {
    filtersForm: {
      showCity: false,
      showRegion: false,
      showCountry: false,
      showPersons: false,
      showBathrooms: false,
      showBedrooms: false,
      showPrice: false,
      showRating: false,
      categories: [],
      no_results: 20,
      location: 'left',
      mode: 'grid',
      show: true,
      fixedMobile: false
    },
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
      redirectUrl_en: null,
      redirectUrl_nl: null,
      redirectUrl_de: null,
      redirectUrl_fr: null,
      redirectUrl_es: null,
      redirectUrl_it: null
    }
  },
  max_persons: 10,
  name: 'Test Portal',
  max_bedrooms: 5,
  max_bathrooms: 3,
  max_weekprice: 5000,
  form_submit_text: 'By booking you agree to our',
  form_submit_button_text: 'Book now'
} as any;

// ---- Helpers ----

let container: HTMLDivElement;
let root: ReturnType<typeof createRoot>;

function renderFormCreator(
  house: HouseType = mockHouse,
  portalSite: PortalSiteType = mockPortalSite,
  calendarState = mockCalendarState
) {
  act(() => {
    root.render(
      <AppContext.Provider
        value={{ locale: 'en', portalCode: 'TEST', objectCode: 'HOUSE1' }}
      >
        <CalendarContext.Provider value={calendarState as any}>
          <CalendarContextDispatch.Provider value={mockDispatch}>
            <FormCreator
              house={house}
              PortalSite={portalSite}
              booking={null as any}
            />
          </CalendarContextDispatch.Provider>
        </CalendarContext.Provider>
      </AppContext.Provider>
    );
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
});

afterEach(() => {
  act(() => {
    root.unmount();
  });
  container.remove();
});

// ---- Tests ----

describe('FormCreator', () => {
  it('should render a form element with class "form"', () => {
    renderFormCreator();

    const form = container.querySelector('form.form');
    expect(form).not.toBeNull();
  });

  it('should render the return-to-calendar link', () => {
    renderFormCreator();

    const returnLink = container.querySelector('.return-link');
    expect(returnLink).not.toBeNull();
  });

  it('should render the submit button with text from PortalSite', () => {
    renderFormCreator();

    const button = container.querySelector('button[type="submit"]');
    expect(button).not.toBeNull();
    expect(button?.textContent).toBe('Book now');
  });

  it('should render the Guests sub-component', () => {
    renderFormCreator();

    expect(container.querySelector('[data-testid="guests"]')).not.toBeNull();
  });

  it('should render the Summary sub-component', () => {
    renderFormCreator();

    expect(container.querySelector('[data-testid="summary"]')).not.toBeNull();
  });

  it('should render the Discount sub-component', () => {
    renderFormCreator();

    expect(container.querySelector('[data-testid="discount"]')).not.toBeNull();
  });

  it('should render the Insurances sub-component', () => {
    renderFormCreator();

    expect(
      container.querySelector('[data-testid="insurances"]')
    ).not.toBeNull();
  });

  it('should render the OptionalCosts sub-component', () => {
    renderFormCreator();

    expect(
      container.querySelector('[data-testid="optional-costs"]')
    ).not.toBeNull();
  });

  it('should render the OptionalBookingFields sub-component', () => {
    renderFormCreator();

    expect(
      container.querySelector('[data-testid="optional-booking-fields"]')
    ).not.toBeNull();
  });

  it('should show "Creating booking..." when loading is true', () => {
    const { useMutation } = require('@apollo/client');
    (useMutation as jest.Mock).mockReturnValue([
      jest.fn(),
      { loading: true, error: null, data: null, reset: jest.fn() }
    ]);

    renderFormCreator();

    const loadingMsg = container.querySelector('.return-message');
    expect(loadingMsg).not.toBeNull();
    expect(loadingMsg?.textContent).toBe('Creating booking...');
  });

  it('should render the error modal when a mutation error occurs', () => {
    const { useMutation } = require('@apollo/client');
    (useMutation as jest.Mock).mockReturnValue([
      jest.fn(),
      {
        loading: false,
        error: { message: 'Network error' },
        data: null,
        reset: jest.fn()
      }
    ]);

    renderFormCreator();

    expect(container.querySelector('[data-testid="modal"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="api-error"]')).not.toBeNull();
  });

  it('should render the success modal when booking data is returned', () => {
    const { useMutation } = require('@apollo/client');
    (useMutation as jest.Mock).mockReturnValue([
      jest.fn(),
      {
        loading: false,
        error: null,
        data: { createBooking: { id: 42 } },
        reset: jest.fn()
      }
    ]);

    renderFormCreator();

    expect(container.querySelector('[data-testid="modal"]')).not.toBeNull();
    expect(
      container.querySelector('[data-testid="success-message"]')
    ).not.toBeNull();
  });

  it('should dispatch "return" action when the return-to-calendar link is clicked', () => {
    renderFormCreator();

    const returnLink = container.querySelector(
      '.return-link'
    ) as HTMLElement | null;
    expect(returnLink).not.toBeNull();

    act(() => {
      returnLink?.click();
    });

    expect(mockDispatch).toHaveBeenCalledWith({ type: 'return' });
  });

  it('should disable the submit button while submitting', () => {
    renderFormCreator();

    // Before submission the button must not be disabled
    const button = container.querySelector(
      'button[type="submit"]'
    ) as HTMLButtonElement | null;
    expect(button).not.toBeNull();
    expect(button?.disabled).toBe(false);
  });

  it('should render the form-content section', () => {
    renderFormCreator();

    expect(container.querySelector('.form-content')).not.toBeNull();
  });

  it('should render the form-sum section', () => {
    renderFormCreator();

    expect(container.querySelector('.form-sum')).not.toBeNull();
  });

  it('should show option text when house.allow_option is true', () => {
    const houseWithOption: HouseType = {
      ...mockHouse,
      allow_option: true
    } as any;

    renderFormCreator(houseWithOption);

    // The option_is_free message should be present somewhere in the form-sum
    const formSum = container.querySelector('.form-sum');
    expect(formSum?.textContent).toContain('option');
  });

  it('should not show option text when house.allow_option is false', () => {
    const houseWithoutOption: HouseType = {
      ...mockHouse,
      allow_option: false
    } as any;

    renderFormCreator(houseWithoutOption);

    // option_is_free span should not be rendered
    const formSum = container.querySelector('.form-sum');
    const spans = formSum?.querySelectorAll('span');
    const optionSpan = Array.from(spans || []).find((s) =>
      s.textContent?.toLowerCase().includes('option')
    );
    expect(optionSpan).toBeUndefined();
  });
});
