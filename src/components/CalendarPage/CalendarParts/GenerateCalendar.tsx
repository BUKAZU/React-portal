import React, { useContext, useEffect, useState } from 'react';
import { t } from '../../../intl';
import type { HouseType } from '../../../types';
import {
  AccommodationDetailError,
  fetchAccommodationDetail
} from '../../../_lib/accommodation';
import { AppContext } from '../../AppContext';
import { ApiError } from '../../Error';
import Loading from '../../icons/loading.svg';
import Calendar from '../Calendar';
import { TrackEvent } from '../../../_lib/Tracking';
import type { AppPortalSite } from '../../loadPortalSite';

interface Props {
  portalSite: AppPortalSite;
}

/**
 * The outcomes of the accommodation request. `not-found` is a 404, which
 * replaces the empty houses array the GraphQL query returned for an
 * accommodation that is not published on this portal site.
 */
type CalendarState =
  | { status: 'loading' }
  | { status: 'not-found' }
  | { status: 'error'; error: Error }
  | { status: 'ready'; house: HouseType };

function GenerateCalendar({ portalSite }: Props): JSX.Element {
  const { portalCode, objectCode, locale, apiUrl } = useContext(AppContext);
  const [state, setState] = useState<CalendarState>({ status: 'loading' });

  // Sent once per calendar view, not on every render.
  useEffect(() => {
    TrackEvent({
      house_code: objectCode,
      portal_code: portalCode,
      interaction_type: 'calendar_view',
      locale: locale
    });
  }, [objectCode, portalCode, locale]);

  useEffect(() => {
    let cancelled = false;
    setState({ status: 'loading' });

    fetchAccommodationDetail({ apiUrl, locale, portalCode, objectCode })
      .then((house) => {
        if (!cancelled) {
          setState({ status: 'ready', house });
        }
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        // A 404 means the accommodation is not on this portal site.
        if (error instanceof AccommodationDetailError && error.notFound) {
          setState({ status: 'not-found' });
          return;
        }
        setState({
          status: 'error',
          error:
            error instanceof Error
              ? error
              : new Error('The accommodation request failed')
        });
      });

    return () => {
      cancelled = true;
    };
  }, [apiUrl, locale, portalCode, objectCode]);

  if (state.status === 'loading')
    return (
      <div>
        <Loading />
      </div>
    );
  if (state.status === 'error') {
    return (
      <div>
        <ApiError errors={state.error} />
      </div>
    );
  }

  const numberOfMonths = portalSite.bookingFormConfiguration.show_months_amount;
  const numberOfMonthsInARow =
    portalSite.bookingFormConfiguration.show_months_in_a_row_amount;

  return (
    <div id="calendar-container">
      {state.status === 'not-found' ? (
        <div>{t('no_house_found')}</div>
      ) : (
        <div>
          <div className="bup-16">{state.house.name}</div>
          <Calendar
            numberOfMonths={numberOfMonths}
            numberOfMonthsInARow={numberOfMonthsInARow}
            house={state.house}
          />
        </div>
      )}
    </div>
  );
}

export default GenerateCalendar;
