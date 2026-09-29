import React, { useContext, useEffect, useState } from 'react';
import { t, formatNumber } from '../../../intl';
import { AppContext } from '../../AppContext';
import { useCurrency } from '../../CurrencyContext';
import Loading from '../../icons/loading.svg';
import {
  fetchPrice,
  PriceResponse,
  PriceUnavailableError
} from '../../../_lib/price';
import { TrackEvent } from '../../../_lib/Tracking';

// Module-wide so going back to the calendar does not count the same quote again.
const trackedQuotes = new Set<string>();

interface Props {
  persons: number;
  variables: {
    starts_at: string;
    ends_at: string;
  };
}

function Price({ persons, variables }: Props) {
  const { portalCode, objectCode, locale, apiUrl } = useContext(AppContext);
  const { currency } = useCurrency();
  const [result, setResult] = useState<PriceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const stay = { arrival: variables.starts_at, departure: variables.ends_at };
    const firstTime = (kind: string) => {
      const key = `${kind}:${objectCode}:${stay.arrival}:${stay.departure}:${persons}`;
      if (trackedQuotes.has(key)) return false;
      trackedQuotes.add(key);
      return true;
    };

    fetchPrice({
      apiUrl,
      locale,
      portalCode,
      objectCode,
      startsAt: variables.starts_at,
      endsAt: variables.ends_at,
      persons,
      currency
    })
      .then((price) => {
        if (cancelled) return;
        setResult(price);
        setLoading(false);
        if (firstTime('quote')) {
          TrackEvent({
            house_code: objectCode,
            portal_code: portalCode,
            locale,
            interaction_type: 'quote_shown',
            interaction_info: {
              ...stay,
              persons,
              total_cents: Math.round(price.total_price * 100),
              currency: price.currency.toUpperCase()
            }
          });
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err);
        setLoading(false);
        if (err instanceof PriceUnavailableError && firstTime('unavailable')) {
          TrackEvent({
            house_code: objectCode,
            portal_code: portalCode,
            locale,
            interaction_type: 'price_unavailable',
            interaction_info: stay
          });
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
    variables.starts_at,
    variables.ends_at,
    persons,
    currency
  ]);

  if (loading)
    return (
      <div className="price-overview--build bup-16">
        <Loading />
      </div>
    );
  if (error || !result) {
    return (
      <div className="price-overview--build bup-16">
        {error instanceof PriceUnavailableError
          ? t('no_prices_available_for_period')
          : t('something_went_wrong_please_try_again')}
      </div>
    );
  }
  return (
    <>
      <div className="price-overview--book">
        <div className="price">
          {formatNumber(Math.round(result.total_price), {
            style: 'currency',
            currency: result.currency
          })}
        </div>
        <div>
          <i>{t('based_on_one_person', { persons })}</i>
        </div>
      </div>
    </>
  );
}

export default Price;
