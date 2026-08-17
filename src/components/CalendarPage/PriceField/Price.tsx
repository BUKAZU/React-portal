import React, { useContext, useEffect, useState } from 'react';
import { t, formatNumber } from '../../../intl';
import { AppContext } from '../../AppContext';
import Loading from '../../icons/loading.svg';
import { fetchPrice, PriceResponse } from '../../../_lib/price';

interface Props {
  persons: number;
  variables: {
    starts_at: string;
    ends_at: string;
  };
}

function Price({ persons, variables }: Props) {
  const { portalCode, objectCode, locale, apiUrl } = useContext(AppContext);
  const [result, setResult] = useState<PriceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchPrice({
      apiUrl,
      locale,
      portalCode,
      objectCode,
      startsAt: variables.starts_at,
      endsAt: variables.ends_at,
      persons
    })
      .then((price) => {
        if (!cancelled) {
          setResult(price);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err);
          setLoading(false);
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
    persons
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
        {t('something_went_wrong_please_try_again')}
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
