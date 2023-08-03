import React, { useContext, useEffect, useState } from 'react';
import Loading from './icons/loading.svg';

import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';

import { PORTAL_QUERY } from '../_lib/queries';

import SearchPage from './SearchPage/SearchPage';
import CalendarPage from './CalendarPage/CalendarPage';
import ReviewsPage from './ReviewsPage/ReviewsPage';
import SafeBooking from './SafeBooking';
import { ApiError } from './Error';
import ErrorBoundary from './ErrorBoundary';
import { useQuery } from '@apollo/client';
import { AppContext } from './AppContext';
import { FiltersType } from './SearchPage/filters/filter_types';

const getWidth = () =>
  window.innerWidth ||
  document.documentElement.clientWidth ||
  document.body.clientWidth;

interface Props {
  pageType?: string;
  filters?: FiltersType;
  locale: string;
}

function App({ pageType, locale, filters }: Props): JSX.Element {
  const { portalCode, objectCode } = useContext(AppContext);

  let [width, setWidth] = useState(getWidth());

  // in this case useEffect will execute only once because
  // it does not have any dependencies.
  useEffect(() => {
    const resizeListener = () => {
      // change width from the state object
      setWidth(getWidth());
    };
    // set resize listener
    window.addEventListener('resize', resizeListener);

    // clean up function
    return () => {
      // remove resize listener
      window.removeEventListener('resize', resizeListener);
    };
  }, []);

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
        <CalendarPage PortalSite={PortalSite} />
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

  return <div className={width < 875 ? 'bu-smaller' : ''}>{page}</div>;
}

App.defaultProps = {
  filters: {}
};

export default App;
