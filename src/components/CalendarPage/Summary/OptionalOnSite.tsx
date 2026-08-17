import React from 'react';
import CostRow from './CostRow';
import { PricesType } from './cost_types';

interface Props {
  prices: PricesType;
}

export default function OptionalOnSite({ prices }: Props): JSX.Element {
  const { optional_costs } = prices.total_costs;
  const { on_site } = optional_costs;
  return (
    <>
      {prices.optional_house_costs.map((cost) => {
        if (cost.on_site && cost.gl !== '0120') {
          if (cost.method === 'none') {
            return (
              <CostRow key={cost.id} {...cost} currency={prices.currency} />
            );
          } else if (cost.method === 'on_site') {
            if ((on_site?.find((x) => x.id == cost.id)?.nr_of_items ?? 0) > 0) {
              return (
                <CostRow
                  key={cost.id}
                  {...cost}
                  amount={cost.amount}
                  forceMethod={true}
                  currency={prices.currency}
                />
              );
            }
          } else {
            let amount = on_site?.find((x) => x.id == cost.id)?.amount ?? 0;
            if (amount > 0) {
              return (
                <CostRow
                  key={cost.id}
                  {...cost}
                  amount={amount}
                  currency={prices.currency}
                />
              );
            }
          }
        }
      })}
    </>
  );
}
