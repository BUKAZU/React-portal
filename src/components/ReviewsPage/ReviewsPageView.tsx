import React, { useEffect, useState } from 'react';
import { ApolloError } from '@apollo/client';
import { GraphQLError } from 'graphql';
import { t } from '../../intl';
import { ApiError } from '../Error';
import Loading from '../icons/loading.svg';
import { getScore } from './Score';
import { loadReviewsHouse, type ReviewsHouse } from './ReviewsPage';
import { processReview } from './SingleReview';
import Note from './note';

interface Props {
  objectCode: string;
  portalCode: string;
  locale: string;
}

type ReviewsPageState =
  | { status: 'loading' }
  | { status: 'error'; error: ApolloError }
  | { status: 'ready'; house: ReviewsHouse };

function toApolloError(error: unknown): ApolloError {
  if (error instanceof ApolloError) {
    return error;
  }

  const message =
    error instanceof Error ? error.message : 'Failed to load reviews data';

  return new ApolloError({
    graphQLErrors: [new GraphQLError(message)]
  });
}

function ReviewsPageView({ objectCode, portalCode, locale }: Props): JSX.Element {
  const [state, setState] = useState<ReviewsPageState>({ status: 'loading' });

  useEffect(() => {
    let isMounted = true;
    setState({ status: 'loading' });

    void loadReviewsHouse({ portalCode, objectCode, locale })
      .then((house) => {
        if (!isMounted) {
          return;
        }
        setState({ status: 'ready', house });
      })
      .catch((error: unknown) => {
        if (!isMounted) {
          return;
        }

        setState({ status: 'error', error: toApolloError(error) });
      });

    return () => {
      isMounted = false;
    };
  }, [portalCode, objectCode, locale]);

  if (state.status === 'loading') {
    return (
      <div>
        <Loading />
      </div>
    );
  }

  if (state.status === 'error') {
    return <ApiError errors={state.error} />;
  }

  const { house } = state;
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

export default ReviewsPageView;
