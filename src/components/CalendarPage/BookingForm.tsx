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

  useEffect(() => {
    let cancelled = false;
    setHouse(null);
    setPriceError(null);

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

  const arrival = arrivalDate?.date;
  const departure = departureDate?.date;
  const trackedFor = useRef<string | null>(null);

  // A new price reloads the house, so remember which stay was tracked to count
  // each house and date pair once.
  useEffect(() => {
    if (!house || !arrival || !departure) return;

    const stay = `${objectCode}:${arrival}:${departure}`;
    if (trackedFor.current === stay) return;
    trackedFor.current = stay;

    TrackEvent({
      house_code: objectCode,
      portal_code: portalCode,
      locale: locale,
      interaction_type: 'booking_started',
      interaction_info: { arrival_date: arrival, departure_date: departure }
    });
  }, [house, objectCode, portalCode, locale, arrival, departure]);

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
