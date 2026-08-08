import React from 'react';
import CostRow from './CostRow';
import CostSection from './CostSection';
import { t, formatNumber } from '../../../intl';
import { CostType, PricesType } from './cost_types';

interface Props {
  prices: PricesType;
}

function Totals({ prices }: Props): JSX.Element {
  const { currency } = prices;
  return (
    <>
      <CostSection>
        <tr>
          <th
            style={{
              textAlign: 'left',
              textTransform: 'capitalize'
            }}
          >
            {t('total')}
          </th>
          <th className="price" style={{ fontSize: 18 }}>
            {formatNumber(prices.total_costs.sub_total, {
              style: 'currency',
              currency
            })}
          </th>
        </tr>
      </CostSection>
      <CostSection>
        <Deposit
          cost_array={prices.required_house_costs}
          price_array={prices.total_costs.required_costs.on_site}
          currency={currency}
        />
        <Deposit
          cost_array={prices.required_house_costs}
          price_array={prices.total_costs.required_costs.not_on_site}
          currency={currency}
        />
        <Deposit
          cost_array={prices.optional_house_costs}
          price_array={prices.total_costs.optional_costs.on_site}
          currency={currency}
        />
        <Deposit
          cost_array={prices.optional_house_costs}
          price_array={prices.total_costs.optional_costs.not_on_site}
          currency={currency}
        />
      </CostSection>
      <CostSection>
        <tr>
          <th
            style={{
              textAlign: 'left',
              textTransform: 'capitalize'
            }}
          >
            {t('total')}
          </th>
          <td className="price">
            {formatNumber(prices.total_costs.total_price, {
              style: 'currency',
              currency
            })}
          </td>
        </tr>
      </CostSection>
    </>
  );
}

export default Totals;

function Deposit({
  cost_array,
  price_array,
  currency
}: {
  cost_array: CostType[];
  price_array: CostType[];
  currency: string;
}) {
  return (
    <>
      {cost_array.map((cost) => {
        let price = price_array.find((x) => x.id == cost.id);
        if (cost.gl === '0120' && price && price.amount > 0) {
          return (
            <CostRow
              key={cost.id}
              {...cost}
              amount={price.amount}
              currency={currency}
            />
          );
        }
      })}
    </>
  );
}
