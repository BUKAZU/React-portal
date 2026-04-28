import { GraphQLClient } from 'graphql-request';
import { PORTAL_BASE_QUERY, PORTAL_SEARCH_QUERY } from '../_lib/gql';
import type { ColorsType, PortalOptions, PortalSiteType } from '../types';

interface PortalSiteQueryVariables {
  id: string;
}

export interface AppPortalSite extends PortalSiteType {
  portal_code: string;
  options: PortalOptions;
  colorsConfiguration: ColorsType;
}

interface PortalSiteQueryResponse {
  PortalSite: AppPortalSite | null;
}

interface LoadPortalSiteParams {
  portalCode: string;
  isSearchPage: boolean;
  client: GraphQLClient;
}

export async function loadPortalSite({
  portalCode,
  isSearchPage,
  client
}: LoadPortalSiteParams): Promise<AppPortalSite> {
  const query = isSearchPage ? PORTAL_SEARCH_QUERY : PORTAL_BASE_QUERY;

  const data = await client.request<
    PortalSiteQueryResponse,
    PortalSiteQueryVariables
  >(query, {
    id: portalCode
  });

  if (!data.PortalSite) {
    throw new Error('Portal site data is missing');
  }

  return data.PortalSite;
}
