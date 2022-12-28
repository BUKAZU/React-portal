import { useQuery } from '@apollo/client';
import React from 'react';
import { HOUSE_REVIEWS_QUERY } from '../../_lib/reviews_queries';
import ReviewSummary from './ReviewSummary';

function ReviewsPage({ PortalSite, objectCode, locale }) {
  const { loading, error, data } = useQuery(HOUSE_REVIEWS_QUERY, {
    variables: { id: PortalSite.portal_code, house_id: objectCode },
  });

  if (loading) {
    return  'Loading';
  }

  if (error) {
    return  'Error';
  }

  if (!data) {
    return "No houses found"
  }

  const house = data?.PortalSite.houses[0];

  return (
    <div className="bukazu_reviews">
      <ReviewSummary house={house} />
    </div>
  );
}

export default ReviewsPage;
