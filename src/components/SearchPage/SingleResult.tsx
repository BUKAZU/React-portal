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
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="h-56 w-full">
        <a>
          <img
            className="mx-auto h-full"
            src={result.image_url}
            alt={result.name}
          />
        </a>
      </div>
      <div className="pt-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          {thisOptions.showPersons && (
            <div className="text-gray-500">
              {result.persons} <FormattedMessage id="persons" />
            </div>
          )}
          {thisOptions.showBedrooms && (
            <div className="text-gray-500">
              {result.bedrooms} <FormattedMessage id="bedrooms" />
            </div>
          )}
          {thisOptions.showBathrooms && (
            <div className="text-gray-500">
              {result.bathrooms} <FormattedMessage id="bathrooms" />
            </div>
          )}
        </div>
        <a
          className="text-lg font-semibold leading-tight text-gray-900 hover:underline gap-1"
          href={result.house_url}
        >
          {result.name}
          {thisOptions.showCity && (
            <span className="ml-1 text-gray-700">| {result.city}</span>
          )}
          {thisOptions.showRegion && (
            <span className="ml-1 text-gray-700">| {result.province}</span>
          )}
          {thisOptions.showCountry && (
            <span className="ml-1 text-gray-700">| {result.country_name}</span>
          )}
        </a>
      </div>
      {thisOptions.showRating && result.rating && (
        <div className="mt-2 flex items-center gap-2">
          <div className="result-rating-inner">{result.rating.toFixed(1)}</div>
        </div>
      )}
      <div
        className="result-description"
        dangerouslySetInnerHTML={{ __html: result.description }}
      />
      <div className="mt-4 flex items-center justify-between gap-4">
        {thisOptions.showPrice && (
          <div className="text-2xl font-extrabold leading-tight text-gray-900">
            {result.booking_price ? (
              <>
                <FormattedMessage id="price_from" />
                <span className="p-2">
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
                <span className="ml-2">
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
        <div className="result-inline-flex items-center rounded-lg bg-primary-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-300">
          <FormattedMessage id="view_details" />
        </div>
      </div>
      <div className="bukazu-result-inner">
        <div className="image-holder"></div>
        <div className="result">
          <div className="result-title">{result.name}</div>
          <div className="result-place">
            {thisOptions.showCity && <span>{result.city}, </span>}
            {thisOptions.showRegion && <span>{result.province}, </span>}
            {thisOptions.showCountry && <span>{result.country_name}</span>}
          </div>

          <div className="result-details"></div>

          <div className="result-button">
            <FormattedMessage id="view_details" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default SingleResult;
