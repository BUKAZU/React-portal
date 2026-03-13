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
            {thisOptions.showCity && <span>{result.city}, </span>}
            {thisOptions.showRegion && <span>{result.province}, </span>}
            {thisOptions.showCountry && <span>{result.country_name}</span>}
          </div>
          <div
            className="result-description"
            dangerouslySetInnerHTML={{ __html: result.description }}
          />
          <div className="result-details">
            {thisOptions.showPersons && (
              <div>
                {result.persons} {t('persons')}
              </div>
            )}
            {thisOptions.showBedrooms && (
              <div>
                {result.bedrooms} {t('bedrooms')}
              </div>
            )}
            {thisOptions.showBathrooms && (
              <div>
                {result.bathrooms} {t('bathrooms')}
              </div>
            )}
          </div>
          {thisOptions.showRating && result.rating && (
            <div className="result-rating bu_card">
              <div className="result-rating-inner">
                {result.rating.toFixed(1)}
              </div>
            </div>
          )}
          {thisOptions.showPrice && (
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
