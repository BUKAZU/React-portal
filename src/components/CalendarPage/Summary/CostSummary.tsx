import React, { useContext, useEffect, useState } from 'react';
import InsurancesAndRequired from './InsurancesAndRequired';
import { fetchPrice } from '../../../_lib/price';
import { PricesType } from './cost_types';
import RentAndDiscount from './RentAndDiscount';
import OptionalNotOnSite from './OptionalNotOnSite';
import OnSite from './OnSite';
import Totals from './Totals';
import { AppContext } from '../../AppContext';
import { HouseType } from '../../../types';
import { PossibleValues } from '../formParts/form_types';

interface Props {
  values: PossibleValues;
  house: HouseType;
}

function CostSummary({ values, house }: Props): JSX.Element {
  let babies = Number(values.babies) - Number(house.babies_extra);
  if (babies < 0) {
    babies = 0;
  }
  const persons = Number(values.children) + Number(values.adults) + babies;
  const { portalCode, objectCode, locale, apiUrl } = useContext(AppContext);

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
      costs: values.costs,
      discount: Number(values.discount),
      discountCode: values.discount_code,
      cancelInsurance: Number(values.cancel_insurance)
    })
      .then((result) => {
        if (!cancelled) {
          setPrices(result);
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
    values.arrivalDate.date,
    values.departureDate.date,
    persons,
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
