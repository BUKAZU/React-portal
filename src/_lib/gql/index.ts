import { gql } from '@apollo/client';
import {
  HOUSE_SEARCH_RESULT_FIELDS,
  BOOKING_FORM_LABEL_FIELDS,
  BOOKING_FORM_CONFIGURATION_FIELDS
} from './fragments';

export * from './fragments';

export const PORTAL_BASE_QUERY = gql`
  query PortalSiteBaseQuery($id: ID!) {
    PortalSite(id: $id) {
      id
      portal_code
      options
      colorsConfiguration {
        arrival
        booked
        button
        buttonCta
        cell
        departure
        discount
      }
    }
  }
`;

export const PORTAL_SEARCH_QUERY = gql`
  query PortalSiteSearchQuery($id: ID!) {
    PortalSite(id: $id) {
      id
      portal_code
      options
      colorsConfiguration {
        arrival
        booked
        button
        buttonCta
        cell
        departure
        discount
      }
      countries {
        id
        name
      }
      regions {
        id
        name
        country_id
      }
      cities {
        id
        name
        region
        country_id
      }
      extra_search
      max_bathrooms
      max_bedrooms
      max_nights
      max_persons
      max_weekprice
      country_placeholder
      categories
      countries_label
      regions_label
      cities_label
      arrival_date_label
      departure_date_label
      max_weekprice_label
      persons_min_label
      persons_max_label
      bedrooms_min_label
      bathrooms_min_label
      weekprice_max_label
      no_nights_label
      extra_search_label
      properties_label
    }
  }
`;

/** @deprecated Use PORTAL_BASE_QUERY for Calendar/Reviews pages and PORTAL_SEARCH_QUERY for Search pages. */
export const PORTAL_QUERY = PORTAL_SEARCH_QUERY;

export const CALENDAR_QUERY = gql`
  query PortalSiteHousesQuery(
    $id: ID!
    $house_id: String!
    $starts_at: Date!
    $ends_at: Date!
  ) {
    PortalSite(id: $id) {
      id
      houses(house_code: $house_id) {
        id
        name
        last_minute_days
        availabilities(starts_at: $starts_at, ends_at: $ends_at) {
          arrival
          arrival_time_from
          arrival_time_to
          date
          departure
          departure_time
          max_nights
          min_nights
          special_offer
        }
      }
    }
    Discounts(
      house_code: $house_id
      discount_starts_at: $ends_at
      discount_ends_at: $starts_at
      active_today: true
    ) {
      name
      discount_starts_at
      discount_ends_at
    }
  }
`;

export const BOOKING_PRICE_QUERY = gql`
  ${BOOKING_FORM_LABEL_FIELDS}
  query BookingFormQuery(
    $portalCode: ID!
    $objectCode: String!
    $starts_at: Date!
    $ends_at: Date!
  ) {
    PortalSite(id: $portalCode) {
      id
      options
      ...BookingFormLabelFields
      booking_fields {
        id
        label
        field_type
        options
        placeholder
      }
      houses(house_code: $objectCode) {
        id
        name
        code
        allow_option
        persons
        image_url
        discounts
        discounts_info
        house_type
        rental_terms
        cancel_insurance
        damage_insurance
        damage_insurance_required
        travel_insurance
        babies_extra
        booking_price(starts_at: $starts_at, ends_at: $ends_at)
      }
    }
  }
`;

export const CREATE_BOOKING_MUTATION = gql`
  mutation CreateBooking(
    $first_name: String!
    $preposition: String
    $last_name: String!
    $company_name: String
    $is_option: Boolean!
    $address: String
    $house_number: String
    $zipcode: String
    $city: String
    $phone: String
    $phone_mobile: String
    $iban: String
    $bic: String
    $holder: String
    $email: String!
    $house_code: String!
    $portal_code: String
    $language: String
    $country: String!
    $adults: Int!
    $children: Int
    $babies: Int
    $discount: Int
    $damage_insurance: Int
    $cancel_insurance: Int
    $travel_insurance: Int
    $discount_reason: String
    $discount_code: String
    $comment: String
    $arrival_date: String!
    $departure_date: String!
    $costs: Json
    $extra_fields: String
    $sessionIdentifier: String
  ) {
    createBooking(
      first_name: $first_name
      preposition: $preposition
      company_name: $company_name
      last_name: $last_name
      is_option: $is_option
      address: $address
      house_number: $house_number
      zipcode: $zipcode
      city: $city
      phone: $phone
      phone_mobile: $phone_mobile
      iban: $iban
      bic: $bic
      holder: $holder
      email: $email
      house_code: $house_code
      portal_code: $portal_code
      language: $language
      country: $country
      adults: $adults
      children: $children
      babies: $babies
      discount: $discount
      discount_code: $discount_code
      damage_insurance: $damage_insurance
      cancel_insurance: $cancel_insurance
      travel_insurance: $travel_insurance
      discount_reason: $discount_reason
      arrival_date: $arrival_date
      departure_date: $departure_date
      comment: $comment
      costs: $costs
      extra_fields: $extra_fields
      sessionIdentifier: $sessionIdentifier
    ) {
      booking_nr
    }
  }
`;

export const SINGLE_HOUSE_QUERY = gql`
  ${BOOKING_FORM_CONFIGURATION_FIELDS}
  query PortalSiteSingleHouseQuery($portalCode: ID!, $objectCode: String!) {
    PortalSite(id: $portalCode) {
      id
      options
      bookingFormConfiguration {
        ...BookingFormConfigurationFields
      }
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
    $starts_at: Date!
    $ends_at: Date!
    $no_nights: Int
    $properties: String
    $weekprice_max: Int
    $limit: Int
    $skip: Int
  ) {
    PortalSite(id: $id) {
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

export const BOOKING_PRICE_TOTAL_QUERY = gql`
  query BookingPriceTotalQuery(
    $id: ID!
    $house_id: String!
    $starts_at: Date!
    $ends_at: Date!
    $persons: Int
    $costs: Json
    $cancel_insurance: Int
    $discount: Int
    $discount_code: String
  ) {
    PortalSite(id: $id) {
      houses(house_code: $house_id) {
        id
        name
        booking_price(
          starts_at: $starts_at
          ends_at: $ends_at
          persons: $persons
          costs: $costs
          cancel_insurance: $cancel_insurance
          discount: $discount
          discount_code: $discount_code
        )
      }
    }
  }
`;

export const PRICE_FIELD_BOOKING_PRICE_QUERY = gql`
  query BookingPriceQuery(
    $portalCode: ID!
    $objectCode: String!
    $starts_at: Date!
    $ends_at: Date!
    $persons: Int
  ) {
    PortalSite(id: $portalCode) {
      houses(house_code: $objectCode) {
        id
        name
        booking_price(
          starts_at: $starts_at
          ends_at: $ends_at
          persons: $persons
        )
      }
    }
  }
`;

export const REVIEWS_QUERY = gql`
  query ReviewPortalSiteQuery($id: ID!, $house_id: String!) {
    PortalSite(id: $id) {
      houses(house_code: $house_id) {
        id
        name
        rating
        scoreAmount
        reviews {
          id
          name
          review
          score
          createdAt
          reviewCriteria {
            id
            name
            score
          }
        }
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
