import React from 'react';
import { t, formatNumber } from '../../../intl';
import Modal from '../../Modal';
import Icon from '../../icons/info.svg';
import { useBookingField } from '../BookingFormContext';
import { createPersonsArray } from './BookingHelpers';

type CostType = {
  id: string;
  name: string;
  method: string;
  max_available: number;
  amount: number;
  method_name: string;
  description?: string;
};

function CostSelect({ cost }: { cost: CostType }) {
  const field = useBookingField(`costs[${cost.id}]`);

  if (cost.max_available === 1) {
    return (
      <select
        id={cost.id}
        name={`costs[${cost.id}]`}
        value={String(field.value)}
        onChange={field.onChange}
        onBlur={field.onBlur}
      >
        <option value={0}>{t('no')}</option>
        <option value={1}>{t('yes')}</option>
      </select>
    );
  }

  return (
    <select
      id={cost.id}
      name={`costs[${cost.id}]`}
      value={String(field.value)}
      onChange={field.onChange}
      onBlur={field.onBlur}
    >
      {createPersonsArray(cost.max_available).map((option) => {
        return (
          <option key={option} value={option}>
            {option}
          </option>
        );
      })}
    </select>
  );
}

function OptionalCosts({ costs }: { costs: CostType[] }) {
  if (costs.length === 0) {
    return null;
  }

  return (
    <div className="form-section bup-16 optional_house_costs">
      <h2>{t('extra_costs_bookable')}</h2>
      <div>
        {costs.map((cost) => {
          if (
            !['none', 'total'].includes(cost.method) &&
            cost.max_available > 0
          ) {
            return (
              <div className="form-row inline" key={cost.id}>
                <label htmlFor={cost.id}>{cost.name}</label>
                <CostSelect cost={cost} />

                <div className="price_per">
                  €{' '}
                  {formatNumber(cost.amount, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}{' '}
                  {cost.method_name}
                </div>
                <div>
                  {cost.description ? (
                    <div>
                      <Modal buttonText={<Icon />}>
                        <p>{cost.description}</p>
                      </Modal>
                    </div>
                  ) : null}
                </div>
              </div>
            );
          }

          return '';
        })}
      </div>
    </div>
  );
}

export default OptionalCosts;
