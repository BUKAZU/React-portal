import React, { useContext, useEffect, useState } from 'react';
import Loading from '../icons/loading.svg';
import FormCreator from './FormCreator';
import { HOUSE_DETAILS_QUERY } from '../../_lib/gql';
import { useQuery } from '@apollo/client';
import { fetchPrice } from '../../_lib/price';
import { AppContext } from '../AppContext';
import { CalendarContext } from './CalendarParts/CalendarContext';
import { TrackEvent } from '../../_lib/Tracking';
import type { AppPortalSite } from '../loadPortalSite';
import type { HouseType } from '../../types';

interface Props {
  portalSite: AppPortalSite;
}

function BookingForm({ portalSite }: Props): JSX.Element {
  const { portalCode, objectCode, locale, apiUrl } = useContext(AppContext);
  const { arrivalDate, departureDate } = useContext(CalendarContext);

  const { data, loading, error } = useQuery(HOUSE_DETAILS_QUERY, {
    variables: { portalCode, objectCode }
  });

  const [bookingPrice, setBookingPrice] = useState<
    HouseType['booking_price'] | null
  >(null);
  const [priceError, setPriceError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetchPrice({
      apiUrl,
      locale,
      portalCode,
      objectCode,
      startsAt: arrivalDate!.date,
      endsAt: departureDate!.date
    })
      .then((price) => {
        if (!cancelled) {
          // The REST response's cost shape is a superset of OptionalHouseCostType.
          setBookingPrice({
            total_price: price.total_price,
            optional_house_costs: price.optional_house_costs
          } as unknown as HouseType['booking_price']);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPriceError(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [apiUrl, locale, portalCode, objectCode, arrivalDate, departureDate]);

  if (loading || (!bookingPrice && !priceError))
    return (
      <div>
        <Loading />
      </div>
    );
  if (error || priceError) {
    return <div>Error</div>;
  }

  const result: HouseType = { ...data.PortalSite.houses[0], booking_price: bookingPrice! };

  TrackEvent({
    house_code: objectCode,
    portal_code: portalCode,
    locale: locale,
    interaction_type: 'booking_started',
    interaction_data: {
      arrival_date: arrivalDate!.date,
      departure_date: departureDate!.date
    }
  });

  return <FormCreator house={result} PortalSite={portalSite} />;
}

export default BookingForm;
