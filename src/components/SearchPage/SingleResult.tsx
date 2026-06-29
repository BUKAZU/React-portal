import React from 'react';
import { t, formatNumber } from '../../intl';
import { FiltersFormType, HouseType } from '../../types';
import Bed from '../icons/Bed.svg';
import Bath from '../icons/Bath.svg';
import Person from '../icons/Person.svg';
import MapPin from '../icons/MapPin.svg';

interface Props {
  result: HouseType;
  options: FiltersFormType;
}

function SingleResult({ result, options }: Props): JSX.Element {
  let thisOptions = options || {};

  return (
    <a className="bukazu-result" href={result.house_url}>
      <div className="bukazu-result-inner">
        <div className="image-holder">
          <img src={result.image_url} alt={result.name} loading="lazy" />
        </div>
        <div className="result">
          {thisOptions.show_rating && result.rating && (
            <div className="result-rating">
              {result.rating.toFixed(1)}
            </div>
          )}
          <div className="result-title">{result.name}</div>
          {(thisOptions.show_city || thisOptions.show_region || thisOptions.show_country) && (
            <div className="result-place">
              <MapPin />
              <span>
                {thisOptions.show_city && result.city}
                {thisOptions.show_city && (thisOptions.show_region || thisOptions.show_country) && ', '}
                {thisOptions.show_region && result.province}
                {thisOptions.show_region && thisOptions.show_country && ', '}
                {thisOptions.show_country && result.country_name}
              </span>
            </div>
          )}
          <div
            className="result-description"
            dangerouslySetInnerHTML={{ __html: result.description }}
          />
          {(thisOptions.show_persons || thisOptions.show_bedrooms || thisOptions.show_bathrooms) && (
            <div className="result-details">
              {thisOptions.show_persons && (
                <span className="result-detail-item">
                  <Person />
                  {result.persons} {t('persons')}
                </span>
              )}
              {thisOptions.show_bedrooms && (
                <span className="result-detail-item">
                  <Bed />
                  {result.bedrooms} {t('bedrooms')}
                </span>
              )}
              {thisOptions.show_bathrooms && (
                <span className="result-detail-item">
                  <Bath />
                  {result.bathrooms} {t('bathrooms')}
                </span>
              )}
            </div>
          )}
          {thisOptions.show_price && (
            <div className="result-price">
              <span className="result-price-label">
                {result.booking_price ? t('price_from') : t('minimum_week_price')}
              </span>
              <span className="price">
                €{' '}
                {formatNumber(
                  result.booking_price
                    ? result.booking_price.total_price
                    : result.minimum_week_price,
                  { minimumFractionDigits: 0, maximumFractionDigits: 0 }
                )}
              </span>
            </div>
          )}
          <div className="result-button">{t('view_details')}</div>
        </div>
      </div>
    </a>
  );
}

export default SingleResult;
