import React, { useContext } from 'react';
import Loading from './icons/loading.svg';

import { PORTAL_QUERY } from '../_lib/gql';

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

  const { loading, error, data } = useQuery(PORTAL_QUERY, {
    variables: { id: portalCode }
  });

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <ApiError errors={{ ...error }} />;
  }

  const PortalSite = data.PortalSite;
  let options = data.PortalSite.options;
  const colors: ColorsType = data.PortalSite.colorsConfiguration;

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
