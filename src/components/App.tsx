import React, { useContext, useEffect, useState } from 'react';
import Loading from './icons/loading.svg';

import SearchPage from './SearchPage/SearchPage';
import CalendarPage from './CalendarPage/CalendarPage';
import ReviewsPageMount from './ReviewsPage/ReviewsPageMount';
import SafeBooking from './SafeBooking';
import { ApiError } from './Error';
import ErrorBoundary from './ErrorBoundary';
import { ApolloError } from '@apollo/client';
import { AppContext } from './AppContext';
import { FiltersType } from './SearchPage/filters/filter_types';
import { ColorsType } from '../types';
import { loadPortalSite, type AppPortalSite } from './loadPortalSite';
import { toApolloError } from '../_lib/graphql_request';

interface Props {
  pageType?: string;
  filters?: FiltersType;
  locale: string;
}

type AppState =
  | { status: 'loading' }
  | { status: 'error'; error: ApolloError }
  | { status: 'ready'; portalSite: AppPortalSite };

function App({ pageType, locale, filters = {} }: Props): JSX.Element {
  const { portalCode, objectCode } = useContext(AppContext);
  const [state, setState] = useState<AppState>({ status: 'loading' });

  const isSearchPage = !objectCode;

  useEffect(() => {
    let isMounted = true;
    setState({ status: 'loading' });

    void loadPortalSite({ portalCode, isSearchPage })
      .then((portalSite) => {
        if (!isMounted) {
          return;
        }
        setState({ status: 'ready', portalSite });
      })
      .catch((error: unknown) => {
        if (!isMounted) {
          return;
        }
        setState({ status: 'error', error: toApolloError(error) });
      });

    return () => {
      isMounted = false;
    };
  }, [portalCode, isSearchPage]);

  if (state.status === 'loading') {
    return <Loading />;
  }

  if (state.status === 'error') {
    return <ApiError errors={state.error} />;
  }

  const portalSite = state.portalSite;

  let options = portalSite.options;
  const colors: ColorsType = portalSite.colorsConfiguration;

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
    page = (
      <ReviewsPageMount
        objectCode={objectCode}
        portalCode={portalCode}
      />
    );
  } else {
    page = (
      <SearchPage
        PortalSite={portalSite}
        locale={locale}
        options={options}
        filters={filters}
      />
    );
  }

  return <>{page}</>;
}

export default App;
