import React, { useContext, useEffect, useState } from 'react';
import Loading from '../icons/loading.svg';
import FormCreator from './FormCreator';
import { fetchPrice } from '../../_lib/price';
import { AppContext } from '../AppContext';
import { useCurrency } from '../CurrencyContext';
import { CalendarContext } from './CalendarParts/CalendarContext';
import { TrackEvent } from '../../_lib/Tracking';
import type { AppPortalSite } from '../loadPortalSite';
import type { HouseType } from '../../types';

interface Props {
  portalSite: AppPortalSite;
}

function BookingForm({ portalSite }: Props): JSX.Element {
  const { portalCode, objectCode, locale, apiUrl } = useContext(AppContext);
  const { currency } = useCurrency();
  const { arrivalDate, departureDate } = useContext(CalendarContext);

  const [house, setHouse] = useState<HouseType | null>(null);
  const [priceError, setPriceError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setHouse(null);
    setPriceError(false);

    fetchPrice({
      apiUrl,
      locale,
      portalCode,
      objectCode,
      startsAt: arrivalDate!.date,
      endsAt: departureDate!.date,
      currency,
      includeAccommodation: true
    })
      .then((price) => {
        if (cancelled) return;
        if (!price.accommodation) {
          setPriceError(true);
          return;
        }
        setHouse({
          ...price.accommodation,
          booking_price: {
            total_price: price.total_price,
            currency: price.currency,
            optional_house_costs: price.optional_house_costs.map((cost) => ({
              id: String(cost.id),
              name: cost.name,
              method: cost.method,
              max_available: cost.max_available,
              amount: cost.amount,
              method_name: cost.method_name,
              description: cost.description
            }))
          }
        });
      })
      .catch(() => {
        if (!cancelled) {
          setPriceError(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [
    apiUrl,
    locale,
    portalCode,
    objectCode,
    arrivalDate,
    departureDate,
    currency
  ]);

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
