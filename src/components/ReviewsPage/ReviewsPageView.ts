import { formatReviewDate } from '../../_lib/date_helper';
import { t } from '../../intl';
import { getScore } from './Score';
import { getScoreColor, getScoreLabelKey } from './getScoreColor';
import type { ReviewsHouse } from './ReviewsPage';
import { houseCriteriaAverages } from './review_stats';
import { processReview } from './SingleReview';

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

function createSpan(className: string, text: string): HTMLSpanElement {
  const element = document.createElement('span');
  element.className = className;
  element.textContent = text;
  return element;
}

/** The coloured score square; `large` is the 64px house score. */
function scoreBadge(
  formatted: string,
  color: string,
  large = false
): HTMLDivElement {
  return createDiv(
    `bu_score__rating ${color}${large ? ' bu-score-lg' : ''}`,
    formatted
  );
}

/** House score, band label, count and the criteria averages as bars. */
function createHeader(house: ReviewsHouse): HTMLDivElement {
  const header = createDiv('bu_reviews__overview bu-reviews-header');

  const scoreBlock = createDiv('bu_score bu-reviews-header-score');
  const text = createDiv('bu-reviews-header-text');
  if (house.rating) {
    const score = getScore(house.rating);
    scoreBlock.appendChild(scoreBadge(score.formatted, score.color, true));
    text.appendChild(
      createDiv('bu-reviews-header-label', t(getScoreLabelKey(house.rating)))
    );
  }
  text.appendChild(
    createDiv(
      'bu_reviews__overview__number',
      `${house.scoreAmount} ${t('reviews')}${house.name ? ` · ${house.name}` : ''}`
    )
  );
  scoreBlock.appendChild(text);
  header.appendChild(scoreBlock);

  const { averages, count, source } = houseCriteriaAverages(house);
  if (averages.length > 0) {
    const list = createDiv('bu-criteria-averages');
    averages.forEach((average) => {
      const row = createDiv('bu-criteria-average');
      row.appendChild(createSpan('bu-criteria-average-name', average.name));
      const bar = createDiv('bu-criteria-bar');
      const fill = document.createElement('span');
      fill.className = getScoreColor(average.score);
      fill.style.width = `${Math.min(100, average.score * 10)}%`;
      bar.appendChild(fill);
      row.appendChild(bar);
      row.appendChild(
        createSpan(
          'bu-criteria-average-value',
          getScore(average.score).formatted
        )
      );
      list.appendChild(row);
    });
    list.appendChild(
      createDiv(
        'bu-criteria-averages-hint',
        t(source === 'api' ? 'based_on_reviews' : 'based_on_last_reviews', {
          count
        })
      )
    );
    header.appendChild(list);
  }

  return header;
}

export function createReviewsPageView(house: ReviewsHouse): HTMLDivElement {
  const root = createDiv('bu_reviews bu-reviews');
  root.appendChild(createHeader(house));

  house.reviews.forEach((review) => {
    const processed = processReview(review);
    const hasText = processed.review.trim() !== '';
    const reviewCard = createDiv(
      `bu_single_review bu-review-card${hasText ? '' : ' bu-review-card-slim'}`
    );

    // header row: badge, name and date on the left, source on the right
    const summary = createDiv('bu_review_summary bu-review-head');
    const reviewScore = createDiv('bu_score');
    if (review.score) {
      reviewScore.appendChild(scoreBadge(processed.formatted, processed.color));
    }
    const who = createDiv('bu_review_summary__date_name bu-review-who');
    who.appendChild(createDiv('bu_review_summary__name', processed.name));
    who.appendChild(
      createDiv(
        'bu_review_summary__date',
        hasText
          ? formatReviewDate(processed.createdAt)
          : `${formatReviewDate(processed.createdAt)} · ${t('score_only')}`
      )
    );
    reviewScore.appendChild(who);
    summary.appendChild(reviewScore);

    if (processed.sourceName) {
      summary.appendChild(
        createDiv(
          'bu_review_summary__source',
          t('via_source', { source: processed.sourceName })
        )
      );
    }
    reviewCard.appendChild(summary);

    if (hasText) {
      const text = document.createElement('p');
      text.className = 'bu_review bu-review-text';
      text.textContent = processed.review;
      reviewCard.appendChild(text);
    }

    if (processed.criteria.length > 0) {
      const criteria = createDiv('bu_criteria bu-criteria-pills');
      processed.criteria.forEach((criterion) => {
        const pill = createSpan('bu-criterion', '');
        if (criterion.score) {
          pill.appendChild(
            createSpan(`bu-criterion-dot ${criterion.color}`, '')
          );
        }
        pill.appendChild(createSpan('bu-criterion-name', criterion.name));
        if (criterion.score) {
          pill.appendChild(
            createSpan('bu-criterion-score', criterion.formatted)
          );
        }
        criteria.appendChild(pill);
      });
      reviewCard.appendChild(criteria);
    }

    if (processed.reviewResponses?.length > 0) {
      const responses = createDiv('bu_review_responses');
      processed.reviewResponses.forEach((resp) => {
        const responseDiv = createDiv('bu_review_response');
        const header = createDiv('bu_review_response__header');
        header.appendChild(
          createSpan('bu-review-response-avatar', resp.sender.charAt(0))
        );
        header.appendChild(
          createDiv('bu_review_response__sender', resp.sender)
        );
        header.appendChild(
          createDiv('bu_review_response__label', t('review_response_label'))
        );
        header.appendChild(
          createDiv(
            'bu_review_response__date',
            formatReviewDate(resp.created_at)
          )
        );
        const message = document.createElement('p');
        message.className = 'bu_review_response__message';
        message.textContent = resp.message;
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
