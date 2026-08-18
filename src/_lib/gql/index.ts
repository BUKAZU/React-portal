import { gql } from '@apollo/client';

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
