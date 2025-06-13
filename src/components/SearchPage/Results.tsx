import React from 'react';
import { FormattedMessage } from 'react-intl';
import { differenceInCalendarDays } from 'date-fns';
import Loading from '../icons/loading.svg';
import SingleResult from './SingleResult';
import Paginator from './Paginator';

import { HOUSES_PRICE_QUERY, HOUSES_QUERY } from '../../_lib/SearchQueries';
import { ApiError } from '../Error';
import { useQuery } from '@apollo/client';
import { FiltersType } from './filters/filter_types';
import { Parse_EN_US } from '../../_lib/date_helper';
import { HouseType, PortalSiteType } from '../../types';

interface Props {
  filters: FiltersType;
  PortalSite: PortalSiteType;
  limit: number;
  skip: number;
  onPageChange: Function;
  activePage: number;
}

function Results({
  filters,
  PortalSite,
  limit,
  skip,
  onPageChange,
  activePage
}: Props): JSX.Element {
  let min_nights = null;
  let requestPrices = false;
  if (filters.departure_date && filters.arrival_date) {
    min_nights = differenceInCalendarDays(
      Parse_EN_US(filters.departure_date),
      Parse_EN_US(filters.arrival_date)
    );
    requestPrices = true;
  } else if (filters.arrival_date) {
    min_nights = 1;
  }
  let filterProperties = filters.properties || [];
  filterProperties = filterProperties.map((e) => {
    return JSON.stringify(e);
  });

  let properties = filterProperties.join(',');

  let variables = {
    id: PortalSite.portal_code,
    country_id: filters.countries || null,
    region_id: filters.regions || null,
    city_id: filters.cities,
    persons_min: Number(filters.persons_min) || null,
    persons_max: Number(filters.persons_max) || null,
    bedrooms_min: Number(filters.bedrooms_min),
    bathrooms_min: Number(filters.bathrooms_min),
    arrival_date: filters.arrival_date,
    starts_at: filters.arrival_date,
    ends_at: filters.departure_date,
    no_nights: Number(min_nights) || null,
    extra_search: filters.extra_search,
    properties,
    weekprice_max: Number(filters.weekprice_max) || null,
    limit,
    skip
  };

  const { loading, error, data } = useQuery(
    requestPrices ? HOUSES_PRICE_QUERY : HOUSES_QUERY,
    { variables }
  );

  if (loading)
    return (
      <div>
        <Loading />
      </div>
    );
  if (error) {
    return (
      <div>
        <ApiError errors={error}></ApiError>
      </div>
    );
  }

  const Pagination = (
    <Paginator
      variables={variables}
      activePage={activePage}
      limit={limit}
      onPageChange={onPageChange}
    />
  );
  const Results: HouseType[] = data.PortalSite.houses;

  return (
    <div
      id="results"
      className={
        PortalSite.options.filtersForm
          ? PortalSite.options.filtersForm.mode
          : ''
      }
    >
      {Pagination}
      {Results.length === 0 ? (
        <div className="bu-noresults">
          <FormattedMessage id="no_results" />
        </div>
      ) : null}
      {Results.map((result) => (
        <SingleResult
          key={result.id}
          result={result}
          options={PortalSite.options.filtersForm}
        />
      ))}
      {Pagination}
    </div>
  );
}

export default Results;
