import { gql } from '@apollo/client';
import { HOUSE_SEARCH_RESULT_FIELDS } from './fragments';

export * from './fragments';
export const SINGLE_HOUSE_QUERY = gql`
  query PortalSiteSingleHouseQuery($portalCode: ID!, $objectCode: String!) {
    PortalSite(id: $portalCode) {
      id
      houses(house_code: $objectCode) {
        id
        code
        name
        max_nights
        last_minute_days
        discounts
        discounts_info
        house_type
        persons
      }
    }
  }
`;

export const HOUSES_QUERY = gql`
  ${HOUSE_SEARCH_RESULT_FIELDS}
  query PortalSiteHousesQuery(
    $id: ID!
    $country_id: ID
    $region_id: String
    $city_id: String
    $persons_min: Int
    $persons_max: Int
    $bedrooms_min: Int
    $bathrooms_min: Int
    $arrival_date: String
    $no_nights: Int
    $properties: String
    $weekprice_max: Int
    $limit: Int
    $skip: Int
  ) {
    PortalSite(id: $id) {
      id
      houses(
        country_id: $country_id
        region_id: $region_id
        city_id: $city_id
        persons_min: $persons_min
        persons_max: $persons_max
        bedrooms_min: $bedrooms_min
        bathrooms_min: $bathrooms_min
        arrival_date: $arrival_date
        weekprice_max: $weekprice_max
        no_nights_min: $no_nights
        properties: $properties
        limit: $limit
        skip: $skip
      ) {
        ...HouseSearchResultFields
        scoreAmount
      }
    }
  }
`;

export const HOUSES_PRICE_QUERY = gql`
  ${HOUSE_SEARCH_RESULT_FIELDS}
  query PortalSiteHousePriceQuery(
    $id: ID!
    $country_id: ID
    $region_id: String
    $city_id: String
    $persons_min: Int
    $persons_max: Int
    $bedrooms_min: Int
    $bathrooms_min: Int
    $arrival_date: String
    $starts_at: Date!
    $ends_at: Date!
    $no_nights: Int
    $properties: String
    $weekprice_max: Int
    $limit: Int
    $skip: Int
  ) {
    PortalSite(id: $id) {
      id
      houses(
        country_id: $country_id
        region_id: $region_id
        city_id: $city_id
        persons_min: $persons_min
        persons_max: $persons_max
        bedrooms_min: $bedrooms_min
        bathrooms_min: $bathrooms_min
        arrival_date: $arrival_date
        weekprice_max: $weekprice_max
        no_nights_min: $no_nights
        properties: $properties
        limit: $limit
        skip: $skip
      ) {
        ...HouseSearchResultFields
        score_amount
        booking_price(starts_at: $starts_at, ends_at: $ends_at)
      }
    }
  }
`;

export const HOUSE_COUNT_QUERY = gql`
  query PortalSiteHouseCountQuery(
    $id: ID!
    $country_id: ID
    $region_id: String
    $city_id: String
    $persons_min: Int
    $persons_max: Int
    $bedrooms_min: Int
    $bathrooms_min: Int
    $arrival_date: String
    $no_nights: Int
    $properties: String
    $weekprice_max: Int
  ) {
    PortalSite(id: $id) {
      id
      houses(
        country_id: $country_id
        region_id: $region_id
        city_id: $city_id
        persons_min: $persons_min
        persons_max: $persons_max
        bedrooms_min: $bedrooms_min
        bathrooms_min: $bathrooms_min
        arrival_date: $arrival_date
        weekprice_max: $weekprice_max
        no_nights_min: $no_nights
        properties: $properties
      ) {
        id
      }
    }
  }
`;

export const CHECK_DISCOUNT_CODE = gql`
  mutation CheckDiscountCode($code: String!, $house_code: String!) {
    checkDiscountCode(code: $code, house_code: $house_code) {
      name
      use_price
      percentage
      price
    }
  }
`;
