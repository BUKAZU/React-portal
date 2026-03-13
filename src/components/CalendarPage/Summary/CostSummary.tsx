import React, { useContext } from 'react';
import { useQuery } from '@apollo/client';
import InsurancesAndRequired from './InsurancesAndRequired.tsx';
import { BOOKING_PRICE_TOTAL_QUERY } from '../../../_lib/gql';
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

function CostSummary({ values, house }: Props): React.ReactNode {
  let babies = Number(values.babies) - Number(house.babies_extra);
  if (babies < 0) {
    babies = 0;
  }
  const persons = Number(values.children) + Number(values.adults) + babies;
  const { portalCode, objectCode } = useContext(AppContext);

  const { loading, error, data } = useQuery(BOOKING_PRICE_TOTAL_QUERY, {
    variables: {
      id: portalCode,
      persons: persons,
      house_id: objectCode,
      starts_at: JSON.stringify(values.arrivalDate.date),
      ends_at: JSON.stringify(values.departureDate.date),
      costs: JSON.stringify(values.costs),
      discount: Number(values.discount),
      discount_code: values.discount_code,
      cancel_insurance: Number(values.cancel_insurance)
    },
    fetchPolicy: 'network-only'
  });

  if (loading) {
    return 'Loading...';
  }
  if (error) {
    return <div>{JSON.stringify(error)}</div>;
  }

  const prices = data.PortalSite.houses[0].booking_price;

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
