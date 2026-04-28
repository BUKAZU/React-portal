import { t } from '../../intl';
import { getScore } from './Score';
import type { ReviewsHouse } from './ReviewsPage';
import { processReview } from './SingleReview';
import createNote from './note';

function createDiv(className?: string, text?: string): HTMLDivElement {
  const element = document.createElement('div');
  if (className) {
    element.className = className;
  }
  if (text) {
    element.textContent = text;
  }
  return element;
}

export function createReviewsPageView(house: ReviewsHouse): HTMLDivElement {
  const root = createDiv('bu_reviews bup-16');

  const overview = createDiv('bu_reviews__overview bup-16 bu_card');
  const scoreContainer = createDiv('bu_score');

  if (house.rating) {
    const score = getScore(house.rating);
    const rating = createDiv(`bu_score__rating bu_card ${score.color}`);
    rating.textContent = score.formatted;
    scoreContainer.appendChild(rating);
  }

  const number = createDiv(
    'bu_reviews__overview__number',
    `${house.scoreAmount} ${t('reviews')}`
  );

  overview.appendChild(scoreContainer);
  overview.appendChild(number);
  root.appendChild(overview);

  house.reviews.forEach((review) => {
    const processed = processReview(review);
    const reviewCard = createDiv('bu_single_review bup-16 bu_card');

    const summary = createDiv('bu_review_summary');
    const reviewScore = createDiv('bu_score');

    if (review.score) {
      const scoreBadge = createDiv(
        `bu_score__rating bu_card ${processed.color}`,
        processed.formatted
      );
      reviewScore.appendChild(scoreBadge);
    }

    const dateName = createDiv('bu_review_summary__date_name');
    const date = createDiv(undefined, `${processed.createdAt}, `);
    const name = createDiv('bu_review_summary__name', processed.name);
    dateName.appendChild(date);
    dateName.appendChild(name);

    summary.appendChild(reviewScore);
    summary.appendChild(dateName);

    const quote = document.createElement('blockquote');
    quote.className = 'bu_review';
    quote.textContent = processed.review;

    const criteria = createDiv('bu_criteria');
    processed.criteria.forEach((criterion) => {
      const criterionScore = createDiv('bu_score');

      if (criterion.score) {
        const criterionBadge = createDiv(
          `bu_score__rating bu_card ${criterion.color}`,
          criterion.formatted
        );
        criterionScore.appendChild(criterionBadge);
      }

      criterionScore.appendChild(createDiv(undefined, criterion.name));
      criteria.appendChild(criterionScore);
    });

    reviewCard.appendChild(summary);
    reviewCard.appendChild(quote);
    reviewCard.appendChild(criteria);
    root.appendChild(reviewCard);
  });

  root.appendChild(createNote());
  return root;
}
