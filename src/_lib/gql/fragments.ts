import { gql } from '@apollo/client';

/**
 * Reusable fragment for common house search result fields.
 * `code` is included so per-result price can be fetched from the REST
 * portal_api price endpoint.
 */
export const HOUSE_SEARCH_RESULT_FIELDS = gql`
  fragment HouseSearchResultFields on PortalSiteHouse {
    id
    code
    name
    persons
    bathrooms
    bedrooms
    description
    image_url
    house_url
    province
    city
    country_name
    minimum_week_price
    rating
  }
`;

