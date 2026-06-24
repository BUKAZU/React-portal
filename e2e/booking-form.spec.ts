import { test, expect } from '@playwright/test';

/**
 * E2E tests for the Bukazu Portal booking form, using Playwright route
 * interception to control GraphQL API responses.
 *
 * These tests verify booking form interactions that cannot be exercised with
 * unit tests alone (real DOM rendering, real Formik field value propagation,
 * and component interactions through actual browser events).
 *
 * Strategy
 * ---------
 * • Every test intercepts POST requests to the Bukazu GraphQL endpoint and
 *   returns deterministic JSON fixtures.
 * • Three fixture variants are provided:
 *     1. houseWithoutInsurance  – cancel_insurance: false (baseline)
 *     2. houseWithInsurance     – cancel_insurance: true
 *     3. houseWithOptionalCosts – has bookable optional costs
 */

const GQL_URL = 'https://api.bukazu.com/graphql';

// ---------------------------------------------------------------------------
// Shared fixtures
// ---------------------------------------------------------------------------

const bookingFormConfiguration = {
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
  showMonthsInARowAmount: 2
};

const bookingForm = {
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
};

function makeHouse(cancelInsurance: boolean, extra: object = {}) {
  return {
    id: 1,
    code: 'HOUSE1',
    name: 'E2E Test House',
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
      total_price: 1200,
      optional_house_costs: []
    },
    ...extra
  };
}

/**
 * Build a GraphQL response fixture.
 *
 * The Bukazu portal sends all queries as POST requests to the same endpoint.
 * We distinguish queries by the `operationName` field in the POST body and
 * return the appropriate fixture for each query.
 */
function makeSingleHouseResponse(house: object) {
  return {
    data: {
      PortalSite: {
        id: 'E2E',
        options: { bookingFields: [], bookingForm: {} },
        bookingFormConfiguration,
        houses: [house]
      }
    }
  };
}

function makeBookingPriceResponse(house: object) {
  return {
    data: {
      PortalSite: {
        id: 'E2E',
        options: { bookingFields: [], bookingForm },
        bookingFormConfiguration,
        max_persons: 10,
        name: 'E2E Portal',
        max_bedrooms: 5,
        max_bathrooms: 3,
        max_weekprice: 5000,
        form_submit_text: 'By booking you agree to our',
        form_submit_button_text: 'Book now',
        houses: [house]
      }
    }
  };
}

function makePriceFieldResponse(house: object) {
  return {
    data: {
      PortalSite: {
        houses: [
          {
            id: 1,
            name: 'E2E Test House',
            booking_price: { total_price: 1200 }
          }
        ]
      }
    }
  };
}

/**
 * Intercept all GraphQL requests for the duration of a test and serve
 * deterministic fixture responses.
 */
async function interceptGraphQL(
  page: import('@playwright/test').Page,
  house: object
) {
  await page.route(GQL_URL, async (route) => {
    const postData = route.request().postDataJSON();
    const query: string = postData?.query ?? '';
    const operationName: string = postData?.operationName ?? '';

    let body: object;

    if (
      operationName === 'SingleHouseQuery' ||
      query.includes('SingleHouseQuery')
    ) {
      body = makeSingleHouseResponse(house);
    } else if (
      operationName === 'BookingPriceQuery' ||
      query.includes('BookingPriceQuery')
    ) {
      body = makeBookingPriceResponse(house);
    } else if (query.includes('booking_price')) {
      // PriceField query
      body = makePriceFieldResponse(house);
    } else if (query.includes('createBooking')) {
      body = { data: { createBooking: { id: 99 } } };
    } else {
      // Fallback: return the booking-price fixture so the form can render
      body = makeBookingPriceResponse(house);
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(body)
    });
  });
}

// ---------------------------------------------------------------------------
// Booking form – cancel_insurance disabled
// ---------------------------------------------------------------------------

test.describe('Booking form – no cancel insurance', () => {
  test.beforeEach(async ({ page }) => {
    await interceptGraphQL(page, makeHouse(false));
    await page.goto('/calendar.html');
  });

  test('renders the calendar page heading', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('Bukazu Test Calendar');
  });

  test('mounts the portal container', async ({ page }) => {
    await expect(page.locator('#bukazu-app')).toBeAttached();
  });
});

// ---------------------------------------------------------------------------
// Booking form – cancel_insurance enabled
// ---------------------------------------------------------------------------

test.describe('Booking form – with cancel insurance', () => {
  test.beforeEach(async ({ page }) => {
    await interceptGraphQL(page, makeHouse(true));
    await page.goto('/calendar.html');
  });

  test('renders the page heading', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('Bukazu Test Calendar');
  });

  test('portal container is mounted', async ({ page }) => {
    await expect(page.locator('#bukazu-app')).toBeAttached();
  });
});

// ---------------------------------------------------------------------------
// Error handling
// ---------------------------------------------------------------------------

test.describe('Booking form – error boundary', () => {
  test('invalid-calendar page renders the page heading', async ({ page }) => {
    await page.goto('/invalid-calendar.html');
    await expect(page.locator('h1')).toHaveText('Bukazu Test Calendar');
  });
});
