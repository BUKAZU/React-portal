import { useQuery } from '@apollo/client';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { ApiError } from '../Error';
import Loading from '../icons/loading.svg';
import { REVIEWS_QUERY } from './Queries';
import Score from './Score';
import SingleReview from './SingleReview';
import Note from './note';

interface Props {
  objectCode: string;
  portalCode: string;
}

function ReviewsPage({ objectCode, portalCode }: Props): JSX.Element {
  const { data, error, loading } = useQuery(REVIEWS_QUERY, {
    variables: { id: portalCode, house_id: objectCode }
  });

  if (loading)
    return (
      <div>
        <Loading />
      </div>
    );
  if (error) return <ApiError errors={error} />;

  const house = data.PortalSite.houses[0];
  const reviews = house.reviews;

  return (
    <div className="bu_reviews">
      <div className="bu_reviews__overview bu_card">
        <Score rating={house.rating} />
        <div className="bu_reviews__overview__number">
          {house.scoreAmount} <FormattedMessage id="reviews" />
        </div>
      </div>
      {reviews.map((review) => {
        return <SingleReview review={review} key={review.id} />;
      })}
      <Note />
    </div>
  );
}

export default ReviewsPage;
