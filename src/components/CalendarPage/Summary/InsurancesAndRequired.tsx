import React from 'react';
import CostRow from './CostRow';
import { CostType } from './cost_types';

interface Props {
  prices: {
    total_costs: {
      insurances: {
        cancel_insurance: number;
        insurance_costs: number;
      };
      required_costs: {
        not_on_site: CostType[];
      };
    };
    required_house_costs: CostType[];
  };
}

export default function InsurancesAndRequired({
  prices
}: Props): JSX.Element {
  const { insurances, required_costs } = prices.total_costs;
  const { not_on_site } = required_costs;

  return (
    <div className="costs-section">
      <table>
        <tbody>
          {insurances && (
            <>
              {Object.keys(insurances).map((key: string) => {
                const val = (insurances as Record<string, number>)[key];
                if (val > 0) {
                  return (
                    <CostRow
                      name={key}
                      key={key}
                      formatName={true}
                      amount={val}
                    />
                  );
                }
              })}
            </>
          )}
          {prices.required_house_costs.map((cost) => {
            if (!cost.on_site && cost.gl !== '0120') {
              if (cost.method === 'none') {
                return <CostRow key={cost.id} {...cost} />;
              } else {
                if (cost.amount === 0) {
                  return null;
                }
                return (
                  <CostRow
                    key={cost.id}
                    {...cost}
                    amount={not_on_site?.find((x) => x.id == cost.id)?.amount ?? 0}
                  />
                );
              }
            }
          })}
        </tbody>
      </table>
    </div>
  );
}
