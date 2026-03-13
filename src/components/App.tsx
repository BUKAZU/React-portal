import React, { useContext } from 'react';
import Loading from './icons/loading.svg';

import { PORTAL_BASE_QUERY, PORTAL_SEARCH_QUERY } from '../_lib/gql';

import SearchPage from './SearchPage/SearchPage';
import CalendarPage from './CalendarPage/CalendarPage';
import ReviewsPage from './ReviewsPage/ReviewsPage';
import SafeBooking from './SafeBooking';
import { ApiError } from './Error';
import ErrorBoundary from './ErrorBoundary';
import { useQuery } from '@apollo/client';
import { AppContext } from './AppContext';
import { FiltersType } from './SearchPage/filters/filter_types';

interface Props {
  pageType?: string;
  filters?: FiltersType;
  locale: string;
}

function App({ pageType, locale, filters = {} }: Props): JSX.Element {
  const { portalCode, objectCode } = useContext(AppContext);

  const isSearchPage = !objectCode;

  const { loading: baseLoading, error: baseError, data: baseData } = useQuery(
    PORTAL_BASE_QUERY,
    { variables: { id: portalCode } }
  );

  const {
    loading: searchLoading,
    error: searchError,
    data: searchData
  } = useQuery(PORTAL_SEARCH_QUERY, {
    variables: { id: portalCode },
    skip: !isSearchPage
  });

  const loading = baseLoading || (isSearchPage && searchLoading);
  const error = baseError || (isSearchPage ? searchError : undefined);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <ApiError errors={{ ...error }} />;
  }

  const PortalSite = isSearchPage
    ? (searchData?.PortalSite ?? null)
    : (baseData?.PortalSite ?? null);

  if (!PortalSite) {
    return <Loading />;
  }

  let options = PortalSite.options;

  let root = document.documentElement;

  root.style.setProperty(
    '--bukazu-discount',
    `${options.colors ? options.colors.discount : 'orange'}`
  );
  root.style.setProperty(
    '--bukazu-cell',
    `${options.colors ? options.colors.cell : '#fff'}`
  );
  root.style.setProperty(
    '--bukazu-arrival',
    `${options.colors ? options.colors.arrival : '#6eeb83'}`
  );
  root.style.setProperty(
    '--bukazu-booked',
    `${options.colors ? options.colors.booked : '#ea2b1f'}`
  );
  root.style.setProperty(
    '--bukazu-departure',
    `${options.colors ? options.colors.departure : 'yellow'}`
  );

  root.style.setProperty(
    '--bukazu-button',
    `${options.colors ? options.colors.button : 'rgba(23, 190, 187, 0.75)'}`
  );
  root.style.setProperty(
    '--bukazu-button_cta',
    `${options.colors ? options.colors.buttonCta : '#e28413'}`
  );
  root.style.setProperty(
    '--bukazu-background_month',
    `${options.colors ? options.colors.month_background : '#e28413'}`
  );

  let page;

  if (objectCode && objectCode !== null && pageType !== 'reviews') {
    page = (
      <ErrorBoundary>
        <CalendarPage />
        <SafeBooking />
      </ErrorBoundary>
    );
  } else if (objectCode && objectCode !== null && pageType === 'reviews') {
    page = <ReviewsPage />;
  } else {
    page = (
      <SearchPage
        PortalSite={PortalSite}
        locale={locale}
        options={options}
        filters={filters}
      />
    );
  }

  return <>{page}</>;
}

export default App;
