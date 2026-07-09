import { t, formatNumber } from '../../intl';
import { escapeHtml } from '../../_lib/utils';
import { FiltersFormType, HouseType } from '../../types';

interface Props {
  result: HouseType;
  options: FiltersFormType;
}

function SingleResult({ result, options }: Props): string {
  const place = [
    options.show_city && `<span>${escapeHtml(result.city)}, </span>`,
    options.show_region && `<span>${escapeHtml(result.province)}, </span>`,
    options.show_country && `<span>${escapeHtml(result.country_name)}</span>`
  ]
    .filter(Boolean)
    .join('');

  const details = [
    options.show_persons &&
      `<div>${escapeHtml(result.persons)} ${escapeHtml(t('persons'))}</div>`,
    options.show_bedrooms &&
      `<div>${escapeHtml(result.bedrooms)} ${escapeHtml(t('bedrooms'))}</div>`,
    options.show_bathrooms &&
      `<div>${escapeHtml(result.bathrooms)} ${escapeHtml(t('bathrooms'))}</div>`
  ]
    .filter(Boolean)
    .join('');

  const rating =
    options.show_rating && result.rating
      ? `<div class="result-rating bu_card"><div class="result-rating-inner">${escapeHtml(
          result.rating.toFixed(1)
        )}</div></div>`
      : '';

  const price = options.show_price
    ? result.booking_price
      ? `<div class="result-price">${escapeHtml(
          t('price_from')
        )}<span class="price">€ ${escapeHtml(
          formatNumber(result.booking_price.total_price, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
          })
        )}</span></div>`
      : `<div class="result-price">${escapeHtml(
          t('minimum_week_price')
        )}<span class="price">€ ${escapeHtml(
          formatNumber(result.minimum_week_price, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
          })
        )}</span></div>`
    : '';

  return `
    <a class="bukazu-result bu_card"${
      result.house_url ? ` href="${escapeHtml(result.house_url)}"` : ''
    }>
      <div class="bukazu-result-inner">
        <div class="image-holder">
          <img${
            result.image_url ? ` src="${escapeHtml(result.image_url)}"` : ''
          } alt="${escapeHtml(result.name)}" />
        </div>
        <div class="result">
          <div class="result-title">${escapeHtml(result.name)}</div>
          <div class="result-place">${place}</div>
          <div class="result-description">${result.description}</div>
          <div class="result-details">${details}</div>
          ${rating}
          ${price}
          <div class="result-button">${escapeHtml(t('view_details'))}</div>
        </div>
      </div>
    </a>
  `;
}

export default SingleResult;
