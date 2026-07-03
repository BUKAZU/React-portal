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
  const houseData = house as {
    booking_price?: { optional_house_costs?: unknown[]; total_price?: number };
    [key: string]: unknown;
  };

  return {
    data: {
      PortalSite: {
        houses: [
          {
            ...houseData,
            booking_price: {
              ...(houseData.booking_price ?? {}),
              total_price: houseData.booking_price?.total_price ?? 1200,
              optional_house_costs:
                houseData.booking_price?.optional_house_costs ?? []
            }
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

const AVAILABILITY_URL =
  'https://api.bukazu.com/portal_api/v1/accommodations/availability**';
const PRICE_URL =
  'https://api.bukazu.com/portal_api/v1/accommodations/price**';
const PORTAL_CONFIG_URL = 'https://api.bukazu.com/portal_api/v1/config/**';
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
  await page.route(AVAILABILITY_URL, (route) => {
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(makeAvailabilityResponse())
    });
  });
}

function makeRestPriceResponse(house: object) {
  const houseData = house as {
    booking_price?: { optional_house_costs?: unknown[]; total_price?: number };
    [key: string]: unknown;
  };
  const totalPrice = houseData.booking_price?.total_price ?? 1200;
  return {
    arrival_date: '2025-01-01',
    departure_date: '2025-01-05',
    arrival_time: null,
    departure_time: null,
    currency: 'EUR',
    nights: 4,
    base_price: totalPrice,
    total_price: totalPrice,
    insurances: { cancel_insurance: 0, insurance_costs: 0 },
    on_site_house_costs: [],
    optional_house_costs: houseData.booking_price?.optional_house_costs ?? [],
    required_house_costs: [],
    rent_price: totalPrice,
    discount: 0,
    discounted_price: totalPrice,
    total_costs: {
      sub_total: totalPrice,
      total_price: totalPrice,
      insurances: {
        cancel_insurance: 0,
        insurance_costs: 0
      },
      required_costs: {
        not_on_site: [],
        on_site: []
      },
      optional_costs: {
        not_on_site: [],
        on_site: []
      }
    },
    person_percentages: null,
    night_percentages: null
  };
}

async function interceptPrice(
  page: import('@playwright/test').Page,
  house: object
) {
  await page.route(PRICE_URL, (route) => {
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(makeRestPriceResponse(house))
    });
  });
}

async function interceptPortalConfig(page: import('@playwright/test').Page) {
  await page.route(PORTAL_CONFIG_URL, (route) => {
    const pathname = new URL(route.request().url()).pathname;
    if (pathname.endsWith('/settings')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          name: 'E2E Portal',
          domain: 'example.com',
          portal_code: 'E2E',
          commission: '',
          use_custom_commission: false,
          colors: {
            button: '#111',
            button_cta: '#111',
            discount: '#111',
            cell: '#111',
            booked: '#111',
            arrival: '#111',
            departure: '#111'
          },
          booking_form: {
            show_months_amount: 2,
            show_months_in_a_row_amount: 2,
            children_allowed: false,
            babies_allowed: false,
            babies_till_age: 2,
            children_from_age: 3,
            children_till_age: 17,
            adults_from_age: 18,
            show_discount_code: false,
            language_selector_visible: false,
            redirect_urls: {
              nl: null,
              en: null,
              de: null,
              fr: null,
              es: null,
              it: null
            }
          },
          filters_form: {
            show: false,
            location: 'left',
            mode: 'grid',
            no_results: 0,
            fixed_mobile: false,
            show_price: true,
            show_persons: true,
            show_bedrooms: true,
            show_bathrooms: true,
            show_country: true,
            show_region: true,
            show_city: true
          },
          labels: {}
        })
      });
    }
    if (
      pathname.endsWith('/booking-fields') ||
      pathname.endsWith('/filter-fields')
    ) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    }
    return route.continue();
  });
}

const houseWithOptionalCostDescription = makeHouse(false, {
  booking_price: {
    total_price: 1200,
    required_house_costs: [],
    total_costs: {
      sub_total: 1200,
      total_price: 1200,
      insurances: { cancel_insurance: 0, insurance_costs: 0 },
      required_costs: { not_on_site: [], on_site: [] },
      optional_costs: { not_on_site: [], on_site: [] }
    },
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
  const arrivalCandidates = page.locator(
    'div[role="button"].arrival, div[role="button"].departure-arrival'
  );
  const departureCandidates = page.locator('div[role="button"].departure');
  await arrivalCandidates.first().waitFor({ state: 'visible' });

  // Select the first arrival date that yields departure options.
  const arrivalCount = await arrivalCandidates.count();
  let hasDeparture = false;
  for (let i = 0; i < arrivalCount; i += 1) {
    await arrivalCandidates.nth(i).click();
    try {
      await departureCandidates.first().waitFor({ state: 'visible', timeout: 1000 });
      hasDeparture = true;
      break;
    } catch {
      // Try the next arrival candidate.
    }
  }
  expect(hasDeparture).toBe(true);
  // Select a departure date (min_nights=3, so at least 3 nights after arrival).
  await departureCandidates.first().click();
  // Click the "Calculate" button to start the booking form.
  await page.locator('button.button').click();
  // Wait for the booking form to mount.
  await page.locator('.info-button').first().waitFor({ state: 'attached' });
}

test.describe('Booking form – modal', () => {
  test.beforeEach(async ({ page }) => {
    await interceptPortalConfig(page);
    await interceptAvailability(page);
    await interceptPrice(page, houseWithOptionalCostDescription);
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
