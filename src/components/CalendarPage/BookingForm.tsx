import React, { useContext, useEffect, useState } from 'react';
import Loading from '../icons/loading.svg';
import FormCreator from './FormCreator';
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

  const [house, setHouse] = useState<HouseType | null>(null);
  const [priceError, setPriceError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetchPrice({
      apiUrl,
      locale,
      portalCode,
      objectCode,
      startsAt: arrivalDate!.date,
      endsAt: departureDate!.date,
      includeAccommodation: true
    })
      .then((price) => {
        if (!cancelled) {
          // The REST response's cost shape is a superset of OptionalHouseCostType.
          setHouse({
            ...price.accommodation,
            booking_price: {
              total_price: price.total_price,
              optional_house_costs: price.optional_house_costs
            }
          } as unknown as HouseType);
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

  if (!house && !priceError)
    return (
      <div>
        <Loading />
      </div>
    );
  if (priceError || !house) {
    return <div>Error</div>;
  }

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

  return <FormCreator house={house} PortalSite={portalSite} />;
}

export default BookingForm;
