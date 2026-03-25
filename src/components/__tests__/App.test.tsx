import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import App from '../App';
import { AppContext } from '../AppContext';

// Mock the Loading SVG so Jest can import it without a transformer
jest.mock('../icons/loading.svg', () => () => <svg data-testid="loading" />);

// Mock @apollo/client so no real GraphQL calls are made
jest.mock('@apollo/client', () => ({
  useQuery: jest.fn()
}));

// Mock the GQL module
jest.mock('../../_lib/gql', () => ({
  PORTAL_BASE_QUERY: 'PORTAL_BASE_QUERY',
  PORTAL_SEARCH_QUERY: 'PORTAL_SEARCH_QUERY'
}));

// Mock heavy child components
jest.mock('../SearchPage/SearchPage', () => () => (
  <div data-testid="search-page" />
));
jest.mock('../CalendarPage/CalendarPage', () => () => (
  <div data-testid="calendar-page" />
));
jest.mock('../ReviewsPage/ReviewsPage', () => () => (
  <div data-testid="reviews-page" />
));
jest.mock('../SafeBooking', () => () => '<div class="safe-booking"></div>');
jest.mock('../Error', () => ({
  ApiError: ({ errors }: { errors?: { message: string } }) => (
    <div data-testid="api-error">{errors?.message}</div>
  )
}));
jest.mock(
  '../ErrorBoundary',
  () =>
    ({ children }: { children: React.ReactNode }) => (
      <div data-testid="error-boundary">{children}</div>
    )
);

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

const { useQuery } = require('@apollo/client');

const fullColors = {
  discount: '#111111',
  cell: '#222222',
  arrival: '#333333',
  booked: '#444444',
  departure: '#555555',
  button: '#666666',
  buttonCta: '#777777'
};

function makeData(colorsConfiguration = fullColors): {
  loading: boolean;
  error: undefined;
  data: any;
} {
  return {
    loading: false,
    error: undefined,
    data: {
      PortalSite: {
        options: {},
        colorsConfiguration
      }
    }
  };
}

let container: HTMLDivElement;
let root: ReturnType<typeof createRoot>;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  act(() => {
    root = createRoot(container);
  });
  jest.clearAllMocks();
  // Reset any CSS custom properties on the root element
  const rootElement = document.documentElement;
  [
    '--bukazu-discount',
    '--bukazu-cell',
    '--bukazu-arrival',
    '--bukazu-booked',
    '--bukazu-departure',
    '--bukazu-button',
    '--bukazu-button_cta'
  ].forEach((prop) => rootElement.style.removeProperty(prop));
});

afterEach(() => {
  act(() => {
    root.unmount();
  });
  container.remove();
});

function renderApp(
  objectCode = '',
  pageType?: string,
  colorsConfiguration = fullColors
) {
  useQuery.mockReturnValue(makeData(colorsConfiguration));
  act(() => {
    root.render(
      <AppContext.Provider
        value={{ locale: 'en', portalCode: 'TEST', objectCode }}
      >
        <App locale="en" pageType={pageType} />
      </AppContext.Provider>
    );
  });
}

// ---------------------------------------------------------------------------
// Theming: CSS custom properties
// ---------------------------------------------------------------------------

describe('App theming — CSS custom properties', () => {
  it('sets all CSS variables from a full colorsConfiguration', () => {
    renderApp();

    const style = document.documentElement.style;
    expect(style.getPropertyValue('--bukazu-discount')).toBe(
      fullColors.discount
    );
    expect(style.getPropertyValue('--bukazu-cell')).toBe(fullColors.cell);
    expect(style.getPropertyValue('--bukazu-arrival')).toBe(fullColors.arrival);
    expect(style.getPropertyValue('--bukazu-booked')).toBe(fullColors.booked);
    expect(style.getPropertyValue('--bukazu-departure')).toBe(
      fullColors.departure
    );
    expect(style.getPropertyValue('--bukazu-button')).toBe(fullColors.button);
    expect(style.getPropertyValue('--bukazu-button_cta')).toBe(
      fullColors.buttonCta
    );
  });

  it('sets CSS variables to empty string when colorsConfiguration values are empty strings', () => {
    const partialColors = {
      discount: '',
      cell: '',
      arrival: '',
      booked: '',
      departure: '',
      button: '',
      buttonCta: ''
    };

    renderApp('', undefined, partialColors);

    const style = document.documentElement.style;
    // setProperty('--var', '') removes the property in jsdom
    expect(style.getPropertyValue('--bukazu-discount')).toBe('');
    expect(style.getPropertyValue('--bukazu-cell')).toBe('');
    expect(style.getPropertyValue('--bukazu-arrival')).toBe('');
    expect(style.getPropertyValue('--bukazu-booked')).toBe('');
    expect(style.getPropertyValue('--bukazu-departure')).toBe('');
    expect(style.getPropertyValue('--bukazu-button')).toBe('');
    expect(style.getPropertyValue('--bukazu-button_cta')).toBe('');
  });

  it('sets only the provided CSS variables when some colors are missing', () => {
    const sparseColors = {
      discount: '#aabbcc',
      cell: '',
      arrival: '',
      booked: '',
      departure: '',
      button: '',
      buttonCta: ''
    };

    renderApp('', undefined, sparseColors);

    const style = document.documentElement.style;
    expect(style.getPropertyValue('--bukazu-discount')).toBe('#aabbcc');
  });
});

// ---------------------------------------------------------------------------
// Loading / error states
// ---------------------------------------------------------------------------

describe('App loading and error states', () => {
  it('renders the loading icon while the query is in flight', () => {
    useQuery.mockReturnValue({ loading: true, error: undefined, data: null });

    act(() => {
      root.render(
        <AppContext.Provider
          value={{ locale: 'en', portalCode: 'TEST', objectCode: '' }}
        >
          <App locale="en" />
        </AppContext.Provider>
      );
    });

    expect(container.querySelector('[data-testid="loading"]')).not.toBeNull();
  });

  it('renders ApiError when the query fails', () => {
    useQuery.mockReturnValue({
      loading: false,
      error: { message: 'Network error' },
      data: null
    });

    act(() => {
      root.render(
        <AppContext.Provider
          value={{ locale: 'en', portalCode: 'TEST', objectCode: '' }}
        >
          <App locale="en" />
        </AppContext.Provider>
      );
    });

    expect(container.querySelector('[data-testid="api-error"]')).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Page routing
// ---------------------------------------------------------------------------

describe('App page routing', () => {
  it('renders CalendarPage and SafeBooking when objectCode is set and pageType is not reviews', () => {
    renderApp('OBJ001');

    expect(
      container.querySelector('[data-testid="calendar-page"]')
    ).not.toBeNull();
    expect(
      container.querySelector('.safe-booking')
    ).not.toBeNull();
  });

  it('renders ReviewsPage when objectCode is set and pageType is reviews', () => {
    renderApp('OBJ001', 'reviews');

    expect(
      container.querySelector('[data-testid="reviews-page"]')
    ).not.toBeNull();
    expect(container.querySelector('[data-testid="calendar-page"]')).toBeNull();
  });

  it('renders SearchPage when objectCode is not set', () => {
    renderApp('');

    expect(
      container.querySelector('[data-testid="search-page"]')
    ).not.toBeNull();
    expect(container.querySelector('[data-testid="calendar-page"]')).toBeNull();
  });
});
