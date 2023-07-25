import React from 'react';

interface Props {
  rating: number;
  name?: string;
}

function Score({ rating, name }: Props) {
  let color = 'low';
  if (rating > 7) {
    color = 'best';
  } else if (rating > 6) {
    color = 'good';
  } else if (rating > 4) {
    color = 'medium';
  }
  return (
    <div className="bu_score">
      <div className={`bu_score__rating bu_card ${color}`}>{rating.toFixed(1)}</div>
      <div>{name}</div>
    </div>
  );
}

export default Score;
