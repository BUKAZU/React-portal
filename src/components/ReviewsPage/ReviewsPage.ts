import { GraphQLClient } from 'graphql-request';
import { REVIEWS_QUERY } from '../../_lib/gql';
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
  locale: string;
  apiUrl?: string;
}

const DEFAULT_API_URL = 'https://api.bukazu.com/graphql';

export async function loadReviewsHouse({
  portalCode,
  objectCode,
  locale,
  apiUrl = DEFAULT_API_URL
}: LoadReviewsHouseParams): Promise<ReviewsHouse> {
  const client = new GraphQLClient(apiUrl, {
    headers: {
      locale
    }
  });

  const data = await client.request<ReviewsQueryResponse, ReviewsQueryVariables>(
    REVIEWS_QUERY,
    {
      id: portalCode,
      house_id: objectCode
    }
  );

  const house = data.PortalSite?.houses?.[0];
  if (!house) {
    throw new Error('No reviews house found for the given portal and object');
  }

  return house;
}