import React, { useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
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
import { set } from 'date-fns';
import { el } from 'date-fns/locale';

const getWidth = () =>
  window.innerWidth ||
  document.documentElement.clientWidth ||
  document.body.clientWidth;

  export const useContainerDimensions = targetRef => {
    const [dimensions, setDimensions] = useState({});

    // holds the timer for setTimeout and clearInterval
    let movement_timer = null;

    // the number of ms the window size must stay the same size before the
    // dimension state variable is reset
    const RESET_TIMEOUT = 100;

    const test_dimensions = () => {
      // For some reason targetRef.current.getBoundingClientRect was not available
      // I found this worked for me, but unfortunately I can't find the
      // documentation to explain this experience
      if (targetRef.current) {
        if (targetRef.current.offsetWidth == undefined) {
          setTimeout(test_dimensions, 250);
        }
        else {
          setDimensions({
            width: targetRef.current.clientWidth,
            height: targetRef.current.offsetHeight
          });
        }
        
      }
    }

    // This sets the dimensions on the first render
    useLayoutEffect(() => {
      test_dimensions();
    }, []);

    

    // every time the window is resized, the timer is cleared and set again
    // the net effect is the component will only reset after the window size
    // is at rest for the duration set in RESET_TIMEOUT.  This prevents rapid
    // redrawing of the component for more complex components such as charts
    window.addEventListener('resize', ()=>{
      clearInterval(movement_timer);
      movement_timer = setTimeout(test_dimensions, RESET_TIMEOUT);
    });

  };

interface Props {
  pageType?: string;
  filters?: FiltersType;
  locale: string;
}

function App({ pageType, locale, filters }: Props): JSX.Element {
  const { portalCode, objectCode } = useContext(AppContext);
  const [width, setWidth] = useState(0);

  const ref = useRef(null)
  useLayoutEffect(() => {
    setWidth(ref.current.getBoundingClientRect().width);
  }, []);
  console.log(width)

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

  return <div className={width < 875 ? 'bu-smaller' : 'bu-large'} ref={ref}>{page}</div>;
}

App.defaultProps = {
  filters: {}
};

export default App;
