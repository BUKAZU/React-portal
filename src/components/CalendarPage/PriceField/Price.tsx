import { useQuery } from '@apollo/client'
import React from 'react'
import { FormattedMessage, FormattedNumber } from 'react-intl';
import { ApiError } from '../../Error';
import Loading from '../../icons/loading.svg';
import { BOOKING_PRICE_QUERY } from './Queries'

interface Props {
  persons: number;
  variables: {
    id: string;
    house_id: string;
    starts_at: string;
    ends_at: string;
  };
}

function Price({ persons, variables }: Props) {
    const { loading, error, data } = useQuery(BOOKING_PRICE_QUERY, { variables: { ...variables, persons }})

    if (loading)
      return (
        <div className="price-overview--build">
          <Loading />
        </div>
      );
    if (error) {
      return (
        <div className="price-overview--build">
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
            <FormattedNumber
              value={Math.round(result.total_price)}
              minimumFractionDigits={2}
              maximumFractionDigits={2}
            />
          </div>
          <div>
            <i>
              <FormattedMessage id="based_on_one_person" values={{ persons }} />
            </i>
          </div>
        </div>
      </>
    );
}

export default Price