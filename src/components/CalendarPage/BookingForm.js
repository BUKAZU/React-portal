import React from 'react';
import PropTypes from 'prop-types';
import { Query } from '@apollo/client/react/components';
import Loading from '../icons/loading.svg';
import FormCreator from './FormCreator';
import { BOOKING_PRICE_QUERY } from '../../_lib/queries';
import { useQuery } from '@apollo/client';

function BookingForm({ booking, locale, onReturn }) {
  const { data, loading, error } = useQuery(BOOKING_PRICE_QUERY, {
    variables: {
      id: booking.portalCode,
      house_id: booking.objectCode,
      starts_at: booking.arrivalDate.date,
      ends_at: booking.departureDate.date
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
  const options = data.PortalSite.options;

  return (
    <FormCreator
      house={result}
      options={options}
      booking={booking}
      PortalSite={data.PortalSite}
      locale={locale}
      onReturn={() => {
        onReturn(booking);
      }}
    />
  );
}

BookingForm.propTypes = {
  booking: PropTypes.object.isRequired,
  locale: PropTypes.string.isRequired,
  onReturn: PropTypes.func.isRequired
};

export default BookingForm;
