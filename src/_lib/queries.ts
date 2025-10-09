import { gql } from '@apollo/client';

export const PORTAL_QUERY = gql`
  query PortalSiteQuery($id: ID!) {
    PortalSite(id: $id) {
      id
      portal_code
      options
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
      country_placeholder
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
  query BookingFormQuery(
    $portalCode: ID!
    $objectCode: String!
    $starts_at: Date!
    $ends_at: Date!
  ) {
    PortalSite(id: $portalCode) {
      id
      options
      first_name_label
      preposition_label
      last_name_label
      email_label
      zipcode_label
      city_label
      address_label
      house_number_label
      phone_label
      phone_mobile_label
      country_label
      iban_label
      holder_label
      bic_label
      comment_label
      company_name_label
      extra_fields_drivers_license_label
      extra_fields_destination_label
      form_submit_text
      form_submit_button_text
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