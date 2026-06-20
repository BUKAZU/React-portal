import React from 'react';
import { t, formatNumber } from '../../intl';
import { FiltersFormType, HouseType } from '../../types';
import ArrowRight from '../icons/ArrowRight.svg';

interface Props {
  result: HouseType;
  options: FiltersFormType;
}

function SingleResult({ result, options }: Props): JSX.Element {
  let thisOptions = options || {};

  return (
    <a className="bukazu-result bu_card" href={result.house_url}>
      <div className="bukazu-result-inner">
        <div className="image-holder">
          <img src={result.image_url} alt={result.name} />
        </div>
        <div className="result">
          <div className="result-title">{result.name}</div>
          <div className="result-place">
            {thisOptions.show_city && <span>{result.city}, </span>}
            {thisOptions.show_region && <span>{result.province}, </span>}
            {thisOptions.show_country && <span>{result.country_name}</span>}
          </div>
          <div
            className="result-description"
            dangerouslySetInnerHTML={{ __html: result.description }}
          />
          <div className="result-details">
            {thisOptions.show_persons && (
              <div>
                {result.persons} {t('persons')}
              </div>
            )}
            {thisOptions.show_bedrooms && (
              <div>
                {result.bedrooms} {t('bedrooms')}
              </div>
            )}
            {thisOptions.show_bathrooms && (
              <div>
                {result.bathrooms} {t('bathrooms')}
              </div>
            )}
          </div>
          {thisOptions.show_rating && result.rating && (
            <div className="result-rating bu_card">
              <div className="result-rating-inner">
                {result.rating.toFixed(1)}
              </div>
            </div>
          )}
          {thisOptions.show_price && (
            <div className="result-price">
              {result.booking_price ? (
                <>
                  {t('price_from')}
                  <span className="price">
                    €{' '}
                    {formatNumber(result.booking_price.total_price, {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0
                    })}
                  </span>
                </>
              ) : (
                <>
                  {t('minimum_week_price')}
                  <span className="price">
                    €{' '}
                    {formatNumber(result.minimum_week_price, {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0
                    })}
                  </span>
                </>
              )}
            </div>
          )}
          <div className="result-button">
            {t('view_details')}
          </div>
        </div>
      </div>
    </a>
  );
}

export default SingleResult;
