import React, { useContext, useEffect, useState } from 'react';
import InsurancesAndRequired from './InsurancesAndRequired';
import { fetchPrice } from '../../../_lib/price';
import { PricesType } from './cost_types';
import RentAndDiscount from './RentAndDiscount';
import OptionalNotOnSite from './OptionalNotOnSite';
import OnSite from './OnSite';
import Totals from './Totals';
import { AppContext } from '../../AppContext';
import { useCurrency } from '../../CurrencyContext';
import { HouseType } from '../../../types';
import { PossibleValues } from '../formParts/form_types';

interface Props {
  values: PossibleValues;
  house: HouseType;
  /** Reports the latest price calculation (null while loading or failed). */
  onPrices?: (prices: PricesType | null) => void;
}

function CostSummary({ values, house, onPrices }: Props): JSX.Element {
  let babies = Number(values.babies) - Number(house.babies_extra);
  if (babies < 0) {
    babies = 0;
  }
  const persons = Number(values.children) + Number(values.adults) + babies;
  const { portalCode, objectCode, locale, apiUrl } = useContext(AppContext);
  const { currency } = useCurrency();

  const [prices, setPrices] = useState<PricesType | null>(null);
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
      startsAt: values.arrivalDate.date,
      endsAt: values.departureDate.date,
      persons,
      currency,
      costs: values.costs,
      discount: Number(values.discount),
      discountCode: values.discount_code,
      cancelInsurance: Number(values.cancel_insurance)
    })
      .then((result) => {
        if (!cancelled) {
          setPrices(result);
          setLoading(false);
          onPrices?.(result);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err);
          setLoading(false);
          onPrices?.(null);
        }
      });

    return () => {
      cancelled = true;
    };
    // onPrices is a callback prop; re-running on its identity would refetch
    // every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    apiUrl,
    locale,
    portalCode,
    objectCode,
    values.arrivalDate.date,
    values.departureDate.date,
    persons,
    currency,
    values.costs,
    values.discount,
    values.discount_code,
    values.cancel_insurance
  ]);

  if (loading) {
    return <span>Loading...</span>;
  }
  if (error || !prices) {
    return <div>{String(error)}</div>;
  }

  return (
    <>
      <RentAndDiscount prices={prices} />
      <InsurancesAndRequired prices={prices} />
      <OptionalNotOnSite prices={prices} />
      <OnSite prices={prices} />
      <Totals prices={prices} />
    </>
  );
}

export default CostSummary;
