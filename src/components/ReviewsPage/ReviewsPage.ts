import { HTTPError } from 'ky';
import { http, parseResponse } from '../../_lib/http_client';
import type { Review } from './SingleReview';

type RestReviewCriterium = { score: number; name: string };
type RestReviewResponse = { created_at: string; sender: string; message: string };
type RestReview = {
  created_at: string;
  review_at: string;
  name: string;
  source_name: string;
  review: string;
  score: number;
  review_criteria: RestReviewCriterium[];
  review_responses: RestReviewResponse[];
};

export type RestPageInfo = {
  start_cursor: string | null;
  end_cursor: string | null;
  has_next_page: boolean;
  has_previous_page: boolean;
};

type RestReviewsResponse = {
  house: { name: string; rating: number; score_amount: number };
  items: RestReview[];
  page_info: RestPageInfo;
};

export interface ReviewsHouse {
  id: string;
  name: string;
  rating: number;
  scoreAmount: number;
  reviews: Review[];
}

export interface LoadReviewsResult {
  house: ReviewsHouse;
  pageInfo: RestPageInfo;
}

interface LoadReviewsHouseParams {
  portalCode: string;
  objectCode: string;
  apiUrl?: string;
  after?: string;
}

export async function loadReviewsHouse({
  portalCode,
  objectCode,
  apiUrl = '',
  after
}: LoadReviewsHouseParams): Promise<LoadReviewsResult> {
  const params = new URLSearchParams({ portal_code: portalCode, object_code: objectCode });
  if (after) params.set('after', after);
  const origin = apiUrl ? new URL(apiUrl).origin : '';
  const url = `${origin}/portal_api/v1/accommodations/reviews?${params.toString()}`;

  try {
    const data = await parseResponse<RestReviewsResponse>(await http.get(url));
    return {
      house: {
        id: '',
        name: data.house.name,
        rating: Number(data.house.rating),
        scoreAmount: Number(data.house.score_amount),
        reviews: data.items.map((r) => ({
          id: '',
          name: r.name,
          review: r.review,
          score: Number(r.score),
          createdAt: r.created_at,
          sourceName: r.source_name ?? '',
          reviewResponses: r.review_responses ?? [],
          reviewCriteria: (r.review_criteria ?? []).map((c) => ({
            id: 0,
            name: c.name,
            score: Number(c.score)
          }))
        }))
      },
      pageInfo: data.page_info
    };
  } catch (error) {
    if (error instanceof HTTPError) {
      throw new Error(`Reviews request failed (${error.response.status})`);
    }
    throw error;
  }
}
