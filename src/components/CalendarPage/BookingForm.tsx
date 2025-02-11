import React, { useContext } from 'react';
import Loading from '../icons/loading.svg';
import FormCreator from './FormCreator';
import { BOOKING_PRICE_QUERY } from '../../_lib/queries';
import { useQuery } from '@apollo/client';
import { AppContext } from '../AppContext';
import { CalendarContext } from './CalendarParts/CalendarContext';
import { TrackEvent } from '../../_lib/Tracking';

function BookingForm(): JSX.Element {
  const { portalCode, objectCode, locale } = useContext(AppContext);
  const { arrivalDate, departureDate } = useContext(CalendarContext);

  const { data, loading, error } = useQuery(BOOKING_PRICE_QUERY, {
    variables: {
      portalCode,
      objectCode,
      starts_at: arrivalDate.date,
      ends_at: departureDate.date
    }
  });

  if (loading)
    return (
      <div>
        <Loading />
      </div>
    );
  if (error) {
    return <div>Error</div>;
  }

  const result = data.PortalSite.houses[0];

  TrackEvent({
    house_code: objectCode,
    portal_code: portalCode,
    locale: locale,
    interaction_type: 'booking_started',
    interaction_data: {
      arrival_date: arrivalDate.date,
      departure_date: departureDate.date
    }
  });

  return <FormCreator house={result} PortalSite={data.PortalSite} />;
}

export default BookingForm;
