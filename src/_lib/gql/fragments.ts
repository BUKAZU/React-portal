import { gql } from '@apollo/client';

/**
 * Reusable fragment for common house search result fields.
 * Used in HOUSES_QUERY and HOUSES_PRICE_QUERY.
 */
export const HOUSE_SEARCH_RESULT_FIELDS = gql`
  fragment HouseSearchResultFields on PortalSiteHouse {
    id
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

