import { useQuery } from '@apollo/client';
import React, { useContext } from 'react';
import { t } from '../../intl';
import { AppContext } from '../AppContext';
import { ApiError } from '../Error';
import Loading from '../icons/loading.svg';
import { REVIEWS_QUERY } from '../../_lib/gql';
import { getScore } from './Score';
import { processReview } from './SingleReview';
import Note from './note';

function ReviewsPage(): JSX.Element {
  const { objectCode, portalCode } = useContext(AppContext);
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
    <div className="bu_reviews bup-16">
      <div className="bu_reviews__overview bup-16 bu_card">
        {(() => {
          const score = getScore(house.rating);
          return (
            <div className="bu_score">
              {house.rating && (
                <div className={`bu_score__rating bu_card ${score.color}`}>
                  {score.formatted}
                </div>
              )}
            </div>
          );
        })()}
        <div className="bu_reviews__overview__number">
          {house.scoreAmount} {t('reviews')}
        </div>
      </div>
      {reviews.map((review) => {
        const processed = processReview(review);
        return (
          <div className="bu_single_review bup-16 bu_card" key={processed.id}>
            <div className="bu_review_summary">
              <div className="bu_score">
                {review.score && (
                  <div className={`bu_score__rating bu_card ${processed.color}`}>
                    {processed.formatted}
                  </div>
                )}
              </div>
              <div className="bu_review_summary__date_name">
                <div>{processed.createdAt},&nbsp;</div>
                <div className="bu_review_summary__name">{processed.name}</div>
              </div>
            </div>
            <blockquote className="bu_review">{processed.review}</blockquote>
            <div className="bu_criteria">
              {processed.criteria.map((crit) => (
                <div className="bu_score" key={crit.id}>
                  {crit.score && (
                    <div className={`bu_score__rating bu_card ${crit.color}`}>
                      {crit.formatted}
                    </div>
                  )}
                  <div>{crit.name}</div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
      <Note />
    </div>
  );
}

export default ReviewsPage;
