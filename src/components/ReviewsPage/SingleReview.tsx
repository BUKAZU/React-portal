import React, { memo } from 'react';
import Score from './Score';

interface Props {
  review: {
    score: number;
    name: string;
    createdAt: string;
    review: string;
    reviewCriteria: {
      score: number;
      name: string;
      id: number;
    }[];
  };
}

function SingleReview({ review }: Props): JSX.Element {
  return (
    <div className="bu_single_review bu_card">
      <div className="bu_review_summary">
        <Score rating={review.score} />
        <div className="bu_review_summary__date_name">
          <div>{review.createdAt},&nbsp;</div>
          <div className="bu_review_summary__name">{review.name}</div>
        </div>
      </div>
      <blockquote className="bu_review">{review.review}</blockquote>
      <div className="bu_criteria">
        {review.reviewCriteria.map((crit) => (
          <Score rating={crit.score} name={crit.name} key={crit.id} />
        ))}
      </div>
    </div>
  );
}

export default memo(SingleReview);
