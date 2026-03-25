import { REVIEWS_QUERY } from '../../_lib/gql';
import { requestGraphQL } from '../../_lib/graphql_request';
import type { Review } from './SingleReview';

interface ReviewsPortalSite {
  houses: ReviewsHouse[];
}

interface ReviewsQueryResponse {
  PortalSite: ReviewsPortalSite;
}

export interface ReviewsHouse {
  id: string;
  name: string;
  rating: number;
  scoreAmount: number;
  reviews: Review[];
}

interface ReviewsQueryVariables {
  id: string;
  house_id: string;
}

interface LoadReviewsHouseParams {
  portalCode: string;
  objectCode: string;
}

export async function loadReviewsHouse({
  portalCode,
  objectCode
}: LoadReviewsHouseParams): Promise<ReviewsHouse> {
  const data = await requestGraphQL<
    ReviewsQueryResponse,
    ReviewsQueryVariables
  >(REVIEWS_QUERY, {
    id: portalCode,
    house_id: objectCode
  });

  const house = data.PortalSite?.houses?.[0];
  if (!house) {
    throw new Error('No reviews house found for the given portal and object');
  }

  return house;
}
