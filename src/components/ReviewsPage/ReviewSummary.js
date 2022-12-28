import React from 'react';

function ReviewSummary({ house }) {
  return (
    <div className="reviews__summary">
      <div className="reviews__summary_rating">
        {Number((house.rating).toFixed(1))}
      </div>
    </div>
  );
}

export default ReviewSummary;
