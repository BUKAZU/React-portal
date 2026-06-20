import {
  fetchBookingFields,
  fetchFilterFields,
  fetchSearchFacets,
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
  const settings = await fetchSettings({ apiUrl, locale, portalCode });

  if (!settings) {
    throw new Error('Portal site data is missing');
  }

  const [facets, filterFields] = isSearchPage
    ? await Promise.all([
        fetchSearchFacets({ apiUrl, locale, portalCode }),
        fetchFilterFields({ apiUrl, locale, portalCode })
      ])
    : [undefined, undefined];

  const bookingFields = isBookingPage
    ? await fetchBookingFields({ apiUrl, locale, portalCode })
    : undefined;

  return buildAppPortalSite({
    settings,
    facets,
    filterFields,
    bookingFields,
    locale
  });
}
