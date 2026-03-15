/**
 * @jest-environment jsdom
 */

import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import CostSummary from '../CostSummary';
import { AppContext } from '../../../AppContext';
import { BOOKING_PRICE_TOTAL_QUERY } from '../../../../_lib/gql';

const mockUseQuery = jest.fn();
const mockRentAndDiscount = jest.fn(() => <div data-testid="rent-and-discount" />);
const mockInsurancesAndRequired = jest.fn(
  () => <div data-testid="insurances-and-required" />
);
const mockOptionalNotOnSite = jest.fn(() => <div data-testid="optional-not-on-site" />);
const mockOnSite = jest.fn(() => <div data-testid="on-site" />);
const mockTotals = jest.fn(() => <div data-testid="totals" />);

jest.mock('@apollo/client', () => {
  const actual = jest.requireActual('@apollo/client');
  return {
    ...actual,
    useQuery: (...args: unknown[]) => mockUseQuery(...args)
  };
});

jest.mock('../RentAndDiscount', () => ({
  __esModule: true,
  default: (props: unknown) => {
    mockRentAndDiscount(props);
    return <div data-testid="rent-and-discount" />;
  }
}));

jest.mock('../InsurancesAndRequired', () => ({
  __esModule: true,
  default: (props: unknown) => {
    mockInsurancesAndRequired(props);
    return <div data-testid="insurances-and-required" />;
  }
}));

jest.mock('../OptionalNotOnSite', () => ({
  __esModule: true,
  default: (props: unknown) => {
    mockOptionalNotOnSite(props);
    return <div data-testid="optional-not-on-site" />;
  }
}));

jest.mock('../OnSite', () => ({
  __esModule: true,
  default: (props: unknown) => {
    mockOnSite(props);
    return <div data-testid="on-site" />;
  }
}));

jest.mock('../Totals', () => ({
  __esModule: true,
  default: (props: unknown) => {
    mockTotals(props);
    return <div data-testid="totals" />;
  }
}));

const baseValues = {
  arrivalDate: { date: '2025-06-01', arrival_time_from: '14:00', arrival_time_to: '18:00' },
  departureDate: { date: '2025-06-08', departure_time: '10:00' },
  costs: { cleaning: 1 },
  adults: 2,
  children: 1,
  babies: 2,
  discount: 10,
  discount_code: 'CODE10',
  cancel_insurance: '1',
  persons: 0,
  is_option: 'false',
  country: 1
} as any;

const house = {
  babies_extra: 1
} as any;

function renderComponent(values = baseValues) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  let root: ReturnType<typeof createRoot> | null = null;
  act(() => {
    root = createRoot(container);
  });

  act(() => {
    root?.render(
      <AppContext.Provider value={{ portalCode: 'portal', objectCode: 'object', locale: 'en' }}>
        <CostSummary values={values} house={house} />
      </AppContext.Provider>
    );
  });

  return { container, root };
}

describe('CostSummary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state', () => {
    mockUseQuery.mockReturnValue({ loading: true, error: undefined, data: undefined });

    const { container, root } = renderComponent();

    expect(container.textContent).toContain('Loading...');
    act(() => {
      root?.unmount();
    });
    container.remove();
  });

  it('renders error state when query fails', () => {
    const error = { message: 'Network error' };
    mockUseQuery.mockReturnValue({ loading: false, error, data: undefined });

    const { container, root } = renderComponent();

    expect(container.textContent).toContain(JSON.stringify(error));
    act(() => {
      root?.unmount();
    });
    container.remove();
  });

  it('renders price sections when data is available and passes query variables', () => {
    const prices = {
      rent_price: 100,
      discount: 5,
      discounted_price: 95,
      total_costs: {
        sub_total: 120,
        total_price: 130,
        insurances: { cancel_insurance: 5, insurance_costs: 3 },
        required_costs: { not_on_site: [], on_site: [] },
        optional_costs: { not_on_site: [], on_site: [] }
      },
      optional_house_costs: [],
      required_house_costs: []
    };
    mockUseQuery.mockReturnValue({
      loading: false,
      error: undefined,
      data: { PortalSite: { houses: [{ booking_price: prices }] } }
    });

    const { container, root } = renderComponent();

    expect(mockUseQuery).toHaveBeenCalledWith(BOOKING_PRICE_TOTAL_QUERY, {
      variables: {
        id: 'portal',
        persons: 4,
        house_id: 'object',
        starts_at: JSON.stringify(baseValues.arrivalDate.date),
        ends_at: JSON.stringify(baseValues.departureDate.date),
        costs: JSON.stringify(baseValues.costs),
        discount: baseValues.discount,
        discount_code: baseValues.discount_code,
        cancel_insurance: Number(baseValues.cancel_insurance)
      },
      fetchPolicy: 'network-only'
    });

    expect(mockRentAndDiscount).toHaveBeenCalledWith({ prices });
    expect(mockInsurancesAndRequired).toHaveBeenCalledWith({ prices });
    expect(mockOptionalNotOnSite).toHaveBeenCalledWith({ prices });
    expect(mockOnSite).toHaveBeenCalledWith({ prices });
    expect(mockTotals).toHaveBeenCalledWith({ prices });

    expect(container.querySelector('[data-testid="rent-and-discount"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="totals"]')).not.toBeNull();

    act(() => {
      root?.unmount();
    });
    container.remove();
  });

  it('caps babies calculation at zero when extra exceeds provided', () => {
    const fewerBabies = { ...baseValues, babies: 0 };
    mockUseQuery.mockReturnValue({ loading: true });

    const { container, root } = renderComponent(fewerBabies);

    expect(mockUseQuery).toHaveBeenCalledWith(
      BOOKING_PRICE_TOTAL_QUERY,
      expect.objectContaining({
        variables: expect.objectContaining({
          persons: baseValues.adults + baseValues.children // babies are clamped to 0
        })
      })
    );

    act(() => {
      root?.unmount();
    });
    container.remove();
  });
});
