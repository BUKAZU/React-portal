import React from 'react';
import { FormattedMessage, FormattedNumber } from 'react-intl';
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
                {result.persons} <FormattedMessage id="persons" />
              </div>
            )}
            {thisOptions.showBedrooms && (
              <div>
                {result.bedrooms} <FormattedMessage id="bedrooms" />
              </div>
            )}
            {thisOptions.showBathrooms && (
              <div>
                {result.bathrooms} <FormattedMessage id="bathrooms" />
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
                  <FormattedMessage id="price_from" />
                  <span className="price">
                    €{' '}
                    <FormattedNumber
                      value={result.booking_price.total_price}
                      minimumFractionDigits={0}
                      maximumFractionDigits={0}
                    />
                  </span>
                </>
              ) : (
                <>
                  <FormattedMessage id="minimum_week_price" />
                  <span className="price">
                    €{' '}
                    <FormattedNumber
                      value={result.minimum_week_price}
                      minimumFractionDigits={0}
                      maximumFractionDigits={0}
                    />
                  </span>
                </>
              )}
            </div>
          )}
          <div className="result-button">
            <FormattedMessage id="view_details" />
          </div>
        </div>
      </div>
    </a>
  );
}

export default SingleResult;
