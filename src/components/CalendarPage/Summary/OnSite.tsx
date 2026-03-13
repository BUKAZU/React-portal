import React from 'react';
import CostRow from './CostRow';
import OptionalOnSite from './OptionalOnSite';
import { t } from '../../../intl';
import { PricesType } from './cost_types';

interface Props {
  prices: PricesType;
}

export default function OnSite({ prices }: Props): React.ReactNode {
  const { required_costs } = prices.total_costs;
  const { on_site } = required_costs;
  return (
    <div className="costs-section">
      <strong>
        {t('costs_on_site')}
      </strong>
      <table>
        <tbody>
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
        </tbody>
      </table>
    </div>
  );
}
