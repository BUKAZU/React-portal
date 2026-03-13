import { useQuery } from '@apollo/client';
import React, { useContext } from 'react';
import { t, formatNumber } from '../../../intl';
import { AppContext } from '../../AppContext';
import { ApiError } from '../../Error';
import Loading from '../../icons/loading.svg';
import { PRICE_FIELD_BOOKING_PRICE_QUERY as BOOKING_PRICE_QUERY } from '../../../_lib/gql';

interface Props {
  persons: number;
  variables: {
    starts_at: string;
    ends_at: string;
  };
}

function Price({ persons, variables }: Props) {
  const { portalCode, objectCode } = useContext(AppContext);
  const { loading, error, data } = useQuery(BOOKING_PRICE_QUERY, {
    variables: { ...variables, persons, portalCode, objectCode }
  });

  if (loading)
    return (
      <div className="price-overview--build bup-16">
        <Loading />
      </div>
    );
  if (error) {
    return (
      <div className="price-overview--build bup-16">
        <ApiError errors={error}></ApiError>
      </div>
    );
  }
  const result = data.PortalSite.houses[0].booking_price;
  return (
    <>
      <div className="price-overview--book">
        <div className="price">
          €{' '}
          {formatNumber(Math.round(result.total_price), {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
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
