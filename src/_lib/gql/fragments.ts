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

/**
 * Reusable fragment for booking form label fields on PortalSite.
 * Used in BOOKING_PRICE_QUERY.
 */
export const BOOKING_FORM_LABEL_FIELDS = gql`
  fragment BookingFormLabelFields on PortalSite {
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
  }
`;

/**
 * Reusable fragment for booking form configuration fields.
 * Used in SINGLE_HOUSE_QUERY and BOOKING_PRICE_QUERY.
 */
export const BOOKING_FORM_CONFIGURATION_FIELDS = gql`
  fragment BookingFormConfigurationFields on PortalSitesBookingFormConfiguration {
    adultsFromAge
    babiesAllowed
    babiesTillAge
    childrenAllowed
    childrenFromAge
    childrenTillAge
    languageSelectorVisible
    redirectUrl
    redirectUrl_nl
    redirectUrl_en
    redirectUrl_de
    redirectUrl_fr
    redirectUrl_es
    redirectUrl_it
    showDiscountCode
    showMonthsAmount
    showMonthsInARowAmount
  }
`;
