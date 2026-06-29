import { FormatIntl, Parse_EN_US } from '../../_lib/date_helper';
import { t } from '../../intl';
import { getScore } from './Score';
import type { ReviewsHouse } from './ReviewsPage';
import { processReview } from './SingleReview';

const REVIEW_DATE_FORMAT: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
};

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

function formatReviewDate(date: string): string {
  return FormatIntl(Parse_EN_US(date), REVIEW_DATE_FORMAT);
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
    const formattedDate = new Date(processed.createdAt).toLocaleDateString(
      undefined,
      {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }
    );
    const date = createDiv(undefined, `${formattedDate}, `);
    const name = createDiv('bu_review_summary__name', processed.name);
    dateName.appendChild(date);
    dateName.appendChild(name);

    summary.appendChild(reviewScore);
    summary.appendChild(dateName);

    if (processed.sourceName) {
      const source = createDiv(
        'bu_review_summary__source',
        processed.sourceName
      );
      summary.appendChild(source);
    }

    reviewCard.appendChild(summary);

    if (processed.review) {
      const quote = document.createElement('blockquote');
      quote.className = 'bu_review';
      quote.textContent = processed.review;
      reviewCard.appendChild(quote);
    }

    if (processed.criteria.length > 0) {
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
      reviewCard.appendChild(criteria);
    }

    if (processed.reviewResponses?.length > 0) {
      const responses = createDiv('bu_review_responses');
      processed.reviewResponses.forEach((resp) => {
        const responseDiv = createDiv('bu_review_response');
        const label = createDiv(
          'bu_review_response__label',
          t('review_response_label')
        );
        const header = createDiv('bu_review_response__header');
        const formattedRespDate = formatReviewDate(resp.created_at);
        header.appendChild(
          createDiv('bu_review_response__sender', resp.sender)
        );
        header.appendChild(
          createDiv('bu_review_response__date', formattedRespDate)
        );
        const message = document.createElement('p');
        message.className = 'bu_review_response__message';
        message.textContent = resp.message;
        responseDiv.appendChild(label);
        responseDiv.appendChild(header);
        responseDiv.appendChild(message);
        responses.appendChild(responseDiv);
      });
      reviewCard.appendChild(responses);
    }

    root.appendChild(reviewCard);
  });

  return root;
}
