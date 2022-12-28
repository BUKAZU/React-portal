import { gql } from '@apollo/client';

export const HOUSE_REVIEWS_QUERY = gql`
  query PortalSiteHouseReviewQuery($id: ID!, $house_id: String!) {
    PortalSite(id: $id) {
      id
      houses(house_code: $house_id) {
        id
        name
        rating
        score
        scoreAmount
        reviews {
            id
            createdAt
            name
            review
            score            
        }
      }
    }
  }
`;
