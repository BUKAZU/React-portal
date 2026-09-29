import React, { useContext, useEffect, useRef, useState } from 'react';
import Loading from '../icons/loading.svg';
import FormCreator from './FormCreator';
import { fetchPrice, PriceUnavailableError } from '../../_lib/price';
import { t } from '../../intl';
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
  const [priceError, setPriceError] = useState<Error | null>(null);
  const trackedStays = useRef(new Set<string>());

  useEffect(() => {
    let cancelled = false;
    setHouse(null);
    setPriceError(null);

    // Tracked from the price response: a re-fetch for another currency, or a
    // return to earlier dates, is the same stay and counts once.
    const trackBookingStarted = () => {
      const stay = `${objectCode}:${arrivalDate!.date}:${departureDate!.date}`;
      if (trackedStays.current.has(stay)) return;
      trackedStays.current.add(stay);

      TrackEvent({
        house_code: objectCode,
        portal_code: portalCode,
        locale: locale,
        interaction_type: 'booking_started',
        interaction_info: {
          arrival_date: arrivalDate!.date,
          departure_date: departureDate!.date
        }
      });
    };

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
          setPriceError(new Error('Price response lacks the accommodation'));
          return;
        }
        trackBookingStarted();
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
      .catch((err: unknown) => {
        if (!cancelled) {
          setPriceError(err instanceof Error ? err : new Error(String(err)));
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
    return (
      <div>
        {priceError instanceof PriceUnavailableError
          ? t('no_prices_available_for_period')
          : t('something_went_wrong_please_try_again')}
      </div>
    );
  }
  return <FormCreator house={house} PortalSite={portalSite} />;
}

export default BookingForm;
