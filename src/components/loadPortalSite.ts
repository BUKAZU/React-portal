import {
  fetchBookingFields,
  fetchFilterFields,
  fetchSettings
} from '../_lib/portal_settings';
import { buildAppPortalSite, type AppPortalSite } from './portalSiteAdapter';

export type { AppPortalSite } from './portalSiteAdapter';

interface LoadPortalSiteParams {
  portalCode: string;
  /** Search page needs the house-derived facets and the filter-field list. */
  isSearchPage: boolean;
  /** Booking/calendar page needs the configured booking fields. */
  isBookingPage: boolean;
  /** The GraphQL api_url; only its origin is used to reach the REST API. */
  apiUrl: string;
  locale: string;
}

/**
 * Load the portal-site configuration from the REST config endpoints and assemble
 * it into the shape the app consumes. Replaces the legacy PORTAL_BASE_QUERY /
 * PORTAL_SEARCH_QUERY GraphQL queries.
 */
export async function loadPortalSite({
  portalCode,
  isSearchPage,
  isBookingPage,
  apiUrl,
  locale
}: LoadPortalSiteParams): Promise<AppPortalSite> {
  const settingsPromise = fetchSettings({ apiUrl, locale, portalCode });
  const filterFieldsPromise = isSearchPage
    ? fetchFilterFields({ apiUrl, locale, portalCode })
    : Promise.resolve(undefined);
  const bookingFieldsPromise = isBookingPage
    ? fetchBookingFields({ apiUrl, locale, portalCode })
    : Promise.resolve(undefined);

  const [settings, filterFields, bookingFields] = await Promise.all([
    settingsPromise,
    filterFieldsPromise,
    bookingFieldsPromise
  ]);

  if (!settings) {
    throw new Error('Portal site data is missing');
  }

  return buildAppPortalSite({
    settings,
    filterFields,
    bookingFields,
    locale
  });
}
