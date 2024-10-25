import React from 'react';
import CostRow from './CostRow';
import OptionalOnSite from './OptionalOnSite';
import { FormattedMessage } from 'react-intl';
import { PricesType } from './cost_types';
import CostSection from './CostSection';

interface Props {
  prices: PricesType;
}

export default function OnSite({ prices }: Props): React.ReactNode {
  const { required_costs } = prices.total_costs;
  const { on_site } = required_costs;
  return (
    <div className="w-full">
      <strong>
        <FormattedMessage id="costs_on_site" />
      </strong>
      <CostSection>
        {prices.required_house_costs.map((cost) => {
          if (cost.on_site && cost.gl !== '0120') {
            if (cost.method === 'none') {
              return <CostRow key={cost.id} {...cost} />;
            } else {
              let amount = on_site.find((x) => x.id == cost.id)?.amount;
              return <CostRow key={cost.id} {...cost} amount={amount} />;
            }
          }
        })}
        <OptionalOnSite prices={prices} />
      </CostSection>
    </div>
  );
}
