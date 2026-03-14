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
import { ColorsType } from '../types';

interface Props {
  pageType?: string;
  filters?: FiltersType;
  locale: string;
}

function App({ pageType, locale, filters = {} }: Props): JSX.Element {
  const { portalCode, objectCode } = useContext(AppContext);

  const isSearchPage = !objectCode;

  const {
    loading: baseLoading,
    error: baseError,
    data: baseData
  } = useQuery(PORTAL_BASE_QUERY, {
    variables: { id: portalCode },
    skip: isSearchPage
  });

  const {
    loading: searchLoading,
    error: searchError,
    data: searchData
  } = useQuery(PORTAL_SEARCH_QUERY, {
    variables: { id: portalCode },
    skip: !isSearchPage
  });

  const loading = isSearchPage ? searchLoading : baseLoading;
  const error = isSearchPage ? searchError : baseError;

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
  const colors: ColorsType = PortalSite.colorsConfiguration;

  const root = document.documentElement;

  root.style.setProperty('--bukazu-discount', colors.discount);
  root.style.setProperty('--bukazu-cell', colors.cell);
  root.style.setProperty('--bukazu-arrival', colors.arrival);
  root.style.setProperty('--bukazu-booked', colors.booked);
  root.style.setProperty('--bukazu-departure', colors.departure);
  root.style.setProperty('--bukazu-button', colors.button);
  root.style.setProperty('--bukazu-button_cta', colors.buttonCta);

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
