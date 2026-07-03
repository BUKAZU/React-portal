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

// ---------------------------------------------------------------------------
// Modal – open / close interactions
// ---------------------------------------------------------------------------

const AVAILABILITY_URL = 'https://api.bukazu.com/portal_api/**';
const AVAILABILITY_MONTHS_BEFORE = 1;
const AVAILABILITY_START_DAY = 20;
const AVAILABILITY_MONTHS_AFTER = 3;
const AVAILABILITY_END_DAY = 30;

function makeAvailabilityResponse() {
  const availabilities = [];
  // Cover a wide range around the current date so every calendar cell has an
  // entry (incl. partial weeks shown at the edges of each month).
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - AVAILABILITY_MONTHS_BEFORE, AVAILABILITY_START_DAY));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + AVAILABILITY_MONTHS_AFTER, AVAILABILITY_END_DAY));
  for (const d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    availabilities.push({
      date: d.toISOString().split('T')[0],
      arrival: true,
      arrival_time_from: null,
      arrival_time_to: null,
      departure: true,
      departure_time: null,
      min_nights: 3,
      max_nights: 14,
      special_offer: 0
    });
  }
  return {
    name: 'E2E Test House',
    last_minute_days: 0,
    availabilities,
    discounts: []
  };
}

async function interceptAvailability(page: import('@playwright/test').Page) {
  await page.route(AVAILABILITY_URL, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(makeAvailabilityResponse())
    })
  );
}

const houseWithOptionalCostDescription = makeHouse(false, {
  booking_price: {
    total_price: 1200,
    optional_house_costs: [
      {
        id: '1',
        name: 'Cleaning fee',
        method: 'per_booking',
        max_available: 1,
        amount: 50,
        method_name: 'Per booking',
        description: 'Mandatory cleaning service included in your booking.'
      }
    ]
  }
});

async function navigateToBookingForm(page: import('@playwright/test').Page) {
  await page.goto('/calendar.html');
  // Select an arrival date (first available cell in the current month).
  await page.locator('.arrival').first().click();
  // Select a departure date (min_nights=3, so at least 3 nights after arrival).
  await page.locator('.departure').first().click();
  // Click the "Calculate" button to start the booking form.
  await page.locator('button.button').click();
  // Wait for the booking form to mount.
  await page.locator('.info-button').first().waitFor({ state: 'attached' });
}

test.describe('Booking form – modal', () => {
  test.beforeEach(async ({ page }) => {
    await interceptAvailability(page);
    await interceptGraphQL(page, houseWithOptionalCostDescription);
  });

  test('dialog is closed on load', async ({ page }) => {
    await page.goto('/calendar.html');
    await expect(page.locator('dialog[open]')).not.toBeAttached();
  });

  test('opens the dialog when the info button is clicked', async ({ page }) => {
    await navigateToBookingForm(page);
    await page.locator('.info-button').first().click();
    await expect(page.locator('dialog.bukazu-modal[open]')).toBeVisible();
  });

  test('shows the optional cost description inside the modal', async ({ page }) => {
    await navigateToBookingForm(page);
    await page.locator('.info-button').first().click();
    await expect(page.locator('dialog.bukazu-modal[open]')).toContainText(
      'Mandatory cleaning service included in your booking.'
    );
  });

  test('closes the dialog when the close button is clicked', async ({ page }) => {
    await navigateToBookingForm(page);
    await page.locator('.info-button').first().click();
    await page.locator('dialog.bukazu-modal[open] .bukazu-modal-footer button').click();
    await expect(page.locator('dialog.bukazu-modal[open]')).not.toBeAttached();
  });

  test('closes the dialog when the Escape key is pressed', async ({ page }) => {
    await navigateToBookingForm(page);
    await page.locator('.info-button').first().click();
    await page.keyboard.press('Escape');
    await expect(page.locator('dialog.bukazu-modal[open]')).not.toBeAttached();
  });

  test('can be reopened after closing', async ({ page }) => {
    await navigateToBookingForm(page);
    await page.locator('.info-button').first().click();
    await page.locator('dialog.bukazu-modal[open] .bukazu-modal-footer button').click();
    await page.locator('.info-button').first().click();
    await expect(page.locator('dialog.bukazu-modal[open]')).toBeVisible();
  });
});
